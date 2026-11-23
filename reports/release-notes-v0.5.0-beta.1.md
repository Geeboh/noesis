# NOESIS v0.5.0-beta.1 release notes

**Status:** local candidate preparation, not released.
**Candidate:** `226fecb`

## Implemented

- Persistent source-linked Lore pages with stable IDs and revisions.
- Separate generated and manual section ownership.
- Manual edits with expected-revision conflict detection and diffs.
- Source invalidation and generated refresh that preserve authored sections.
- Backlinks, source references, persisted page reconstruction, and restart recovery.
- Authenticated Observatory Lore read, edit, refresh, and inspection controls.

## Validation

`npm test` passed 53 tests. Authenticated Lore read/edit/refresh/restart journeys passed. Headless Chromium rendered desktop and mobile Observatory views.

## Open gates

- Automatic source crawling is not implemented.
- Lore remains derived and cannot independently confirm its source claims.
- Interactive browser editing and physical second-device LAN validation remain unverified.
- M6 Forge and Blueprints integration remains next.

No package was published, deployed, or exposed to the public Internet.
