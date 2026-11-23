import test from "node:test";
import assert from "node:assert/strict";
import { makeEvent, makeRecord } from "../src/contracts.mjs";

const scope = {
  scope_id: "scope-project",
  owner_id: "operator",
  kind: "project",
  project_id: "project-a",
  session_id: null,
  task_id: null,
};

const provenance = {
  origin: "tool_observation",
  creator_id: "omp-session",
  source_refs: ["source-1"],
  derivation_refs: [],
  capture_idempotency_key: "capture-1",
  transformation: null,
};

test("record envelope keeps independent lifecycle dimensions and provenance", () => {
  const record = makeRecord({
    record_type: "observation",
    scope,
    provenance,
    payload: { statement: "command completed" },
    now: "2026-11-24T00:00:00.000Z",
    record_id: "record-1",
  });
  assert.deepEqual(record, {
    schema_version: "0.1.0",
    record_id: "record-1",
    revision: 1,
    record_type: "observation",
    created_at: "2026-11-24T00:00:00.000Z",
    updated_at: "2026-11-24T00:00:00.000Z",
    scope,
    provenance,
    activation: { score: 1, anchor_at: "2026-11-24T00:00:00.000Z", opportunities: 0, protected_minimum: 0, policy_version: "ebb-0" },
    confidence: { level: "unassessed", basis: "", evidence_refs: [] },
    validity: { state: "unknown", valid_from: null, valid_until: null, compatibility: [] },
    retention: { policy: "default", class: "standard", expires_at: null },
    adoption: { state: "not_applicable", decision_ref: null, effective_at: null },
    payload: { statement: "command completed" },
  });
});

test("event envelope preserves actor, scope, and causation", () => {
  const event = makeEvent({
    event_id: "event-1",
    event_type: "tool_execution_end",
    request_id: "request-1",
    actor_id: "omp-session",
    scope,
    payload: { status: "success" },
    now: "2026-11-24T00:00:01.000Z",
  });
  assert.equal(event.schema_version, "0.1.0");
  assert.equal(event.event_id, "event-1");
  assert.equal(event.scope.scope_id, "scope-project");
  assert.equal(event.payload.status, "success");
});
