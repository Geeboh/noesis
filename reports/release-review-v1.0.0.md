# NOESIS v1.0.0 release review

**Review date:** 2026-11-24
**Candidate:** `80a8703`
**Product version:** `1.0.0`
**Bootstrap version:** `1.0.0`
**Destination:** local only; no new remote publication performed by this review

## Decision

**READY for the declared local supported configuration.** No release-blocking defect remains after sequential rerun. Existing private GitHub publication from prior authorization was not modified.

## Required evidence review

All M0 through M8 milestones are marked done with nonempty completion evidence. M7 required native portability is complete. M7 optional MCP tasks are explicitly deferred by DEC-0002 and remain unavailable. M8 validation records the exact second-device limitation.

## Executed checks

| Check | Result |
| --- | --- |
| `npm ci --ignore-scripts` | passed |
| `npm run test:m0` | passed |
| Sequential `npm run release:check` | passed, 56 tests |
| `python3 scripts/doctor.py` | passed prerequisite inventory; optional packages absent |
| `npm run probe:omp` | extension loaded on OMP 19.1.1; print probe remains partial |
| `npm pack --ignore-scripts --pack-destination /tmp/noesis-release-review` | passed; `noesis-1.0.0.tgz` |
| Native archive tamper/restore and SQLite backup/restore | passed in application suite |
| `node scripts/measure_m8.mjs` | five runs, 25 records, zero errors |
| Port 17346 startup and `/healthz` | passed; actual URL and pairing code printed after bind |

One parallel invocation initially failed because `npm ci` removed `node_modules` while `npm test` ran concurrently. The sequential release gate passed. This was a review harness race, not a product defect.

## Artifact

`/tmp/noesis-release-review/noesis-1.0.0.tgz`

SHA-256: `5c6a9e60a6530f2087f8e77a2c582e236e856fe73f20be4ff9a8d88ab4c11c83`

The artifact reports package version `1.0.0`, dependency `qrcode@1.5.4`, and Node engine `>=24.0.0`. The lockfile and package manifest agree.

## Known limitations

- Physical second-device LAN validation was unavailable.
- Interactive browser keyboard review and high-concurrency load were not run.
- The OMP print-mode probe did not observe live `before_agent_start` delivery.
- Provider-backed model enrichment and MCP are unavailable by declared scope.
- External blobs and uncontrolled copies remain outside native restore/deletion guarantees.
- Full JSON Schema validation dependencies are not installed.

## Publication boundary

This review prepared and verified local artifacts only. It did not push branches or tags, create releases, publish packages, deploy services, or send external messages.
