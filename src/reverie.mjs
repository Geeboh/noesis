import { randomUUID } from "node:crypto";

export const REVERIE_LEVELS = Object.freeze({
  snooze: { max_records: 100, max_model_tokens: 0, max_wall_seconds: 30, max_model_calls: 0 },
  nap: { max_records: 150, max_model_tokens: 12_000, max_wall_seconds: 90, max_model_calls: 3 },
  dream: { max_records: 400, max_model_tokens: 40_000, max_wall_seconds: 300, max_model_calls: 8 },
  deep_sleep: { max_records: 1200, max_model_tokens: 100_000, max_wall_seconds: 900, max_model_calls: 20 },
});

export const REVERIE_MODES = Object.freeze(["consolidate", "associate", "imagine", "rehearse", "reframe"]);

export function normalizeModes(modes) {
  const expanded = modes.flatMap((mode) => mode === "mixed" ? ["consolidate", "associate", "imagine", "rehearse", "reframe"] : [mode]);
  return [...new Set(expanded)];
}

export function createDreamSpec({ job_id = randomUUID(), level, modes, focus = null, scope_ids, budget = null }) {
  if (!REVERIE_LEVELS[level]) throw new Error("unsupported dream level");
  const normalized = normalizeModes(modes);
  if (!normalized.length || normalized.some((mode) => !REVERIE_MODES.includes(mode))) throw new Error("unsupported dream mode");
  return { schema_version: "0.1.0", job_id, level, modes: normalized, focus, scope_ids, budget: budget ?? REVERIE_LEVELS[level], execution_kind: "bounded", outputs: [], usage: { model_calls: 0, model_tokens: 0, cost: null } };
}

export function makeHypothesis({ job_id, kind, statement, source_refs = [], assumptions = [], validation_needed = [] }) {
  return { record_type: "hypothesis", provenance: { origin: "dream", job_id }, payload: { kind, statement, source_refs, assumptions, validation_needed, epistemic_status: "hypothesis" } };
}

export function retrospect({ observations, outcomes = [] }) {
  return { observations: observations.map((observation) => ({ ...observation, epistemic_status: "observed" })), outcomes: outcomes.map((outcome) => ({ ...outcome, epistemic_status: "actual_outcome" })), hypotheses: [] };
}
