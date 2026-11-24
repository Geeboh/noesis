# Validation report: M8 Hardening and stable release

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M8-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | clean install, full application gate, native restore, workload measurement, headless browser |
| Validation targets | `system.hardening`, `release.reproducibility`, `ledger.integrity`, `observatory.journeys` |
| Behavioral scenarios | V-022, V-023, V-024, V-025, V-026 |
| Tasks / milestone | M8-01 through M8-06 / M8 |
| Result | passed for the declared supported configuration; V-026 unavailable |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `31364e1` |
| Product version | `1.0.0` |
| Bootstrap version | `1.0.0` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite / OMP | SQLite 3.45.1 via `node:sqlite`; omp/19.1.1 |
| Artifact | `/tmp/noesis-release/noesis-1.0.0.tgz`, SHA-256 `2d0af5e9eea8e14c0eff3ac4690a0a89bd7f4f93fe9d5009d3773f05eccbb65e` |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `release.reproducibility` | `npm ci --ignore-scripts`; `npm run release:check`; `npm pack --ignore-scripts --pack-destination /tmp/noesis-release` | passed | local artifact only |
| `system.hardening` | `npm test`; archive tamper, migration, backup/restore, pairing, scope, Lore restart, and forgetting tests | passed, 56 tests | no physical second device |
| `ledger.integrity` | `npm test` | passed, 56 tests | none observed |
| `observatory.journeys` | existing authenticated Observatory tests plus headless Chromium captures at 1280x720 and 390x844 | passed | interactive browser control not run |
| `V-025` workload | `node scripts/measure_m8.mjs`, 25 records, five runs, zero errors | passed | no concurrent load generator; small representative dataset |
| `V-026` second device | not available in environment | unavailable | exact physical validation remains unverified |

## Direct observations

Clean install added the locked dependency set without lifecycle scripts. The release gate passed all 56 application tests, bootstrap validation, and CLI/server syntax checks. The package dry-run and local pack produced `noesis-1.0.0.tgz` with the recorded digest.

Native archive tamper rejection, clean-store restore, SQLite backup/restore, migration reopen, pairing denial/reuse, scope denial, Lore authored-section restart, and explicit forgetting behavior passed through the existing tests.

The five-run workload script processed 25 records per run and counted zero errors. Recall median was 1.27 ms, archive median 2.44 ms, and restore median 75.45 ms. Restore p95 was 163.03 ms. Results are local ballpark observations, not a cross-machine guarantee.

## Limitations and disposition

The candidate supports the declared Linux/Node/npm/SQLite/OMP environment. No physical second device was available. Interactive browser keyboard review and high-concurrency load remain unverified. Provider-backed model pricing, external blobs, uncontrolled copies, and deferred MCP remain outside stable claims. M8 is closed with these limits recorded.
