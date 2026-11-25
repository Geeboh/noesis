# Release plan: R-0011 budget-fitting recall

## Identity

- Stable release ID: `R-0011-recall-budget-fit`.
- Target application version: `1.6.1`.
- Baseline: published and installed `1.6.0`, tag `v1.6.0`, release artifact SHA-256 `d4fec7d21116bfbeda13863d35d1525f4dbb4ad8793b30e31ee14a1b25f79c33`.
- Decision: `reports/decisions/DEC-0006-recall-budget-fit.md`.

## User problem

Imported historical records are usable through lexical recall, but tied matches can consume the inline character budget with a long chunk before a shorter exact match is returned.

## Selected slice

Keep lexical score as the primary rank. Use statement length as the deterministic tie-breaker before original record order. Preserve scope filtering, provenance, max-items, max-chars, omission counts, and zero model work.

## Non-goals

- No semantic search or vector index.
- No provider, model, proxy, compaction, schema, import, or tool-surface change.
- No automatic policy or preference change.

## Budget

- Model calls: 0.
- Model tokens: 0.
- Embeddings: 0.
- Child jobs: 0.
- Monetary cost: 0.

## Tasks

1. `R-0011-T001` implement shorter-tied-hit ordering and regression test.
2. `R-0011-T002` run focused and full gates, prepare artifact, and record adoption.

## Acceptance

- Equal-score shorter hits precede longer hits.
- A bounded recall request returns the shorter exact match when the longer tie would consume the budget.
- Existing recall tests, scope behavior, provenance, and omission coverage pass.
- `npm run release:check` passes.
- A local v1.6.1 artifact has a recorded digest and v1.6.0 rollback remains available.

## Adoption rule

Adopt only if the regression passes and no existing ranking or scope contract regresses. Do not generalize this narrow result into a semantic recall claim.
