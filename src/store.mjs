import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const STORE_SCHEMA_VERSION = 3;

const MIGRATIONS = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS scopes (
        scope_id TEXT PRIMARY KEY,
        owner_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        project_id TEXT,
        session_id TEXT,
        task_id TEXT,
        grants_json TEXT NOT NULL DEFAULT '{}'
      ) STRICT;
      CREATE TABLE IF NOT EXISTS records (
        record_id TEXT PRIMARY KEY,
        record_type TEXT NOT NULL,
        current_revision INTEGER NOT NULL,
        scope_id TEXT NOT NULL REFERENCES scopes(scope_id),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        provenance_json TEXT NOT NULL,
        lifecycle_json TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS record_revisions (
        record_id TEXT NOT NULL REFERENCES records(record_id),
        revision INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        provenance_json TEXT NOT NULL,
        lifecycle_json TEXT NOT NULL,
        PRIMARY KEY (record_id, revision)
      ) STRICT;
      CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        request_id TEXT NOT NULL,
        correlation_id TEXT,
        causation_id TEXT,
        actor_id TEXT NOT NULL,
        observed_at TEXT NOT NULL,
        object_revision INTEGER,
        scope_id TEXT NOT NULL REFERENCES scopes(scope_id),
        idempotency_key TEXT,
        payload_json TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS sources (
        source_id TEXT PRIMARY KEY,
        scope_id TEXT NOT NULL REFERENCES scopes(scope_id),
        locator TEXT NOT NULL,
        digest TEXT,
        captured_at TEXT NOT NULL,
        status TEXT NOT NULL,
        snapshot_json TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS idempotency_receipts (
        producer_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        request_digest TEXT NOT NULL,
        response_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        PRIMARY KEY (producer_id, operation, idempotency_key)
      ) STRICT;
      CREATE TABLE IF NOT EXISTS processing_jobs (
        job_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        state TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        checkpoint_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS records_scope_updated ON records(scope_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS events_scope_observed ON events(scope_id, observed_at DESC);
      CREATE INDEX IF NOT EXISTS sources_scope_captured ON sources(scope_id, captured_at DESC);
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE IF NOT EXISTS resources (
        resource_id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        origin_facet TEXT NOT NULL,
        display_name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        scope_id TEXT NOT NULL REFERENCES scopes(scope_id),
        metadata_json TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS resource_aliases (
        resource_id TEXT NOT NULL REFERENCES resources(resource_id),
        alias TEXT NOT NULL,
        alias_kind TEXT NOT NULL,
        PRIMARY KEY (resource_id, alias)
      ) STRICT;
      CREATE TABLE IF NOT EXISTS resource_snapshots (
        snapshot_id TEXT PRIMARY KEY,
        resource_id TEXT NOT NULL REFERENCES resources(resource_id),
        locator TEXT NOT NULL,
        version TEXT,
        digest TEXT,
        retrieved_at TEXT NOT NULL,
        status TEXT NOT NULL,
        content_json TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS resource_states (
        resource_id TEXT NOT NULL REFERENCES resources(resource_id),
        state_kind TEXT NOT NULL,
        state TEXT NOT NULL,
        evidence_refs_json TEXT NOT NULL,
        observed_at TEXT NOT NULL,
        PRIMARY KEY (resource_id, state_kind)
      ) STRICT;
      CREATE TABLE IF NOT EXISTS lineage_edges (
        edge_id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        from_revision INTEGER,
        to_id TEXT NOT NULL,
        to_revision INTEGER,
        edge_kind TEXT NOT NULL,
        created_at TEXT NOT NULL,
        metadata_json TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS chronicle_events (
        chronicle_id TEXT PRIMARY KEY,
        subject_id TEXT NOT NULL,
        event_kind TEXT NOT NULL,
        observed_at TEXT NOT NULL,
        before_json TEXT,
        after_json TEXT,
        metadata_json TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS resource_alias_lookup ON resource_aliases(alias);
      CREATE INDEX IF NOT EXISTS resource_snapshot_history ON resource_snapshots(resource_id, retrieved_at DESC);
      CREATE INDEX IF NOT EXISTS chronicle_subject_time ON chronicle_events(subject_id, observed_at DESC);
    `,
  },
  {
    version: 3,
    sql: `
      CREATE TABLE IF NOT EXISTS preferences (
        preference_id TEXT PRIMARY KEY,
        scope_id TEXT NOT NULL REFERENCES scopes(scope_id),
        origin TEXT NOT NULL,
        statement TEXT NOT NULL,
        context_json TEXT NOT NULL,
        support_contexts_json TEXT NOT NULL,
        counterevidence_json TEXT NOT NULL,
        state TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS activation_states (
        record_id TEXT PRIMARY KEY,
        score REAL NOT NULL,
        anchor_score REAL NOT NULL,
        anchor_at TEXT NOT NULL,
        opportunities INTEGER NOT NULL,
        last_evaluated_at TEXT,
        protected_minimum REAL NOT NULL,
        policy_version TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS forgetments (
        forgetment_id TEXT PRIMARY KEY,
        target_id TEXT NOT NULL,
        scope_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        affected_ids_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      ) STRICT;
    `,
  },
];

export function migrate(db) {
  db.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL) STRICT;");
  for (const migration of MIGRATIONS) {
    const applied = db.prepare("SELECT 1 AS present FROM schema_migrations WHERE version = ?").get(migration.version);
    if (applied) continue;
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(migration.sql);
      db.prepare("INSERT INTO schema_migrations(version, applied_at) VALUES (?, ?)").run(migration.version, new Date().toISOString());
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  const current = db.prepare("SELECT max(version) AS version FROM schema_migrations").get().version ?? 0;
  if (current !== STORE_SCHEMA_VERSION) throw new Error(`unsupported store schema: ${current}`);
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function digest(value) {
  return Buffer.from(stableJson(value)).toString("base64url");
}

function lifecycle(record) {
  return {
    activation: record.activation,
    confidence: record.confidence,
    validity: record.validity,
    retention: record.retention,
    adoption: record.adoption,
  };
}

function parseRecord(row, scope) {
  const state = JSON.parse(row.lifecycle_json);
  return {
    schema_version: row.schema_version,
    record_id: row.record_id,
    revision: row.current_revision,
    record_type: row.record_type,
    created_at: row.created_at,
    updated_at: row.updated_at,
    scope,
    provenance: JSON.parse(row.provenance_json),
    ...state,
    payload: JSON.parse(row.payload_json),
  };
}

class LedgerError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export { LedgerError };

export function openStore(filename) {
  mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  migrate(db);
  return {
    db,
    capture({ producer_id, operation, idempotency_key, request, record, event, source = null, now = new Date().toISOString() }) {
      const request_digest = digest(request);
      db.exec("BEGIN IMMEDIATE");
      try {
        const prior = db.prepare("SELECT request_digest, response_json FROM idempotency_receipts WHERE producer_id = ? AND operation = ? AND idempotency_key = ?").get(producer_id, operation, idempotency_key);
        if (prior) {
          if (prior.request_digest !== request_digest) throw new LedgerError("IDEMPOTENCY_CONFLICT", "idempotency key reused with different request");
          db.exec("COMMIT");
          return { duplicate: true, receipt: JSON.parse(prior.response_json) };
        }
        db.prepare("INSERT OR IGNORE INTO scopes(scope_id, owner_id, kind, project_id, session_id, task_id) VALUES (?, ?, ?, ?, ?, ?)").run(record.scope.scope_id, record.scope.owner_id, record.scope.kind, record.scope.project_id, record.scope.session_id, record.scope.task_id);
        const state = JSON.stringify(lifecycle(record));
        const provenance_json = JSON.stringify(record.provenance);
        const payload_json = JSON.stringify(record.payload);
        db.prepare("INSERT INTO records(record_id, record_type, current_revision, scope_id, created_at, updated_at, payload_json, provenance_json, lifecycle_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(record.record_id, record.record_type, record.revision, record.scope.scope_id, record.created_at, record.updated_at, payload_json, provenance_json, state);
        db.prepare("INSERT INTO record_revisions(record_id, revision, updated_at, payload_json, provenance_json, lifecycle_json) VALUES (?, ?, ?, ?, ?, ?)").run(record.record_id, record.revision, record.updated_at, payload_json, provenance_json, state);
        db.prepare("INSERT INTO events(event_id, event_type, request_id, correlation_id, causation_id, actor_id, observed_at, object_revision, scope_id, idempotency_key, payload_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(event.event_id, event.event_type, event.request_id, event.correlation_id, event.causation_id, event.actor_id, event.observed_at, event.object_revision, event.scope.scope_id, idempotency_key, JSON.stringify(event.payload));
        if (source) {
          db.prepare("INSERT INTO sources(source_id, scope_id, locator, digest, captured_at, status, snapshot_json) VALUES (?, ?, ?, ?, ?, ?, ?)").run(source.source_id, source.scope_id, source.locator, source.digest, source.captured_at, source.status, JSON.stringify(source.snapshot));
        }
        const receipt = { record_id: record.record_id, revision: record.revision, event_id: event.event_id, source_id: source?.source_id ?? null };
        db.prepare("INSERT INTO idempotency_receipts(producer_id, operation, idempotency_key, request_digest, response_json, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(producer_id, operation, idempotency_key, request_digest, JSON.stringify(receipt), now);
        db.exec("COMMIT");
        return { duplicate: false, receipt };
      } catch (error) {
        try { db.exec("ROLLBACK"); } catch {}
        throw error;
      }
    },
    getRecord(record_id) {
      const row = db.prepare("SELECT '0.1.0' AS schema_version, * FROM records WHERE record_id = ?").get(record_id);
      if (!row) return null;
      const scope = db.prepare("SELECT scope_id, owner_id, kind, project_id, session_id, task_id FROM scopes WHERE scope_id = ?").get(row.scope_id);
      return parseRecord(row, scope);
    },
  getRecordRevision(record_id, revision) {
    const base = db.prepare("SELECT '0.1.0' AS schema_version, * FROM records WHERE record_id = ?").get(record_id);
    const saved = db.prepare("SELECT revision, updated_at, payload_json, provenance_json, lifecycle_json FROM record_revisions WHERE record_id = ? AND revision = ?").get(record_id, revision);
    if (!base || !saved) return null;
    const scope = db.prepare("SELECT scope_id, owner_id, kind, project_id, session_id, task_id FROM scopes WHERE scope_id = ?").get(base.scope_id);
    return parseRecord({ ...base, current_revision: saved.revision, updated_at: saved.updated_at, payload_json: saved.payload_json, provenance_json: saved.provenance_json, lifecycle_json: saved.lifecycle_json }, scope);
  },
  getRecordHistory(record_id) {
    const base = db.prepare("SELECT '0.1.0' AS schema_version, * FROM records WHERE record_id = ?").get(record_id);
    if (!base) return [];
    const scope = db.prepare("SELECT scope_id, owner_id, kind, project_id, session_id, task_id FROM scopes WHERE scope_id = ?").get(base.scope_id);
    return db.prepare("SELECT revision, updated_at, payload_json, provenance_json, lifecycle_json FROM record_revisions WHERE record_id = ? ORDER BY revision").all(record_id).map((saved) => parseRecord({ ...base, current_revision: saved.revision, updated_at: saved.updated_at, payload_json: saved.payload_json, provenance_json: saved.provenance_json, lifecycle_json: saved.lifecycle_json }, scope));
  },
  getSource(source_id) {
    const row = db.prepare("SELECT source_id, scope_id, locator, digest, captured_at, status, snapshot_json FROM sources WHERE source_id = ?").get(source_id);
    if (!row) return null;
    return { ...row, snapshot: JSON.parse(row.snapshot_json) };
  },
  createProcessingJob({ job_id, kind, payload = {}, checkpoint = {}, now = new Date().toISOString(), producer_id = null, operation = "job", idempotency_key = null, request = null }) {
    db.exec("BEGIN IMMEDIATE");
    try {
      if (producer_id && idempotency_key) {
        const request_digest = digest(request ?? { job_id, kind, payload, checkpoint });
        const prior = db.prepare("SELECT request_digest, response_json FROM idempotency_receipts WHERE producer_id = ? AND operation = ? AND idempotency_key = ?").get(producer_id, operation, idempotency_key);
        if (prior) {
          if (prior.request_digest !== request_digest) throw new LedgerError("IDEMPOTENCY_CONFLICT", "idempotency key reused with different request");
          db.exec("COMMIT");
          const receipt = JSON.parse(prior.response_json);
          return { ...this.getProcessingJob(receipt.job_id), duplicate: true, receipt };
        }
        db.prepare("INSERT INTO processing_jobs(job_id, kind, state, payload_json, checkpoint_json, created_at, updated_at) VALUES (?, ?, 'pending', ?, ?, ?, ?)").run(job_id, kind, JSON.stringify(payload), JSON.stringify(checkpoint), now, now);
        const receipt = { job_id };
        db.prepare("INSERT INTO idempotency_receipts(producer_id, operation, idempotency_key, request_digest, response_json, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(producer_id, operation, idempotency_key, request_digest, JSON.stringify(receipt), now);
        db.exec("COMMIT");
        return { ...this.getProcessingJob(job_id), duplicate: false, receipt };
      }
      db.prepare("INSERT INTO processing_jobs(job_id, kind, state, payload_json, checkpoint_json, created_at, updated_at) VALUES (?, ?, 'pending', ?, ?, ?, ?)").run(job_id, kind, JSON.stringify(payload), JSON.stringify(checkpoint), now, now);
      db.exec("COMMIT");
      return this.getProcessingJob(job_id);
    } catch (error) {
      try { db.exec("ROLLBACK"); } catch {}
      throw error;
    }
  },
  updateProcessingJob(job_id, state, { payload, checkpoint, now = new Date().toISOString() } = {}) {
    const current = this.getProcessingJob(job_id);
    if (!current) return null;
    db.prepare("UPDATE processing_jobs SET state = ?, payload_json = ?, checkpoint_json = ?, updated_at = ? WHERE job_id = ?").run(state, JSON.stringify(payload ?? current.payload), JSON.stringify(checkpoint ?? current.checkpoint), now, job_id);
    return this.getProcessingJob(job_id);
  },
  getProcessingJob(job_id) {
    const row = db.prepare("SELECT job_id, kind, state, payload_json, checkpoint_json, created_at, updated_at FROM processing_jobs WHERE job_id = ?").get(job_id);
    if (!row) return null;
    return { ...row, payload: JSON.parse(row.payload_json), checkpoint: JSON.parse(row.checkpoint_json) };
  },
  listRecords() {
    const rows = db.prepare("SELECT '0.1.0' AS schema_version, * FROM records ORDER BY updated_at DESC").all();
    return rows.map((row) => {
      const scope = db.prepare("SELECT scope_id, owner_id, kind, project_id, session_id, task_id FROM scopes WHERE scope_id = ?").get(row.scope_id);
      return parseRecord(row, scope);
    });
  },
  createResource({ resource_id, kind, origin_facet, display_name, description = null, scope, metadata = {}, aliases = [], now = new Date().toISOString() }) {
    db.prepare("INSERT OR IGNORE INTO scopes(scope_id, owner_id, kind, project_id, session_id, task_id) VALUES (?, ?, ?, ?, ?, ?)").run(scope.scope_id, scope.owner_id, scope.kind, scope.project_id, scope.session_id, scope.task_id);
    db.prepare("INSERT INTO resources(resource_id, kind, origin_facet, display_name, description, created_at, updated_at, scope_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(resource_id, kind, origin_facet, display_name, description, now, now, scope.scope_id, JSON.stringify(metadata));
    for (const alias of aliases) db.prepare("INSERT INTO resource_aliases(resource_id, alias, alias_kind) VALUES (?, ?, ?)").run(resource_id, alias.value, alias.kind);
    return this.getResource(resource_id);
  },
  findResourceByAlias(alias) {
    const row = db.prepare("SELECT resource_id FROM resource_aliases WHERE alias = ? ORDER BY resource_id LIMIT 1").get(alias);
    return row ? this.getResource(row.resource_id) : null;
  },
  updateResource({ resource_id, display_name, description = null, metadata = {}, aliases = [], now = new Date().toISOString() }) {
    const current = this.getResource(resource_id);
    if (!current) return null;
    db.exec("BEGIN IMMEDIATE");
    try {
      db.prepare("UPDATE resources SET display_name = ?, description = ?, updated_at = ?, metadata_json = ? WHERE resource_id = ?").run(display_name, description, now, JSON.stringify(metadata), resource_id);
      for (const alias of aliases) db.prepare("INSERT OR IGNORE INTO resource_aliases(resource_id, alias, alias_kind) VALUES (?, ?, ?)").run(resource_id, alias.value, alias.kind);
      db.exec("COMMIT");
    } catch (error) {
      try { db.exec("ROLLBACK"); } catch {}
      throw error;
    }
    return this.getResource(resource_id);
  },
  addResourceSnapshot({ snapshot_id, resource_id, locator, version = null, digest = null, retrieved_at = new Date().toISOString(), status = "observed", content = {} }) {
    db.prepare("INSERT OR IGNORE INTO resource_snapshots(snapshot_id, resource_id, locator, version, digest, retrieved_at, status, content_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(snapshot_id, resource_id, locator, version, digest, retrieved_at, status, JSON.stringify(content));
    return this.getResource(resource_id);
  },
  setResourceState({ resource_id, state_kind, state, evidence_refs = [], observed_at = new Date().toISOString() }) {
    db.prepare("INSERT INTO resource_states(resource_id, state_kind, state, evidence_refs_json, observed_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(resource_id, state_kind) DO UPDATE SET state=excluded.state, evidence_refs_json=excluded.evidence_refs_json, observed_at=excluded.observed_at").run(resource_id, state_kind, state, JSON.stringify(evidence_refs), observed_at);
    return this.getResource(resource_id);
  },
  getResource(resource_id) {
    const row = db.prepare("SELECT resource_id, kind, origin_facet, display_name, description, created_at, updated_at, scope_id, metadata_json FROM resources WHERE resource_id = ?").get(resource_id);
    if (!row) return null;
    const scope = db.prepare("SELECT scope_id, owner_id, kind, project_id, session_id, task_id FROM scopes WHERE scope_id = ?").get(row.scope_id);
    return {
      ...row,
      scope,
      metadata: JSON.parse(row.metadata_json),
      aliases: db.prepare("SELECT alias, alias_kind FROM resource_aliases WHERE resource_id = ?").all(resource_id),
      snapshots: db.prepare("SELECT snapshot_id, locator, version, digest, retrieved_at, status, content_json FROM resource_snapshots WHERE resource_id = ? ORDER BY retrieved_at DESC").all(resource_id).map((snapshot) => ({ ...snapshot, content: JSON.parse(snapshot.content_json) })),
      states: db.prepare("SELECT state_kind, state, evidence_refs_json, observed_at FROM resource_states WHERE resource_id = ?").all(resource_id).map((state) => ({ ...state, evidence_refs: JSON.parse(state.evidence_refs_json) })),
    };
  },
  listResources(scope_ids = []) {
    const rows = db.prepare("SELECT resource_id FROM resources ORDER BY updated_at DESC").all();
    return rows.map((row) => this.getResource(row.resource_id)).filter((resource) => !scope_ids.length || scope_ids.includes(resource.scope.scope_id));
  },
  addLineageEdge({ edge_id, from_id, from_revision = null, to_id, to_revision = null, edge_kind, metadata = {}, created_at = new Date().toISOString() }) {
    db.prepare("INSERT OR IGNORE INTO lineage_edges(edge_id, from_id, from_revision, to_id, to_revision, edge_kind, created_at, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(edge_id, from_id, from_revision, to_id, to_revision, edge_kind, created_at, JSON.stringify(metadata));
    return { edge_id, from_id, from_revision, to_id, to_revision, edge_kind, created_at, metadata };
  },
  listLineage(id) {
    return db.prepare("SELECT edge_id, from_id, from_revision, to_id, to_revision, edge_kind, created_at, metadata_json FROM lineage_edges WHERE from_id = ? OR to_id = ? ORDER BY created_at").all(id, id).map((edge) => ({ ...edge, metadata: JSON.parse(edge.metadata_json) }));
  },
  addChronicleEvent({ chronicle_id, subject_id, event_kind, observed_at = new Date().toISOString(), before = null, after = null, metadata = {} }) {
    db.prepare("INSERT OR IGNORE INTO chronicle_events(chronicle_id, subject_id, event_kind, observed_at, before_json, after_json, metadata_json) VALUES (?, ?, ?, ?, ?, ?, ?)").run(chronicle_id, subject_id, event_kind, observed_at, before === null ? null : JSON.stringify(before), after === null ? null : JSON.stringify(after), JSON.stringify(metadata));
    return { chronicle_id, subject_id, event_kind, observed_at, before, after, metadata };
  },
  listChronicle(subject_id) {
    return db.prepare("SELECT chronicle_id, subject_id, event_kind, observed_at, before_json, after_json, metadata_json FROM chronicle_events WHERE subject_id = ? ORDER BY observed_at").all(subject_id).map((event) => ({ ...event, before: event.before_json ? JSON.parse(event.before_json) : null, after: event.after_json ? JSON.parse(event.after_json) : null, metadata: JSON.parse(event.metadata_json) }));
  },
  createPreference({ preference_id, scope_id, origin, statement, context = {}, support_contexts = [], counterevidence = [], state = "candidate", now = new Date().toISOString() }) {
    db.prepare("INSERT OR IGNORE INTO scopes(scope_id, owner_id, kind) VALUES (?, 'local', 'project')").run(scope_id);
    db.prepare("INSERT INTO preferences(preference_id, scope_id, origin, statement, context_json, support_contexts_json, counterevidence_json, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(preference_id, scope_id, origin, statement, JSON.stringify(context), JSON.stringify(support_contexts), JSON.stringify(counterevidence), state, now, now);
    return this.getPreference(preference_id);
  },
  getPreference(preference_id) {
    const row = db.prepare("SELECT preference_id, scope_id, origin, statement, context_json, support_contexts_json, counterevidence_json, state, created_at, updated_at FROM preferences WHERE preference_id = ?").get(preference_id);
    if (!row) return null;
    return { ...row, context: JSON.parse(row.context_json), support_contexts: JSON.parse(row.support_contexts_json), counterevidence: JSON.parse(row.counterevidence_json) };
  },
  updatePreference(preference_id, changes, now = new Date().toISOString()) {
    const current = this.getPreference(preference_id);
    if (!current) return null;
    const next = { ...current, ...changes, updated_at: now };
    db.prepare("UPDATE preferences SET origin=?, statement=?, context_json=?, support_contexts_json=?, counterevidence_json=?, state=?, updated_at=? WHERE preference_id=?").run(next.origin, next.statement, JSON.stringify(next.context), JSON.stringify(next.support_contexts), JSON.stringify(next.counterevidence), next.state, now, preference_id);
    return this.getPreference(preference_id);
  },
  createActivation({ record_id, score = 1, anchor_score = score, anchor_at = new Date().toISOString(), opportunities = 0, protected_minimum = 0, policy_version = "ebb-0" }) {
    db.prepare("INSERT INTO activation_states(record_id, score, anchor_score, anchor_at, opportunities, last_evaluated_at, protected_minimum, policy_version) VALUES (?, ?, ?, ?, ?, NULL, ?, ?) ON CONFLICT(record_id) DO UPDATE SET score=excluded.score, anchor_score=excluded.anchor_score, anchor_at=excluded.anchor_at, opportunities=excluded.opportunities, protected_minimum=excluded.protected_minimum, policy_version=excluded.policy_version").run(record_id, score, anchor_score, anchor_at, opportunities, protected_minimum, policy_version);
    return this.getActivation(record_id);
  },
  getActivation(record_id) {
    return db.prepare("SELECT record_id, score, anchor_score, anchor_at, opportunities, last_evaluated_at, protected_minimum, policy_version FROM activation_states WHERE record_id = ?").get(record_id) ?? null;
  },
  updateActivation(record_id, state) {
    db.prepare("UPDATE activation_states SET score=?, opportunities=?, last_evaluated_at=? WHERE record_id=?").run(state.score, state.opportunities, state.last_evaluated_at, record_id);
    return this.getActivation(record_id);
  },
  createForgetment({ forgetment_id, target_id, scope_id, reason, affected_ids = [], created_at = new Date().toISOString() }) {
    db.prepare("INSERT INTO forgetments(forgetment_id, target_id, scope_id, reason, affected_ids_json, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(forgetment_id, target_id, scope_id, reason, JSON.stringify(affected_ids), created_at);
    return { forgetment_id, target_id, scope_id, reason, affected_ids, created_at };
  },
    close() {
      db.close();
    },
  };
}
