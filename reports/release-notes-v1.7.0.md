# NOESIS v1.7.0 release notes

## Source-group recall budgeting

Lexical recall now admits at most one matching chunk from each exact imported source entry. Independent imported sources retain access to the inline budget. Grouped omissions are reported in recall coverage.

No semantic search, model, provider, compaction, schema, importer, or Mind tool behavior changed.

## Validation

The local candidate passed 72 tests and 21 JSON Schema examples. The source-group regression passed. Real coding target coverage was 20/20. Design/research coverage remained 19/20. These are diagnostic retrieval checks, not semantic-quality claims.

The candidate is local only. v1.6.1 remains installed and is the rollback baseline.
