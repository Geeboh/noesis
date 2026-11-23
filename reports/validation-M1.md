# Validation report — M1 working mind loop

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M1-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | real persistence, real OMP host, HTTP integration, headless browser capture |
| Validation targets | `ledger.integrity`, `omp.capture-recall`, `dream.resilience`, `observatory.journeys` |
| Behavioral scenarios | V-001, V-002, V-003, V-004, V-005, V-006 |
| Product requirements | N-001 through N-006, N-028 |
| Tasks / milestone | M1-01 through M1-06 / M1 |
| Result | passed for M1; M8-owned release reproducibility and physical second-device checks remain outside this closure |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `32ec123` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite | 3.45.1 via `node:sqlite` `DatabaseSync` |
| OMP | omp/19.1.1 |
| Fixture/data | synthetic temporary SQLite stores; `/tmp/noesis-m1-omp-FYYveK` real host capture |
| Model/provider | OMP configured OpenAI Codex route; model identity not hardcoded by NOESIS |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `ledger.integrity` | `npm test` | passed, 46 tests | none observed |
| `omp.capture-recall` | `NOESIS_PROBE=1 omp -p --no-session --no-extensions --extension ./src/omp-extension.mjs --max-time 8`; real `mind_note` and fresh-session `mind_recall` against `/tmp/noesis-m1-omp-FYYveK` | passed | print-mode `before_agent_start` payload delivery remains unobserved |
| `dream.resilience` | `npm test` | passed | deterministic Snooze only; M4 model-assisted modes are outside M1 |
| `observatory.journeys` | `npm test`; `NOESIS_PORT=17337 NOESIS_DATA_DIR=/tmp/noesis-m1-cli npm start`; `curl -fsS http://127.0.0.1:17337/healthz`; `playwright_fast capture` at 1280x720 and 390x844 | passed | browser captures are visual evidence only; interactive pairing and physical second-device access unavailable |

## Direct observations

`NOESIS_EXTENSION_READY` advertised `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`. Real `mind_note` returned a durable receipt. Fresh `mind_recall` returned records from the same store. Reopening SQLite found the exact note `M1 real OMP capture verification` after the process ended.

The CLI bound `0.0.0.0:17337`, printed `http://192.168.1.107:17337/`, rendered a terminal QR, and printed a separate short-lived pairing code. `/healthz` returned `{"status":"ready"}`. The HTTP journey denied unauthenticated private reads, paired one client, rejected code reuse, wrote a note, recalled it, inspected it, and read Snooze status.

## Limitations and disposition

Headless Chromium captured the Observatory at 1280x720 and 390x844 with title `NOESIS Observatory` and no page errors. The capture tool does not perform application QA or interactive pairing. No physical second device was available. M1 is closed with these limits recorded; physical LAN validation remains a later M8 check.
