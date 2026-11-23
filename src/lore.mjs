export function buildLorePage({ page_id, page_type, title, claims = [], manual_sections = [], generated_at = new Date().toISOString() }) {
  return {
    page_id,
    page_type,
    title,
    revision: 1,
    generated_at,
    sections: [
      ...manual_sections.map((section) => ({ ...section, ownership: "manual" })),
      { section_id: "generated-overview", ownership: "generated", content: claims.map((claim) => claim.statement).join("\n"), source_refs: claims.flatMap((claim) => claim.source_refs ?? []), stale: false },
    ],
  };
}

export function invalidateLorePage(page, changedSourceIds) {
  const changed = new Set(changedSourceIds);
  return { ...page, sections: page.sections.map((section) => section.ownership === "manual" ? section : { ...section, stale: section.source_refs.some((source) => changed.has(source)) }) };
}

export function editManualSection(page, section_id, content) {
  return { ...page, revision: page.revision + 1, sections: page.sections.map((section) => section.section_id === section_id && section.ownership === "manual" ? { ...section, content } : section) };
}
