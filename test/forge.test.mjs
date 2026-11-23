import test from "node:test";
import assert from "node:assert/strict";
import { buildForgeView, exportBlueprint } from "../src/forge.mjs";

test("Forge and Blueprint export stay scoped and separate findings from hypotheses", () => {
  const resource = { resource_id: "resource-1", scope: { scope_id: "scope-1" }, metadata: { version: "1.0" } };
  const forge = buildForgeView({ resource, records: [{ record_id: "obs-1", record_type: "observation", updated_at: "2026-01-02", scope: { scope_id: "scope-1" }, payload: { resource_id: "resource-1", statement: "path /home/alice/project failed" }, provenance: { origin: "tool_observation" } }, { record_id: "hyp-1", record_type: "hypothesis", updated_at: "2026-01-02", scope: { scope_id: "scope-1" }, payload: { resource_id: "resource-1" }, provenance: { origin: "dream" } }] });
  const blueprint = exportBlueprint({ forge, target: "resource-1", privacy: "redacted" });
  assert.equal(forge.findings.length, 1);
  assert.equal(forge.hypotheses.length, 1);
  assert.match(blueprint.markdown, /<path>/);
  assert.equal(blueprint.json.delta_since, null);
});
