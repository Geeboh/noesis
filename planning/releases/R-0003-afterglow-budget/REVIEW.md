# R-0003 Afterglow budget safety review

**Candidate:** `b6be3179506e9e8844978c585bfd5cf8cf88c199` plus package version `1.2.1`.
**Target:** `1.2.1`.
**Decision:** READY locally for the bounded budget-safety patch. Not installed and not published.

## Review result

The candidate changes the existing budget branch from stop to continue after a hit does not fit `max_chars`. The oversized hit remains omitted. Later fitting records retain the R2 lexical score order and stay within the declared budget. Scope authorization, provenance, trace accounting, response fields, item limits, and live data paths remain unchanged.

The baseline returned no records from the constructed case. The candidate returned the three smaller authorized records, recorded one budget omission, and excluded the unauthorized record. This demonstrates the selected behavior but does not establish general recall quality.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 58 tests.
- `node --test test/service.test.mjs`: passed, 14 tests.
- `node --test test/observatory.test.mjs`: passed, 6 tests.
- Paired temporary Observatory budget check: passed with pairing protection, budget omission accounting, and smaller records returned.
- `python3 scripts/validate_bootstrap.py`: passed; full JSON Schema dependencies unavailable.
- R3 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r3-release/noesis-1.2.1.tgz`, SHA-256 `7275f6e0d4c9de50a074dbc021aa73b125608edce4c83d6c8c4fb4851372984f`.

## Limitations

No labeled live recall corpus exists. The comparison uses one constructed budget case. The live v1.2.0 service remains installed. No physical second-device check, model provider, vector index, graph backend, MCP adapter, or remote publication was used.
