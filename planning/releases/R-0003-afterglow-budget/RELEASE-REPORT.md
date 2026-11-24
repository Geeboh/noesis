# Release report: R-0003 Afterglow budget safety

## Identity

- Stable release ID and application version: `R-0003-afterglow-budget`, `1.2.1`.
- Accepted prior version/commit: `1.2.0`, tag `v1.2.0`, commit `0b7a5a5b7fe69fff1c4dc14b5b92522e3ea021ad`.
- Candidate implementation commit: `b6be3179506e9e8844978c585bfd5cf8cf88c199`.
- Artifact: `/tmp/noesis-r3-release/noesis-1.2.1.tgz`, SHA-256 `7275f6e0d4c9de50a074dbc021aa73b125608edce4c83d6c8c4fb4851372984f`.
- Environment: Linux x86_64, Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0003-afterglow-budget/PLAN.md`.
- Report date: 2026-11-24.

## Delivered result

`mindRecall` now continues scanning after a matched hit does not fit the remaining `max_chars` budget. The hit is omitted and counted as a budget omission. Later eligible records can fill the remaining item and character budgets. Existing R2 score order, scope checks, provenance, trace accounting, truncation, and response shape remain unchanged.

The baseline returned no records from a constructed case because one oversized high-score hit stopped traversal. The candidate returned three smaller authorized records and kept the oversized and unauthorized records out of the response.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| Baseline starvation reproduction | passed; empty result after one budget omission | one isolated constructed fixture |
| Candidate budget handling | passed; three fitting records returned; oversized absent | no labeled user corpus |
| Service regression | passed, 14 tests | budget continuation and prior score ordering |
| Observatory suite | passed, 6 tests | existing paired journeys |
| Paired Observatory budget recall | passed; 401 before pairing, 200 pairing, 200 recall; smaller records returned | temporary local server; no physical second device |
| Full release gate | passed, 58 tests | `npm ci --ignore-scripts && npm run release:check` |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0003-T001`: complete with baseline budget-starvation evidence.
- `R-0003-T002`: complete with continue-after-omission change and focused regression.
- `R-0003-T003`: complete with candidate measurement, scope denial, and paired Observatory evidence.
- `R-0003-T004`: complete locally with artifact, review, notes, recovery, and no-publication record.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.2.0 remains the installed and published recovery baseline. R3 was not installed into the live service.

## Installation, data and recovery

R3 is a local patch candidate. Do not replace the live v1.2.0 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published `v1.2.0` tag/artifact and `/tmp/noesis-live-backup-v1.2/mind.sqlite`.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | `https://github.com/Geeboh/noesis` | passed; commit `49a1ff5dc3c725b00b2ef2301f58ee9cd55410ae`, tag `v1.2.1` |
| GitHub release/assets | `https://github.com/Geeboh/noesis` | passed; [release](https://github.com/Geeboh/noesis/releases/tag/v1.2.1) and `noesis-1.2.1.tgz` uploaded |
| Package registry | none | not applicable; package remains private |
| Live installation | managed `noesis-dashboard` | passed; `reports/use-v1.2.1.md`; backup preserved and v1.2.1 health/pairing verified |
| Hosted deployment | none | not attempted |

## Decision and next step

R3 meets the selected budget-safety outcome on the declared isolated case and preserves the tested invariants. The result is not general quality proof because no labeled live corpus exists. v1.2.1 is published and installed locally. Next proposed theme remains Relay only after a concrete client/source workflow is selected.
