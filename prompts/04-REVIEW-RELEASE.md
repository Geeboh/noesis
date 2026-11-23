# Review a NOESIS release

Use when a milestone release or v1.0 candidate is ready. This reviews and prepares a release; it does not authorize public publication. Resolve relative paths from the package root.

---

Review the requested NOESIS release against the actual implementation and its documented goals. If no release was named, determine the next candidate from `planning/milestones.json` and `docs/09-ROADMAP-AND-RELEASES.md`. Distinguish the bootstrap package version from the application version.

Read `AGENTS.md`, `planning/STATUS.md`, the applicable milestone reports, `docs/08-GIT-WORKFLOW.md`, `docs/10-VALIDATION-AND-EVALUATION.md`, and `docs/11-OPERATIONS-AND-BUDGETS.md`. Inspect the Git state, candidate diff, runtime/dependency pins, lockfile, migrations, real start/build/test commands, and release artifacts. Check the implemented compatibility surface against `docs/06-OMP-INTEGRATION.md`.

## Review behavior and evidence

Evaluate the applicable release goals, rather than demanding every future feature for an early milestone. For v1.0, verify the required supported capabilities, including M7 native archive, integrity verification, and faithful restore. Explicitly document exclusions of individual optional MCP, external-format, or backend adapters; do not waive all of M7.

Review concrete risks:

- Durable memory and evidence across restart, duplicate replay, and concurrent clients.
- OMP advertisement/capture/recall, clear/compaction/resume, and claimed subagent coverage.
- `mind_dream` levels, separate mode/scope, caps, cancellation, resumability, no-change results, and truthful cost/progress reporting.
- Inferred preference context, contrary evidence, and protection from self-reinforcement.
- Fading versus validity and deletion, including derived artifacts and indexes.
- Explorer permissions, citations, uncertainty, and real data rather than simulated state.
- Lore revision/source propagation, preserved manual edits, and non-circular evidence.
- Component identity/version, evidence sufficiency, export scope, and absence of automatic target-code modification.
- Native archive export, integrity verification on import, faithful restore, provenance/scope preservation, and explicit disposition of optional adapters.
- Fresh install/start instructions, migrations, backup/restore, operational observability, and applicable web usability/accessibility.
- Default LAN binding, actual address discovery, text QR emitted after listening, pairing before private access, and no long-lived secret encoded in the QR. Distinguish a loopback smoke check from demonstrated LAN access; report unavailable second-device/network verification honestly.

Use the validation matrix and executed evidence. A test name or checklist entry is not proof. Note whether a result came from a unit fixture, an integrated local service, a live OMP session, or a browser inspection. Report unexecuted and unavailable checks as such.

## Resolve findings proportionately

Classify findings by user impact and supported release scope. Fix concrete correctness, data-loss, scope, security, or misleading-claim defects within the authorized implementation work. Add a focused regression check when it protects the behavior; do not create tests that merely repeat the implementation or expand into unrelated refactors.

Rerun checks affected by a fix and the required release gates. Avoid rerunning expensive inference or the full suite repeatedly without a reason. If an external credential or unsupported host blocks verification, complete the available review and state exactly what remains unproven. Do not require a ritual user-testing session for every milestone.

Review Git history and the final diff for accidental secrets, private memories, runtime databases, generated noise, unrelated changes, and inconsistencies between docs and behavior. Preserve the user's commits and working changes. Do not suppress failed checks or invent evidence to make the release appear complete.

## Prepare the reviewable result

Update milestone/status/backlog records and write release notes using `templates/RELEASE-NOTES.md`. Include delivered behavior, applicable compatibility, validation evidence, migrations, known limitations, deferred optional work, and recovery/rollback instructions. Provide a clear ready/not-ready decision with specific remaining blockers.

Prepare local build artifacts and checksums if the release workflow requires them. Create local commits or tags only as permitted by the existing Git/release workflow and current authorization. Do not publish a package, create a public release, deploy a service, push a branch/tag, or send external messages unless that exact class of action is already authorized. If publication needs final approval, first make the artifact and release notes concrete and reviewable, then state the exact action awaiting approval.
