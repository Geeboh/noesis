# NOESIS v1.2.2 release notes

**Status:** local patch candidate, not published or installed.
**Candidate:** local change from published v1.2.1.

## Implemented

- Repeated query terms are deduplicated before lexical scoring.
- Distinct query terms retain one score point each.
- R2 score ordering, R3 budget continuation, scope authorization, provenance, trace accounting, and result limits remain unchanged.

## Validation

The v1.2.1 baseline selected an older alpha-only record for `alpha alpha beta` and reported `matched 2 query terms`. The candidate selected newer beta-only evidence and reported `matched 1 query term`.

`npm run release:check` passed 59 tests. Service tests, Observatory tests, paired temporary Observatory recall, bootstrap validation, tracker validation, and artifact creation passed.

## Known limitations

- No labeled live recall corpus exists. This result is not a general quality claim.
- No model, vector, graph, MCP, connector, or external backend was added.
- The candidate was not installed into the live v1.2.1 service.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

R4 is local only. No branch, tag, package, deployment, or hosted release was published.
