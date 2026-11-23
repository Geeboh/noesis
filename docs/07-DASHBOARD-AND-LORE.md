# Observatory, Atlas and Lore — UX implementation specification

## Design intent

A modern web interface that makes the Mind understandable and correctable. Desktop offers a productive multi-pane layout; a handheld browser opened from the terminal QR offers a complete responsive route to the same records. Use clear typography, restrained motion, dark and light themes, keyboard navigation, visible focus and meaningful empty/error states. Do not replace usable lists with a decorative whole-corpus graph.

Every screen uses the service's authorization, identifiers, revisions and pagination. UI state does not create a second memory store. Reuse one resource page across Atlas, Lore and Forge.

## Navigation and shell

| Area | Default content | Key actions |
| --- | --- | --- |
| Observatory | Since your last visit, active jobs, recently changed knowledge, unresolved processing failures. | Open item, follow job, inspect actual usage. |
| Atlas | Resources I know about; all-resource search and scoped memory results. | Filter, inspect, explore relationships, open Lore, improve. |
| Lore | Linked knowledge pages and project guides. | Read evidence, edit, inspect change, refresh affected sections. |
| Reverie | Active/past dreams, scope, budgets and outputs. | Start, follow, cancel, resume, inspect proposed/applied changes. |
| Forge | Resource-selected strengths, problems, lessons, ideas and exports. | Dream about this, export Blueprint, compare prior export. |

Pulse, Chronicle, Lineage, Attunement and Ebb are panels or views accessible from the relevant area. The command palette searches actions and records. Provide a plain label below branded navigation names.

Desktop: filter/navigation column, main result/content area, optional inspector. Handheld: stacked pages with a back path and persistent selected scope. Keep inspectors addressable through stable deep links. Server-rendered or client-rendered implementation is an M0 choice; behavior and accessibility are binding.

## Resource catalog

Heading: **Resources I know about**. Filters: kind; local/external/mixed origin; project; selected version; referenced/examined/used/evaluated facets; unresolved problems; new learning since export; dormant inclusion. External resources is a filter, not a second registry.

Supported kinds: plugins, tools, skills, MCP servers, web pages, websites, documentation collections, repositories, projects, workflows, libraries, APIs/services, documents, datasets and extensible topic/domain types. Resource types and relations can overlap.

A resource row shows name/type, concise description, latest relevant version/snapshot, knowledge-depth badges, latest meaningful activity and actionable findings. Do not manufacture an overall knowledge percentage. Empty counts distinguish zero from unknown/uncomputed.

Selected resource page sections: overview, actual experience, what works, problems, lessons, ideas, open questions, history, related resources, Lore and exports. Plugin selection includes attributable child-tool/shared behavior; a tool selection does not silently expand to every plugin. Similar titles do not merge resources. An old issue remains tied to the version actually observed.

## Explorer

Default to searchable results. Offer list/table, focused graph and timeline views over the same query. The graph opens around a selected entity with bounded depth and node count; expand on demand. Show edge meanings: derived from, used by, contradicts, supersedes, applies to, hypothetical association. Do not render all links as evidential support.

Read-only exploration does not confirm a memory or trigger decay/reinforcement. Display the selected snapshot/cursor for stable pagination. Explicit deep search can include dormant and disputed records; automatic task recall defaults to applicable guidance. Show coverage and truncation rather than implying exhaustive review.

## Memory inspector and Lineage

Show the statement, record type, source/origin, applicability, temporal validity, activation state, evidence status, current revision and revision history. Explain score components in plain language; avoid pseudo-precise confidence percentages unless calibrated.

Lineage distinguishes original evidence, transformed summaries, copied/imported descendants, dream origin, independent outcomes and actual validation. Retrieval traces show retrieved/included/applied separately. Every unsupported inference is labeled.

Actions: correct, annotate, narrow scope, pin applicable guidance, revive, archive, request explicit deletion. Changes create revisions and meaningful history. Destructive deletion states what controlled derivatives will be affected; historical exported copies outside the service cannot be recalled. Reversible changes support undo by compensating revision.

## Attunement

Show explicit and inferred preferences separately. Each preference includes proposed behavior, task conditions, supporting independent episodes, counterevidence, alternative explanation and last relevant use. Provide simple correction controls: this is right; only for this context; not a preference; stop using this.

For progress updates, retain task duration, prior update availability and whether the user was correcting missing communication. Agent compliance and user silence are not new confirmations. An inferred preference cannot authorize spending or external actions. Current instructions override its application.

## Ebb

Show active, quiet and dormant collections, explanations and revival controls. Keep evidence/confidence, validity and retention visible separately. An item can be dormant and supported, or active and disputed.

Explain why a record faded with actual policy version, effective elapsed time or relevant opportunity count and exemptions. Preview planned bulk changes without requiring approval for every ordinary automatic update. Pinning preserves applicable recall, not global always-on injection. Explicit forgetting is a distinct action with a coverage report.

## Reverie

Creation form: level (Snooze/Nap/Dream/Deep Sleep), mode, optional focus, scope and budget. A focused run may display Lucid as a descriptive label. Prefill from a selected resource. Show supported options; disable unavailable capabilities with a reason.

A job page shows real stages, progress units with known denominators, actual resource use, remaining/deferred work, evidence snapshot, outputs and applied changes. Indeterminate operations show a heartbeat, not fabricated percent progress. Event delivery reconnects using a durable cursor; a lost browser does not cancel the job.

Separate tabs for observations/lessons, speculative ideas, experiments, wiki revisions, and changed memory state. A completion report distinguishes completed, partial, budget-exhausted, cancelled and failed. Repeated retries do not duplicate effects.

## Lore

Page types include concept, resource, project, procedure, decision and investigation. Every substantive claim has source-record/version dependencies. Store authored and generated blocks separately. A stylistic page edit changes presentation; an underlying correction changes the memory record. Make the choice explicit when ambiguity matters.

Display last generated and last verified separately, including claim-level stale/conflict badges. Source corrections/deletions mark affected sections for reconciliation and rebuild indexes. A refresh updates only dependent generated blocks and preserves authored text. A page can contain established knowledge and a clearly separated open-hypotheses section.

Backlinks connect concepts, resources, decisions, procedures and projects. Search can retrieve the page for orientation but assessments resolve independent evidence underneath. A page summarizing three episodes does not become a fourth confirmation.

## Forge and Blueprints

The selected resource carries scope/version into improvement and export. Summaries show supported strengths and failure patterns, uncertain attribution, transferred lessons and dream proposals. Drafting an export from stored knowledge is available without a new model-heavy dream.

Default export view: audience/purpose, target and selected version, included scope, findings, proposals, evidence, acceptance/reproduction cases, limitations and omissions. Permit a delta since the prior export with a stable cutoff. A project can yield a handover/improvement plan; a web source can yield a critical appraisal/investigation brief. Blueprint remains the improvement-oriented portable contract.

Preview the exact export; make Markdown available individually, with optional JSON and bundled supporting artifacts. Exclude unrelated user preferences and credentials. Only include source excerpts needed for the selected purpose and preserve citations. Export does not alter a remote repository or notify a maintainer.

## LAN startup and pairing

M1 implements the contract in [operations](11-OPERATIONS-AND-BUDGETS.md): LAN binding by default, accurate addresses after readiness, terminal text QR, one-use pairing code, authenticated private data, origin validation and same-origin streams. QR and direct address must reach the same route. The QR is a deterministic machine-readable encoding, not image-generated artwork.

The pairing page contains no private memory. Explain code expiry, invalid attempt and revocation. Once paired, the user returns to the intended route. Theme and responsive behavior apply to pairing too. An operator can choose a different advertised interface without changing memory scope.

## Acceptance paths

1. Open from the displayed address or QR; pair; inspect the same data as the local browser.
2. Search resources; select a webpage/project/plugin; follow its lineage and return without losing filters.
3. Correct a preference; verify the next applicable retrieval sees the revision.
4. Find a dormant record, revive it and preserve its evidence/status.
5. Start a dream, reconnect the browser, cancel/resume where supported and inspect actual effects.
6. Edit an authored Lore block; regenerate supported sections and verify the authored block survives.
7. Select a resource and export a scoped Blueprint with explicit evidence/uncertainty.
8. Complete the key paths by keyboard and at handheld width; graph alternatives remain usable.

Use synthetic fixtures in screenshots and tests. A visual prototype alone cannot satisfy any path requiring real service behavior.
