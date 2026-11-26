# Decision 0009: Catalyst proposal-to-outcome loop

## Status

Accepted for local implementation as the next bounded release.

## User problem

Forge and Blueprint can export proposed tasks, but NOESIS cannot record that an authorized proposal was applied or what happened afterward. A proposal remains indistinguishable from an executed task.

## Selected behavior

Add service-bound application and outcome records without adding a Mind tool. A paired Observatory client can apply one scoped hypothesis to one resource and record a direct-user outcome. The service creates lineage from hypothesis to application and from application to outcome. Task manifests project `proposed`, `applied`, or `validated` status with exact record IDs.

Application does not execute code, approve publication, or assert success. Outcome recording is an observation supplied by the authorized operator. Rejected proposals remain proposals and are never treated as applications.

## Invariants

Scope and resource authorization are checked on every mutation. Applications and outcomes are separate records. A positive outcome is not proof of every source claim. Existing Forge, Blueprint, archive, restore, Mind tools, OMP compaction ownership, and budgets remain unchanged.

## Acceptance

A disposable paired Observatory journey must create a proposal-only manifest, apply one hypothesis, record one outcome, expose lineage and lifecycle in the task manifest, preserve rejected proposals, and survive native archive/restore. Existing tests and the full release gate must pass.
