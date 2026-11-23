import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { openStore, STORE_SCHEMA_VERSION } from "./store.mjs";

function sqlPath(path) {
  return `'${path.replaceAll("'", "''")}'`;
}

export function health(store) {
  return {
    schema_version: store.db.prepare("SELECT max(version) AS version FROM schema_migrations").get().version,
    records: store.db.prepare("SELECT count(*) AS count FROM records").get().count,
    resources: store.db.prepare("SELECT count(*) AS count FROM resources").get().count,
    jobs: store.db.prepare("SELECT count(*) AS count FROM processing_jobs").get().count,
    capabilities: ["ledger", "atlas", "snooze", "reverie", "observatory", "archive"],
  };
}

export function backupDatabase(filename, destination) {
  mkdirSync(dirname(destination), { recursive: true });
  const db = new DatabaseSync(filename);
  try {
    db.exec(`VACUUM INTO ${sqlPath(destination)}`);
  } finally {
    db.close();
  }
  const bytes = statSync(destination).size;
  const digest = createHash("sha256").update(readFileSync(destination)).digest("hex");
  return { destination, bytes, digest };
}


export function restoreDatabase(backup, destination) {
  const probe = openStore(backup);
  const schema_version = probe.db.prepare("SELECT max(version) AS version FROM schema_migrations").get().version;
  probe.close();
  if (schema_version !== STORE_SCHEMA_VERSION) throw new Error("backup schema version is unsupported");
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(backup, destination);
  const restored = openStore(destination);
  const result = { destination, schema_version: restored.db.prepare("SELECT max(version) AS version FROM schema_migrations").get().version };
  restored.close();
  return result;
}
