# R-0006 Scope accounting review

**Candidate:** local v1.2.4 change from the published v1.2.3 baseline.
**Target:** `1.2.4`.
**Decision:** READY locally for the bounded scope-accounting patch. Not installed and not published.

## Review result

Default recall now derives effective scope IDs from records authorized for the principal when callers omit `scope_ids`. Explicit scope requests remain unchanged. Returned records and authorization are unchanged; coverage now names the effective owner scopes.

The baseline returned the authorized record with an empty scope list. The candidate returned the same record with `operator-scope`, excluded the other-owner record, and preserved explicit-scope behavior.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 61 tests.
- `node --test test/service.test.mjs`: passed, 16 tests.
- Paired temporary Observatory scope check: passed with pairing protection and owner-scope accounting.
- `python3 scripts/validate_bootstrap.py`: passed; full JSON Schema dependencies unavailable.
- R6 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r6-release/noesis-1.2.4.tgz`, SHA-256 `1c2e50fc950aa4edd50f05c42bc456a8f1c6e44b4de853e57c8630cf347dfa7d`.

## Limitations

No labeled live corpus exists. The comparison uses one constructed owner-scope case. The live v1.2.3 service remains installed. No physical second-device check, model provider, vector index, graph backend, MCP adapter, or remote publication was used.
