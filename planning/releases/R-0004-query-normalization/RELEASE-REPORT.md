# Release report: R-0004 Resonance query normalization

## Identity

- Stable release ID and application version: `R-0004-query-normalization`, `1.2.2`.
- Accepted prior version/commit: `1.2.1`, tag `v1.2.1`, commit `49a1ff5dc3c725b00b2ef2301f58ee9cd55410ae`.
- Candidate implementation: local change from the v1.2.1 baseline; package version `1.2.2`.
- Artifact: `/tmp/noesis-r4-release/noesis-1.2.2.tgz`, SHA-256 `1ae411adbac14a332b07be1ae064845d4c8a50c460284f40a9cf56e42852fd44`.
- Environment: Linux x86_64, Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0004-query-normalization/PLAN.md`.
- Report date: 2026-11-24.

## Delivered result

`mindRecall` now deduplicates lowercased query terms before lexical scoring. Repeated words contribute once. Distinct query terms retain one point each. Existing R3 budget continuation, R2 score ordering, scope checks, provenance, trace accounting, truncation, and response shape remain unchanged.

The baseline selected an older alpha-only record for `alpha alpha beta` with score reason `matched 2 query terms`. The candidate selected the newer beta-only record with reason `matched 1 query term`.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| Baseline duplicate-term reproduction | passed; repeated alpha term inflated score | v1.2.1 tag extracted into disposable store |
| Candidate normalization | passed; distinct terms scored once | one constructed fixture |
| Service regression | passed, 15 tests | duplicate-term and prior recall regressions |
| Observatory suite | passed within 59-test release gate | paired normalization journey separately exercised |
| Paired Observatory normalization | passed; 401 before pairing, 200 pairing, 200 recall | temporary local server; no physical second device |
| Full release gate | passed, 59 tests | `npm ci --ignore-scripts && npm run release:check` |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0004-T001`: complete with tag-based baseline evidence.
- `R-0004-T002`: complete with distinct-term scoring and focused regression.
- `R-0004-T003`: complete with candidate measurement, scope denial, and paired Observatory evidence.
- `R-0004-T004`: complete locally with artifact, review, notes, recovery, and no-publication record.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.2.1 remains the installed and published recovery baseline. R4 was not installed into the live service.

## Installation, data and recovery

R4 is a local patch candidate. Do not replace the live v1.2.1 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published v1.2.1 tag/artifact and `/tmp/noesis-live-backup-v1.2.1/mind.sqlite`.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | none authorized for R4 | not attempted |
| GitHub release/assets | none authorized for R4 | not attempted |
| Package registry | none | not applicable; package remains private |
| Live installation | managed `noesis-dashboard` | passed; `reports/use-v1.2.2.md`; backup preserved and v1.2.2 health/pairing verified |
| Hosted deployment | none | not attempted |

## Decision and next step

R4 meets the selected normalization outcome on the declared isolated case and preserves the tested invariants. The result is not general quality proof because no labeled live corpus exists. v1.2.2 is installed locally and publication is authorized and pending. Next proposed theme remains Relay only after a concrete client/source workflow is selected.
