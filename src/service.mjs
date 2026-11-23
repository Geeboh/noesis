import { randomUUID } from "node:crypto";
import { CONTRACT_VERSION, makeEvent, makeRecord } from "./contracts.mjs";
import { LedgerError, openStore } from "./store.mjs";
import { makeDreamJob, makeRecallHit, scopeAllows } from "./service-contracts.mjs";

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
    mindNote({ principal, scope, content, producer_id, idempotency_key, source = null, actor_id = producer_id }) {
      if (!scopeAllows(principal, scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "scope is not available");
      const statement = requireNote(content);
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
        payload: { statement },
      });
      const event = makeEvent({
        event_type: "mind_note",
        actor_id,
        scope,
        object_revision: record.revision,
        payload: { record_id: record.record_id, statement_kind: "observation" },
      });
      return store.capture({ producer_id, operation: "mind_note", idempotency_key, request: { content: statement, source_id: source?.source_id ?? null, scope_id: scope.scope_id }, record, event, source });
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
      if (level !== "snooze" || modes.length !== 1 || modes[0] !== "consolidate") throw new LedgerError("NOT_SUPPORTED", "only deterministic snooze/consolidate is available");
      if (!producer_id || !idempotency_key) throw new LedgerError("INVALID_ARGUMENT", "producer_id and idempotency_key are required");
      const authorized_scopes = authorizedScopeIds(store, principal, scope_ids);
      const job = makeDreamJob({ job_id: randomUUID(), level, modes, focus, scope_ids: authorized_scopes });
      const created = store.createProcessingJob({
        job_id: job.job_id,
        kind: "dream",
        payload: job,
        checkpoint: job.checkpoint,
        producer_id,
        operation: "mind_dream",
        idempotency_key,
        request: { level, modes, focus, scope_ids: authorized_scopes },
      });
      return { status: "accepted", job_id: created.receipt?.job_id ?? created.job_id, state: "queued", budget: job.budget, usage: job.usage, duplicate: created.duplicate ?? false };
    },
    mindCapabilities() {
      return {
        contract_version: CONTRACT_VERSION,
        capability_revision: 1,
        available_tools: ["mind_note", "mind_recall", "mind_inspect", "mind_dream"],
        dream: { levels: ["snooze"], modes: ["consolidate"], execution_kinds: ["deterministic"] },
        retrieval: { full_text: false, lexical: true, vectors: false },
        limits: { max_inline_records: 8, max_inline_chars: 12000 },
      };
    },
    runSnooze({ principal, job_id, max_records = 100 }) {
      if (!Number.isInteger(max_records) || max_records < 1 || max_records > 100) throw new LedgerError("INVALID_ARGUMENT", "invalid Snooze record budget");
      const saved = store.getProcessingJob(job_id);
      if (!saved || saved.kind !== "dream") throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "job is not available");
      const job = saved.payload;
      authorizedScopeIds(store, principal, job.scope_ids);
      if (saved.state === "cancelled" || saved.state === "completed") return this.mindDreamStatus({ principal, job_id });
      const records = store.listRecords().filter((record) => job.scope_ids.includes(record.scope.scope_id)).slice(0, max_records);
      const checkpoint = { cursor: records.length, completed_steps: records.length, total_steps: records.length };
      const output = { type: "maintenance_receipt", status: "no_change", reason: "deterministic Snooze performs bookkeeping only", record_ids: records.map((record) => record.record_id) };
      const updated = { ...job, state: "completed", checkpoint, outputs: [output] };
      store.updateProcessingJob(job_id, "completed", { payload: updated, checkpoint });
      return this.mindDreamStatus({ principal, job_id });
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
      return { job_id, state: saved.state === "pending" ? "queued" : saved.state, checkpoint: saved.checkpoint, budget: job.budget, usage: job.usage, outputs: job.outputs };
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
