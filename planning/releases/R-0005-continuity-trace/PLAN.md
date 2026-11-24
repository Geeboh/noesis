# Release plan: R-0005 Continuity trace

## Identity and baseline

- Stable release ID: `R-0005-continuity-trace`.
- Target application version: `1.2.3`.
- Theme and primary outcome: Continuity trace. Native OMP recall attachments retain retrieval identity and bounded coverage.
- Accepted baseline: application `1.2.2`, tag `v1.2.2`, commit `9651a53f025996108ed3b84e98323612e66f68c5`, artifact SHA-256 `1ae411adbac14a332b07be1ae064845d4c8a50c460284f40a9cf56e42852fd44`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0005-continuity-trace/backlog.json`.

## Why this patch

The service has exposed trace identity and retrieval coverage since v1.1.0. The native OMP adapter's `buildRecallAttachment` currently forwards only hit text, reason, and provenance. The model or later session state cannot identify which retrieval trace prepared the context or how many authorized records were matched and included.

This is a code-observed continuity gap, not a user-reported live incident. The live v1.2.2 store contains no ordinary records, so no missed delivery is claimed. The patch adds compact metadata only when a nonempty recall result exists. It does not change retrieval, authorization, or source evidence.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R5-O1` | Prepared native context carries retrieval identity and bounded accounting. | Native attachment omits `trace_id` and coverage. | Nonempty attachment includes trace identity and included/matched counts when provided; hit content and provenance stay unchanged; empty result remains empty. |

Excluded scope:

- No retrieval ranking, scoring, scope, provenance, or budget policy change.
- No model, vector, graph, MCP, connector, external backend, schema, or database migration.
- No live data rewrite or native OMP configuration change.
- No remote publication without new explicit authorization for R5.

## Tasks and dependencies

1. `R-0005-T001` reproduces the missing attachment metadata.
2. `R-0005-T002` adds compact trace and coverage metadata with regression coverage.
3. `R-0005-T003` validates native OMP, service, and Observatory compatibility.
4. `R-0005-T004` prepares the local patch candidate and recovery record.

## Evaluation and regression constraints

- Baseline and candidate use equivalent service response fixtures.
- Primary decision rule: a nonempty attachment contains the exact trace ID and included/matched counts from the supplied result.
- Existing hit statements, record IDs, revisions, reasons, and provenance labels remain present.
- Empty data returns the existing empty string.
- No unauthorized ID or scope data is derived from metadata.
- No model calls, embeddings, retries, child jobs, or monetary spend.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0.
- Effort: 1 engineering day. Reforecast after focused regression.

## Compatibility and recovery

The native extension's tool and event interfaces remain unchanged. The attachment gains one compact metadata line for nonempty recall. No database migration is required. Recovery is the published v1.2.2 tag/artifact and `/tmp/noesis-live-backup-v1.2.2/mind.sqlite`.

Keep v1.2.2 installed while the candidate is local. Use disposable stores for any native probe. Do not change OMP memory configuration.

## Release and publication

Run focused attachment tests, the service and Observatory suites, a native OMP extension probe, `npm ci --ignore-scripts`, `npm run release:check`, bootstrap and tracker validation, and `npm pack --ignore-scripts` with a recorded checksum. Prepare `1.2.3` notes, review, report, and recovery records.

No branch push, tag, GitHub release, package publication, or hosted deployment is authorized for R5 by this plan.

## Next task

Start `R-0005-T001` with the attachment regression baseline. Keep v1.2.2 installed until the local patch passes its gates.
