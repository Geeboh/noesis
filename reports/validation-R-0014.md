# Validation report: R-0014 Catalyst outcome loop

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0014-001` |
| Operator | integration owner |
| Evidence class | synthetic persistence and paired Observatory journey |
| Validation target | `R14-O1` |
| Tasks | `R-0014-T001` through `R-0014-T004` |
| Result | passed |

## Candidate

- Version: `1.8.0`.
- Baseline: published and installed `1.7.0`, tag `v1.7.0`.
- Artifact: `/tmp/noesis-r14-release/noesis-1.8.0.tgz`.
- Artifact SHA-256: `6ee4e8873774dfb634d8ca7a02dd0e7d9e615ebb0c6caf4affdbbafcbeec0ed0`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Validation

The focused Catalyst suite passed 36 tests. The final release gate passed 77 tests, bootstrap integrity, syntax checks, and 21 JSON Schema examples.

The paired Observatory journey created a scoped hypothesis, returned a proposal-only task manifest, applied the hypothesis with an idempotent application record, recorded a direct-user validated outcome, and returned a validated task manifest with exact application and outcome IDs. Unauthorized access remained denied. Native archive/restore preserved records and lineage.

No external task executed. No model calls, embeddings, retries, child jobs, or monetary cost occurred.

## Disposition

Adopt the Catalyst proposal-to-outcome loop as a local v1.8.0 candidate. Keep v1.7.0 installed as rollback. Publication and installation are not authorized for R14.
