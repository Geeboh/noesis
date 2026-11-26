# Release plan: R-0013 source-group recall

## Identity

- Stable release ID: `R-0013-source-group-recall`.
- Target application version: `1.7.0`.
- Baseline: published and installed `1.6.1`, tag `v1.6.1`, artifact SHA-256 `770e3409f0e522a6f63a667bfaa6f22e9e17a06e27b24692fdb2a6f248b0376e`.
- Decision: `reports/decisions/DEC-0008-source-group-recall.md`.

## Selected slice

Budget lexical recall by imported source entry. Preserve existing score and shorter-hit ordering. Admit at most one matching chunk from each exact imported source entry, record grouped omissions, and let independent source groups compete for the remaining budget.

## Non-goals

No semantic search, model, embedding, provider, proxy, compaction, schema, importer, tool-surface, or canonical-record change. No automatic rewrite of existing data.

## Budget

Zero model calls, tokens, embeddings, retries, child jobs, and monetary cost.

## Tasks

1. `R-0013-T001` implement source-group admission and regression coverage.
2. `R-0013-T002` run real-history probes, release gate, artifact build, and local candidate records.

## Acceptance

- Same-entry imported chunks do not consume multiple recall slots or the character budget.
- Independent source groups remain eligible.
- Grouped omissions are explicit in coverage.
- Existing recall, scope, provenance, importer, archive, and release tests pass.
- Real-history results are recorded without semantic claims.

## Adoption rule

Adopt only if the regression passes and no existing recall accounting or scope contract regresses. Keep v1.6.1 as rollback.
