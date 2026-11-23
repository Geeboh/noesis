export function buildForgeView({ resource, records }) {
  const selected = records.filter((record) => record.scope.scope_id === resource.scope.scope_id && (record.payload.resource_id === resource.resource_id || record.provenance?.source_refs?.includes(resource.resource_id)));
  return { resource_id: resource.resource_id, version: resource.metadata.version ?? null, findings: selected.filter((record) => record.record_type === "observation"), lessons: selected.filter((record) => record.record_type === "lesson"), hypotheses: selected.filter((record) => record.record_type === "hypothesis"), coverage: { considered: selected.length, scope_id: resource.scope.scope_id } };
}

export function exportBlueprint({ forge, target, previous_cutoff = null, privacy = "standard" }) {
  const records = previous_cutoff ? forge.findings.filter((record) => record.updated_at > previous_cutoff) : forge.findings;
  const redacted = (value) => privacy === "redacted" ? String(value).replace(/(?:\/home\/|\/Users\/)[^\s/]+/g, "<path>") : value;
  const document = {
    schema_version: "0.1.0",
    target,
    scope: forge.coverage.scope_id,
    findings: records.map((record) => ({ record_id: record.record_id, statement: redacted(record.payload.statement ?? ""), provenance: record.provenance })),
    lessons: forge.lessons,
    hypotheses: forge.hypotheses,
    limitations: ["Export does not patch or publish the target."],
    coverage: forge.coverage,
    delta_since: previous_cutoff,
  };
  return { json: document, markdown: `# Blueprint for ${target}\n\n${document.findings.map((finding) => `- ${finding.statement}`).join("\n")}\n\nLimitations: ${document.limitations.join(" ")}` };
}
