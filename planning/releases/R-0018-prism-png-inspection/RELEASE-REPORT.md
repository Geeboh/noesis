# Release report: R-0018 Prism PNG inspection

## Identity

- Release: `R-0018-prism-png-inspection`.
- Target: `1.10.0`.
- Baseline: published and installed `1.9.2`.
- Publication: not authorized.

## Status
## Delivered result

Prism now provides a bounded deterministic PNG header inspector and JSON CLI. It preserves exact source identity through locator, byte length, SHA-256, and inspected byte range. It does not copy or decode pixels.

## Validation

`reports/validation-R-0018.md` records synthetic malformed-input checks, a real relocated screenshot, schema checks, the full release gate, artifact, and rollback.

- Prism suite: 3 passed.
- Full release gate: 81 passed.
- Schema examples: 21 passed.
- Real screenshot inspection: passed.
- Artifact: `/tmp/noesis-r18-release/noesis-1.10.0.tgz`, SHA-256 `70685f9d6bb3410dd1cb1de2c3189912ddc442848e7ab9ea6bc3ed7c4a6ed7f1`.

## Disposition

Adopt Prism PNG inspection as a local `1.10.0` candidate. Keep installed v1.9.2 as rollback. Publication and installation are not authorized for R18.
