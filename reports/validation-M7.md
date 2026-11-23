# Validation report: M7 Native portability and optional adapters

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M7-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | native archive tests, SQLite backup/restore tests, full application suite |
| Validation targets | native archive integrity, native restore, `ledger.integrity` |
| Behavioral scenarios | V-022 |
| Tasks / milestone | M7-01 through M7-06 / M7 |
| Result | passed for required native portability; optional MCP tasks explicitly deferred |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `d292e7a` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite | 3.45.1 via `node:sqlite` `DatabaseSync` |
| OMP | omp/19.1.1 |
| Fixture/data | synthetic archives and temporary SQLite stores |
| MCP/external backend | not selected; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| Native archive integrity | `node --test test/archive.test.mjs` | passed, tamper rejection, schema/version validation | unsupported fields are reported in `omitted` |
| Native store restore | archive a populated store, restore to absent destination, reopen and inspect record/resource/lineage | passed | uncontrolled external copies and live blobs are omitted |
| Backup/restore | `node --test test/operations.test.mjs` | passed with schema v4 | SQLite-only backup path |
| Full application gate | `npm test` | passed, 56 tests | no MCP transport test because deferred |
| Bootstrap/records | `python3 scripts/validate_bootstrap.py` and JSON parsing | passed | optional full JSON Schema dependency warning |

## Direct observations

A populated store archive restored the original observation, project resource, scope, and record-to-resource lineage into a clean absent store. The archive manifest carried SHA-256 payload integrity, table counts, and explicit `external_copies` omission.

Mutating archive bytes caused integrity verification failure. Restore rejected non-absent destinations and unsupported archive table shapes. No imported confidence or verification state was upgraded.

DEC-0002 records M7-02 and M7-03 as deferred. Native OMP remains the only advertised integration path; MCP is not advertised or reported as passing.

## Limitations and disposition

The native archive covers supported SQLite tables and explicitly omits uncontrolled external copies. External blobs require a future content-store portability contract. Optional MCP, external formats, and external memory backends remain unavailable. M7 is closed with these limits recorded.
