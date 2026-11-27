# Release report: R-0019 Resonance recall coverage

## Identity

- Release: `R-0019-recall-coverage`.
- Target: `1.11.0`.
- Baseline: published and installed `1.10.0`.
- Publication: authorized by user `shipit`; published v1.11.0 to GitHub.

## Delivered result

`mindRecall` preserves its existing ranked bounded result. After `max_items` fills, it continues a metadata-only scan and reports all authorized matches plus item-limited omissions. Scope, grouping, character budgets, provenance, trace identity, and usage remain unchanged.

The approved Cortex Tabs Observatory UI is included in the v1.11.0 artifact. The host now consumes the trusted local theme registry, persists valid theme selection, falls back on invalid selection, and serves allowlisted local theme assets.

## Validation

- Focused service, OMP, MCP, and Observatory checks: passed.
- Full release gate: 83 tests passed.
- Schema examples: 21 passed.
- Theme gate: 97 tokens, 18 contrast pairs, 57,818 raw runtime bytes, 8,851 gzip estimate.
- Browser matrix: Chromium, Firefox, and WebKit visual captures passed.
- Artifact: `/tmp/noesis-r19-final/noesis-1.11.0.tgz`.
- Artifact SHA-256: `14178b8a0c2604ccac1dd422170e8c46fe79f0446b340f278a44db8a4458523a`.
- Theme package: `/tmp/noesis-cortex-tabs-1.0.0.zip`.
- Theme package SHA-256: `adb42040e11d3959e45c7b2102af7aecd8bbf49689180947803dae265cb6576f`.
- Release URL: `https://github.com/Geeboh/noesis/releases/tag/v1.11.0`.
- Installation report: `reports/use-v1.11.0.md`.
- Rollback: `.runtime/artifacts/noesis-live-backup-v1.11.0-preinstall/mind.sqlite`.

## Disposition

v1.11.0 published and installed. Live semantic counts preserved: schema migrations 5, records 0, resources 1, import runs 0. No second-device LAN check was available. HTTP LAN transport remains unencrypted.
