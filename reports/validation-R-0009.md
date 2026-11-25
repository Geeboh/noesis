# Validation report: R-0009 Aperture exact inspection

## Candidate

- Baseline: NOESIS v1.4.0, tag `v1.4.0`, commit `bcc58d4089fc6fda2f65199464b85917e5f0257b`, artifact SHA-256 `2902151ca22e8abeed0b75c9b32389342200c935c77b36ef5355f38bc9000025`.
- Candidate implementation: local revision-bound inspection change plus package version `1.5.0`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Inspection checks

- UTF-8 statement paging returned revision-bound partial pages without replacement characters.
- Continuation pages concatenated exactly to the original retained statement.
- Final page reported `kind=exact`; bounded pages reported `kind=partial`.
- Unauthorized cursor use failed without disclosing the record.
- Default full inspection retained existing record/source behavior.
- Observatory inspect route returned the same partial coverage semantics after pairing.
- Capability revision advanced to 2 and advertised only inspection paging, not new tools.

## Integrated checks

- `node --test test/service.test.mjs test/atlas.test.mjs`: passed, 20 tests.
- `node --test test/observatory.test.mjs test/omp-recall.test.mjs`: passed, 8 tests.
- `npm ci --ignore-scripts && npm run release:check`: passed, 64 tests.
- Native OMP probe: `NOESIS_EXTENSION_READY` and `OK`; capability revision 2 with inspection limits.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- R9 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r9-release/noesis-1.5.0.tgz`, SHA-256 `891a98ec75c0a4ec923696961a02d26ba537b0541eebcf0061f1f59aa39aa30d`.

## Adoption result

Adopt the exact inspection slice for the declared deterministic correctness scope. Origami summaries remain deferred. No provider proxy or upstream kernel was installed.

## Limitations

The slice pages retained record statement/content fields; source snapshot objects remain whole and are not claimed as byte-range pages. No labeled long-history task corpus or model-accepted delivery evidence exists. No migration, second-device, model, vector, graph, MCP, or external backend path was used.
