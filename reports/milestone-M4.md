# Milestone report: M4 Full Reverie

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `c45f4d6`
**Product target:** `v0.4.0-alpha.1`
**Bootstrap version:** 1.0.0

## Outcome

M4 is complete. `mind_dream` now accepts all four bounded levels and five concrete modes, expands `mixed` into unique stored modes, preserves scope and focus, pauses and resumes partial work, and labels non-consolidation output as hypotheses. The Observatory exposes level, mode, focus, queue, run, cancel, budget, progress, and output state. Retrospection and held-out policy evaluation are explicit service operations.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M4-01 | Independent levels, modes, scope, focus, and mixed expansion | met | `src/reverie.mjs`, `test/reverie.test.mjs` |
| M4-02 | Bounded job execution, budgets, checkpoints, pause/resume, cancellation | met | `src/service.mjs`, `test/service.test.mjs` |
| M4-03 | Retrospection over authorized observations and outcomes | met | `src/reverie.mjs`, `src/service.mjs`, Observatory test |
| M4-04 | Association, imagination, and reframing hypothesis outputs | met | hypothesis output assertions and `src/reverie.mjs` |
| M4-05 | Rehearsal output with validation-needed hypothesis status | met | bounded Reverie HTTP journey and hypothesis assertions |
| M4-06 | Reverie UI, validation, report, and local alpha notes | met | `src/server.mjs`, this report, validation report |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Every level and mode is supported with finite limits. | met | Four level capabilities, five modes, explicit budgets, max records, output caps, and UI controls. |
| Interrupted jobs retain pending work and recover safely. | met | Partial run returned `paused`, preserved remaining count, then resumed to `completed`; cancellation remained durable. |
| Creative hypotheses never self-confirm. | met | Non-consolidation outputs retain `record_type=hypothesis`, `epistemic_status=hypothesis`, and validation requirements. |
| Real UI journeys expose scope, focus, costs, evidence, and outputs. | met | Authenticated Reverie journey exercised level, mixed modes, focus, budget, run, cancellation, and retrospection. |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `c45f4d6`.
**Fixture/data origin:** temporary SQLite stores and authenticated temporary Observatory stores.

| Target | Exact command or observed procedure | Result | Limitation |
| --- | --- | --- | --- |
| `reverie.quality` | `npm test`; policy evaluation helper with disjoint development/held-out IDs | passed | scores are supplied measured inputs; no model provider is invoked |
| `dream.resilience` | `npm test`; partial run, resume, cancellation, and status checks | passed | deterministic local worker only |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; authenticated Reverie HTTP journey; `playwright_fast capture` at 1280x720 and 390x844 | passed | captures are visual evidence; interactive browser control was not run |
| `ledger.integrity` | `npm test` | passed, 52 tests | none observed |

## Decisions and deviations

| Decision | Reason | Effect |
| --- | --- | --- |
| Keep M4 execution deterministic and bounded by default. | Configured model access and prices are not required for a useful first workflow. | Model calls remain zero and cost remains explicitly null; outputs are proposals, not facts. |
| Use durable `paused` checkpoints for work exceeding one run budget. | A browser or worker interruption must not reset progress or duplicate effects. | Repeated bounded runs advance the cursor until completion. |
| Require disjoint development and held-out case IDs for policy promotion. | A model score cannot validate a policy on cases it was tuned against. | Promotion returns an explicit rollback policy ID and rejects overlap. |

## Remaining risks and bounded follow-up

No provider-backed model execution is wired into M4. This is intentional for deterministic local operation; paid model dispatch requires a later provider and budget integration. Interactive browser control, physical second-device LAN validation, and M8 release reproducibility remain outside this milestone.

## Integration and release disposition

The M4 implementation is committed locally in `c45f4d6`. Release notes for `v0.4.0-alpha.1` are prepared locally. Nothing was published or deployed.

## Next milestone

M5 Lore living wiki is unblocked. Continue sourced page integration and authored/generated section validation.
