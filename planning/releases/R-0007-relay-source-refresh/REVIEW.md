# R-0007 Relay source refresh review

**Candidate:** local v1.3.0 change from the published v1.2.4 baseline.
**Target:** `1.3.0`.
**Decision:** READY locally for the bounded Relay source-refresh workflow. Not installed and not published.

## Review result

The candidate adds an authorized `POST /api/resources/:resource_id/refresh` workflow. It resolves the resource's URL alias, rejects credentials, unsupported schemes, obvious private/loopback hosts, redirects, non-2xx responses, and bodies above 65,536 bytes. Successful responses persist a digest-backed observed snapshot through Atlas, preserving prior snapshots and Chronicle source-change behavior.

The paired `https://example.com` smoke completed registration and refresh. Failure tests confirmed no partial snapshot on redirect, unsafe host, or oversized body.

## Checks

- `npm ci --ignore-scripts`: passed.
- `npm run release:check`: passed, 62 tests.
- Atlas and Observatory tests: passed, 9 focused tests.
- Paired external source smoke: passed with HTTP 200 snapshot persistence.
- `python3 scripts/validate_bootstrap.py`: passed; full JSON Schema dependencies unavailable.
- R7 tracker JSON/reference validation: passed.
- Artifact: `/tmp/noesis-r7-release/noesis-1.3.0.tgz`, SHA-256 `4fedc13343b74e9eb63c9288692e6f6d8146e40a7d66aaa67d7bbdd4783addd3`.

## Limitations

No automatic crawling, authentication, redirect following, JavaScript rendering, scheduling, or live user-source refresh was used. DNS rebinding and private addresses behind public hostnames remain outside this bounded check. No physical second-device check or remote publication was performed.
