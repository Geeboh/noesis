# Validation report: R-0011 budget-fitting recall

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0011-001` |
| Operator | integration owner |
| Evidence class | synthetic behavior and real imported-history smoke |
| Validation target | `R11-O1` |
| Tasks | `R-0011-T001`, `R-0011-T002` |
| Result | passed with narrow disposition |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Candidate version | `1.6.1` |
| Baseline | installed `1.6.0`, tag `v1.6.0` |
| Schema | unchanged SQLite schema version 5 |
| Runtime | Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1 |
| Model/provider | Not used |
| Artifact | `/tmp/noesis-r11-release/noesis-1.6.1.tgz` |
| Artifact SHA-256 | `770e3409f0e522a6f63a667bfaa6f22e9e17a06e27b24692fdb2a6f248b0376e` |

## Checks

```text
node --test test/service.test.mjs test/omp-recall.test.mjs
npm ci --ignore-scripts && npm run release:check
```

The focused recall suite passed 20 tests. The full release gate passed 70 tests, bootstrap integrity, and syntax checks. Full JSON Schema validation remained unavailable because `requirements-validation.txt` was not installed.

A disposable real-history probe used the same coding and design/research sessions as the v1.6.0 baseline. It queried 20 unique terms per source under `max_chars=12000` and checked whether the target source entry appeared in the returned provenance.

| Source | v1.6.0 baseline | v1.6.1 result |
| --- | ---: | ---: |
| Coding | 19/20 | 20/20 |
| Design/research | 19/20 | 19/20 |

The coding improvement is observed. The design/research result is unchanged. These probes are diagnostic coverage checks, not a general recall-quality benchmark.

## Criteria and disposition

| Criterion | Observation | Result |
| --- | --- | --- |
| Equal-score ordering | Shorter tied record returned before longer record under a bounded character budget. | passed |
| Existing score semantics | Stronger lexical scores remain primary. | passed |
| Scope and provenance | Existing scope and provenance tests passed. | passed |
| Cost | Zero model calls, tokens, embeddings, retries, and child jobs. | passed |
| Real-history effect | Coding target coverage improved. Design/research remained unchanged. | narrow adoption |

Adopt the deterministic ranking patch for v1.6.1. Do not claim semantic recall improvement. Keep v1.6.0 installed until a separate installation decision is made. Rollback is the installed v1.6.0 release and its backup.
