import { randomUUID } from "node:crypto";

export const CONTRACT_VERSION = "0.1.0";

export const RECORD_TYPES = Object.freeze([
  "resource",
  "observation",
  "source",
  "evidence",
  "memory",
  "lesson",
  "preference",
  "hypothesis",
  "application",
  "outcome",
  "lore_page",
  "relation",
  "tombstone",
]);

export const PROVENANCE_ORIGINS = Object.freeze([
  "direct_user",
  "tool_observation",
  "document_import",
  "agent_derivation",
  "dream",
  "manual_edit",
]);

export const SCOPE_KINDS = Object.freeze([
  "session",
  "task",
  "project",
  "environment",
  "user",
  "shared",
]);

/**
 * @typedef {{scope_id:string, owner_id:string, kind:string, project_id:string|null, session_id:string|null, task_id:string|null}} Scope
 * @typedef {{origin:string, creator_id:string, source_refs:string[], derivation_refs:string[], capture_idempotency_key:string|null, transformation:string|null}} Provenance
 * @typedef {{score:number, anchor_at:string, opportunities:number, protected_minimum:number, policy_version:string}} Activation
 * @typedef {{level:"unassessed"|"low"|"medium"|"high", basis:string, evidence_refs:string[]}} Confidence
 * @typedef {{state:"unknown"|"current"|"stale"|"disputed"|"superseded"|"withdrawn", valid_from:string|null, valid_until:string|null, compatibility:string[]}} Validity
 * @typedef {{policy:string, class:string, expires_at:string|null}} Retention
 * @typedef {{state:"not_applicable"|"candidate"|"adopted"|"rejected"|"retired", decision_ref:string|null, effective_at:string|null}} Adoption
 * @typedef {{schema_version:string, record_id:string, revision:number, record_type:string, created_at:string, updated_at:string, scope:Scope, provenance:Provenance, activation:Activation, confidence:Confidence, validity:Validity, retention:Retention, adoption:Adoption, payload:object}} RecordEnvelope
 * @typedef {{schema_version:string, event_id:string, event_type:string, request_id:string, correlation_id:string|null, causation_id:string|null, actor_id:string, observed_at:string, object_revision:number|null, scope:Scope, payload:object}} EventEnvelope
 */

const isoNow = () => new Date().toISOString();

export function makeRecord({ record_type, scope, provenance, payload, now = isoNow(), record_id = randomUUID() }) {
  if (!RECORD_TYPES.includes(record_type)) throw new Error(`unsupported record type: ${record_type}`);
  if (!SCOPE_KINDS.includes(scope.kind)) throw new Error(`unsupported scope kind: ${scope.kind}`);
  if (!PROVENANCE_ORIGINS.includes(provenance.origin)) throw new Error(`unsupported provenance origin: ${provenance.origin}`);
  return {
    schema_version: CONTRACT_VERSION,
    record_id,
    revision: 1,
    record_type,
    created_at: now,
    updated_at: now,
    scope,
    provenance,
    activation: { score: 1, anchor_at: now, opportunities: 0, protected_minimum: 0, policy_version: "ebb-0" },
    confidence: { level: "unassessed", basis: "", evidence_refs: [] },
    validity: { state: "unknown", valid_from: null, valid_until: null, compatibility: [] },
    retention: { policy: "default", class: "standard", expires_at: null },
    adoption: { state: "not_applicable", decision_ref: null, effective_at: null },
    payload,
  };
}

export function makeEvent({ event_type, request_id = randomUUID(), correlation_id = null, causation_id = null, actor_id, scope, payload, object_revision = null, now = isoNow(), event_id = randomUUID() }) {
  if (!SCOPE_KINDS.includes(scope.kind)) throw new Error(`unsupported scope kind: ${scope.kind}`);
  return {
    schema_version: CONTRACT_VERSION,
    event_id,
    event_type,
    request_id,
    correlation_id,
    causation_id,
    actor_id,
    observed_at: now,
    object_revision,
    scope,
    payload,
  };
}
