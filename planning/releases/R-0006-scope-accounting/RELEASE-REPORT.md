# Release report: R-0006 Scope accounting

## Identity

- Stable release ID and application version: `R-0006-scope-accounting`, `1.2.4`.
- Accepted prior version/commit: `1.2.3`, tag `v1.2.3`, commit `39323de8fb3c1d877b1c5235a52baa8023b503d6`.
- Candidate implementation: local change from the v1.2.3 baseline; package version `1.2.4`.
- Artifact: `/tmp/noesis-r6-release/noesis-1.2.4.tgz`, SHA-256 `1c2e50fc950aa4edd50f05c42bc456a8f1c6e44b4de853e57c8630cf347dfa7d`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0006-scope-accounting/PLAN.md`.
- Report date: 2026-11-24.

## Delivered result

Default `mindRecall` now reports effective owner-authorized scope IDs when callers omit `scope_ids`. Returned records, explicit scope behavior, authorization, provenance, trace, and budgets remain unchanged.

The baseline returned an owner-authorized record but reported an empty scope list. The candidate reported `operator-scope`, returned the same record, and excluded the other-owner record.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| Baseline scope accounting | passed; owner record returned with empty scope list | v1.2.3 tag extracted into disposable store |
| Candidate default accounting | passed; owner scope listed and other owner excluded | one constructed fixture |
| Service regression | passed, 16 tests | default and explicit scope behavior |
| Paired Observatory scope recall | passed; 401 before pairing, 200 pairing, 200 recall | temporary local server; no physical second device |
| Full release gate | passed, 61 tests | `npm ci --ignore-scripts && npm run release:check` |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0006-T001`: complete with tag-based baseline evidence.
- `R-0006-T002`: complete with effective scope accounting and focused regression.
- `R-0006-T003`: complete with paired Observatory and authorization evidence.
- `R-0006-T004`: complete locally with artifact, review, notes, recovery, and no-publication record.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.2.3 remains the installed and published recovery baseline. R6 was not installed into the live service.

## Installation, data and recovery

R6 is a local patch candidate. Do not replace the live v1.2.3 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published v1.2.3 tag/artifact and `/tmp/noesis-live-backup-v1.2.3/mind.sqlite`.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | none authorized for R6 | not attempted |
| GitHub release/assets | none authorized for R6 | not attempted |
| Package registry | none | not applicable; package remains private |
| Live installation | existing v1.2.3 service | not attempted for R6 |
| Hosted deployment | none | not attempted |

## Decision and next step

R6 meets the selected scope-accounting outcome on the declared isolated case and preserves the tested invariants. The result is not general quality proof because no labeled live corpus exists. Keep v1.2.3 installed until a separate installation decision is made. Next proposed theme remains Relay only after a concrete client/source workflow is selected.
