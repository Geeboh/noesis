# R-0002 Resonance ranking review

**Candidate:** `7e3ff807688b3edc8a5da62582a464c1f8559bef`.
**Target:** `1.2.0`.
**Decision:** READY locally for the bounded ranking outcome. Not published and not installed.

## Review result

The candidate sorts lexical hits by computed query-term score before applying the existing budgets. Stable equal-score ordering follows the prior record order. The change is one service-line ordering adjustment plus focused regression and measurement coverage. Scope authorization, provenance, trace accounting, response fields, item limits, character limits, and live data paths remain intact.

The baseline omission reproduced on an isolated store. Five candidate repetitions included the stronger two-term decision and excluded the unauthorized record. This supports the selected outcome but does not establish general recall quality.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 57 tests.
- `node --test test/service.test.mjs`: passed, 13 tests.
- `node --test test/observatory.test.mjs`: passed, 6 tests.
- Paired temporary Observatory recall: passed with pairing protection, stronger result first, trace, and local usage.
- `python3 scripts/validate_bootstrap.py`: passed; full JSON Schema dependencies unavailable.
- R2 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r2-release/noesis-1.2.0.tgz`, SHA-256 `e41d52290c61f9cb9a7f43d0f275220fd6541a2da7c1e16bb8751e934fac4a49`.

## Limitations

No labeled user recall corpus exists. The comparison uses one constructed omission case and five candidate repetitions. No live service upgrade, physical second-device check, model provider, vector index, graph backend, MCP adapter, or remote publication was used.
