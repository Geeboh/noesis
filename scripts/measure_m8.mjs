import { mkdtempSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { createStoreArchive, restoreStoreArchive } from "../src/archive.mjs";
import { openService } from "../src/service.mjs";

const directory = mkdtempSync(join(tmpdir(), "noesis-m8-measure-"));
const service = openService(join(directory, "mind.sqlite"));
const scope = { scope_id: "m8-scope", owner_id: "operator", kind: "project", project_id: "m8-project", session_id: null, task_id: null };
const principal = { owner_id: "operator", scope_ids: [] };
const samples = { recall_ms: [], archive_ms: [], restore_ms: [] };
let errors = 0;
try {
  for (let index = 0; index < 25; index += 1) service.mindNote({ principal, scope, content: `M8 representative record ${index}`, producer_id: "m8-measure", idempotency_key: `m8-note-${index}` });
  for (let run = 0; run < 5; run += 1) {
    try {
      let start = performance.now();
      const recall = service.mindRecall({ principal, scope_ids: [scope.scope_id], query: "representative", max_items: 8, max_chars: 4_000 });
      samples.recall_ms.push(performance.now() - start);
      if (recall.data.length !== 8) throw new Error("recall work count mismatch");
      start = performance.now();
      const archive = createStoreArchive(service.store);
      samples.archive_ms.push(performance.now() - start);
      const destination = join(directory, `restored-${run}.sqlite`);
      start = performance.now();
      const restored = restoreStoreArchive(archive, destination);
      samples.restore_ms.push(performance.now() - start);
      if (restored.schema_version !== "0.1.0") throw new Error("restore schema mismatch");
      unlinkSync(destination);
    } catch {
      errors += 1;
    }
  }
  const summary = Object.fromEntries(Object.entries(samples).map(([name, values]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return [name, { runs: values.length, median_ms: sorted[Math.floor(sorted.length / 2)], p95_ms: sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)], min_ms: sorted[0], max_ms: sorted.at(-1) }];
  }));
  console.log(JSON.stringify({ node: process.version, records: 25, runs: 5, errors, operations: summary }));
} finally {
  service.close();
  rmSync(directory, { recursive: true, force: true });
}
