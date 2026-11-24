import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { openService } from "../src/service.mjs";

const label = process.argv[2] ?? "run";
const directory = mkdtempSync(join(tmpdir(), "noesis-resonance-"));
const service = openService(join(directory, "mind.sqlite"));
const scope = { scope_id: "resonance-scope", owner_id: "operator", kind: "project", project_id: "resonance-project", session_id: null, task_id: null };
const principal = { owner_id: "operator", scope_ids: [] };
const samples = [];
let errors = 0;
try {
  for (let index = 0; index < 40; index += 1) service.mindNote({ principal, scope, content: `decision ${index} for project resumption`, producer_id: "resonance-measure", idempotency_key: `${label}-note-${index}` });
  for (let run = 0; run < 5; run += 1) {
    try {
      const start = performance.now();
      const result = service.mindRecall({ principal, query: "decision project", scope_ids: [scope.scope_id], max_items: 8, max_chars: 4_000 });
      samples.push({ duration_ms: performance.now() - start, returned: result.data.length, coverage: result.coverage, trace_present: Boolean(result.trace_id), usage_present: Boolean(result.usage) });
    } catch {
      errors += 1;
    }
  }
  const durations = samples.map((sample) => sample.duration_ms).sort((a, b) => a - b);
  console.log(JSON.stringify({ label, records: 40, runs: samples.length, errors, returned: samples.map((sample) => sample.returned), trace_present: samples.some((sample) => sample.trace_present), usage_present: samples.some((sample) => sample.usage_present), median_ms: durations[Math.floor(durations.length / 2)], p95_ms: durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)], min_ms: durations[0], max_ms: durations.at(-1) }));
} finally {
  service.close();
  rmSync(directory, { recursive: true, force: true });
}
