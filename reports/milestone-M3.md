# Milestone report: M3 Attunement and Ebb

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `9b5a77a`
**Product target:** `v0.3.0-alpha.1`
**Bootstrap version:** 1.0.0

## Outcome

M3 is complete. Attunement now exposes scoped preference creation, correction, support, and precedence through the Observatory. Ebb exposes activation evaluation and revival for real records. Explicit forgetting records affected IDs and its reason. Activation remains separate from truth, validity, and retention.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M3-01 | Preference evidence and reversible activation state model | met | `src/store.mjs`, `test/adaptation.test.mjs` |
| M3-02 | Correctable explicit and inferred preferences | met | `src/adaptation.mjs`, `test/adaptation.test.mjs` |
| M3-03 | Anchored Ebb evaluation and revival | met | `src/adaptation.mjs`, `test/adaptation.test.mjs` |
| M3-04 | Explicit forgetting receipt with affected scope | met | `src/adaptation.mjs`, `test/adaptation.test.mjs` |
| M3-05 | Observatory Attunement and Ebb controls | met | `src/server.mjs`, `test/observatory.test.mjs` |
| M3-06 | Adaptive behavior validation and local alpha notes | met | this report, `reports/validation-M3.md`, `reports/release-notes-v0.3.0-alpha.1.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Corrections override inferences; silence and derived repetition do not confirm preferences. | met | Explicit correction ordering and independent support test, plus authenticated Observatory correction journey. |
| Activation is reversible and independent of truth, validity, and retention. | met | Anchored Ebb test, same-time idempotence, elapsed-time fade, and revival journey. |
| Explicit forgetting and dependent-state behavior are tested and visible. | met | Forgetment receipt preserves reason and affected IDs; Observatory renders explicit forgetting control and status. |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `9b5a77a`.
**Fixture/data origin:** temporary SQLite stores and authenticated local Observatory journeys.

| Target | Exact command or observed procedure | Result | Limitation |
| --- | --- | --- | --- |
| `attunement.corrections` | `npm test`; authenticated preference creation and correction journey | passed | inferred support remains a candidate until explicit correction |
| `ebb.lifecycle` | `npm test`; authenticated evaluate, fade, revive journey | passed | no automatic opportunity signal is inferred |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; `playwright_fast capture` at 1280x720 and 390x844 | passed | captures are visual evidence; interactive browser control was not run |
| `ledger.integrity` | `npm test` | passed, 49 tests | none observed |

## Decisions and deviations

| Decision | Reason | Effect |
| --- | --- | --- |
| Keep activation operations reversible and record-based. | Ebb must not mutate truth, validity, retention, or delete records. | Revival restores activation without restoring any other state. |
| Require explicit record IDs for Ebb and forgetting UI actions. | Prevent accidental scope widening or inferred targets. | The user selects the exact record before mutation. |
| Record forgetting coverage as affected IDs and reason. | Controlled deletion and external copies need explicit lifecycle evidence. | External copies and future derivatives remain outside the controlled receipt. |

## Remaining risks and bounded follow-up

Interactive browser actions and physical second-device LAN validation remain unverified. Forgetting records the controlled affected set; external copies cannot be recalled. M4 Full Reverie is next.

## Integration and release disposition

The M3 implementation is committed locally in `9b5a77a`. Release notes for `v0.3.0-alpha.1` are prepared locally. Nothing was published or deployed.

## Next milestone

M4 Full Reverie is unblocked. Continue its bounded dream integration and validation work.
