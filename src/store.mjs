import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const STORE_SCHEMA_VERSION = 1;

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
    close() {
      db.close();
    },
  };
}
