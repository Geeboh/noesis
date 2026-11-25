# Release report: R-0011 budget-fitting recall

## Identity

- Release: `R-0011-recall-budget-fit`.
- Target: `1.6.1`.
- Baseline: published and installed `1.6.0`.
- Publication: not authorized.

## Status
## Delivered result

`mind_recall` keeps lexical score as its primary rank and uses shorter statement length as the deterministic tie-breaker before original record order. This is a narrow budget-fit correction for imported history. No schema, importer, Mind tool, provider, model, or compaction behavior changed.

## Validation

`reports/validation-R-0011.md` records the focused suite, full release gate, artifact, and real coding/design history comparison.

- Focused recall checks: 20 passed.
- Full release gate: 71 passed, including 21 JSON Schema examples after installing `requirements-validation.txt`.
- Coding target coverage: 19/20 to 20/20.
- Design/research target coverage: 19/20 to 19/20.
- Artifact: `/tmp/noesis-r11-release/noesis-1.6.1.tgz`, SHA-256 `770e3409f0e522a6f63a667bfaa6f22e9e17a06e27b24692fdb2a6f248b0376e`.

## Disposition

Adopt the deterministic ranking patch as the published and installed `1.6.1` release. Keep the v1.6.0 backup and release as rollback. Do not claim semantic recall improvement.

## Publication

- Branch `feat/m0-foundation` pushed through commit `3ffe28f65fa5043e84bcbc6201d5b12f3ab9943f`.
- Annotated tag `v1.6.1` pushed.
- GitHub release published at https://github.com/Geeboh/noesis/releases/tag/v1.6.1.
- Asset `noesis-1.6.1.tgz` uploaded with the recorded SHA-256.

## Installation

`reports/use-v1.6.1.md` records the backup, preserved live counts, LAN URL, terminal QR, pairing, authenticated dashboard, and disposable native OMP loop. v1.6.1 is running on schema 5 with the live records and resources unchanged.
