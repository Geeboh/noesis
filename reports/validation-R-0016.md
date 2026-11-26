# Validation report: R-0016 protocol-clean MCP launcher

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0016-001` |
| Operator | integration owner |
| Evidence class | disposable stdio integration |
| Validation target | `R16-O1` |
| Tasks | `R-0016-T001`, `R-0016-T002` |
| Result | passed |

## Candidate

- Version: `1.9.1`.
- Baseline: published and installed `1.9.0`, tag `v1.9.0`.
- Artifact: `/tmp/noesis-r16-release/noesis-1.9.1.tgz`.
- Artifact SHA-256: `bb967de20792b6d3fa4963ed7c671a01980f3ae8fc60bad78d4f4bf968174e48`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Validation

The MCP journey launched through `npm --silent run mcp:start`. It emitted JSON-only stdout, initialized protocol `2025-11-25`, listed the four Mind tools, and completed the existing note/recall/inspect/dream journey.

The full release gate passed 78 tests, bootstrap integrity, syntax checks, and 21 JSON Schema examples. The prior unclean `npm run mcp:start` behavior is fixed by the documented silent launcher command.

## Disposition

Adopt the protocol-clean launcher patch as a local `1.9.1` candidate. Keep v1.9.0 installed as rollback. Publication and installation are not authorized for R16.
