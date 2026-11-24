# Release report: R-0001 Resonance

## Identity

- Stable release ID and application version: `R-0001-resonance`, `1.1.0`.
- Accepted prior version/commit: `1.0.0`, tag `v1.0.0`, commit `80a87030c0a4eaf2e029e48f32feb789be7ffb47`.
- Candidate commit: `8c87c2e` for implementation, package version, and active plan; final documentation is local-only follow-up.
- Artifact: `/tmp/noesis-r1-release/noesis-1.1.0.tgz`, SHA-256 `9adb40fdd90a01bb6a52c4a3bae136b65fc15faa1ecacd4d5c15e877fbf85900`.
- Environment: Linux x86_64, Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0001-resonance/PLAN.md`.
- Report date: 2026-11-24.

## Delivered result

Recall responses now expose a trace identity, considered/matched/included counts, omission reasons, truncation, elapsed local duration, and deterministic usage accounting. Existing lexical ranking, scope enforcement, source provenance, and result budgets remain unchanged. The Observatory reports the trace ID and local elapsed duration after recall.

The baseline and candidate used separate temporary SQLite stores with 40 records and five runs. Both returned 8 records per run with zero errors. The candidate added trace and usage fields. No ranking improvement claim is made because the result count and query behavior stayed unchanged.

## Validation

| Outcome/check | Candidate | Command or observed procedure | Result | Evidence and limitation |
| --- | --- | --- | --- | --- |
| Baseline measurement | `1.0.0` behavior | `node scripts/measure_resonance.mjs baseline` | passed, 5 runs, 0 errors, median 1.48 ms, p95 3.62 ms | isolated 40-record store; no concurrency |
| Candidate measurement | `1.1.0` behavior | `node scripts/measure_resonance.mjs candidate` | passed, 5 runs, 0 errors, median 1.53 ms, p95 3.54 ms | no measurable quality change; local timing variation |
| Recall trace contract | `8c87c2e` | `npm test`, service tests, Observatory tests | passed | trace adds no unauthorized IDs |
| Real OMP path | `1.1.0` source | OMP `mind_note`, fresh `mind_recall`, and `mind_inspect` in an isolated store | passed | deterministic authorized smoke only |
| Dashboard path | `1.1.0` source | paired temporary Observatory note and recall | passed | trace ID, counts, usage observed; no physical device |
| Release gate | `1.1.0` source | `npm ci --ignore-scripts`; `npm run release:check` | passed, 56 tests | full JSON Schema packages remain unavailable |

## Scope disposition

- Required task `R-0001-T001`: complete with baseline/candidate measurements.
- Required task `R-0001-T002`: complete with additive service and UI trace fields.
- Required task `R-0001-T003`: complete with real OMP and paired Observatory evidence.
- Required task `R-0001-T004`: complete locally with artifact, notes, review, and no publication.
- No ranking-policy promotion occurred. The accepted policy remains the rollback baseline.
- No model calls, embeddings, retries, child jobs, schema migrations, or remote writes were introduced.

## Installation, data and recovery

Install with `npm ci --ignore-scripts` from the candidate checkout. Run `npm run release:check`. Runtime data remains outside the checkout. Rollback is the accepted `v1.0.0` commit/tag and artifact; no migration is required for this release.

## Publication

| Action | Authorized destination | Observed result | Identity/evidence |
| --- | --- | --- | --- |
| Branch/tag push | none for R-0001 | not attempted | local candidate only |
| Release/assets | none for R-0001 | not attempted | local artifact only |
| Package registry | none | not applicable | package remains private |
| Deployment | none | not attempted | existing v1 service untouched |

## Decision and next step

R-0001 meets its selected trace/accounting outcome. The baseline comparison is inconclusive for recall quality and shows no measured ranking change. Keep the current policy. A future quality release needs labeled missed/stale recall cases before changing ranking. Publication remains unauthorized. Next proposed theme is Relay only if a concrete client/source workflow is selected.
