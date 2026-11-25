# Release plan: R-0010 bounded OMP JSONL import

## Identity and baseline

- Stable release ID: `R-0010-omp-jsonl-import`.
- Target application version: `1.6.0`.
- Theme: bounded historical continuity.
- Baseline candidate: local R9 commit `f15ed0026c31f96b9fd2a459756b6ca6622f047c`.
- Recovery baseline: published and installed v1.4.0.
- Decision: `reports/decisions/DEC-0005-omp-jsonl-import.md`.

## User problem

Existing OMP session JSONL contains useful coding and design history. NOESIS cannot import it with raw-source retention, exact provenance, quarantine, or resumable progress.

## Selected slice

Provide a local offline importer for one bounded UTF-8 OMP JSONL file. Preflight reads without writing. Start stores the exact raw source, session scope, digest, and manifest in SQLite. Resume processes bounded line batches. Visible message text becomes `document_import` observation records. Oversized text is chunked without content loss. Unsupported or malformed entries are quarantined with line metadata and remain recoverable from the raw source.

## Non-goals

- No new Mind tool.
- No provider proxy, model call, embedding, summary, or Origami output.
- No automatic compaction change.
- No import of hidden reasoning or non-text tool-call arguments as evidence.
- No live-data migration, installation, publication, or remote write.

## Data shape

`import_runs` is the durable state machine: `ready -> running -> paused -> completed`, with `failed` resumable after an unexpected error. It stores the raw UTF-8 JSONL text, source digest, locator, scope, line cursor, counts, manifest, and error state.

`import_quarantine` stores run ID, line and byte ranges, entry ID when known, reason, and the original raw line. Imported source rows point at the run, line, message role, and ordered chunk range. Existing idempotency receipts make replay after a crash safe.

## Limits and budget

- Maximum raw source per run: 64 MiB.
- Maximum JSONL line: 4 MiB.
- Maximum imported record: 16,000 characters.
- Resume batch default: 64 lines, caller maximum: 1,000.
- Model calls: 0.
- Model tokens: 0.
- Embeddings: 0.
- Child jobs: 0.
- Monetary cost: 0.

## Dependency-ordered tasks

1. `R-0010-T001` add schema and store methods for raw runs and quarantine.
2. `R-0010-T002` implement preflight, chunking, quarantine, and resumable import module.
3. `R-0010-T003` add CLI command, archive/restore coverage, and focused tests.
4. `R-0010-T004` run release validation, update operations and release records, and prepare a local candidate.

## Acceptance evidence

- Preflight rejects non-UTF-8, oversized, or missing-session inputs without writes.
- Raw source digest and bytes survive restart and native archive/restore.
- Visible text chunks concatenate exactly to each imported message projection.
- Unsupported, malformed, no-text, and missing-ID lines are quarantined without aborting the run.
- Resume advances bounded cursors, survives a crash after capture, and reruns idempotently.
- Scope denial exposes no import identity or source content.
- OMP configuration and compaction ownership remain unchanged.
- Focused importer tests and `npm run release:check` pass.

## Rollout and recovery

Run preflight first. Start imports against a disposable copy or an explicitly selected NOESIS database. Back up the live store before any operator import. Stop the importer by leaving a run `paused`; resume with its run ID. Roll back with the existing v1.4.0 database backup and candidate artifact. No install or publication is part of this release task.

## Adoption rule

Adopt only if raw retention, chunk reconstruction, quarantine, resume, scope, and archive/restore checks pass without changing existing Mind or OMP behavior. Defer if raw data cannot remain authoritative or if recovery requires an external writable store.
