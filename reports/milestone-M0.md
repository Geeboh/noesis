# Milestone report — M0 Verified foundation

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `17151f48e3ac4e9d58168a30d7f743db570bfd37`
**Product target:** unreleased M0
**Bootstrap version:** 1.0.0

## Outcome

The repository and installed OMP were inspected without changing user configuration. OMP 19.1.1 loaded a real file-backed extension probe. Node 24, npm 11, built-in SQLite, and qrcode 1.5.4 are the selected application toolchain. The M0 scaffold test passes. M0 closes with bounded host-event unknowns carried into M1; no product release or runtime feature is claimed.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M0-01 | Host inventory and OMP extension probe | met for the selected environment; event payload details remain an M1 adapter check | `scripts/probe_omp.mjs`, `E1`, `E2` |
| M0-02 | Existing branch/worktree inspected; no remote or license change | met; checkpoint committed locally | `git status --short --branch`, `E1`, `17151f48e3` |
| M0-03 | Toolchain decision and scaffold | met | `reports/decisions/DEC-0001-m0-toolchain.md`, `VAL-M0-001` |
| M0-04 | Contract review records LAN and pairing boundaries | met; implementation remains M1 scope | `config/noesis.example.json`, `docs/11-OPERATIONS-AND-BUDGETS.md` |
| M0-05 | Validation registry and M0 command map | met; later targets explicitly pending | `validation/registry.json`, `.github/workflows/application.yml`, `VAL-M0-001` |
| M0-06 | Forecast and integration sequence | met; M1-01 is dependency-ready | this report, `planning/STATUS.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence or remaining work |
| --- | --- | --- |
| Environment and OMP integration evidence recorded | met with bounded unknowns | `E1`, `E2`; host-event payload details are an M1 acceptance check |
| Core, scoping, and LAN-pairing contracts accepted | met as contracts and policy fixture | `config/noesis.example.json`, `docs/11-OPERATIONS-AND-BUDGETS.md` |
| Application command map and CI separate from bootstrap CI | met | `validation/registry.json`, `.github/workflows/application.yml`, `npm test` |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `17151f48e3ac4e9d58168a30d7f743db570bfd37`.
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
 - The M0 status and backlog JSON are synchronized with completion evidence.
- Physical second-device LAN validation is unavailable until a device is present.

## Integration and release disposition

No product release or remote publication occurred. The local branch remains `feat/m0-foundation`. Runtime data and credentials are not tracked.

## Next milestone

Start M1-01 with the service contract and SQLite ledger. Keep dependency manifests and migrations under integration-owner control. Parallelize only view work after the service contract is stable.
