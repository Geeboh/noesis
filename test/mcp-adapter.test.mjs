import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function startClient(database) {
  const child = spawn("npm", ["--silent", "run", "mcp:start"], {
    cwd: repoRoot,
    env: { ...process.env, NOESIS_DATABASE: database, NOESIS_DATA_DIR: join(dirname(database), "unused-data") },
    stdio: ["pipe", "pipe", "pipe"],
  });
  const stdoutLines = [];
  const stderr = [];
  const waiters = [];
  let buffer = "";
  let streamError = null;

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    buffer += chunk;
    while (buffer.includes("\n")) {
      const newline = buffer.indexOf("\n");
      const raw = buffer.slice(0, newline).replace(/\r$/, "");
      buffer = buffer.slice(newline + 1);
      if (!raw) continue;
      stdoutLines.push(raw);
      let value;
      try {
        value = JSON.parse(raw);
      } catch {
        streamError = new Error(`stdout was not JSON: ${raw}`);
        continue;
      }
      waiters.shift()?.resolve(value);
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => stderr.push(chunk));

  function send(line) {
    child.stdin.write(`${typeof line === "string" ? line : JSON.stringify(line)}\n`);
  }

  function request(message) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timed out waiting for MCP response")), 5000);
      waiters.push({
        resolve(value) {
          clearTimeout(timer);
          resolve(value);
        },
        reject,
      });
      send(message);
    });
  }

  const closed = new Promise((resolve) => child.once("close", (code, signal) => resolve({ code, signal })));
  return {
    child,
    closed,
    request,
    send,
    stdoutLines,
    stderr,
    get streamError() {
      return streamError;
    },
  };
}

function textResult(response) {
  assert.equal(response.result.isError, false);
  assert.equal(response.result.content.length, 1);
  assert.equal(response.result.content[0].type, "text");
  return JSON.parse(response.result.content[0].text);
}

test("stdio MCP adapter initializes, lists deterministic tools, and completes the Mind journey", async () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-mcp-"));
  const client = startClient(join(directory, "mind.sqlite"));
  try {
    const initialized = await client.request({ jsonrpc: "2.0", id: 1, method: "initialize", params: { clientInfo: { name: "test", version: "1" } } });
    assert.equal(initialized.result.protocolVersion, "2025-11-25");
    assert.deepEqual(initialized.result.capabilities, { tools: { listChanged: false } });
    assert.equal(initialized.result.serverInfo.name, "noesis");

    const listed = await client.request({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const tools = listed.result.tools;
    assert.deepEqual(tools.map((tool) => tool.name), ["mind_note", "mind_recall", "mind_inspect", "mind_dream"]);
    assert.deepEqual(tools[0].inputSchema.required, ["content"]);
    assert.deepEqual(tools[1].inputSchema.required, ["query"]);
    assert.deepEqual(tools[2].inputSchema.required, ["record_id"]);
    assert.equal(tools[3].inputSchema.properties.modes.items.type, "string");

    const note = await client.request({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "mind_note", arguments: { content: "relay observation", idempotency_key: "note-retry" } },
    });
    const noteResult = textResult(note);
    assert.equal(noteResult.duplicate, false);
    assert.ok(noteResult.receipt.record_id);

    const retry = await client.request({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: { name: "mind_note", arguments: { content: "relay observation", idempotency_key: "note-retry", owner_id: "attacker", scope_ids: ["attacker"] } },
    });
    const retryResult = textResult(retry);
    assert.equal(retryResult.duplicate, true);
    assert.deepEqual(retryResult.receipt, noteResult.receipt);

    const recall = await client.request({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: { name: "mind_recall", arguments: { query: "relay observation", scope_ids: ["attacker"], owner_id: "attacker" } },
    });
    const recallResult = textResult(recall);
    assert.equal(recallResult.data.length, 1);
    assert.equal(recallResult.data[0].record_id, noteResult.receipt.record_id);

    const inspected = await client.request({
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: { name: "mind_inspect", arguments: { record_id: noteResult.receipt.record_id } },
    });
    const inspectResult = textResult(inspected);
    assert.equal(inspectResult.record.record_id, noteResult.receipt.record_id);
    assert.equal(inspectResult.inspection.content, "relay observation");

    const dream = await client.request({
      jsonrpc: "2.0",
      id: 7,
      method: "tools/call",
      params: { name: "mind_dream", arguments: { level: "snooze", modes: ["consolidate"], idempotency_key: "dream-key" } },
    });
    const dreamResult = textResult(dream);
    assert.equal(dreamResult.status, "accepted");
    assert.equal(dreamResult.state, "queued");

    const unknownTool = await client.request({ jsonrpc: "2.0", id: 8, method: "tools/call", params: { name: "mind_missing", arguments: {} } });
    assert.equal(unknownTool.error.code, -32602);
    const unknownMethod = await client.request({ jsonrpc: "2.0", id: 9, method: "mind/missing" });
    assert.equal(unknownMethod.error.code, -32601);
    const malformed = await client.request("not-json");
    assert.equal(malformed.id, null);
    assert.equal(malformed.error.code, -32700);
    const invalidRequest = await client.request({ jsonrpc: "2.0", id: 10 });
    assert.equal(invalidRequest.error.code, -32600);

    client.send({ jsonrpc: "2.0", method: "notifications/initialized" });
    const afterNotification = await client.request({ jsonrpc: "2.0", id: 11, method: "tools/list" });
    assert.equal(afterNotification.result.tools.length, 4);
  } finally {
    client.child.stdin.end();
    const status = await client.closed;
    assert.equal(status.code, 0);
    assert.equal(status.signal, null);
    assert.equal(client.streamError, null);
    assert.equal(client.stdoutLines.length, 12);
    assert.equal(client.stderr.join(""), "");
    rmSync(directory, { recursive: true, force: true });
  }
});
