import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeEvent, makeRecord } from "../src/contracts.mjs";
import { LedgerError, openStore } from "../src/store.mjs";

function fixture() {
  const scope = { scope_id: "scope-1", owner_id: "operator", kind: "project", project_id: "project-a", session_id: "session-1", task_id: null };
  const record = makeRecord({
    record_id: "record-1",
    record_type: "observation",
    scope,
    provenance: { origin: "tool_observation", creator_id: "omp", source_refs: ["source-1"], derivation_refs: [], capture_idempotency_key: "capture-1", transformation: null },
    payload: { statement: "observed output" },
    now: "2026-11-24T00:00:00.000Z",
  });
  const event = makeEvent({ event_id: "event-1", event_type: "tool_execution_end", request_id: "request-1", actor_id: "omp", scope, object_revision: 1, payload: { status: "success" }, now: "2026-11-24T00:00:01.000Z" });
  return { scope, record, event };
}

test("capture is idempotent and preserves the source-backed record", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-ledger-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const { record, event } = fixture();
  const request = { content: "observed output", source: "source-1" };
  const source = { source_id: "source-1", scope_id: "scope-1", locator: "file:///workspace/log.txt", digest: "digest-1", captured_at: "2026-11-24T00:00:00.000Z", status: "observed", snapshot: { content: "output" } };
  const first = store.capture({ producer_id: "omp-session-1", operation: "mind_note", idempotency_key: "capture-1", request, record, event, source });
  const second = store.capture({ producer_id: "omp-session-1", operation: "mind_note", idempotency_key: "capture-1", request, record, event, source });
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.deepEqual(second.receipt, first.receipt);
  assert.equal(store.db.prepare("SELECT count(*) AS count FROM records").get().count, 1);
  assert.equal(store.db.prepare("SELECT count(*) AS count FROM events").get().count, 1);
  const saved = store.getRecord("record-1");
  assert.equal(saved.provenance.origin, "tool_observation");
  assert.equal(saved.scope.scope_id, "scope-1");
  assert.equal(saved.payload.statement, "observed output");
  assert.equal(store.getRecordRevision("record-1", 1).record_id, "record-1");
  assert.equal(store.getRecordHistory("record-1").length, 1);
  assert.equal(store.getSource("source-1").digest, "digest-1");
  store.close();
  rmSync(directory, { recursive: true, force: true });
});

test("changed request body under one idempotency key is rejected", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-ledger-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const { record, event } = fixture();
  store.capture({ producer_id: "omp-session-1", operation: "mind_note", idempotency_key: "capture-1", request: { content: "one" }, record, event });
  assert.throws(() => store.capture({ producer_id: "omp-session-1", operation: "mind_note", idempotency_key: "capture-1", request: { content: "two" }, record, event }), (error) => error instanceof LedgerError && error.code === "IDEMPOTENCY_CONFLICT");
  store.close();
  rmSync(directory, { recursive: true, force: true });
});
