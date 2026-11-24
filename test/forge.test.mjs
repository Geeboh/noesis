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
  assert.match(manifest.markdown, /execution not requested/);
});
