# NOESIS v1.0.0 release notes

**Status:** released to private GitHub repository; no new remote publication performed by this review.
**Candidate:** `80a8703`

## Stable scope

- Native OMP extension and durable SQLite evidence ledger.
- LAN Observatory with pairing, Atlas, Lore, Attunement, Ebb, Reverie, Forge, and Blueprint workflows.
- Native archive integrity verification, clean-store restore, backup, and migration support.
- Deterministic bounded dream execution with explicit hypothesis semantics.
- Product package version `1.0.0` with locked npm dependencies and a reproducible local tarball.

## Validation

`npm ci --ignore-scripts` passed. Sequential `npm run release:check` passed 56 tests, bootstrap validation, and syntax checks. Five-run workload measurement completed with zero errors. Current local artifact SHA-256 is `5c6a9e60a6530f2087f8e77a2c582e236e856fe73f20be4ff9a8d88ab4c11c83`.

## Known limitations

- Physical second-device LAN validation was unavailable.
- Interactive browser keyboard review and high-concurrency load remain unverified.
- Provider-backed model enrichment and MCP are not enabled.
- External blobs and uncontrolled copies remain outside native restore/deletion guarantees.

Released as a private GitHub release. No package was published to a package registry, deployed, or exposed to the public Internet.
