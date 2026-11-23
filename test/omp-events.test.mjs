import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openService } from "../src/service.mjs";
import { normalizeHostEvent } from "../src/omp-events.mjs";

test("host event normalization is bounded and idempotent", () => {
  const event = { toolCallId: "tool-1", status: "error", error: "failed", output: "x".repeat(20_000) };
  const first = normalizeHostEvent("tool_execution_end", event, "actor-1");
  const second = normalizeHostEvent("tool_execution_end", { ...event }, "actor-1");
  assert.equal(first.idempotency_key, second.idempotency_key);
  assert.equal(first.actor_id, "actor-1");
  assert.equal(first.status, "error");
  assert.equal(first.content.length, 16_000);
});

test("interrupted events keep interrupted status", () => {
  const normalized = normalizeHostEvent("tool_execution_end", { id: "event-2", aborted: true, output: "partial" });
  assert.equal(normalized.status, "interrupted");
  assert.equal(normalized.idempotency_key, "tool_execution_end:event-2");
});
test("empty host payloads are ignored", () => {
  assert.equal(normalizeHostEvent("message_end", ""), null);
  assert.equal(normalizeHostEvent("message_end", undefined), null);
});
test("normalized repeated host event persists one canonical observation", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-omp-events-"));
  const service = openService(join(directory, "mind.sqlite"));
  const scope = { scope_id: "scope-events", owner_id: "local", kind: "project", project_id: "project-a", session_id: null, task_id: null };
  const principal = { owner_id: "local", scope_ids: [] };
  const event = normalizeHostEvent("tool_execution_end", { toolCallId: "tool-9", error: "failed", output: "partial" });
  const first = service.mindNote({ principal, scope, content: `${event.status}: ${event.content}`, producer_id: "omp-event", idempotency_key: event.idempotency_key, actor_id: event.actor_id });
  const second = service.mindNote({ principal, scope, content: `${event.status}: ${event.content}`, producer_id: "omp-event", idempotency_key: event.idempotency_key, actor_id: event.actor_id });
  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(service.mindInspect({ principal, record_id: first.receipt.record_id }).record.provenance.origin, "tool_observation");
  service.close();
  rmSync(directory, { recursive: true, force: true });
});
