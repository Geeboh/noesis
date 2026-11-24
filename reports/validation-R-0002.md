# Validation report: R-0002 Resonance ranking

## Candidate

- Baseline: NOESIS v1.1.0, tag `v1.1.0`, commit `481a5ead843886d32f4f42492d5532e3807fd886`, artifact SHA-256 `9adb40fdd90a01bb6a52c4a3bae136b65fc15faa1ecacd4d5c15e877fbf85900`.
- Candidate implementation: commit `7e3ff807688b3edc8a5da62582a464c1f8559bef`.
- Package version: `1.2.0`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Baseline reproduction

`node scripts/measure_resonance_ranking.mjs baseline` used a temporary SQLite store with one older two-term decision, eight newer one-term routine notes, one unauthorized two-term record, query `alpha beta`, `max_items=3`, and `max_chars=1000`.

- Returned statements: three one-term routine notes.
- Strong two-term decision included: `false`.
- Unauthorized record included: `false`.
- Coverage: considered 4, matched 3, included 3, out-of-scope 1, item-limit omission 1, truncated `true`.
- Duration: 1.32 ms in the recorded run.

The baseline confirms a bounded lexical ranking gap. The service computes match scores but consumes the item budget in database recency order.

## Candidate comparison

`node scripts/measure_resonance_ranking.mjs candidate` used the same fixture and constraints after the score-aware ordering change. Five candidate runs completed.

| Measure | Baseline | Candidate | Result |
| --- | --- | --- | --- |
| Strong two-term decision included | false | true in 5/5 runs | primary acceptance passed |
| Unauthorized record included | false | false in 5/5 runs | scope acceptance passed |
| Returned count | 3 | 3 in every run | bounded output preserved |
| Candidate median duration | 1.32 ms single baseline run | 1.13 ms across five runs | no performance claim; small local sample |
| Candidate p95 duration | unavailable | 1.18 ms | small local sample |

Candidate returned the score-2 decision before score-1 routine notes. Equal-score routine ties retained the existing recency order.

## Integrated checks

- `node --test test/service.test.mjs`: passed, 13 tests.
- `node --test test/observatory.test.mjs`: passed, 6 tests.
- Paired temporary Observatory recall: unpaired HTTP 401, pairing HTTP 200, paired recall HTTP 200; stronger decision first; trace and deterministic usage present.
- `npm ci --ignore-scripts && npm run release:check`: passed, 57 tests.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- R2 tracker JSON parse and reference check: passed.

## Limitations

This is one constructed ranking case plus five candidate repetitions, not a labeled user corpus. The live v1.1.0 store has no ordinary records, so no lived recall miss is claimed. No model, vector, graph, MCP, second-device, or external backend path was used. R2 remains a local candidate and was not installed into the live v1.1.0 service.
