# Milestone report — M1 Working Mind loop

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `32ec123`
**Product target:** `v0.1.0-alpha.1`
**Bootstrap version:** 1.0.0

## Outcome

NOESIS M1 is complete. A real OMP session writes durable SQLite observations, fresh OMP recall returns scoped provenance, the Observatory reads and writes the same service, and Snooze jobs survive restart. LAN startup prints a post-bind address, secret-free text QR, and separate one-use pairing code.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M1-01 | SQLite migrations, records, revisions, sources, events, idempotency, retry jobs | met | `test/ledger.test.mjs`, `test/store.test.mjs`, `test/processing.test.mjs` |
| M1-02 | Native OMP tools, passive observers, real `mind_note`, fresh `mind_recall` | met | real OMP probes, `src/omp-extension.mjs`, `reports/validation-M1.md` |
| M1-03 | Scoped lexical recall, exact inspection, provenance and source links | met | `test/service.test.mjs`, `test/observatory.test.mjs` |
| M1-04 | Durable Snooze admission, status, bounded no-change work, cancellation, restart | met | `test/service.test.mjs`, `test/processing.test.mjs` |
| M1-05 | Same-origin HTTP UI/API, pairing, LAN address, QR, startup, real HTTP journey | met | `test/observatory.test.mjs`, `test/server.test.mjs`, `reports/validation-M1.md` |
| M1-06 | Alpha report and local release notes | met | this report, `reports/validation-M1.md`, `reports/release-notes-v0.1.0-alpha.1.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Real OMP work produces durable inspectable records. | met | Real `mind_note` receipt, fresh `mind_recall`, and exact note found after SQLite reopen. |
| Real web journeys exercise recall and Snooze. | met | `test/observatory.test.mjs`, service tests, and current 46-test run. |
| Default LAN listener advertises an actual address and secret-free QR. | met | CLI smoke on port 17337 printed `http://192.168.1.107:17337/`, QR, and separate code after bind. |
| Unpaired clients cannot access private Mind data. | met | Observatory test denies capabilities before pairing and rejects reused codes. |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `32ec123`.
**Fixture/data origin:** synthetic temporary SQLite stores and authorized local OMP probes in `/tmp/noesis-m1-omp-FYYveK`.

| Target | Exact command or observed procedure | Result | Evidence | Limitation |
| --- | --- | --- | --- | --- |
| `ledger.integrity` | `npm test` | passed, 46 tests | `reports/validation-M1.md` | none observed |
| `omp.capture-recall` | `NOESIS_PROBE=1 omp -p --no-session --no-extensions --extension ./src/omp-extension.mjs`; real `mind_note`; fresh `mind_recall`; SQLite reopen | passed | `reports/validation-M1.md` | `before_agent_start` print delivery was not observed |
| `dream.resilience` | `npm test` | passed | `reports/validation-M1.md` | deterministic Snooze only; model-assisted M4 work is outside M1 |
| `observatory.journeys` | `npm test`; `NOESIS_PORT=17337 NOESIS_DATA_DIR=/tmp/noesis-cli-smoke npm start`; `curl /healthz`; `playwright_fast capture` at 1280x720 and 390x844 | passed | `reports/validation-M1.md` | browser captures did not run interactive pairing; no physical second device |
| `release.reproducibility` | not run; M8-owned target | not applicable to M1 closure | `validation/registry.json` | clean-install release gate remains M8 scope |

## Web and LAN evidence

The CLI bound `0.0.0.0:17337`, then printed `http://192.168.1.107:17337/`, a terminal QR, and a separate short-lived pairing code. HTTP integration denied private data before pairing, paired one client, rejected code reuse, wrote a note, recalled it, inspected its source-backed record, and read Snooze status. No QR secret was used.

**Cross-device status:** unavailable.
**Evidence or precise limitation:** loopback HTTP and startup checks passed; no second LAN device was available.

## Decisions and deviations

| Decision or change | Reason/evidence | Effect on scope, compatibility, cost, or schedule |
| --- | --- | --- |
| Close M1 without source changes. | Current candidate passed application, OMP, persistence, LAN, pairing, and browser-render checks. | M2 is next; no later feature was pulled into M1. |
| Keep unavailable checks explicit. | Interactive pairing, physical second-device access, and live `before_agent_start` print delivery were not observed. | No false pass claim; M8 retains physical LAN validation. |

## Remaining risks and bounded follow-up

Interactive browser pairing and physical second-device LAN validation remain unverified. The managed browser daemon limitation is not a blocker for headless Chromium page capture. M2 integration and Observatory resource controls are the next bounded work.

## Integration and release disposition

The current candidate uses the verified Node 24, npm, SQLite, qrcode, and OMP 19.1.1 toolchain. M1 records, validation registry, report, and local alpha notes are synchronized. The alpha candidate remains local only. Nothing was published, deployed, pushed, or exposed to the Internet.

## Next milestone

M2 Atlas, Lineage, and Chronicle is unblocked. Continue M2-02/M2-05, then record the M2 report before moving to M3/M4 integration work.
