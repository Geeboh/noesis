# Validation report — M0 scaffold and toolchain

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M0-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | synthetic policy |
| Validation target | contracts.schema |
| Behavioral scenarios | none; M0 scaffold only |
| Product requirements | N-028 foundation only |
| Tasks / milestone | M0-03, M0-05 / M0 |
| Result | passed |

## Exact candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | no implementation commit yet; branch `feat/m0-foundation` |
| Working-tree changes | package.json, package-lock.json, test/m0.test.mjs, validation/registry.json, reports/decisions/DEC-0001-m0-toolchain.md, reports/validation-M0-scaffold.md, scripts/probe_omp.mjs |
| Artifact identity | npm lockfile; qrcode 1.5.4 |
| Dependency lock / schema version | npm lockfileVersion 3; package schema version 0.1.0-alpha.1 |
| OS / hardware | Linux x86_64 |
| Runtime / package manager | Node v24.22.3; npm 11.19.1; SQLite CLI 3.45.1 |
| OMP / client / browser | omp/19.1.1; browser not used |
| Model / provider / price assumptions | OMP configured roles observed; no model request in this scaffold check |
| Fixture / dataset | synthetic in-memory SQLite row and public documentation URL |
| Relevant configuration | no configuration changes; global OMP memory backend observed `off` |

## Invocation and observed execution

**Working directory:** `/code/helpers/noesis-bootstrap-v1.0.0`

```text
npm ci --ignore-scripts && npm run test:m0
```

| Execution field | Actual observation |
| --- | --- |
| Exit code | 0 |
| Termination / timeout | none |
| Relevant output | `selected Node runtime supplies SQLite and QR primitives`; 1 test passed |
| Result artifact | `test/m0.test.mjs` |

## Criteria and outcomes

| Criterion | Expected observation | Actual observation | Result |
| --- | --- | --- | --- |
| Node SQLite | Create, write, and read a temporary database | `DatabaseSync` round trip returned `ok` | passed |
| QR primitive | Create a nonempty QR matrix for a valid URL | qrcode 1.5.4 returned modules with positive size | passed |

## Limitations and disposition

This check does not prove the NOESIS service, native OMP adapter, dashboard, pairing, or product behavior. Those remain pending and are bound in `validation/registry.json` by milestone. No second-device or LAN check was run.

**Next action:** implement the M1 durable ledger and service boundary.
**Planning update:** M0 scaffold evidence is available; task and milestone planning records remain pending until all M0 outputs are integrated.
**Reviewer conclusion:** M0 toolchain candidate is ready for implementation.
