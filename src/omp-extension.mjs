import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { openService } from "./service.mjs";
import { normalizeHostEvent } from "./omp-events.mjs";

function scopeFor(cwd) {
  const project_id = cwd ?? process.cwd();
  const scope_id = `project:${createHash("sha256").update(project_id).digest("hex").slice(0, 24)}`;
  return { scope_id, owner_id: "local", kind: "project", project_id, session_id: null, task_id: null };
}

function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

function schema(pi, shape) {
  return pi.zod.object(shape);
}


function observeHostEvent(pi, service, principal, scope, name, actor_id = "omp") {
  pi.on?.(name, (event) => {
    const normalized = normalizeHostEvent(name, event, actor_id);
    if (!normalized) return;
    service.mindNote({ principal, scope, content: `${normalized.status}: ${normalized.content}`, producer_id: "omp-event", idempotency_key: normalized.idempotency_key, actor_id: normalized.actor_id });
  });
}

export function buildRecallAttachment(result) {
  if (!result?.data?.length) return "";
  return result.data.map((hit) => `[${hit.record_type} ${hit.record_id}@${hit.revision}] ${hit.statement} (${hit.reason}; origin=${hit.provenance.origin})`).join("\n");
}

export default function noesisExtension(pi) {
  const dataDirectory = process.env.NOESIS_DATA_DIR ?? join(pi.cwd ?? process.cwd(), ".noesis");
  const filename = process.env.NOESIS_DATABASE ?? join(dataDirectory, "mind.sqlite");
  mkdirSync(dirname(filename), { recursive: true });
  const service = openService(filename);
  const scope = scopeFor(pi.cwd ?? process.cwd());
  const principal = { owner_id: "local", scope_ids: [] };
  let sequence = 0;
  const key = (prefix) => `${prefix}:${process.pid}:${sequence++}`;

  pi.registerTool({
    name: "mind_note",
    label: "NOESIS note",
    description: "Persist an observed note with source and scope provenance.",
    parameters: schema(pi, { content: pi.zod.string(), idempotency_key: pi.zod.string().optional() }),
    execute: async (_toolCallId, params) => textResult(service.mindNote({ principal, scope, content: params.content, producer_id: "omp", idempotency_key: params.idempotency_key ?? key("note") })),
  });
  pi.registerTool({
    name: "mind_recall",
    label: "NOESIS recall",
    description: "Recall bounded evidence from the current project scope with provenance.",
    parameters: schema(pi, { query: pi.zod.string(), max_items: pi.zod.number().int().positive().max(8).optional() }),
    execute: async (_toolCallId, params) => textResult(service.mindRecall({ principal, query: params.query, scope_ids: [scope.scope_id], max_items: params.max_items ?? 8 })),
  });
  pi.registerTool({
    name: "mind_inspect",
    label: "NOESIS inspect",
    description: "Inspect one exact authorized NOESIS record revision and its source references.",
    parameters: schema(pi, { record_id: pi.zod.string(), revision: pi.zod.number().int().positive().optional() }),
    execute: async (_toolCallId, params) => textResult(service.mindInspect({ principal, record_id: params.record_id, revision: params.revision ?? null })),
  });
  pi.registerTool({
    name: "mind_dream",
    label: "NOESIS Snooze",
    description: "Queue a durable deterministic Snooze consolidation job. Only level snooze and mode consolidate are implemented.",
    loadMode: "essential",
    parameters: schema(pi, { level: pi.zod.string().optional(), modes: pi.zod.array(pi.zod.string()).optional(), focus: pi.zod.string().optional(), idempotency_key: pi.zod.string().optional() }),
    execute: async (_toolCallId, params) => textResult(service.mindDream({ principal, scope_ids: [scope.scope_id], level: params.level ?? "snooze", modes: params.modes ?? ["consolidate"], focus: params.focus ?? null, producer_id: "omp", idempotency_key: params.idempotency_key ?? key("dream") })),
  });

  pi.on?.("before_agent_start", (event) => {
    if (event?.reason === "revive") return;
    const query = typeof event?.prompt === "string" ? event.prompt : "";
    const attachment = buildRecallAttachment(service.mindRecall({ principal, query, scope_ids: [scope.scope_id], max_items: 4, max_chars: 6000 }));
    if (!attachment) return;
    return { systemPrompt: `${event?.systemPrompt ?? ""}\n\n<noesis-memory>\n${attachment}\n</noesis-memory>` };
  });
  observeHostEvent(pi, service, principal, scope, "message_end");
  observeHostEvent(pi, service, principal, scope, "tool_execution_end");
  if (process.env.NOESIS_PROBE === "1") console.error(`NOESIS_EXTENSION_READY ${JSON.stringify(service.mindCapabilities())}`);
  pi.on?.("session_shutdown", () => service.close());
  return {};
}
