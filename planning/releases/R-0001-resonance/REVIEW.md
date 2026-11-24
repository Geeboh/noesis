# R-0001 Resonance review

**Candidate:** `8c87c2e` implementation and plan candidate.
**Target:** `1.1.0`.
**Decision:** READY locally for the selected observability outcome. Not published.

## Review result

The candidate adds recall trace and local usage accounting without changing lexical ranking, scope authorization, provenance, or result budgets. Baseline and candidate measurements use isolated equivalent stores and five runs. Both return the same eight records with zero errors. The latency difference is within the observed run ranges. No recall-quality improvement is claimed and no ranking policy is promoted.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 56 tests.
- `node scripts/measure_resonance.mjs baseline`: 5 runs, 0 errors, median 1.48 ms, p95 3.62 ms.
- `node scripts/measure_resonance.mjs candidate`: 5 runs, 0 errors, median 1.56 ms, p95 3.70 ms.
- Real OMP note/recall/inspect smoke: passed.
- Paired Observatory recall: passed with trace ID, coverage, and usage.
- Artifact: `/tmp/noesis-r1-release/noesis-1.1.0.tgz`, SHA-256 `9adb40fdd90a01bb6a52c4a3bae136b65fc15faa1ecacd4d5c15e877fbf85900`.

## Limitations

No labeled missed/stale recall cases exist. Result is inconclusive for retrieval quality. No provider, vector, graph, MCP, or external backend was used. Publication and deployment were not attempted.
