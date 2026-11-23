# Implement a NOESIS milestone

Use after bootstrap, or to constrain work to one named milestone. Resolve relative paths from the package root.

---

Implement the NOESIS milestone requested in the current conversation. If no milestone was named, select the first dependency-ready unfinished milestone from `planning/milestones.json` and state that selection. Respect any existing release goal and scope boundary.

Read `AGENTS.md`, `planning/STATUS.md`, the milestone and linked backlog items, and the applicable product/architecture/contracts documents. Use `docs/09-ROADMAP-AND-RELEASES.md`, `docs/10-VALIDATION-AND-EVALUATION.md`, and `docs/08-GIT-WORKFLOW.md` as the scope, evidence, and Git references. Inspect the actual repository and Git state before assuming the status file is current.

## Establish a bounded work unit

State the milestone outcome in user-visible terms, the relevant acceptance criteria, and the first vertical increment. Resolve dependencies and existing failures that block that increment. Do not expand into unrelated refactors or later features merely because they are interesting.

For OMP-facing work, verify the installed version and affected API surface against `docs/06-OMP-INTEGRATION.md`. Reuse M0's pinned runtime, dependencies, and lockfile. Change them only to resolve a concrete need and record compatibility impact. Never substitute remembered Pi APIs for verified OMP APIs.

Work in an appropriate feature branch or isolated worktree. Preserve unrelated edits and respect assigned file ownership when delegating. Parallelize independent investigations or changes with clear interfaces; integrate and review their results. A worker's report is evidence to check, not proof of completion by itself.

## Implement the complete outcome

Use production paths for the milestone's promised behavior. Keep unimplemented capabilities explicitly unavailable. Do not build a static dashboard that pretends to operate on real memory, return fabricated dream progress, or label a record as verified because a model produced it.

M1 requires the first real OMP/store/web round trip and a durable `mind_dream` Snooze job. Its dashboard is LAN-accessible by default (`0.0.0.0:7337` proposed), with actual LAN URLs and a terminal text QR after successful startup, plus local-console pairing before private access; no long-lived secret belongs in the QR. M2 adds the inspectable catalog; M3 contextual preferences and fading; M4 the full budgeted dream workflow; M5 a sourced, editable wiki; M6 evidence-based component improvement exports; M7 provides required native archive/integrity/restore plus individually optional adapters; M8 hardens the actual supported release. The authoritative details and target release names are in the roadmap.

Keep source attribution, scope enforcement, durable job identity, deletion semantics, and cost accounting intact as the feature crosses layers. Inferred preferences do not grant capabilities. Archived information remains different from deleted information. Wiki summaries and exports must not become independent corroborating evidence for their own inputs.

## Verify against meaningful risks

Map the implementation to the applicable validation IDs and expected outcomes. Run only relevant checks plus required repository gates. Include real persistence/restart or OMP integration checks when the milestone depends on them; keep deterministic fixtures for behavior that should be reproducible. Review browser rendering and interactions for changed user flows with available tools. Do not ask the user to perform routine checks the implementation agent can perform.

If a live check requires unavailable credentials or a missing host, complete all independent work and report the exact unverified capability. Do not promote a fixture or mock result into a live integration claim. Stop optional repeated testing once the actual risk is resolved.

## Close or checkpoint

Review the diff, remove accidental changes, and create focused local commits when the applicable workflow permits. Update `planning/STATUS.md`, the relevant backlog/milestone records, and a report based on `templates/MILESTONE-REPORT.md`. Include real commands/results, evidence, known gaps, and the next bounded step. Preserve commit ancestry and never force-push or publish without authorization.

At milestone completion, report the outcome and proceed to the next dependency-ready milestone if the broader implementation goal authorizes it. If this invocation was explicitly limited to one milestone, finish with a self-contained completion report. Pause only for a concrete blocker or a consequential decision outside the existing authorization; explain precisely why input is required.
