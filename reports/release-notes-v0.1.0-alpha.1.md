# NOESIS v0.1.0-alpha.1 local candidate notes

**Status:** local candidate preparation, not released.
**Candidate:** `85712e4c57816537179a2ec4e17be1e4d719add3`

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

`npm run release:check` is the reproducible local gate. The latest observed run passed 46 tests, bootstrap validation, and CLI/server syntax checks.

Real OMP capture returned a durable `mind_note` receipt and fresh OMP recall returned the stored record ID. The HTTP Observatory journey covered denied access, pairing, reuse rejection, note, recall, inspection, and Snooze status. CLI smoke printed an actual LAN URL and QR after bind.

## Open gates

- M1 alpha closure and release artifact review remain open.
- Browser visual automation is unavailable because the managed Chromium daemon requires X11 `$DISPLAY`.
- Physical second-device LAN validation is unavailable.
- M2/M3 web controls and M4–M7 integration workflows remain in progress.
- Stable v1.0 hardening, migration/backup/restore release checks, and final release notes remain open.

No package was published, deployed, pushed, or exposed to the Internet.
