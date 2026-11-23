# Contributing to NOESIS

Read [AGENTS.md](AGENTS.md), [Git workflow](docs/08-GIT-WORKFLOW.md), and the current [backlog](planning/backlog.json). Select a dependency-ready task and declare the files you own. Use a short-lived branch/worktree and a small reviewable change.

Explain the problem, resulting behavior, important decisions, and meaningful verification in the pull request. Include migrations, applicability changes and rollback implications when relevant. Preserve manual documentation and source evidence. Avoid cosmetic tests or broad rewrites unrelated to the task.

Run the bootstrap integrity check while these contracts remain in use. M0 adds real application validation commands; subsequent changes must satisfy the affected targets. Mark unavailable checks explicitly instead of implying they passed.

No license is assigned by this bootstrap. Record the owner's distribution decision before publishing code or incorporating third-party source. Optional dependencies need compatible licensing, pinned versions, and evidence that their benefit justifies their cost.
