# Milestone report: M7 Native portability and optional adapters

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `d292e7a`
**Product target:** `v0.7.0-beta.1`
**Bootstrap version:** 1.0.0

## Outcome

M7 is complete. Native archives now cover supported SQLite state, content-addressed integrity manifests, tamper rejection, and clean-store restore without MCP or an external backend. Scope, records, revisions, resources, source references, lineage, jobs, adaptation state, and Lore pages are preserved. Optional MCP tasks are explicitly deferred and unavailable.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M7-01 | Native archive schema, coverage, omissions, and optional-adapter boundaries | met | `src/archive.mjs`, `reports/decisions/DEC-0002-m7-optional-adapters.md` |
| M7-02 | Optional MCP access | deferred | decision DEC-0002; not advertised |
| M7-03 | Optional transport parity | deferred | decision DEC-0002; not advertised |
| M7-04 | Native integrity verification and clean-store restore | met | `src/archive.mjs`, `test/archive.test.mjs` |
| M7-05 | Native-only portability validation | met | `test/archive.test.mjs`, `test/operations.test.mjs`, `reports/validation-M7.md` |
| M7-06 | Beta report and adapter dispositions | met | this report, `reports/validation-M7.md`, `reports/release-notes-v0.7.0-beta.1.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Native archive, integrity, and restore meet required gates independently of MCP. | met | Content-addressed archive verifies and restores into an absent clean store. |
| Required tasks complete and optional tasks explicitly disposed. | met | M7-01/04/05/06 done; DEC-0002 defers M7-02/03. |
| Native OMP works without MCP and capabilities match implementation. | met | Existing native extension remains the only advertised transport; no MCP tools are advertised. |
| Optional format losses are explicit. | met | No optional format selected; native archive records `omitted` coverage. |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `d292e7a`.
**Fixture/data origin:** temporary SQLite stores and synthetic native archive fixtures.

| Target | Exact command or observed procedure | Result | Limitation |
| --- | --- | --- | --- |
| Native archive integrity | `node --test test/archive.test.mjs` | passed, tamper rejection and store restore | archive covers supported tables only; omissions are explicit |
| Native backup/restore | `node --test test/operations.test.mjs` | passed, schema v4 backup/restore | live external blobs are outside SQLite archive |
| Full application gate | `npm test` | passed, 56 tests | full JSON Schema dependencies remain unavailable |
| Bootstrap/records | `python3 scripts/validate_bootstrap.py`; planning JSON parse | passed | validator warns about optional schema package |

## Decisions and deviations

| Decision | Reason | Effect |
| --- | --- | --- |
| Select native portability only. | Native archive works without another memory system or transport. | MCP, COGX, and external backends are not required for this release. |
| Defer M7-02 and M7-03. | No concrete supported MCP client or transport parity requirement is selected. | Optional capabilities remain unavailable and unadvertised. |
| Reject restore into an existing destination. | Clean-store restore must not silently merge or overwrite state. | Operators must choose an absent destination and review explicit omissions. |

## Remaining risks and bounded follow-up

External blobs and uncontrolled copies remain outside native SQLite restore coverage. Optional adapters need a new scoped selection decision, client, budget, and mapping-loss evidence. M8 hardening and release reproducibility are next.

## Integration and release disposition

The M7 implementation is committed locally in `d292e7a`. Release notes for `v0.7.0-beta.1` are prepared locally. Nothing was published or deployed.

## Next milestone

M8 Hardening and stable release is unblocked after the required M7 native portability gate. Continue backup, migration, installation, and release reproducibility work.
