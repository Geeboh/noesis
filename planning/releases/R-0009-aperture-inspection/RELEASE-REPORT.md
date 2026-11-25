# Release report: R-0009 Aperture exact inspection

## Identity

- Stable release ID and application version: `R-0009-aperture-inspection`, `1.5.0`.
- Accepted prior version/commit: `1.4.0`, tag `v1.4.0`, commit `bcc58d4089fc6fda2f65199464b85917e5f0257b`.
- Candidate implementation: local revision-bound inspection change; package version `1.5.0`.
- Artifact: `/tmp/noesis-r9-release/noesis-1.5.0.tgz`, SHA-256 `891a98ec75c0a4ec923696961a02d26ba537b0541eebcf0061f1f59aa39aa30d`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0009-aperture-inspection/PLAN.md`.
- Decision: `reports/decisions/DEC-0004-aperture-origami.md`.
- Report date: 2026-11-25.

## Delivered result

`mind_inspect` now supports optional bounded UTF-8 statement/content pages. Each page is bound to exact record revision, field, page size, and caller authorization. The response reports exact/partial/unavailable kind, ranges, byte counts, an opaque continuation, and unverified integrity status when no range digest exists. Existing full inspection and source rows remain compatible.

OMP capability revision 2 advertises inspection limits. No Origami summary, provider proxy, upstream kernel, or new top-level tool was added.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| Exact/partial paging | passed | UTF-8 concatenation matched retained statement |
| Cursor/scope safety | passed | mismatched authorization failed without record disclosure |
| Observatory inspection | passed | paired partial inspection returned coverage and continuation |
| Native OMP capability | passed | capability revision 2, inspection metadata, simple probe |
| Full release gate | passed, 64 tests | `npm ci --ignore-scripts && npm run release:check` |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0009-T001`: complete with retained-shape inventory and current inspection-limit evidence.
- `R-0009-T002`: complete with bounded revision-bound inspection pages.
- `R-0009-T003`: complete with native and paired Observatory inspection evidence.
- `R-0009-T004`: complete locally with artifact, review, notes, recovery, and adoption decision.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.4.0 remains the installed and published recovery baseline. R9 was not installed into the live service.

## Installation, data and recovery

R9 is a local candidate. Do not replace the live v1.4.0 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published v1.4.0 tag/artifact and `/tmp/noesis-live-backup-v1.4/mind.sqlite`.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | none authorized for R9 | not attempted |
| GitHub release/assets | none authorized for R9 | not attempted |
| Package registry | none | not applicable; package remains private |
| Live installation | existing v1.4.0 service | not attempted for R9 |
| Hosted deployment | none | not attempted |

## Decision and next step

Adopt R9 exact inspection for the deterministic correctness slice. Defer Origami summaries until a measured exact-detail recovery need exists. Keep v1.4.0 installed until a separate installation decision is made. Next step is evaluate exact inspection on a real coding and noncoding long-history corpus before adding derived summaries.
