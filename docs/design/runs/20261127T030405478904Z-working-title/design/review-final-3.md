# Independent Design review — final 3

- **Scope:** Current Design mockups, global/lane coverage, outer index, current captures, run records, and prior reviews.
- **Contract:** `design-contract-20261127.2`.
- **Reviewer:** `DesignReviewFinal3`. Separate review task; I did not author the reviewed mockups. The run uses `openai-codex/gpt-5.6-luna` for both author/reviewer lanes; task and assessment independence is preserved.
- **Evidence boundary:** Design artifacts only. This review does not approve application behavior, service/API binding, authorization, WCAG conformance, performance, offline/network recovery, second-device access, or user approval.

## Verdict

**REQUEST CHANGES — Design Gate D is not satisfied by the current artifact set.**

The previous D-001/D-002/D-003/D-004/D-005/D-006/D-008/D-009/D-010/D-011/D-012/D-013/D-014/D-015 findings are closed or explicitly bounded for mockup evidence. Two current record/integrity blockers remain:

1. The outer index references a nonexistent Attunement thumbnail, so the published index visibly contains a broken preview.
2. `.design-status.json` and `progress.json` still report the pre-repair inventory (`inventoryComplete: false`, zero mockups, and “concept artifacts pending”), contradicting current Design coverage. The current actor-labelled Design approval remains separate and is not fabricated here.

## Current evidence

- `design/coverage.json` parses as `schemaVersion: 1.1`, `inventoryComplete: true`, 16 families, 512 state×viewport cases, 7 overlay groups, 28 overlay cases, and viewports `desktop-1440`, `desktop-900-1260`, `narrow-390`, `reflow-320`. Independent checks found no missing case-domain entries, mockup paths, coverage anchors, or evidence paths.
- All 15 unique global family mockups have direct links in `design/index.html`; overlay families reuse those linked mockups. Capture/Recall has exact 32 case records in `design/capture-recall/coverage.json` plus responsive, system, light, dark, and forced-color-intent artifacts.
- Fresh isolated Chromium `159.0.8154.6` inspection covered 17 lane mockup pages at `1440`, `1024`, `390`, and `320`: no page errors, no document/body overflow, and no sampled button, important link, field, or control below 44px. Modal and non-modal keyboard paths were checked separately.
- Fresh `playwright_fast capture` receipts: invocation `61ec1654-560c-4c61-85cd-91920943f776` for the outer index at 390px and `7001644f-a555-409a-8991-ac0f4b926663` for Capture/Recall light mode at 1024px. Both returned `CAPTURE_COMPLETE`, Chromium 159.0.8154.6, `pageErrors: []`, and `qaStatus: NOT_RUN`. Screenshots are visual evidence, not application QA.
- Fresh direct Chromium media checks matched `forced-colors: active` and `prefers-reduced-motion: reduce` for Core Observatory, Knowledge Ops dialogs, Extra command palette, and Capture/Recall. All four retained status words, local alerts/status regions, and viewport width without page overflow. This is static mockup evidence only.

## Finding disposition

| ID | Result | Evidence and condition |
|---|---|---|
| D-001 | **PASS for coverage artifacts** | Global coverage now has 16 families/512 cases/28 overlay cases, `inventoryComplete: true`, exact Capture/Recall cases, and no obsolete Capture/Recall-missing limitation. Run-record inconsistency is D-017 below. |
| D-002 | **PASS for mockup navigation** | Core/Knowledge Ops/Extra adapter boundaries are documented in lane READMEs; primary links reach real sibling mockups and retain synthetic Threadloom/version/snapshot/scope context. |
| D-003 | **PASS for mockup dialog harness** | Knowledge Ops has one open native dialog, `aria-modal="true"`, inert background, Cancel focus, destructive Escape/backdrop protection, and focus restoration to `#forget-open`. Extra command palette closes on Escape and restores `#palette-trigger`. |
| D-004 | **PASS for mockup interactions** | Reverie pointer activation and `ArrowRight`/`Enter` changed selected tabs and hidden tabpanels. Pairing uses local `role="alert"` for invalid/expired/unavailable and `role="status"` for paired return. |
| D-005 | **PASS for intent/evidence; conformance unverified** | Capture/Recall root uses `data-ui-color-mode="system"`; its control cycles `system → light → dark`; `?mode=light` renders light tokens. Core/Extra controls cycle modes. All lane CSS retains forced-color intent and reduced-motion rules. Forced-color intent remains clearly marked unverified in Capture/Recall records. |
| D-006 | **PASS for measured mockup matrix** | Fresh 17-page × 4-width check found no page overflow and no sampled important control below 44px. |
| D-007 | **PARTIAL — blocked by D-016** | Outer index width and skip behavior pass at 390px/320px, but one preview is broken. |
| D-008 | **PASS for shown controls** | Core and Extra theme controls announce the next mode; Capture/Recall announces the current preview mode and cycles deterministically. Knowledge Ops intentionally shows no inert theme control. |
| D-009 | **PASS** | Brain, pipeline, Atlas, relationship, and Lineage graphics are decorative where text/list alternatives exist; current markup uses hidden duplicate graphics and readable alternatives. |
| D-010 | **PASS for repeated row actions** | Fresh accessible-name inspection found row-specific names such as `Inspect Atlas retry provider wait`, `Inspect deferred extraction review`, and `Inspect record fixture-record-source-001`. Generic non-row `Cancel`/operation controls are not row ambiguity. |
| D-011 | **PASS for current design evidence; runtime checks unverified** | Current lane records include 1024px representatives; fresh Chromium matrix had no errors/overflow. Screen-reader output, full focus traversal, numeric contrast, and application behavior remain unverified. |
| D-012 | **PASS for non-modal shell pages** | Keyboard `Tab` then `Enter` moved focus to `#main-content` on current Core, Knowledge Ops, Extra non-modal, and Capture/Recall pages. Active dialog specimens correctly keep background navigation inert. |
| D-013 | **PASS** | Pairing feedback cards expose local alert/status roles, preserve the code field, and associate invalid feedback through `aria-describedby="pair-help pairing-invalid-copy"`. |
| D-014 | **PASS** | Lore and Reverie use distinct current thumbnail files and SHA-256 values (`80732c5054aa5f320d6b0c6e184db4de1cf18a74c77589b8cdb9f255f2b25da7` vs `ea1b83baacf68ef9a5b421628452ba53d1dc01a0e81095289e19889e345a0be6`). |
| D-015 | **PASS** | Outer `design/index.html` skip link moved focus to `#main` at both 390px and 320px; document/body widths equaled the viewport. |

### D-016 — Medium — Broken Attunement thumbnail in outer index

- **Affected ID:** outer Design index / Attunement preview; D-007.
- **Observed:** `design/index.html:27` references `knowledge-ops/captures/attunement-1440-repair-v3.png`. That file does not exist. Existing files include `attunement-1440-repair.png` and `attunement-1440-repair-v2.png`.
- **Fresh evidence:** Direct local-reference scan found exactly one missing HTML asset reference. Chromium at 390px and 320px reported the image `complete: true, naturalWidth: 0`; the outer index still had 15 direct mockup links. The fresh 390px screenshot shows the Attunement card without its preview.
- **Acceptance:** Point the card at an existing current capture or add the intended verified capture; recapture/check the outer index at 390px and 320px; require every referenced thumbnail to load with nonzero intrinsic dimensions.

### D-017 — Major record-integrity blocker — stale run status after repairs

- **Affected records:** `.design-status.json`, `progress.json`; Design Gate D handoff.
- **Observed:** `.design-status.json` still reports `coverage.required: 74`, `mockups: 0`, `verified: 0`, `inventoryComplete: false`, next action `Compare Signal Deck and Cortex Tabs boards, then request guided concept selection`, and blocker `none; concept artifacts pending`. `progress.json` reports the same obsolete next action/blocker. Current `design/coverage.json` reports 16 families, 512 cases, 28 overlays, and `inventoryComplete: true`.
- **Acceptance:** Refresh the current run/status cache and progress record against the repaired artifact set, while preserving `run.json` pending state and the separate missing user actor-labelled Design approval. Do not invent approval or runtime QA.

## Remaining blockers

- D-016 broken published thumbnail.
- D-017 stale run/status metadata that contradicts current global coverage.
- Actor-labelled Design approval is absent from `decisions.json`/run approvals. This remains a separate user decision and is not supplied by this review.

## Explicit runtime and verification limitations

- `applicationImplementation` remains `unverified`; no application source, route, API handler, service policy, data model, or production theme was changed or exercised.
- Static values are synthetic/planned Threadloom MCP data. They do not establish live records, provenance, authorization, coverage, progress, confidence, causality, or permissions.
- No real pairing, private-data authorization, LAN/QR reachability, same-origin API behavior, selected-resource handoff, capture/recall mutation, durable job reconnect/cancel/resume, Lore refresh/authored preservation, Attunement correction, Ebb revival/forgetting, Chronicle/Lineage projection, or Blueprint export was run.
- Fresh forced-color/reduced-motion checks apply only to four static mockup pages in isolated Chromium. They are not application runtime or WCAG conformance evidence. Existing lane capture receipts remain `qaStatus: NOT_RUN`; Capture/Recall forced-color artifacts are explicitly intent-only.
- No screen-reader/assistive-technology run, full WCAG audit, numeric contrast audit across all states, Firefox/WebKit matrix, text scaling/zoom, orientation/safe-area/IME check, field performance, memory/CPU/GPU measurement, WAN failure/recovery run, or second-device LAN check was run.
- Offline product operation is `not-required` in resolved project context. LAN network failure/recovery remains unverified.
- No build, test, lint, or formatter command was run, per assignment. This record must not be used as application or release approval.
