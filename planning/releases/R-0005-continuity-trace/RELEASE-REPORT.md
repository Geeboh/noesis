# Release report: R-0005 Continuity trace

## Identity

- Stable release ID and application version: `R-0005-continuity-trace`, `1.2.3`.
- Accepted prior version/commit: `1.2.2`, tag `v1.2.2`, commit `9651a53f025996108ed3b84e98323612e66f68c5`.
- Candidate implementation: local change from the v1.2.2 baseline; package version `1.2.3`.
- Artifact: `/tmp/noesis-r5-release/noesis-1.2.3.tgz`, SHA-256 `b1c73ab39a16833c87d6868921da6174df6fd2ff10e9068f62262cb1c3a5fdb4`.
- Environment: Linux x86_64, Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0005-continuity-trace/PLAN.md`.
- Report date: 2026-11-24.

## Delivered result

Native OMP recall attachments now carry a compact trace and coverage line when the service returns records. Existing hit content, reasons, provenance, empty-result behavior, retrieval policy, and authorization remain unchanged.

The v1.2.2 baseline dropped trace and coverage from a trace-bearing service result. The candidate preserves `trace-1`, `included=1`, and `matched=2` in the attachment.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| Baseline attachment reproduction | passed; trace and coverage absent | v1.2.2 tag extracted into disposable store |
| Candidate attachment | passed; trace and included/matched counts present | adapter-level evidence only |
| Focused tests | passed, 17 tests | attachment, service, and recall regressions |
| Full release gate | passed, 60 tests | `npm ci --ignore-scripts && npm run release:check` |
| Native OMP probe | passed; extension ready and `OK` returned | no model-accepted tool delivery claim |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0005-T001`: complete with v1.2.2 baseline attachment evidence.
- `R-0005-T002`: complete with trace/coverage metadata and focused regression.
- `R-0005-T003`: complete with native probe and full service/Observatory gate.
- `R-0005-T004`: complete locally with artifact, review, notes, recovery, and no-publication record.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.2.2 remains the installed and published recovery baseline. R5 was not installed into the live service.

## Installation, data and recovery

R5 is a local patch candidate. Do not replace the live v1.2.2 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published v1.2.2 tag/artifact and `/tmp/noesis-live-backup-v1.2.2/mind.sqlite`.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | none authorized for R5 | not attempted |
| GitHub release/assets | none authorized for R5 | not attempted |
| Package registry | none | not applicable; package remains private |
| Live installation | existing v1.2.2 service | not attempted for R5 |
| Hosted deployment | none | not attempted |

## Decision and next step

R5 meets the selected adapter-continuity outcome on the declared fixture and preserves the tested invariants. It does not prove model acceptance or task usefulness. Keep v1.2.2 installed until a separate installation decision is made. Next proposed theme remains Relay only after a concrete client/source workflow is selected.
