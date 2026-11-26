# NOESIS v1.9.1 release notes

## Protocol-clean MCP launcher

The documented MCP launcher now uses `npm --silent run mcp:start`, preventing npm's script banner from contaminating the JSON-RPC stdout stream.

The direct command remains available:

```bash
node scripts/mcp-server.mjs
```

No MCP protocol, service, provider, backend, compaction, or Mind tool behavior changed.

## Validation

The local patch passed 78 tests and 21 JSON Schema examples. The silent npm launcher completed initialize, tool discovery, and the existing Mind tool journey with JSON-only stdout.
