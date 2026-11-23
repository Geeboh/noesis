import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { openStore } from "./store.mjs";

const ARCHIVE_VERSION = "0.1.0";
const RESTORABLE_TABLES = Object.freeze(["scopes", "resources", "resource_aliases", "resource_snapshots", "resource_states", "sources", "records", "record_revisions", "events", "processing_jobs", "idempotency_receipts", "lineage_edges", "chronicle_events", "preferences", "activation_states", "forgetments", "lore_pages"]);
const RESTORE_ORDER = ["scopes", "resources", "resource_aliases", "resource_snapshots", "resource_states", "sources", "records", "record_revisions", "events", "processing_jobs", "idempotency_receipts", "lineage_edges", "chronicle_events", "preferences", "activation_states", "forgetments", "lore_pages"];

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function createArchive({ schema_version = ARCHIVE_VERSION, records = [], resources = [], lineage = [], omitted = [], tables = null }) {
  const payload = { schema_version, archive_version: ARCHIVE_VERSION, records, resources, lineage, coverage: { records: records.length, resources: resources.length }, omitted, ...(tables ? { tables } : {}) };
  const manifest = { algorithm: "sha256", payload_digest: digest(payload), record_count: records.length, resource_count: resources.length, table_counts: tables ? Object.fromEntries(Object.entries(tables).map(([name, rows]) => [name, rows.length])) : {} };
  return Buffer.from(JSON.stringify({ manifest, payload }));
}

export function createStoreArchive(store, { omitted = ["external_copies"] } = {}) {
  const tables = Object.fromEntries(RESTORABLE_TABLES.map((table) => [table, store.db.prepare(`SELECT * FROM ${table}`).all()]));
  return createArchive({ tables, records: tables.records, resources: tables.resources, lineage: tables.lineage_edges, omitted });
}

export function verifyArchive(buffer) {
  const archive = JSON.parse(Buffer.from(buffer).toString("utf8"));
  if (!archive.manifest || !archive.payload || archive.manifest.payload_digest !== digest(archive.payload)) throw new Error("archive integrity check failed");
  if (archive.payload.archive_version !== ARCHIVE_VERSION) throw new Error("archive version is unsupported");
  return archive;
}

export function restoreArchive(buffer) {
  const archive = verifyArchive(buffer);
  return { ...archive.payload, restored: true, integrity: archive.manifest };
}

export function restoreStoreArchive(buffer, destination) {
  if (existsSync(destination)) throw new Error("restore destination must be absent");
  const archive = verifyArchive(buffer);
  const tables = archive.payload.tables;
  if (!tables || Object.keys(tables).some((table) => !RESTORABLE_TABLES.includes(table))) throw new Error("archive tables are unsupported");
  const store = openStore(destination);
  try {
    store.db.exec("BEGIN IMMEDIATE");
    for (const table of RESTORE_ORDER) {
      const rows = tables[table] ?? [];
      for (const row of rows) {
        const columns = Object.keys(row);
        const names = columns.map((column) => `"${column.replaceAll('"', '""')}"`).join(", ");
        const placeholders = columns.map(() => "?").join(", ");
        store.db.prepare(`INSERT INTO ${table} (${names}) VALUES (${placeholders})`).run(...columns.map((column) => row[column]));
      }
    }
    store.db.exec("COMMIT");
    return { destination, schema_version: archive.payload.schema_version, coverage: archive.manifest.table_counts, omitted: archive.payload.omitted };
  } catch (error) {
    try { store.db.exec("ROLLBACK"); } catch {}
    store.close();
    throw error;
  }
}
