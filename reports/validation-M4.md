# Validation report: M4 Full Reverie

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M4-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | application tests, authenticated HTTP, headless browser capture |
| Validation targets | `reverie.quality`, `dream.resilience`, `observatory.journeys`, `ledger.integrity` |
| Behavioral scenarios | V-014, V-015, V-016, V-017 |
| Tasks / milestone | M4-01 through M4-06 / M4 |
| Result | passed for deterministic bounded M4 workflow |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `c45f4d6` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite | 3.45.1 via `node:sqlite` `DatabaseSync` |
| OMP | omp/19.1.1 |
| Fixture/data | temporary SQLite stores and authenticated temporary Observatory stores |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `reverie.quality` | `npm test`; `evaluatePolicy` with disjoint development and held-out IDs | passed | policy scores are supplied evidence; no model provider invoked |
| `dream.resilience` | `npm test`; partial dream run, resume, cancellation, and durable status | passed | deterministic local execution only |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; queue/run/cancel/retrospect HTTP journey | passed | browser captures are visual evidence only |
| `ledger.integrity` | `npm test` | passed, 52 tests | none observed |

## Direct observations

All four levels and five concrete modes were accepted. `mixed` expanded to the five unique concrete modes. Dream jobs stored bounded budgets and focus. A partial run returned `paused` with remaining work, then resumed to `completed` without resetting the cursor.

Association, imagination, rehearsal, and reframing outputs retained `record_type=hypothesis` and `epistemic_status=hypothesis`. Rehearsal outputs retained an authorized-real-world validation requirement. Retrospection marked authorized observations as observed and did not create actual outcomes from hypotheses.

The authenticated Observatory journey queued a focused `dream` job, ran bounded work, displayed hypothesis outputs, queued and cancelled a `deep_sleep` rehearsal job, and requested retrospection. Headless Chromium rendered the Reverie controls at 1280x720 and 390x844 with title `NOESIS Observatory` and no page errors.

## Limitations and disposition

M4 does not invoke paid model providers. Model calls remain zero and cost remains null for deterministic local runs. Provider-backed child calls, embeddings, and real experiments require later configured integrations. Interactive browser control, physical second-device LAN validation, and final release reproducibility remain unverified.
