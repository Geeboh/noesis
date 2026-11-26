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

Adopt Relay stdio MCP as a local `1.9.0` candidate. Keep installed v1.8.0 as rollback. Publication and installation are not authorized for R15.
