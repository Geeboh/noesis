import { randomUUID } from "node:crypto";

export const REVERIE_LEVELS = Object.freeze({
  snooze: { max_records: 100, max_model_tokens: 0, max_wall_seconds: 30, max_model_calls: 0, max_child_jobs: 0, max_output_records: 100 },
  nap: { max_records: 150, max_model_tokens: 12_000, max_wall_seconds: 90, max_model_calls: 3, max_child_jobs: 1, max_output_records: 25 },
  dream: { max_records: 400, max_model_tokens: 40_000, max_wall_seconds: 300, max_model_calls: 8, max_child_jobs: 3, max_output_records: 50 },
  deep_sleep: { max_records: 1200, max_model_tokens: 100_000, max_wall_seconds: 900, max_model_calls: 20, max_child_jobs: 6, max_output_records: 100 },
});

export const REVERIE_MODES = Object.freeze(["consolidate", "associate", "imagine", "rehearse", "reframe"]);

export function normalizeModes(modes) {
  const expanded = modes.flatMap((mode) => mode === "mixed" ? [...REVERIE_MODES] : [mode]);
  return [...new Set(expanded)];
}

export function createDreamSpec({ job_id = randomUUID(), level, modes, focus = null, scope_ids, budget = null }) {
  if (!REVERIE_LEVELS[level]) throw new Error("unsupported dream level");
  const normalized = normalizeModes(modes);
  if (!normalized.length || normalized.some((mode) => !REVERIE_MODES.includes(mode))) throw new Error("unsupported dream mode");
  return {
    schema_version: "0.1.0",
    job_id,
    level,
    modes: normalized,
    focus,
    scope_ids,
    execution_kind: "bounded",
    budget: budget ?? REVERIE_LEVELS[level],
    outputs: [],
    usage: { model_calls: 0, model_tokens: 0, child_jobs: 0, retries: 0, embeddings: 0, tool_work: 0, duration_ms: 0, cost: null },
  };
}

export function makeHypothesis({ job_id, kind, statement, source_refs = [], assumptions = [], validation_needed = [] }) {
  return { record_type: "hypothesis", provenance: { origin: "dream", job_id }, payload: { kind, statement, source_refs, assumptions, validation_needed, epistemic_status: "hypothesis" } };
}

export function retrospect({ observations, outcomes = [], hypotheses = [] }) {
  return {
    observations: observations.map((observation) => ({ ...observation, epistemic_status: observation.epistemic_status ?? (observation.completed === false ? "observed_attempt" : "observed") })),
    outcomes: outcomes.map((outcome) => ({ ...outcome, epistemic_status: outcome.epistemic_status ?? (outcome.status === "unresolved" ? "unresolved" : "actual_outcome") })),
    hypotheses: hypotheses.map((hypothesis) => ({ ...hypothesis, epistemic_status: "hypothesis" })),
  };
}

export function evaluatePolicy({ accepted_policy_id, candidate_policy_id, development_case_ids = [], held_out_case_ids = [], candidate_development_score, candidate_held_out_score, accepted_held_out_score }) {
  const overlap = development_case_ids.filter((id) => held_out_case_ids.includes(id));
  if (overlap.length) throw new Error("development and held-out cases must be disjoint");
  for (const score of [candidate_development_score, candidate_held_out_score, accepted_held_out_score]) if (!Number.isFinite(score)) throw new Error("policy scores are required");
  return {
    accepted_policy_id,
    candidate_policy_id,
    development_case_ids,
    held_out_case_ids,
    candidate_development_score,
    candidate_held_out_score,
    accepted_held_out_score,
    promoted: candidate_held_out_score > accepted_held_out_score,
    rollback_policy_id: accepted_policy_id,
  };
}
