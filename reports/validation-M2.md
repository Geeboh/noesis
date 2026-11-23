# Validation report: M2 Atlas, Lineage, and Chronicle

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M2-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | application tests, real OMP host, authenticated HTTP, live external webpage |
| Validation targets | `atlas.provenance`, `observatory.journeys`, `ledger.integrity`, `omp.capture-recall` |
| Behavioral scenarios | V-003, V-004, V-007, V-008 |
| Tasks / milestone | M2-01 through M2-06 / M2 |
| Result | passed for M2; automatic crawling and physical second-device checks remain outside scope |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `7b385b9` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite | 3.45.1 via `node:sqlite` `DatabaseSync` |
| OMP | omp/19.1.1 |
| Fixture/data | temporary SQLite stores; real OMP store `/tmp/noesis-m2-omp-MROMqY`; live `https://example.com` |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `atlas.provenance` | `npm test`; external webpage journey using `fetch('https://example.com')`, authenticated resource registration, two snapshots, detail, and trace | passed | refresh body was explicit; NOESIS does not fetch automatically |
| `observatory.journeys` | `node --test test/observatory.test.mjs` | passed, resource filters, snapshots, states, trace, and pairing | HTTP interaction test, not physical LAN validation |
| `ledger.integrity` | `npm test` | passed, 48 tests | none observed |
| `omp.capture-recall` | Real OMP `mind_note` with `NOESIS_PROBE=1`; reopened store inspection | passed | only explicit project identity is inferred from host context |

## Direct observations

Real OMP startup advertised the existing four NOESIS tools. A real `mind_note` created an observation, a local project resource, six idempotent lineage links from host observations, and seven Chronicle rows in the temporary store. The project resource carried only the explicit `referenced=true` state.

A live fetch of `https://example.com` returned HTTP 200 and 577 bytes. Two authenticated snapshot writes produced two distinct digests and a `source_changed` Chronicle event. The original snapshot remained inspectable.

The Observatory test denied private data before pairing. After pairing, it registered an external webpage, wrote two snapshots, set one explicit state, applied kind/origin/limit filtering, inspected both snapshots, and traced Chronicle history.

Headless Chromium `playwright_fast capture` rendered the updated Observatory at 1280x720 and 390x844 with title `NOESIS Observatory` and no page errors. Captures are visual evidence only, not interactive application QA.
## Limitations and disposition

NOESIS does not crawl external sources or infer `installed`, `used`, or `evaluated` from URLs, availability, or tool success. Browser visual capture and physical second-device LAN validation remain separate checks. M2 is closed with these limits recorded.
