# Independent Design review — final 4

- **Scope:** Current Design mockups, global/lane coverage, outer index, current captures, run records, and prior Design findings.
- **Contract:** `design-contract-20261127.2`.
- **Reviewer:** `DesignReviewFinal4`. Separate review task; I did not author the reviewed mockups. The author/reviewer model is the same current session model, but task and assessment remain independent.
- **Evidence boundary:** Design artifacts only. This review does not approve application behavior, service/API binding, authorization, WCAG conformance, performance, offline/network recovery, second-device access, or user approval.

## Verdict

**REQUEST CHANGES — Design Gate D is not yet ready for user approval.**

D-016 and D-017 are closed in the current artifact set. Current coverage, published paths, thumbnail dimensions, and outer-index skip-focus intent now reconcile. Two record-level blockers remain:

1. **Plan approval is stale.** `plan/selection.md:69` says the scope refinement supersedes the earlier approval digest until an updated digest is recorded. The current records do not show explicit user reapproval of the refined Plan inputs.
2. **The Design contract contains stale coverage wording.** `design/contract.md:597` still says the existing `coverage.json` is an assessment baseline with `inventoryComplete: false`, while the current global record is `inventoryComplete: true`. Reconcile or explicitly label that historical prerequisite before approval.

This review does not create either Plan reapproval or Design approval. After the two record issues are reconciled, user approval remains a separate decision.

## Current evidence

### Coverage and evidence paths

- `design/coverage.json` parses as schema `1.1`, contract `design-contract-20261127.2`, status `design-rendered-not-application-qa`, and `inventoryComplete: true`.
- It declares 16 families, 512 family state×viewport cases, 7 overlay groups, 28 overlay cases, and viewports `desktop-1440`, `desktop-900-1260`, `narrow-390`, and `reflow-320`.
- `design/capture-recall/coverage.json` contains 32 exact Capture/Recall cases across eight states and four viewports. Its theme evidence records system, light, and dark previews; forced-colors remains explicitly `unverified`.
- A current path check inspected 1,644 global case/evidence references and found no missing referenced artifact. The run-relative `design/contract.md:619` entry is a line locator, not a missing file.

### D-016 recheck — closed

- `design/index.html` now references `knowledge-ops/captures/attunement-1440-repair-v2.png` for the outer Attunement card.
- The file exists and has nonzero PNG dimensions (`1440×3102`). The prior missing `...repair-v3.png` reference is gone.
- The outer index has 14 thumbnail images; all have nonzero dimensions. It has 15 `.html` links; every target exists.

### D-017 recheck — closed

- `docs/design/runs/20261127T030405478904Z-working-title/.design-status.json` is absent.
- Current `progress.json` contains no obsolete concept-stage inventory, zero-mockup, or zero-verification fields. Its current next action is `Await refreshed Plan and Design approval from user`; its blocker is the documented application/runtime/WCAG evidence deferral.
- `run.json` remains honestly `phase: design`, `status: pending`, with project context resolved and offline applicability `not-required`.

### Outer index and skip-focus intent

- Source inspection confirms `<a href="#main">Skip to mockups</a>`, `<main id="main" tabindex="-1">`, and a click handler that focuses `#main` on the next animation frame.
- All 15 outer-index HTML links resolve. The repaired Attunement link and all 14 thumbnails resolve locally.
- Fresh isolated Chromium capture completed at 390px: invocation `1c15a48b-a50c-4bce-9dab-b918bf82863e`, Chromium `159.0.8154.6`, title `NOESIS Design mockup index`, `pageErrors: []`, `qaStatus: NOT_RUN`, screenshot `/tmp/noesis-design-index-final4-390.png`. This is visual evidence only; it is not application QA or approval.

## Prior finding disposition

| ID | Result | Current condition |
|---|---|---|
| D-001 | **PASS — coverage artifacts** | Global inventory is complete and Capture/Recall is represented; path scan has no missing evidence. Record issues are listed above. |
| D-002 | **PASS — mockup navigation** | Current lane links and outer-index destinations resolve; application routing remains unverified. |
| D-003 | **PASS — mockup dialog harness** | Prior modal, inert-background, escape/backdrop, cancel, and focus-restoration evidence remains valid for mockups. |
| D-004 | **PASS — mockup interactions** | Prior Reverie keyboard activation and local pairing alert/status evidence remains valid. |
| D-005 | **PASS intent / conformance unverified** | Current mode and forced-color intent remains documented; Capture/Recall records system/light/dark previews, while forced-colors is explicitly unverified. |
| D-006 | **PASS — measured mockup matrix** | Prior 17-page × four-width inspection found no page overflow and no sampled important control below 44px. |
| D-007 | **PASS — outer index** | Width/skip behavior remains bounded, and the broken Attunement thumbnail is repaired. |
| D-008 | **PASS — shown controls** | Theme-control labels and intentional Knowledge Ops omission remain documented. |
| D-009 | **PASS** | Decorative graphics retain text/list alternatives. |
| D-010 | **PASS — repeated actions** | Row-specific accessible names remain present in current mockups. |
| D-011 | **PASS — current Design evidence; runtime unverified** | Current captures and 1024px representatives remain; full accessibility and runtime checks remain open. |
| D-012 | **PASS — non-modal shell pages** | Prior shell skip/focus evidence remains valid; the outer index now has a focusable destination and handler. |
| D-013 | **PASS** | Pairing feedback remains local alert/status evidence with preserved input/context. |
| D-014 | **PASS** | Lore and Reverie use distinct current captures and thumbnail digests. |
| D-015 | **PASS** | Outer index skip target is focusable without adding ordinary tab order. |
| D-016 | **CLOSED** | Attunement outer-index thumbnail now points to the existing v2 capture. |
| D-017 | **CLOSED** | Stale `.design-status.json` is removed and current progress metadata no longer contradicts coverage. |

## Remaining limitations and non-blockers

- `applicationImplementation` remains `unverified`; mockups do not prove live pairing, private-data authorization, same-origin API behavior, LAN/QR reachability, selected-resource handoff, capture/recall mutation, durable job recovery, Lore preservation, Attunement correction, Ebb actions, Chronicle/Lineage projection, or Blueprint export.
- Synthetic Threadloom values, counts, IDs, statuses, nodes, and edges are not live service evidence.
- No screen-reader run, complete WCAG audit, numeric contrast audit across all states, Firefox/WebKit matrix, text scaling/zoom, orientation/safe-area/IME check, field-performance measurement, memory/CPU/GPU measurement, LAN failure/recovery run, or second-device check was run.
- Offline product operation is `not-required` in the resolved project context. LAN network failure/recovery remains unverified.
- No build, test, lint, or formatter command was run, per assignment. This record must not be used as application or release approval.

## Acceptance conditions

1. Reconcile the stale coverage prerequisite wording in `design/contract.md`, or clearly mark it as historical pre-repair context without changing the current coverage claim.
2. Obtain and record explicit user reapproval for the refined Plan inputs and current digest.
3. Re-run the Design Gate D handoff against current bytes. Keep application/runtime/WCAG limitations and the absence of user approval explicit.
