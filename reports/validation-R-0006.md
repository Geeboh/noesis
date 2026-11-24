# Validation report: R-0006 Scope accounting

## Candidate

- Baseline: NOESIS v1.2.3, tag `v1.2.3`, commit `39323de8fb3c1d877b1c5235a52baa8023b503d6`, artifact SHA-256 `b1c73ab39a16833c87d6868921da6174df6fd2ff10e9068f62262cb1c3a5fdb4`.
- Candidate implementation: local change from v1.2.3 plus package version `1.2.4`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Baseline reproduction

The v1.2.3 tag was extracted into `/tmp/noesis-r6-baseline` and run with one owner-authorized scope and one other-owner scope. Default recall returned the authorized record and excluded the other-owner record, but `coverage.scope_ids` was empty.

## Candidate comparison

The candidate default recall returned the same authorized record and excluded the other-owner record. `coverage.scope_ids` now contained `operator-scope`. Explicit `scope_ids=[operator-scope]` returned the same record and the same effective scope.

## Integrated checks

- `node --test test/service.test.mjs`: passed, 16 tests.
- `npm ci --ignore-scripts && npm run release:check`: passed, 61 tests.
- Paired temporary Observatory scope check: unpaired HTTP 401, pairing HTTP 200, recall HTTP 200; two owner scopes listed, both owner records returned, other-owner record excluded.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- R6 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r6-release/noesis-1.2.4.tgz`, SHA-256 `1c2e50fc950aa4edd50f05c42bc456a8f1c6e44b4de853e57c8630cf347dfa7d`.

## Limitations

This is one constructed scope-accounting case, not a labeled live corpus. The live v1.2.3 store has no ordinary records, so no lived disclosure is claimed. No migration, model, vector, graph, MCP, second-device, or external backend path was used.
