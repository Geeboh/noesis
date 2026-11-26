# Release report: R-0018 Prism PNG inspection

## Identity

- Release: `R-0018-prism-png-inspection`.
- Target: `1.10.0`.
- Baseline: published and installed `1.9.2`.
- Publication: published at https://github.com/Geeboh/noesis/releases/tag/v1.10.0.
- Installation: `.runtime/installed-v1.10.0/node_modules/noesis`.

## Delivered result

Prism provides a bounded deterministic PNG header inspector and JSON CLI. It preserves exact source identity through locator, byte length, SHA-256, and inspected byte range. It does not copy or decode pixels.

## Validation

`reports/validation-R-0018.md` records synthetic malformed-input checks, a real relocated screenshot, schema checks, the full release gate, artifact, and rollback.

- Prism suite: 3 passed.
- Full release gate: 81 passed.
- Schema examples: 21 passed.
- Real screenshot inspection: passed.
- Artifact SHA-256: `70685f9d6bb3410dd1cb1de2c3189912ddc442848e7ab9ea6bc3ed7c4a6ed7f1`.
- Remote asset SHA-256: matched local artifact.

## Publication and installation

- Branch `feat/m0-foundation` pushed through commit `7caa6f7ccf`.
- Tag `v1.10.0` pushed.
- GitHub release asset verified.
- Live database backed up before install.
- Installed service health returned `{"status":"ready"}`.
- Advertised LAN pairing succeeded and private resources remained available.
- Installed Prism CLI inspected a relocated screenshot successfully.
- Installed MCP adapter returned protocol `2025-11-25` and server version `1.10.0`.
- Live counts remained schema 5, records 0, resources 1, imports 0.
- Evidence: `reports/use-v1.10.0.md`.

## Disposition

R18 is published and installed. v1.9.2 rollback remains available through `.runtime/artifacts/noesis-live-backup-v1.10.0-preinstall/mind.sqlite` and the prior release artifact.
