# Release plan: R-0014 Catalyst outcome loop

## Identity

- Stable release ID: `R-0014-catalyst-outcome-loop`.
- Target application version: `1.8.0`.
- Baseline: published and installed `1.7.0`, tag `v1.7.0`, artifact SHA-256 `cbc578c19a312e39c5729ca9ad0915470852a8f1a614ce52b7e7bc5a3161f186`.
- Decision: `reports/decisions/DEC-0009-catalyst-outcome-loop.md`.

## Selected slice

Extend Catalyst task manifests with a real proposal-to-task-to-observed-outcome path. Paired Observatory routes create authorized application and outcome records. Forge projects those records. Task exports preserve proposal, application, outcome, source, scope, and validation state.

## Non-goals

- No new Mind tool.
- No automatic task execution, code patch, assignment, approval, publication, or external message.
- No model, provider, proxy, compaction, schema, importer, or learning-policy change.

## Budget

Zero model calls, tokens, embeddings, retries, child jobs, and monetary cost.

## Tasks

1. `R-0014-T001` add service application/outcome capture and lineage.
2. `R-0014-T002` project lifecycle into Forge and task manifests.
3. `R-0014-T003` add paired Observatory mutation routes and journey tests.
4. `R-0014-T004` run archive, release, and local candidate validation.

## Acceptance

- Authorized application and outcome mutations preserve scope and idempotency.
- Hypothesis → application → outcome lineage survives archive/restore.
- Task manifests distinguish proposed, applied, and validated states.
- A paired Observatory journey records one application and one outcome without executing external work.
- Full release gate passes and v1.7.0 remains rollback.

## Adoption rule

Adopt only if the real paired journey is inspectable, rejected proposals remain distinguishable, and no mutation can bypass existing scope or pairing controls.
