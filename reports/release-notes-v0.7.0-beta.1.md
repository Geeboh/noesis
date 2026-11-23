# NOESIS v0.7.0-beta.1 release notes

**Status:** local candidate preparation, not released.
**Candidate:** `d292e7a`

## Implemented

- Native content-addressed archive manifests and SHA-256 integrity checks.
- Clean-store restore for supported records, resources, scopes, sources, lineage, jobs, adaptation, and Lore state.
- Explicit archive coverage and omission reporting.
- Tamper, unsupported-version, destination, and restored-lineage validation.
- Native-only operation without MCP or external memory backends.

## Optional adapter disposition

MCP tasks M7-02 and M7-03 are explicitly deferred by DEC-0002. MCP and external backends are not advertised.

## Validation

`npm test` passed 56 tests. Native archive tamper and restore tests passed. SQLite backup/restore and bootstrap validation passed.

## Open gates

- External blobs and uncontrolled copies remain outside native restore coverage.
- Optional adapters require a new selection decision and compatibility evidence.
- M8 hardening and release reproducibility remain next.

No package was published, deployed, or exposed to the public Internet.
