# Release plan: R-0004 Resonance query normalization

## Identity and baseline

- Stable release ID: `R-0004-query-normalization`.
- Target application version: `1.2.2`.
- Theme and primary outcome: Resonance. Repeated query words must not inflate one lexical term's score over distinct evidence terms.
- Accepted baseline: application `1.2.1`, tag `v1.2.1`, commit `49a1ff5dc3c725b00b2ef2301f58ee9cd55410ae`, artifact SHA-256 `7275f6e0d4c9de50a074dbc021aa73b125608edce4c83d6c8c4fb4851372984f`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0004-query-normalization/backlog.json`.

## Why this patch

Published v1.2.1 preserves lexical score ordering and safe character-budget traversal. A deterministic isolated case exposes a remaining scoring defect. The current scorer iterates duplicate query terms, so `alpha alpha beta` gives an alpha-only record score 2 and a beta-only record score 1. A repeated typo can therefore outrank evidence matching a distinct query term.

This is code-observed behavior, not a user-reported live incident. The live v1.2.1 store contains no ordinary records, so no lived miss is claimed. The case represents ordinary project resumption because users can repeat a word while still asking for multiple distinct concepts. The patch changes only query-term normalization.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R4-O1` | Repeated query words do not distort lexical relevance. | Duplicate query terms are counted repeatedly in `recallScore`. | Terms are deduplicated before scoring. Distinct-term scores, existing deterministic tie order, scope, provenance, coverage, trace, and budgets remain unchanged. |

Excluded scope:

- No ranking-policy change beyond removing duplicate query-term weight.
- No model, vector, graph, MCP, connector, external backend, schema, or database migration.
- No change to scope authorization, provenance, live data, or native OMP configuration.
- No remote publication without new explicit authorization for R4.

## Tasks and dependencies

`backlog.json` owns four ordered tasks. One integration owner owns the service, measurement, tests, release records, and final integration. No migration or lockfile change is planned.

1. `R-0004-T001` reproduces duplicate-term score inflation.
2. `R-0004-T002` deduplicates terms and adds a focused regression.
3. `R-0004-T003` validates candidate service and paired Observatory behavior.
4. `R-0004-T004` prepares the local patch candidate and recovery record.

## Evaluation and regression constraints

- Baseline and candidate use equivalent temporary SQLite stores, scopes, records, query, item budget, character budget, runtime, and clock assumptions.
- Primary decision rule: with query `alpha alpha beta`, an alpha-only hit no longer receives a higher score than a beta-only hit solely from repetition.
- Distinct query terms retain one point each. Empty queries still list authorized records.
- Preserve R3 budget continuation, scope denial, source provenance, trace identity, usage accounting, `max_items`, `max_chars`, and truthful omission/truncation fields.
- Record returned statements, reasons, scores, latency, errors, and limitations. No model calls, embeddings, retries, child jobs, or monetary spend.
- If the candidate cannot improve the declared case without a regression, retain v1.2.1 behavior and record the result as inconclusive.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0 for deterministic local work.
- Effort: 1 to 2 engineering days. Reforecast after the baseline and focused regression.

## Compatibility and recovery

The public `mind_recall` input and response shape remain compatible. Only lexical match scoring changes for duplicate terms. No database migration or stored-data rewrite is required.

Keep the live `/tmp/noesis-m3-dashboard` store outside the candidate checkout. R4 checks use disposable stores and a temporary paired Observatory process. Recovery is the published v1.2.1 tag/artifact and `/tmp/noesis-live-backup-v1.2.1/mind.sqlite`.

## Release and publication

Run the focused service regression, isolated baseline/candidate measurement, paired Observatory recall, `npm ci --ignore-scripts`, `npm run release:check`, bootstrap validation, tracker validation, and `npm pack --ignore-scripts` with a recorded SHA-256. Prepare `1.2.2` release notes, review, report, installation/recovery record, and known limitations.

No branch push, tag, GitHub release, package publication, or hosted deployment is authorized for R4 by this plan.

## Next task

Start `R-0004-T001` with the isolated duplicate-term baseline reproduction. Keep v1.2.1 installed until the local patch passes its gates.
