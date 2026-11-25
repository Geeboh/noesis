import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openService } from "../src/service.mjs";

const scope = { scope_id: "scope-service", owner_id: "operator", kind: "project", project_id: "project-a", session_id: "session-1", task_id: null };

test("mind_note persists an observed record through the service boundary", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const first = service.mindNote({ principal, scope, content: "tool returned a usable result", producer_id: "omp-session", idempotency_key: "note-1", actor_id: "omp-session" });
  const second = service.mindNote({ principal, scope, content: "tool returned a usable result", producer_id: "omp-session", idempotency_key: "note-1", actor_id: "omp-session" });
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  const imported = service.mindNote({ principal, scope, content: "retained document text", producer_id: "omp-import", idempotency_key: "document-1", origin: "document_import" });
  assert.equal(service.store.getRecord(imported.receipt.record_id).provenance.origin, "document_import");
  const importedRepeat = service.mindNote({ principal, scope, content: "retained document text", producer_id: "omp-import", idempotency_key: "document-1", origin: "tool_observation" });
  assert.equal(importedRepeat.duplicate, true);
  service.close();
  rmSync(directory, { recursive: true, force: true });
});

test("mind_note denies a principal outside the requested scope", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  assert.throws(() => service.mindNote({ principal: { owner_id: "other", scope_ids: [] }, scope, content: "private", producer_id: "other", idempotency_key: "note-2" }), /scope is not available/);
  service.close();
  rmSync(directory, { recursive: true, force: true });
});

test("mind_recall returns bounded provenance-backed matches only in scope", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  service.mindNote({ principal, scope, content: "alpha tool result", producer_id: "omp-session", idempotency_key: "note-recall" });
  const recalled = service.mindRecall({ principal, query: "alpha", scope_ids: [scope.scope_id], max_items: 1, max_chars: 100 });
  assert.equal(recalled.data.length, 1);
  assert.equal(typeof recalled.trace_id, "string");
  assert.equal(recalled.usage.model_calls, 0);
  assert.equal(recalled.coverage.included, 1);
  assert.equal(recalled.data[0].provenance.origin, "tool_observation");
  assert.equal(service.mindRecall({ principal: { owner_id: "other", scope_ids: [] }, query: "alpha", scope_ids: [scope.scope_id] }).data.length, 0);
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
test("mind_recall prioritizes stronger lexical matches under the item budget", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  try {
    service.mindNote({ principal, scope, content: "alpha beta critical decision", producer_id: "omp-session", idempotency_key: "note-critical" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    for (let index = 0; index < 3; index += 1) {
      service.mindNote({ principal, scope, content: `alpha routine-${index}`, producer_id: "omp-session", idempotency_key: `note-routine-${index}` });
      await new Promise((resolve) => setTimeout(resolve, 2));
    }
    const recalled = service.mindRecall({ principal, query: "alpha beta", scope_ids: [scope.scope_id], max_items: 2, max_chars: 200 });
    assert.deepEqual(recalled.data.map((hit) => hit.statement), ["alpha beta critical decision", "alpha routine-2"]);
    assert.equal(recalled.coverage.included, 2);
    assert.equal(recalled.coverage.truncated, true);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test("mind_recall continues after an oversized lexical hit", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  try {
    service.mindNote({ principal, scope, content: `alpha beta ${"oversized ".repeat(30)}`, producer_id: "omp-session", idempotency_key: "note-oversized" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    for (let index = 0; index < 3; index += 1) {
      service.mindNote({ principal, scope, content: `alpha small-${index}`, producer_id: "omp-session", idempotency_key: `note-small-${index}` });
      await new Promise((resolve) => setTimeout(resolve, 2));
    }
    const recalled = service.mindRecall({ principal, query: "alpha beta", scope_ids: [scope.scope_id], max_items: 3, max_chars: 80 });
    assert.deepEqual(recalled.data.map((hit) => hit.statement), ["alpha small-2", "alpha small-1", "alpha small-0"]);
    assert.equal(recalled.coverage.omitted.budget, 1);
    assert.equal(recalled.coverage.included, 3);
    assert.equal(recalled.coverage.truncated, true);
    assert.ok(recalled.data.reduce((total, hit) => total + hit.estimated_chars, 0) <= 80);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test("mind_inspect returns exact revision and source without disclosing forbidden records", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const captured = service.mindNote({
    principal,
    scope,
    content: "inspectable output",
    producer_id: "omp-session",
    idempotency_key: "note-inspect",
    source: { source_id: "source-inspect", scope_id: scope.scope_id, locator: "file:///workspace/output.txt", digest: "digest-inspect", captured_at: "2026-11-24T00:00:00.000Z", status: "observed", snapshot: { content: "output" } },
  });
  const inspected = service.mindInspect({ principal, record_id: captured.receipt.record_id, revision: 1 });
  assert.equal(inspected.record.revision, 1);
  assert.equal(inspected.sources[0].source_id, "source-inspect");
  assert.throws(() => service.mindInspect({ principal: { owner_id: "other", scope_ids: [] }, record_id: captured.receipt.record_id }), /record is not available/);
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
test("mind_inspect returns revision-bound UTF-8 pages with continuation", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const content = "identifier=π; exact value=42; failure=timeout";
  try {
    const captured = service.mindNote({ principal, scope, content, producer_id: "omp-session", idempotency_key: "note-page" });
    const first = service.mindInspect({ principal, record_id: captured.receipt.record_id, revision: 1, max_bytes: 8 });
    assert.equal(first.inspection.kind, "partial");
    assert.ok(first.inspection.continuation);
    assert.ok(!first.inspection.content.includes("\uFFFD"));
    let page = first;
    let combined = first.inspection.content;
    while (page.inspection.continuation) {
      page = service.mindInspect({ principal, record_id: captured.receipt.record_id, cursor: page.inspection.continuation });
      combined += page.inspection.content;
    }
    assert.equal(page.inspection.kind, "exact");
    assert.equal(combined, content);
    assert.throws(() => service.mindInspect({ principal: { owner_id: "other", scope_ids: [] }, record_id: captured.receipt.record_id, cursor: first.inspection.continuation }), /inspection cursor does not match request/);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test("mind_recall does not inflate repeated query terms", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  try {
    service.mindNote({ principal, scope, content: "alpha older evidence", producer_id: "omp-session", idempotency_key: "note-alpha" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    service.mindNote({ principal, scope, content: "beta newer evidence", producer_id: "omp-session", idempotency_key: "note-beta" });
    const recalled = service.mindRecall({ principal, query: "alpha alpha beta", scope_ids: [scope.scope_id], max_items: 1, max_chars: 200 });
    assert.equal(recalled.data[0].statement, "beta newer evidence");
    assert.equal(recalled.data[0].reason, "matched 1 query term");
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test("mind_recall reports effective owner scopes by default", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const otherScope = { ...scope, scope_id: "other-scope", owner_id: "other", project_id: "project-b" };
  try {
    service.mindNote({ principal, scope, content: "authorized note", producer_id: "omp-session", idempotency_key: "scope-authorized" });
    service.mindNote({ principal: { owner_id: "other", scope_ids: [] }, scope: otherScope, content: "forbidden note", producer_id: "omp-session", idempotency_key: "scope-forbidden" });
    const recalled = service.mindRecall({ principal, query: "", max_items: 8, max_chars: 200 });
    assert.deepEqual(recalled.data.map((hit) => hit.statement), ["authorized note"]);
    assert.deepEqual(recalled.coverage.scope_ids, [scope.scope_id]);
    assert.equal(recalled.coverage.omitted.out_of_scope, 1);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test("mind_dream admits full bounded Reverie levels and modes", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  service.mindNote({ principal, scope, content: "dream input", producer_id: "omp-session", idempotency_key: "note-dream" });
  const first = service.mindDream({ principal, scope_ids: [scope.scope_id], producer_id: "omp-session", idempotency_key: "dream-1" });
  const second = service.mindDream({ principal, scope_ids: [scope.scope_id], producer_id: "omp-session", idempotency_key: "dream-1" });
  assert.equal(first.status, "accepted");
  assert.equal(first.state, "queued");
  assert.equal(first.budget.max_model_tokens, 0);
  assert.equal(second.duplicate, true);
  const full = service.mindDream({ principal, scope_ids: [scope.scope_id], level: "dream", modes: ["imagine"], producer_id: "omp-session", idempotency_key: "dream-2" });
  assert.equal(full.duplicate, false);
  assert.equal(full.budget.max_model_tokens, 40_000);
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
test("mind_dream status reports durable queued budget state", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  service.mindNote({ principal, scope, content: "status input", producer_id: "omp-session", idempotency_key: "note-status" });
  const accepted = service.mindDream({ principal, scope_ids: [scope.scope_id], producer_id: "omp-session", idempotency_key: "dream-status" });
  const status = service.mindDreamStatus({ principal, job_id: accepted.job_id });
  assert.equal(status.state, "queued");
  assert.equal(status.budget.max_model_tokens, 0);
  assert.equal(status.usage.model_calls, 0);
  assert.equal(status.checkpoint.cursor, 0);
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
test("runSnooze completes bounded deterministic bookkeeping without semantic output", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const note = service.mindNote({ principal, scope, content: "bookkeeping input", producer_id: "omp-session", idempotency_key: "note-run" });
  const accepted = service.mindDream({ principal, scope_ids: [scope.scope_id], producer_id: "omp-session", idempotency_key: "dream-run" });
  const completed = service.runSnooze({ principal, job_id: accepted.job_id, max_records: 1 });
  assert.equal(completed.state, "completed");
  assert.equal(completed.checkpoint.completed_steps, 1);
  assert.equal(completed.outputs[0].status, "no_change");
  assert.equal(completed.outputs[0].record_ids[0], note.receipt.record_id);
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
test("mind_dream cancellation is durable and blocks later work", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  service.mindNote({ principal, scope, content: "cancel input", producer_id: "omp-session", idempotency_key: "note-cancel" });
  const accepted = service.mindDream({ principal, scope_ids: [scope.scope_id], producer_id: "omp-session", idempotency_key: "dream-cancel" });
  const cancelled = service.mindDreamCancel({ principal, job_id: accepted.job_id });
  assert.equal(cancelled.state, "cancelled");
  assert.deepEqual(service.runSnooze({ principal, job_id: accepted.job_id }).state, "cancelled");
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
test("Snooze cancellation survives close and reopen", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const filename = join(directory, "mind.sqlite");
  const principal = { owner_id: "operator", scope_ids: [] };
  const first = openService(filename);
  first.mindNote({ principal, scope, content: "restart input", producer_id: "omp-session", idempotency_key: "note-restart" });
  const accepted = first.mindDream({ principal, scope_ids: [scope.scope_id], producer_id: "omp-session", idempotency_key: "dream-restart" });
  first.mindDreamCancel({ principal, job_id: accepted.job_id });
  first.close();
  const second = openService(filename);
  assert.equal(second.mindDreamStatus({ principal, job_id: accepted.job_id }).state, "cancelled");
  second.close();
  rmSync(directory, { recursive: true, force: true });
});
test("capabilities advertise full Reverie dream support", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const capabilities = service.mindCapabilities();
  assert.deepEqual(capabilities.dream.levels, ["snooze", "nap", "dream", "deep_sleep"]);
  assert.deepEqual(capabilities.dream.modes, ["consolidate", "associate", "imagine", "rehearse", "reframe"]);
  assert.equal(capabilities.dream.execution_kinds[0], "bounded");
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
test("full dream levels do not create unsupported jobs", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  service.mindNote({ principal, scope, content: "unsupported input", producer_id: "omp-session", idempotency_key: "note-unsupported" });
  const supported = service.mindDream({ principal, scope_ids: [scope.scope_id], level: "deep_sleep", modes: ["reframe"], producer_id: "omp-session", idempotency_key: "unsupported-job" });
  assert.equal(supported.duplicate, false);
  assert.equal(supported.state, "queued");
  service.close();
  rmSync(directory, { recursive: true, force: true });
});

test("bounded Reverie resumes partial work and preserves hypothesis output", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const notes = [];
  for (const id of ["dream-input-1", "dream-input-2", "dream-input-3"]) notes.push(service.mindNote({ principal, scope, content: id, producer_id: "omp-session", idempotency_key: id }));
  const accepted = service.mindDream({ principal, scope_ids: [scope.scope_id], level: "dream", modes: ["mixed"], focus: { query: "dream" }, producer_id: "omp-session", idempotency_key: "dream-partial" });
  const partial = service.runDream({ principal, job_id: accepted.job_id, max_records: 1 });
  assert.equal(partial.state, "paused");
  assert.equal(partial.progress.remaining, 2);
  assert.equal(partial.outputs.some((output) => output.payload?.epistemic_status === "hypothesis"), true);
  const completed = service.runDream({ principal, job_id: accepted.job_id, max_records: 10 });
  assert.equal(completed.state, "completed");
  assert.equal(completed.progress.remaining, 0);
  const review = service.mindRetrospect({ principal, observation_ids: [notes[0].receipt.record_id] });
  assert.equal(review.observations[0].epistemic_status, "observed");
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
