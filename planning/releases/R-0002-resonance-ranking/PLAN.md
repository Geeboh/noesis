# Release plan: R-0002 Resonance ranking

## Identity and baseline

- Stable release ID: `R-0002-resonance-ranking`.
- Target application version: `1.2.0`.
- Theme and primary outcome: Resonance ranking. Stronger lexical matches must survive bounded recall item limits before weaker matches.
- Accepted baseline: application `1.1.0`, tag `v1.1.0`, commit `481a5ead843886d32f4f42492d5532e3807fd886`, artifact SHA-256 `9adb40fdd90a01bb6a52c4a3bae136b65fc15faa1ecacd4d5c15e877fbf85900`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0002-resonance-ranking/backlog.json`.

## Why this release

The published v1.1.0 release added recall trace accounting but deliberately kept the accepted lexical policy. A deterministic isolated scenario now exposes a concrete quality gap in that policy. One older record matching both query terms can be omitted by `max_items` after newer records matching only one term. The service computes each lexical score but currently consumes the item budget in database recency order.

This is a code-observed behavior, not a user-reported live incident. The live v1.1.0 store is intentionally small and contains no ordinary records, so no lived miss is claimed. The scenario is representative of bounded project resumption because it separates a stronger decision match from weaker routine notes under the same scope and query. The release will keep the change if independent focused cases confirm the ordering rule without changing authorization or provenance.

Relay remains unselected because no concrete second client or source workflow has been identified. This release therefore continues the default quality path rather than inventing an integration.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R2-O1` | Bounded recall returns the strongest lexical evidence first. | `mindRecall` computes term scores but returns records in database recency order. | Hits sort by descending lexical score. Equal scores retain existing recency order and record-id stability. Scope, provenance, coverage, truncation, and character/item budgets remain unchanged. |

Excluded scope:

- Vector, model, graph, MCP, connector, and external backend work.
- Preference, Ebb, dream-policy, Lore, Forge, schema, and database migration changes.
- Changes to scope authorization, source provenance, or live data.
- Remote publication. The v1.1.0 authorization is closed to R-0002; this candidate remains local.

## Tasks and dependencies

`backlog.json` owns four ordered tasks. One integration owner owns the service, focused test, measurement, release records, and final integration. No migration or lockfile change is planned.

1. `R-0002-T001` reproduces the current omission on isolated data.
2. `R-0002-T002` implements score-aware stable ordering and its regression.
3. `R-0002-T003` validates candidate behavior through service and paired Observatory paths.
4. `R-0002-T004` prepares the local candidate and recovery record.

## Evaluation and regression constraints

- Baseline and candidate use equivalent temporary SQLite stores, scopes, records, query, item budget, character budget, runtime, and clock assumptions.
- Primary decision rule: the candidate includes the two-term record when the baseline omits it under the same item limit.
- Development case: one older two-term decision and newer one-term routine notes.
- Independent case: a second arrangement with equal-score ties and a different query must preserve deterministic tie order.
- Negative cases: unauthorized scope records remain absent; non-matches remain absent; character and item truncation remain bounded; provenance remains source-backed.
- Record returned statements, scores, coverage, latency, errors, and limitations. No model calls, embeddings, retries, child jobs, or monetary spend.
- If the candidate does not improve the declared cases without a regression, retain v1.1.0 behavior and record the result as inconclusive.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0 for deterministic local work.
- Effort: 1 to 3 engineering days. Reforecast after the baseline and first regression.

## Compatibility and recovery

The public `mind_recall` input and response envelope remain compatible. Ordering changes only the sequence of existing hits. No database migration or stored-data rewrite is required. Existing v1.1.0 callers may ignore the additive trace fields already present.

Keep the live `/tmp/noesis-m3-dashboard` store outside the candidate checkout. Do not install R-0002 into the live service during local preparation. Recovery is the published v1.1.0 tag/artifact and the backup recorded in `reports/use-v1.1.0.md`. Candidate checks use disposable stores and a separate paired Observatory process or test fixture.

## Release and publication

Run the focused regression, isolated baseline/candidate comparison, paired Observatory recall check, `npm ci --ignore-scripts`, `npm run release:check`, bootstrap validation, tracker validation, and `npm pack --ignore-scripts` with a recorded SHA-256. Prepare `1.2.0` release notes, review, report, compatibility, and known limitations.

No branch push, tag, GitHub release, package publication, or hosted deployment is authorized for R-0002 by this plan.

## Checkpoints

- Baseline checkpoint: confirm the stronger-match omission before editing service code.
- Implementation checkpoint: confirm score-aware ordering and tie behavior with focused regression.
- Integration checkpoint: confirm service, Observatory, and scope behavior on the candidate.
- Closeout checkpoint: record artifact identity, release gate, limitations, recovery, and publication as local-only.

## Next task

Start `R-0002-T001` with the isolated baseline reproduction. Preserve the installed v1.1.0 service and all completed M0-M8 and R-0001 evidence.
