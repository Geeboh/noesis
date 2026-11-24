# Validation report: R-0001 Resonance

## Candidate

- Baseline: NOESIS v1.0.0, commit `80a8703`.
- Candidate implementation: commit `23de242`; active plan/package commit `8c87c2e`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Baseline/candidate measurement

`node scripts/measure_resonance.mjs baseline` and `node scripts/measure_resonance.mjs candidate` used separate temporary SQLite stores, 40 records, query `decision project`, max 8 items, max 4000 chars, and five runs each.

| Run | Errors | Returned per run | Median | P95 | Trace | Usage |
| --- | ---: | --- | ---: | ---: | --- | --- |
| Baseline | 0 | 8, 8, 8, 8, 8 | 1.48 ms | 3.62 ms | absent | absent |
| Candidate | 0 | 8, 8, 8, 8, 8 | 1.53 ms | 3.54 ms | present | present |

Result: trace/accounting acceptance passed. Recall quality improvement is inconclusive because no labeled missed/stale recall cases were available. Ranking policy remains unchanged.

## Integrated checks

- `npm test`: passed, 56 tests.
- Real OMP note, fresh recall, and inspect: passed in isolated store.
- Paired temporary Observatory note and recall: HTTP 200, trace ID, coverage counts, local usage observed.
- Scope tests: unauthorized results remain empty and trace output contains no unauthorized record IDs.
- `npm ci --ignore-scripts` and `npm run release:check`: passed.

## Limitations

This release adds observability, not a new retrieval model. No second device, model provider, vector index, graph backend, or external adapter was used. No publication was attempted.
