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
  assert.equal(recalled.data[0].provenance.origin, "tool_observation");
  assert.equal(service.mindRecall({ principal: { owner_id: "other", scope_ids: [] }, query: "alpha", scope_ids: [scope.scope_id] }).data.length, 0);
  service.close();
  rmSync(directory, { recursive: true, force: true });
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
