# Release plan: R-0003 Afterglow budget safety

## Identity and baseline

- Stable release ID: `R-0003-afterglow-budget`.
- Target application version: `1.2.1`.
- Theme and primary outcome: Afterglow. Budgeted recall must continue past a non-fitting hit and return smaller relevant evidence.
- Accepted baseline: application `1.2.0`, tag `v1.2.0`, commit `0b7a5a5b7fe69fff1c4dc14b5b92522e3ea021ad`, artifact SHA-256 `5eb5bb73c4e0c892a8389e32ea55364de31a468d2100c7d6c10ea343f6fe88d9`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0003-afterglow-budget/backlog.json`.

## Why this patch

Published v1.2.0 improved lexical ordering. A new deterministic isolated case exposes a bounded-output defect in the same recall path. When the highest-scoring hit is longer than the remaining `max_chars` budget, `mindRecall` increments budget omission and stops. Smaller authorized matches after that hit are never considered, producing an empty result even though relevant evidence fits.

This is code-observed behavior, not a user-reported live incident. The live v1.2.0 store contains no ordinary records, so no lived miss is claimed. The case represents bounded project resumption because a detailed decision can coexist with shorter supporting notes. The patch changes only budget traversal; it does not weaken the character limit or include an oversized hit.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R3-O1` | Recall returns fitting relevant evidence instead of stopping at the first oversized hit. | A non-fitting hit breaks recall after one budget omission. | A non-fitting hit is omitted, recall continues to later eligible records, and returned hits remain within `max_chars` and `max_items` with truthful coverage and truncation. |

Excluded scope:

- No ranking-policy change beyond preserving v1.2.0 score ordering.
- No model, vector, graph, MCP, connector, external backend, schema, or database migration.
- No change to scope authorization, provenance, live data, or native OMP configuration.
- No remote publication without new explicit authorization for R3.

## Tasks and dependencies

`backlog.json` owns four ordered tasks. One integration owner owns the service, measurement, tests, release records, and final integration. No migration or lockfile change is planned.

1. `R-0003-T001` reproduces the budget-starvation case.
2. `R-0003-T002` changes budget handling and adds a focused regression.
3. `R-0003-T003` validates service and paired Observatory behavior.
4. `R-0003-T004` prepares the local patch candidate and recovery record.

## Evaluation and regression constraints

- Baseline and candidate use equivalent temporary SQLite stores, scopes, records, query, item budget, character budget, runtime, and clock assumptions.
- Primary decision rule: the candidate returns at least one fitting smaller match after omitting the oversized high-score hit.
- Preserve descending lexical score order among returned hits.
- Preserve scope denial, source provenance, trace identity, usage accounting, `max_items`, `max_chars`, and truthful omission/truncation fields.
- The oversized hit must not appear in the response or push `used_chars` over the budget.
- Record returned statements, estimated characters, coverage, latency, errors, and limitations. No model calls, embeddings, retries, child jobs, or monetary spend.
- If the patch cannot improve the case without a regression, retain v1.2.0 behavior and record the result as inconclusive.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0 for deterministic local work.
- Effort: 1 to 2 engineering days. Reforecast after the baseline and focused regression.

## Compatibility and recovery

The public `mind_recall` input and response shape remain compatible. The patch changes traversal after a budget omission only. No database migration or stored-data rewrite is required.

Keep the live `/tmp/noesis-m3-dashboard` store outside the candidate checkout. R3 checks use disposable stores and a temporary paired Observatory process. Recovery is the published v1.2.0 tag/artifact and `/tmp/noesis-live-backup-v1.2/mind.sqlite`.

## Release and publication

Run the focused service regression, isolated baseline/candidate measurement, paired Observatory recall, `npm ci --ignore-scripts`, `npm run release:check`, bootstrap validation, tracker validation, and `npm pack --ignore-scripts` with a recorded SHA-256. Prepare `1.2.1` release notes, review, report, installation/recovery record, and known limitations.

No branch push, tag, GitHub release, package publication, or hosted deployment is authorized for R3 by this plan.

## Next task

Start `R-0003-T001` with the isolated baseline reproduction. Keep v1.2.0 installed until the local patch passes its gates.
