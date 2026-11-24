# NOESIS v1.0.0 release notes

**Status:** released to private GitHub repository; no new remote publication performed by this review.
**Candidate:** `d32b1cf`

## Stable scope

- Native OMP extension and durable SQLite evidence ledger.
- LAN Observatory with pairing, Atlas, Lore, Attunement, Ebb, Reverie, Forge, and Blueprint workflows.
- Native archive integrity verification, clean-store restore, backup, and migration support.
- Deterministic bounded dream execution with explicit hypothesis semantics.
- Product package version `1.0.0` with locked npm dependencies and a reproducible local tarball.

## Validation

`npm ci --ignore-scripts` passed. Sequential `npm run release:check` passed 56 tests, bootstrap validation, and syntax checks. Five-run workload measurement completed with zero errors. Final local artifact SHA-256 is `e1a1ad454be160ae3f8cb2a7080f1faa265e828b52c655edf453bd4cbf8b0e3e`.

## Known limitations

- Physical second-device LAN validation was unavailable.
- Interactive browser keyboard review and high-concurrency load remain unverified.
- Provider-backed model enrichment and MCP are not enabled.
- External blobs and uncontrolled copies remain outside native restore/deletion guarantees.

Released as a private GitHub release. No package was published to a package registry, deployed, or exposed to the public Internet.
