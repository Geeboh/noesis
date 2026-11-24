# NOESIS v1.3.0 release notes

**Status:** local Relay candidate, not published or installed.
**Candidate:** local change from published v1.2.4.

## Implemented

- Added paired `POST /api/resources/:resource_id/refresh` for one registered URL alias.
- Enforced HTTP(S), no credentials, no obvious private/loopback hosts, no redirects, and a 65,536-byte body limit.
- Persisted digest-backed observed snapshots and Atlas Chronicle source-change history.
- Failed refreshes do not create partial snapshots.

## Validation

The paired `https://example.com` workflow registered a resource and refreshed one snapshot with HTTP 200, observed status, and a 64-character digest. Redirect, unsafe-host, non-2xx, and oversized-body failures passed without snapshot persistence.

`npm run release:check` passed 62 tests. Atlas and Observatory tests, tracker validation, bootstrap validation, and artifact creation passed.

## Known limitations

- No automatic crawling, scheduling, authentication, redirect following, or JavaScript rendering.
- DNS aliases that resolve to private addresses are outside this bounded check.
- No live user source was refreshed.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

R7 is local only. No branch, tag, package, deployment, or hosted release was published.
