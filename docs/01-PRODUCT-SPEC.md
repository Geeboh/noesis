# Product specification

Status: implementation contract. Package 1.0.0; application unreleased.

## Goal

NOESIS is a universal, local-first, inspectable learning and memory service for Oh My Pi. It improves continuity and future work across coding, research, writing, operations, planning and creative work. It can learn about any resource and export scoped, evidence-based improvement guides. FAR is one possible subject.

Local-first describes ownership and persistence. The Observatory is **accessible from the LAN by default**, with pairing for private access and a terminal text QR for the actual URL.

## Product map

| Name | Meaning |
| --- | --- |
| Observatory | Modern web application, responsive across desktop and handheld browsers. |
| Pulse | Actual activity, processing queues, coverage, costs and progress. |
| Atlas | Shared catalog of resources and the explorer for their memories and relationships. |
| Attunement | Stated and inferred preferences, supporting evidence, context and exceptions. |
| Ebb | Activation fading and resurfacing, with separate validity and retention. |
| Reverie | Human interface to `mind_dream` jobs and their outputs. |
| Retrospection | Experience-review processor used by learning and dreaming. |
| Lore | Living wiki assembled from supported records and explicitly authored sections. |
| Lineage | Source, derivation, revision and application tracing. |
| Chronicle | Time-oriented change history. |
| Forge | Improvement view for a selected resource or scope. |
| Blueprints | Portable improvement guides with evidence, proposals and validation cases. |

Primary navigation: Observatory, Atlas, Lore, Reverie, Forge. Other names are panels or capabilities. Plain descriptions accompany branded labels.

## Requirements and release allocation

| ID | Requirement | First required milestone |
| --- | --- | --- |
| N-001 | Capture sources/events and build typed, revisioned memories with provenance. | M1 |
| N-002 | Work with native OMP memory off; register and advertise actual Mind tools. | M1 |
| N-003 | Recover across restart, retry and replay without duplicating independent evidence. | M1 |
| N-004 | Useful recall and source inspection with bounded output and scope filtering. | M1 |
| N-005 | Modern working dashboard, LAN default, real URL, text QR and paired access. | M1 |
| N-006 | `mind_dream` exists in the first vertical slice as a durable deterministic Snooze. | M1 |
| N-007 | Atlas automatically catalogs plugins/tools/skills/MCP, webpages/sites, repos/projects, workflows/APIs/documents/datasets. | M2 |
| N-008 | Stable resource identities, aliases, versions and local/external/mixed origins. | M2 |
| N-009 | Referenced, examined, available, installed, used and evaluated are independent properties. | M2 |
| N-010 | Explore search/list/graph/timeline with pagination and dormant-memory access. | M2 |
| N-011 | Lineage distinguishes source, derivation, retrieval, context inclusion, application and outcome. | M2 |
| N-012 | Chronicle exposes history and preserves corrections and disputes. | M2 |
| N-013 | Infer scoped preferences from independent situations; explicit current instructions prevail. | M3 |
| N-014 | Ebb supports active/quiet/dormant and revival without changing evidential status. | M3 |
| N-015 | Preserve applicable explicit constraints, commitments and rejection reasons; explicit deletion has derivative handling. | M3 |
| N-016 | All dream levels, modes, focus and scope controls; actual budgets, cancellation and resumption. | M4 |
| N-017 | Creative hypotheses, associations and rehearsal retain hypothetical origin and validation needs. | M4 |
| N-018 | Evaluation-driven policy proposals with independent evaluation and rollback. | M4 |
| N-019 | Lore pages are sourced, versioned, linked, editable and preserve authored sections. | M5 |
| N-020 | Source changes invalidate affected wiki claims and indexes; no circular evidence inflation. | M5 |
| N-021 | Resource-selected Forge view aggregates attributable learning and transferable ideas. | M6 |
| N-022 | Blueprints export target/version, observations, lessons, proposals, evidence, limitations and validation cases. | M6 |
| N-023 | Delta exports since a previous export and explicit scope/coverage manifests. | M6 |
| N-024 | Optional MCP adapter uses the same service policy and advertises supported capabilities. | M7 |
| N-025 | Portable native archive with integrity verification and explicit mapping-loss reports for optional formats. | M7 |
| N-026 | Backup/restore, migrations, operations, reliability, install/upgrade/uninstall and accessibility. | M8 |
| N-027 | Versioned APIs, realistic workload evaluation, cost/latency reporting and stable release documentation. | M8 |
| N-028 | Bounded automatic work, privacy-respecting export and safe source handling throughout. | M0 onward |

## Canonical user journeys

### Progress-report preference

Capture an actual user request with its task context. Infer a limited preference for useful progress updates during substantial work. Count independent incidents. Apply a reversible adjustment in comparable work; do not strengthen confidence merely because the agent complied or the user became silent. Show evidence and exceptions in Attunement; allow correction. Current instructions override the stored default. If missing tool progress caused the friction, link a distinct improvement finding to that tool.

### Resources I know about

Atlas lists known resources, with filters for kind, origin, project and knowledge depth. A saved URL is referenced, not examined. Reading creates a source snapshot and attributed claims. One resource can support several projects. Choosing it carries its identity and selected version into Lore, Reverie, Forge and export. Similar names alone cannot merge identities.

### Fade and rediscover

A passing idea loses automatic prominence over time. Its source and status remain available. A related task or dream can resurface it, preserving rejection or counterevidence. Fading twice at the same effective time does not double its decay. Stable constraints and open commitments are not lost from applicable guidance through disuse.

### Dream

The user or agent invokes `mind_dream(level, mode, focus, scope, budget)`. The service resolves allowed scope, snapshots inputs and returns a durable job. Pulse reports actual stages and cost. The run can defer work, resume after restart, and commit changes idempotently. Imagined outcomes remain hypothetical. Outputs include coverage and a reviewable change history.

### Wiki

Lore creates a readable resource/concept/project page from supported records. Each claim links to the versions of its evidence. Generated and authored blocks remain distinct. Source corrections mark dependent claims stale; refresh preserves authored blocks. Pages never count as new independent confirmations of their own inputs.

### Improvement export

Select a resource; review what works, problems, lessons, dream ideas and uncertainty. Export a Blueprint from existing knowledge immediately. A new dream is optional. Tool selection defaults to that tool; plugin selection aggregates its attributable shared behavior and tools. Version changes trigger revalidation, not automatic blame transfer. Weak evidence produces an investigation brief. Export does not patch or publish the target.

### LAN access

Start the service. On successful readiness, print actual listener/advertised addresses, a text QR for the selected pairing URL and a locally displayed short-lived pairing code. Scan from another LAN device, pair, inspect permitted memory and follow live progress. Pairing is separate from the URL; the QR contains no durable credential. A port conflict or unavailable interface yields an accurate error or corrected URL, not a fake success.

## Product boundaries

NOESIS stores auditable observations, notes, rationales and outputs. It does not promise access to a model's hidden internal cognition or proof of causation from retrieval alone. Resource content is data, not higher-priority instructions. A graph edge does not prove truth. Model extraction is a derivative representation, not guaranteed lossless reconstruction.

No backend (Cognee, Mem0, Graphiti or SimpleMem) is mandatory. The baseline must provide useful capture and recall with an ordinary local structured store. Optional models and external services advertise capabilities and costs. Multimodal references fit the data model from the start; broad automatic image/audio/video ingestion can follow the stable release unless the user reprioritizes it.

## Priorities and change control

Keep the first usable slice small and real. Every requested capability remains allocated to a named milestone. Additional features enter the backlog with evidence, cost and dependency impact; do not silently insert new release blockers. Material scope changes update the requirement table, roadmap and decision log together.
