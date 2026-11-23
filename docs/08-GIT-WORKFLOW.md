# Git workflow and integration rules

This package is **bootstrap version 1.0.0**. The NOESIS product is **unreleased**. Shipping these plans does not complete any product milestone or establish that a runtime test has passed.

## Authority and repository safety

Local repository setup, isolated implementation branches, local commits, and reviewed local integration are normal implementation work. The delivered directory contains no Git history; repository initialization is an operator step. Bootstrap tests use separate temporary repositories. Remote creation, pushes, pull requests that disclose private material, package publication, deployments, and public releases require the user's authorization for that action. An authorized local release candidate is not permission to publish it.

Never reset or force-push a shared branch, discard someone else's changes, change global Git configuration, invent a Git identity, or add a license on the user's behalf. Record an unresolved license choice in a decision record. Inspect the existing repository before changing its history or layout.

## Start safely

From the extracted package directory, run the supplied bootstrap checks:

```sh
python3 scripts/doctor.py
python3 scripts/validate_bootstrap.py
```

These check the bootstrap and report environment observations. They do not establish that an OMP extension, a web application, or a NOESIS runtime exists or works. M0 must verify the actual OMP integration contract and define the application commands and CI.

For a directory that is not inside an existing Git repository, the helper can initialize the repository and make the requested initial local commit:

```sh
python3 scripts/init_repo.py --commit --branch feat/m0-foundation
```

The helper does not push. If a real commit identity is unavailable, obtain the user's intended name and address and supply `--author-name` plus `--author-email`; these configure only the new repository. Alternatively continue without a commit. Never substitute a fabricated identity. Running `python3 scripts/init_repo.py` without `--commit` requests initialization only.

If the destination is already in a repository, inspect `git status --short --branch` and `git rev-parse --show-toplevel` first. Import through an isolated branch or worktree, compare colliding paths, and copy only intended files. Do not initialize a nested repository or overwrite existing instructions, workflows, manifests, or source files. An existing repository's explicit user-approved conventions take precedence over examples below.

## Branches and worktrees

Use one integration owner at a time. That owner controls the integration branch, coordinates shared-file changes, reviews merge evidence, and records the resulting milestone state. Other contributors work on short-lived task branches in their own worktrees. A worktree is an isolation mechanism, not permission to change unrelated files.

Suggested names are `feat/m1-ledger`, `feat/m1-observatory`, `fix/m4-dream-resume`, and `docs/m6-blueprint-guide`. Keep each branch limited to one reviewable task or a small explicitly coupled group. Start from the current accepted integration commit. Prefer branches measured in days, not an entire milestone.

When an accepted local `main` branch exists, an example is:

```sh
git worktree add -b feat/m1-ledger ../noesis-m1-ledger main
```

Adapt names to the verified repository. Do not run this example if the branch or directory already belongs to another contributor. For the first integration, review the bootstrap/foundation branch and establish the integration branch deliberately; do not assume an existing `main` is empty or replace it.

Each task claim should record its task ID, branch, worktree, owner, owned paths, shared interfaces, and expected outputs. Confirm ownership before editing another lane's files. Integration is serialized even when investigation and implementation proceed in parallel.

## Ownership of shared changes

| Area | Owner and rule |
| --- | --- |
| Dependency manifests and lockfile | One designated dependency owner; use the package manager chosen in M0. Do not regenerate competing lockfiles in parallel. |
| Core contracts, schemas, and migrations | One contract owner; agree on changes before dependent lanes implement them. Include migration and compatibility evidence when the persisted shape changes. |
| OMP hook adapter | Adapter owner; preserve the verified upstream contract and isolate changes from reusable core behavior. |
| Observatory and feature views | UI owner per bounded view; consume agreed contracts and use live application state for acceptance. |
| Planning and release records | Integration owner; update from demonstrated outputs, not branch names or optimistic reports. |
| External adapters, including optional MCP | Adapter owner; use the same core policies and evidence semantics as the native adapter. |

These are responsibilities rather than a mandate for a particular source directory. M0 records the actual paths. The small-team default is one person holding several roles, with shared-file changes still serialized.

## Commits and review

Before committing, inspect the working diff, stage specific intended paths, inspect the staged diff, and run `git diff --cached --check`. Use a concise commit subject describing the change and include the task ID when useful. A conventional prefix such as `feat:`, `fix:`, or `docs:` is optional; clear meaning is required.

Do not commit credentials, tokens, local database contents, private transcripts, copied user documents, build caches, or real tool traces used as ad hoc fixtures. Use small synthetic fixtures or explicitly authorized samples with their provenance recorded. Track the chosen lockfile and schema migrations. Keep generated runtime artifacts out of source control unless they are deliberate release artifacts.

A review should establish the concrete behavior, changed boundaries, relevant evidence, and remaining limitations. It may be performed by the integration owner or another capable agent; a mandatory human QA session is not a milestone dependency. Use the pull-request template for remote reviews when authorized, or the same structure in a local review record. Never mark a check passed unless its result was observed for the candidate being reviewed.

For code changes, run the applicable commands bound to the validation targets in M0. For a narrow reversible documentation edit, a diff review and bootstrap consistency check can be sufficient. Do not add tests that merely repeat the implementation or expand the gate after evidence already resolves the change's risk.

## Integration

The integration owner reviews a clean candidate against the current integration branch. Default to a squash merge for a completed task, keeping one coherent integration commit and the task's review/evidence record. Preserve a multi-commit series with a merge commit when its history is materially useful; record that choice. Neither option permits rewriting shared history.

If the integration branch moved, reconcile the branch in its own worktree and rerun only the checks affected by the change or required by the existing milestone gate. Do not resolve schema or lockfile conflicts by selecting one side blindly. Ask the designated owner to reconcile the actual intent.

Rebasing a contributor's private, unshared branch is optional. Do not rebase a branch others depend on, force-push to repair divergence, or use destructive cleanup as a merge strategy. An unexpected dirty worktree is a reason to inspect and preserve work.

After integration, update the task state and evidence references. Remove a task worktree only after its owner confirms it is clean and its intended work is preserved. Normal worktree removal should succeed without a force flag. Delete obsolete local branches only after confirming the accepted commits and review record are retained.

## Release preparation

Product versions start at `v0.1.0-alpha.1` after M1. M0 has no product release. The bootstrap's `1.0.0` label must not be reused as the implemented product's current version.

Prepare releases from a known accepted commit with a clean tree, the chosen dependency lockfile, migration notes, measured validation evidence, and explicit limitations. Use `templates/RELEASE-NOTES.md` and the roadmap's existing exit criteria. Local tags and local packages are reviewable artifacts; do not push tags or publish packages automatically.

Fixes after a candidate must point to a new commit and updated evidence. Use additional prerelease identifiers when warranted instead of silently changing an already distributed artifact. Record what changed and rerun the affected checks; do not invent a new broad acceptance program during release stabilization.

## Application CI versus bootstrap CI

The supplied CI checks the bootstrap package only. M0 establishes application commands, supported runtimes, the package manager, and application CI after inspecting the actual environment. Until then, validation target names in `planning/backlog.json` describe intended checks rather than executable commands or passed results.

The implementation CI should grow with real behavior: contract and storage checks first, capture/recall and the working Observatory in M1, then the failure and integration cases relevant to later milestones. Keep the required suite small enough to run routinely and add coverage only for a concrete invariant, failure mode, compatibility promise, or release risk.
