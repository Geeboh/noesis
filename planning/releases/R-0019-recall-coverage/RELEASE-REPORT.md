# Release report: R-0019 Resonance recall coverage

## Identity

- Release: `R-0019-recall-coverage`.
- Target: `1.11.0`.
- Baseline: published and installed `1.10.0`.
- Publication: not authorized.

## Delivered result

`mindRecall` preserves its existing ranked bounded result. After `max_items` fills, it continues a metadata-only scan and reports all authorized matches plus item-limited omissions. Scope, grouping, character budgets, provenance, trace identity, and usage remain unchanged.

## Validation

- Focused service, OMP, MCP, and Observatory checks: 32 passed.
- Full release gate: 81 passed.
- Schema examples: 21 passed.
- Artifact: `/tmp/noesis-r19-release/noesis-1.11.0.tgz`.
- Artifact SHA-256: `13aedd10c252b468e3362a2ed9a45e290da730a738f8d0ef8d6450fefea881b4`.
- Validation: `reports/validation-R-0019.md`.
- Rollback: published and installed v1.10.0, with `.runtime/artifacts/noesis-live-backup-v1.10.0-preinstall/mind.sqlite` retained.

## Disposition

Adopt exact recall coverage as a local v1.11.0 candidate. Keep v1.10.0 installed. Do not publish or install R19 without explicit authorization.
