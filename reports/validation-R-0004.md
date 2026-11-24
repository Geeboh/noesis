# Validation report: R-0004 Resonance query normalization

## Candidate

- Baseline: NOESIS v1.2.1, tag `v1.2.1`, commit `49a1ff5dc3c725b00b2ef2301f58ee9cd55410ae`, artifact SHA-256 `7275f6e0d4c9de50a074dbc021aa73b125608edce4c83d6c8c4fb4851372984f`.
- Candidate implementation: current local change from baseline plus package version `1.2.2`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Baseline reproduction

The v1.2.1 tag was extracted into `/tmp/noesis-r4-baseline` and run with a temporary SQLite store containing an older alpha-only record and a newer beta-only record. Query was `alpha alpha beta` with `max_items=1` and `max_chars=200`.

- Baseline returned `alpha older evidence`.
- Baseline reason was `matched 2 query terms`.
- The distinct beta term lost to the repeated alpha term.
- No unauthorized record was returned.

## Candidate comparison

`node scripts/measure_query_normalization.mjs candidate` used the equivalent fixture after deduplicating query terms.

- Candidate returned `beta newer evidence`.
- Candidate reason was `matched 1 query term`.
- The unauthorized record was absent.
- Coverage remained bounded with one item-limit omission and no scope leakage.

The candidate counts each distinct query term once. The existing recency tie order remains available when distinct-term scores tie.

## Integrated checks

- `node --test test/service.test.mjs`: passed, 15 tests.
- `node --test test/observatory.test.mjs`: passed within the full release suite.
- Paired temporary Observatory normalization check: unpaired HTTP 401, pairing HTTP 200, recall HTTP 200; beta result first and both reasons report one distinct matched term.
- `npm ci --ignore-scripts && npm run release:check`: passed, 59 tests.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- R4 tracker JSON parse and reference validation: passed.
- Artifact: `/tmp/noesis-r4-release/noesis-1.2.2.tgz`, SHA-256 `1ae411adbac14a332b07be1ae064845d4c8a50c460284f40a9cf56e42852fd44`.

## Limitations

This is one constructed duplicate-term ranking case, not a labeled user corpus. The live v1.2.1 store has no ordinary records, so no lived miss is claimed. The candidate was not installed into the live service. No model, vector, graph, MCP, second-device, or external backend path was used.
