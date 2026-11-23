# Milestone report — M1 Working Mind loop

**Date:** 2026-11-24
**Owner/reviewer:** integration owner
**State:** in_progress
**Candidate:** `6be8aec197695e24374a88559cb96327e2e7a153`
**Product target:** `v0.1.0-alpha.1`
**Bootstrap version:** 1.0.0

## Outcome

NOESIS now has a durable SQLite ledger, scoped service capture/recall/inspection, deterministic Snooze jobs, a file-backed OMP extension, real OMP tool capture and recall, LAN startup, terminal QR output, same-origin pairing, and a functional accessible Observatory surface. M1 remains open for alpha closure because visual browser automation is unavailable in this environment and M1-06 release preparation is not complete.

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| M1-01 | SQLite migrations, records, revisions, sources, events, idempotency, retry jobs | met | `test/ledger.test.mjs`, `test/store.test.mjs`, `test/processing.test.mjs` |
| M1-02 | Native OMP tools, passive observers, real `mind_note`, fresh `mind_recall` | met with hook-delivery limitation | `E34`, `E35`, `src/omp-extension.mjs` |
| M1-03 | Scoped lexical recall, exact inspection, provenance and source links | met | `test/service.test.mjs`, `test/observatory.test.mjs` |
| M1-04 | Durable Snooze admission, status, bounded no-change work, cancellation, restart | met | `test/service.test.mjs`, `test/processing.test.mjs` |
| M1-05 | Same-origin HTTP UI/API, pairing, LAN address, QR, startup, real HTTP journey | met for automated HTTP/startup checks | `test/observatory.test.mjs`, `E33` |
| M1-06 | Alpha report and release notes | in_progress | this report; release notes remain next |

## Validation

**Environment:** Linux x86_64, Node 24.22.3, npm 11.19.1, OMP 19.1.1.
**Tested candidate:** `6be8aec197695e24374a88559cb96327e2e7a153`.
**Fixture/data origin:** synthetic temporary stores plus real host capture in `/tmp/noesis-omp-live`.

`npm test` passed 37 tests. Real OMP `mind_note` returned a durable receipt and SQLite inspection found the captured observation. A fresh real OMP session recalled the stored record ID. The CLI bound a LAN listener and printed an actual address, QR, and separate code. The HTTP journey covered denied access, pairing, reuse rejection, note, recall, inspection, and Snooze status.

## Remaining limits

Managed Chromium could not start because X11 `$DISPLAY` is unavailable. No physical second device was available. The print-mode OMP probe did not emit a live `before_agent_start` payload, so that host-delivery detail remains explicitly unverified. Browser-capable validation and alpha release notes are the next bounded work.

## Next milestone

Finish M1-06 release notes and the narrow alpha review, then proceed to M2 Atlas, Lineage, and Chronicle. Do not claim M1 complete until the release artifact and limitations are recorded.
