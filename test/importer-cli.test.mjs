import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function run(args) {
  const result = spawnSync(process.execPath, ["scripts/import_omp_jsonl.mjs", ...args], { cwd: process.cwd(), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("OMP JSONL CLI preflights and resumes a run", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-import-cli-"));
  const source = join(directory, "session.jsonl");
  const database = join(directory, "mind.sqlite");
  writeFileSync(source, [
    JSON.stringify({ type: "session", id: "cli-session", cwd: "/workspace/cli-project" }),
    JSON.stringify({ type: "message", id: "cli-message", message: { role: "user", content: [{ type: "text", text: "cli import" }] } }),
    JSON.stringify({ type: "custom", id: "unsupported", data: { kind: "metadata" } }),
  ].join("\n") + "\n");
  try {
    const preflight = run(["preflight", "--source", source]);
    assert.equal(preflight.format, "omp-jsonl");
    assert.equal(preflight.message_count, 1);
    const started = run(["start", "--source", source, "--database", database]);
    assert.equal(started.state, "ready");
    const resumed = run(["resume", "--run-id", started.run_id, "--database", database, "--max-lines", "10"]);
    assert.equal(resumed.state, "completed");
    assert.equal(resumed.imported_records, 1);
    assert.equal(resumed.quarantined_entries, 1);
    const status = run(["status", "--run-id", started.run_id, "--database", database]);
    assert.equal(status.state, "completed");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
