# packages/mcp-adapter

This directory is an implementation boundary for the local stdio adapter. It is not a second memory system.

Run the protocol-clean launcher with:

```bash
npm --silent run mcp:start
```

The server exposes `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream` through newline-delimited JSON-RPC. Use `node scripts/mcp-server.mjs` when an MCP client launches the process directly. Both commands use the same SQLite service and local project scope.
