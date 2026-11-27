# Knowledge Ops mockups

**Phase:** Design mockups only  
**Owner:** `ui-page-designer` / knowledge-ops lane  
**Contract:** [`../contract.md`](../contract.md) revision `design-contract-20261127.2`
**Direction:** Cortex Tabs shell + Signal Deck provenance/activity discipline  
**Fixture:** synthetic Threadloom MCP, version `v2.4.1`, snapshot `sha256:8a41…c2d7`, scope `local / project: noesis`

These files are complete visual mockups. They do not implement routes, service behavior, authorization, durable jobs, preference corrections, Ebb mutations, exports, or application dialogs. The local `mockup.js` harness demonstrates skip focus, output-tab activation, native-dialog lifecycle, focus restoration, and non-destructive dialog semantics only. All IDs, counts, statuses, and timestamps are synthetic/planned. No remote requests, new dependencies, particles.js, canvas, or runtime code are used.

## Artifacts

| Surface ID | Mockup | Coverage | Purpose |
|---|---|---|---|
| `knowledge-ops-index` | [`index.html`](./index.html) | Existing preserved overview | Lane map, fixture ledger, shared focus/status boundary |
| `lore` | [`lore.html`](./lore.html) | Existing preserved Lore review | Generated/authored separation, stale diff, refresh recovery |
| `reverie` | [`reverie.html`](./reverie.html) | Existing preserved Reverie lifecycle | Durable job, stages, waiting, reconnect, typed outputs |
| `forge` | [`forge.html`](./forge.html) | `KO-FORGE-*` | Scoped evidence review and exact Blueprint preview |
| `attunement` | [`attunement.html`](./attunement.html) | `KO-ATT-*` | Explicit/inferred preference correction and conflict recovery |
| `ebb` | [`ebb.html`](./ebb.html) | `KO-EBB-*` | Activation states, reversible revival, explicit forgetting boundary |
| `shared-dialogs` | [`dialogs.html`](./dialogs.html) | `KO-DLG-*` | Info, relationship, confirmation, conflict, palette, pairing patterns |
| `mockup.js` | Local skip-focus, Reverie tab, and dialog lifecycle harness; no service actions |
| handoff matrix | [`coverage.json`](./coverage.json) | Exact state × viewport records; implementation remains unverified |
| shared system | [`styles.css`](./styles.css) | Repaired shared shell tokens, light/dark/system modes, forced-colors rules, focus/status primitives, and responsive controls |

## State and viewport coverage

Every new page includes a visible state strip, state specimens, interaction notes, selected-context/provenance inspector, and behavior notes for `1440px`, `390px`, and `320px`. The desktop contract also applies at `900–1260px` through the shared stylesheet's two-column breakpoint.

### Forge (`KO-FORGE`)

- `KO-FORGE-EMPTY`: no attributable findings; zero versus unknown explained.
- `KO-FORGE-LOADED`: selected resource/version/scope pinned; supported findings and attribution.
- `KO-FORGE-PARTIAL`: included/omitted counts, continuation, and unknown-not-zero wording.
- `KO-FORGE-PREVIEW`: exact Markdown preview with evidence, limitations, and no-target-mutation status.
- `KO-FORGE-DREAM-QUEUED`: durable job ID; queued is not running/completed.
- `KO-FORGE-EXPORT-SUCCESS`: export-ready status and scope boundary.
- `KO-FORGE-ERROR`: provider coverage change; no export written.
- `KO-FORGE-RECOVERY`: local retry preserving resource, cutoff, scope, and version.
- Viewports: `desktop-1440`, `desktop-900-1260`, `narrow-390`, `reflow-320` (all states; CSS reflow notes in `#responsive`).

### Attunement (`KO-ATT`)

- `KO-ATT-EMPTY`: no candidates; empty does not mean unknown.
- `KO-ATT-LIST`: explicit and inferred preferences shown separately.
- `KO-ATT-CORRECTING`: local draft retains preference ID, episodes, scope, and context.
- `KO-ATT-SUCCESS`: correction revision and changed application scope reported.
- `KO-ATT-CONFLICT`: expected/current revision mismatch; compare and keep-draft options.
- `KO-ATT-ERROR`: unavailable preference service; no revision written.
- `KO-ATT-RECOVERY`: retry queued locally; input and scope retained.
- Viewports: `desktop-1440`, `desktop-900-1260`, `narrow-390`, `reflow-320` (all states; CSS reflow notes in `#responsive`).

### Ebb (`KO-EBB`)

- `KO-EBB-EMPTY`: no records returned; zero versus unknown explained.
- `KO-EBB-LIST`: bounded table alternative with record IDs, meanings, and actions.
- `KO-EBB-EVALUATING`: policy check with no fabricated score/denominator.
- `KO-EBB-ACTIVE`, `KO-EBB-QUIET`, `KO-EBB-DORMANT`: activation separated from evidence, validity, and retention.
- `KO-EBB-REVIVING`: reversible revival preview and action.
- `KO-EBB-FORGET-CONFIRM`: explicit deletion separated from fading; derivative impact named.
- `KO-EBB-SUCCESS`: revision recorded; index lag remains visible.
- `KO-EBB-CONFLICT-ERROR`: stale revision prevents overwrite.
- `KO-EBB-RECOVERY`: undo-by-revision and retry language.
- Viewports: `desktop-1440`, `desktop-900-1260`, `narrow-390`, `reflow-320` (all states; CSS reflow notes in `#responsive`).

### Shared dialogs (`KO-DLG`)

- `KO-DLG-CLOSED`: close/back behavior described by every specimen.
- `KO-DLG-OPEN`: exactly one active native `<dialog open>` is shown for destructive confirmation; all other dialog examples are inert, non-modal regions.
- `KO-DLG-EMPTY`: command-palette no-results state.
- `KO-DLG-NO-RESULTS`: query retained with Backspace/Escape recovery; listbox selection and active descendant are named.
- `KO-DLG-ACTION-ERROR`: local alert and no mutation on failure.
- `KO-DLG-RECOVERY`: retry/return options retain invoking context.
- `KO-DLG-PAIRING`: invalid/expired and paired-return feedback with no private data before authorization.
- `KO-DLG-DESTRUCTIVE-CONFIRM`: forgetting confirmation names impact, starts focus on Cancel, keeps the background inert, and restores focus to the invoking control in planned implementation.
- Viewports: `desktop-1440`, `desktop-900-1260`, `narrow-390`, `reflow-320` (all specimens; responsive notes in `#behavior`).

## Interaction and accessibility intent

- DOM order: skip link → primary navigation → selected context → section rail → heading/actions/content → inspector.
- Primary shell links are semantic navigation links with `aria-current="page"` on the active surface; Atlas points to the Core Atlas surface, while selected resource/version/scope remains visible in this lane.
- Attunement, Ebb, and shared-dialog examples are secondary surfaces; their Observatory tab remains the active parent while their section rail identifies the exact surface.
- Important controls are at least 44px high. At `320px`, action groups, status actions, top actions, and rail links become full width; long IDs/hashes wrap.
- Tabs may scroll horizontally on narrow widths; the page itself does not horizontally scroll.
- Local async regions use `role="status"`; actionable failures use `role="alert"`. No knowledge-ops feedback is routed through pairing status.
- Reverie output tabs use `aria-controls`, roving `tabindex`, selected state, labelled tabpanels, and hidden inactive panels. Tab activation preserves job ID, scope, and event cursor.
- Focus remains visible, tab changes preserve selected scope and drafts, and passive updates do not steal focus.
- The local harness now demonstrates one active native dialog at a time, inert background, contained Tab order, destructive Escape/backdrop protection, Cancel/Close focus restoration, and no mutation from static confirmation. Application dialog behavior remains unverified.
- All repeated record actions expose row-specific accessible names, including Ebb inspection/revival controls.
- Light, dark, and system roots share markup and semantic tokens. Forced-colors rules use system colors while preserving status words, borders, focus, and list alternatives.
- Reduced motion disables heartbeat/transitions while retaining state words, omissions, stage meaning, and list/table alternatives.
- Screen-reader, keyboard-only, contrast across all states, authenticated behavior, and full WCAG conformance remain later verification work; forced-colors representative capture is recorded below.

## Visual evidence

Captures are concept evidence only. They do not prove application QA, service behavior, WCAG conformance, or user approval.

Fresh local Chromium captures after D-002/D-003/D-004/D-005/D-006/D-010 repairs:

- Shared shell: [`captures/index-1440-repair-v2.png`](./captures/index-1440-repair-v2.png), [`captures/index-1024-repair-v2.png`](./captures/index-1024-repair-v2.png), [`captures/index-390-repair-v2.png`](./captures/index-390-repair-v2.png), [`captures/index-320-repair-v2.png`](./captures/index-320-repair-v2.png)
- Dialogs and focus contract: [`captures/dialogs-1440-repair-v2.png`](./captures/dialogs-1440-repair-v2.png), [`captures/dialogs-1024-repair-v2.png`](./captures/dialogs-1024-repair-v2.png), [`captures/dialogs-390-repair-v2.png`](./captures/dialogs-390-repair-v2.png), [`captures/dialogs-320-repair-v2.png`](./captures/dialogs-320-repair-v2.png)
- Reverie output tabpanels: [`captures/reverie-1440-repair-v2.png`](./captures/reverie-1440-repair-v2.png), [`captures/reverie-1024-repair-v2.png`](./captures/reverie-1024-repair-v2.png), [`captures/reverie-390-repair-v2.png`](./captures/reverie-390-repair-v2.png), [`captures/reverie-320-repair-v2.png`](./captures/reverie-320-repair-v2.png)
- Lore: [`captures/lore-1440-repair-v2.png`](./captures/lore-1440-repair-v2.png), [`captures/lore-390-repair-v2.png`](./captures/lore-390-repair-v2.png), [`captures/lore-320-repair-v2.png`](./captures/lore-320-repair-v2.png)
- Forge: [`captures/forge-1440-repair-v2.png`](./captures/forge-1440-repair-v2.png), [`captures/forge-390-repair-v2.png`](./captures/forge-390-repair-v2.png), [`captures/forge-320-repair-v2.png`](./captures/forge-320-repair-v2.png)
- Attunement: [`captures/attunement-1440-repair-v2.png`](./captures/attunement-1440-repair-v2.png), [`captures/attunement-390-repair-v2.png`](./captures/attunement-390-repair-v2.png), [`captures/attunement-320-repair-v2.png`](./captures/attunement-320-repair-v2.png)
- Ebb: [`captures/ebb-1440-repair-v2.png`](./captures/ebb-1440-repair-v2.png), [`captures/ebb-390-repair-v2.png`](./captures/ebb-390-repair-v2.png), [`captures/ebb-320-repair-v2.png`](./captures/ebb-320-repair-v2.png)

Capture method: local Chromium via `playwright_fast capture`, `file://` URLs, full-page screenshots at viewport widths `1440`, `1024` (representative `900–1260`), `390`, and `320`, height `900`. All fresh captures returned `CAPTURE_COMPLETE` with `pageErrors: []`; `qaStatus` remained `NOT_RUN`.
Overflow measurement after the final CSS repair: all 28 page × viewport combinations (`7` surfaces × `1440`, `1024`, `390`, `320`) reported `document.documentElement.scrollWidth === innerWidth` and `document.body.scrollWidth === innerWidth`.
Browser spot-checks: every fresh surface measured `smallestImportantControlHeight >= 44px`; no sampled control fell below 44px. Dialogs measured `aria-modal=true: 1`, `dialog[open]: 1`, and inert background regions. Reverie measured five output tabs with matching `aria-controls`/tabpanel IDs and one selected, sequentially focusable tab.

Fresh captures visually show system-light fallback because the host prefers light. Explicit light/dark/system token selectors and `@media (forced-colors: active)` rules are present in `styles.css`; broader assistive-technology and WCAG conformance remain unverified.
Forced-colors captures: [`captures/index-390-forced-v2.png`](./captures/index-390-forced-v2.png), [`captures/dialogs-390-forced-v2.png`](./captures/dialogs-390-forced-v2.png), [`captures/reverie-390-forced-v2.png`](./captures/reverie-390-forced-v2.png), and fresh [`captures/reverie-390-forced-v4.png`](./captures/reverie-390-forced-v4.png). Direct Chromium emulation reported `forced-colors: active`, `prefers-reduced-motion: reduce`, and `pageErrors: []`; this remains design evidence, not WCAG conformance.

The outer `design/index.html` remains outside this lane's ownership. Its existing narrow iframe/grid evidence is not restated as Knowledge Ops evidence.

Changes in this repair include the shared navigation links/current-state markers, root theme-mode attributes, local status/dialog semantics, Ebb row names, Reverie output tab wiring, forced-colors/light-mode CSS, and 320px control reflow. No application files, global design files, routes, or runtime behavior were changed.

## Repair evidence

- Shared-shell adapter boundary is intentional: Knowledge Ops uses its denser task-panel geometry for Lore/Reverie/Forge and secondary correction surfaces. Core Atlas retains the larger HUD/brain treatment; Extra Surfaces retains trace/command geometry. All lanes now expose the same `data-ui-color-mode="system|light|dark"` semantics, focusable `#main-content`, 44px controls, local status/alert roles, and forced-color intent.
- Local harness behavior: Reverie output tabs activate by pointer and by `ArrowLeft`/`ArrowRight`/`Home`/`End` focus movement plus `Enter`/`Space` activation. Dialog Escape/backdrop never mutates the destructive specimen; Cancel closes and restores `#forget-open`.
- Distinct index thumbnails now exist at `captures/lore-1440-repair-v3.png` and `captures/reverie-1440-repair-v3.png`; both receipts returned `CAPTURE_COMPLETE` with `pageErrors: []`. The outer index remains outside this lane's ownership and must point to these two paths.
- Fresh visual captures: `captures/reverie-1024-repair-v4.png`, `captures/dialogs-1024-repair-v4.png`, and forced-color `captures/reverie-390-forced-v4.png`. Chromium `159.0.8154.6`; capture receipts returned `CAPTURE_COMPLETE`, `pageErrors: []`, and `qaStatus: NOT_RUN`.
- Browser spot-checks covered tab selection/hidden panels, focus movement, dialog close/reopen, and local status semantics. This is design evidence only; application implementation, screen-reader output, and WCAG conformance remain unverified.
