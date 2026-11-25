# NOESIS v1.6.1 release notes

## Recall budget fit

Lexical recall still ranks by match score first. Tied matches now prefer shorter statements before preserving original record order. This prevents a long imported chunk from consuming the inline budget before a shorter tied hit is returned.

No Mind tool, schema, importer, provider, model, or compaction behavior changed.

## Validation

The local candidate passed the final 71-test release gate, bootstrap integrity, syntax checks, and 21 JSON Schema examples. A disposable coding-history probe improved target coverage from 19/20 to 20/20. A design/research probe remained 19/20. These are diagnostic retrieval checks, not semantic-quality claims.

The candidate is local only. v1.6.0 remains installed and is the rollback baseline.
