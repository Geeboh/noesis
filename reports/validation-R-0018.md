# Validation report: R-0018 Prism PNG inspection

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0018-001` |
| Operator | integration owner |
| Evidence class | synthetic fixture and real local artifact |
| Validation target | `R18-O1` |
| Tasks | `R-0018-T001`, `R-0018-T002` |
| Result | passed |

## Candidate

- Version: `1.10.0`.
- Baseline: published and installed `1.9.2`, tag `v1.9.2`.
- Artifact: `/tmp/noesis-r18-release/noesis-1.10.0.tgz`.
- Artifact SHA-256: `70685f9d6bb3410dd1cb1de2c3189912ddc442848e7ab9ea6bc3ed7c4a6ed7f1`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Validation

The Prism suite passed three tests covering exact digest, dimensions, header range, JSON-only CLI output, no source copy, malformed/truncated/non-PNG rejection, and source-size limits.

A real relocated screenshot under `.runtime/artifacts` inspected successfully. It reported PNG dimensions 390 by 3734, bit depth 8, color type 2, and complete header coverage through byte 33. The inspector did not decode pixels or run OCR.

The full release gate passed 81 tests, bootstrap integrity, syntax checks, and 21 JSON Schema examples. No model calls, embeddings, retries, child jobs, or monetary cost occurred.

## Disposition

Adopt the bounded PNG inspection utility as a local `1.10.0` candidate. Keep v1.9.2 installed as rollback. Publication and installation are not authorized for R18.
