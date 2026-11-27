# NOESIS core-atlas mockups

**Phase:** Design mockups; not application implementation or Design approval.  
**Contract:** `design-contract-20261127.2`
**Direction:** Cortex Tabs visual base + Signal Deck activity/provenance discipline.  
**Owner path:** `docs/design/runs/20261127T030405478904Z-working-title/design/core-atlas/`

## Open locally

Open `index.html` directly, or serve this directory with any local static server. No network request, package install, hosted font, canvas, chart library, `particles.js`, or runtime dependency is needed.

| Artifact | Complete surface |
|---|---|
| `pairing.html` | Pairing gate: code entry, invalid, expired, paired-return, unavailable/error |
| `observatory.html` | Observatory / Pulse: open work, brain activity, pipeline, coverage, retry, state specimens, selected inspector |
| `atlas.html` | Atlas resource catalog, filters, bounded list/table, selected context, relationship handoff, timeout recovery |
| `inspector.html` | Selected inspector: identity, evidence meaning, usage facts, validity/activation, revisions, conflict and safe actions |
| `relationship.html` | Relationship field: local SVG layer, explicit list/table alternative, bounded coverage, unavailable/disputed/recovery states |
| `index.html` | Local index and review cues |
| `styles.css` | Shared semantic tokens, layout, states, responsive behavior, reduced-motion and forced-colors intent |
| `mockup.js` | Local-only theme cycle (`system` → `light` → `dark`), skip-link focus, retry/status, and details-scroll interactions; no runtime integration |
| `assets/brain-activity.svg` | Static activity facts: 2 active, 1 deferred, provider wait indeterminate |
| `assets/pipeline-activity.svg` | Captured/extracted/waiting/deferred stage facts; no fabricated percentage |
| `assets/relationship-field.svg` | Five synthetic nodes and four labelled relationships; deterministic static positions |
| `coverage.json` | Owned-path handoff matrix for state × viewport cases and render evidence |

## Synthetic fixture

Every private-looking value is labelled `synthetic / planned` in the mockups. It is not live NOESIS evidence.

- Resource: **Threadloom MCP**; kind `MCP server`; origin `local / managed`.
- Version: `v2.4.1`.
- Snapshot: `sha256:8a41…c2d7`.
- Scope: `local / project:noesis`.
- Activity: `18 captured`, `14 extracted`, `2 active`, `1 deferred`, provider wait **indeterminate**.
- Failure/recovery: Atlas timeout at `09:42:18 UTC`; retry preserves resource, version, snapshot, scope, and revision context.
- Evidence labels remain separate: `source evidence`, `derived observation`, `generated Lore`, `authored Lore`, `hypothetical`.

## Coverage owned here

The global `coverage.json` is outside this worker-owned directory and was not edited. `coverage.json` here gives the coordinator stable mockup/evidence links without claiming application implementation. Each family is rendered by its named HTML artifact at `desktop-1440`, `desktop-1024`, `narrow-390`, and `reflow-320`; `desktop-900-1260` behavior is specified below and captured at `1024px` as visual-only evidence. Core primary workspaces use semantic links to preserve cross-artifact navigation; Lore, Reverie, and Forge resolve to their sibling Knowledge Ops mockups.

| Coverage ID | State families in this handoff | Mockup |
|---|---|---|
| `pairing` | `code-entry`, `invalid-code`, `expired-code`, `paired-return`, `unavailable/error` | `pairing.html` |
| `observatory-shell` / `pulse` | `paired-empty` / no open work, `paired-populated` / open work, `loading`, `known-activity`, `indeterminate-wait`, `partial`, `error`, `recovery` | `observatory.html` |
| `atlas` | `empty`, `loading`, `list`, `selected`, `relationship-field`, `partial`, `stale/disputed`, `error`, `recovery` | `atlas.html` |
| `selected-inspector` / `lineage` | selected identity, source chain, derived chain, hypothetical chain, stale/conflict, partial/unknown, unavailable/error, recovery | `inspector.html` |
| `relationship-field` | `loading`, `empty`, `partial`, `unavailable`, `disputed`, `recovery`, bounded complete fixture | `relationship.html` + `assets/relationship-field.svg` |

`coverage.json` records the design evidence as `design-render` and intentionally leaves application implementation unverified. The coordinator should transfer these case links into the run-level `coverage.json` without marking runtime QA passed.

## Responsive behavior

- **1440px:** three columns: ~205px section rail, fluid task canvas, ~312px inspector. Pulse graphic/table and Atlas field/list stay side-by-side. Pointer and keyboard paths are both available.
- **900–1260px:** two columns: rail + canvas. Inspector moves below the main content and uses a two-column detail grid when width permits.
- **390px:** one stack: header → horizontally scrollable primary tabs → sticky selected-context bar → compact horizontal rail → active task → inspector. Cards, activity, field, list, and action groups stack; important controls remain at least 44px high.
- **320px:** tabs scroll instead of clipping/wrapping; actions become full width; context values stack; long IDs/locators wrap; relationship rows stack; lineage/meaning chains become vertical; page itself has no horizontal overflow.
- **Safe area / keyboard:** production shell should add `env(safe-area-inset-inline-start/end)` and preserve the sticky context bar while the on-screen keyboard resizes the viewport. This static board has no native orientation-specific surface.

## Keyboard, focus, and status contract

- Skip link is first focusable item and targets `#main-content`.
- Primary workspaces use semantic links, not cross-document `role=tab` controls. Each link has a real destination and the current workspace uses `aria-current="page"`; no tabpanel claim is made for separate HTML artifacts.
- DOM order is header → primary links → selected context → rail → task canvas → inspector. Selected resource/version/scope remain visible through handoffs.
- Relationship list/table is primary keyboard and assistive-technology path. No drag, hover, pointer gesture, or color-only meaning is required.
- Async statuses stay local to their surface. Passive updates do not steal focus. User-triggered retry updates the local status and says `Retry queued` / `Waiting`; it never invents progress.
- Long IDs, locators, hashes, and error text remain copyable and use `overflow-wrap:anywhere`.
- Mockup buttons are presentation controls; application integration must add real service authorization, revisions, durable jobs, route/deep-link behavior, and safe destructive confirmation.

## Motion, color, and graphics

- The SVGs are local, reviewed, static geometry with flat fills. They show only bounded fixture facts and explicit relation labels; no random particles, orphan dots, force simulation, confidence cloud, causality, or fabricated progress.
- `prefers-reduced-motion: reduce` disables animation/transition intent and keeps all labels, facts, focus, and list/table alternatives. This mockup set does not run continuous motion by default.
- `forced-colors: active` switches component surfaces to system colors, preserves borders/focus, and retains status words/icons.
- The local control cycles `system`, `light`, and `dark`; semantic roles remain shared. No contrast or WCAG pass is claimed from the mockups.
## Review repair notes

- **D-002 / D-004:** Core primary workspaces are semantic links with live destinations. Local `role="status"` and `role="alert"` regions name their own updates; no feedback is routed to pairing.
- **D-006:** Important small controls are at least 44px. At 320px, open-work, status/retry, panel-footer, pairing-submit, and context actions stack full width.
- **D-008:** Theme control announces the mode it will switch to, both before and after a local toggle.
- **D-009:** Atlas and Relationship SVGs are decorative duplicates (`alt="" aria-hidden="true"`); labelled relationship lists remain primary.
- **D-010:** Resource, relation, usage, revision, and open-work rows expose context-specific accessible names.


## Evidence and limits

- Source-backed inputs read for this lane: repository `AGENTS.md`, `docs/01-PRODUCT-SPEC.md`, `docs/02-ARCHITECTURE.md`, `docs/07-DASHBOARD-AND-LORE.md`, `docs/10-VALIDATION-AND-EVALUATION.md`, `package.json`, `src/server.mjs`, `test/observatory.test.mjs`, `ui-design-studio.json`, the run `brief.md`, `report.md`, `findings.json`, `coverage.json`, `plan/selection.md`, and `design/contract.md`, plus the UI Design Studio visual-system/workflow/quality-gates/multi-agent/project-context references.
- These are browser-renderable concept artifacts only. They do not prove pairing, authorization, same-origin API policy, durable job reconnect/cancel/resume, real Atlas data, screen-reader behavior, forced-colors behavior, field performance, second-device LAN reachability, or application QA.
- The relationship field is optional visual enhancement. List/table alternatives remain required and primary.
- No files outside `design/core-atlas/` were changed by this lane.

## Review artifacts

Capture paths are under `captures/`; the local assets directory remains unchanged. Capture names identify family and viewport, for example `observatory-1440.png`, `atlas-390.png`, `relationship-320.png`, and `index-1024.png`.
Fresh local Chromium `159.0.8154.6` captures regenerated all six core pages (`index`, `pairing`, `observatory`, `atlas`, `inspector`, and `relationship`) at `1440`, `1024`, `390`, and `320` with `playwright_fast capture --browser chromium --fullPage`. Every receipt returned `CAPTURE_COMPLETE`, `pageErrors: []`, and `qaStatus: NOT_RUN` (visual evidence only; no interaction or application QA claim).

- Core index: `captures/index-1440.png`, `captures/index-1024.png`, `captures/index-390.png`, `captures/index-320.png`
- Pairing: `captures/pairing-1440.png`, `captures/pairing-1024.png`, `captures/pairing-390.png`, `captures/pairing-320.png`
- Observatory / Pulse: `captures/observatory-1440.png`, `captures/observatory-1024.png`, `captures/observatory-390.png`, `captures/observatory-320.png`
- Atlas: `captures/atlas-1440.png`, `captures/atlas-1024.png`, `captures/atlas-390.png`, `captures/atlas-320.png`
- Selected inspector: `captures/inspector-1440.png`, `captures/inspector-1024.png`, `captures/inspector-390.png`, `captures/inspector-320.png`
- Relationship field: `captures/relationship-1440.png`, `captures/relationship-1024.png`, `captures/relationship-390.png`, `captures/relationship-320.png`

Capture receipts report `pageErrors: []` at all listed viewports. Visual inspection did not replace a metric check: managed browser evaluation was unavailable because its daemon exited before readiness with a missing X server, so page-level overflow is not measured or passed here. This does not establish application QA, WCAG conformance, or runtime behavior.

## Repair evidence

- Shared-shell adapter boundary is intentional: Core Atlas keeps the compact HUD/brain geometry, while Knowledge Ops and Extra Surfaces use their denser task and trace layouts. All three lanes now share `data-ui-color-mode="system|light|dark"`, `#main-content` skip focus, 44px controls, local status semantics, and forced-color intent.
- Local interaction harness: skip activation focuses `#main-content`; pairing feedback uses local `role="alert"` / `role="status"` regions; the theme control cycles all three modes. Application routes and service behavior remain unverified.
- Fresh visual captures: `captures/observatory-1440-repair-v8.png`, `captures/observatory-1024-repair-v9.png`, `captures/observatory-390-repair-v8.png`, `captures/observatory-320-repair-v8.png`, `captures/pairing-1024-repair-v3.png`, and forced-color `captures/observatory-390-forced-v6.png`. Chromium `159.0.8154.6`; receipts returned `CAPTURE_COMPLETE`, `pageErrors: []`, and `qaStatus: NOT_RUN`.
- Brain repair: centered the silhouette and node cluster horizontally and vertically in the HUD frame, removed non-semantic corner brackets, moved module/connector labels above the brain fill, and routed four explicit color-coded connectors to Active 01, Active 02, Deferred, and Hub targets. Label pills sit beside each line; flat translucent depth/extrusion layers provide restrained 3D. No gradient, raster, or external asset was added.
- Browser spot-checks covered skip focus, theme cycle, pairing role counts, selected-context preservation, and the centered brain capture with no page errors. This is design evidence, not application QA, WCAG conformance, or approval.
