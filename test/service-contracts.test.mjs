import test from "node:test";
import assert from "node:assert/strict";
import { makeDreamJob, makeRecallHit, makeRequest, scopeAllows } from "../src/service-contracts.mjs";

const scope = {
  scope_id: "scope-project",
  owner_id: "operator",
  kind: "project",
  project_id: "project-a",
  session_id: null,
  task_id: null,
};

const record = {
  record_id: "record-1",
  revision: 2,
  record_type: "observation",
  payload: { statement: "observed result" },
  scope,
  provenance: { origin: "tool_observation", source_refs: ["source-1"] },
  confidence: { level: "unassessed" },
  validity: { state: "unknown" },
};

test("service contracts preserve scoped recall explanation", () => {
  const request = makeRequest({ request_id: "req-1", operation: "mind_recall", scope_ids: [scope.scope_id], args: { query: "result" } });
  const hit = makeRecallHit({ record, reason: "lexical match in observed statement", estimated_chars: 16 });
  assert.equal(request.contract_version, "0.1.0");
  assert.equal(hit.provenance.source_refs[0], "source-1");
  assert.equal(hit.reason.includes("lexical"), true);
});

test("Snooze job accepts only deterministic consolidate mode", () => {
  const job = makeDreamJob({ job_id: "job-1", scope_ids: [scope.scope_id] });
  assert.equal(job.state, "queued");
  assert.deepEqual(job.modes, ["consolidate"]);
  assert.equal(job.budget.max_model_tokens, 0);
  assert.throws(() => makeDreamJob({ job_id: "job-2", scope_ids: [], modes: ["imagine"] }), /unsupported dream mode/);
});

test("scope authorization is explicit", () => {
  assert.equal(scopeAllows({ owner_id: "operator", scope_ids: [] }, scope), true);
  assert.equal(scopeAllows({ owner_id: "other", scope_ids: [] }, scope), false);
  assert.equal(scopeAllows({ owner_id: "other", scope_ids: ["scope-project"] }, scope), true);
});
