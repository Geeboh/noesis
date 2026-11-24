# Validation report: R-0005 Continuity trace

## Candidate

- Baseline: NOESIS v1.2.2, tag `v1.2.2`, commit `9651a53f025996108ed3b84e98323612e66f68c5`, artifact SHA-256 `1ae411adbac14a332b07be1ae064845d4c8a50c460284f40a9cf56e42852fd44`.
- Candidate implementation: local change from the v1.2.2 baseline plus package version `1.2.3`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Baseline reproduction

The v1.2.2 tag was extracted into `/tmp/noesis-r5-baseline` and `buildRecallAttachment` was called with a trace-bearing service result. The baseline attachment retained hit text and provenance but did not contain `trace=trace-1` or coverage counts.

## Candidate comparison

The candidate attachment contains:

`[trace=trace-1; included=1; matched=2]`

The existing hit line remains unchanged. Empty data still returns the empty string. No record IDs or scope identifiers are derived from the metadata.

## Integrated checks

- `node --test test/omp-recall.test.mjs test/service.test.mjs`: passed, 17 tests.
- `npm ci --ignore-scripts && npm run release:check`: passed, 60 tests.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- Native OMP probe: `NOESIS_EXTENSION_READY` and `OK` observed on OMP 19.1.1.
- Observatory and service suites passed inside the full release gate.
- R5 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r5-release/noesis-1.2.3.tgz`, SHA-256 `b1c73ab39a16833c87d6868921da6174df6fd2ff10e9068f62262cb1c3a5fdb4`.

## Limitations

This is an attachment-level continuity check, not evidence that a model accepted or applied the prepared context. No labeled live recall corpus exists. The live v1.2.2 store has no ordinary records. No migration, second-device, model, vector, graph, MCP, or external backend path was used.
