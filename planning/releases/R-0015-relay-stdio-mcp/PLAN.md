# Release plan: R-0015 Relay stdio MCP

## Identity

- Stable release ID: `R-0015-relay-stdio-mcp`.
- Target application version: `1.9.0`.
- Baseline: published and installed `1.8.0`, tag `v1.8.0`, artifact SHA-256 `6ee4e8873774dfb634d8ca7a02dd0e7d9e615ebb0c6caf4affdbbafcbeec0ed0`.
- Decision: `reports/decisions/DEC-0010-relay-stdio-mcp.md`.

## Selected slice

Provide a local stdio MCP transport over the existing four Mind tools. Use newline-delimited JSON-RPC and the legacy initialize handshake for broad client compatibility. Keep authorization and persistence inside NOESIS service methods.

## Non-goals

- No Streamable HTTP MCP endpoint.
- No external backend, provider, proxy, or model.
- No new Mind tool or compaction change.
- No public network listener or credential store.

## Budget

Zero model calls, tokens, embeddings, retries, child jobs, and monetary cost for transport work.

## Tasks

1. `R-0015-T001` implement stdio JSON-RPC transport and tool schemas.
2. `R-0015-T002` validate MCP parity, scope, idempotency, and release behavior.

## Acceptance

- `initialize` returns protocol and server capabilities.
- `tools/list` returns the four current tools in deterministic order.
- `tools/call` returns MCP text content for note, recall, inspect, and dream.
- Unknown methods/tools return structured errors.
- No stdout contamination occurs.
- Existing service, archive, OMP, dashboard, and full release tests pass.

## Adoption rule

Adopt only if a disposable stdio client completes the real tool journey without bypassing service policies. Keep v1.8.0 as rollback.
