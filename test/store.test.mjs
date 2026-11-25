import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openStore, STORE_SCHEMA_VERSION } from "../src/store.mjs";

test("store migration is durable and idempotent across reopen", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-store-"));
  const filename = join(directory, "mind.sqlite");
  const first = openStore(filename);
  assert.equal(first.db.prepare("SELECT max(version) AS version FROM schema_migrations").get().version, STORE_SCHEMA_VERSION);
  first.db.prepare("INSERT INTO scopes(scope_id, owner_id, kind) VALUES (?, ?, ?)").run("scope-1", "operator", "project");
  const run = first.createImportRun({ run_id: "run-1", format: "omp-jsonl", locator: "/tmp/session.jsonl", source_digest: "digest-1", byte_length: 4, raw_content: "raw\n", scope_id: "scope-1", manifest: { session: { session_id: "session-1" } }, total_lines: 1 });
  first.addImportQuarantine({ quarantine_id: "quarantine-1", run_id: run.run_id, line_number: 1, byte_start: 0, byte_end: 3, reason: "malformed_json", raw_entry_json: "raw" });

  const second = openStore(filename);
  const row = second.db.prepare("SELECT scope_id, owner_id FROM scopes").get();
  assert.equal(row.scope_id, "scope-1");
  assert.equal(row.owner_id, "operator");
  assert.equal(second.db.prepare("SELECT count(*) AS count FROM schema_migrations").get().count, STORE_SCHEMA_VERSION);
  assert.equal(second.getImportRun("run-1").raw_content, "raw\n");
  assert.deepEqual(second.getImportRun("run-1").manifest, { session: { session_id: "session-1" } });
  assert.equal(second.listImportQuarantine("run-1")[0].raw_entry_json, "raw");
  second.close();
  rmSync(directory, { recursive: true, force: true });
});
