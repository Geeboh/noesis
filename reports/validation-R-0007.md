# Validation report: R-0007 Relay source refresh

## Candidate

- Baseline: NOESIS v1.2.4, tag `v1.2.4`, commit `6c6a3759b99ae3d2873303511288f489d9fa94e7`, artifact SHA-256 `1c2e50fc950aa4edd50f05c42bc456a8f1c6e44b4de853e57c8630cf347dfa7d`.
- Candidate implementation: local Relay source-refresh change plus package version `1.3.0`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Source refresh checks

- Authorized injected fetch returned HTTP 200, persisted one observed snapshot, produced a 64-character SHA-256 digest, and added snapshot history.
- Redirect responses were rejected without adding a snapshot.
- Loopback URL aliases were rejected before fetch.
- A 65,537-byte response was rejected at the 65,536-byte limit.
- Existing snapshot remained after failed refresh.
- Paired `https://example.com` smoke returned HTTP 200, registered a resource, refreshed it through `/api/resources/relay-example/refresh`, and persisted one observed digest-backed snapshot.

## Integrated checks

- `node --test test/atlas.test.mjs test/observatory.test.mjs`: passed, 9 tests.
- `npm ci --ignore-scripts && npm run release:check`: passed, 62 tests.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- R7 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r7-release/noesis-1.3.0.tgz`, SHA-256 `4fedc13343b74e9eb63c9288692e6f6d8146e40a7d66aaa67d7bbdd4783addd3`.

## Limitations

The workflow is one explicit unauthenticated HTTP(S) request. It does not follow redirects, render JavaScript, send cookies, authenticate, crawl links, schedule refreshes, or resolve every DNS alias that could map to private space. No live user resource was refreshed. No model, vector, graph, MCP, second-device, or external backend path was used.
