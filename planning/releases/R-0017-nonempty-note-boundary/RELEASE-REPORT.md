# Release report: R-0017 nonempty note boundary

## Identity

- Release: `R-0017-nonempty-note-boundary`.
- Target: `1.9.2`.
- Baseline: published and installed `1.9.1`.
- Publication: not authorized.

## Status
## Delivered result

Native OMP and MCP note boundaries now reject empty content before persistence. The service-level 1–16,000 character validation remains in place.

## Validation

`reports/validation-R-0017.md` records the empty-call regression, full release gate, schema checks, artifact, and rollback.

- Empty MCP call: passed with structured invalid-parameter error.
- Full release gate: 78 passed.
- Schema examples: 21 passed.
- Artifact: `/tmp/noesis-r17-release/noesis-1.9.2.tgz`, SHA-256 `6262e65bb2ecbbe9355a49658f3c572175a92066ad04167fdf3a07606336d443`.

## Disposition

Adopt the nonempty note boundary patch as the published and installed `1.9.2` release. Keep the v1.9.1 backup and release as rollback.

## Publication

- Branch `feat/m0-foundation` pushed through commit `6765cb3112ef2088f345f7c68344ee7a7ac59828`.
- Annotated tag `v1.9.2` pushed.
- GitHub release published at https://github.com/Geeboh/noesis/releases/tag/v1.9.2.
- Asset `noesis-1.9.2.tgz` uploaded with the recorded SHA-256.

## Installation

`reports/use-v1.9.2.md` records the backup, preserved live counts, LAN URL, terminal QR, pairing, dashboard, and empty-note boundary verification. v1.9.2 is running on schema 5 with live records and resources unchanged.
