import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { backupDatabase, health, restoreDatabase } from "../src/operations.mjs";
import { openStore } from "../src/store.mjs";

test("M8 backup and restore preserve the migrated store", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-ops-"));
  const source = join(directory, "source", "mind.sqlite");
  const backup = join(directory, "backup", "mind.sqlite");
  const restored = join(directory, "restored", "mind.sqlite");
  const store = openStore(source);
  assert.equal(health(store).schema_version, 4);
  store.close();
  const result = backupDatabase(source, backup);
  assert.equal(result.bytes > 0, true);
  const restoredResult = restoreDatabase(backup, restored);
  assert.equal(restoredResult.schema_version, 4);
  rmSync(directory, { recursive: true, force: true });
});
