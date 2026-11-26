# Validation report: R-0019 Resonance recall coverage

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0019-001` |
| Validation target | `R19-O1` |
| Tasks | `R-0019-T001`, `R-0019-T002` |
| Result | passed |

## Candidate

- Version: `1.11.0`.
- Baseline: published and installed `1.10.0`, tag `v1.10.0`.
- Artifact: `/tmp/noesis-r19-release/noesis-1.11.0.tgz`.
- Artifact SHA-256: `13aedd10c252b468e3362a2ed9a45e290da730a738f8d0ef8d6450fefea881b4`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Behavior

`mindRecall` keeps the existing score and admission order. After `max_items` fills, it continues a metadata-only scan. Authorized matching records beyond the boundary increment `coverage.matched` and `coverage.omitted.item_limit`; no additional hit is returned.

The focused service, OMP recall, MCP, and Observatory checks passed 32 tests. The item-budget regression returned 2 hits from 4 authorized matches and reported 2 item-limited omissions. Scope denial remained absent from data and match counts.

The full release gate passed 81 tests, bootstrap integrity, syntax checks, and 21 JSON Schema examples. No model calls, embeddings, retries, child jobs, or monetary cost occurred.

## Disposition

Adopt exact recall coverage as a local `1.11.0` candidate. Keep v1.10.0 installed as rollback. Publication and installation are not authorized for R19.
