# NOESIS v1.6.0 release notes

## Bounded OMP JSONL import

NOESIS can now retain and import one bounded OMP session JSONL file without changing OMP compaction ownership.

- Preflight reads a UTF-8 source without writing.
- Start stores the exact source text, digest, session scope, and manifest in SQLite.
- Resume processes bounded line batches and survives capture-before-cursor failures.
- Visible text imports as `document_import` evidence.
- Oversized visible messages split into ordered records without content loss.
- Unsupported, malformed, missing-ID, hidden-only, and duplicate-session entries enter quarantine.
- Native archive and restore preserve raw imports, quarantine, records, and source references.
- The CLI supports `preflight`, `start`, `resume`, and `status`.

## Limits

The default source limit is 64 MiB. One JSONL line can be at most 4 MiB. Imported records remain at the existing 16,000-character capture limit. Hidden reasoning, tool-call arguments, and summaries are not imported. No model calls, embeddings, provider proxy, or automatic compaction changes were added.

## Validation

The local candidate passed 70 tests and the release gate. A real coding session and a real design/research session completed in a disposable database. The candidate is not installed or published.
