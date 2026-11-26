# Decision 0010: Relay stdio MCP transport

## Status

Accepted for local implementation.

## User problem

NOESIS exposes its service through native OMP and Observatory clients, but an MCP-capable client cannot use the same four Mind tools without a second adapter.

## Selected behavior

Add a newline-delimited JSON-RPC stdio MCP server. It supports the legacy `initialize` handshake, `tools/list`, and `tools/call` for `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`. Each process owns one local service and uses the same SQLite, scope, provenance, idempotency, budget, and job semantics. The process never writes protocol logs to stdout.

The local MCP principal is fixed to owner `local`. Project scope derives from the server working directory. Callers cannot supply a broader owner or scope. This is a local operator transport, not a LAN endpoint.

## Invariants

- MCP is a transport, not a second memory backend.
- No new Mind tool or alternate compaction owner.
- `mind_dream` remains bounded and deterministic according to current capabilities.
- Unsupported methods and malformed requests return JSON-RPC errors.
- Native OMP and Observatory behavior remain unchanged.

## Acceptance

A disposable stdio client must initialize, list exactly the implemented tools, call note/recall/inspect, receive a durable dream job, reject unknown tools, and preserve scope and idempotency. Full tests and release gate pass.
