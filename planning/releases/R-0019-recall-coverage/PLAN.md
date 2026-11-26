# Release plan: R-0019 Resonance recall coverage

## Identity

- Stable release ID: `R-0019-recall-coverage`.
- Target application version: `1.11.0`.
- Baseline: published and installed `1.10.0`, tag `v1.10.0`, artifact SHA-256 `70685f9d6bb3410dd1cb1de2c3189912ddc442848e7ab9ea6bc3ed7c4a6ed7f1`.
- Decision: `reports/decisions/DEC-0014-recall-coverage.md`.

## Selected outcome

Recall coverage accurately reports all authorized matches and item-limited omissions while preserving the existing bounded result. This improves caller trust without changing ranking or admission behavior.

## Non-goals

No ranking change, model, embedding, provider, database migration, schema change, new Mind tool, source-family merge, compaction owner, or live-data rewrite.

## Tasks

1. `R-0019-T001` reproduce the coverage truncation and implement complete metadata-only accounting.
2. `R-0019-T002` validate item limits, character limits, scope denial, native OMP, MCP, Observatory, and release gates.

## Acceptance

- Returned hit order and count remain bounded by `max_items`.
- Authorized matching count and `omitted.item_limit` include records beyond the admission boundary.
- Unauthorized records remain absent from data and coverage match counts.
- Character budget and grouped omission behavior remain intact.
- Full tests and schema gate pass.
- Local v1.11.0 artifact and v1.10.0 rollback are recorded.

## Budget and effort

Zero model calls, tokens, embeddings, retries, child jobs, and monetary cost. Local deterministic checks only. Reforecast after the focused regression.
