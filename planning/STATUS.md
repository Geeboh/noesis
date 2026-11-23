# NOESIS implementation status

**Bootstrap version:** 1.0.0  
**Product version:** unreleased  
**Plan revision:** 2026-11-23  
**Implementation state:** M2 and M3 core policies are in progress; M1 remains open for alpha closure, browser limitation, and release notes.

This file is the editable progress record for implementation. The bootstrap's presence is evidence that a plan was delivered, not that NOESIS, its web application, its OMP adapter, or any runtime test has been implemented. No task is marked complete merely because its specification appears in this package.

## Milestone state

| ID | Milestone | State | Product target | Completion evidence |
| --- | --- | --- | --- | --- |
| M0 | Verified foundation | done | No release | `reports/milestone-M0.md` |
| M1 | Working Mind loop and LAN Observatory | in_progress | `v0.1.0-alpha.1` | `f9426b9806`, `test/observatory.test.mjs`, live startup smoke |
| M2 | Atlas, Lineage, and Chronicle | in_progress | `v0.2.0-alpha.1` | `e5643fc79a`, `test/atlas.test.mjs` |
| M3 | Attunement and Ebb | in_progress | `v0.3.0-alpha.1` | `e6b8649813`, `test/adaptation.test.mjs` |
| M4 | Full Reverie | planned | `v0.4.0-alpha.1` | None yet |
| M5 | Lore living wiki | planned | `v0.5.0-beta.1` | None yet |
| M6 | Forge and Blueprints | planned | `v0.6.0-beta.1` | None yet |
| M7 | Native portability and optional adapters | planned | `v0.7.0-beta.1` | None yet |
| M8 | Hardening and stable release | planned | `v1.0.0-rc.1` → `v1.0.0` | None yet |

The machine-readable baseline is `planning/milestones.json` and `planning/backlog.json`: nine milestones, six tasks per milestone, and 54 tasks total. M0 is complete. M1 remains open for alpha closure. M2 resource identity/snapshot/lineage core and M3 Attunement/Ebb policy core are implemented with deterministic tests; M2/M3 web views and release reports remain. M4–M8 are planned.

## Next authorized work

Continue M2-02/M2-05 and M3-05/M3-06: wire actual Atlas population and adaptation controls into the Observatory, then record milestone reports before moving to M4.

The bootstrap diagnostics are:

```sh
python3 scripts/doctor.py
python3 scripts/validate_bootstrap.py
```

These commands do not run a NOESIS application test. M0-05 binds the named application validation targets to real commands and establishes application CI. The supplied CI is for bootstrap integrity only.

## Current decision boundaries

- Runtime, package manager, OMP hook versions, source layout, and exact application commands require M0 verification.
- The preferred starting architecture is local first and lightweight, with a reusable core and native OMP adapter; third-party memory frameworks remain optional candidates.
- M1 includes the real web application, LAN default listener `0.0.0.0:7337`, same-origin API, terminal text QR for an actual address, interface selection, and pairing before private access.
- M1 includes a durable bounded Snooze. Full dream levels and modes arrive in M4; this staging does not remove `mind_dream` from the initial core.
- Lore is the sourced living wiki. Forge and Blueprints produce resource-specific improvement guides. The latter do not automatically change or publish the resource they describe.
- Native archive, integrity verification, and restore in M7 are required before v1. Only M7-02/M7-03 MCP work and separately selected external-format/backend extensions are optional. Record individual deferral decisions; do not skip M7 or its native portability gate.
- A license choice is unresolved unless the user or existing repository has already specified it. Do not add a guessed license.
- No remote push, publication, deployment, or public release is authorized by the existence of this bootstrap plan.

## How to maintain progress

Use `planned` for untouched work, `in_progress` for a claimed task in progress, `blocked` for work waiting on a specific unmet dependency, `needs_review` for a candidate awaiting its existing review gate, `done` for accepted work with observed evidence, and `deferred` for an explicitly recorded scope/release decision. Do not silently mark a required task deferred to declare a milestone complete. Optional adapter tasks may be deferred with a scoped reason and must remain unavailable; M7 closes only when required native portability and selected optional work are evidenced and every excluded optional item has a disposition. Update the JSON records and this summary together, and date each substantive status change.

Before starting a task, record its owner, branch/worktree, owned paths, current dependencies, and intended evidence. Before marking it done, record the candidate commit or artifact, outputs, actual command/results, and limitations. Populate that task's `completion_evidence` with nonempty references to the observed results. Milestones also need their own nonempty `completion_evidence` before `done`. The existing `evidence` and `evidence_required` arrays describe planned obligations; they are not proof of completion. A successful command on a different candidate is not acceptance evidence for the current one.

Keep task and milestone IDs stable so history and traceability remain valid. Change acceptance criteria, dependency obligations, or required scope only through an explicit recorded decision and synchronized plan update; do not rewrite them to disguise a failed gate. Use `templates/VALIDATION-REPORT.md` for exact command, revision, exit status, and limitations, then link that report from actual completion evidence. The ordinary bootstrap validator permits these documented status transitions; `--delivery-snapshot` is reserved for checking the original all-planned/unreleased package.

Use `templates/MILESTONE-REPORT.md` at milestone closure. Keep absent runtime checks as **not run**, failed checks as **failed**, and unavailable checks as **unavailable** with their reason. A physical cross-device LAN check is passed only if actually observed from another device; otherwise state the narrow limitation without replacing it with a mandatory human QA ceremony.

## Active work claims

M1 is owned by the integration owner on `feat/m0-foundation` at `/code/helpers/noesis-bootstrap-v1.0.0`.

| Task | Owner | Branch/worktree | Owned paths | Start evidence | State |
| --- | --- | --- | --- | --- | --- |
| M1-01 | integration owner | current worktree | `src/store.mjs`, `src/contracts.mjs`, ledger tests | `f9426b9806` | in_progress |
| M1-02 | integration owner | current worktree | `src/omp-extension.mjs`, `src/omp-events.mjs` | `E25`, `E30` | in_progress |
| M1-03 | integration owner | current worktree | `src/service.mjs`, recall/inspection tests | `E16`, `E17` | in_progress |
| M1-04 | integration owner | current worktree | Snooze service/store/tests | `E18`, `E20`, `E21`, `E22` | in_progress |
| M1-05 | integration owner | current worktree | `src/server.mjs`, `src/lan.mjs`, `src/web-auth.mjs`, Observatory tests | `E33` | in_progress |

## Evidence log

| Date | Task/candidate | Observed check or artifact | Result | Evidence reference |
| --- | --- | --- | --- | --- |
| 2026-11-24 | M0-01/M0-02 | `python3 scripts/doctor.py`; `python3 scripts/validate_bootstrap.py` | passed bootstrap prerequisites | `E1` |
| 2026-11-24 | M0-01 | OMP 19.1.1 version/help/config and real extension probe | partial; probe loaded, print request timed out | `E2`, `scripts/probe_omp.mjs` |
| 2026-11-24 | M0-03/M0-05 | `npm ci --ignore-scripts && npm run test:m0` | passed scaffold check | `VAL-M0-001`, `reports/validation-M0-scaffold.md` |
| 2026-11-24 | M0-03 | Toolchain decision and command registry | recorded | `reports/decisions/DEC-0001-m0-toolchain.md`, `validation/registry.json` |
| 2026-11-24 | M1 core | `npm test` | 35 tests passed; real OMP and CLI smoke separately observed | `f9426b9806`, `test/observatory.test.mjs` |
| 2026-11-24 | M1 LAN | `NOESIS_PORT=17337 NOESIS_DATA_DIR=/tmp/noesis-cli-smoke npm start` | actual LAN URL, terminal QR, separate pairing code printed after bind | `E33` |
| 2026-11-24 | M1 browser | browser daemon could not start because X11 `$DISPLAY` is unavailable | unavailable; HTTP journey remains passed | `E29`, `test/observatory.test.mjs` |
| 2026-11-24 | M2 core | `npm test` | Atlas aliases, snapshots, independent states, lineage, Chronicle passed | `e5643fc79a`, `test/atlas.test.mjs` |
| 2026-11-24 | M3 core | `npm test` | Attunement correction/support and anchored Ebb/forgetment passed | `e6b8649813`, `test/adaptation.test.mjs` |
## Blockers and forecast changes

Browser visual validation is unavailable because the managed Chromium daemon requires X11 `$DISPLAY`; real HTTP Observatory and startup evidence remain available. No implementation blocker is established for the next M1 route checks.
