# Bootstrap NOESIS in Oh My Pi

Paste the prompt below into OMP from the intended project directory. This authorizes implementation work in that workspace; the bootstrap package itself is a specification, not an already built application. Resolve relative paths from the package root.

---

Build NOESIS from this bootstrap package. Carry the work through its bounded milestones, using the repository as the durable plan and progress record. Do not stop after describing a plan or creating a scaffold. Begin with M0, then continue to the next dependency-ready milestone within the authorized scope until the selected release goal is complete or a concrete blocker prevents further useful work. Unless the user already chose a narrower target, aim for the required v1.0 scope through M8. M7 includes required native archive, integrity verification, and restore; MCP and other costly external adapters are optional individually.

## Read and establish the real starting point

Read `AGENTS.md`, `START-HERE.md`, `README.md`, `planning/STATUS.md`, `planning/milestones.json`, and `planning/backlog.json`. Read the product, architecture, contracts, integration, roadmap, validation, and operations documents under `docs/`. Follow links for the milestone you are implementing. Keep the existing accepted requirements; do not reinterpret NOESIS as a coding-only or FAR-specific project.

Before editing, inspect the working directory, applicable instructions, Git status, existing application files, and available runtimes. Run the package's read-only checks:

```sh
python3 scripts/doctor.py
python3 scripts/validate_bootstrap.py
```

These check the bootstrap/environment, not whether the NOESIS application works. Record their actual results. Do not invent application test scripts or pass results.

Use [Git workflow](../docs/08-GIT-WORKFLOW.md). Preserve unrelated changes. In a new standalone directory outside an existing Git worktree, the provided `scripts/init_repo.py` can initialize it after checking identity and directory safety; its documented command is `python3 scripts/init_repo.py --commit --branch feat/m0-foundation`. Read its behavior first. If a repository already exists, use its normal feature-branch/worktree workflow instead. Do not force initialization, rewrite history, push, publish, or modify global Git identity/configuration.

## M0: verify and pin before building

Verify installed OMP with its actual executable, `omp --version`, and `omp --help`. Check the current official exported extension, event, model, and memory interfaces against `docs/06-OMP-INTEGRATION.md`. Record installed versus inspected upstream versions and capability differences. Keep the user's provider credentials and global settings intact.

Resolve the implementation runtime, package manager, compatible OMP development dependencies, schema library integration, database choice, and web dependencies. Pin selected direct versions, generate a lockfile, and record reproducible install/build/test commands that actually exist. Do not copy monorepo `catalog:` dependencies, hardcode model IDs, or install a second conflicting host runtime. If a decision is underspecified, make a reasonable reversible choice and record why; ask only for missing access, authority, or a consequential preference that cannot be inferred.

Use an explicit development extension entry and scoped configuration overlay. NOESIS can operate with OMP native memory off. Avoid competing learning pipelines, and do not silently rewrite an existing memory setup. Implement a minimal compatibility probe before committing to exact integration APIs.

## Deliver the first useful slice, then extend it

M1 must include durable memory and evidence, a real OMP write/recall path, a real LAN-accessible web dashboard, and agent-callable `mind_dream` with a durable **Snooze** job. A polished mock dashboard without that round trip does not complete M1. Implement the proposed default listener at `0.0.0.0:7337`, print actual usable LAN URLs and a terminal text QR only after listening, and require the local-console pairing step before private access. The QR must not contain a long-lived secret. These are NOESIS behaviors to build, not existing OMP launch flags.

Continue through the roadmap: M2 Atlas/component catalog; M3 Attunement/Ebb; M4 full Reverie; M5 Lore; M6 Forge/Blueprints through component dossiers and improvement exports; M7 native portability and selected optional adapters; M8 v1.0 hardening. Use the authoritative milestone scopes, dependencies, target releases, and acceptance criteria in `planning/milestones.json` and `docs/09-ROADMAP-AND-RELEASES.md`. The bootstrap package's version is not the application's version. Record optional exclusions explicitly rather than pretending they were implemented.

Preserve these product invariants:

- Universal knowledge and work, with scoped access and source evidence.
- Automatic, contextual preference learning without confidence feedback loops.
- Reversible fading distinct from confidence, validity, retention, and deletion.
- Snooze/Nap/Dream/Deep Sleep as effort levels; mode and scope remain independent.
- Human and agent exploration, including provenance and uncertainty.
- A modern real dashboard and a sourced, editable Lore wiki with revision/dependency propagation.
- A catalog distinguishing mentioned, available, installed, and actually used components; reviewable improvement exports, without automatic target-code modification.
- Explicit budgets, durable resumable jobs, and required native portability with faithful archive integrity and restore; optional transports/backends do not replace the native OMP adapter.

## Work autonomously and leave useful evidence

Give concise updates when beginning a milestone, after a meaningful finding, before a lengthy operation, and on completion or a blocker. State what is working and what the next check will resolve. Do not require the user to manually test every milestone or repeatedly approve ordinary implementation choices.

Keep each work unit bounded. Select a named milestone and a small set of linked backlog items; implement coherent vertical increments, run the checks that address their concrete risks, and fix failures. Use real service/database/OMP integration evidence where required; mocks and bootstrap validation do not substitute for those outcomes. Validate usable UI states and accessibility for the affected flows with available tooling. Report any unavailable validation accurately.

Use focused local commits after reviewing the diff and validating the change, following the repository's Git instructions. Do not include private memory, credentials, runtime databases, or unrelated files. Do not create ceremonial approvals or unsubstantiated trusted-worker gates. Follow real host permissions and existing policy; investigate whether existing authorization covers the action before interrupting the user.

Update `planning/STATUS.md`, backlog/milestone states, and a milestone report using `templates/MILESTONE-REPORT.md` with actual commands, outcomes, evidence locations, limitations, and next work. Record material decisions with `templates/DECISION.md`. If context, time, or resources require a handoff, leave an accurate resumable checkpoint and continue from it on the next turn; do not mark incomplete work done.

When the selected release is complete, prepare reviewable notes using `templates/RELEASE-NOTES.md` and the release-review prompt. Do not publish packages, deploy publicly, push branches/tags, or communicate externally unless that action is already authorized.
