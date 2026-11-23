function generatedSection(claims, generated_at) {
  return { section_id: "generated-overview", ownership: "generated", content: claims.map((claim) => claim.statement).join("\n"), source_refs: claims.flatMap((claim) => claim.source_refs ?? []), stale: false, generated_at };
}

export function buildLorePage({ page_id, page_type, title, claims = [], manual_sections = [], backlinks = [], generated_at = new Date().toISOString() }) {
  return {
    page_id,
    page_type,
    title,
    revision: 1,
    generated_at,
    last_verified_at: null,
    source_refs: claims.flatMap((claim) => claim.source_refs ?? []),
    backlinks,
    sections: [
      ...manual_sections.map((section) => ({ ...section, ownership: "manual" })),
      generatedSection(claims, generated_at),
    ],
  };
}

export function refreshLorePage(page, { claims = [], generated_at = new Date().toISOString() } = {}) {
  return {
    ...page,
    revision: page.revision + 1,
    generated_at,
    last_verified_at: generated_at,
    source_refs: claims.flatMap((claim) => claim.source_refs ?? []),
    sections: [...page.sections.filter((section) => section.ownership === "manual"), generatedSection(claims, generated_at)],
  };
}

export function invalidateLorePage(page, changedSourceIds) {
  const changed = new Set(changedSourceIds);
  return { ...page, last_verified_at: null, sections: page.sections.map((section) => section.ownership === "manual" ? section : { ...section, stale: section.source_refs.some((source) => changed.has(source)), invalidated_source_ids: section.source_refs.filter((source) => changed.has(source)) }) };
}

export function editManualSection(page, section_id, content, expected_revision = page.revision) {
  if (expected_revision !== page.revision) throw new Error("REVISION_CONFLICT");
  const found = page.sections.some((section) => section.section_id === section_id);
  const sections = found
    ? page.sections.map((section) => section.section_id === section_id && section.ownership === "manual" ? { ...section, content, ownership: "manual" } : section)
    : [...page.sections, { section_id, ownership: "manual", content, source_refs: [] }];
  return { ...page, revision: page.revision + 1, sections };
}

export function diffLorePages(before, after) {
  const oldSections = new Map(before.sections.map((section) => [section.section_id, section]));
  return after.sections.filter((section) => JSON.stringify(oldSections.get(section.section_id)) !== JSON.stringify(section)).map((section) => ({ section_id: section.section_id, before: oldSections.get(section.section_id) ?? null, after: section }));
}
