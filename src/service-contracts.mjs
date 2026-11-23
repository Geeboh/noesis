import { CONTRACT_VERSION } from "./contracts.mjs";

export const ERROR_CODES = Object.freeze([
  "INVALID_ARGUMENT",
  "NOT_FOUND_OR_FORBIDDEN",
  "NOT_SUPPORTED",
  "IDEMPOTENCY_CONFLICT",
  "BUDGET_EXHAUSTED",
  "CANCELLED",
  "PROVIDER_UNAVAILABLE",
  "INTERNAL_ERROR",
]);

export const DREAM_LEVELS = Object.freeze({
  snooze: { max_records: 100, max_model_tokens: 0, max_wall_seconds: 30, max_model_calls: 0 },
});

export const DREAM_MODES = Object.freeze(["consolidate"]);
export const JOB_STATES = Object.freeze(["queued", "running", "paused", "completed", "cancelled", "failed", "budget_exhausted"]);

export function makeRequest({ request_id, operation, scope_ids, args = {}, idempotency_key = null, result_budget = { max_items: 8, max_chars: 12000 } }) {
  return { contract_version: CONTRACT_VERSION, request_id, operation, scope_ids, args, idempotency_key, result_budget };
}

export function makeRecallHit({ record, reason, estimated_chars }) {
  return {
    record_id: record.record_id,
    revision: record.revision,
    statement: record.payload.statement ?? record.payload.content ?? "",
    record_type: record.record_type,
    reason,
    scope: record.scope,
    provenance: record.provenance,
    confidence: record.confidence,
    validity: record.validity,
    estimated_chars,
  };
}

export function makeDreamJob({ job_id, level = "snooze", modes = ["consolidate"], scope_ids, focus = null, budget, input_revisions = [] }) {
  if (!DREAM_LEVELS[level]) throw new Error(`unsupported dream level: ${level}`);
  if (modes.some((mode) => !DREAM_MODES.includes(mode))) throw new Error("unsupported dream mode");
  return {
    schema_version: CONTRACT_VERSION,
    job_id,
    level,
    modes,
    focus,
    scope_ids,
    execution_kind: "deterministic",
    budget: budget ?? DREAM_LEVELS[level],
    input_revisions,
    state: "queued",
    checkpoint: { cursor: 0, completed_steps: 0, total_steps: null },
    outputs: [],
    usage: { model_calls: 0, model_tokens: 0, duration_ms: 0, cost: null },
  };
}

export function scopeAllows(principal, scope) {
  return principal.owner_id === scope.owner_id || principal.scope_ids.includes(scope.scope_id) || principal.scope_ids.includes("*");
}
