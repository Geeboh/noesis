# NOESIS implementation status

**Bootstrap version:** 1.0.0  
**Product version:** unreleased  
**Plan revision:** 2026-11-23  
**Implementation state:** M0 in progress; selected toolchain and initial scaffold are verified, product runtime is not implemented.

This file is the editable progress record for implementation. The bootstrap's presence is evidence that a plan was delivered, not that NOESIS, its web application, its OMP adapter, or any runtime test has been implemented. No task is marked complete merely because its specification appears in this package.

## Milestone state

| ID | Milestone | State | Product target | Completion evidence |
| --- | --- | --- | --- | --- |
| M0 | Verified foundation | in_progress | No release | `reports/milestone-M0.md` |
| M1 | Working Mind loop and LAN Observatory | planned | `v0.1.0-alpha.1` | None yet |
| M2 | Atlas, Lineage, and Chronicle | planned | `v0.2.0-alpha.1` | None yet |
| M3 | Attunement and Ebb | planned | `v0.3.0-alpha.1` | None yet |
| M4 | Full Reverie | planned | `v0.4.0-alpha.1` | None yet |
| M5 | Lore living wiki | planned | `v0.5.0-beta.1` | None yet |
| M6 | Forge and Blueprints | planned | `v0.6.0-beta.1` | None yet |
| M7 | Native portability and optional adapters | planned | `v0.7.0-beta.1` | None yet |
| M8 | Hardening and stable release | planned | `v1.0.0-rc.1` → `v1.0.0` | None yet |

The machine-readable baseline is `planning/milestones.json` and `planning/backlog.json`: nine milestones, six tasks per milestone, and 54 tasks total. Of these, 52 are required for v1 and two MCP adapter tasks are explicitly optional. All are planned in this snapshot. The estimate is 59–86 engineering days, roughly 12–18 working weeks under the roadmap assumptions. It is not a promised completion date.

## Next authorized work

Begin M0-03, M0-04, M0-05, and M0-06 after the selected toolchain. M1-01 is the next dependency-ready product task once M0 closes.

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

# Active work claims

M0 is owned by the integration owner on `feat/m0-foundation` at `/code/helpers/noesis-bootstrap-v1.0.0`.

| Task | Owner | Branch/worktree | Owned paths | Start evidence | State |
| --- | --- | --- | --- | --- | --- |
| M0-01 | integration owner | `feat/m0-foundation` / current worktree | OMP probe and environment reports | `E1`, `E2` | in_progress |
| M0-02 | integration owner | `feat/m0-foundation` / current worktree | planning and repository records | `E1` | in_progress |
| M0-03 | integration owner | `feat/m0-foundation` / current worktree | package manifest, scaffold, decision record | `E3`, `VAL-M0-001` | in_progress |
| M0-05 | integration owner | `feat/m0-foundation` / current worktree | validation registry and application checks | `VAL-M0-001` | in_progress |

## Evidence log

| Date | Task/candidate | Observed check or artifact | Result | Evidence reference |
| --- | --- | --- | --- | --- |
| 2026-11-24 | M0-01/M0-02 | `python3 scripts/doctor.py`; `python3 scripts/validate_bootstrap.py` | passed bootstrap prerequisites | `E1` |
| 2026-11-24 | M0-01 | OMP 19.1.1 version/help/config and real extension probe | partial; probe loaded, print request timed out | `E2`, `scripts/probe_omp.mjs` |
| 2026-11-24 | M0-03/M0-05 | `npm ci --ignore-scripts && npm run test:m0` | passed scaffold check | `VAL-M0-001`, `reports/validation-M0-scaffold.md` |
| 2026-11-24 | M0-03 | Toolchain decision and command registry | recorded | `reports/decisions/DEC-0001-m0-toolchain.md`, `validation/registry.json` |

## Blockers and forecast changes

No implementation blocker is established. M0 remains open until policy checks, CI binding, and final planning evidence are integrated.
