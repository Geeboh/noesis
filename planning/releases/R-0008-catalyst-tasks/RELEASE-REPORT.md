# Release report: R-0008 Catalyst proposal tasks

## Identity

- Stable release ID and application version: `R-0008-catalyst-tasks`, `1.4.0`.
- Accepted prior version/commit: `1.3.0`, tag `v1.3.0`, commit `1c00047fc817d8754439009cf95e272c6704cd0d`.
- Candidate implementation: local task-manifest projection; package version `1.4.0`.
- Artifact: `/tmp/noesis-r8-release/noesis-1.4.0.tgz`, SHA-256 `2902151ca22e8abeed0b75c9b32389342200c935c77b36ef5355f38bc9000025`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0008-catalyst-tasks/PLAN.md`.
- Report date: 2026-11-25.

## Delivered result

A paired operator can request a derived task manifest for a resource's scoped Blueprint hypotheses. Each item is explicitly proposed, carries source and hypothesis identity, retains provenance and scope, lists validation-needed data, and states that execution was not requested. The route does not persist or execute tasks.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| Scoped task projection | passed | focused Forge fixture |
| Proposal-only semantics | passed | status `proposed`; execution `not_requested`; no persistence |
| Paired task route | passed | HTTP 401 before pairing, HTTP 200 after pairing |
| Full release gate | passed, 63 tests | `npm ci --ignore-scripts && npm run release:check` |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0008-T001`: complete with scoped task projection evidence.
- `R-0008-T002`: complete with paired task-manifest route.
- `R-0008-T003`: complete with privacy, pairing, scope, and non-execution evidence.
- `R-0008-T004`: complete locally with artifact, review, notes, recovery, and no-publication record.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.3.0 remains the installed and published recovery baseline. R8 was not installed into the live service.

## Installation, data and recovery

R8 is a local candidate. Do not replace the live v1.3.0 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published v1.3.0 tag/artifact and `/tmp/noesis-live-backup-v1.3/mind.sqlite`.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | none authorized for R8 | not attempted |
| GitHub release/assets | none authorized for R8 | not attempted |
| Package registry | none | not applicable; package remains private |
| Live installation | existing v1.3.0 service | not attempted for R8 |
| Hosted deployment | none | not attempted |

## Decision and next step

R8 meets the selected proposal-to-task projection outcome on the declared Forge/Blueprint fixture and preserves the tested invariants. It does not prove task usefulness because no task was executed or measured. Keep v1.3.0 installed until a separate installation decision is made. Next recommended step is one real proposal-to-task outcome evaluation before expanding execution semantics.
