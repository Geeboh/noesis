# NOESIS v1.9.0 release notes

## Relay stdio MCP

NOESIS now exposes its existing four Mind tools through a local newline-delimited JSON-RPC MCP server.

- `initialize` returns protocol and server capabilities.
- `tools/list` advertises `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`.
- `tools/call` uses the existing service, SQLite authority, scope, provenance, idempotency, and job contracts.
- The local principal and project scope are fixed by the server process.
- Unknown methods, unknown tools, malformed JSON, and invalid arguments return structured errors.
- The server writes no protocol logs to stdout.

No HTTP MCP endpoint, external backend, provider proxy, compaction change, or new Mind tool was added.

## Validation

The local candidate passed 78 tests and 21 JSON Schema examples. A disposable stdio client completed the full Mind tool journey. v1.8.0 remains installed and is the rollback baseline.
