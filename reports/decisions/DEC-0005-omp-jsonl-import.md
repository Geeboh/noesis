# Decision 0005: bounded OMP JSONL import

## Status

Accepted for local implementation. No installation or publication is authorized by this record.

## User problem

Existing OMP session JSONL contains useful coding and design history, but NOESIS only captures live events. Manual replay loses entry identity, source provenance, oversized content, unsupported-event coverage, and resumable progress.

## Selected behavior

Add an offline OMP JSONL importer with four operations:

- Preflight one UTF-8 JSONL file without writing.
- Start one import run after retaining the exact raw JSONL snapshot in SQLite.
- Resume a run in bounded line batches.
- Inspect run status and quarantine entries through the importer module and CLI.

The importer accepts session metadata and visible `user`, `assistant`, and `toolResult` message text. It excludes hidden thinking and non-text parts. Text longer than the existing 16,000-character capture limit is split into ordered records. Malformed lines, unsupported top-level types, unsupported roles, missing IDs, duplicate sessions, and messages without visible text enter quarantine with source line metadata.

Each imported record uses `document_import` provenance and a source row that points to the retained raw run, exact line, message ID, role, and chunk range. Repeated work uses stable run, line, and chunk idempotency keys. A crash before cursor advancement replays safely and returns duplicate receipts.

## Alternatives

The rejected alternative stores raw files under a data-directory blob tree and keeps only a SQLite manifest. It avoids database growth but makes archive, restore, deletion, and path ownership separate systems. The selected SQLite-native shape keeps raw retention, run state, quarantine, records, and archive restore under one authority. The tradeoff is a bounded per-file byte limit and larger SQLite archives.

## Invariants

- OMP remains the only automatic conversation-compaction owner.
- Imported data remains `document_import`, never `tool_observation`.
- Scope is session-scoped and checked against the caller principal.
- Raw source bytes remain available even when a line is quarantined.
- Imported summaries are not generated. No model calls, provider retries, embeddings, child jobs, or provider changes occur. Manual resume replays only uncommitted idempotent lines.
- Native archive and restore preserve import runs, raw snapshots, quarantine, records, and source references.
- Live data is never read or rewritten by tests. Release validation uses disposable stores.

## Limits

- Raw UTF-8 source size is bounded to 64 MiB per run.
- One JSONL line is bounded to 4 MiB.
- A visible text chunk is bounded to 16,000 characters.
- The importer does not infer semantic outcomes, preferences, or trust from imported text.

## Acceptance

Focused tests must prove preflight counts, raw retention, chunk reconstruction, quarantine, scope denial, crash-safe resume, idempotent rerun, and archive/restore. The full release gate must pass. The live v1.4.0 service remains the recovery baseline.
