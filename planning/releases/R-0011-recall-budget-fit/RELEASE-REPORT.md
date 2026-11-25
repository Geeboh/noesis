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
- Full release gate: 70 passed.
- Coding target coverage: 19/20 to 20/20.
- Design/research target coverage: 19/20 to 19/20.
- Artifact: `/tmp/noesis-r11-release/noesis-1.6.1.tgz`, SHA-256 `770e3409f0e522a6f63a667bfaa6f22e9e17a06e27b24692fdb2a6f248b0376e`.

## Disposition

Adopt the deterministic ranking patch as a local `1.6.1` candidate. Keep installed v1.6.0 as rollback. Do not claim semantic recall improvement. Publication and installation are not authorized for R11.
