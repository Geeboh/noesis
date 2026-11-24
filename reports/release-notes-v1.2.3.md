# NOESIS v1.2.3 release notes

**Status:** local patch candidate, not published or installed.
**Candidate:** local change from published v1.2.2.

## Implemented

- Native OMP recall attachments include trace identity and included/matched coverage.
- Existing hit content, reasons, provenance, empty output, retrieval, scope, and budget behavior remain unchanged.

## Validation

The v1.2.2 attachment dropped trace and coverage from a trace-bearing result. The candidate preserves `[trace=trace-1; included=1; matched=2]` before the existing hit line.

`npm run release:check` passed 60 tests. Focused attachment/service tests, the native OMP probe, bootstrap validation, tracker validation, and artifact creation passed.

## Known limitations

- This proves adapter transformation, not model acceptance or task usefulness.
- No labeled live recall corpus exists.
- No model, vector, graph, MCP, connector, or external backend was added.
- The candidate was not installed into the live v1.2.2 service.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

R5 is local only. No branch, tag, package, deployment, or hosted release was published.
