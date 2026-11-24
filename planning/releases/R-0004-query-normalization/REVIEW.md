# R-0004 Resonance query normalization review

**Candidate:** local v1.2.2 candidate from the published v1.2.1 baseline.
**Target:** `1.2.2`.
**Decision:** READY locally for the bounded normalization patch. Not installed and not published.

## Review result

The candidate deduplicates lowercased query terms before lexical scoring. Repeated words no longer inflate one term's score. Distinct-term scoring, existing stable ordering, scope authorization, provenance, trace accounting, response fields, and budgets remain intact.

The v1.2.1 baseline selected an older alpha-only record for `alpha alpha beta` with reason `matched 2 query terms`. The candidate selected the newer beta-only record with reason `matched 1 query term`. This demonstrates the selected fix but does not establish general recall quality.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 59 tests.
- `node --test test/service.test.mjs`: passed, 15 tests.
- `node --test test/observatory.test.mjs`: passed within the full suite.
- Paired temporary Observatory normalization check: passed with pairing protection and distinct-term reasons.
- `python3 scripts/validate_bootstrap.py`: passed; full JSON Schema dependencies unavailable.
- R4 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r4-release/noesis-1.2.2.tgz`, SHA-256 `1ae411adbac14a332b07be1ae064845d4c8a50c460284f40a9cf56e42852fd44`.

## Limitations

No labeled live recall corpus exists. The comparison uses one constructed duplicate-term case. The live v1.2.1 service remains installed. No physical second-device check, model provider, vector index, graph backend, MCP adapter, or remote publication was used.
