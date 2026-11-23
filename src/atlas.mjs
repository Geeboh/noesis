import { randomUUID } from "node:crypto";
import { LedgerError } from "./store.mjs";
import { scopeAllows } from "./service-contracts.mjs";

const STATES = new Set(["referenced", "examined", "available", "installed", "used", "evaluated"]);

export function createAtlas(store) {
  return {
    register({ principal, resource }) {
      if (!scopeAllows(principal, resource.scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource scope is not available");
      return store.createResource({ ...resource, resource_id: resource.resource_id ?? randomUUID() });
    },
    list({ principal }) {
      return store.listResources().filter((resource) => scopeAllows(principal, resource.scope));
    },
    snapshot({ principal, resource_id, snapshot }) {
      const resource = store.getResource(resource_id);
      if (!resource || !scopeAllows(principal, resource.scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      return store.addResourceSnapshot({ ...snapshot, resource_id });
    },
    setState({ principal, resource_id, state_kind, state, evidence_refs }) {
      const resource = store.getResource(resource_id);
      if (!resource || !scopeAllows(principal, resource.scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      if (!STATES.has(state_kind)) throw new LedgerError("INVALID_ARGUMENT", "unknown resource evidence state");
      return store.setResourceState({ resource_id, state_kind, state, evidence_refs });
    },
    inspect({ principal, resource_id }) {
      const resource = store.getResource(resource_id);
      if (!resource || !scopeAllows(principal, resource.scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      return resource;
    },
    trace({ principal, id }) {
      const resource = store.getResource(id);
      if (resource && !scopeAllows(principal, resource.scope)) throw new LedgerError("NOT_FOUND_OR_FORBIDDEN", "resource is not available");
      return { resource, edges: store.listLineage(id), chronicle: store.listChronicle(id) };
    },
  };
}
