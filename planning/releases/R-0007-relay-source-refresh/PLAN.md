# Release plan: R-0007 Relay source refresh

## Identity and baseline

- Stable release ID: `R-0007-relay-source-refresh`.
- Target application version: `1.3.0`.
- Theme and primary outcome: Relay. An operator-triggered HTTP(S) refresh creates one bounded, source-backed Atlas snapshot.
- Accepted baseline: application `1.2.4`, tag `v1.2.4`, commit `6c6a3759b99ae3d2873303511288f489d9fa94e7`, artifact SHA-256 `1c2e50fc950aa4edd50f05c42bc456a8f1c6e44b4de853e57c8630cf347dfa7d`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0007-relay-source-refresh/backlog.json`.

## Why this workflow

M2 already validated a live `https://example.com` fetch, two authenticated snapshot writes, distinct digests, source-change Chronicle history, and preserved prior snapshots. The implementation still requires a caller to fetch and supply the snapshot. Relay now selects one concrete workflow from that evidence: a paired operator asks the Observatory to refresh an existing URL resource once.

This is not automatic crawling or a general web ingester. The refresh is explicit, bounded, unauthenticated, non-rendering, and single-request. The source URL is evidence metadata, not proof of installation, use, or evaluation.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R7-O1` | Operator-triggered source refresh creates inspectable current evidence. | Atlas accepts manually supplied snapshots only. | Paired refresh fetches one authorized HTTP(S) URL, stores a digest-backed snapshot, preserves prior snapshots, writes source-change history, and rejects credentials, redirects, oversized bodies, unsupported schemes, and failed responses without partial state. |

Excluded scope:

- No automatic crawling, scheduling, cookies, authentication, JavaScript rendering, pagination, or link following.
- No redirects, URL credentials, loopback/private-network targets, model, vector, graph, MCP, or external backend.
- No migration or live-data rewrite. Tests use disposable stores and a local fetch stub.
- No remote publication without new explicit authorization for R7.

## Tasks and dependencies

1. `R-0007-T001` defines and tests bounded URL validation and response limits.
2. `R-0007-T002` adds authorized Atlas refresh and snapshot persistence.
3. `R-0007-T003` adds a paired Observatory refresh journey and failure cases.
4. `R-0007-T004` prepares the local Relay candidate and recovery record.

## Evaluation and regression constraints

- Success case uses a registered URL resource and a deterministic fetch stub returning a bounded HTTP 200 body.
- Real-source smoke may use `https://example.com` only when available; it is supplemental, not the sole proof.
- Failure cases cover credentials, unsupported scheme, redirect response, non-2xx response, and body over 65,536 bytes.
- Failed refresh must not add a snapshot or Chronicle event.
- Resource scope authorization, snapshot digest, prior-snapshot preservation, source-change event, and state invalidation remain intact.
- No model calls, embeddings, retries, child jobs, or monetary spend.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Maximum body: 65,536 bytes.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0.
- Effort: 2 to 4 engineering days. Reforecast after URL validation and first paired journey.

## Compatibility and recovery

The new refresh route is additive. Existing Atlas registration, manual snapshot, source lineage, pairing, and archive semantics remain unchanged. No migration is required. Recovery is the published v1.2.4 tag/artifact and `/tmp/noesis-live-backup-v1.2.4/mind.sqlite`.

Keep v1.2.4 installed while the candidate is local. Refresh tests use disposable resources and injected fetch behavior; no live store refresh occurs during candidate preparation.

## Release and publication

Run URL/fetch unit checks, Atlas snapshot tests, paired Observatory refresh and failure journeys, `npm ci --ignore-scripts`, `npm run release:check`, bootstrap and tracker validation, and `npm pack --ignore-scripts` with a checksum. Prepare `1.3.0` notes, review, report, and recovery records.

No branch push, tag, GitHub release, package publication, or hosted deployment is authorized for R7 by this plan.

## Next task

Start `R-0007-T001` with bounded URL validation and failure tests. Keep v1.2.4 installed until the local Relay candidate passes its gates.
