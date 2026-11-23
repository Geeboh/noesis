# Milestone report: M2 Atlas, Lineage, and Chronicle

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** done
**Candidate:** `7b385b9`
**Product target:** `v0.2.0-alpha.1`
**Bootstrap version:** 1.0.0

## Outcome

M2 is complete. OMP work now registers the local project resource and links captured observations. The Observatory exposes bounded resource listing, filters, detail, snapshots, independent states, lineage, and Chronicle history. External webpage snapshots preserve old content and record source changes without fabricating unavailable content.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M2-01 | Universal resource identity, aliases, facets, and independent states | met | `src/atlas.mjs`, `test/atlas.test.mjs` |
| M2-02 | OMP project discovery and record-to-resource links | met | real OMP Atlas population, `src/omp-extension.mjs` |
| M2-03 | Immutable versioned snapshots and unavailable-source records | met | `test/atlas.test.mjs`, external webpage journey |
| M2-04 | Scoped Lineage and Chronicle projections with source-change history | met | `src/atlas.mjs`, `test/atlas.test.mjs` |
| M2-05 | Observatory Atlas resource, snapshot, state, and history views | met | `src/server.mjs`, `test/observatory.test.mjs` |
| M2-06 | Acceptance validation, report, and local alpha notes | met | this report, `reports/validation-M2.md`, `reports/release-notes-v0.2.0-alpha.1.md` |

## Exit criteria

| Roadmap criterion | Observed result | Evidence |
| --- | --- | --- |
| Local resources and external webpages have stable identities and inspectable snapshots. | met | Real OMP project resource and live `https://example.com` snapshot journey. |
| Changed sources preserve old evidence and mark dependent state appropriately. | met | Two immutable snapshots, `source_changed` Chronicle event, and examined state marked stale. |
| Atlas and provenance/history views use real data and enforce scope. | met | Pair-gated Observatory routes, bounded filters, detail, trace, and authorization tests. |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
**Tested candidate:** `7b385b9`.
**Fixture/data origin:** synthetic temporary SQLite stores, real OMP capture in `/tmp/noesis-m2-omp-MROMqY`, and live `https://example.com` content.

| Target | Exact command or observed procedure | Result | Limitation |
| --- | --- | --- | --- |
| `atlas.provenance` | `npm test`; real OMP Atlas population; external webpage refresh journey | passed | external refresh used an explicit second captured body; NOESIS does not crawl automatically |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; authenticated resource/snapshot/state/trace HTTP journey | passed | physical second-device validation is M8 scope |
| `ledger.integrity` | `npm test` | passed, 48 tests | none observed |
| `omp.capture-recall` | Real OMP `mind_note` with `NOESIS_EXTENSION_READY`; store inspection found project resource, linked records, and Chronicle rows | passed | host resource metadata remains limited to explicit project identity |

## External webpage evidence

A live fetch of `https://example.com` returned HTTP 200 and 577 bytes. The Observatory resource API stored two explicit snapshots with distinct SHA-256 digests. The second snapshot produced a `source_changed` Chronicle event. The first snapshot remained present.

## Decisions and deviations

| Decision | Reason | Effect |
| --- | --- | --- |
| Keep Atlas as the resource-domain facade. | Resource identity, scope, snapshots, lineage, and Chronicle share one invariant boundary. | OMP and Observatory use typed Atlas operations without adding a second resource store. |
| Do not infer resource states from text, URLs, availability, or successful tools. | M2 contracts separate referenced, examined, available, installed, used, and evaluated. | External resources remain untrusted data and require explicit state evidence. |
| Keep refresh input explicit. | M2 needs source history, not an automatic crawler. | Crawling and filesystem watching remain future scope. |

## Remaining risks and bounded follow-up

NOESIS does not automatically crawl external pages or infer installation/use/evaluation. Browser capture validates rendering, while interactive pairing and physical second-device LAN validation remain unverified. M3 Attunement and Ebb is next.

## Integration and release disposition

The M2 implementation is committed locally in `7b385b9`. Release notes for `v0.2.0-alpha.1` are prepared locally. Nothing was published or deployed.

## Next milestone

M3 Attunement and Ebb is unblocked. Continue its integration and Observatory controls, then record the M3 report.
