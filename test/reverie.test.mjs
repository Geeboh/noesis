import test from "node:test";
import assert from "node:assert/strict";
import { createDreamSpec, evaluatePolicy, makeHypothesis, normalizeModes, retrospect } from "../src/reverie.mjs";

test("Reverie keeps level, concrete modes, focus, and scope independent", () => {
  const job = createDreamSpec({ job_id: "dream-1", level: "dream", modes: ["mixed"], focus: { query: "API" }, scope_ids: ["scope-1"] });
  assert.deepEqual(job.modes, ["consolidate", "associate", "imagine", "rehearse", "reframe"]);
  assert.equal(job.level, "dream");
  assert.equal(job.focus.query, "API");
  assert.equal(job.budget.max_model_tokens, 40_000);
  assert.deepEqual(normalizeModes(["associate", "associate"]), ["associate"]);
});

test("dream output remains a hypothesis and retrospection separates actual outcomes", () => {
  const hypothesis = makeHypothesis({ job_id: "dream-1", kind: "scenario", statement: "could reduce latency", assumptions: ["cache is warm"] });
  const review = retrospect({ observations: [{ id: "obs-1" }], outcomes: [{ id: "out-1" }] });
  assert.equal(hypothesis.provenance.origin, "dream");
  assert.equal(hypothesis.payload.epistemic_status, "hypothesis");
  assert.equal(review.observations[0].epistemic_status, "observed");
  assert.equal(review.outcomes[0].epistemic_status, "actual_outcome");
});

test("policy evaluation keeps held-out cases disjoint and rollback explicit", () => {
  const result = evaluatePolicy({ accepted_policy_id: "policy-a", candidate_policy_id: "policy-b", development_case_ids: ["dev-1"], held_out_case_ids: ["hold-1"], candidate_development_score: 0.9, candidate_held_out_score: 0.8, accepted_held_out_score: 0.7 });
  assert.equal(result.promoted, true);
  assert.equal(result.rollback_policy_id, "policy-a");
  assert.throws(() => evaluatePolicy({ accepted_policy_id: "a", candidate_policy_id: "b", development_case_ids: ["same"], held_out_case_ids: ["same"], candidate_development_score: 1, candidate_held_out_score: 1, accepted_held_out_score: 0 }), /disjoint/);
});
