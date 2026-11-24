import { createHash, randomUUID } from "node:crypto";
import { LedgerError } from "./store.mjs";
import { scopeAllows } from "./service-contracts.mjs";

const STATES = new Set(["referenced", "examined", "available", "installed", "used", "evaluated"]);

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 20);
}

function authorized(principal, scope, message) {
  if (!scopeAllows(principal, scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", message);
}
const MAX_REFRESH_BYTES = 65_536;

function refreshUrl(resource) {
 const alias = resource.aliases.find((candidate) => candidate.alias_kind === "url" && candidate.alias);
 if (!alias) throw new LedgerError("INVALID_ARGUMENT", "resource has no URL alias");
 const url = new URL(alias.alias);
 const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
 const octets = hostname.split(".").map(Number);
 const privateIpv4 = octets.length === 4 && octets.every(Number.isInteger)
 && (octets[0] === 10 || octets[0] === 127 || (octets[0] === 169 && octets[1] === 254) || (octets[0] === 192 && octets[1] === 168) || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31));
 if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "::1" || privateIpv4) throw new LedgerError("INVALID_ARGUMENT", "resource URL is not a permitted public HTTP(S) URL");
 return url;
}

async function readRefreshBody(response) {
 const length = Number(response.headers.get("content-length"));
 if (Number.isFinite(length) && length > MAX_REFRESH_BYTES) throw new LedgerError("BUDGET_EXHAUSTED", "source body exceeds refresh limit");
 if (!response.body) return Buffer.from(await response.arrayBuffer());
 const reader = response.body.getReader();
 const chunks = [];
 let total = 0;
 while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  total += value.byteLength;
  if (total > MAX_REFRESH_BYTES) {
   await reader.cancel();
   throw new LedgerError("BUDGET_EXHAUSTED", "source body exceeds refresh limit");
  }
  chunks.push(Buffer.from(value));
 }
 return Buffer.concat(chunks, total);
}

export function createAtlas(store) {
  const atlas = {
    register({ principal, resource }) {
      authorized(principal, resource.scope, "resource scope is not available");
      const aliases = resource.aliases ?? [];
      const existingById = resource.resource_id ? store.getResource(resource.resource_id) : null;
      const existingByAlias = aliases.map((alias) => store.findResourceByAlias(alias.value)).find(Boolean) ?? null;
      if (existingById && existingByAlias && existingById.resource_id !== existingByAlias.resource_id) throw new LedgerError("IDEMPOTENCY_CONFLICT", "resource alias belongs to another resource");
      const existing = existingById ?? existingByAlias;
      if (!existing) {
        const created = store.createResource({ ...resource, aliases, resource_id: resource.resource_id ?? randomUUID() });
        store.addChronicleEvent({ chronicle_id: `resource:${created.resource_id}:registered`, subject_id: created.resource_id, event_kind: "resource_registered", after: { display_name: created.display_name } });
        return created;
      }
      authorized(principal, existing.scope, "resource scope is not available");
      const changed = existing.display_name !== resource.display_name
        || existing.description !== (resource.description ?? null)
        || JSON.stringify(existing.metadata) !== JSON.stringify(resource.metadata ?? {})
        || aliases.some((alias) => !existing.aliases.some((saved) => saved.alias === alias.value && saved.alias_kind === alias.kind));
      if (!changed) return existing;
      const updated = store.updateResource({
        resource_id: existing.resource_id,
        display_name: resource.display_name,
        description: resource.description ?? null,
        metadata: resource.metadata ?? {},
        aliases,
      });
      store.addChronicleEvent({
        chronicle_id: `resource:${updated.resource_id}:updated:${digest({ display_name: updated.display_name, metadata: updated.metadata, aliases: updated.aliases })}`,
        subject_id: updated.resource_id,
        event_kind: "resource_updated",
        before: { display_name: existing.display_name, metadata: existing.metadata },
        after: { display_name: updated.display_name, metadata: updated.metadata },
      });
      return updated;
    },
    list({ principal, kind = null, origin_facet = null, limit = 100, offset = 0 }) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000 || !Number.isInteger(offset) || offset < 0) throw new LedgerError("INVALID_ARGUMENT", "invalid resource page");
      return store.listResources()
        .filter((resource) => scopeAllows(principal, resource.scope))
        .filter((resource) => !kind || resource.kind === kind)
        .filter((resource) => !origin_facet || resource.origin_facet === origin_facet)
        .slice(offset, offset + limit);
    },
    listPage({ principal, kind = null, origin_facet = null, limit = 100, offset = 0 }) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000 || !Number.isInteger(offset) || offset < 0) throw new LedgerError("INVALID_ARGUMENT", "invalid resource page");
      const all = store.listResources()
        .filter((resource) => scopeAllows(principal, resource.scope))
        .filter((resource) => !kind || resource.kind === kind)
        .filter((resource) => !origin_facet || resource.origin_facet === origin_facet);
      return { data: all.slice(offset, offset + limit), coverage: { offset, limit, total: all.length, returned: Math.min(limit, Math.max(0, all.length - offset)) } };
    },
    snapshot({ principal, resource_id, snapshot }) {
      const resource = store.getResource(resource_id);
      if (!resource) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      authorized(principal, resource.scope, "resource is not available");
      const next = { ...snapshot, snapshot_id: snapshot.snapshot_id ?? randomUUID() };
      const prior = resource.snapshots.find((saved) => saved.snapshot_id === next.snapshot_id);
      if (prior) {
        const normalizeSnapshot = (value, fallback = {}) => ({ snapshot_id: value.snapshot_id, locator: value.locator, version: value.version ?? null, digest: value.digest ?? null, retrieved_at: value.retrieved_at ?? fallback.retrieved_at ?? null, status: value.status ?? "observed", content: value.content ?? {} });
        if (JSON.stringify(normalizeSnapshot(prior)) !== JSON.stringify(normalizeSnapshot(next, prior))) throw new LedgerError("IDEMPOTENCY_CONFLICT", "snapshot id reused with different content");
        return resource;
      }
      const updated = store.addResourceSnapshot({ ...next, resource_id });
      store.addChronicleEvent({
        chronicle_id: `snapshot:${next.snapshot_id}`,
        subject_id: resource_id,
        event_kind: resource.snapshots.length ? "source_changed" : "snapshot_added",
        before: resource.snapshots[0] ? { snapshot_id: resource.snapshots[0].snapshot_id, digest: resource.snapshots[0].digest, version: resource.snapshots[0].version } : null,
        after: { snapshot_id: next.snapshot_id, digest: next.digest ?? null, version: next.version ?? null, status: next.status ?? "observed" },
      });
      if (resource.snapshots.length) {
        for (const state of resource.states) {
          if (["examined", "evaluated"].includes(state.state_kind) && state.state === "true") this.setState({ principal, resource_id, state_kind: state.state_kind, state: "stale", evidence_refs: state.evidence_refs });
        }
      }
      return updated;
    },
    async refresh({ principal, resource_id, fetchImpl = globalThis.fetch, retrieved_at = new Date().toISOString() }) {
      const resource = store.getResource(resource_id);
      if (!resource) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      authorized(principal, resource.scope, "resource is not available");
      const url = refreshUrl(resource);
      const response = await fetchImpl(url, { redirect: "manual" });
      if (response.status >= 300 && response.status < 400) throw new LedgerError("PROVIDER_UNAVAILABLE", "source redirects are not followed");
      if (!response.ok) throw new LedgerError("PROVIDER_UNAVAILABLE", `source returned HTTP ${response.status}`);
      const body = await readRefreshBody(response);
      return this.snapshot({
        principal,
        resource_id,
        snapshot: {
          locator: url.toString(),
          version: null,
          retrieved_at,
          digest: createHash("sha256").update(body).digest("hex"),
          status: "observed",
          content: { text: body.toString("utf8"), byte_length: body.byteLength, content_type: response.headers.get("content-type") },
        },
      });
    },
    setState({ principal, resource_id, state_kind, state, evidence_refs = [] }) {
      const resource = store.getResource(resource_id);
      if (!resource) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      authorized(principal, resource.scope, "resource is not available");
      if (!STATES.has(state_kind) || typeof state !== "string" || !state) throw new LedgerError("INVALID_ARGUMENT", "unknown resource evidence state");
      const prior = resource.states.find((saved) => saved.state_kind === state_kind);
      if (prior && prior.state === state && JSON.stringify(prior.evidence_refs) === JSON.stringify(evidence_refs)) return resource;
      const updated = store.setResourceState({ resource_id, state_kind, state, evidence_refs });
      store.addChronicleEvent({
        chronicle_id: `state:${resource_id}:${state_kind}:${digest({ state, evidence_refs })}`,
        subject_id: resource_id,
        event_kind: "resource_state_changed",
        before: prior ? { state_kind, state: prior.state, evidence_refs: prior.evidence_refs } : null,
        after: { state_kind, state, evidence_refs },
      });
      return updated;
    },
    attachRecord({ principal, record_id, resource_id, edge_kind = "observed_in", metadata = {} }) {
      const resource = store.getResource(resource_id);
      const record = store.getRecord(record_id);
      if (!resource || !record) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource or record is not available");
      authorized(principal, resource.scope, "resource is not available");
      authorized(principal, record.scope, "record is not available");
      if (resource.scope.scope_id !== record.scope.scope_id) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource or record is not available");
      return store.addLineageEdge({
        edge_id: `record-resource:${record_id}:${record.revision}:${resource_id}:${edge_kind}`,
        from_id: record_id,
        from_revision: record.revision,
        to_id: resource_id,
        edge_kind,
        metadata,
      });
    },
    inspect({ principal, resource_id }) {
      const resource = store.getResource(resource_id);
      if (!resource) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      authorized(principal, resource.scope, "resource is not available");
      return resource;
    },
    trace({ principal, id, limit = 100 }) {
      if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new LedgerError("INVALID_ARGUMENT", "invalid trace limit");
      const resource = store.getResource(id);
      const record = resource ? null : store.getRecord(id);
      if (resource) authorized(principal, resource.scope, "resource is not available");
      else if (record) authorized(principal, record.scope, "record is not available");
      const allChronicle = store.listChronicle(id);
      const edges = store.listLineage(id).filter((edge) => [edge.from_id, edge.to_id].every((endpoint) => {
        if (endpoint === id) return true;
        const endpointResource = store.getResource(endpoint);
        if (endpointResource) return scopeAllows(principal, endpointResource.scope);
        const endpointRecord = store.getRecord(endpoint);
        return !endpointRecord || scopeAllows(principal, endpointRecord.scope);
      })).slice(0, limit);
      return { resource, record, edges, chronicle: allChronicle.slice(0, limit), coverage: { limit, edges: edges.length, chronicle: Math.min(limit, allChronicle.length) } };
    },
  };
  return atlas;
}
