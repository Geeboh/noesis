# Independent Design review — final

- **Scope:** Current NOESIS Design mockups, all core-atlas, knowledge-ops, extra-surfaces, and outer index artifacts.
- **Contract:** `design-contract-20261127.2`.
- **Reviewer:** `DesignReviewFinal`; separate review lane. I did not author the reviewed mockup files. The run routes author and reviewer to `openai-codex/gpt-5.6-luna`; model sameness does not remove task independence.
- **Evidence boundary:** These are design artifacts. This review does not approve application behavior, service/API binding, authorization, WCAG conformance, performance, offline/network recovery, second-device access, or user approval.

## Verdict

**REQUEST CHANGES — Design Gate D remains blocked.**

The repairs close several previous findings: required Chronicle/Lineage/command-palette artifacts now exist; shell destinations are mostly live; one active dialog and inert background are represented; core retry/status semantics, row labels, duplicate SVG handling, 44px controls, and thumbnail-based index reflow improved. Gate D still fails because `capture-recall` is absent, coverage records are not complete case records, modal and Reverie tab behavior is not wired, theme support is split, and the skip link does not move focus to `main`.

## Prior finding verification

### D-001 — Required Design coverage

**Status: REMAINS BLOCKED — critical.**

- `design/coverage.json` now lists `chronicle`, `lineage`, and `command-palette`, and their handoff matrices exist under `design/extra-surfaces/coverage.json`.
- Required `capture-recall` has no mockup, index entry, coverage family, state inventory, or capture. The contract requires `empty`, `editing`, `submitting`, `success`, `results`, `partial`, `error`, and `recovery`.
- The contract requires stable surface IDs and one record for every applicable state × viewport with `state`, `viewport`, `mockup`, `implementation`, and `qaEvidence` (`design/contract.md:595-635`). Global coverage lists state names and a viewport list, but delegates Lore/Reverie/Forge/Attunement/Ebb/dialog records to prose README files. It does not contain the required per-case records for those families.
- Lore's state strip omits explicit `generated`, `diff`, and `refresh-success` labels even though generated content and a diff appear in the page. The global record says `editing` while the contract names `editing-authored`. Forge uses `preview`/`success` while the contract names `export-preview`/`export-success`.

**Acceptance:** Add a `capture-recall` mockup covering every required state. Reconcile exact contract surface IDs and state names. Put every applicable state × viewport and overlay record in `design/coverage.json` with mockup path, `implementation`, and `qaEvidence`; keep application implementation `unverified`. Add explicit evidence for generated/diff/refresh-success and exact Forge/Lore state names.

### D-002 — Shared shell and destinations

**Status: PARTIAL — major blocker remains.**

- Core primary links now have real destinations and `aria-current`; browser navigation from Observatory reached Observatory, Atlas, Lore, Reverie, and Forge. Selected Threadloom MCP/version/snapshot/scope text remained present on each destination.
- Knowledge Ops links now reach actual sibling pages; the former dead Atlas target is repaired.
- The artifact still has separate shell/token systems (`core-atlas/styles.css`, `knowledge-ops/styles.css`, `extra-surfaces/styles.css`) with visibly different geometry and default color behavior. Core and extra pages open dark; Knowledge Ops opens `system` and rendered light under the host light preference. This is not one coherent shared shell contract in current bytes.
- The outer index links all published families, but Lore and Reverie both use `knowledge-ops/captures/index-1440.png` as their thumbnail. The card labels imply surface-specific previews while the two images are the same overview capture.

**Acceptance:** Unify shell semantics, component geometry, and theme-root behavior across lanes, or document and render an intentional adapter boundary. Use distinct Lore/Reverie thumbnails or label the shared overview honestly. Re-run all primary and rail handoffs with selected context preserved.

### D-003 — Dialog count and semantics

**Status: PARTIAL — major blocker remains.**

- `knowledge-ops/dialogs.html` now has one native `<dialog open aria-modal="true">`; inactive specimens are ordinary inert sections. Fresh DOM inspection found one open dialog, one `aria-modal=true`, 11 inert regions, and autofocus on the destructive dialog's Cancel control.
- `extra-surfaces/command-palette.html` likewise has one open native dialog and an inert background; the search input receives autofocus.
- Behavior is not wired. In Chromium, pressing `Escape` on the command palette left `dialog.open === true`. Clicking `Close` also left it open. On the forgetting dialog, `Escape` and the labelled Cancel button left the dialog open. No focus restoration occurred.
- `<dialog open>` is not opened with `showModal()`, and the static `aria-modal`/manual inert arrangement does not demonstrate a contained modal focus loop or backdrop behavior.

**Acceptance:** Wire one active dialog state at a time. Demonstrate initial safe focus, contained Tab order, Escape rules, backdrop rules, Cancel/Close behavior, and invoking-control focus restoration. Destructive Confirm must not close or mutate on Escape/backdrop. Keep command-palette query/result state and keyboard movement explicit.

### D-004 — Tabs and local status/alert regions

**Status: PARTIAL — major blocker remains.**

- Core primary controls are now semantic links, so they do not falsely claim a cross-document ARIA tab pattern. Core local Observatory/Atlas/Inspector/Relationship status regions use local `role="status"`/`role="alert"` where present.
- Reverie output tabs have matching IDs, `aria-controls`, selected state, roving `tabindex`, and hidden tabpanels in `knowledge-ops/reverie.html`. Fresh DOM inspection confirmed five matching tabs and five tabpanels.
- The output tabs are static. The page has no script. From the selected Observations tab, `ArrowRight` left focus and selection unchanged; clicking Ideas also left `aria-selected="true"` on Observations and kept the Ideas panel hidden.
- `core-atlas/pairing.html` presents invalid/expired/unavailable feedback as cards but does not give the local feedback specimens `role="status"` or `role="alert"`.

**Acceptance:** Implement output-tab activation with ArrowLeft/Right, Home/End, Enter/Space, selected/hidden panel updates, and focus retention, or replace the custom widget with semantic links. Add local status/alert semantics to active pairing feedback and preserve typed code/context on failure.

### D-005 — Light/dark/system and forced colors

**Status: PARTIAL — major blocker remains.**

- Knowledge Ops now contains explicit light/dark/system selectors, `prefers-color-scheme`, reduced-motion, and forced-colors rules. Existing forced-colors captures cover representative Knowledge Ops index/dialog/Reverie states.
- Core CSS has dark base and explicit light selector but no `system` selector or `prefers-color-scheme` rule. Every core page hardcodes `data-ui-color-mode="dark"`.
- Extra surfaces have system CSS, but every page hardcodes dark and their `theme-button` has no script or state change. Fresh click inspection left mode, label, and visible text unchanged. Knowledge Ops has no theme control in its header.
- The current captures therefore do not establish a consistent light/dark/system design across all lanes. Forced-colors CSS exists, but representative forced-colors evidence is not supplied for Core or Extra.

**Acceptance:** Give every lane the same root mode API (`light|dark|system`) and semantic token mapping. Make any shown theme control functional and correctly named, or remove it from static specimens. Render representative light, dark, system, and forced-colors shell/form/status/dialog evidence for each shell adapter. Keep status words/icons/list alternatives in forced colors.

### D-006 — 320px controls and reflow

**Status: FIXED for measured mockup controls.**

- Core CSS raises `.button.small` and inspector links to 44px and stacks important controls at `max-width:400px`.
- Knowledge Ops and Extra CSS stack action groups at 320px and keep form controls at or above 44px.
- Fresh Chromium inspection at 320px found no visible important control below 44px on representative Core, Knowledge Ops, and Extra pages. The only observed sub-44px items were non-action skip/backlink text links in page content; skip links are not touch action controls.
- Fresh DOM measurement found `document.documentElement.scrollWidth === innerWidth` and `document.body.scrollWidth === innerWidth` at 1440, 1024, 390, and 320 for 16 representative pages. Existing lane captures report the same visual intent, with Core's prior metric limitation noted.

**Acceptance:** Retain these rules in any later shared implementation. Confirm focus is not clipped or obscured after integration.

### D-007 — Outer Design index narrow evidence

**Status: FIXED, with thumbnail-quality follow-up under D-002.**

- `design/index.html` now uses local image thumbnails and direct visible links, not iframes.
- Fresh Chromium measurement at 390px and 320px found document/body width equal to viewport width. `index-390-final.png` and `index-320-final.png` show a single readable column with all family cards and links.
- All 11 thumbnails loaded with nonzero intrinsic widths; no page errors were observed.

**Acceptance:** Keep thumbnail/direct-link design. Correct the duplicate Lore/Reverie preview labels or supply distinct captures.

### D-008 — Core theme toggle label

**Status: FIXED on Core.**

- Fresh click inspection changed Core from dark to light with label `Switch to dark theme`, then back to dark with label `Switch to light theme`; visible button text changed accordingly.
- Selected context remained in the DOM. The separate Extra theme control remains inert; see D-005.

### D-009 — Duplicate SVG semantics

**Status: FIXED in reviewed markup.**

- Core brain, pipeline, Atlas relationship, and Relationship field `<img>` graphics use empty `alt` plus `aria-hidden="true"` beside visible text/table alternatives.
- Extra Lineage's inline SVG is inside an `aria-hidden="true"` figure; the relation list carries the readable edge meanings.
- No duplicate graphic was observed as the primary accessible relationship path.

### D-010 — Repeated row action names

**Status: FIXED in reviewed markup.**

- Observatory Inspect buttons expose `Inspect Atlas retry provider wait` and `Inspect deferred extraction review`.
- Ebb Inspect buttons expose record IDs (`Inspect record fixture-record-source-001`, `Inspect record fixture-record-hypothesis-001`).
- Selected-context, inspector, relationship, and revision actions include target context where present.

### D-011 — 900–1260px and interactive evidence

**Status: PARTIAL — major evidence gap remains.**

- Core and Knowledge Ops contain 1024px captures and notes describing the two-column inspector move. Extra-surface coverage has a CSS note but no stored 1024px capture.
- Fresh Chromium loads at 1024px, 390px, and 320px produced no page errors and no DOM width overflow for the measured matrix.
- Fresh interaction checks found the unresolved Reverie tab and dialog failures above. Keyboard-only, screen-reader output, full focus traversal/restoration, numeric contrast across all states, and application behavior remain unverified. The browser tool could not emulate forced colors in this review; existing Knowledge Ops forced-color captures remain visual design evidence only.

**Acceptance:** Capture at least one 900–1260px state for every shell family, then record keyboard/focus/status/dialog/reflow/reduced-motion/forced-colors evidence with exact receipts. Keep screen-reader and unavailable checks explicit rather than converting them to pass.

## New blockers found in current bytes

### D-012 — Major — Skip link does not move focus to main

- **Affected IDs:** every Core, Knowledge Ops, and Extra page with a skip link; keyboard acceptance.
- **Evidence:** Fresh Chromium on `core-atlas/observatory.html`: first Tab focused `Skip to main content` with a 3px focus outline. Pressing Enter left `document.activeElement` as `BODY`, not `#main-content`. `main` has no focus target (`tabindex="-1"` or equivalent).
- **Acceptance:** Make the skip destination focusable without adding it to ordinary tab order, move focus to `#main-content` on activation, and verify the same behavior across all shell adapters.

### D-013 — Major — Pairing feedback has no local live-region semantics

- **Affected IDs:** `pairing`, pairing feedback overlay/state cases.
- **Evidence:** `core-atlas/pairing.html` renders Invalid, Expired, and Unavailable/Error cards, but the feedback specimens are ordinary `<article>` elements without `role="alert"`/`role="status"` or an error association. The contract requires local actionable errors and safe retry, not passive prose cards.
- **Acceptance:** Give the active pairing outcome a labelled local `role="alert"` (or `role="status"` for non-error progress), link the message to the code field where applicable, preserve input, and expose retry/return semantics.

### D-014 — Medium — Index thumbnails misrepresent two surfaces

- **Affected IDs:** outer Design index, `lore`, `reverie`.
- **Evidence:** `design/index.html` uses `knowledge-ops/captures/index-1440.png` for both the Lore card and the Reverie card. Browser inspection confirmed both images load, but they are the same Knowledge Ops overview capture while card text describes different surfaces.
- **Acceptance:** Use `lore-1440-repair-v2.png` and `reverie-1440-repair-v2.png` (or equivalent current captures), or label both cards as the shared overview rather than surface-specific previews.

## Positive evidence

- NosisArt direction is materially represented: the Observatory brain is a large bounded local HUD surface; modules, named nodes, typed edges, hubs, and stage facts are visible; pipeline and relationship graphics have text/table alternatives. No reference raster is reused.
- Static graphics stay deterministic and evidence-bound in the mockups. No runtime `particles.js`, canvas/chart library, remote asset, hosted font, gradient, or new dependency was found in the runtime HTML/CSS/JS/SVG scan. The `canvas` matches are token names or explanatory copy, not `<canvas>` elements.
- Selected context consistently shows Threadloom MCP, version `v2.4.1`, snapshot `sha256:8a41…c2d7`, and project scope across current direct pages. The fixture is visibly labelled synthetic/planned.
- Status copy preserves known versus indeterminate, partial versus empty, source/derived/generated/authored/hypothetical meanings, and scoped retry language. Core retry click changed the local error to `role="status"`, announced `Retry queued`, preserved scope/revision wording, and disabled the retry control.
- Fresh browser matrix: 16 representative file URLs × 4 widths (`1440`, `1024`, `390`, `320`); page-error collection was empty for every load; DOM document/body widths equaled viewport widths for every load. This is visual/DOM concept evidence, not application QA.
- Existing capture receipts remain bounded and honest: Core, Knowledge Ops, and Extra README records mark captures as `CAPTURE_COMPLETE`/`pageErrors: []`/`qaStatus: NOT_RUN` or equivalent visual-only status. Existing application test evidence was not reused as Design approval.

## Unverified and not claimed

- No application files, routes, API handlers, service policy, or runtime behavior were reviewed as implemented by these mockups.
- No real pairing, private-data authorization, capture/recall, resource handoff, durable job reconnect/cancel/resume, Lore refresh, Ebb mutation, forgetting propagation, or Blueprint export was exercised.
- No screen-reader run, full WCAG audit, numeric contrast audit across all states, Firefox/WebKit matrix, offline/network-recovery run, second-device LAN run, field performance measurement, or native platform check was performed.
- Reduced-motion CSS intent was observed in Chromium (`prefers-reduced-motion: reduce` matched and the Knowledge Ops heartbeat animation resolved to `none`); this does not establish application behavior or full motion conformance.
- No tests, build, lint, or formatter commands were run, per assignment.

## Required next acceptance set

1. Add and reconcile `capture-recall`; write complete exact state × viewport and overlay records in global Design coverage.
2. Unify shell/mode behavior across lanes; repair inert/missing theme controls and index thumbnails.
3. Wire actual dialog close/cancel/Escape/focus containment/restoration and command-palette keyboard behavior.
4. Wire Reverie output-tab pointer and keyboard activation, or use semantic links.
5. Repair skip-link focus and pairing local status/alert semantics.
6. Re-capture representative 1024px, light/dark/system, forced-colors, reduced-motion, long-content, and dialog states. Record interactive evidence and preserve all application/runtime claims as unverified.

**Final recommendation:** **REQUEST CHANGES / BLOCKED.** Do not approve Design Gate D, Produce handoff, theme registration, packaging, or release from these bytes.
