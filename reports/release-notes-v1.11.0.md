# NOESIS v1.11.0 release notes

## Resonance recall coverage

Recall coverage now reports all authorized matching records after a bounded result reaches `max_items`.

- Returned hits remain bounded by `max_items` and `max_chars`.
- Existing lexical ranking and grouping remain unchanged.
- `coverage.matched` includes authorized matches beyond the returned prefix.
- `coverage.omitted.item_limit` identifies matches excluded only by the item budget.
- Unauthorized records remain absent from results and coverage counts.
- No source, schema, model, provider, or live-data changes.

## Validation

The local candidate passed 81 tests and 21 JSON Schema examples. Focused service, OMP, MCP, and Observatory checks passed 32 tests. v1.10.0 remains installed as rollback.
