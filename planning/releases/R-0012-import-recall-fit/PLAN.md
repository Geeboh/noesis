# Release plan: R-0012 import recall fit

## Identity

- Stable release ID: `R-0012-import-recall-fit`.
- Target application version: `1.6.2`.
- Baseline: published and installed `1.6.1`, tag `v1.6.1`, artifact SHA-256 `770e3409f0e522a6f63a667bfaa6f22e9e17a06e27b24692fdb2a6f248b0376e`.
- Decision: `reports/decisions/DEC-0007-import-recall-fit.md`.

## User problem

Imported messages can exceed the default 12,000-character recall budget after chunking at 16,000 characters. A long message can therefore remain source-backed but unavailable to bounded lexical recall.

## Selected slice

Chunk imported visible text at 12,000 characters. Keep exact concatenation, source ranges, provenance, quarantine, and resume behavior. Existing records remain unchanged. Re-import applies the policy.

## Non-goals

- No semantic search, model, embedding, provider, proxy, compaction, schema, or tool-surface change.
- No automatic rewrite of existing imported records.
- No Origami summary.

## Budget

Model calls, tokens, embeddings, child jobs, retries, and monetary cost remain zero.

## Tasks

1. `R-0012-T001` align importer chunk size with recall budget and update regression coverage.
2. `R-0012-T002` run real-history probe, release gate, artifact build, and local candidate records.

## Acceptance

- Imported chunks are at most 12,000 characters.
- Chunk concatenation remains exact.
- The real coding and design/research target probe shows the observed miss resolved or records the remaining limitation.
- The full release gate passes.
- A local v1.6.2 artifact and rollback route are recorded.

## Adoption rule

Adopt only if no imported content is lost, the selected retrieval miss improves, and existing contracts remain green. Do not claim semantic recall improvement.
