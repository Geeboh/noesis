# Decision 0008: source-group recall budgeting

## Status

Accepted for local Resonance implementation.

## User problem

A long imported message can produce multiple matching chunks. Lexical recall can spend the inline budget on several chunks from that one message and omit an independent matching source.

## Selected behavior

Keep lexical score and shorter statement length as ranking keys. When a matching record belongs to an imported source entry, select at most one matching chunk for that source entry per recall request. Count skipped same-entry chunks explicitly as grouped omissions. Records without an exact imported source identity retain current behavior.

## Invariants

Scope, provenance, query scoring, max items, max characters, and model-free behavior remain unchanged. Grouping does not merge records or alter canonical evidence. Exact details remain available through `mind_inspect`.

## Acceptance

A regression test must show that two matching chunks from one imported entry do not consume the budget before an independent matching source. Existing recall coverage and scope tests must pass. Real coding and design/research probes must report the measured result without a semantic-quality claim.
