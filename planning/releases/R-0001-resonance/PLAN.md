# Release plan: R-0001 Resonance

## Identity and baseline

- Stable release ID: `R-0001-resonance`.
- Target application version: `1.1.0`.
- Theme and primary outcome: Resonance. Recall responses explain bounded retrieval decisions and local cost without changing accepted ranking or scope semantics.
- Accepted baseline: application `1.0.0`, commit/tag `80a87030c0a4eaf2e029e48f32feb789be7ffb47` / `v1.0.0`, artifact SHA-256 `e1a1ad454be160ae3f8cb2a7080f1faa265e828b52c655edf453bd4cbf8b0e3e`.
- Supported environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.
- Active pointer: `planning/CURRENT-RELEASE.json`.
- Authoritative tasks: `planning/releases/R-0001-resonance/backlog.json`.

## Why this release

No release-blocking v1 defect is observed. The accepted product's real OMP smoke shows correct scoped note, recall, inspect, and Snooze behavior. The live dashboard shows paired access and Atlas data. Usage data is small, so this plan does not claim a ranking failure or quality gain.

The selected opportunity is bounded recall transparency. Current lexical recall returns useful hits and a coverage object, but callers cannot distinguish considered, matched, included, and budget-omitted records or observe local retrieval duration. Better accounting supports later quality and cost decisions without promoting a speculative ranking change.

This is a known capability gap, not a user-reported defect. The first task measures the accepted baseline on isolated representative data. The release may end with no ranking change if the measurement does not justify one.

## Outcome and exclusions

| Outcome | User result | Baseline | Acceptance |
| --- | --- | --- | --- |
| `R1-O1` | Recall explains bounded retrieval decisions and local cost. | Lexical scoped hits and basic coverage only. | Every response includes trace identity, considered/matched/included counts, omission reasons, elapsed duration, and local deterministic usage without exposing unauthorized IDs. |

Excluded scope:

- Ranking-policy changes without independent development and held-out evidence.
- Model, vector, graph, MCP, external-backend, and schema migrations.
- New dashboard navigation beyond the recall trace display.
- Any automatic learning or self-modification from generated output.

## Tasks and dependencies

`backlog.json` owns four ordered tasks. One integration owner owns `src/service.mjs`, `src/server.mjs`, `src/omp-extension.mjs`, tests, and release records. No migration or lockfile change is planned.

## Evaluation and regression constraints

- Baseline and candidate use the same temporary SQLite dataset, scope, query, runtime, and five-run measurement script.
- Primary decision rule: trace completeness and zero scope leakage must pass. Ranking remains unchanged unless a separate independent evaluation is added and passes.
- Measure recall latency and result counts. Record errors, run count, range, and limitations.
- Preserve source identity, scope checks, context budgets, provenance, current-instruction precedence, and durable native OMP behavior.
- Negative or inconclusive quality findings retain the v1 policy and are recorded in the release report.

## Budget and effort

- Model calls: 0.
- Model tokens: 0.
- Child jobs, retries, embeddings: 0.
- Local wall budget: 300 seconds per validation command.
- Monetary cost: 0 for deterministic local work.
- Effort: 1 to 3 engineering days. Reforecast after the baseline and first integrated trace.

## Compatibility and recovery

No database migration or public tool signature change is planned. New response fields are additive. Existing callers may ignore trace and usage fields. Rollback is the accepted `v1.0.0` commit/tag and artifact. The live store remains outside the checkout and is backed up before any future migration.

## Release and publication

Run `npm ci --ignore-scripts`, `npm run release:check`, the Resonance measurement, real OMP smoke, and authenticated dashboard checks. Prepare a local `v1.1.0` artifact and release report. No push, tag, package publication, deployment, or hosted release is authorized by this plan.

## Next task

Start `R-0001-T001` with the baseline measurement. Preserve the accepted v1.0.0 installation while candidate work uses a separate temporary store.
