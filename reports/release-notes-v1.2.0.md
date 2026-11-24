# NOESIS v1.2.0 release notes

**Status:** published on GitHub; installed locally.
**Candidate:** `7e3ff807688b3edc8a5da62582a464c1f8559bef`

## Implemented

- Lexical recall hits are ordered by descending query-term match score before existing budgets apply.
- Equal-score hits retain the existing recency order.
- Scope authorization, provenance, trace accounting, response shape, and item/character budgets remain unchanged.
- Added an isolated ranking measurement and focused regression coverage.

## Validation

The baseline fixture omitted an older two-term decision while newer one-term routine notes consumed `max_items=3`. The candidate included the stronger decision in 5/5 repetitions and never returned an unauthorized record.

`npm run release:check` passed 57 tests. Service tests, Observatory tests, paired temporary Observatory recall, bootstrap validation, and R2 tracker validation passed.

## Known limitations

- No labeled live recall corpus exists. This result is not a general quality claim.
- No model, vector, graph, MCP, connector, or external backend was added.
- The candidate was not installed into the live v1.1.0 service.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

GitHub release: https://github.com/Geeboh/noesis/releases/tag/v1.2.0
