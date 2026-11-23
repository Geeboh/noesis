# Requirements, work items, and validation traceability

This map connects every requirement in `docs/01-PRODUCT-SPEC.md` to concrete work in `planning/backlog.json` and behavioral scenarios in `docs/10-VALIDATION-AND-EVALUATION.md`. It is a coverage plan, not a claim that a feature or test already works. **All tasks are planned; the product is unreleased.**

Requirement IDs (`N-…`), task IDs (`M…-…`), validation scenarios (`V-…`), and named validation targets have different roles. A requirement defines promised behavior; a task owns implementation and acceptance; a scenario defines a meaningful observation; a target groups executable checks. M0-05 binds targets and task-specific scenario fixtures to real commands after the environment is verified.

## Requirement-to-task map

The listed tasks are the principal implementation or acceptance owners. Later hardening complements the first required milestone; it does not postpone that milestone's promised behavior. All requirements are part of the native v1 scope except the explicitly optional adapter in N-024 and external conversions/backends described under N-025.

| Requirement | Promised behavior | Concrete task IDs | Behavioral scenarios / task-specific assertions |
| --- | --- | --- | --- |
| N-001 | Captured events and typed, revisioned memories retain provenance. | M1-01, M1-02, M2-04 | V-001, V-002, V-004; inspect revision-to-source links. |
| N-002 | Native OMP memory can be off; actual Mind tools are registered and advertised. | M0-01, M1-02, M1-06 | V-004 with native OMP memory disabled, actual tool advertisement, and fresh-session recall. |
| N-003 | Restart, retry, and replay do not multiply independent evidence. | M1-01, M1-04, M1-06 | V-001, V-005; V-014 extends the same invariant to full dream commits. |
| N-004 | Useful bounded recall and source inspection respect scope. | M1-03, M1-06, M2-05 | V-003; V-025 checks measured bounds under later load. |
| N-005 | A working modern LAN dashboard prints a real URL and text QR and pairs clients before private access. | M0-04, M1-05, M1-06, M8-04 | V-006, V-024, V-026; actual listener readiness, interface choice, QR decoding, and private UI/API/stream access. |
| N-006 | Durable deterministic Snooze exposes `mind_dream` in the first working slice. | M1-04, M1-05, M1-06 | V-005; bounded changes, recovery, and honest capability reporting. |
| N-007 | Atlas automatically catalogs all specified local and external resource kinds. | M2-01, M2-02, M2-06 | V-007 with examples of plugins/tools/skills/MCP, webpages/sites, repos/projects, workflows/APIs/documents/datasets. |
| N-008 | Resources have stable identities, aliases, versions, and local/external/mixed origins. | M2-01, M2-03, M2-06 | V-007; V-022 later checks identity preservation through native archives. |
| N-009 | Referenced, examined, available, installed, used, and evaluated are independent properties. | M2-01, M2-02, M2-05 | V-007, V-008, V-021; include independent property combinations, not a single maturity ladder. |
| N-010 | Search/list/graph/timeline exploration is bounded, paginated, and includes dormant access. | M2-05, M3-03, M3-05, M8-04 | V-003, V-011, V-012, V-024, V-025; non-graph access and exploration without confirmation. |
| N-011 | Lineage distinguishes source, derivation, retrieval, context inclusion, application, and outcome. | M1-03, M2-04, M2-06 | V-008, V-019; absent application evidence remains unknown. |
| N-012 | Chronicle preserves history, corrections, rejection reasons, and disputes. | M2-04, M2-05, M3-02 | V-007 source-version history and V-010 correction-history fixtures; inspect unresolved disputes rather than overwriting them. |
| N-013 | Preferences arise from independent situations and remain subordinate to current instructions. | M3-01, M3-02, M3-05, M3-06 | V-009, V-010; repeated copies and silence do not strengthen confidence. |
| N-014 | Ebb fades and revives activation without changing evidential status. | M3-01, M3-03, M3-05, M3-06 | V-011, V-012; deterministic effective time and preserved counterevidence. |
| N-015 | Applicable explicit constraints and commitments remain available; deletion reconciles derivatives. | M3-02, M3-03, M3-04, M5-03 | V-010, V-012, V-013; retain rejection reasons and report deletion coverage limits. |
| N-016 | Dream levels, concrete modes, focus, and scope are independent; budgets, cancellation, and resumption are real. | M4-01, M4-02, M4-06 | V-014, V-015; child work/retries share the limit; test mixed-preset expansion as well as individual modes. |
| N-017 | Associations, creative hypotheses, and rehearsal preserve hypothetical origin and validation needs. | M4-03, M4-04, M4-05, M4-06 | V-016, V-019; distinguish actual authorized experiments from imagined outcomes. |
| N-018 | Learning/retrieval policy proposals require independent evaluation and support rollback. | M4-03, M4-06 | V-017; development/held-out separation, explicit promotion criteria, versioned accepted policy, and working rollback. |
| N-019 | Lore pages are sourced, versioned, linked, editable, and preserve authored sections. | M5-01, M5-02, M5-04, M5-06 | V-018, V-024; inspect exact section sources, diffs, and backlinks. |
| N-020 | Source changes invalidate dependent wiki claims/indexes without circular evidence inflation. | M5-02, M5-03, M5-05, M5-06 | V-013, V-018, V-019; refresh and reconstruction preserve source families and authorship. |
| N-021 | Resource-selected Forge aggregates attributable learning and transferable ideas. | M6-01, M6-02, M6-03, M6-06 | V-020, V-021; distinguish selected-tool evidence, plugin aggregation, and suggested transfer. |
| N-022 | Blueprints contain target/version, observations, lessons, proposals, evidence, limits, and validation cases. | M6-04, M6-05, M6-06 | V-019, V-020, V-021; readable and structured guides preserve provenance and hypothesis labels. |
| N-023 | Delta exports identify a prior baseline and explicit scope/coverage. | M6-04, M6-05, M6-06 | V-020 delta fixtures and V-019 support-accounting fixtures; additions/revisions/invalidation/deletion markers, incompatible baselines, and idempotent application. |
| N-024 | An optional MCP adapter advertises implemented capabilities and uses the same service policy. | M7-01, M7-02, M7-03, M7-05 | V-003, V-014, V-015 reused through MCP when selected; `mcp.parity` checks protocol/capability behavior. Optional tasks may be explicitly deferred. |
| N-025 | Required native archives verify integrity and restore data; optional formats report mapping losses. | M7-01, M7-04, M7-05, M7-06 | V-022; required native round trip without MCP/COGX/external backend, corrupt input rejection, and actual optional-format losses if used. |
| N-026 | Backup/restore, migrations, install/upgrade/uninstall, operational reliability, and accessibility work. | M8-02, M8-03, M8-04, M8-05 | V-023, V-024, V-025, V-026; uninstall has explicit data-retention/removal semantics. |
| N-027 | Versioned APIs, realistic evaluation, measured cost/latency, and stable release documentation exist. | M0-03, M0-05, M8-01, M8-03, M8-06 | V-017, V-022, V-023, V-025 plus release-reproducibility evidence; cite actual versions, workloads, denominators, and limits. |
| N-028 | Automatic work is bounded, exports respect privacy, and sources remain untrusted data. | M0-04, M0-05, M4-02, M6-05, M8-02 | V-003, V-013, V-015, V-020, V-022; source-instruction, omission, secret-handling, and authorization fixtures apply throughout. |

## Behavioral-scenario ownership

These assignments make every scenario visible to an implementation owner. A scenario can be exercised in more than one layer, but duplicated tests are not required merely because several tasks refer to it. Record what the actual fixture establishes.

| Scenario | Principal owning tasks | Named validation targets |
| --- | --- | --- |
| V-001 Restart/replay | M1-01, M1-02, M1-06 | `ledger.integrity`, `omp.capture-recall` |
| V-002 Extraction failure | M1-01, M1-03, M1-06 | `ledger.integrity`, `omp.capture-recall` |
| V-003 Scoped recall | M1-03, M2-05, M6-05; M7-03 if selected | `omp.capture-recall`, `atlas.provenance`, `blueprints.portability`, conditional `mcp.parity` |
| V-004 Real host | M0-01, M1-02, M1-06 | `environment.compatibility`, `omp.capture-recall` |
| V-005 Minimal dream | M1-04, M1-06 | `dream.resilience` |
| V-006 LAN/QR | M0-04, M1-05, M1-06 | `observatory.journeys`, `system.hardening` |
| V-007 Resource identity | M2-01, M2-02, M2-03, M2-06 | `contracts.schema`, `atlas.provenance` |
| V-008 Use tracing | M2-04, M2-06 | `atlas.provenance`, `ledger.integrity` |
| V-009 Preference | M3-01, M3-02, M3-06 | `attunement.corrections` |
| V-010 Instruction override | M3-02, M3-05, M3-06 | `attunement.corrections`, `observatory.journeys` |
| V-011 Fading invariance | M3-03, M3-06 | `ebb.lifecycle` |
| V-012 Protected guidance | M3-03, M3-05, M3-06 | `ebb.lifecycle`, `omp.capture-recall` |
| V-013 Deletion propagation | M3-04, M5-03, M8-02 | `ebb.lifecycle`, `lore.integrity`, `system.hardening` |
| V-014 Dream crash | M4-02, M4-06; M7-03 if selected | `dream.resilience`, conditional `mcp.parity` |
| V-015 Full budget | M4-02, M4-06; M7-03 if selected | `dream.resilience`, `system.hardening`, conditional `mcp.parity` |
| V-016 Hypothesis origin | M4-04, M4-05, M4-06 | `reverie.quality`, `atlas.provenance` |
| V-017 Independent evaluation | M4-03, M4-06, M8-01 | `reverie.quality`, `system.hardening` |
| V-018 Lore authorship | M5-03, M5-04, M5-06 | `lore.integrity`, `observatory.journeys` |
| V-019 No circular proof | M5-02, M5-06, M6-05, M6-06 | `lore.integrity`, `blueprints.portability` |
| V-020 Export scope | M6-01, M6-04, M6-05, M6-06 | `blueprints.portability` |
| V-021 Weak evidence | M6-02, M6-04, M6-06 | `blueprints.portability`, `reverie.quality` |
| V-022 Round trip | M7-04, M7-05, M7-06 | `blueprints.portability`, `ledger.integrity`, `system.hardening` |
| V-023 Backup/upgrade | M8-02, M8-03, M8-05 | `system.hardening`, `release.reproducibility` |
| V-024 Accessible UI | M1-05, M5-04, M8-04 | `observatory.journeys` |
| V-025 Load and interruption | M8-01, M8-02, M8-04 | `system.hardening`, `observatory.journeys` |
| V-026 Real second device | M8-04 | `observatory.journeys`, `system.hardening` |

Some scenario labels are intentionally broad. For example, V-020 needs both ordinary export-scope fixtures and the delta-baseline fixtures required by M6-04/M6-05. V-004 must include native OMP memory off and real tool advertisement, not merely an adapter mock. V-007 must cover independent resource properties as well as name/URL identity. The tasks' acceptance criteria supply these assertions; a scenario ID alone does not establish full coverage.

## Required native portability and optional adapters

M7 is a required milestone. Its `required_task_ids` are **M7-01, M7-04, M7-05, and M7-06**. These establish the native archive contract, integrity verification, clean-store restoration, validation, and release disposition. M8 depends on this required work.

Only **M7-02 and M7-03** are marked `optional: true` and `required_for_v1: false`; they implement and secure the optional MCP path. The required M7 tasks have no hard dependency on these optional tasks. Their `optional_dependencies` and `conditional_validation_targets` apply only when the adapter is selected. A costly adapter can be explicitly deferred, with its capability unavailable and its reason recorded. It cannot be reported as implemented or passing.

COGX/other external formats and external memory backends are separately selectable extensions. If selected, add a bounded implementation task and an honest mapping-loss/compatibility report. Their absence does not excuse missing native archive, integrity, or restore behavior. A native Blueprint improvement guide and a native archive serve different purposes; M6's guide export alone does not complete M7's restore requirement.

M7 closes when required tasks and selected optional work are complete, and every unselected optional item has an explicit disposition. M8 can then proceed without a hidden MCP dependency. Deferring all of M7, or changing a native portability failure into an optional-adapter waiver, violates N-025.

## Dream contract and evidence details

The effort levels are `snooze`, `nap`, `dream`, and `deep_sleep`. Concrete `job.modes` values are `consolidate`, `associate`, `imagine`, `rehearse`, and `reframe`, stored as a unique array. `mixed` is a UI/tool preset that expands to selected concrete modes. Lucid describes focus. Scope, focus, effort, and concrete modes stay separate in both task acceptance and fixtures.

Validation evidence belongs to the actual candidate. Use `templates/VALIDATION-REPORT.md` to record target/scenario IDs, exact revision, command or observed procedure, actual exit status, environment, and limits. Planned `evidence`/`evidence_required` fields are obligations; actual nonempty `completion_evidence` references are required before a task or milestone is marked `done`.

V-026 is an environmental observation, not an optional product feature. If a second LAN device is available, perform and record the real scan/pair/read/event-stream journey. If it is unavailable, record that precise limitation alongside the automated LAN/address/QR/pairing evidence. Do not claim a physical device check from loopback or mocked tests, and do not create an unrelated human QA blocker.

## Maintaining this map

Keep requirement, task, and scenario IDs stable. A material change updates the product requirement, task acceptance/dependencies, this map, and the decision record together. Do not silently narrow an acceptance criterion to make a failing candidate pass. New optional adapters get explicit scope and cost decisions; required native behavior retains its implementation owner.

This map is complete as a planning allocation. It makes no claim that bootstrap validation proves application correctness, real OMP compatibility, learning quality, or cross-device operation.
