# Validation report — M1 working mind loop

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M1-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | real persistence and real OMP host |
| Validation targets | `ledger.integrity`, `omp.capture-recall`, `dream.resilience`, `observatory.journeys` |
| Behavioral scenarios | V-001, V-002, V-003, V-004, V-005, V-006 |
| Product requirements | N-001 through N-006, N-028 |
| Tasks / milestone | M1-01 through M1-06 / M1 |
| Result | partial; M1-01 through M1-05 behavior is implemented and locally evidenced; M1-06 remains open for alpha closure |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `6be8aec197695e24374a88559cb96327e2e7a153` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1; SQLite 3.45.1 |
| OMP | omp/19.1.1 |
| Fixture/data | synthetic temporary SQLite stores; `/tmp/noesis-omp-live` real host capture |
| Model/provider | OMP configured OpenAI Codex route; model identity not hardcoded by NOESIS |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `contracts.schema` | `npm test` | passed, 46 tests | application correctness; Playwright visual check separate |
| `ledger.integrity` | `npm test` | passed | covered restart, idempotency, revisions, sources, retry state |
| `omp.capture-recall` | real OMP `mind_note` and fresh-session `mind_recall` probes against `/tmp/noesis-omp-live` | passed | print probe did not emit before_agent_start payload; capability gap recorded |
| `dream.resilience` | `npm test` | passed | deterministic M1 Snooze only; M4 modes remain unavailable |
| `observatory.journeys` | `npm test` `test/observatory.test.mjs`; `NOESIS_PORT=17339 NOESIS_DATA_DIR=/tmp/noesis-playwright-proof npm start`; `npx playwright screenshot --browser=chromium http://127.0.0.1:17339/ /tmp/noesis-playwright.png` | passed HTTP/startup and Playwright screenshot | interactive Playwright pairing flow not run; physical second-device unavailable |

## LAN and pairing detail

The CLI smoke bound `0.0.0.0:17337`, then printed actual address `http://192.168.1.107:17337/`, a terminal QR, and a separate short-lived pairing code. The real HTTP journey denied private data before pairing, paired one client, rejected reuse, wrote a note, recalled it, inspected its source-backed record, and read Snooze status. No QR secret was used.

## Limitations and next action

Playwright headless Chromium captured `/tmp/noesis-playwright.png` at 1280x720. The managed browser daemon's X11 limitation does not apply to this check. Interactive browser pairing and physical second-device validation remain unavailable.
