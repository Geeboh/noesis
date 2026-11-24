# R-0005 Continuity trace review

**Candidate:** local v1.2.3 change from the published v1.2.2 baseline.
**Target:** `1.2.3`.
**Decision:** READY locally for the bounded native attachment continuity outcome. Not installed and not published.

## Review result

The candidate adds one compact metadata line to nonempty native recall attachments. It carries the service trace ID and included/matched counts. Existing record statements, revisions, reasons, provenance, empty output, retrieval policy, and authorization remain unchanged.

The v1.2.2 baseline dropped trace and coverage from the same trace-bearing result. The candidate preserves both fields in the attachment. This proves the adapter transformation, not model acceptance or task-level usefulness.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 60 tests.
- `node --test test/omp-recall.test.mjs test/service.test.mjs`: passed, 17 tests.
- Native OMP probe: extension readiness and simple `OK` prompt passed.
- `python3 scripts/validate_bootstrap.py`: passed; full JSON Schema dependencies unavailable.
- R5 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r5-release/noesis-1.2.3.tgz`, SHA-256 `b1c73ab39a16833c87d6868921da6174df6fd2ff10e9068f62262cb1c3a5fdb4`.

## Limitations

No labeled live corpus or model-accepted delivery evidence exists. The live v1.2.2 service remains installed. No physical second-device check, model provider, vector index, graph backend, MCP adapter, or remote publication was used.
