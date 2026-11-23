import test from "node:test";
import assert from "node:assert/strict";
import { buildLorePage, editManualSection, invalidateLorePage } from "../src/lore.mjs";

test("Lore preserves manual sections and invalidates dependent generated claims", () => {
  const page = buildLorePage({ page_id: "page-1", page_type: "resource", title: "Example", claims: [{ statement: "works", source_refs: ["source-1"] }], manual_sections: [{ section_id: "manual-1", content: "operator note" }] });
  const edited = editManualSection(page, "manual-1", "corrected note");
  const stale = invalidateLorePage(edited, ["source-1"]);
  assert.equal(stale.sections.find((section) => section.section_id === "manual-1").content, "corrected note");
  assert.equal(stale.sections.find((section) => section.section_id === "generated-overview").stale, true);
});
