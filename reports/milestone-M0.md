# Milestone report — M0 Verified foundation

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** in_progress
**Candidate:** working tree before integration commit
**Product target:** unreleased M0
**Bootstrap version:** 1.0.0

## Outcome

The repository and installed OMP were inspected without changing user configuration. OMP 19.1.1 loaded a real file-backed extension probe. Node 24, npm 11, built-in SQLite, and qrcode 1.5.4 are the selected application toolchain. The M0 scaffold test passes. M0 is not complete because the contract, privacy, CI, and planning records still need integration and the product runtime does not exist yet.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M0-01 | Host inventory and OMP extension probe | partial; installed interface observed, full event matrix pending | `scripts/probe_omp.mjs`, `E2` |
| M0-02 | Existing branch/worktree inspected; no remote or license change | partial; integration commit pending | `git status --short --branch`, `E1` |
| M0-03 | Toolchain decision and scaffold | partial; core contracts reviewed and scaffold passes | `reports/decisions/DEC-0001-m0-toolchain.md`, `VAL-M0-001` |
| M0-04 | Contract review records LAN and pairing boundaries | pending implementation policy artifact | `docs/11-OPERATIONS-AND-BUDGETS.md` |
| M0-05 | Validation registry and M0 command map | partial; three commands bound, later targets explicitly pending | `validation/registry.json`, `VAL-M0-001` |
| M0-06 | Forecast and integration sequence | pending final status update after M0 implementation | this report |

## Exit criteria

| Roadmap criterion | Observed result | Evidence or remaining work |
| --- | --- | --- |
| Environment and OMP integration evidence recorded | partial | `E1`, `E2`; record full event/tool/model coverage during M1 adapter work |
| Core, scoping, and LAN-pairing contracts accepted | partial | source contracts reviewed; create executable policy checks before M1 closure |
| Application command map and CI separate from bootstrap CI | partial | `validation/registry.json` and `npm run test:m0`; add application CI and real service checks |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** working tree, no commit yet.
**Fixture/data origin:** synthetic only.

| Target | Exact command or observed procedure | Result | Evidence | Limitation |
| --- | --- | --- | --- | --- |
| bootstrap.integrity | `python3 scripts/validate_bootstrap.py` | passed bootstrap only | bootstrap output; `E1` | not application behavior |
| environment.compatibility | `omp --version`; `omp --help`; `omp config --help`; real extension probe | partial | `E2` | probe timed out after load while print mode awaited model work |
| contracts.schema | `npm ci --ignore-scripts && npm run test:m0` | passed scaffold check | `VAL-M0-001` | no product schemas yet |
| later targets | not run | not run | registry conditions | behavior not implemented |

## Decisions and deviations

| Decision or change | Reason/evidence | Effect |
| --- | --- | --- |
| DEC-0001 | Bun absent; Node 24 and `node:sqlite` verified | One application runtime and no native DB driver dependency |
| MCP adapter | Not selected for first release | Optional M7 task remains explicitly deferred; native portability still required |

## Remaining risks and bounded follow-up

- M1 must implement the service, durable ledger, native OMP capture, pairing, dashboard, and Snooze.
- Node `node:sqlite` is tied to the declared Node engine and needs restart/migration evidence.
- The M0 status and backlog JSON still need synchronized actual completion evidence after integration.
- Physical second-device LAN validation is unavailable until a device is present.

## Integration and release disposition

No product release or remote publication occurred. The local branch remains `feat/m0-foundation`. Runtime data and credentials are not tracked.

## Next milestone

Start M1-01 with the service contract and SQLite ledger. Keep dependency manifests and migrations under integration-owner control. Parallelize only view work after the service contract is stable.
