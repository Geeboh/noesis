# Milestone report: M6 Forge and Blueprints

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `4408fc6`
**Product target:** `v0.6.0-beta.1`
**Bootstrap version:** 1.0.0

## Outcome

M6 is complete. Forge now selects one resource and scope, separates observations, lessons, and dream hypotheses, and launches a focused bounded dream. Blueprints export scoped findings, evidence, suggestions, hypotheses, reproduction cases, versions, omissions, limitations, and deltas. Privacy redaction and incompatible-baseline errors are explicit. No export patches or publishes a resource.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M6-01 | Resource and version-scoped Forge selection | met | `src/forge.mjs`, `test/forge.test.mjs` |
| M6-02 | Resource-specific observations and attribution | met | `src/service.mjs`, authenticated plugin/project journey |
| M6-03 | Focused bounded dream launch from Forge | met | `src/server.mjs`, Reverie route tests |
| M6-04 | Structured Blueprint full and delta exports | met | `src/forge.mjs`, `test/forge.test.mjs` |
| M6-05 | Privacy redaction, baseline checks, omission/limitation reporting | met | Blueprint privacy and incompatible-baseline tests |
| M6-06 | Forge UI, validation, report, and local beta notes | met | this report, `reports/validation-M6.md`, `reports/release-notes-v0.6.0-beta.1.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Plugin/tool and non-plugin resources produce useful evidence-backed guides. | met | Authenticated plugin and project resources each produced scoped Forge findings and Blueprint evidence. |
| Observed learning and dream hypotheses remain distinct with version/scope limits. | met | Forge separates findings, lessons, and hypotheses; focused dreams carry resource scope and focus. |
| Round trips preserve provenance meaning and disclose omissions without automatic trust promotion. | met | Blueprint carries source refs, privacy redaction, baseline/delta metadata, limitations, and no patch/publish effect. |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `4408fc6`.
**Fixture/data origin:** synthetic temporary SQLite stores and authenticated temporary Observatory stores.

| Target | Exact command or observed procedure | Result | Limitation |
| --- | --- | --- | --- |
| `blueprints.portability` | `npm test`; full Blueprint and incompatible-baseline cases | passed | no external publication or remote patch performed |
| `atlas.provenance` | authenticated plugin/project registration and resource-scoped notes | passed | deterministic local evidence only |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; Forge, Blueprint, and focused-dream HTTP journey | passed | browser capture is visual evidence only |
| `reverie.quality` | `npm test` | passed, 55 tests | deterministic dream execution; no provider calls |

## Decisions and deviations

| Decision | Reason | Effect |
| --- | --- | --- |
| Keep Forge selection explicit by resource ID and scope. | A session may mention multiple resources; attribution must not expand silently. | Plugin and project guides remain separate and inspectable. |
| Keep hypotheses separate from findings and suggestions. | Dream output is not observed evidence or a validated fix. | Blueprints carry hypotheses with their original provenance. |
| Reject incompatible baselines. | Ambiguous deltas can silently misapply guidance. | Export fails clearly instead of emitting a partial pack. |

## Remaining risks and bounded follow-up

Forge does not patch or publish remote resources. Model-backed enrichment and external experiment execution remain unavailable. Interactive browser controls, physical second-device LAN validation, and final release reproducibility remain outside M6.

## Integration and release disposition

The M6 implementation is committed locally in `4408fc6`. Release notes for `v0.6.0-beta.1` are prepared locally. Nothing was published or deployed.

## Next milestone

M7 Native portability and optional adapters is unblocked. Continue required native archive, integrity, and restore work.
