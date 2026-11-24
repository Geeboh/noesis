import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { openService } from "../src/service.mjs";

const label = process.argv[2] ?? "run";
const directory = mkdtempSync(join(tmpdir(), "noesis-resonance-ranking-"));
const service = openService(join(directory, "mind.sqlite"));
const scope = { scope_id: "ranking-scope", owner_id: "operator", kind: "project", project_id: "ranking-project", session_id: null, task_id: null };
const forbiddenScope = { scope_id: "forbidden-scope", owner_id: "other", kind: "project", project_id: "other-project", session_id: null, task_id: null };
const principal = { owner_id: "operator", scope_ids: [] };
const otherPrincipal = { owner_id: "other", scope_ids: [] };
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const score = (statement, query) => query.toLowerCase().split(/\s+/).filter(Boolean).reduce((total, term) => total + (statement.toLowerCase().includes(term) ? 1 : 0), 0);

try {
  const query = "alpha beta";
  service.mindNote({ principal, scope, content: "alpha beta critical decision", producer_id: "measure", idempotency_key: `${label}-critical` });
  await wait(20);
  for (let index = 0; index < 8; index += 1) {
    service.mindNote({ principal, scope, content: `alpha routine-${index}`, producer_id: "measure", idempotency_key: `${label}-routine-${index}` });
    await wait(2);
  }
  service.mindNote({ principal: otherPrincipal, scope: forbiddenScope, content: "alpha beta forbidden", producer_id: "measure", idempotency_key: `${label}-forbidden` });
  const started = performance.now();
  const result = service.mindRecall({ principal, query, scope_ids: [scope.scope_id], max_items: 3, max_chars: 1_000 });
  const duration_ms = performance.now() - started;
  console.log(JSON.stringify({
    label,
    query,
    max_items: 3,
    returned: result.data.map((hit) => ({ statement: hit.statement, score: score(hit.statement, query), record_id: hit.record_id })),
    critical_included: result.data.some((hit) => hit.statement === "alpha beta critical decision"),
    forbidden_included: result.data.some((hit) => hit.statement === "alpha beta forbidden"),
    coverage: result.coverage,
    duration_ms,
  }));
} finally {
  service.close();
  rmSync(directory, { recursive: true, force: true });
}
