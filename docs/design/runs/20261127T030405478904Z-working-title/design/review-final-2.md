# Independent Design review — final 2

- **Scope:** Current Design mockups, lane handoffs, global coverage, captures, and outer index.
- **Contract:** `design-contract-20261127.2`.
- **Reviewer:** `DesignReviewFinal2`. Separate review lane; I did not author the reviewed mockup files. Model routing is the same current session model as the authors, but this is an independent task and assessment.
- **Evidence boundary:** These are local design artifacts. They do not prove application behavior, service/API binding, authorization, WCAG conformance, performance, offline behavior, or user approval.

## Verdict

**REQUEST CHANGES — Design Gate D remains blocked.**

The repair lanes closed most findings. Current mockups now include Capture/Recall, complete state×viewport case records, working mockup-only tab/dialog interactions, repaired skip focus on shell pages, local pairing alerts, responsive controls, theme CSS intent, and distinct index thumbnails. Gate D is not ready because the global coverage record is contradictory and stale, the outer index omits two published mockups and has a broken skip destination, forced-color/theme evidence is incomplete for Capture/Recall, and no current actor-labelled Design approval exists.

## Current evidence

### Coverage and artifact integrity

- `design/coverage.json` currently contains **16 families, 512 case records, 7 overlay groups / 28 overlay case records**, and all four declared viewports: `desktop-1440`, `desktop-900-1260`, `narrow-390`, and `reflow-320`.
- Every inspected case has `state`, `viewport`, `mockup`, `implementation`, and `qaEvidence`; referenced mockup and capture paths resolved on disk.
- The repaired Capture/Recall handoff contains all 32 exact cases in `design/capture-recall/coverage.json`, plus four local Chromium captures.
- The global record still says `inventoryComplete: false` and still lists the obsolete limitation: “Capture-recall is required by the contract but has no mockup or capture.” This contradicts current bytes and prevents the global record from being trusted as Gate D evidence.
- `design/index.html` thumbnails loaded at 390px and 320px with `document` and `body` widths equal to the viewport. Lore and Reverie thumbnails now have different SHA-256 values.
- The outer index has direct links for 13 HTML targets, but global coverage publishes two additional mockup files with no outer-index link: `core-atlas/inspector.html` and `knowledge-ops/attunement.html`.

### Rendered output and responsive checks

- Direct Chromium inspection used `file://` mockups with Chromium `159.0.8154.6` at `1440`, `1024`, `390`, and `320` CSS pixels: 16 pages × 4 widths.
- All inspected pages loaded. `document.documentElement.scrollWidth` and `document.body.scrollWidth` equaled `innerWidth` in all 64 matrix observations.
- Important buttons, fields, tabs, and rail controls measured at least 44px in the repaired shell lanes. Smaller inline text links and skip-link text were not treated as touch actions.
- Fresh lane receipts report `CAPTURE_COMPLETE`, `pageErrors: []`, and `qaStatus: NOT_RUN`; this is visual concept evidence only.
- The Observatory brain is now a large bounded local SVG HUD. At 1440px it measured 659px wide inside a 685px frame. It visibly contains four named modules, four named nodes, typed edges, a connector hub, known counts, and an indeterminate provider wait. The adjacent text/table alternative remains present.
- Source scan found no runtime `particles.js`, remote asset, hosted font, canvas, graph library, gradient, or new dependency. Raster files are local screenshot thumbnails only; NosisArt reference rasters are not reused as production mockup assets.

### Interaction checks

- Core shell skip link focuses `#main-content` (`tabindex="-1"`) and scrolls it into view.
- Pairing feedback has local `role="alert"` regions for invalid, expired, and unavailable states, plus a local paired-return `role="status"`; code input has a label and error description.
- Reverie output tabs respond to `ArrowRight` and `Enter`; selected state and hidden tabpanel changed from Observations to Speculative ideas. IDs, `aria-controls`, and roving `tabindex` matched.
- Knowledge Ops destructive dialog showed one open native dialog, one `aria-modal="true"`, and inert background regions. Escape and backdrop click kept the destructive dialog open. Cancel closed it and restored focus to `#forget-open`.
- Extra command-palette dialog closed on Escape and restored focus to `#palette-trigger`; contained Tab movement was observed.
- Core theme control cycled `system → light → dark`; Extra Chronicle theme control cycled `system → light`. The four lane stylesheets contain light, system, reduced-motion, and forced-colors rules.
- Reduced-motion emulation matched `prefers-reduced-motion: reduce` and removed active animations on the command-palette page.
- Forced-colors emulation was unavailable in this browser tool. Existing lane forced-color captures are retained as visual evidence only.

## D-001 through D-014 recheck

| ID | Current result | Evidence and remaining condition |
|---|---|---|
| D-001 | **BLOCKED** | Case content is now complete, but global metadata and limitations still claim Capture/Recall is absent, `inventoryComplete` remains false, and the outer index omits `inspector.html` and `attunement.html`. Reconcile the global record and link every published mockup. |
| D-002 | **PASS for current mockups** | Primary destinations load, use semantic links, preserve selected Threadloom/version/snapshot/scope context, and document intentional Core/Knowledge Ops/Extra adapter boundaries. Outer-index omissions remain D-001. |
| D-003 | **PASS for current mockup harness** | One active dialog, inert background, initial safe focus, Escape/backdrop rules, Cancel/Close, focus restoration, and command-palette lifecycle observed. Application dialog behavior remains unverified. |
| D-004 | **PASS for current mockup harness** | Reverie tabs activate by keyboard and pointer; local status/alert regions are present; pairing feedback is no longer routed to unrelated status. Application behavior remains unverified. |
| D-005 | **PARTIAL / BLOCKED** | Core, Knowledge Ops, and Extra contain mode and forced-color intent and representative forced-color captures. Capture/Recall is hard-coded to `data-ui-color-mode="dark"`, has no mode-control capture, and has no forced-color capture. Add evidence or document a verified shared-adapter boundary. |
| D-006 | **PASS for measured mockup controls** | 320px stacking and no page overflow observed across the matrix; important controls remain 44px or larger. Preserve these rules in later integration. |
| D-007 | **PASS** | Outer index uses local thumbnails and direct visible links; 390px and 320px reflow stayed at viewport width and all 12 thumbnails loaded. |
| D-008 | **PASS on tested controls** | Core and Extra theme controls changed mode, label, and accessible next-action name. Knowledge Ops intentionally exposes no inert theme control; its root/CSS mode intent remains static. |
| D-009 | **PASS** | Brain, pipeline, Atlas, and relationship SVG images are decorative duplicates with empty `alt` and `aria-hidden`; readable text/list alternatives remain. |
| D-010 | **PASS** | Repeated Inspect, Revive, and related actions expose record- or operation-specific accessible names. |
| D-011 | **PASS for visual/reflow evidence** | Core, Knowledge Ops, Extra, and Capture/Recall have current local Chromium captures, including 1024px representatives. Full keyboard traversal, screen reader output, and application behavior remain unverified. |
| D-012 | **PASS on shell pages; new index defect** | Core, Knowledge Ops, Extra, and Capture/Recall shell pages focus their main target. The outer `design/index.html` skip link leaves `document.activeElement` as `BODY`; see D-015. |
| D-013 | **PASS** | Pairing invalid/expired/unavailable specimens now use local alert semantics with preserved code/context intent. Runtime pairing remains unverified. |
| D-014 | **PASS** | Lore and Reverie now use distinct repair captures and distinct index thumbnail digests. |

## Remaining blockers and acceptance criteria

### D-001 — stale global coverage and incomplete outer index

**Observed:** `design/coverage.json` has the repaired 16-family/512-case/28-overlay content, but `inventoryComplete: false` and an obsolete Capture/Recall-missing limitation. `design/index.html` does not link `core-atlas/inspector.html` or `knowledge-ops/attunement.html`.

**Accept when:** Update global coverage status/limitations to match current artifacts without relabelling application implementation as verified; retain all exact case and overlay records; add direct outer-index links and honest thumbnails/labels for Inspector and Attunement; recheck every published mockup link.

### D-005 — incomplete color-mode and forced-color evidence

**Observed:** Capture/Recall CSS defines light/system/forced-color selectors, but the page root is `data-ui-color-mode="dark"` and its capture set contains only 1440/1024/390/320 normal captures. No Capture/Recall forced-color capture or mode-switch evidence exists.

**Accept when:** Render and record representative light, dark, system, and forced-color evidence for Capture/Recall, or explicitly document that it reuses a verified shell adapter and link the shared receipts. Do not claim forced-color conformance from CSS alone.

### D-015 — outer index skip destination

**Observed:** At 390px, activating `design/index.html`’s `Skip to mockups` link changed the URL to `#main` but left `document.activeElement` as `BODY`; `main#main` has no focus target or handler.

**Accept when:** Make the destination focusable without ordinary tab-order insertion and move focus to it on activation; verify at 320px and 390px.

### Gate record — current Design approval is absent

`run.json` has no approval records; `.design-status.json` reports `design: pending`, `approvals: 0`, and overall `pending`. The recorded user decisions in `decisions.json` approve the Plan direction only. `design/contract.md` explicitly says the contract is not Design approval and that its revision invalidated downstream approval until refreshed inputs are reviewed.

**Accept when:** After the artifact and coverage repairs above, record a current actor-labelled Design decision against `design-contract-20261127.2`, the refreshed mockups/captures, and this independent review. Do not treat the prior Plan decision or stale run status as Design approval.

## Explicit application/runtime limitations

- `applicationImplementation` remains `unverified`; no application source, route, API handler, service policy, or data model was changed or exercised by this review.
- Static mockups do not prove pairing, private-data authorization, same-origin API policy, LAN/QR behavior, selected-resource handoff, revisions, provenance, budgets, durable job reconnect/cancel/resume, capture/recall, Lore refresh/authored preservation, Attunement correction, Ebb revival/forgetting, Chronicle/Lineage projections, or Blueprint export.
- Synthetic Threadloom values, counts, IDs, timestamps, statuses, nodes, and edges are not live service evidence. Graphics do not establish causality, confidence, progress, or authorization.
- No screen-reader/assistive-technology run, full WCAG audit, numeric contrast audit across states, Firefox/WebKit matrix, text scaling/zoom, safe-area/orientation/IME check, field performance measurement, memory/CPU/GPU measurement, or second-device LAN check was run.
- Offline product operation is `not-required` in resolved project context. LAN network failure/recovery remains unverified and cannot be inferred from file captures.
- Forced-colors captures in lane records are concept evidence; forced-colors browser emulation was unavailable in this review. Reduced-motion intent was spot-checked only.
- No tests, build, lint, or formatter commands were run, per assignment. Do not use this review as application or release approval.
