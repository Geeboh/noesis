# Release plan: R-0018 Prism PNG inspection

## Identity

- Stable release ID: `R-0018-prism-png-inspection`.
- Target application version: `1.10.0`.
- Baseline: published and installed `1.9.2`, tag `v1.9.2`, artifact SHA-256 `6262e65bb2ecbbe9355a49658f3c572175a92066ad04167fdf3a07606336d443`.
- Decision: `reports/decisions/DEC-0013-prism-png-inspection.md`.

## Selected slice

Provide a bounded deterministic PNG header inspection CLI. Preserve original source identity through locator, byte length, full SHA-256, and inspected byte range. Report exact metadata only. Do not decode pixels or generate summaries.

## Non-goals

No image OCR, embeddings, model calls, image storage migration, Atlas integration, new Mind tool, provider, backend, or automatic multimodal ingestion.

## Tasks

1. `R-0018-T001` implement PNG inspection module and CLI.
2. `R-0018-T002` validate fixtures, real local screenshot metadata, release gate, and local candidate.

## Acceptance

- Valid PNG reports exact digest, byte length, dimensions, color fields, and header range.
- Malformed, truncated, oversized, and non-PNG inputs fail without output claims.
- The CLI emits JSON only and writes no source copy.
- Full tests and schema gate pass.
- Local v1.10.0 artifact and v1.9.2 rollback are recorded.

## Adoption rule

Adopt the bounded inspection utility if exact source identity and malformed-input behavior pass. Defer OCR, pixel analysis, and automatic Atlas ingestion.
