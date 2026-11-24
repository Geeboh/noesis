# Release report: R-0007 Relay source refresh

## Identity

- Stable release ID and application version: `R-0007-relay-source-refresh`, `1.3.0`.
- Accepted prior version/commit: `1.2.4`, tag `v1.2.4`, commit `6c6a3759b99ae3d2873303511288f489d9fa94e7`.
- Candidate implementation: local Relay source-refresh change; package version `1.3.0`.
- Artifact: `/tmp/noesis-r7-release/noesis-1.3.0.tgz`, SHA-256 `4fedc13343b74e9eb63c9288692e6f6d8146e40a7d66aaa67d7bbdd4783addd3`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Plan: `planning/releases/R-0007-relay-source-refresh/PLAN.md`.
- Report date: 2026-11-25.

## Delivered result

Paired operators can now request one bounded refresh of an existing URL resource. The workflow validates the URL, makes one unauthenticated HTTP(S) request without redirects, enforces a 65,536-byte body limit, persists a digest-backed observed snapshot, and records Atlas Chronicle history. Failed refreshes do not add snapshots.

The paired `https://example.com` smoke registered a resource and refreshed it through the new route. Existing manual snapshot, scope, pairing, and provenance behavior remained intact.

## Validation

| Outcome/check | Result | Evidence and limitation |
| --- | --- | --- |
| URL and response safety | passed | credentials, private host, redirect, non-2xx, and oversized body failures |
| Snapshot persistence | passed | 200 response, SHA-256 digest, observed status, prior preservation |
| Paired Relay journey | passed | `https://example.com` registered and refreshed through HTTP API |
| Focused Atlas/Observatory tests | passed, 9 tests | temporary stores and paired HTTP |
| Full release gate | passed, 62 tests | `npm ci --ignore-scripts && npm run release:check` |
| Bootstrap/tracker validation | passed | full JSON Schema dependencies unavailable |
| Artifact | passed; SHA-256 recorded above | local artifact only |

## Scope disposition

- `R-0007-T001`: complete with bounded URL and response failure evidence.
- `R-0007-T002`: complete with authorized refresh, digest snapshot, and Chronicle evidence.
- `R-0007-T003`: complete with paired Relay success and failure journeys.
- `R-0007-T004`: complete locally with artifact, review, notes, recovery, and no-publication record.
- No database migration, live-data rewrite, model call, embedding, retry, child job, or external write occurred.
- v1.2.4 remains the installed and published recovery baseline. R7 was not installed into the live service.

## Installation, data and recovery

R7 is a local candidate. Do not replace the live v1.2.4 checkout or data directory with this candidate without a new installation decision. If selected later, run `npm ci --ignore-scripts` and `npm run release:check`, back up the live SQLite store with `backupDatabase`, then follow `docs/15-OPERATIONS-RUNBOOK.md`. No migration is required. Rollback is the published v1.2.4 tag/artifact and `/tmp/noesis-live-backup-v1.2.4/mind.sqlite`.

## Publication

| Action | Destination | Observed result |
| --- | --- | --- |
| Branch/tag push | none authorized for R7 | not attempted |
| GitHub release/assets | none authorized for R7 | not attempted |
| Package registry | none | not applicable; package remains private |
| Live installation | managed `noesis-dashboard` | passed; `reports/use-v1.3.0.md`; backup preserved and v1.3.0 health/pairing verified |
| Hosted deployment | none | not attempted |

## Decision and next step

R7 meets the selected Relay source-refresh outcome on the declared paired example.com workflow and preserves the tested invariants. v1.3.0 is installed locally and publication is authorized and pending. Next proposed theme is Catalyst only after a concrete proposal-to-task workflow is selected.
