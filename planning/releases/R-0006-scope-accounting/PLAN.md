# Release plan: R-0006 Scope accounting

## Identity and baseline

- Stable release ID: `R-0006-scope-accounting`.
- Target application version: `1.2.4`.
- Theme and primary outcome: Scope accounting. Default recall coverage identifies the effective authorized scopes.
- Accepted baseline: application `1.2.3`, tag `v1.2.3`, commit `39323de8fb3c1d877b1c5235a52baa8023b503d6`, artifact SHA-256 `b1c73ab39a16833c87d6868921da6174df6fd2ff10e9068f62262cb1c3a5fdb4`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0006-scope-accounting/backlog.json`.

## Why this patch

R5 made native attachments carry service retrieval accounting. The dashboard recall route calls `mindRecall` without explicit `scope_ids`; the service still filters records by the principal, but the response coverage reports an empty scope list. This hides the effective authorization boundary from the same trace that explains retrieval.

This is a code-observed accounting gap, not a user-reported leak. The live v1.2.3 store contains no ordinary records, so no lived disclosure is claimed. The patch makes default owner-authorized scope selection explicit in coverage without broadening access. Explicit scope requests keep their existing validation and behavior.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R6-O1` | Recall coverage names effective authorized scopes. | Default recall returns owner-filtered records but reports `coverage.scope_ids: []`. | Default coverage lists only owner-authorized scope IDs; returned records, explicit scope behavior, provenance, trace, and budgets remain unchanged. |

Excluded scope:

- No retrieval ranking, scoring, provenance, budget, or native attachment change.
- No model, vector, graph, MCP, connector, external backend, schema, or database migration.
- No live data rewrite or native OMP configuration change.
- No remote publication without new explicit authorization for R6.

## Tasks and dependencies

1. `R-0006-T001` reproduces empty default scope accounting with owner filtering.
2. `R-0006-T002` computes effective owner-authorized scopes and adds focused regression coverage.
3. `R-0006-T003` validates dashboard, service, and authorization behavior.
4. `R-0006-T004` prepares the local patch candidate and recovery record.

## Evaluation and regression constraints

- Baseline and candidate use equivalent temporary stores with two owner scopes and one other-owner scope.
- Primary decision rule: default coverage lists the owner scope while returned records remain identical.
- Explicit scope IDs still return the requested authorized scope and reject unavailable scopes.
- Unauthorized records and scope IDs never enter results or coverage.
- No model calls, embeddings, retries, child jobs, or monetary spend.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0.
- Effort: 1 engineering day.

## Compatibility and recovery

The `mindRecall` response shape is unchanged. Default coverage becomes more truthful. No database migration is required. Recovery is the published v1.2.3 tag/artifact and `/tmp/noesis-live-backup-v1.2.3/mind.sqlite`.

Keep v1.2.3 installed while the candidate is local. Use disposable stores for validation.

## Release and publication

Run focused service/scope tests, paired Observatory recall, the full release gate, bootstrap and tracker validation, and `npm pack --ignore-scripts` with a checksum. Prepare `1.2.4` notes, review, report, and recovery records.

No branch push, tag, GitHub release, package publication, or hosted deployment is authorized for R6 by this plan.

## Next task

Start `R-0006-T001` with the isolated default-scope baseline reproduction. Keep v1.2.3 installed until the local patch passes its gates.
