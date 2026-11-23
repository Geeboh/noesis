# Validation report: M5 Lore living wiki

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M5-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | application tests, authenticated HTTP, SQLite restart, headless browser capture |
| Validation targets | `lore.integrity`, `observatory.journeys`, `ledger.integrity`, `reverie.quality` |
| Behavioral scenarios | V-018, V-019 |
| Tasks / milestone | M5-01 through M5-06 / M5 |
| Result | passed for local deterministic Lore workflow |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `226fecb` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite | 3.45.1 via `node:sqlite` `DatabaseSync` |
| OMP | omp/19.1.1 |
| Fixture/data | temporary SQLite stores and authenticated temporary Observatory stores |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `lore.integrity` | `npm test`; Lore ownership, invalidation, diff, refresh, and restart cases | passed | deterministic local source claims |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; authenticated Lore read/edit/refresh/reopen journey | passed | browser interaction not run |
| `ledger.integrity` | `npm test`; schema migration count and backup/restore schema checks | passed, 53 tests | full JSON Schema validator dependencies unavailable |
| `reverie.quality` | `npm test` | passed | prior deterministic M4 behavior unchanged |

## Direct observations

A persisted resource Lore page loaded a generated overview. A manual section edit returned a section diff and revision increment. Generated refresh preserved the manual section. Closing and reopening the Observatory store restored the same page and authored content.

Generated sections retained source references and stale markers. Manual sections remained unmarked by source invalidation. Page descendants were not added to source records or recall evidence.

Headless Chromium rendered the updated Lore controls at 1280x720 and 390x844 with title `NOESIS Observatory` and no page errors.

## Limitations and disposition

NOESIS does not automatically crawl external sources. Lore is a persisted derived view and cannot independently confirm its own claims. Interactive browser editing, physical second-device LAN validation, and uncontrolled external-copy deletion were not verified. M5 is closed with these limits recorded.
