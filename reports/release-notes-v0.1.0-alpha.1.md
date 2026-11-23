# NOESIS v0.1.0-alpha.1 release notes

**Status:** released to private GitHub repository.
**Candidate:** `72f5291`

## Implemented

- Durable SQLite evidence, source, revision, idempotency, and job ledger.
- Native OMP 19.1.1 extension with `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`.
- Real OMP capture and fresh-session recall against a temporary database.
- Snooze and full bounded Reverie contracts with hypothesis provenance.
- LAN Observatory on `0.0.0.0:7337` defaults, actual address output, text QR, pairing, scoped APIs, and responsive accessible HTML.
- Atlas resource aliases, snapshots, independent evidence states, lineage, and Chronicle events.
- Attunement correction/support records, reversible Ebb activation, and explicit forgetment receipts.
- Lore, Forge/Blueprint, and native archive integrity core modules.
- M8 native backup/restore and health checks now have deterministic coverage; stable release hardening remains open.

## Validation

`npm run release:check` is the reproducible local gate. The current M1 validation run passed 46 application tests, bootstrap validation, Node syntax checks, real OMP capture/recall, SQLite reopen persistence, and CLI/server readiness checks.

Headless Chromium captured the pairing page at 1280x720 and 390x844 with no page errors. Interactive pairing and physical second-device LAN validation remain unverified.

## Open gates

- M1 alpha closure and release artifact review are complete locally.
- Interactive browser pairing is not run; captures are visual evidence only.
- Physical second-device LAN validation is unavailable.
- M2/M3 web controls and M4-M7 integration workflows remain in progress.
- Stable v1.0 hardening, migration/backup/restore release checks, and final release notes remain open.

Released as a private GitHub release. No package was published, deployed, or exposed to the public Internet.
