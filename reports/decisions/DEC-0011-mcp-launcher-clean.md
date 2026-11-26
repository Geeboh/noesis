# Decision 0011: protocol-clean MCP launcher

## Status

Accepted for local Afterglow patch.

## Defect

The MCP server itself writes JSON-only stdout, but `npm run mcp:start` prints npm's script banner before the first JSON-RPC response. That breaks clients that treat stdout as the protocol stream.

## Fix

Keep the server unchanged and make the supported command `npm --silent run mcp:start`. Add an end-to-end test that launches the package script through npm with silent logging and asserts every stdout line is JSON-RPC.

## Acceptance

The documented launcher emits no banner, initializes, lists tools, and exits cleanly. Existing direct Node invocation and all release gates remain green.
