# Validation report: M3 Attunement and Ebb

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M3-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | application tests, authenticated HTTP, headless browser capture |
| Validation targets | `attunement.corrections`, `ebb.lifecycle`, `observatory.journeys`, `ledger.integrity` |
| Behavioral scenarios | V-009, V-010, V-011, V-012, V-013 |
| Tasks / milestone | M3-01 through M3-06 / M3 |
| Result | passed for M3; interactive browser and physical second-device checks remain unavailable |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `9b5a77a` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite | 3.45.1 via `node:sqlite` `DatabaseSync` |
| OMP | omp/19.1.1 |
| Fixture/data | temporary SQLite stores and authenticated temporary Observatory stores |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `attunement.corrections` | `npm test`; POST preference, POST correction, GET preference journey | passed | no model inference is used |
| `ebb.lifecycle` | `npm test`; evaluate at two effective times, revive, and inspect activation | passed | opportunity signals remain explicit inputs only |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; headless Chromium captures at 1280x720 and 390x844 | passed | browser captures are visual evidence only |
| `ledger.integrity` | `npm test` | passed, 49 tests | none observed |

## Direct observations

Explicit correction changed an inferred preference to `origin=explicit` and `state=current`. A second inferred preference did not outrank the corrected preference. Duplicate support context remained deduplicated.

Ebb evaluation at the same effective time remained idempotent. Evaluation at a later time reduced activation. Revival restored the selected record's activation to `1` without changing record truth or validity. Explicit forgetting returned the target and affected IDs with the supplied reason.

The Observatory landing page contained Attunement and Ebb controls. The authenticated HTTP journey exercised preference creation, correction, activation evaluation, revival, and forgetting. Headless Chromium rendered the updated page at both tested sizes with title `NOESIS Observatory` and no page errors.

## Limitations and disposition

NOESIS does not infer confirmation from silence, repeated summaries, or elapsed time. Interactive browser control and physical second-device LAN validation were not run. Forgetting cannot affect uncontrolled external copies. M3 is closed with these limits recorded.
