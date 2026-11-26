# Validation report: R-0013 source-group recall

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0013-001` |
| Operator | integration owner |
| Evidence class | synthetic behavior and real imported-history smoke |
| Validation target | `R13-O1` |
| Tasks | `R-0013-T001`, `R-0013-T002` |
| Result | passed with narrow disposition |

## Candidate

- Version: `1.7.0`.
- Baseline: published and installed `1.6.1`, tag `v1.6.1`.
- Artifact: `/tmp/noesis-r13-release/noesis-1.7.0.tgz`.
- Artifact SHA-256: `cbc578c19a312e39c5729ca9ad0915470852a8f1a614ce52b7e7bc5a3161f186`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Validation

The focused suite passed 28 tests. The full release gate passed 72 tests, bootstrap integrity, syntax checks, and 21 JSON Schema examples.

The source-group regression proved that two matching chunks from one imported entry no longer consume multiple budget admissions before an independent matching source. Grouped omissions are explicit in recall coverage.

A disposable real-history probe queried 20 unique terms per source under `max_chars=12000`.

| Source | Result |
| --- | ---: |
| Coding | 20/20 target hits |
| Design/research | 19/20 target hits |

The design result is unchanged. This release proves source-group budget accounting, not semantic recall quality.

## Disposition

Adopt the source-group accounting change as a local v1.7.0 candidate. Keep v1.6.1 installed as rollback. No publication or installation occurred. Model calls, tokens, embeddings, retries, child jobs, and monetary cost remained zero.
