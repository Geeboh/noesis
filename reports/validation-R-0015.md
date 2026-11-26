# Validation report: R-0015 Relay stdio MCP

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0015-001` |
| Operator | integration owner |
| Evidence class | disposable stdio integration |
| Validation target | `R15-O1` |
| Tasks | `R-0015-T001`, `R-0015-T002` |
| Result | passed |

## Candidate

- Version: `1.9.0`.
- Baseline: published and installed `1.8.0`, tag `v1.8.0`.
- Artifact: `/tmp/noesis-r15-release/noesis-1.9.0.tgz`.
- Artifact SHA-256: `ced3c860505730f6cb6b00b33bb2f26ab7d9040daa2b24859a4b5904a306a94c`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Validation

The stdio MCP client test passed. It initialized protocol `2025-11-25`, listed the four current Mind tools in deterministic order, called note, recall, inspect, and dream, verified idempotent retry, rejected unknown methods/tools, accepted notifications, and observed JSON-only stdout with clean EOF.

The full release gate passed 78 tests, bootstrap integrity, syntax checks, and 21 JSON Schema examples. No model calls, embeddings, retries, child jobs, or monetary cost occurred.

## Disposition

Adopt Relay stdio MCP as a local `1.9.0` candidate. Keep v1.8.0 installed as rollback. Publication and installation are not authorized for R15.
