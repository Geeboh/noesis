import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openStore, STORE_SCHEMA_VERSION } from "../src/store.mjs";

test("store migration is durable and idempotent across reopen", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-store-"));
  const filename = join(directory, "mind.sqlite");
  const first = openStore(filename);
  assert.equal(first.db.prepare("SELECT max(version) AS version FROM schema_migrations").get().version, STORE_SCHEMA_VERSION);
  first.db.prepare("INSERT INTO scopes(scope_id, owner_id, kind) VALUES (?, ?, ?)").run("scope-1", "operator", "project");
  first.close();

  const second = openStore(filename);
  const row = second.db.prepare("SELECT scope_id, owner_id FROM scopes").get();
  assert.equal(row.scope_id, "scope-1");
  assert.equal(row.owner_id, "operator");
  assert.equal(second.db.prepare("SELECT count(*) AS count FROM schema_migrations").get().count, 2);
  second.close();
  rmSync(directory, { recursive: true, force: true });
});
