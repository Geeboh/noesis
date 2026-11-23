# Milestone report: M5 Lore living wiki

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `226fecb`
**Product target:** `v0.5.0-beta.1`
**Bootstrap version:** 1.0.0

## Outcome

M5 is complete. Lore pages now persist with stable identities, generated and manual section ownership, source references, backlinks, revision history, invalidation, refresh, diffs, and restart recovery. The Observatory provides authenticated Lore reading, manual editing, and generated refresh controls.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M5-01 | Source-aware Lore pages with manual/generated ownership | met | `src/lore.mjs`, `test/lore.test.mjs` |
| M5-02 | Persisted generated sourced pages | met | `src/store.mjs`, `src/server.mjs` |
| M5-03 | Dependency invalidation and manual-preserving refresh | met | `src/lore.mjs`, Lore tests |
| M5-04 | Reading, editing, diffs, backlinks, and web routes | met | `src/server.mjs`, `test/observatory.test.mjs` |
| M5-05 | Schema migration and restart reconstruction | met | `test/store.test.mjs`, `test/operations.test.mjs`, Observatory restart test |
| M5-06 | Beta validation, report, and local release notes | met | this report, `reports/validation-M5.md`, `reports/release-notes-v0.5.0-beta.1.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Source changes affect correct generated sections without erasing manual work. | met | Invalidation marks generated sections stale; refresh preserves authored sections. |
| Pages retain provenance and cannot recursively confirm derived claims. | met | Generated sections retain source refs; page descendants are not added as source evidence. |
| Reading, editing, refresh, and recovery have end-to-end evidence. | met | Authenticated HTTP journey edited, refreshed, and reopened a persisted page. |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `226fecb`.
**Fixture/data origin:** temporary SQLite stores and authenticated temporary Observatory stores.

| Target | Exact command or observed procedure | Result | Limitation |
| --- | --- | --- | --- |
| `lore.integrity` | `npm test`; Lore ownership/invalidation; persistent Observatory edit/refresh/restart journey | passed | page generation is deterministic and local |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; authenticated Lore read/edit/refresh | passed | interactive browser control not run |
| `ledger.integrity` | `npm test`; schema migration and reopen checks | passed, 53 tests | schema validation dependency warning remains |
| `reverie.quality` | `npm test` | passed | M4 deterministic behavior unchanged |

## Decisions and deviations

| Decision | Reason | Effect |
| --- | --- | --- |
| Persist Lore pages in SQLite as derived records. | Manual ownership and restart recovery need durable page identity and revision state. | Lore remains derived from records and never becomes independent evidence. |
| Use explicit refresh and invalidation operations. | Source changes must not silently overwrite authored content. | Generated sections can be stale until a bounded refresh. |
| Return section diffs from manual edit, refresh, and invalidation. | Users need reviewable changes without a second client-side page store. | Server responses expose before/after section changes. |

## Remaining risks and bounded follow-up

Lore does not automatically crawl sources. External copies and uncontrolled exports remain outside deletion control. Interactive browser editing and physical second-device LAN validation remain unverified. M6 Forge and Blueprints is next.

## Integration and release disposition

The M5 implementation is committed locally in `226fecb`. Release notes for `v0.5.0-beta.1` are prepared locally. Nothing was published or deployed.

## Next milestone

M6 Forge and Blueprints is unblocked. Continue scoped component improvement and export integration.
