# Validation report: R-0017 nonempty note boundary

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0017-001` |
| Operator | integration owner |
| Evidence class | transport boundary and full release gate |
| Validation target | `R17-O1` |
| Tasks | `R-0017-T001`, `R-0017-T002` |
| Result | passed |

## Candidate

- Version: `1.9.2`.
- Baseline: published and installed `1.9.1`, tag `v1.9.1`.
- Artifact: `/tmp/noesis-r17-release/noesis-1.9.2.tgz`.
- Artifact SHA-256: `6262e65bb2ecbbe9355a49658f3c572175a92066ad04167fdf3a07606336d443`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Validation

Empty MCP note content now fails with a structured invalid-parameter response. The native OMP tool schema requires 1 to 16,000 characters. Valid note, idempotency, recall, archive, and MCP journeys remain green.

The full release gate passed 78 tests, bootstrap integrity, syntax checks, and 21 JSON Schema examples. No model calls, embeddings, retries, child jobs, or monetary cost occurred.

## Disposition

Adopt the nonempty note boundary patch as a local `1.9.2` candidate. Keep v1.9.1 installed as rollback. Publication and installation are not authorized for R17.
