# NOESIS v1.4.0 release notes

**Status:** installed locally; GitHub publication authorized and pending.
**Candidate:** local change from published v1.3.0.

## Implemented

- Added a scoped proposal-task manifest for Blueprint hypotheses.
- Tasks retain hypothesis IDs, source references, scope, provenance, and validation-needed fields.
- Tasks are explicitly proposed and non-executing.
- Added paired `GET /api/tasks/:resource_id`.

## Validation

Focused Forge and Observatory tests passed. The paired route required authentication and returned a `proposal_task_manifest` with `status=proposed`. The full release gate passed 63 tests.

## Known limitations

- No task was persisted, assigned, approved, executed, patched, or published.
- No real project outcome was measured.
- No model, vector, graph, MCP, connector, or external backend was added.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

R8 is installed locally. GitHub publication is authorized and pending. No branch, tag, package, deployment, or hosted release was published yet.
