import test from "node:test";
import assert from "node:assert/strict";
import { createDreamSpec, makeHypothesis, normalizeModes, retrospect } from "../src/reverie.mjs";

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
