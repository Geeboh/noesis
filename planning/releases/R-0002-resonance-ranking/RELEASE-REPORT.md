# Release report: R-0002 Resonance ranking

## Identity

- Stable release ID and application version: `R-0002-resonance-ranking`, `1.2.0`.
- Accepted prior version/commit: `1.1.0`, tag `v1.1.0`, commit `481a5ead843886d32f4f42492d5532e3807fd886`.
- Candidate implementation commit: `0cf24ad1dc2868a72ce0feb11b6bbe5abfc95e38`.
- Artifact: `/tmp/noesis-r2-release/noesis-1.2.0.tgz`, SHA-256 `e41d52290c61f9cb9a7f43d0f275220fd6541a2da7c1e16bb8751e934fac4a49`.
- Environment: Linux x86_64, Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0002-resonance-ranking/PLAN.md`.
- Report date: 2026-11-24.

## Delivered result

`mindRecall` now orders eligible lexical hits by descending query-term match score before applying the existing item and character budgets. Equal-score hits retain the existing recency order. Scope checks, provenance, trace accounting, truncation, and response shape remain unchanged.

The baseline reproduced an older two-term decision being omitted while newer one-term routine notes consumed `max_items`. The candidate included the stronger decision in all five repetitions and never returned the unauthorized record.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| Baseline gap reproduction | passed; stronger decision omitted; unauthorized record absent | one isolated constructed fixture |
| Candidate ranking | passed; stronger decision included 5/5 runs before weaker hits | no labeled user corpus |
| Service regression | passed, 13 tests | score-aware ordering and bounded truncation |
| Observatory suite | passed, 6 tests | paired candidate journey separately exercised |
| Paired Observatory recall | passed; 401 before pairing, 200 pairing, 200 recall; stronger decision first | temporary local server; no physical second device |
| Full release gate | passed, 57 tests | `npm ci --ignore-scripts && npm run release:check` |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0002-T001`: complete with baseline omission evidence.
- `R-0002-T002`: complete with score-aware ordering and focused regression.
- `R-0002-T003`: complete with candidate repetitions, scope denial, and paired Observatory evidence.
- `R-0002-T004`: complete locally with artifact, review, notes, and recovery record.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.1.0 remains the installed and published recovery baseline. R2 was not installed into the live service.

## Installation, data and recovery

R2 is a local candidate. Do not replace the live v1.1.0 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published `v1.1.0` tag/artifact and its recorded live backup.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | none authorized for R2 | not attempted |
| GitHub release/assets | none authorized for R2 | not attempted |
| Package registry | none | not applicable; package remains private |
| Hosted deployment | none authorized for R2 | not attempted |

## Decision and next step

R2 meets the selected ranking outcome on the declared isolated case and preserves the tested invariants. The result is encouraging but not general quality proof because no labeled live corpus exists. Keep v1.1.0 installed until a separate installation decision is made. Next proposed theme remains Relay only after a concrete client/source workflow is selected.
