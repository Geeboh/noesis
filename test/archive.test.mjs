import test from "node:test";
import assert from "node:assert/strict";
import { createArchive, restoreArchive, verifyArchive } from "../src/archive.mjs";

test("native archive verifies integrity and restores identities and lineage", () => {
  const archive = createArchive({ records: [{ record_id: "record-1" }], resources: [{ resource_id: "resource-1" }], lineage: [{ from_id: "record-1", to_id: "resource-1" }], omitted: ["raw_blob"] });
  const verified = verifyArchive(archive);
  const restored = restoreArchive(archive);
  assert.equal(verified.manifest.record_count, 1);
  assert.equal(restored.lineage[0].from_id, "record-1");
  assert.deepEqual(restored.omitted, ["raw_blob"]);
  const tampered = Buffer.from(archive);
  tampered[tampered.length - 2] ^= 1;
  assert.throws(() => verifyArchive(tampered), /integrity check failed|JSON/);
});
