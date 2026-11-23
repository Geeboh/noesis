# NOESIS v0.2.0-alpha.1 release notes

**Status:** local candidate preparation, not released.
**Candidate:** `7b385b9`

## Implemented

- Atlas resource identity with aliases and local, external, and mixed facets.
- Independent referenced, examined, available, installed, used, and evaluated states.
- OMP project discovery with record-to-resource lineage links.
- Immutable source snapshots with changed-source Chronicle history and unavailable-source status.
- Bounded Observatory resource filters, detail, snapshots, states, lineage, and Chronicle views.
- Scope checks on resource inspection and trace projections.

## Validation

`npm test` passed 48 tests. Real OMP Atlas population passed. A live `https://example.com` fetch produced two explicit snapshots with distinct digests and a `source_changed` Chronicle event. Authenticated Observatory resource and history journeys passed.

## Open gates

- Automatic external crawling is not implemented.
- Resource state claims require explicit evidence; URLs and successful tools do not imply installation, use, or evaluation.
- Physical second-device LAN validation remains an M8 check.
- M3 Attunement and Ebb integration remains in progress.

No package was published, deployed, or exposed to the public Internet.
