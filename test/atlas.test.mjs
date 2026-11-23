import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAtlas } from "../src/atlas.mjs";
import { openStore } from "../src/store.mjs";

const scope = { scope_id: "atlas-project", owner_id: "operator", kind: "project", project_id: "project-a", session_id: null, task_id: null };

test("Atlas preserves identity, aliases, snapshots, independent states, and history", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-atlas-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const atlas = createAtlas(store);
  const principal = { owner_id: "operator", scope_ids: [] };
  const resource = atlas.register({ principal, resource: { resource_id: "resource-plugin", kind: "plugin", origin_facet: "mixed", display_name: "Example Plugin", scope, aliases: [{ value: "https://example.test/plugin", kind: "url" }], metadata: { version: "1.0.0" } } });
  const renamed = atlas.register({ principal, resource: { kind: "plugin", origin_facet: "mixed", display_name: "Renamed Plugin", scope, aliases: [{ value: "https://example.test/plugin", kind: "url" }], metadata: { version: "1.0.0" } } });
  const distinct = atlas.register({ principal, resource: { kind: "plugin", origin_facet: "mixed", display_name: "Renamed Plugin", scope, aliases: [{ value: "https://example.test/other", kind: "url" }], metadata: { version: "1.0.0" } } });
  assert.equal(renamed.resource_id, resource.resource_id);
  assert.notEqual(distinct.resource_id, resource.resource_id);
  const versionOne = { snapshot_id: "snapshot-1", locator: "https://example.test/plugin", version: "1.0.0", retrieved_at: "2026-11-24T00:00:00.000Z", digest: "digest-1", status: "examined", content: { title: "Example" } };
  const versionTwo = { snapshot_id: "snapshot-2", locator: "https://example.test/plugin", version: "2.0.0", retrieved_at: "2026-11-24T00:01:00.000Z", digest: "digest-2", status: "examined", content: { title: "Changed" } };
  atlas.snapshot({ principal, resource_id: resource.resource_id, snapshot: versionOne });
  atlas.setState({ principal, resource_id: resource.resource_id, state_kind: "examined", state: "true", evidence_refs: ["snapshot-1"] });
  atlas.snapshot({ principal, resource_id: resource.resource_id, snapshot: versionTwo });
  atlas.snapshot({ principal, resource_id: resource.resource_id, snapshot: versionTwo });
  atlas.setState({ principal, resource_id: resource.resource_id, state_kind: "referenced", state: "true", evidence_refs: ["note-1"] });
  atlas.setState({ principal, resource_id: resource.resource_id, state_kind: "available", state: "true", evidence_refs: ["source-1"] });
  store.addLineageEdge({ edge_id: "edge-1", from_id: "note-1", to_id: resource.resource_id, edge_kind: "references" });
  const inspected = atlas.inspect({ principal, resource_id: resource.resource_id });
  const trace = atlas.trace({ principal, id: resource.resource_id });
  assert.equal(inspected.aliases[0].alias, "https://example.test/plugin");
  assert.deepEqual(inspected.snapshots.map((snapshot) => snapshot.digest).sort(), ["digest-1", "digest-2"]);
  assert.equal(inspected.states.find((state) => state.state_kind === "referenced").evidence_refs[0], "note-1");
  assert.equal(inspected.states.find((state) => state.state_kind === "examined").state, "stale");
  assert.equal(trace.edges[0].edge_kind, "references");
  assert.equal(trace.chronicle.some((event) => event.event_kind === "source_changed"), true);
  assert.equal(trace.chronicle.some((event) => event.event_kind === "resource_updated"), true);
  assert.throws(() => atlas.inspect({ principal: { owner_id: "other", scope_ids: [] }, resource_id: resource.resource_id }), /not available/);
  store.close();
  rmSync(directory, { recursive: true, force: true });
});

test("Atlas records unavailable source content without fabricating a snapshot", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-atlas-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const atlas = createAtlas(store);
  const principal = { owner_id: "operator", scope_ids: [] };
  const resource = atlas.register({ principal, resource: { resource_id: "resource-page", kind: "webpage", origin_facet: "external", display_name: "Example Page", scope, aliases: [{ value: "https://example.test/page", kind: "url" }], metadata: {} } });
  atlas.snapshot({ principal, resource_id: resource.resource_id, snapshot: { snapshot_id: "snapshot-unavailable", locator: "https://example.test/page", status: "unavailable", content: { reason: "timeout" } } });
  const snapshot = atlas.inspect({ principal, resource_id: resource.resource_id }).snapshots[0];
  assert.equal(snapshot.status, "unavailable");
  assert.deepEqual(snapshot.content, { reason: "timeout" });
  store.close();
  rmSync(directory, { recursive: true, force: true });
});
