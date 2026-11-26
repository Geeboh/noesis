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
function recallGroupKey(store, record) {
  if (record.provenance?.origin !== "document_import") return null;
  const sourceId = record.provenance.source_refs?.[0];
  if (!sourceId) return null;
  const snapshot = store.getSource(sourceId)?.snapshot;
  if (typeof snapshot?.run_id !== "string" || snapshot.run_id.length === 0 || typeof snapshot.entry_id !== "string" || snapshot.entry_id.length === 0) return null;
  return JSON.stringify([snapshot.run_id, snapshot.entry_id]);
}

const MAX_INSPECT_BYTES = 12_000;

function principalKey(principal) {
  return JSON.stringify({ owner_id: principal.owner_id, scope_ids: [...(principal.scope_ids ?? [])].sort() });
}

function encodeInspectCursor(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeInspectCursor(value) {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (parsed?.version !== 1 || typeof parsed.record_id !== "string" || !Number.isInteger(parsed.revision) || typeof parsed.field !== "string" || !Number.isInteger(parsed.start_byte) || !Number.isInteger(parsed.max_bytes) || typeof parsed.principal !== "string") throw new Error();
    return parsed;
  } catch {
    throw new LedgerError("INVALID_ARGUMENT", "invalid inspection cursor");
  }
}

function inspectPage(text, start_byte, max_bytes) {
  const bytes = Buffer.from(text, "utf8");
  if (max_bytes === null) return { content: text, start_byte: 0, end_byte: bytes.length, total_bytes: bytes.length, complete: true };
  let end_byte = Math.min(bytes.length, start_byte + max_bytes);
  while (end_byte > start_byte && end_byte < bytes.length && (bytes[end_byte] & 0xc0) === 0x80) end_byte -= 1;
  return { content: bytes.subarray(start_byte, end_byte).toString("utf8"), start_byte, end_byte, total_bytes: bytes.length, complete: end_byte >= bytes.length };
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
    mindNote({ principal, scope, content, producer_id, idempotency_key, source = null, actor_id = producer_id, resource_id = null, origin = "tool_observation" }) {
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
          origin,
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
      const trace_id = randomUUID();
      const startedAt = Date.now();
      const terms = [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))];
      const records = store.listRecords();
      const effective_scope_ids = scope_ids.length ? scope_ids : [...new Set(records.filter((record) => scopeAllows(principal, record.scope)).map((record) => record.scope.scope_id))].sort();
      const hits = [];
      const omitted = { out_of_scope: 0, non_match: 0, budget: 0, item_limit: 0, grouped: 0 };
      let considered = 0;
      let matched = 0;
      let used_chars = 0;
      let truncated = false;
      const orderedRecords = records.map((record, index) => ({ record, score: terms.length ? recallScore(record, terms) : 1, statement_length: String(record.payload.statement ?? record.payload.content ?? "").length, index })).sort((left, right) => right.score - left.score || left.statement_length - right.statement_length || left.index - right.index);
      const admittedGroups = new Set();
      for (const { record, score } of orderedRecords) {
        considered += 1;
        if ((scope_ids.length && !scope_ids.includes(record.scope.scope_id)) || !scopeAllows(principal, record.scope)) {
          omitted.out_of_scope += 1;
          continue;
        }
        if (!score) {
          omitted.non_match += 1;
          continue;
        }
        matched += 1;
        const group = recallGroupKey(store, record);
        if (group !== null && admittedGroups.has(group)) {
          omitted.grouped += 1;
          continue;
        }
        const statement = String(record.payload.statement ?? record.payload.content ?? "");
        const hit = makeRecallHit({ record, reason: terms.length ? `matched ${score} query term${score === 1 ? "" : "s"}` : "listed in authorized scope", estimated_chars: statement.length });
        if (used_chars + hit.estimated_chars > max_chars) {
          omitted.budget += 1;
          truncated = true;
          continue;
        }
        hits.push(hit);
        if (group !== null) admittedGroups.add(group);
        used_chars += hit.estimated_chars;
        if (hits.length >= max_items) {
          omitted.item_limit += 1;
          truncated = true;
          break;
        }
      }
      const duration_ms = Date.now() - startedAt;
      return {
        status: "ok",
        data: hits,
        trace_id,
        coverage: { scope_ids: effective_scope_ids, returned: hits.length, query, considered, matched, included: hits.length, omitted, truncated },
        usage: { duration_ms, model_calls: 0, model_tokens: 0, cost: null, measurement: "local_deterministic" },
      };
    },
    mindInspect({ principal, record_id, revision = null, max_bytes = null, cursor = null }) {
      const cursorData = cursor ? decodeInspectCursor(cursor) : null;
      const callerKey = principalKey(principal);
      if (cursorData && (cursorData.record_id !== record_id || cursorData.principal !== callerKey || (revision !== null && revision !== cursorData.revision) || (max_bytes !== null && max_bytes !== cursorData.max_bytes))) throw new LedgerError("INVALID_ARGUMENT", "inspection cursor does not match request");
      if (cursorData && revision === null) revision = cursorData.revision;
      if (cursorData && max_bytes === null) max_bytes = cursorData.max_bytes;
      if (max_bytes !== null && (!Number.isInteger(max_bytes) || max_bytes < 4 || max_bytes > MAX_INSPECT_BYTES)) throw new LedgerError("INVALID_ARGUMENT", "invalid inspection byte budget");
      const record = revision === null ? store.getRecord(record_id) : store.getRecordRevision(record_id, revision);
      if (!record || !scopeAllows(principal, record.scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "record is not available");
      const sources = record.provenance.source_refs.map((source_id) => store.getSource(source_id)).filter(Boolean);
      const field = Object.hasOwn(record.payload, "statement") ? "statement" : "content";
      const fullText = String(record.payload[field] ?? "");
      const start_byte = cursorData?.start_byte ?? 0;
      const total_bytes = Buffer.byteLength(fullText, "utf8");
      if (start_byte < 0 || start_byte > total_bytes) throw new LedgerError("INVALID_ARGUMENT", "inspection cursor is stale");
      const page = inspectPage(fullText, start_byte, max_bytes);
      const continuation = page.complete ? null : encodeInspectCursor({ version: 1, record_id, revision: record.revision, field, start_byte: page.end_byte, max_bytes, principal: callerKey });
      const viewRecord = max_bytes === null && !cursorData ? record : { ...record, payload: { ...record.payload, [field]: page.content } };
      return {
        record: viewRecord,
        sources,
        inspection: {
          field,
          revision: record.revision,
          kind: total_bytes === 0 ? "unavailable" : page.complete ? "exact" : "partial",
          requested_range: { start_byte, end_byte: max_bytes === null ? total_bytes : Math.min(total_bytes, start_byte + max_bytes) },
          returned_range: { start_byte: page.start_byte, end_byte: page.end_byte },
          returned_bytes: page.end_byte - page.start_byte,
          total_bytes,
          integrity: { status: "unverified", reason: "no range digest recorded" },
          content: page.content,
          continuation,
        },
      };
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
        capability_revision: 2,
        available_tools: ["mind_note", "mind_recall", "mind_inspect", "mind_dream"],
        dream: { levels: ["snooze", "nap", "dream", "deep_sleep"], modes: ["consolidate", "associate", "imagine", "rehearse", "reframe"], execution_kinds: ["bounded"] },
        retrieval: { full_text: false, lexical: true, vectors: false },
        limits: { max_inline_records: 8, max_inline_chars: 12000 },
        inspection: { max_bytes: 12000, cursor: true, coverage_kinds: ["exact", "partial", "unavailable"] },
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
