import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openService } from "../src/service.mjs";

const label = process.argv[2] ?? "run";
const directory = mkdtempSync(join(tmpdir(), "noesis-afterglow-budget-"));
const service = openService(join(directory, "mind.sqlite"));
const scope = { scope_id: "budget-scope", owner_id: "operator", kind: "project", project_id: "budget-project", session_id: null, task_id: null };
const forbiddenScope = { scope_id: "forbidden-scope", owner_id: "other", kind: "project", project_id: "other-project", session_id: null, task_id: null };
const principal = { owner_id: "operator", scope_ids: [] };
const otherPrincipal = { owner_id: "other", scope_ids: [] };

try {
  const query = "alpha beta";
  service.mindNote({ principal, scope, content: `alpha beta ${"oversized ".repeat(30)}`, producer_id: "measure", idempotency_key: `${label}-oversized` });
  for (let index = 0; index < 3; index += 1) service.mindNote({ principal, scope, content: `alpha small-${index}`, producer_id: "measure", idempotency_key: `${label}-small-${index}` });
  service.mindNote({ principal: otherPrincipal, scope: forbiddenScope, content: "alpha beta forbidden", producer_id: "measure", idempotency_key: `${label}-forbidden` });
  const result = service.mindRecall({ principal, query, scope_ids: [scope.scope_id], max_items: 3, max_chars: 80 });
  console.log(JSON.stringify({
    label,
    query,
    max_items: 3,
    max_chars: 80,
    returned: result.data.map((hit) => ({ statement: hit.statement, estimated_chars: hit.estimated_chars })),
    oversized_included: result.data.some((hit) => hit.statement.startsWith("alpha beta oversized")),
    forbidden_included: result.data.some((hit) => hit.statement === "alpha beta forbidden"),
    coverage: result.coverage,
    usage: result.usage,
  }));
} finally {
  service.close();
  rmSync(directory, { recursive: true, force: true });
}
