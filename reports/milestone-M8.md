# Milestone report: M8 Hardening and stable release

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `31364e1`
**Product target:** `v1.0.0`
**Bootstrap version:** 1.0.0

## Outcome

M8 is complete for the declared Linux x86_64, Node 24, npm 11, SQLite, and OMP 19.1.1 configuration. The stable package metadata is `1.0.0`, clean installation and the release gate pass, native backup/archive restore is covered, the operations runbook exists, and a local `noesis-1.0.0.tgz` artifact was built. Remote publication remains separately unauthorized.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M8-01 | Supported scope freeze and five-run workload measurement | met | `scripts/measure_m8.mjs`, `reports/validation-M8.md` |
| M8-02 | Failure, migration, backup, privacy, and restore validation | met | `npm test`, archive/operations/Observatory tests |
| M8-03 | Clean install, stable package metadata, local artifact, and runbook | met | `package.json`, `package-lock.json`, `docs/15-OPERATIONS-RUNBOOK.md` |
| M8-04 | Complete persisted UI journeys and conditional LAN disposition | met with device limitation | Observatory tests, headless captures, `reports/validation-M8.md` |
| M8-05 | Bounded regression gate and defect disposition | met | `npm run release:check`, no unresolved release blocker |
| M8-06 | Stable report and local v1.0.0 release notes | met | this report, `reports/validation-M8.md`, `reports/release-notes-v1.0.0.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Supported workflows meet agreed gates with candidate evidence. | met | 56-test release gate, bootstrap validation, syntax checks, and persisted journeys. |
| Clean install and restore work. | met | `npm ci --ignore-scripts`, package artifact, SQLite backup/restore, and native archive restore. |
| Cross-device access recorded when available, otherwise exact limit stated. | unavailable, explicitly recorded | No second LAN device was available; automated LAN address, pairing, and HTTP checks passed. |
| Stable local artifact and truthful release notes exist. | met | `/tmp/noesis-release/noesis-1.0.0.tgz`, SHA-256 recorded below, and release notes. |
| M7 native portability complete and optional adapters disposed. | met | M7 report and DEC-0002; MCP remains unavailable. |

## Validation

**Environment:** Linux x86_64, 16 cores, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1. Load average before measurement was 2.65, 2.67, 2.83. The measurement is a five-run representative ballpark, not a comparison between implementations.
**Tested candidate:** `31364e1`.
**Artifact:** `/tmp/noesis-release/noesis-1.0.0.tgz`; SHA-256 `2d0af5e9eea8e14c0eff3ac4690a0a89bd7f4f93fe9d5009d3773f05eccbb65e`.

| Target | Exact command or observed procedure | Result | Limitation |
| --- | --- | --- | --- |
| `release.reproducibility` | `npm ci --ignore-scripts`; `npm run release:check`; `npm pack --ignore-scripts --pack-destination /tmp/noesis-release` | passed | private package is not published |
| `system.hardening` | `npm test`; pairing, scope, archive tamper, backup/restore, migration, and Lore restart cases | passed, 56 tests | external physical device unavailable |
| `ledger.integrity` | `npm test` | passed, 56 tests | none observed |
| Workload measurement | `node scripts/measure_m8.mjs`, 25 records, five runs, zero errors | passed | restore p50 75.45 ms, p95 163.03 ms; small local dataset, no concurrency load |

### Representative workload measurements

| Operation | Runs | Median | P95 | Range |
| --- | ---: | ---: | ---: | ---: |
| Scoped recall | 5 | 1.27 ms | 1.79 ms | 1.14 to 1.79 ms |
| Native archive creation | 5 | 2.44 ms | 3.40 ms | 1.33 to 3.40 ms |
| Clean-store restore | 5 | 75.45 ms | 163.03 ms | 39.34 to 163.03 ms |

The measured restore path is bounded by SQLite file creation and table insertion. No failures occurred, and the script verified record counts and restored schema for each run. These numbers are operational observations, not universal performance guarantees.

## Decisions and deviations

| Decision | Reason | Effect |
| --- | --- | --- |
| Freeze v1.0.0 to the existing supported configuration. | It is the only environment with candidate-specific OMP and application evidence. | Other platforms, providers, and transports remain unsupported rather than implied. |
| Keep MCP and external backends unavailable. | M7 native portability is complete without them and DEC-0002 records the deferral. | Native stable release does not depend on optional infrastructure. |
| Record second-device validation as unavailable. | No second LAN device was available in this environment. | Automated LAN and pairing evidence remains valid; V-026 stays unverified. |

## Remaining risks and bounded follow-up

Physical second-device access, high-concurrency load, interactive browser keyboard review, provider-backed model cost behavior, external blobs, and uncontrolled copies remain outside observed evidence. These are documented limitations, not hidden release claims.

## Integration and release disposition

Stable product metadata is `1.0.0`; bootstrap metadata remains `1.0.0` with separate meaning. The local artifact is reproducible from the committed source and lockfile. Nothing was pushed, published, deployed, or exposed to the public Internet by M8.

## Next milestone

M8 closes the planned implementation sequence. Further work requires an explicit post-v1 scope decision.
