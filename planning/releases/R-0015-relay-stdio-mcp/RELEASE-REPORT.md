# Release report: R-0015 Relay stdio MCP

## Identity

- Release: `R-0015-relay-stdio-mcp`.
- Target: `1.9.0`.
- Baseline: published and installed `1.8.0`.
- Publication: not authorized.

## Status
## Delivered result

Relay now provides a local newline-delimited JSON-RPC MCP server over the existing four Mind tools. The adapter uses fixed local authority, the current project scope, the existing service boundary, and no second backend.

## Validation

`reports/validation-R-0015.md` records the disposable stdio client journey, JSON-only framing, parity, errors, idempotency, release gate, schemas, and artifact.

- Stdio MCP journey: passed.
- Full release gate: 78 passed.
- Schema examples: 21 passed.
- Artifact: `/tmp/noesis-r15-release/noesis-1.9.0.tgz`, SHA-256 `ced3c860505730f6cb6b00b33bb2f26ab7d9040daa2b24859a4b5904a306a94c`.

## Disposition

Adopt Relay stdio MCP as the published and installed `1.9.0` release. Keep the v1.8.0 backup and release as rollback.

## Publication

- Branch `feat/m0-foundation` pushed through commit `fec3a51369aaa1cfe4dea00f6247d79c617dbde8`.
- Annotated tag `v1.9.0` pushed.
- GitHub release published at https://github.com/Geeboh/noesis/releases/tag/v1.9.0.
- Asset `noesis-1.9.0.tgz` uploaded with the recorded SHA-256.

## Installation

`reports/use-v1.9.0.md` records the backup, preserved live counts, LAN URL, terminal QR, pairing, dashboard, and direct stdio MCP verification. v1.9.0 is running on schema 5 with live records and resources unchanged.
