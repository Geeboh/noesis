# Release plan: R-0016 protocol-clean MCP launcher

## Identity

- Stable release ID: `R-0016-mcp-launcher-clean`.
- Target application version: `1.9.1`.
- Baseline: published and installed `1.9.0`, tag `v1.9.0`, artifact SHA-256 `ced3c860505730f6cb6b00b33bb2f26ab7d9040daa2b24859a4b5904a306a94c`.
- Decision: `reports/decisions/DEC-0011-mcp-launcher-clean.md`.

## Selected slice

Make the npm launcher protocol-clean by requiring silent npm logging. Preserve the server and MCP protocol behavior.

## Non-goals

No MCP protocol feature, HTTP transport, backend, provider, compaction, Mind tool, or service policy change.

## Tasks

1. `R-0016-T001` document and test the protocol-clean npm launcher.
2. `R-0016-T002` run the release gate, build, and prepare the local patch candidate.

## Acceptance

- `npm --silent run mcp:start` emits only JSON-RPC stdout.
- Initialize and tools/list work through the documented launcher.
- Existing MCP, service, dashboard, archive, and OMP checks pass.
- A local v1.9.1 artifact and rollback record exist.

## Adoption rule

Adopt only if the launcher no longer contaminates stdout. Keep v1.9.0 installed as rollback.
