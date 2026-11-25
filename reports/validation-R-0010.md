# Validation report: R-0010 bounded OMP JSONL import

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | `VAL-R-0010-001` |
| Recorded at | 2026-11-25 |
| Operator | integration owner |
| Evidence class | real persistence, real OMP host |
| Validation target | `R10-O1` |
| Behavioral scenarios | importer preflight, raw retention, chunking, quarantine, resume, archive restore, native OMP probe |
| Tasks | `R-0010-T001` through `R-0010-T004` |
| Result | passed with stated limits |

## Exact candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `78adf84f3f15b08a98f6c4efdd1ee045f6ea1496` |
| Artifact | `/tmp/noesis-r10-release/noesis-1.6.0.tgz` |
| Artifact SHA-256 | `d4fec7d21116bfbeda13863d35d1525f4dbb4ad8793b30e31ee14a1b25f79c33` |
| Schema | SQLite schema version 5 |
| Environment | Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1 |
| Model/provider | Not used by importer; native probe used configured host route only |
| Fixture | Disposable synthetic JSONL for focused tests |
| Real sample | One local coding session and one local design/research session; content was not printed or committed |

## Exact checks

```text
node --test test/importer.test.mjs test/importer-cli.test.mjs test/service.test.mjs test/archive.test.mjs test/store.test.mjs test/operations.test.mjs
npm run release:check
node --check src/importer.mjs
node --check scripts/import_omp_jsonl.mjs
npm pack --ignore-scripts --pack-destination /tmp/noesis-r10-release
NOESIS_PROBE=1 npm run probe:omp
```

The focused suite passed 27 tests. The release gate passed 70 tests, bootstrap integrity, and syntax checks. Full JSON Schema validation remained unavailable because `requirements-validation.txt` was not installed.

The real-session smoke used a disposable database. The coding source was 552,444 bytes and 96 lines. It completed with 39 imported records and 58 quarantined entries. The design/research source was 332,560 bytes and 114 lines. It completed with 35 imported records and 79 quarantined entries. The temporary store contained 74 records, 2 import runs, and 137 quarantine rows before cleanup.

The native OMP probe reached `NOESIS_EXTENSION_READY` with capability revision 2. It advertised the existing four Mind tools. OMP configuration and compaction ownership were unchanged.

## Criteria and outcomes

| Criterion | Actual observation | Result |
| --- | --- | --- |
| Raw retention | Source digest, byte length, and exact raw UTF-8 text survived reopen and native archive/restore. | passed |
| Chunking | A 16,003-character visible message reconstructed exactly from two records. | passed |
| Quarantine | Malformed, unsupported, missing-ID, hidden-only, and duplicate-session entries were quarantined without aborting the run. | passed |
| Resume | Bounded batches advanced durable cursors. A simulated capture-before-cursor failure replayed through the same idempotency receipt. | passed |
| Scope | A different owner could not read the import run or its quarantine. | passed |
| Archive | Restored stores retained import runs, quarantine, records, and source references. | passed |
| Legacy idempotency | Existing `mind_note` request digests remained compatible after adding import provenance. | passed |

## Limitations and disposition

The importer accepts one UTF-8 source up to 64 MiB and one JSONL line up to 4 MiB. It imports visible text from `user`, `assistant`, and `toolResult` messages. It excludes hidden reasoning, tool-call arguments, and derived summaries. It makes no semantic claims and performs no model work. Raw source retention increases SQLite size. The public run status omits quarantined raw bodies; the authoritative raw source and internal quarantine rows retain them.

The live v1.4.0 service was not installed or modified. No remote push, publication, provider install, or paid evaluation occurred.

**Disposition:** adopt the bounded importer as a local 1.6.0 candidate. Keep publication and installation unauthorized.
