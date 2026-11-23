# NOESIS v0.6.0-beta.1 release notes

**Status:** released to private GitHub repository.
**Candidate:** `9a27dab`

## Implemented

- Resource and version-scoped Forge views.
- Separate observations, lessons, hypotheses, evidence, and reproduction cases.
- Focused bounded dreams preserving selected resource scope and focus.
- Structured Blueprint Markdown and JSON exports.
- Privacy redaction, delta metadata, omissions, limitations, and incompatible-baseline errors.
- No automatic source patching, publishing, or trust promotion.

## Validation

`npm test` passed 55 tests. Authenticated plugin and project Forge journeys passed. Blueprint privacy, delta, baseline, and focused-dream checks passed. Headless Chromium rendered desktop and mobile Observatory views.

## Open gates

- Model-backed enrichment and external experiment execution are not enabled.
- Remote patching and publication are not performed by export.
- Interactive browser control, physical second-device LAN validation, and M8 release reproducibility remain unverified.
- M7 native portability is next.

Released as a private GitHub prerelease. No package was published, deployed, or exposed to the public Internet.
