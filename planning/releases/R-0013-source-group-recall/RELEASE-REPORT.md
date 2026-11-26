# Release report: R-0013 source-group recall

## Identity

- Release: `R-0013-source-group-recall`.
- Target: `1.7.0`.
- Baseline: published and installed `1.6.1`.
- Publication: not authorized.

## Status
## Delivered result

`mind_recall` now admits at most one matching chunk from each exact imported source entry. Lexical score, shorter-hit ordering, scope, provenance, and budget limits remain unchanged. Grouped omissions are explicit.

## Validation

`reports/validation-R-0013.md` records the focused regression, full release gate, schema checks, artifact, and real coding/design probe.

- Focused suite: 28 passed.
- Full release gate: 72 passed.
- Coding probe: 20/20.
- Design/research probe: 19/20, unchanged.
- Artifact: `/tmp/noesis-r13-release/noesis-1.7.0.tgz`, SHA-256 `cbc578c19a312e39c5729ca9ad0915470852a8f1a614ce52b7e7bc5a3161f186`.

## Disposition

Adopt the source-group accounting change as a local `1.7.0` candidate. Keep installed v1.6.1 as rollback. Publication and installation are not authorized for R13.
