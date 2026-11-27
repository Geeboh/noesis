# NOESIS capture-recall mockup

**Phase:** Design mockup only; not application implementation or Design approval.  
**Surface ID:** `capture-recall`  
**Contract:** `design-contract-20261127.2`  
**Owner path:** `docs/design/runs/20261127T030405478904Z-working-title/design/capture-recall/`  
**Direction:** Cortex Tabs shell + Signal Deck provenance and bounded-result discipline.

## Boundary

This folder contains the complete local capture/recall page family requested by the Design review. It does not change application HTML, routes, service policy, API handlers, global Design coverage, or shared lane files. Every name, ID, count, timestamp, status, scope, and query is synthetic/planned.

The page uses only local HTML/CSS. It has no remote requests, hosted fonts, raster/reference reuse, gradients, particles.js, canvas, graph library, or runtime dependency.

## Fixture

- Resource: **Threadloom MCP** (`fixture-resource-threadloom-mcp`), MCP server, local / managed.
- Version: `v2.4.1`.
- Snapshot: `sha256:8a41…c2d7`.
- Scope: `local / project:noesis`.
- Source locator: `threadloom://events/evt-118`.
- Synthetic observation ID: `obs-2048`.
- Recall fixture: 5 matched, 3 returned/included, 2 omitted, continuation available.

## Complete state coverage

`coverage.json` contains one case record for every state × viewport combination. The page renders all eight states together so a reviewer can inspect the full family from one local file:

| State | Evidence anchor | Meaning |
|---|---|---|
| `empty` | `#capture-empty` | No draft or no matches; zero is not unavailable. |
| `editing` | `#capture-editing` | Note, locator, selected resource, version, and scope remain in the draft. |
| `submitting` | `#capture-submitting` | Request is queued; duplicate submit is disabled in planned behavior; queued is not captured. |
| `success` | `#capture-success` | Durable observation ID and source provenance are reported. |
| `results` | `#recall-form` / `.result-list` | Bounded rows expose origin, revision, scope match, and inspect action. |
| `partial` | `#partial-title` | Returned and omitted counts plus continuation remain visible. |
| `error` | `#recall-error-title` | Local alert names operation and reason; no false empty/success. |
| `recovery` | `#recovery-title` | Retry is queued and preserves input, scope, snapshot, and revision. |

Application implementation is `unverified` for every case. The static page is the mockup authority; captures are visual evidence only.

## Navigation and responsive behavior

- Shared semantic links keep Observatory, Atlas, Lore, Reverie, and Forge destinations real; selected resource/version/scope remains in the context bar.
- DOM order is skip link → header → primary links → selected context → rail → capture → recall → coverage → ledger/notes → inspector.
- The skip link targets focusable `#main-content` (`tabindex="-1"`) and should move focus there in an integrated implementation.
- Native fields, links, and buttons provide the planned keyboard path. Retry does not steal focus. A future discard/confirmation dialog must contain focus, support Escape/backdrop rules, and restore focus to its invoking control.
- `1440px`: rail + capture/recall canvas + pinned inspector.
- `1024px`: rail + canvas; inspector moves below the main content.
- `390px`: one stack; primary tabs scroll horizontally; context, forms, rows, and inspector stack.
- `320px`: no page-level horizontal overflow; IDs wrap; actions become full-width; results use stacked rows.
- Production should add safe-area padding and verify orientation, browser text scaling, zoom, and on-screen-keyboard resize behavior. The static board records intent only.

## Status, provenance, and coverage rules

- Capture statuses are local to Capture; recall partial/error/recovery statuses are local to Recall.
- `role="status"` communicates success, partial, and queued recovery. `role="alert"` communicates request failure.
- Source evidence, derived observation, authored context, and hypothetical output remain separate. Recall is inspection only; it does not confirm, apply, reinforce, delete, or publish memory.
- Returned, included, omitted, continuation, validated, and application facts are separate. No overall knowledge percentage is shown.
- Retry preserves note, query, source locator, selected version, snapshot, scope, and current revision. No progress or completion is invented when the provider has no denominator.

## Theme and accessibility intent

- The local mockup root uses `data-ui-color-mode="system"` and the `Color mode` control cycles `system → light → dark`; the query parameter `?mode=system|light|dark` selects a deterministic preview for local captures.
- Light, dark, and system modes share semantic tokens and markup. The control is mockup-only and does not claim to change an application theme.
- `prefers-reduced-motion: reduce` removes transition/animation intent while retaining all state labels, coverage facts, focus, and text alternatives.
- `forced-colors: active` uses system colors, visible borders, focus, and status words; color is never the only status signal. Browser forced-colors emulation was unavailable, so the static intent preview is not a forced-colors conformance capture.
- Important controls, fields, and links are at least 44px. The 320px rules stack action groups and preserve readable focus targets.
- Screen-reader output, numeric contrast, full WCAG conformance, service authorization, and application behavior are not claimed by this mockup.

## Rendered evidence

Captures are local Chromium visual concept evidence only. Existing responsive captures now show the local mode control in system mode. Additional representative mode artifacts:

- `captures/capture-recall-system-1440.png` — `data-ui-color-mode="system"` preview at 1440px.
- `captures/capture-recall-light-1024.png` — `?mode=light` preview at 1024px.
- `captures/capture-recall-dark-1440.png` — `?mode=dark` preview at 1440px.
- `captures/forced-colors-intent.html` — static system-color intent source, clearly marked unverified.
- `captures/capture-recall-forced-colors-intent.png` — screenshot of that static intent artifact, not browser forced-colors emulation.

Capture command:

```text
playwright_fast capture --browser chromium --url file:///<absolute-path>/index.html?mode=<system|light|dark> --output captures/capture-recall-<mode>-<width>.png --width <width> --height 900 --fullPage
```

Observed receipts: Chromium `159.0.8154.6`; captures report `CAPTURE_COMPLETE` with `pageErrors: []` and `qaStatus: NOT_RUN`. These receipts are visual evidence only, not application QA, WCAG conformance, forced-colors conformance, or Design approval.

## Responsive rendered evidence

Existing local Chromium captures show the complete page family and mode control:

- `captures/capture-recall-1440.png`
- `captures/capture-recall-1024.png`
- `captures/capture-recall-390.png`
- `captures/capture-recall-320.png`

The four responsive captures report `CAPTURE_COMPLETE` with `pageErrors: []` and `qaStatus: NOT_RUN`; visual inspection found no page-level horizontal overflow at 1440px, 1024px, 390px, or 320px. These receipts are visual evidence only, not application QA, WCAG conformance, forced-colors conformance, or Design approval.
