# Decision DEC-0004 — Aperture exact inspection before Origami

**Status:** proposed, implementation not authorized by this record
**Date:** 2026-11-25
**Owner:** integration owner
**Baseline:** NOESIS v1.4.0, tag `v1.4.0`, commit `bcc58d4089fc6fda2f65199464b85917e5f0257b`
**Related release:** R-0009-aperture-inspection

## Decision

Adopt the research separation between canonical evidence, bounded derived views, and explicit expansion. Select one native Aperture slice first. Extend exact `mind_inspect` with revision-bound bounded inspection and honest coverage. Do not implement Origami summaries, install a context proxy, or reuse upstream kernel code in this slice.

The selected slice is a contract and recovery experiment. It does not change retention, confidence, validity, adoption, fading, source authority, automatic compaction ownership, or learning policy.

## Actual starting point

- OMP executable: `/root/.local/bin/omp`.
- OMP version: `omp/19.1.1`.
- Runtime: Node `v24.22.3`, npm `11.19.1`, SQLite 3.45.1.
- OMP memory backend: `off`.
- OMP compaction owner: built-in OMP policy. Observed settings have `compaction.enabled=true`, `experimentalContextManagement=false`, `midTurnEnabled=true`, method order `remote,handoff,shake,soft,snapcompact`, `remoteStreamingV2Enabled=true`, `asyncEnabled=true`, `idleEnabled=false`, `keepRecentTokens=30000`, `v2RetainedMessageBudget=64000`, and `autoContinue=true`.
- Configured model route: `default=openai-codex/gpt-5.6-luna`; plan role `openai-codex/gpt-6-astra`; no NOESIS model call has been made.
- NOESIS actual capability response: contract `0.1.0`, capability revision `1`, tools `mind_note`, `mind_recall`, `mind_inspect`, `mind_dream`; lexical retrieval only; max inline records `8`; max inline chars `12000`.
- Native adapter: `mind_recall` max `8`, hook recall max `4` and `6000` chars; `mind_inspect` accepts record ID and optional exact revision, then returns the full authorized record and source rows. No page/range/cursor exists.
- Missing planned operations: `mind_trace`, `mind_explore`, and `mind_manage` are not registered or advertised. They remain unavailable.
- Native extension hooks: `before_agent_start`, host event observers, and `session_shutdown`; no `session.compacting` hook is implemented by NOESIS. Automatic conversation compaction remains OMP-owned.
- Canonical state: SQLite evidence ledger, records/revisions, sources, resource snapshots, lineage, Chronicle, jobs, and native archive/restore. Current live store contains 0 ordinary records and 1 resource.

## Research source disposition

The addendum's content hashes match `SHA256SUMS.txt`. Static appraisal pins:

- Standalone `acp-kernel` commit `4d38906e004e7fd9fe4b0c06cbd8c661694f506f`, package `0.0.101`.
- `billion-context` release tag commit `6a641f378537e06e7430ec90c9abf035ffa12377`, package `0.1.216`, bundled kernel `0.0.198`.
- Inspected `billion-context` head commit `85afa7b212ce20981d66c9e6ecb1e944751cb3c4`, package `0.1.216`, bundled kernel `0.0.210`.

The bundled and standalone kernels differ. Upstream tests, benchmarks, package hooks, provider calls, and npm artifacts were not executed or independently reconstructed. The source index has no upstream code hashes for the inspected entries. The researched licenses include a visible attribution term beyond the manifest's MIT label. No code reuse or dependency addition is proposed.

## Contract mapping

| Research idea | Existing owner | R9 decision |
| --- | --- | --- |
| Aperture selection | `mind_recall` plus caller policy | Defer selection policy. Preserve existing bounded recall and add no automatic compactor. |
| Exact source inspection | `mind_inspect`, Atlas/source rows, Observatory inspector | Implement one revision-bound bounded page with explicit exact/partial/unavailable coverage. |
| Projection dependency trace | `mind_trace` | Not implemented or advertised. No new tool in R9. |
| Origami summary levels | `mind_dream`, jobs, derived views | Deferred until exact inspection proves a useful missing-detail case. No summary becomes evidence. |
| Context compaction | OMP built-in compaction | Keep one owner. Do not install billion-context or acp-kernel. |
| Management/capability inspection | `mind_manage` | Not implemented or advertised. |

## Invariants

- Every page binds to an authorized record/source revision and rechecks scope on every request.
- Exact, partial, summary-only, and unavailable results are distinct.
- Byte/character/item limits are hard. UTF-8 boundaries and half-open ranges are explicit.
- A cursor binds to revision, selection, and authorization. No hidden record identity appears on failure.
- Source dependencies, contradictions, corrections, deletion, archive/restore, and evidence-family independence remain unchanged.
- Prepared, host-accepted, confirmed-included, and applied delivery remain separate. A receipt never claims model use.
- `mind_dream` remains a core bounded tool. Deterministic Snooze remains zero-model-call behavior.

## Budget and adoption rule

R9 planning and exact-inspection implementation use 0 model calls, 0 model tokens, 0 embeddings, 0 retries, 0 child jobs, and 0 monetary spend. Per-command local wall budget is 300 seconds. No paid or external provider evaluation is authorized.

Adopt the slice only if exact returned pages match retained source bytes/revisions, unauthorized pages are denied without disclosure, continuation is revision-bound, and existing archive/restore and release gates pass. Reject or defer if current source storage cannot support honest ranges, if coverage cannot be proven, or if the slice changes compaction ownership. Origami remains deferred after either outcome.

## Recovery and authorization boundary

No migration is planned. Rollback is published v1.4.0 and its live backup. This record authorizes planning only. Implementation requires the exact follow-on prompt below or an explicit release-range authorization.

## Follow-on implementation prompt

> Implement R-0009 Aperture exact inspection from `planning/releases/R-0009-aperture-inspection/PLAN.md`. Start with R-0009-T001 and proceed through the dependency-ordered backlog. Extend existing `mind_inspect` and Observatory inspection only; do not add `mind_trace`, `mind_explore`, `mind_manage`, Origami summaries, a provider proxy, or a new storage backend. Preserve OMP as the sole automatic conversation-compaction owner, NOESIS SQLite evidence authority, scope and source-family invariants, bounded budgets, and native archive/restore. Run focused tests and the existing release gate after each slice. Do not publish or install without the authorization already applicable to R9.
