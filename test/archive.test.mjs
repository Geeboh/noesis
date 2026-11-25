import test from "node:test";
import assert from "node:assert/strict";
import { createArchive, createStoreArchive, restoreArchive, restoreStoreArchive, verifyArchive } from "../src/archive.mjs";
import { getOmpJsonlImportStatus, resumeOmpJsonlImport, startOmpJsonlImport } from "../src/importer.mjs";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAtlas } from "../src/atlas.mjs";
import { openService } from "../src/service.mjs";

test("native archive verifies integrity and restores identities and lineage", () => {
  const archive = createArchive({ records: [{ record_id: "record-1" }], resources: [{ resource_id: "resource-1" }], lineage: [{ from_id: "record-1", to_id: "resource-1" }], omitted: ["raw_blob"] });
  const verified = verifyArchive(archive);
  const restored = restoreArchive(archive);
  assert.equal(verified.manifest.record_count, 1);
  assert.equal(restored.lineage[0].from_id, "record-1");
  assert.deepEqual(restored.omitted, ["raw_blob"]);
  const tampered = Buffer.from(archive);
  tampered[tampered.length - 2] ^= 1;
  assert.throws(() => verifyArchive(tampered), /integrity check failed|JSON/);
});

test("native store archive restores records, resources, scopes, and lineage into a clean store", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-archive-store-"));
  const source = join(directory, "source.sqlite");
  const destination = join(directory, "restored.sqlite");
  const service = openService(source);
  const principal = { owner_id: "operator", scope_ids: [] };
  const scope = { scope_id: "archive-scope", owner_id: "operator", kind: "project", project_id: "archive-project", session_id: null, task_id: null };
  const note = service.mindNote({ principal, scope, content: "portable record", producer_id: "archive-test", idempotency_key: "archive-note" });
  const atlas = createAtlas(service.store);
  const resource = atlas.register({ principal, resource: { resource_id: "archive-resource", kind: "project", origin_facet: "local", display_name: "Archive project", scope, aliases: [{ value: "file:///archive-project", kind: "path" }], metadata: { version: "1" } } });
  atlas.attachRecord({ principal, record_id: note.receipt.record_id, resource_id: resource.resource_id, edge_kind: "observed_in" });
  const archive = createStoreArchive(service.store, { omitted: ["external_copies"] });
  service.close();
  const restored = restoreStoreArchive(archive, destination);
  const reopened = openService(destination);
  assert.equal(reopened.store.getRecord(note.receipt.record_id).payload.statement, "portable record");
  assert.equal(reopened.store.getResource(resource.resource_id).display_name, "Archive project");
  assert.equal(reopened.store.listLineage(resource.resource_id)[0].from_id, note.receipt.record_id);
  assert.equal(restored.omitted[0], "external_copies");
  reopened.close();
  rmSync(directory, { recursive: true, force: true });
});

test("native store archive restores OMP imports, quarantine, records, and source references", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-archive-import-"));
  const sourcePath = join(directory, "session.jsonl");
  const destination = join(directory, "restored.sqlite");
  const sourceText = [
    JSON.stringify({ type: "session", id: "archive-session", cwd: "/workspace/archive" }),
    JSON.stringify({ type: "message", id: "archive-message", role: "user", content: "archived import" }),
    "{ malformed",
  ].join("\n") + "\n";
  writeFileSync(sourcePath, sourceText);
  const service = openService(join(directory, "source.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  try {
    const started = startOmpJsonlImport({ store: service.store, principal, source_path: sourcePath });
    const completed = resumeOmpJsonlImport({ service, principal, run_id: started.run_id, max_lines: 10 });
    assert.equal(completed.state, "completed");
    const imported = service.store.listRecords().find((record) => record.payload.statement === "archived import");
    const source = service.store.getSource(imported.provenance.source_refs[0]);
    const archive = createStoreArchive(service.store);
    service.close();
    const restored = restoreStoreArchive(archive, destination);
    const reopened = openService(destination);
    try {
      const status = getOmpJsonlImportStatus({ store: reopened.store, principal, run_id: started.run_id });
      assert.equal(status.state, "completed");
      assert.equal(status.quarantine[0].reason, "malformed_json");
      assert.equal(reopened.store.getImportRun(started.run_id).raw_content, sourceText);
      assert.equal(reopened.store.getRecord(imported.record_id).payload.statement, "archived import");
      assert.equal(reopened.store.getSource(source.source_id).snapshot.run_id, started.run_id);
      assert.equal(restored.coverage.import_runs, 1);
      assert.equal(restored.coverage.import_quarantine, 1);
    } finally {
      reopened.close();
    }
  } finally {
    try { service.close(); } catch {}
    rmSync(directory, { recursive: true, force: true });
  }
});
