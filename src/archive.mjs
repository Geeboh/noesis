import { createHash } from "node:crypto";

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function createArchive({ schema_version = "0.1.0", records = [], resources = [], lineage = [], omitted = [] }) {
  const payload = { schema_version, records, resources, lineage, coverage: { records: records.length, resources: resources.length }, omitted };
  const manifest = { algorithm: "sha256", payload_digest: digest(payload), record_count: records.length, resource_count: resources.length };
  return Buffer.from(JSON.stringify({ manifest, payload }));
}

export function verifyArchive(buffer) {
  const archive = JSON.parse(Buffer.from(buffer).toString("utf8"));
  if (!archive.manifest || !archive.payload || archive.manifest.payload_digest !== digest(archive.payload)) throw new Error("archive integrity check failed");
  return archive;
}

export function restoreArchive(buffer) {
  const archive = verifyArchive(buffer);
  return { ...archive.payload, restored: true, integrity: archive.manifest };
}
