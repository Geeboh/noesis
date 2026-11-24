# NOESIS v1.1.0 release notes

**Status:** published on GitHub; installed locally.
**Candidate:** `8c87c2e`; publication commit `481a5ead84`

## Implemented

- Recall trace identities and bounded retrieval accounting.
- Considered, matched, included, omitted, and truncation coverage fields.
- Deterministic local duration and usage reporting with zero model-cost claims.
- Observatory recall status showing included count, matched count, elapsed duration, and trace ID.
- No ranking, scope, provenance, or data migration changes.

## Validation

Baseline and candidate used separate 40-record stores and five runs each. Both returned 8 records with zero errors. Baseline median was 1.48 ms and candidate median was 1.56 ms. The result is inconclusive for recall quality and does not justify a ranking-policy change.

`npm run release:check` passed 56 tests. Real OMP note, recall, inspect, and paired Observatory trace checks passed.

## Known limitations

- No labeled missed or stale recall corpus exists yet.
- No model, vector, or graph retrieval was added.
- Physical second-device LAN validation and full JSON Schema dependencies remain unavailable.
- MCP and external backends remain deferred.

GitHub release: https://github.com/Geeboh/noesis/releases/tag/v1.1.0
