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

Adopt the boundary patch as a local `1.9.2` candidate. Keep installed v1.9.1 as rollback. Publication and installation are not authorized for R17.
