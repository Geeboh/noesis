# Release report: R-0016 protocol-clean MCP launcher

## Identity

- Release: `R-0016-mcp-launcher-clean`.
- Target: `1.9.1`.
- Baseline: published and installed `1.9.0`.
- Publication: not authorized.

## Status
## Delivered result

The documented MCP launcher now uses silent npm logging, so the JSON-RPC stream starts with the first protocol response. Direct Node launch remains supported.

## Validation

`reports/validation-R-0016.md` records the silent npm stdio journey, release gate, schema checks, artifact, and rollback.

- Protocol-clean launcher journey: passed.
- Full release gate: 78 passed.
- Schema examples: 21 passed.
- Artifact: `/tmp/noesis-r16-release/noesis-1.9.1.tgz`, SHA-256 `bb967de20792b6d3fa4963ed7c671a01980f3ae8fc60bad78d4f4bf968174e48`.

## Disposition

Adopt the protocol-clean launcher patch as the published and installed `1.9.1` release. Keep the v1.9.0 backup and release as rollback.

## Publication

- Branch `feat/m0-foundation` pushed through commit `e309e158fdbbaef695bde19916d992bc4db46a73`.
- Annotated tag `v1.9.1` pushed.
- GitHub release published at https://github.com/Geeboh/noesis/releases/tag/v1.9.1.
- Asset `noesis-1.9.1.tgz` uploaded with the recorded SHA-256.

## Installation

`reports/use-v1.9.1.md` records the backup, preserved live counts, LAN URL, terminal QR, pairing, dashboard, and silent npm MCP verification. v1.9.1 is running on schema 5 with live records and resources unchanged.
