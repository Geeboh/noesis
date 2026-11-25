import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getOmpJsonlImportStatus, preflightOmpJsonl, resumeOmpJsonlImport, startOmpJsonlImport } from "../src/importer.mjs";
import { openService } from "../src/service.mjs";

const principal = { owner_id: "operator", scope_ids: [] };

function fixture(lines) {
  return `${lines.map((line) => typeof line === "string" ? line : JSON.stringify(line)).join("\n")}\n`;
}

function tempFixture(content) {
  const directory = mkdtempSync(join(tmpdir(), "noesis-import-"));
  const source = join(directory, "session.jsonl");
  writeFileSync(source, content);
  return { directory, source };
}

test("OMP JSONL preflight retains exact digest and rejects before store writes", () => {
  const content = fixture([
    { type: "session", id: "session-1", cwd: "/workspace/project" },
    { type: "message", id: "message-1", role: "user", content: "hello" },
  ]);
  const { directory, source } = tempFixture(content);
  const database = join(directory, "mind.sqlite");
  const service = openService(database);
  try {
    const result = preflightOmpJsonl({ source_path: source });
    assert.equal(result.source_digest, createHash("sha256").update(Buffer.from(content)).digest("hex"));
    assert.equal(result.byte_length, Buffer.byteLength(content));
    assert.equal(result.message_counts.accepted, 1);
    assert.equal(service.store.db.prepare("SELECT count(*) AS count FROM import_runs").get().count, 0);
    assert.throws(() => preflightOmpJsonl({ source_path: source, max_bytes: 1 }), /source exceeds/);
    assert.equal(service.store.db.prepare("SELECT count(*) AS count FROM import_runs").get().count, 0);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("OMP JSONL imports visible text, chunks long text, quarantines invalid lines, and resumes idempotently", () => {
  const longText = `${"😀".repeat(8_000)}end`;
  const content = fixture([
    { type: "session", id: "session-2", cwd: "/workspace/project" },
    { type: "message", id: "user-1", role: "user", content: "visible user" },
    { type: "message", id: "assistant-1", role: "assistant", content: [{ type: "thinking", text: "hidden" }, { type: "text", text: "visible assistant" }] },
    { type: "message", id: "tool-1", role: "toolResult", content: [{ type: "text", text: "visible tool" }, { type: "toolCall", arguments: { secret: "hidden" } }] },
    { type: "message", id: "hidden-1", role: "assistant", content: [{ type: "thinking", text: "only hidden" }] },
    "{ malformed",
    { type: "message", role: "user", content: "missing id" },
    { type: "message", id: "unsupported-1", role: "system", content: "unsupported" },
    { type: "message", id: "long-1", role: "assistant", content: longText },
    { type: "session", id: "session-2", cwd: "/workspace/project" },
  ]);
  const { directory, source } = tempFixture(content);
  const service = openService(join(directory, "mind.sqlite"));
  try {
    const started = startOmpJsonlImport({ store: service.store, principal, source_path: source });
    const repeated = startOmpJsonlImport({ store: service.store, principal, source_path: source });
    assert.equal(repeated.run_id, started.run_id);
    let status = resumeOmpJsonlImport({ service, principal, run_id: started.run_id, max_lines: 1000 });
    assert.equal(status.state, "completed");
    assert.ok(status.quarantine.some((entry) => entry.reason === "malformed_json"));
    assert.ok(status.quarantine.some((entry) => entry.reason === "missing_id"));
    assert.ok(status.quarantine.some((entry) => entry.reason === "unsupported_role"));
    assert.ok(status.quarantine.some((entry) => entry.reason === "missing_visible_text"));
    assert.ok(status.quarantine.some((entry) => entry.reason === "duplicate_session"));
    assert.equal(Object.hasOwn(status.quarantine[0], "raw_entry_json"), false);
    assert.equal(typeof service.store.listImportQuarantine(started.run_id)[0].raw_entry_json, "string");
    const records = service.store.listRecords().filter((record) => record.provenance.origin === "document_import");
    assert.equal(records.filter((record) => record.payload.statement.includes("hidden")).length, 0);
    const longRecords = records.filter((record) => record.provenance.source_refs.some((sourceId) => service.store.getSource(sourceId)?.snapshot.entry_id === "long-1"));
    const reconstructed = longRecords
      .map((record) => ({ record, snapshot: service.store.getSource(record.provenance.source_refs[0]).snapshot }))
      .sort((left, right) => left.snapshot.character_range.start - right.snapshot.character_range.start)
      .map(({ record }) => record.payload.statement)
      .join("");
    assert.equal(longRecords.length, 2);
    assert.equal(longRecords.every((record) => record.payload.statement.length <= 16_000), true);
    assert.equal(reconstructed.length, 16_003);
    assert.equal(status.imported_records, records.length);
    assert.equal(resumeOmpJsonlImport({ service, principal, run_id: started.run_id }).state, "completed");
    assert.equal(getOmpJsonlImportStatus({ store: service.store, principal, run_id: started.run_id }).source_digest, started.source_digest);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("OMP JSONL resume marks a capture-before-cursor failure and replays safely", () => {
  const content = fixture([
    { type: "session", id: "session-3", cwd: "/workspace/project" },
    { type: "message", id: "message-1", role: "user", content: "capture once" },
  ]);
  const { directory, source } = tempFixture(content);
  const service = openService(join(directory, "mind.sqlite"));
  try {
    const started = startOmpJsonlImport({ store: service.store, principal, source_path: source });
    const original = service.store.updateImportRun.bind(service.store);
    let fail = true;
    service.store.updateImportRun = (runId, changes, options) => {
      if (fail && options?.expected_next_line === 1) {
        fail = false;
        throw new Error("simulated cursor failure");
      }
      return original(runId, changes, options);
    };
    const failed = resumeOmpJsonlImport({ service, principal, run_id: started.run_id, max_lines: 10 });
    assert.equal(failed.state, "failed");
    service.store.updateImportRun = original;
    const completed = resumeOmpJsonlImport({ service, principal, run_id: started.run_id, max_lines: 10 });
    assert.equal(completed.state, "completed");
    assert.equal(service.store.listRecords().filter((record) => record.provenance.origin === "document_import").length, 1);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("OMP JSONL scope denial hides import identity", () => {
  const { directory, source } = tempFixture(fixture([{ type: "session", id: "session-4", cwd: "/workspace/project" }, { type: "message", id: "message-1", role: "user", content: "private" }]));
  const service = openService(join(directory, "mind.sqlite"));
  try {
    const started = startOmpJsonlImport({ store: service.store, principal, source_path: source });
    assert.throws(() => getOmpJsonlImportStatus({ store: service.store, principal: { owner_id: "other", scope_ids: [] }, run_id: started.run_id }), /import run is not available/);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
