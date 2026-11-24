# Validation report: R-0003 Afterglow budget safety

## Candidate

- Baseline: NOESIS v1.2.0, tag `v1.2.0`, commit `0b7a5a5b7fe69fff1c4dc14b5b92522e3ea021ad`, artifact SHA-256 `5eb5bb73c4e0c892a8389e32ea55364de31a468d2100c7d6c10ea343f6fe88d9`.
- Candidate implementation: commit `b6be3179506e9e8844978c585bfd5cf8cf88c199` plus package version `1.2.1`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Baseline reproduction

`node scripts/measure_afterglow_budget.mjs baseline` used a temporary SQLite store with one oversized two-term hit, three smaller authorized hits, one unauthorized hit, query `alpha beta`, `max_items=3`, and `max_chars=80`.

- Returned statements: none.
- Oversized hit included: `false`.
- Unauthorized hit included: `false`.
- Coverage: considered 2, matched 1, included 0, budget omissions 1, out-of-scope 1, truncated `true`.

The baseline confirms that the first non-fitting high-score hit stopped recall before smaller fitting records were considered.

## Candidate comparison

`node scripts/measure_afterglow_budget.mjs candidate` used the same fixture and constraints after the continue-after-omission change.

- Returned statements: `alpha small-2`, `alpha small-1`, `alpha small-0`.
- Oversized hit included: `false`.
- Unauthorized hit included: `false`.
- Coverage: considered 5, matched 4, included 3, budget omissions 1, out-of-scope 1, item-limit omissions 0, truncated `true`.
- Sum of returned estimated characters: 39, within the 80-character budget.

The candidate preserves score order among fitting hits and continues after the omitted oversized hit.

## Integrated checks

- `node --test test/service.test.mjs`: passed, 14 tests.
- `node --test test/observatory.test.mjs`: passed, 6 tests.
- Paired temporary Observatory budget check: unpaired HTTP 401, pairing HTTP 200, recall HTTP 200; three smaller records returned, one budget omission recorded, oversized record absent.
- `npm ci --ignore-scripts && npm run release:check`: passed, 58 tests.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- R3 tracker JSON parse and reference validation: passed.
- Artifact: `/tmp/noesis-r3-release/noesis-1.2.1.tgz`, SHA-256 `7275f6e0d4c9de50a074dbc021aa73b125608edce4c83d6c8c4fb4851372984f`.

## Limitations

This is one constructed budget-starvation case, not a labeled user corpus. The live v1.2.0 store has no ordinary records, so no lived miss is claimed. The candidate was not installed into the live service. No model, vector, graph, MCP, second-device, or external backend path was used.
