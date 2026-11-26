# Decision 0014: Resonance exact recall coverage

## Status

Accepted for local implementation.

## Observed gap

`mindRecall` stops scanning after the item budget fills. Returned hits remain correctly ranked, but `coverage.considered`, `coverage.matched`, and `coverage.omitted.item_limit` describe only the scanned prefix. Callers cannot distinguish a complete match count from a bounded admission count.

## Selected behavior

Keep the existing ranked result and admission budgets. Continue a deterministic metadata-only scan after the result reaches `max_items` so coverage counts all authorized matching records and item-limited omissions. Do not read additional source bodies, change scope checks, alter provenance, or admit more hits.

## Invariants

Returned order, `max_items`, `max_chars`, scope authorization, grouping, trace identity, usage accounting, and source provenance remain unchanged. Unauthorized records remain hidden from match counts. A coverage count is not a retrieval claim.

## Acceptance

A focused regression proves item-limited coverage reports all authorized matches while returning only the budgeted hits. Scope denial remains excluded. Existing ranking, character budget, native OMP, MCP, Observatory, archive, and release gates pass.
