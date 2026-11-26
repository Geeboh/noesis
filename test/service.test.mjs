import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openService } from "../src/service.mjs";
import { makeEvent, makeRecord } from "../src/contracts.mjs";

const scope = { scope_id: "scope-service", owner_id: "operator", kind: "project", project_id: "project-a", session_id: "session-1", task_id: null };

function seedCatalystResource(service, resource_id, resourceScope = scope) {
  return service.store.createResource({
    resource_id,
    kind: "project",
    origin_facet: "local",
    display_name: resource_id,
    scope: resourceScope,
    metadata: {},
  });
}

function seedHypothesis(service, hypothesis_id, resource_id, hypothesisScope = scope) {
  const record = makeRecord({
    record_id: hypothesis_id,
    record_type: "hypothesis",
    scope: hypothesisScope,
    provenance: {
      origin: "dream",
      creator_id: "dreamer",
      source_refs: [],
      derivation_refs: [],
      capture_idempotency_key: null,
      transformation: null,
    },
    payload: { resource_id, statement: "try the proposed change", validation_needed: ["observe result"] },
  });
  const event = makeEvent({
    event_type: "test_hypothesis",
    actor_id: "dreamer",
    scope: hypothesisScope,
    object_revision: record.revision,
    payload: { record_id: record.record_id },
  });
  service.store.capture({
    producer_id: "test-fixture",
    operation: "test_hypothesis",
    idempotency_key: hypothesis_id,
    request: { hypothesis_id, resource_id },
    record,
    event,
  });
  return record;
}

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

test("mind_apply and mind_outcome create direct-user records and idempotent lineage", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  try {
    const resource = seedCatalystResource(service, "resource-catalyst");
    const hypothesis = seedHypothesis(service, "hypothesis-catalyst", resource.resource_id);
    const firstApplication = service.mindApply({
      principal,
      scope,
      hypothesis_id: hypothesis.record_id,
      resource_id: resource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-1",
    });
    const repeatedApplication = service.mindApply({
      principal,
      scope,
      hypothesis_id: hypothesis.record_id,
      resource_id: resource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-1",
    });
    assert.equal(firstApplication.duplicate, false);
    assert.equal(repeatedApplication.duplicate, true);
    const application = service.store.getRecord(firstApplication.receipt.record_id);
    assert.equal(application.record_type, "application");
    assert.deepEqual(application.payload, { hypothesis_id: hypothesis.record_id, resource_id: resource.resource_id, status: "applied" });
    assert.equal(application.provenance.origin, "direct_user");
    assert.equal(application.provenance.creator_id, "observatory");

    const firstOutcome = service.mindOutcome({
      principal,
      scope,
      application_id: application.record_id,
      resource_id: resource.resource_id,
      statement: "operator observed the requested change",
      outcome_status: "validated",
      producer_id: "observatory",
      idempotency_key: "outcome-1",
    });
    const repeatedOutcome = service.mindOutcome({
      principal,
      scope,
      application_id: application.record_id,
      resource_id: resource.resource_id,
      statement: "operator observed the requested change",
      outcome_status: "validated",
      producer_id: "observatory",
      idempotency_key: "outcome-1",
    });
    assert.equal(firstOutcome.duplicate, false);
    assert.equal(repeatedOutcome.duplicate, true);
    const outcome = service.store.getRecord(firstOutcome.receipt.record_id);
    assert.equal(outcome.record_type, "outcome");
    assert.deepEqual(outcome.payload, {
      application_id: application.record_id,
      resource_id: resource.resource_id,
      status: "validated",
      statement: "operator observed the requested change",
    });
    assert.equal(outcome.provenance.origin, "direct_user");
    assert.equal(outcome.provenance.creator_id, "observatory");

    const applicationLineage = service.store.listLineage(application.record_id);
    assert.equal(applicationLineage.filter((edge) => edge.edge_kind === "applied_as").length, 1);
    assert.equal(applicationLineage.filter((edge) => edge.edge_kind === "observed_outcome").length, 1);
    assert.equal(applicationLineage.find((edge) => edge.edge_kind === "applied_as").from_id, hypothesis.record_id);
    assert.equal(applicationLineage.find((edge) => edge.edge_kind === "observed_outcome").to_id, outcome.record_id);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Catalyst mutations deny unauthorized and cross-scope references", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const otherScope = { ...scope, scope_id: "scope-other", owner_id: "other", project_id: "project-other" };
  try {
    const resource = seedCatalystResource(service, "resource-authorized");
    const hypothesis = seedHypothesis(service, "hypothesis-authorized", resource.resource_id);
    const otherResource = seedCatalystResource(service, "resource-other", otherScope);
    assert.throws(() => service.mindApply({
      principal: { owner_id: "other", scope_ids: [] },
      scope,
      hypothesis_id: hypothesis.record_id,
      resource_id: resource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-forbidden",
    }), /scope is not available/);
    assert.throws(() => service.mindApply({
      principal,
      scope,
      hypothesis_id: hypothesis.record_id,
      resource_id: otherResource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-cross-scope",
    }), /reference is not available/);

    const application = service.mindApply({
      principal,
      scope,
      hypothesis_id: hypothesis.record_id,
      resource_id: resource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-authorized",
    });
    assert.throws(() => service.mindOutcome({
      principal: { owner_id: "other", scope_ids: [] },
      scope,
      application_id: application.receipt.record_id,
      resource_id: resource.resource_id,
      statement: "private outcome",
      outcome_status: "observed",
      producer_id: "observatory",
      idempotency_key: "outcome-forbidden",
    }), /scope is not available/);
    assert.throws(() => service.mindOutcome({
      principal,
      scope,
      application_id: application.receipt.record_id,
      resource_id: otherResource.resource_id,
      statement: "cross-scope outcome",
      outcome_status: "observed",
      producer_id: "observatory",
      idempotency_key: "outcome-cross-scope",
    }), /reference is not available/);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Catalyst mutations reject missing and wrong-type references without disclosure", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  try {
    const resource = seedCatalystResource(service, "resource-reference");
    const note = service.mindNote({ principal, scope, content: "not a hypothesis", producer_id: "omp-session", idempotency_key: "reference-note" });
    assert.throws(() => service.mindApply({
      principal,
      scope,
      hypothesis_id: note.receipt.record_id,
      resource_id: resource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-wrong-type",
    }), /reference is not available/);
    assert.throws(() => service.mindApply({
      principal,
      scope,
      hypothesis_id: "missing-hypothesis",
      resource_id: resource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-missing",
    }), /reference is not available/);
    const hypothesis = seedHypothesis(service, "hypothesis-reference", resource.resource_id);
    const application = service.mindApply({
      principal,
      scope,
      hypothesis_id: hypothesis.record_id,
      resource_id: resource.resource_id,
      producer_id: "observatory",
      idempotency_key: "apply-reference",
    });
    assert.throws(() => service.mindOutcome({
      principal,
      scope,
      application_id: note.receipt.record_id,
      resource_id: resource.resource_id,
      statement: "wrong application",
      outcome_status: "observed",
      producer_id: "observatory",
      idempotency_key: "outcome-wrong-type",
    }), /reference is not available/);
    assert.throws(() => service.mindOutcome({
      principal,
      scope,
      application_id: application.receipt.record_id,
      resource_id: "missing-resource",
      statement: "missing resource",
      outcome_status: "observed",
      producer_id: "observatory",
      idempotency_key: "outcome-missing-resource",
    }), /reference is not available/);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
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
test("mind_recall prefers shorter tied lexical matches under character budget", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const shortStatement = "alpha short";
  const longStatement = `alpha ${"long ".repeat(12)}`;
  try {
    service.mindNote({ principal, scope, content: shortStatement, producer_id: "omp-session", idempotency_key: "note-short-tie" });
    await new Promise((resolve) => setTimeout(resolve, 20));
    service.mindNote({ principal, scope, content: longStatement, producer_id: "omp-session", idempotency_key: "note-long-tie" });
    const recalled = service.mindRecall({ principal, query: "alpha", scope_ids: [scope.scope_id], max_items: 2, max_chars: longStatement.length });
    assert.deepEqual(recalled.data.map((hit) => hit.statement), [shortStatement]);
    assert.equal(recalled.coverage.omitted.budget, 1);
  } finally {
    service.close();
    rmSync(directory, { recursive: true, force: true });
  }
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
test("mind_recall admits one matching chunk per imported source entry within character budget", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-service-"));
  const service = openService(join(directory, "mind.sqlite"));
  const principal = { owner_id: "operator", scope_ids: [] };
  const sourceFor = (source_id, run_id, entry_id) => ({
    source_id,
    scope_id: scope.scope_id,
    locator: `import://${source_id}`,
    digest: `digest-${source_id}`,
    captured_at: "2026-01-01T00:00:00.000Z",
    status: "observed",
    snapshot: { format: "omp-jsonl", run_id, entry_id },
  });
  try {
    service.mindNote({ principal, scope, content: "alpha a", producer_id: "omp-import", idempotency_key: "group-a-1", origin: "document_import", source: sourceFor("source-group-a-1", "run-a", "entry-a") });
    service.mindNote({ principal, scope, content: "alpha bb", producer_id: "omp-import", idempotency_key: "group-a-2", origin: "document_import", source: sourceFor("source-group-a-2", "run-a", "entry-a") });
    service.mindNote({ principal, scope, content: "alpha independent", producer_id: "omp-import", idempotency_key: "group-b-1", origin: "document_import", source: sourceFor("source-group-b-1", "run-b", "entry-b") });
    const recalled = service.mindRecall({ principal, query: "alpha", scope_ids: [scope.scope_id], max_items: 3, max_chars: "alpha a".length + "alpha independent".length });
    assert.deepEqual(recalled.data.map((hit) => hit.statement), ["alpha a", "alpha independent"]);
    assert.equal(recalled.coverage.omitted.grouped, 1);
    assert.equal(recalled.coverage.omitted.budget, 0);
    assert.equal(recalled.coverage.included, 2);
    assert.equal(recalled.usage.model_calls, 0);
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
