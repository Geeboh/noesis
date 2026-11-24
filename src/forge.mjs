function redactText(value, privacy) {
  if (privacy !== "redacted" || typeof value !== "string") return value;
  return value
    .replace(/(?:\/home\/|\/Users\/)[^\s/]+/g, "<path>")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer <redacted>");
}

function scopedRecords({ resource, records }) {
  return records.filter((record) => record.scope.scope_id === resource.scope.scope_id && (record.payload.resource_id === resource.resource_id || record.provenance?.source_refs?.includes(resource.resource_id)));
}

export function buildForgeView({ resource, records, version = null }) {
  const selected = scopedRecords({ resource, records });
  const snapshot = (resource.snapshots ?? []).find((candidate) => candidate.version === version) ?? (resource.snapshots ?? [])[0] ?? null;
  const findings = selected.filter((record) => record.record_type === "observation");
  const lessons = selected.filter((record) => record.record_type === "lesson");
  const hypotheses = selected.filter((record) => record.record_type === "hypothesis");
  return {
    resource_id: resource.resource_id,
    target: resource.display_name,
    version: version ?? snapshot?.version ?? resource.metadata.version ?? null,
    scope: resource.scope.scope_id,
    findings,
    lessons,
    hypotheses,
    reproduction_cases: findings.map((record) => ({ record_id: record.record_id, statement: record.payload.statement ?? "", scope_id: record.scope.scope_id })),
    evidence: findings.map((record) => ({ record_id: record.record_id, source_refs: record.provenance.source_refs, origin: record.provenance.origin })),
    coverage: { considered: selected.length, scope_id: resource.scope.scope_id, version: version ?? snapshot?.version ?? null, omissions: [] },
  };
}

export function exportBlueprint({ forge, target = forge.target, previous_cutoff = null, privacy = "standard", baseline = null }) {
  if (baseline && (baseline.target !== target || baseline.scope !== forge.coverage.scope_id || (baseline.version ?? null) !== (forge.version ?? null))) throw new Error("INCOMPATIBLE_BASELINE");
  const records = previous_cutoff ? forge.findings.filter((record) => record.updated_at > previous_cutoff) : forge.findings;
  const findings = records.map((record) => ({ record_id: record.record_id, statement: redactText(record.payload.statement ?? "", privacy), provenance: record.provenance, version: forge.version }));
  const reproduction_cases = records.map((record) => ({ record_id: record.record_id, statement: redactText(record.payload.statement ?? "", privacy), scope_id: forge.coverage.scope_id }));
  const document = {
    schema_version: "0.1.0",
    target,
    scope: forge.coverage.scope_id,
    version: forge.version,
    findings,
    evidence: forge.evidence,
    lessons: forge.lessons,
    suggestions: forge.lessons,
    hypotheses: forge.hypotheses,
    reproduction_cases,
    omissions: forge.coverage.omissions ?? [],
    limitations: ["Export does not patch or publish the target.", "Hypotheses are proposals and are not verified fixes."],
    coverage: forge.coverage,
    delta_since: previous_cutoff,
    baseline: baseline ?? null,
    delta: previous_cutoff ? { added_record_ids: records.map((record) => record.record_id), invalidated_record_ids: [], deletion_markers: [] } : null,
  };
  return { json: document, markdown: `# Blueprint for ${target}\n\nVersion: ${document.version ?? "unknown"}\n\n## Observed findings\n\n${document.findings.map((finding) => `- ${finding.statement}`).join("\n") || "- None recorded."}\n\n## Suggestions\n\n${document.suggestions.map((lesson) => `- ${redactText(lesson.payload?.statement ?? "", privacy)}`).join("\n") || "- None recorded."}\n\n## Hypotheses\n\n${document.hypotheses.map((hypothesis) => `- ${redactText(hypothesis.payload?.statement ?? "", privacy)} (hypothesis)`).join("\n") || "- None recorded."}\n\n## Limitations\n\n- ${document.limitations.join("\n- ")}` };
}

export function exportTaskManifest({ forge, target = forge.target, privacy = "standard" }) {
  const tasks = forge.hypotheses.map((record) => ({
    task_id: `proposal-task:${record.record_id}`,
    status: "proposed",
    execution: "not_requested",
    target,
    scope_id: forge.coverage.scope_id,
    hypothesis_id: record.record_id,
    statement: redactText(record.payload?.statement ?? "", privacy),
    source_refs: record.provenance?.source_refs ?? [],
    provenance: record.provenance,
    validation_needed: record.payload?.validation_needed ?? [],
  }));
  const document = {
    schema_version: "0.1.0",
    kind: "proposal_task_manifest",
    status: "proposed",
    target,
    scope: forge.coverage.scope_id,
    version: forge.version,
    tasks,
    limitations: ["Tasks are proposals only.", "Export does not execute, assign, approve, patch, or publish work."],
  };
  return { json: document, markdown: `# Proposed tasks for ${target}\n\n${tasks.map((task) => `- [proposed] ${task.statement || "Untitled hypothesis"} (execution not requested)`).join("\n") || "- None recorded."}` };
}