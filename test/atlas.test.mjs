import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAtlas } from "../src/atlas.mjs";
import { openStore } from "../src/store.mjs";

const scope = { scope_id: "atlas-project", owner_id: "operator", kind: "project", project_id: "project-a", session_id: null, task_id: null };

test("Atlas preserves aliases, snapshots, independent evidence states, and lineage history", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-atlas-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const atlas = createAtlas(store);
  const principal = { owner_id: "operator", scope_ids: [] };
  const resource = atlas.register({ principal, resource: { resource_id: "resource-plugin", kind: "plugin", origin_facet: "mixed", display_name: "Example Plugin", scope, aliases: [{ value: "https://example.test/plugin", kind: "url" }], metadata: { version: "1.0.0" } } });
  atlas.snapshot({ principal, resource_id: resource.resource_id, snapshot: { snapshot_id: "snapshot-1", locator: "https://example.test/plugin", version: "1.0.0", digest: "digest-1", status: "examined", content: { title: "Example" } } });
  atlas.setState({ principal, resource_id: resource.resource_id, state_kind: "referenced", state: "true", evidence_refs: ["note-1"] });
  atlas.setState({ principal, resource_id: resource.resource_id, state_kind: "used", state: "false", evidence_refs: ["outcome-1"] });
  store.addLineageEdge({ edge_id: "edge-1", from_id: "note-1", to_id: resource.resource_id, edge_kind: "references" });
  store.addChronicleEvent({ chronicle_id: "chronicle-1", subject_id: resource.resource_id, event_kind: "snapshot_added", after: { version: "1.0.0" } });
  const inspected = atlas.inspect({ principal, resource_id: resource.resource_id });
  assert.equal(inspected.aliases[0].alias, "https://example.test/plugin");
  assert.equal(inspected.snapshots[0].digest, "digest-1");
  assert.equal(inspected.states.find((state) => state.state_kind === "referenced").evidence_refs[0], "note-1");
  assert.equal(atlas.trace({ principal, id: resource.resource_id }).edges[0].edge_kind, "references");
  assert.equal(atlas.trace({ principal, id: resource.resource_id }).chronicle[0].event_kind, "snapshot_added");
  assert.throws(() => atlas.inspect({ principal: { owner_id: "other", scope_ids: [] }, resource_id: resource.resource_id }), /not available/);
  store.close();
  rmSync(directory, { recursive: true, force: true });
});
