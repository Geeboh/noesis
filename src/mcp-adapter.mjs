import { createHash } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

export const SERVER_INFO = Object.freeze({ name: "noesis", version });
export const MCP_PROTOCOL_VERSION = "2025-11-25";

export const TOOL_DEFINITIONS = Object.freeze([
  Object.freeze({
    name: "mind_note",
    description: "Persist observed note source and scope provenance.",
    inputSchema: Object.freeze({
      type: "object",
      properties: Object.freeze({
        content: Object.freeze({ type: "string" }),
        idempotency_key: Object.freeze({ type: "string" }),
      }),
      required: Object.freeze(["content"]),
      additionalProperties: false,
    }),
  }),
  Object.freeze({
    name: "mind_recall",
    description: "Recall bounded evidence current project scope provenance.",
    inputSchema: Object.freeze({
      type: "object",
      properties: Object.freeze({
        query: Object.freeze({ type: "string" }),
        max_items: Object.freeze({ type: "integer", minimum: 1, maximum: 8 }),
      }),
      required: Object.freeze(["query"]),
      additionalProperties: false,
    }),
  }),
  Object.freeze({
    name: "mind_inspect",
    description: "Inspect an exact record revision and bounded source content.",
    inputSchema: Object.freeze({
      type: "object",
      properties: Object.freeze({
        record_id: Object.freeze({ type: "string" }),
        revision: Object.freeze({ type: "integer", minimum: 1 }),
        max_bytes: Object.freeze({ type: "integer", minimum: 4, maximum: 12000 }),
        cursor: Object.freeze({ type: "string" }),
      }),
      required: Object.freeze(["record_id"]),
      additionalProperties: false,
    }),
  }),
  Object.freeze({
    name: "mind_dream",
    description: "Queue a durable deterministic Snooze consolidation job. Only level snooze and mode consolidate are implemented.",
    inputSchema: Object.freeze({
      type: "object",
      properties: Object.freeze({
        level: Object.freeze({ type: "string" }),
        modes: Object.freeze({ type: "array", items: Object.freeze({ type: "string" }) }),
        focus: Object.freeze({ type: "string" }),
        idempotency_key: Object.freeze({ type: "string" }),
      }),
      additionalProperties: false,
    }),
  }),
]);

const RPC_PARSE_ERROR = -32700;
const RPC_INVALID_REQUEST = -32600;
const RPC_METHOD_NOT_FOUND = -32601;
const RPC_INVALID_PARAMS = -32602;
const RPC_SERVICE_ERROR = -32000;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRequestId(value) {
  return value === null || typeof value === "string" || (typeof value === "number" && Number.isFinite(value));
}

function responseId(message) {
  return isObject(message) && Object.hasOwn(message, "id") && isRequestId(message.id) ? message.id : null;
}

function hasRequestId(message) {
  return isObject(message) && Object.hasOwn(message, "id");
}

function rpcError(id, code, message, data = undefined) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id, error };
}

function invalidParams(message, data = undefined) {
  return new RpcRequestError(RPC_INVALID_PARAMS, message, data);
}

class RpcRequestError extends Error {
  constructor(code, message, data = undefined) {
    super(message);
    this.code = code;
    this.data = data;
  }
}

function projectScope(cwd = process.cwd()) {
  const project_id = cwd;
  const scope_id = `project:${createHash("sha256").update(project_id).digest("hex").slice(0, 24)}`;
  return { scope_id, owner_id: "local", kind: "project", project_id, session_id: null, task_id: null };
}

function validateArguments(name, args) {
  if (!isObject(args)) throw invalidParams("tool arguments must be an object");
  if (name === "mind_note") {
    if (typeof args.content !== "string") throw invalidParams("content must be a string");
    if (args.idempotency_key !== undefined && typeof args.idempotency_key !== "string") throw invalidParams("idempotency_key must be a string");
  } else if (name === "mind_recall") {
    if (typeof args.query !== "string") throw invalidParams("query must be a string");
    if (args.max_items !== undefined && (!Number.isInteger(args.max_items) || args.max_items < 1 || args.max_items > 8)) throw invalidParams("max_items must be an integer from 1 to 8");
  } else if (name === "mind_inspect") {
    if (typeof args.record_id !== "string") throw invalidParams("record_id must be a string");
    if (args.revision !== undefined && (!Number.isInteger(args.revision) || args.revision < 1)) throw invalidParams("revision must be a positive integer");
    if (args.max_bytes !== undefined && (!Number.isInteger(args.max_bytes) || args.max_bytes < 4 || args.max_bytes > 12000)) throw invalidParams("max_bytes must be an integer from 4 to 12000");
    if (args.cursor !== undefined && typeof args.cursor !== "string") throw invalidParams("cursor must be a string");
  } else if (name === "mind_dream") {
    if (args.level !== undefined && typeof args.level !== "string") throw invalidParams("level must be a string");
    if (args.modes !== undefined && (!Array.isArray(args.modes) || args.modes.some((mode) => typeof mode !== "string"))) throw invalidParams("modes must be an array of strings");
    if (args.focus !== undefined && typeof args.focus !== "string") throw invalidParams("focus must be a string");
    if (args.idempotency_key !== undefined && typeof args.idempotency_key !== "string") throw invalidParams("idempotency_key must be a string");
  }
  return args;
}

function serviceErrorResponse(id, error) {
  const serviceCode = typeof error?.code === "string" ? error.code : "INTERNAL_ERROR";
  const rpcCode = serviceCode === "INVALID_ARGUMENT" ? RPC_INVALID_PARAMS : RPC_SERVICE_ERROR;
  return rpcError(id, rpcCode, error?.message ?? "Service request failed", { code: serviceCode });
}

export function createMcpAdapter({ service } = {}) {
  if (!service || typeof service.mindNote !== "function" || typeof service.mindRecall !== "function" || typeof service.mindInspect !== "function" || typeof service.mindDream !== "function") {
    throw new TypeError("service must expose the four Mind tool methods");
  }

  const principal = Object.freeze({ owner_id: "local", scope_ids: [] });
  const scope = Object.freeze(projectScope());
  let sequence = 0;
  const nextKey = (name) => `mcp:${process.pid}:${name}:${sequence++}`;

  function callTool(name, rawArguments) {
    const args = validateArguments(name, rawArguments);
    if (name === "mind_note") {
      return service.mindNote({
        principal,
        scope,
        content: args.content,
        producer_id: "mcp",
        idempotency_key: args.idempotency_key ?? nextKey("note"),
      });
    }
    if (name === "mind_recall") {
      return service.mindRecall({
        principal,
        query: args.query,
        scope_ids: [scope.scope_id],
        max_items: args.max_items ?? 8,
      });
    }
    if (name === "mind_inspect") {
      return service.mindInspect({
        principal,
        record_id: args.record_id,
        revision: args.revision ?? null,
        max_bytes: args.max_bytes ?? null,
        cursor: args.cursor ?? null,
      });
    }
    if (name === "mind_dream") {
      return service.mindDream({
        principal,
        scope_ids: [scope.scope_id],
        level: args.level ?? "snooze",
        modes: args.modes ?? ["consolidate"],
        focus: args.focus ?? null,
        producer_id: "mcp",
        idempotency_key: args.idempotency_key ?? nextKey("dream"),
      });
    }
    throw invalidParams(`unknown tool: ${name}`, { tool: name });
  }

  function handle(message) {
    const id = responseId(message);
    const requestHasId = hasRequestId(message);
    if (!isObject(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string" || (requestHasId && !isRequestId(message.id))) {
      return rpcError(id, RPC_INVALID_REQUEST, "Invalid Request");
    }

    if (message.method === "notifications/initialized" || !requestHasId) return null;

    try {
      if (message.method === "initialize") {
        return { jsonrpc: "2.0", id, result: { protocolVersion: MCP_PROTOCOL_VERSION, serverInfo: SERVER_INFO, capabilities: { tools: { listChanged: false } } } };
      }
      if (message.method === "tools/list") {
        return { jsonrpc: "2.0", id, result: { tools: TOOL_DEFINITIONS } };
      }
      if (message.method === "tools/call") {
        if (!isObject(message.params) || typeof message.params.name !== "string") throw invalidParams("tools/call requires a tool name");
        const result = callTool(message.params.name, message.params.arguments ?? {});
        return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result) }], isError: false } };
      }
      throw new RpcRequestError(RPC_METHOD_NOT_FOUND, `Method not found: ${message.method}`);
    } catch (error) {
      if (error instanceof RpcRequestError) return rpcError(id, error.code, error.message, error.data);
      return serviceErrorResponse(id, error);
    }
  }

  function handleLine(line) {
    if (typeof line !== "string" || line.trim() === "") return null;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return rpcError(null, RPC_PARSE_ERROR, "Parse error");
    }
    return handle(message);
  }

  return Object.freeze({ handle, handleLine, principal, scope });
}

export { projectScope };
