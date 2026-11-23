import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openStore } from "../src/store.mjs";

test("failed processing remains distinct from successful empty output", () => {
  const directory = mkdtempSync(join(tmpdir(), "noesis-processing-"));
  const store = openStore(join(directory, "mind.sqlite"));
  const failed = store.createProcessingJob({ job_id: "job-failed", kind: "extract", payload: { source_id: "source-1" }, now: "2026-11-24T00:00:00.000Z" });
  assert.equal(failed.state, "pending");
  const retryable = store.updateProcessingJob("job-failed", "failed", { payload: { source_id: "source-1", error: "provider unavailable", retryable: true }, checkpoint: { attempt: 1 }, now: "2026-11-24T00:00:01.000Z" });
  assert.equal(retryable.state, "failed");
  assert.equal(retryable.payload.retryable, true);
  const empty = store.createProcessingJob({ job_id: "job-empty", kind: "extract", payload: { source_id: "source-1" }, now: "2026-11-24T00:00:02.000Z" });
  const completed = store.updateProcessingJob("job-empty", "completed_empty", { payload: { source_id: "source-1", result: [] }, now: "2026-11-24T00:00:03.000Z" });
  assert.equal(empty.state, "pending");
  assert.equal(completed.state, "completed_empty");
  assert.notEqual(retryable.state, completed.state);
  store.close();
  rmSync(directory, { recursive: true, force: true });
});
