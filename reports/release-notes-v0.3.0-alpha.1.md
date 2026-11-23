# NOESIS v0.3.0-alpha.1 release notes

**Status:** local candidate preparation, not released.
**Candidate:** `9b5a77a`

## Implemented

- Explicit and inferred preference records with independent support contexts.
- Correction precedence for current explicit instructions.
- Anchored, idempotent Ebb activation evaluation.
- Reversible activation revival without changing truth, validity, or retention.
- Explicit forgetting receipts with affected IDs and reasons.
- Observatory Attunement and Ebb controls for correction, revival, and forgetting.

## Validation

`npm test` passed 49 tests. Authenticated Observatory journeys passed preference correction, Ebb evaluation and revival, and explicit forgetting. Headless Chromium rendered the updated Observatory at desktop and mobile sizes.

## Open gates

- Interactive browser control was not run; HTTP journeys cover the same mutations.
- Physical second-device LAN validation remains an M8 check.
- Forgetting cannot recall uncontrolled external copies.
- M4 Full Reverie remains in progress.

No package was published, deployed, or exposed to the public Internet.
