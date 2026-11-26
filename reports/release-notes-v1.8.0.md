# NOESIS v1.8.0 release notes

## Catalyst proposal-to-outcome loop

Catalyst now records the path from a sourced proposal to an authorized application and an observed outcome.

- Paired Observatory clients can apply a scoped hypothesis.
- Paired clients can record a direct-user outcome.
- Applications and outcomes are separate durable records.
- Hypothesis → application → outcome lineage is preserved.
- Task manifests distinguish `proposed`, `applied`, and `validated` states.
- Duplicate mutations return the original receipt.
- No external task execution, patching, assignment, approval, or publication occurs.

## Validation

The local candidate passed 77 tests and 21 JSON Schema examples. The paired Observatory journey and native archive/restore checks passed. v1.7.0 remains installed and is the rollback baseline.
