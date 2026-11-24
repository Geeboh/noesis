# R-0008 Catalyst proposal tasks review

**Candidate:** local v1.4.0 change from published v1.3.0.
**Target:** `1.4.0`.
**Decision:** READY locally for the bounded proposal-to-task projection. Not installed and not published.

## Review result

The candidate adds a derived task manifest for scoped Blueprint hypotheses and a paired GET route. Each task is explicitly proposed and non-executing, retains its hypothesis and source references, preserves scope/provenance, and carries validation-needed data. The projection does not persist or mutate work.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 63 tests.
- Forge and Observatory tests: passed, 9 focused tests.
- Paired task-manifest route: passed with pairing protection and proposal-only status.
- `python3 scripts/validate_bootstrap.py`: passed; full JSON Schema dependencies unavailable.
- R8 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r8-release/noesis-1.4.0.tgz`, SHA-256 `2902151ca22e8abeed0b75c9b32389342200c935c77b36ef5355f38bc9000025`.

## Limitations

No real proposal-to-task outcome was executed or measured. The manifest is a review projection only. No physical second-device check, model provider, vector index, graph backend, MCP adapter, or remote publication was used.
