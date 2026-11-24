# NOESIS implementation status

**Bootstrap version:** 1.0.0  
**Product version:** 1.2.0  
**Plan revision:** 2026-11-24  
**Implementation state:** M1 through M8 remain complete. Published and installed v1.2.0 is the recovery baseline. R-0003 Afterglow budget safety is the active local patch candidate with no publication authorization.
**Active release:** `R-0003-afterglow-budget` targeting `1.2.1`. Plan: `planning/releases/R-0003-afterglow-budget/PLAN.md`.
**Next task:** Start `R-0003-T001` with the isolated budget-starvation reproduction. Preserve v1.2.0 service, tag, artifact, and live backup.

This file is the editable progress record for implementation. The bootstrap's presence is evidence that a plan was delivered, not that NOESIS, its web application, its OMP adapter, or any runtime test has been implemented. No task is marked complete merely because its specification appears in this package.

## Milestone state

| ID | Milestone | State | Product target | Completion evidence |
| --- | --- | --- | --- | --- |
| M0 | Verified foundation | done | No release | `reports/milestone-M0.md` |
| M1 | Working Mind loop and LAN Observatory | done | `v0.1.0-alpha.1` | `reports/milestone-M1.md`, `reports/validation-M1.md`, `reports/release-notes-v0.1.0-alpha.1.md` |
| M2 | Atlas, Lineage, and Chronicle | done | `v0.2.0-alpha.1` | `reports/milestone-M2.md`, `reports/validation-M2.md`, `reports/release-notes-v0.2.0-alpha.1.md` |
| M3 | Attunement and Ebb | done | `v0.3.0-alpha.1` | `reports/milestone-M3.md`, `reports/validation-M3.md`, `reports/release-notes-v0.3.0-alpha.1.md` |
| M4 | Full Reverie | done | `v0.4.0-alpha.1` | `reports/milestone-M4.md`, `reports/validation-M4.md`, `reports/release-notes-v0.4.0-alpha.1.md` |
| M5 | Lore living wiki | done | `v0.5.0-beta.1` | `reports/milestone-M5.md`, `reports/validation-M5.md`, `reports/release-notes-v0.5.0-beta.1.md` |
| M6 | Forge and Blueprints | done | `v0.6.0-beta.1` | `reports/milestone-M6.md`, `reports/validation-M6.md`, `reports/release-notes-v0.6.0-beta.1.md` |
| M7 | Native portability and optional adapters | done | `v0.7.0-beta.1` | `reports/milestone-M7.md`, `reports/validation-M7.md`, `reports/release-notes-v0.7.0-beta.1.md`, `reports/decisions/DEC-0002-m7-optional-adapters.md` |
| M8 | Hardening and stable release | done | `v1.0.0` | `reports/milestone-M8.md`, `reports/validation-M8.md`, `reports/release-review-v1.0.0.md`, `reports/release-notes-v1.0.0.md` |

The machine-readable baseline is `planning/milestones.json` and `planning/backlog.json`: nine milestones, six tasks per milestone, and 54 tasks total. M0 through M8 are complete. Post-v1 work requires an explicit scope decision.

## Next authorized work

No next milestone is authorized. Post-v1 changes require a new scoped decision and release plan.

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
| M1-01 | integration owner | current worktree | `src/store.mjs`, `src/contracts.mjs`, ledger tests | `f9426b9806` | done |
| M1-02 | integration owner | current worktree | `src/omp-extension.mjs`, `src/omp-events.mjs` | `E25`, `E30` | done |
| M1-03 | integration owner | current worktree | `src/service.mjs`, recall/inspection tests | `E16`, `E17` | done |
| M1-04 | integration owner | current worktree | Snooze service/store/tests | `E18`, `E20`, `E21`, `E22` | done |
| M1-05 | integration owner | current worktree | `src/server.mjs`, `src/lan.mjs`, `src/web-auth.mjs`, Observatory tests | `E33` | done |
| M1-06 | integration owner | current worktree | M1 reports, validation registry, release notes | current candidate validation | done |
| M2-01 | integration owner | current worktree | `src/atlas.mjs`, resource tests | `e5643fc79a` | done |
| M2-02 | integration owner | current worktree | `src/omp-extension.mjs`, OMP resource tests | current OMP Atlas evidence | done |
| M2-03 | integration owner | current worktree | `src/store.mjs`, snapshot tests | `7b385b9` | done |
| M2-04 | integration owner | current worktree | `src/atlas.mjs`, lineage/history tests | `7b385b9` | done |
| M2-05 | integration owner | current worktree | `src/server.mjs`, Observatory tests | `7b385b9` | done |
| M2-06 | integration owner | current worktree | M2 reports and release notes | current candidate validation | done |
| M3-01 | integration owner | current worktree | preference and activation policies | `e6b8649813` | done |
| M3-02 | integration owner | current worktree | `src/adaptation.mjs`, correction tests | `e6b8649813` | done |
| M3-03 | integration owner | current worktree | Ebb activation tests | `e6b8649813` | done |
| M3-04 | integration owner | current worktree | forgetting tests and receipts | `e6b8649813` | done |
| M3-05 | integration owner | current worktree | `src/server.mjs`, Observatory adaptation controls | `9b5a77a` | done |
| M3-06 | integration owner | current worktree | M3 reports and release notes | current candidate validation | done |
| M4-01 | integration owner | current worktree | `src/reverie.mjs`, mode/level tests | `c45f4d6` | done |
| M4-02 | integration owner | current worktree | `src/service.mjs`, bounded job tests | `c45f4d6` | done |
| M4-03 | integration owner | current worktree | retrospection and policy evaluation | `c45f4d6` | done |
| M4-04 | integration owner | current worktree | hypothesis output tests | `c45f4d6` | done |
| M4-05 | integration owner | current worktree | rehearsal and validation status | `c45f4d6` | done |
| M4-06 | integration owner | current worktree | Reverie UI, M4 reports, release notes | current candidate validation | done |
| M5-01 | integration owner | current worktree | `src/lore.mjs`, Lore tests | `226fecb` | done |
| M5-02 | integration owner | current worktree | `src/server.mjs`, `src/store.mjs` | `226fecb` | done |
| M5-03 | integration owner | current worktree | invalidation and refresh tests | `226fecb` | done |
| M5-04 | integration owner | current worktree | Lore web routes and Observatory tests | `226fecb` | done |
| M5-05 | integration owner | current worktree | schema migration and restart tests | `226fecb` | done |
| M5-06 | integration owner | current worktree | M5 reports and release notes | current candidate validation | done |
| M6-01 | integration owner | current worktree | `src/forge.mjs`, Forge tests | `4408fc6` | done |
| M6-02 | integration owner | current worktree | resource-specific findings and attribution | `4408fc6` | done |
| M6-03 | integration owner | current worktree | focused dream and scope controls | `4408fc6` | done |
| M6-04 | integration owner | current worktree | Blueprint full/delta export | `4408fc6` | done |
| M6-05 | integration owner | current worktree | privacy and baseline compatibility | `4408fc6` | done |
| M6-06 | integration owner | current worktree | Forge UI, M6 reports, release notes | current candidate validation | done |
| M7-01 | integration owner | current worktree | native archive contract and optional dispositions | `d292e7a` | done |
| M7-02 | integration owner | current worktree | optional MCP access | DEC-0002 scoped deferral | deferred |
| M7-03 | integration owner | current worktree | optional transport parity | DEC-0002 scoped deferral | deferred |
| M7-04 | integration owner | current worktree | `src/archive.mjs`, archive tests | `d292e7a` | done |
| M7-05 | integration owner | current worktree | native portability and restore validation | `d292e7a` | done |
| M7-06 | integration owner | current worktree | M7 reports, decision, release notes | current candidate validation | done |
| M8-01 | integration owner | current worktree | scope freeze and workload measurement | `31364e1` | done |
| M8-02 | integration owner | current worktree | failure, migration, backup, privacy, restore checks | `31364e1` | done |
| M8-03 | integration owner | current worktree | package artifact and operations runbook | `31364e1` | done |
| M8-04 | integration owner | current worktree | full journeys and cross-device disposition | `31364e1` | done |
| M8-05 | integration owner | current worktree | release gate and bounded defect review | current candidate validation | done |
| M8-06 | integration owner | current worktree | M8 report and stable release notes | current candidate validation | done |
## Evidence log

| Date | Task/candidate | Observed check or artifact | Result | Evidence reference |
| --- | --- | --- | --- | --- |
| 2026-11-24 | M0-01/M0-02 | `python3 scripts/doctor.py`; `python3 scripts/validate_bootstrap.py` | passed bootstrap prerequisites | `E1` |
| 2026-11-24 | M0-01 | OMP 19.1.1 version/help/config and real extension probe | partial; probe loaded, print request timed out | `E2`, `scripts/probe_omp.mjs` |
| 2026-11-24 | M0-03/M0-05 | `npm ci --ignore-scripts && npm run test:m0` | passed scaffold check | `VAL-M0-001`, `reports/validation-M0-scaffold.md` |
| 2026-11-24 | M0-03 | Toolchain decision and command registry | recorded | `reports/decisions/DEC-0001-m0-toolchain.md`, `validation/registry.json` |
| 2026-11-24 | M1 core | `npm test` | 46 tests passed; current candidate verified | `reports/validation-M1.md` |
| 2026-11-24 | M1 OMP | `NOESIS_PROBE=1 omp ... --extension ./src/omp-extension.mjs`; real `mind_note` and fresh `mind_recall`; SQLite reopen | tool advertisement, capture, recall, and exact-note persistence passed | `reports/validation-M1.md` |
| 2026-11-24 | M1 LAN | `NOESIS_PORT=17337 NOESIS_DATA_DIR=/tmp/noesis-cli-smoke npm start`; `curl /healthz` | actual LAN URL, separate pairing code, and ready health response observed | `reports/validation-M1.md` |
| 2026-11-24 | M1 browser | `playwright_fast capture` at 1280x720 and 390x844 | page rendered with no page errors; capture is visual evidence only | `reports/validation-M1.md` |
| 2026-11-24 | M2 core | `npm test` | Atlas aliases, snapshots, independent states, lineage, Chronicle passed | `e5643fc79a`, `test/atlas.test.mjs` |
| 2026-11-24 | M3 core | `npm test` | Attunement correction/support and anchored Ebb/forgetment passed | `e6b8649813`, `test/adaptation.test.mjs` |
| 2026-11-24 | M2 core | `npm test` | 48 tests passed; Atlas identity, snapshots, states, Lineage, and Chronicle checks passed | `reports/validation-M2.md` |
| 2026-11-24 | M2 OMP | real OMP `mind_note` with Atlas inspection | local project resource, explicit referenced state, lineage links, and Chronicle rows observed | `reports/validation-M2.md` |
| 2026-11-24 | M2 external source | live `https://example.com` fetch plus two authenticated snapshots | HTTP 200, 577 bytes, distinct digests, preserved first snapshot, and `source_changed` event | `reports/validation-M2.md` |
| 2026-11-24 | M2 Observatory | authenticated resource registration, filters, detail, state, and trace journey | passed with scope and output limits | `reports/validation-M2.md` |
| 2026-11-24 | M3 core | `npm test` | 49 tests passed; correction precedence, Ebb idempotence, revival, and forgetting passed | `reports/validation-M3.md` |
| 2026-11-24 | M3 Observatory | authenticated preference/Ebb/forget journey | correction, fade, revival, and explicit forgetting passed | `reports/validation-M3.md` |
| 2026-11-24 | M3 browser | `playwright_fast capture` at 1280x720 and 390x844 | updated controls rendered with no page errors; capture is visual evidence only | `reports/validation-M3.md` |
| 2026-11-24 | M4 core | `npm test` | 52 tests passed; bounded levels, modes, pause/resume, hypotheses, retrospection, and policy evaluation passed | `reports/validation-M4.md` |
| 2026-11-24 | M4 Observatory | authenticated queue/run/cancel/retrospect journey | budgets, focus, hypothesis outputs, cancellation, and retrospection passed | `reports/validation-M4.md` |
| 2026-11-24 | M4 browser | `playwright_fast capture` at 1280x720 and 390x844 | Reverie controls rendered with no page errors; capture is visual evidence only | `reports/validation-M4.md` |
| 2026-11-24 | M5 core | `npm test` | 53 tests passed; Lore ownership, invalidation, refresh, diffs, and restart passed | `reports/validation-M5.md` |
| 2026-11-24 | M5 Observatory | authenticated Lore read/edit/refresh/restart journey | manual section preserved across refresh and restart | `reports/validation-M5.md` |
| 2026-11-24 | M5 browser | `playwright_fast capture` at 1280x720 and 390x844 | Lore controls rendered with no page errors; capture is visual evidence only | `reports/validation-M5.md` |
| 2026-11-24 | M6 core | `npm test` | 55 tests passed; Forge, Blueprint, privacy, delta, and baseline checks passed | `reports/validation-M6.md` |
| 2026-11-24 | M6 Observatory | authenticated plugin/project Forge and Blueprint journey | resource attribution, focused dream, and incompatible baseline checks passed | `reports/validation-M6.md` |
| 2026-11-24 | M6 browser | `playwright_fast capture` at 1280x720 and 390x844 | Forge and Blueprint controls rendered with no page errors; capture is visual evidence only | `reports/validation-M6.md` |
| 2026-11-24 | M7 native | `npm test`; archive tamper and clean-store restore tests | 56 tests passed; native archive integrity and restore passed | `reports/validation-M7.md` |
| 2026-11-24 | M7 optional adapters | DEC-0002 | MCP tasks explicitly deferred and unavailable; no external backend selected | `reports/decisions/DEC-0002-m7-optional-adapters.md` |
| 2026-11-24 | M8 hardening | `npm run release:check`; `npm ci --ignore-scripts` | 56 tests, bootstrap, syntax, and clean install passed | `reports/validation-M8.md` |
| 2026-11-24 | M8 artifact | `npm pack --ignore-scripts --pack-destination /tmp/noesis-release` | `noesis-1.0.0.tgz` built with recorded SHA-256 | `reports/validation-M8.md` |
| 2026-11-24 | M8 workload | `node scripts/measure_m8.mjs` | five runs, 25 records, zero errors; recall/archive/restore metrics recorded | `reports/validation-M8.md` |
| 2026-11-24 | v1.0.0 use | `npm ci --ignore-scripts`; copied migration; native OMP note/recall/inspect/Snooze; live dashboard restart, URL/QR/pairing | accepted release running with preserved live data and explicit limitations | `reports/use-v1.0.0.md` |
| 2026-11-24 | v1.1.0 use/publication | `npm ci --ignore-scripts`; `npm run release:check`; live managed restart, backup, pairing; branch/tag push; GitHub release | published and running locally; native print-mode OMP smoke reached extension readiness then timed out | `reports/use-v1.1.0.md`, `planning/releases/R-0001-resonance/RELEASE-REPORT.md` |
| 2026-11-24 | R-0002 record correction | release tracker status reconciled to published after remote/tag verification | R2 baseline now accurately closed | `planning/releases/R-0002-resonance-ranking/release.json` |
| 2026-11-24 | R-0003 candidate | baseline budget starvation; continue-after-omission regression; paired Observatory budget recall; `npm run release:check`; local artifact | local `1.2.1` candidate ready; no publication or live install | `planning/releases/R-0003-afterglow-budget/RELEASE-REPORT.md`, `reports/validation-R-0003.md` |
| 2026-11-24 | R-0003 installation | backup, clean install, release gate, managed restart, actual LAN URL/QR, pairing, and OMP extension probe | v1.2.1 installed and healthy; native simple probe passed; fresh native write/recall remains unclaimed | `reports/use-v1.2.1.md` |
| 2026-11-24 | R-0003 publication | branch/tag push and GitHub release with verified artifact | v1.2.1 published; installed dashboard remains healthy | `planning/releases/R-0003-afterglow-budget/RELEASE-REPORT.md` |
## Blockers and forecast changes
M1 through M8 remain complete. v1.2.1 is published and installed locally for the declared dashboard path. Fresh native write/recall remains unclaimed from the malformed forced-tool attempt. Physical second-device LAN validation, full schemas, and durable non-`/tmp` data storage remain limitations.
