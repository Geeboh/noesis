# Decision 0006: budget-fitting lexical recall

## Status

Accepted for local implementation as the next bounded release after v1.6.0.

## Evidence

Disposable imports of one coding session and one design/research session completed with 74 imported records. A target-coverage probe returned 19 of 20 unique coding queries and 19 of 20 unique design queries. The misses reported `omitted.budget` despite short target records. The probe is diagnostic evidence, not a quality benchmark.

## Selected change

When lexical recall scores tie, rank shorter statements first. The existing lexical score remains primary. This lets a smaller exact hit fit before a long imported chunk consumes the caller's inline character budget.

No new tool, schema, provider, model, embedding, compaction, or import behavior changes.

## Acceptance

A regression test must show that equal-score recall returns the shorter matching record under a bounded character budget. Existing score ordering, scope, provenance, and omission accounting must remain intact. The full release gate must pass.

## Limits

This patch improves one deterministic budget interaction. It does not establish general recall quality, semantic relevance, or universal ranking superiority. The previous v1.6.0 release remains the rollback baseline.
