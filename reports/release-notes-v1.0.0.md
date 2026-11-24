# NOESIS v1.0.0 release notes

**Status:** released to private GitHub repository.
**Candidate:** `314501d`

## Stable scope

- Native OMP extension and durable SQLite evidence ledger.
- LAN Observatory with pairing, Atlas, Lore, Attunement, Ebb, Reverie, Forge, and Blueprint workflows.
- Native archive integrity verification, clean-store restore, backup, and migration support.
- Deterministic bounded dream execution with explicit hypothesis semantics.
- Product package version `1.0.0` with locked npm dependencies and a reproducible local tarball.

## Validation

`npm ci --ignore-scripts` passed. `npm run release:check` passed 56 tests, bootstrap validation, and syntax checks. Five-run workload measurement completed with zero errors. Local artifact SHA-256 is `2d0af5e9eea8e14c0eff3ac4690a0a89bd7f4f93fe9d5009d3773f05eccbb65e`.

## Known limitations

- Physical second-device LAN validation was unavailable.
- Interactive browser keyboard review and high-concurrency load remain unverified.
- Provider-backed model enrichment and MCP are not enabled.
- External blobs and uncontrolled copies remain outside native restore/deletion guarantees.

Released as a private GitHub release. No package was published to a package registry, deployed, or exposed to the public Internet.
