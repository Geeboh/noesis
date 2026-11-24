import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openService } from "../src/service.mjs";

const label = process.argv[2] ?? "run";
const directory = mkdtempSync(join(tmpdir(), "noesis-query-normalization-"));
const service = openService(join(directory, "mind.sqlite"));
const scope = { scope_id: "query-scope", owner_id: "operator", kind: "project", project_id: "query-project", session_id: null, task_id: null };
const forbiddenScope = { scope_id: "forbidden-scope", owner_id: "other", kind: "project", project_id: "other-project", session_id: null, task_id: null };
const principal = { owner_id: "operator", scope_ids: [] };
const otherPrincipal = { owner_id: "other", scope_ids: [] };

try {
  const query = "alpha alpha beta";
  service.mindNote({ principal, scope, content: "alpha older evidence", producer_id: "measure", idempotency_key: `${label}-alpha` });
  await new Promise((resolve) => setTimeout(resolve, 20));
  service.mindNote({ principal, scope, content: "beta newer evidence", producer_id: "measure", idempotency_key: `${label}-beta` });
  service.mindNote({ principal: otherPrincipal, scope: forbiddenScope, content: "alpha beta forbidden", producer_id: "measure", idempotency_key: `${label}-forbidden` });
  const result = service.mindRecall({ principal, query, scope_ids: [scope.scope_id], max_items: 1, max_chars: 200 });
  console.log(JSON.stringify({
    label,
    query,
    returned: result.data.map((hit) => ({ statement: hit.statement, reason: hit.reason })),
    forbidden_included: result.data.some((hit) => hit.statement === "alpha beta forbidden"),
    coverage: result.coverage,
    usage: result.usage,
  }));
} finally {
  service.close();
  rmSync(directory, { recursive: true, force: true });
}
