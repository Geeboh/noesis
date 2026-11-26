# Release plan: R-0017 nonempty note boundary

## Identity

- Stable release ID: `R-0017-nonempty-note-boundary`.
- Target application version: `1.9.2`.
- Baseline: published and installed `1.9.1`, tag `v1.9.1`, artifact SHA-256 `bb967de20792b6d3fa4963ed7c671a01980f3ae8fc60bad78d4f4bf968174e48`.
- Decision: `reports/decisions/DEC-0012-nonempty-note-boundary.md`.

## Selected slice

Reject empty note content in native OMP and MCP schemas before the service call. Preserve service-level validation and all successful note behavior.

## Non-goals

No model/provider change, tool rename, compaction, backend, data migration, or semantic learning change.

## Tasks

1. `R-0017-T001` tighten OMP/MCP note schemas and add invalid-call tests.
2. `R-0017-T002` run the release gate, build, and prepare the local patch candidate.

## Acceptance

- Empty OMP and MCP note arguments fail without a write.
- Non-empty note, idempotency, recall, archive, and MCP journeys pass.
- Full release gate and schema validation pass.
- Local v1.9.2 artifact and v1.9.1 rollback are recorded.

## Adoption rule

Adopt if boundary rejection passes and successful note behavior remains unchanged. Keep v1.9.1 installed as rollback.
