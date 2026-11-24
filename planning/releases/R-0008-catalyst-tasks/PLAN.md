# Release plan: R-0008 Catalyst proposal tasks

## Identity and baseline

- Stable release ID: `R-0008-catalyst-tasks`.
- Target application version: `1.4.0`.
- Theme and primary outcome: Catalyst. Project proposals become reviewable task projections without automatic execution.
- Accepted baseline: application `1.3.0`, tag `v1.3.0`, commit `1c00047fc817d8754439009cf95e272c6704cd0d`, artifact SHA-256 `4fedc13343b74e9eb63c9288692e6f6d8146e40a7d66aaa67d7bbdd4783addd3`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0008-catalyst-tasks/backlog.json`.

## Why this workflow

M6 validated Forge and Blueprint outputs with scoped findings, lessons, hypotheses, reproduction cases, evidence, and delta baselines. Catalyst now selects one concrete workflow from that evidence. A paired operator can request a task-shaped projection of hypotheses for review in the same resource scope.

The projection is derived and non-authoritative. It does not create a task record, assign work, execute a patch, mark a hypothesis verified, or publish anything. A later workflow can evaluate whether proposed tasks are useful using actual outcomes.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R8-O1` | A Blueprint hypothesis becomes a reviewable proposed task. | Blueprint exports hypotheses but no task-shaped projection. | Task manifest contains proposed tasks with hypothesis/source IDs, scope, provenance, validation-needed fields, redaction, and explicit non-execution status. |

Excluded scope:

- No automatic execution, assignment, approval, status mutation, patching, or publication.
- No task database, migration, model, vector, graph, MCP, or external backend.
- No change to Blueprint evidence, hypothesis epistemic status, scope, or provenance.
- No remote publication without new explicit authorization for R8.

## Tasks and dependencies

1. `R-0008-T001` defines task-manifest shape and scoped projection tests.
2. `R-0008-T002` adds the derived task-manifest export and API route.
3. `R-0008-T003` validates paired Observatory, privacy, and scope behavior.
4. `R-0008-T004` prepares the local Catalyst candidate and recovery record.

## Evaluation and regression constraints

- Hypothesis source IDs and provenance remain exact.
- Output is clearly proposed and non-executing.
- Redacted privacy mode removes path and bearer-like data from task text.
- Unauthorized resources return the existing unavailable response.
- No task is persisted or executable through the new route.
- No model calls, embeddings, retries, child jobs, or monetary spend.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0.
- Effort: 2 to 4 engineering days. Reforecast after the first manifest slice.

## Compatibility and recovery

The new task-manifest projection and GET route are additive. Existing Forge, Blueprint, hypothesis, provenance, and authorization behavior remains unchanged. No database migration is required. Recovery is the published v1.3.0 tag/artifact and `/tmp/noesis-live-backup-v1.3/mind.sqlite`.

Keep v1.3.0 installed while the candidate is local. Use disposable resources and hypotheses for validation.

## Release and publication

Run focused Forge tests, paired task-manifest Observatory tests, privacy/scope checks, `npm ci --ignore-scripts`, `npm run release:check`, bootstrap and tracker validation, and `npm pack --ignore-scripts` with a checksum. Prepare `1.4.0` notes, review, report, and recovery records.

No branch push, tag, GitHub release, package publication, or hosted deployment is authorized for R8 by this plan.

## Next task

Start `R-0008-T001` with the scoped task-manifest shape and projection tests. Keep v1.3.0 installed until the local Catalyst candidate passes its gates.
