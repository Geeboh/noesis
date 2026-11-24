import test from "node:test";
import assert from "node:assert/strict";
import { buildRecallAttachment } from "../src/omp-extension.mjs";

test("recall attachment is compact and provenance-labelled", () => {
  const attachment = buildRecallAttachment({ data: [{ record_type: "observation", record_id: "record-1", revision: 2, statement: "known result", reason: "matched 1 query term", provenance: { origin: "tool_observation" } }] });
  assert.match(attachment, /record-1@2/);
  assert.match(attachment, /origin=tool_observation/);
  assert.equal(buildRecallAttachment({ data: [] }), "");
});
test("recall attachment preserves trace and coverage metadata", () => {
  const attachment = buildRecallAttachment({
    trace_id: "trace-1",
    coverage: { included: 1, matched: 2 },
    data: [{ record_type: "observation", record_id: "record-1", revision: 2, statement: "known result", reason: "matched 1 query term", provenance: { origin: "tool_observation" } }],
  });
  assert.match(attachment, /^\[trace=trace-1; included=1; matched=2\]/);
  assert.match(attachment, /record-1@2/);
});
