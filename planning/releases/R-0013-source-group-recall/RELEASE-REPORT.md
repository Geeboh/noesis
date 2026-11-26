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

Adopt the source-group accounting change as the published and installed `1.7.0` release. Keep the v1.6.1 backup and release as rollback. The model-driven native loop was inconclusive because OMP emitted invalid empty note calls; extension loading passed.

## Publication

- Branch `feat/m0-foundation` pushed through commit `1a3801ff421ef2cee92c8458de8ba41f3bf607c6`.
- Annotated tag `v1.7.0` pushed.
- GitHub release published at https://github.com/Geeboh/noesis/releases/tag/v1.7.0.
- Asset `noesis-1.7.0.tgz` uploaded with the recorded SHA-256.

## Installation

`reports/use-v1.7.0.md` records the backup, preserved live counts, LAN URL, terminal QR, pairing, authenticated dashboard, and native extension probe. v1.7.0 is running on schema 5 with live records and resources unchanged. The model-driven note/recall loop remains inconclusive.
