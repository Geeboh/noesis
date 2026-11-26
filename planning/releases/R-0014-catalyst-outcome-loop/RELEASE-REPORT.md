# Release report: R-0014 Catalyst outcome loop

## Identity

- Release: `R-0014-catalyst-outcome-loop`.
- Target: `1.8.0`.
- Baseline: published and installed `1.7.0`.
- Publication: not authorized.

## Status
## Delivered result

Catalyst now records a scoped proposal application and a separate observed outcome. Lineage connects hypothesis → application → outcome. Task manifests project `proposed`, `applied`, and `validated` states. The paired Observatory routes never execute external work.

## Validation

`reports/validation-R-0014.md` records the focused service, Forge, archive, Observatory, and release-gate evidence.

- Focused Catalyst suite: 36 passed.
- Full release gate: 77 passed.
- Schema examples: 21 passed.
- Paired proposal → application → outcome journey: passed.
- Archive/restore lineage: passed.
- Artifact: `/tmp/noesis-r14-release/noesis-1.8.0.tgz`, SHA-256 `6ee4e8873774dfb634d8ca7a02dd0e7d9e615ebb0c6caf4affdbbafcbeec0ed0`.

## Disposition

Adopt the Catalyst loop as the published and installed `1.8.0` release. Keep the v1.7.0 backup and release as rollback.

## Publication

- Branch `feat/m0-foundation` pushed through commit `e4d8239e48ce1f4b10f6c13862ff87b8f337470c`.
- Annotated tag `v1.8.0` pushed.
- GitHub release published at https://github.com/Geeboh/noesis/releases/tag/v1.8.0.
- Asset `noesis-1.8.0.tgz` uploaded with the recorded SHA-256.

## Installation

`reports/use-v1.8.0.md` records the backup, preserved live counts, LAN URL, terminal QR, pairing, authenticated dashboard, and native extension probe. v1.8.0 is running on schema 5 with live records and resources unchanged.
