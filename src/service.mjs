import { randomUUID } from "node:crypto";
import { CONTRACT_VERSION, makeEvent, makeRecord } from "./contracts.mjs";
import { LedgerError, openStore } from "./store.mjs";
import { createDreamSpec, evaluatePolicy, makeHypothesis, retrospect } from "./reverie.mjs";
import { makeRecallHit, scopeAllows } from "./service-contracts.mjs";

const MAX_NOTE_CHARS = 16_000;

function requireNote(value) {
  if (!value || typeof value !== "string" || value.length === 0 || value.length > MAX_NOTE_CHARS) throw new LedgerError("INVALID_ARGUMENT", "note content must be 1-16000 characters");
  return value;
}
function recallScore(record, terms) {
  const text = String(record.payload.statement ?? record.payload.content ?? "").toLowerCase();
  return terms.reduce((score, term) => score + (text.includes(term) ? 1 : 0), 0);
}
function authorizedScopeIds(store, principal, scope_ids) {
  if (!Array.isArray(scope_ids) || scope_ids.length === 0) throw new LedgerError("INVALID_ARGUMENT", "scope_ids are required");
  const scopes = new Map(store.listRecords().map((record) => [record.scope.scope_id, record.scope]));
  if (scope_ids.some((scope_id) => !scopeAllows(principal, scopes.get(scope_id) ?? { scope_id, owner_id: "", kind: "project" }))) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "scope is not available");
  return scope_ids;
}

export function createService(store) {
  return {
    store,
    mindNote({ principal, scope, content, producer_id, idempotency_key, source = null, actor_id = producer_id, resource_id = null }) {
      if (!scopeAllows(principal, scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "scope is not available");
      const statement = requireNote(content);
      if (resource_id) {
        const resource = store.getResource(resource_id);
        if (!resource || !scopeAllows(principal, resource.scope) || resource.scope.scope_id !== scope.scope_id) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      }
      if (!producer_id || !idempotency_key) throw new LedgerError("INVALID_ARGUMENT", "producer_id and idempotency_key are required");
      const record = makeRecord({
        record_type: "observation",
        scope,
        provenance: {
          origin: "tool_observation",
          creator_id: actor_id,
          source_refs: source ? [source.source_id] : [],
          derivation_refs: [],
          capture_idempotency_key: idempotency_key,
          transformation: null,
        },
        payload: { statement, ...(resource_id ? { resource_id } : {}) },
      });
      const event = makeEvent({
        event_type: "mind_note",
        actor_id,
        scope,
        object_revision: record.revision,
        payload: { record_id: record.record_id, statement_kind: "observation" },
      });
      return store.capture({ producer_id, operation: "mind_note", idempotency_key, request: { content: statement, source_id: source?.source_id ?? null, scope_id: scope.scope_id, resource_id }, record, event, source });
    },
    mindRecall({ principal, query = "", scope_ids = [], max_items = 8, max_chars = 12000 }) {
      if (!Number.isInteger(max_items) || max_items < 1 || max_items > 100 || !Number.isInteger(max_chars) || max_chars < 1) throw new LedgerError("INVALID_ARGUMENT", "invalid recall budget");
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = [];
      let used_chars = 0;
      for (const record of store.listRecords()) {
        if (scope_ids.length && !scope_ids.includes(record.scope.scope_id)) continue;
        if (!scopeAllows(principal, record.scope)) continue;
        const score = terms.length ? recallScore(record, terms) : 1;
        if (!score) continue;
        const statement = String(record.payload.statement ?? record.payload.content ?? "");
        const hit = makeRecallHit({ record, reason: terms.length ? `matched ${score} query term${score === 1 ? "" : "s"}` : "listed in authorized scope", estimated_chars: statement.length });
        if (used_chars + hit.estimated_chars > max_chars) break;
        hits.push(hit);
        used_chars += hit.estimated_chars;
        if (hits.length >= max_items) break;
      }
      return { status: "ok", data: hits, coverage: { scope_ids, returned: hits.length, query } };
    },
    mindInspect({ principal, record_id, revision = null }) {
      const record = revision === null ? store.getRecord(record_id) : store.getRecordRevision(record_id, revision);
      if (!record || !scopeAllows(principal, record.scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "record is not available");
      const sources = record.provenance.source_refs.map((source_id) => store.getSource(source_id)).filter(Boolean);
      return { record, sources };
    },
    mindDream({ principal, scope_ids, level = "snooze", modes = ["consolidate"], focus = null, producer_id, idempotency_key }) {
      if (!producer_id || !idempotency_key) throw new LedgerError("INVALID_ARGUMENT", "producer_id and idempotency_key are required");
      const authorized_scopes = authorizedScopeIds(store, principal, scope_ids);
      const spec = createDreamSpec({ job_id: randomUUID(), level, modes, focus, scope_ids: authorized_scopes });
      const job = { ...spec, state: "queued", checkpoint: { cursor: 0, completed_steps: 0, total_steps: null } };
      const created = store.createProcessingJob({ job_id: job.job_id, kind: "dream", payload: job, checkpoint: job.checkpoint, producer_id, operation: "mind_dream", idempotency_key, request: { level, modes, focus, scope_ids: authorized_scopes } });
      return { status: "accepted", job_id: created.receipt?.job_id ?? created.job_id, state: "queued", budget: job.budget, usage: job.usage, duplicate: created.duplicate ?? false };
    },
    mindCapabilities() {
      return {
        contract_version: CONTRACT_VERSION,
        capability_revision: 1,
        available_tools: ["mind_note", "mind_recall", "mind_inspect", "mind_dream"],
        dream: { levels: ["snooze", "nap", "dream", "deep_sleep"], modes: ["consolidate", "associate", "imagine", "rehearse", "reframe"], execution_kinds: ["bounded"] },
        retrieval: { full_text: false, lexical: true, vectors: false },
        limits: { max_inline_records: 8, max_inline_chars: 12000 },
      };
    },
    runSnooze(args) {
      return this.runDream(args);
    },
    runDream({ principal, job_id, max_records = 100 }) {
      if (!Number.isInteger(max_records) || max_records < 1 || max_records > 1200) throw new LedgerError("INVALID_ARGUMENT", "invalid dream record budget");
      const saved = store.getProcessingJob(job_id);
      if (!saved || saved.kind !== "dream") throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "job is not available");
      const job = saved.payload;
      authorizedScopeIds(store, principal, job.scope_ids);
      if (saved.state === "cancelled" || saved.state === "completed") return this.mindDreamStatus({ principal, job_id });
      const startedAt = Date.now();
      const allRecords = store.listRecords().filter((record) => job.scope_ids.includes(record.scope.scope_id));
      const totalSteps = Math.min(allRecords.length, job.budget.max_records);
      const cursor = Math.min(saved.checkpoint.cursor ?? 0, totalSteps);
      const workLimit = Math.min(max_records, totalSteps - cursor);
      const records = allRecords.slice(cursor, cursor + workLimit);
      const outputs = records.length === 0 ? [] : [
        ...(job.modes.includes("consolidate") ? [{ type: "maintenance_receipt", status: "no_change", reason: "bounded deterministic consolidation", record_ids: records.map((record) => record.record_id) }] : []),
        ...job.modes.filter((mode) => mode !== "consolidate").map((mode) => makeHypothesis({ job_id, kind: mode, statement: `bounded ${mode} proposal over ${records.length} authorized records`, source_refs: records.map((record) => record.record_id), validation_needed: ["authorized real-world validation"] })),
      ];
      const nextCursor = cursor + records.length;
      const checkpoint = { cursor: nextCursor, completed_steps: nextCursor, total_steps: totalSteps };
      const updated = {
        ...job,
        state: nextCursor >= totalSteps ? "completed" : "paused",
        checkpoint,
        outputs: [...(job.outputs ?? []), ...outputs].slice(0, job.budget.max_output_records),
        usage: { ...job.usage, duration_ms: (job.usage.duration_ms ?? 0) + (Date.now() - startedAt) },
      };
      store.updateProcessingJob(job_id, updated.state, { payload: updated, checkpoint });
      return this.mindDreamStatus({ principal, job_id });
    },
    mindRetrospect({ principal, observation_ids = [], outcome_ids = [], hypothesis_ids = [] }) {
      const load = (ids) => ids.map((record_id) => this.mindInspect({ principal, record_id }).record);
      return retrospect({ observations: load(observation_ids), outcomes: load(outcome_ids), hypotheses: load(hypothesis_ids) });
    },
    mindPolicyEvaluate(args) {
      return evaluatePolicy(args);
    },
    mindDreamCancel({ principal, job_id }) {
      const saved = store.getProcessingJob(job_id);
      if (!saved || saved.kind !== "dream") throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "job is not available");
      const job = saved.payload;
      authorizedScopeIds(store, principal, job.scope_ids);
      if (saved.state === "completed") return this.mindDreamStatus({ principal, job_id });
      store.updateProcessingJob(job_id, "cancelled", { payload: { ...job, state: "cancelled" } });
      return this.mindDreamStatus({ principal, job_id });
    },
    mindDreamStatus({ principal, job_id }) {
      const saved = store.getProcessingJob(job_id);
      if (!saved || saved.kind !== "dream") throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "job is not available");
      const job = saved.payload;
      authorizedScopeIds(store, principal, job.scope_ids);
      return { job_id, level: job.level, modes: job.modes, focus: job.focus, execution_kind: job.execution_kind, state: saved.state === "pending" ? "queued" : saved.state, checkpoint: saved.checkpoint, progress: { completed: saved.checkpoint.completed_steps, total: saved.checkpoint.total_steps, remaining: Math.max(0, (saved.checkpoint.total_steps ?? 0) - saved.checkpoint.completed_steps) }, budget: job.budget, usage: job.usage, outputs: job.outputs };
    },
    close() {
      store.close();
    },
  };
}

export function openService(filename) {
  const service = createService(openStore(filename));
  return service;
}
