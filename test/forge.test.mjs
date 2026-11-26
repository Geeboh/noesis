import test from "node:test";
import assert from "node:assert/strict";
import { buildForgeView, exportBlueprint, exportTaskManifest } from "../src/forge.mjs";

test("Forge and Blueprint export stay scoped and separate findings from hypotheses", () => {
  const resource = { resource_id: "resource-1", scope: { scope_id: "scope-1" }, metadata: { version: "1.0" } };
  const forge = buildForgeView({ resource, records: [{ record_id: "obs-1", record_type: "observation", updated_at: "2026-01-02", scope: { scope_id: "scope-1" }, payload: { resource_id: "resource-1", statement: "path /home/alice/project failed" }, provenance: { origin: "tool_observation" } }, { record_id: "hyp-1", record_type: "hypothesis", updated_at: "2026-01-02", scope: { scope_id: "scope-1" }, payload: { resource_id: "resource-1" }, provenance: { origin: "dream" } }] });
  const blueprint = exportBlueprint({ forge, target: "resource-1", privacy: "redacted" });
  assert.equal(forge.findings.length, 1);
  assert.equal(forge.hypotheses.length, 1);
  assert.match(blueprint.markdown, /<path>/);
  assert.equal(blueprint.json.delta_since, null);
});

test("Blueprints carry scoped evidence, reproduction cases, hypotheses, and delta baselines", () => {
  const resource = { resource_id: "resource-project", scope: { scope_id: "scope-project" }, metadata: { version: "2.0" }, snapshots: [{ version: "2.0" }] };
  const forge = buildForgeView({ resource, records: [
    { record_id: "obs-2", record_type: "observation", updated_at: "2026-02-02", scope: { scope_id: "scope-project" }, payload: { resource_id: "resource-project", statement: "Bearer secret path /home/alice/project failed" }, provenance: { origin: "tool_observation", source_refs: ["source-2"] } },
    { record_id: "hyp-2", record_type: "hypothesis", updated_at: "2026-02-02", scope: { scope_id: "scope-project" }, payload: { resource_id: "resource-project", statement: "could improve retry handling" }, provenance: { origin: "dream", source_refs: ["obs-2"] } },
  ] });
  const blueprint = exportBlueprint({ forge, target: "Project", privacy: "redacted", previous_cutoff: "2026-01-01" });
  assert.equal(blueprint.json.version, "2.0");
  assert.equal(blueprint.json.reproduction_cases.length, 1);
  assert.equal(blueprint.json.hypotheses.length, 1);
  assert.match(blueprint.markdown, /<path>/);
  assert.throws(() => exportBlueprint({ forge, target: "Project", baseline: { target: "Other", scope: "scope-project", version: "2.0" } }), /INCOMPATIBLE_BASELINE/);
});
test("Catalyst task manifest stays scoped and proposal-only", () => {
  const resource = { resource_id: "resource-task", scope: { scope_id: "scope-task" }, metadata: { version: "3.0" } };
  const forge = buildForgeView({ resource, records: [{ record_id: "hyp-task", record_type: "hypothesis", updated_at: "2026-03-01", scope: { scope_id: "scope-task" }, payload: { resource_id: "resource-task", statement: "improve retry handling", validation_needed: ["run regression"] }, provenance: { origin: "dream", source_refs: ["source-task"] } }] });
  const manifest = exportTaskManifest({ forge, target: "Task Resource", privacy: "redacted" });
  assert.equal(manifest.json.status, "proposed");
  assert.equal(manifest.json.tasks[0].execution, "not_requested");
  assert.equal(manifest.json.tasks[0].hypothesis_id, "hyp-task");
  assert.deepEqual(manifest.json.tasks[0].source_refs, ["source-task"]);
  assert.deepEqual(manifest.json.tasks[0].outcome_ids, []);
  assert.equal(Object.hasOwn(manifest.json.tasks[0], "application_id"), false);
  assert.match(manifest.markdown, /execution not requested/);
});

test("Catalyst task manifest projects application and validated outcome lifecycle", () => {
  const resource = { resource_id: "resource-lifecycle", scope: { scope_id: "scope-lifecycle" }, metadata: { version: "4.0" } };
  const records = [
    { record_id: "hyp-proposed", record_type: "hypothesis", scope: resource.scope, payload: { resource_id: resource.resource_id, statement: "keep as proposal" }, provenance: { origin: "dream", source_refs: ["source-proposed"] } },
    { record_id: "hyp-applied", record_type: "hypothesis", scope: resource.scope, payload: { resource_id: resource.resource_id, statement: "apply this change" }, provenance: { origin: "dream", source_refs: ["source-applied"] } },
    { record_id: "hyp-validated", record_type: "hypothesis", scope: resource.scope, payload: { resource_id: resource.resource_id, statement: "validate this change" }, provenance: { origin: "dream", source_refs: ["source-validated"] } },
    { record_id: "application-applied", record_type: "application", scope: resource.scope, payload: { hypothesis_id: "hyp-applied", resource_id: resource.resource_id, status: "applied" }, provenance: { origin: "direct_user", source_refs: [] } },
    { record_id: "application-validated", record_type: "application", scope: resource.scope, payload: { hypothesis_id: "hyp-validated", resource_id: resource.resource_id, status: "applied" }, provenance: { origin: "direct_user", source_refs: [] } },
    { record_id: "outcome-validated", record_type: "outcome", scope: resource.scope, payload: { application_id: "application-validated", resource_id: resource.resource_id, status: "validated", statement: "change held" }, provenance: { origin: "direct_user", source_refs: [] } },
  ];
  const forge = buildForgeView({ resource, records });
  const manifest = exportTaskManifest({ forge, target: "Lifecycle Resource" });
  const tasks = new Map(manifest.json.tasks.map((task) => [task.hypothesis_id, task]));
  assert.equal(forge.applications.length, 2);
  assert.equal(forge.outcomes.length, 1);
  assert.equal(tasks.get("hyp-proposed").status, "proposed");
  assert.deepEqual(tasks.get("hyp-proposed").source_refs, ["source-proposed"]);
  assert.equal(tasks.get("hyp-applied").status, "applied");
  assert.equal(tasks.get("hyp-applied").application_id, "application-applied");
  assert.deepEqual(tasks.get("hyp-applied").outcome_ids, []);
  assert.equal(tasks.get("hyp-validated").status, "validated");
  assert.equal(tasks.get("hyp-validated").application_id, "application-validated");
  assert.deepEqual(tasks.get("hyp-validated").outcome_ids, ["outcome-validated"]);
  assert.deepEqual(tasks.get("hyp-validated").source_refs, ["source-validated"]);
});
