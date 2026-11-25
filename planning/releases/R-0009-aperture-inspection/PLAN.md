# Release plan: R-0009 Aperture exact inspection

## Identity and baseline

- Stable release ID: `R-0009-aperture-inspection`.
- Target application version: `1.5.0`.
- Theme and primary outcome: Resonance Aperture. Add revision-bound bounded exact inspection before any Origami summary work.
- Accepted baseline: application `1.4.0`, tag `v1.4.0`, commit `bcc58d4089fc6fda2f65199464b85917e5f0257b`, artifact SHA-256 `2902151ca22e8abeed0b75c9b32389342200c935c77b36ef5355f38bc9000025`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0009-aperture-inspection/backlog.json`.

## User problem and baseline

A short recall or derived view can omit an exact identifier, quotation, value, or failure detail. NOESIS can inspect an exact record revision today, but `mind_inspect` returns a whole object/source list without bounded pages, continuation, or explicit exact/partial/unavailable coverage. The addendum's recovery receipt is a design proposal, not an implemented contract.

Current OMP owns automatic conversation compaction. NOESIS has no compaction hook and must not become a second owner. Current NOESIS capabilities advertise four tools only: `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`. Current `mind_recall` is lexical and bounded. Current `mind_inspect` has record ID and optional revision but no range/paging. Current data includes revisions, sources, snapshots, scopes, lineage, Chronicle, and native archive/restore.

## Selected slice

R9 implements only exact inspection. A caller selects an authorized record revision and a bounded content range/page. The response reports exact, partial, summary-only, or unavailable coverage, returned bounds, source/revision identity, and an opaque continuation tied to source revision, selection, and authorization. The first implementation may page only retained textual statement/source content if the source inventory proves that is the safe common shape. It must report unsupported content rather than coerce or fabricate it.

No Origami brief is generated in R9. Its adoption depends on whether exact inspection exposes a measured need for a derived view.

## Outcomes and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R9-O1` | Exact detail omitted from a compact view can be recovered honestly. | Whole-object inspect with no page/range coverage. | Authorized revision-bound page respects hard limits, returns explicit coverage and continuation, preserves source identity and integrity status, and denies stale/unauthorized cursors. |

Excluded scope:

- No Origami summary or hierarchical projection.
- No automatic OMP compaction change, proxy, acp-kernel, billion-context, provider, or new backend.
- No new top-level tool. Extend `mind_inspect`; do not advertise unavailable `mind_trace`, `mind_explore`, or `mind_manage`.
- No lifecycle or learning-policy changes.

## Dependency-ordered tasks

1. `R-0009-T001` inventory retained textual source/record shapes and measure current inspect response limits.
2. `R-0009-T002` define and implement revision-bound page request/receipt using existing service authorization.
3. `R-0009-T003` add native adapter and Observatory inspector journey with cursor/scope failure cases.
4. `R-0009-T004` validate archive/restore compatibility and prepare the local candidate.

## Affected contracts and migrations

- `mind_inspect` gains optional bounded page arguments and additive coverage/continuation fields.
- Existing callers omitting page arguments receive current complete behavior when within limits.
- `mind_recall` and `mind_dream` semantics do not change.
- No database migration is planned if receipts are derived from retained rows. If durable page receipts become necessary, stop and amend the plan before schema work.
- Native archive/restore must preserve any new durable fields; derived receipts need no storage migration.

## Acceptance evidence

- Source inventory identifies which retained fields are textual, exact, and pageable.
- Focused tests prove exact and partial pages match the same revision, UTF-8 boundaries are safe, limits hold, and continuation advances without duplicate bytes.
- Scope tests prove unauthorized records, sources, revisions, and cursors fail without identity disclosure.
- Correction/deletion tests prove a cursor bound to an old revision cannot expose current or deleted content.
- Observatory and native `mind_inspect` paths expose the same coverage semantics.
- Archive/restore tests remain faithful.
- Existing release gate passes. No model calls or provider spend.

## Evaluation budget and rollout

R9 uses 0 model calls, 0 model tokens, 0 embeddings, 0 retries, 0 child jobs, and 0 monetary cost. Local command wall limit is 300 seconds. Deterministic fixtures cover coding and noncoding text, identifiers, units, contradictions, and source unavailability. The first pilot is correctness-only; no quality or provider-cost claim is allowed.

Rollout is additive behind existing clients. Do not change OMP compaction settings. Candidate validation uses disposable stores. Recovery is the published v1.4.0 tag/artifact and `/tmp/noesis-live-backup-v1.4/mind.sqlite`.

## Adoption/rejection rule

Adopt R9 if exact pages match retained revision bytes/content, continuation is bounded and revision/authorization-bound, scope/deletion/restore invariants pass, and no existing release gate regresses. Reject or defer if source shapes cannot support honest coverage or if the implementation needs a schema/proxy/compactor change. Origami remains deferred after rejection or inconclusive evidence.

## Effort and uncertainty

Estimated 1 to 3 engineering days. Main uncertainty is the variety of retained source snapshot content and whether byte-exact ranges are available without introducing a new blob format. Reforecast after T001; do not install an upstream kernel to resolve this uncertainty.

## Authorization boundary

This record is a concrete plan, not implementation authorization. No branch push, publication, package installation, provider proxy, or paid evaluation is authorized for R9. Use the follow-on implementation prompt in `DEC-0004-aperture-origami.md` after authorization.
