# Validation report: R-0008 Catalyst proposal tasks

## Candidate

- Baseline: NOESIS v1.3.0, tag `v1.3.0`, commit `1c00047fc817d8754439009cf95e272c6704cd0d`, artifact SHA-256 `4fedc13343b74e9eb63c9288692e6f6d8146e40a7d66aaa67d7bbdd4783addd3`.
- Candidate implementation: local task-manifest projection plus package version `1.4.0`.
- Runtime: Node v24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Model calls: 0. Embeddings: 0. Monetary cost: 0.

## Task projection checks

- A scoped hypothesis projected to a task with `status=proposed`, `execution=not_requested`, exact `hypothesis_id`, source references, scope, provenance, and validation-needed fields.
- Redaction and existing Blueprint behavior remained intact.
- Paired task-manifest route returned HTTP 200 with `kind=proposal_task_manifest`, `status=proposed`, and no executable task action.
- Pairing remained required for the route.

## Integrated checks

- `node --test test/forge.test.mjs test/observatory.test.mjs`: passed, 9 tests.
- `npm ci --ignore-scripts && npm run release:check`: passed, 63 tests.
- `python3 scripts/validate_bootstrap.py`: passed bootstrap integrity; full JSON Schema dependencies unavailable.
- R8 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r8-release/noesis-1.4.0.tgz`, SHA-256 `2902151ca22e8abeed0b75c9b32389342200c935c77b36ef5355f38bc9000025`.

## Limitations

The manifest is derived and non-executing. No task was persisted, assigned, approved, executed, patched, or published. No real project outcome was measured. No model, vector, graph, MCP, second-device, or external backend path was used.
