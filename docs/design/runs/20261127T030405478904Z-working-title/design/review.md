# Independent Design review

- **Scope:** complete NOESIS Design mockup set
- **Contract:** `design-contract-20261127.2`
- **Review basis:** source requirements, approved Plan direction, contract, raw mockup HTML/CSS/SVG/JS, coverage records, and representative rendered captures
- **Reviewer:** separate review lane; I did not author the mockup files. The run routes all roles, including this reviewer, to `openai-codex/gpt-5.6-luna`; model diversity is unavailable.
- **Evidence boundary:** mockup evidence is not application QA, service behavior, authorization proof, WCAG conformance, performance evidence, or user approval.

## Verdict

**REQUEST CHANGES.** The visual direction is strong, but Design Gate D is blocked by an incomplete required-surface inventory, a split/dead tab shell, contradictory modal semantics, and unclosed accessibility/responsive contract gaps. Do not approve Produce, registration, packaging, or release from this artifact set.

## Findings

### D-001 — Critical — Required Design coverage is incomplete

- **Affected IDs:** `chronicle`, `lineage`, `command-palette`, `lore`, `reverie`, and the run-level Design coverage gate.
- **Evidence:** `design/contract.md:599-619` requires Chronicle plus the listed state families and overlays. `design/coverage.json:1` has no `chronicle` family; its Lore list omits required `loading`, `generated`, `conflict`, `diff`, `refresh-success`, and `recovery` states, and its Reverie list omits required `validation`, `running-known`, `reconnecting`, and `budget-exhausted` states. `design/index.html:18-21` does not link a Chronicle mockup. Lineage is only implied by Inspector/relationship content, not reconciled as its own required surface.
- **Why it matters:** The index calls the set complete, but the contract's full inventory is not mapped. A missing required surface blocks a truthful Design approval.
- **Acceptance:** Add a Chronicle mockup or record an explicit, source-backed applicability exclusion. Map every contract state × applicable viewport and every required overlay, including command palette, in `design/coverage.json` with mockup paths and `qaEvidence`. Keep application implementation marked unverified.

### D-002 — Major — Primary shell is split, and two Core Atlas tabs are dead

- **Affected IDs:** `observatory-shell-pulse`, `atlas`, `lore`, `reverie`, `forge`, `attunement`, `ebb`, `selected-inspector-lineage`, `shared-dialogs`.
- **Evidence:** `core-atlas/observatory.html:16-21` renders Lore and Reverie as tab buttons without `data-href`; `core-atlas/mockup.js:14-20` only navigates tabs that have `data-href`. The same omission appears across Core Atlas pages. Knowledge Ops uses a different link-based shell in `knowledge-ops/index.html:16-23`; its Atlas links target `./index.html#atlas`, while that page has no `id="atlas"`. `core-atlas/styles.css:1-31` and `knowledge-ops/styles.css:1-37` define separate token/shell systems.
- **Why it matters:** Users can select a tab without reaching its surface, and the approved context-preserving tab model is not one coherent system. Cross-lane handoffs and selected-resource state cannot be reviewed end to end.
- **Acceptance:** Use one shared shell contract across all mockups. Make every primary tab and rail link reach the correct surface, with active state, deep-link target, and selected resource/version/scope preserved. Verify keyboard and pointer activation for every tab.

### D-003 — Major — Dialog board exposes multiple simultaneous modal dialogs

- **Affected IDs:** `shared-dialogs`, `command-palette`, `KO-DLG-*`, forgetting/export/correction overlays.
- **Evidence:** `knowledge-ops/dialogs.html:33-88` renders six visible `<article role="dialog" aria-modal="true">` elements at once. They are wrapped in ordinary `.dialog-backdrop` sections, not native `<dialog>` elements or controlled open/closed states. The `dialogs-320-repair.png` capture shows the specimens stacked as page content. The notes at `dialogs.html:29` and `:96` describe future focus behavior, but no interaction implements it.
- **Why it matters:** Multiple `aria-modal="true"` dialogs create contradictory accessibility semantics; background content is not inert, and focus containment, initial focus, Escape behavior, and restoration are not demonstrated.
- **Acceptance:** Show one active dialog per state. Use native `<dialog open>` or a clearly non-modal specimen wrapper for inactive examples. Demonstrate inert background, labelled/described dialog, safe initial focus for destructive confirmation, Escape/backdrop rules, and focus restoration. Keep command-palette listbox focus/selection behavior explicit.

### D-004 — Major — Core tabs and async status regions do not meet the interaction contract

- **Affected IDs:** `observatory-shell-pulse`, `atlas`, `selected-inspector-lineage`, `relationship-field`, `reverie` output tabs.
- **Evidence:** The contract requires `aria-controls` and a corresponding tabpanel (`design/contract.md:208-214`). Core primary tabs in `core-atlas/observatory.html:16-21` have `role="tab"`, `aria-selected`, and `tabindex`, but no `aria-controls` or tabpanel. Reverie output tabs in `knowledge-ops/reverie.html:26` also lack `aria-controls`/tabpanel wiring. Core errors use only `aria-live="polite"` in `observatory.html:92`, `atlas.html:70`, and `inspector.html:43`; they do not expose the required local `role="status"`/`role="alert"` semantics from `design/contract.md:495-503`.
- **Why it matters:** Keyboard selection and announcement behavior cannot be determined from the artifact, and actionable errors may not be announced as errors. The static labels do not prove a usable tab or status pattern.
- **Acceptance:** Either implement the complete tab pattern (`aria-controls`, active tabpanel, hidden inactive panels, roving focus) or use semantic navigation links instead of tab roles. Give each async region a local status/alert live region, preserve input/context, and avoid routing Atlas/Lore/Reverie feedback to pairing status.

### D-005 — Major — Knowledge Ops lane does not implement the shared light/forced-colors theme contract

- **Affected IDs:** all `knowledge-ops/*` surfaces, especially `shared-dialogs` and `command-palette`.
- **Evidence:** Every Knowledge Ops page uses `<html data-mode="dark">` (`knowledge-ops/index.html:2`, `lore.html:2`, `reverie.html:2`, `forge.html:2`, `attunement.html:2`, `ebb.html:2`, `dialogs.html:2`). `knowledge-ops/styles.css:1-37` contains only dark palette values; its only color-mode rule at `:204-205` responds to `data-mode="system"`, which no page sets. There is no `@media (forced-colors: active)` rule. The contract requires light/dark/system and forced-colors behavior at `design/contract.md:176-189`; the lane README explicitly says forced-colors remains unverified.
- **Why it matters:** The two lanes cannot be reviewed as one theme, and status/border/focus behavior in forced colors is unspecified by the actual artifact. A note describing future behavior is not a rendered state.
- **Acceptance:** Use the shared semantic token/root API on every page, support light/dark/system without markup forks, add forced-colors system colors with status words/icons retained, and provide rendered light and forced-colors evidence for representative shell, form, status, and dialog states.

### D-006 — Major — Core 320px actions are below the contract's touch and reflow target

- **Affected IDs:** `observatory-shell-pulse`, `atlas`, `relationship-field`, `selected-inspector-lineage`, `pairing` at `reflow-320`.
- **Evidence:** `core-atlas/styles.css:90` sets `.button.small` to `min-height:36px`; `:200` sets inspector links to `min-height:40px`. The `max-width:400px` rules at `:293-309` do not make general action groups full width. Core pages use these controls for open-work Inspect, Retry, Next page, Details, and relationship actions (`observatory.html:52-53,92`, `atlas.html:61,67,70`). The `observatory-320.png` and `atlas-320.png` captures show dense inline actions. The contract requires important controls at least 44px and full-width actions at 320px (`design/contract.md:163-165,464-469`).
- **Why it matters:** Important recovery and navigation actions are compressed at the smallest required viewport, despite the approved 44px preference and explicit 320px reflow rule.
- **Acceptance:** At 320px, stack or full-width important action groups, keep every important control at least 44px high, and verify no clipping or obscured focus. Document any deliberate compact exception with an accessible equivalent.

### D-007 — Major — The outer Design index fails its narrow evidence boundary

- **Affected IDs:** Design index and every linked family preview.
- **Evidence:** The lane README records a measured `606px` document/body width for the outer `design/index.html` at both 390px and 320px (`design/knowledge-ops/README.md:99-101`). `design/index-390.png` shows the narrow index with blank iframe preview regions and clipped/hidden overview content. The index source uses iframe previews (`design/index.html:14-21`) and hides overflow in its inline CSS rather than proving a usable reflow.
- **Why it matters:** The required navigable index is itself not a reliable narrow viewport review surface. Hidden overflow can mask unusable preview content, and blank iframe pixels make visual comparison incomplete even though direct page captures exist.
- **Acceptance:** Make the outer index `scrollWidth == innerWidth` at 390px and 320px. Replace unreliable iframe-only previews with local thumbnails or visible direct links, and verify every family remains discoverable and readable at both widths.

### D-008 — Major — Core theme toggle announces the wrong next mode

- **Affected IDs:** shared shell theme control across Core Atlas pages.
- **Evidence:** `core-atlas/mockup.js:4-8` computes `next`, then sets `aria-label` to `Switch to light theme` when `next === 'light'`. After switching from dark to light, the visible button text is `Dark` but the accessible label still says `Switch to light theme`; the target/action wording is inverted on each toggle.
- **Why it matters:** Keyboard and screen-reader users receive an incorrect action name, and the shared theme control cannot be approved as a trustworthy interaction.
- **Acceptance:** Name the target mode, not the current mode: after light is active announce `Switch to dark theme`, and after dark is active announce `Switch to light theme`. Verify both transitions and retained route/context state.

### D-009 — Minor — Relationship graphics duplicate the accessible list without hiding the decorative duplicate

- **Affected IDs:** `atlas`, `relationship-field`.
- **Evidence:** `atlas.html:66` and `relationship.html:35` give the relationship SVG a detailed `alt` while also rendering the same node/edge facts in the adjacent labelled list. The contract says duplicate SVGs should be `aria-hidden` when the list is the accessible alternative (`design/contract.md:357-363,426-435`).
- **Why it matters:** Assistive technology may announce the relationship facts twice, while the intended primary path is unclear.
- **Acceptance:** Mark the duplicate SVG `aria-hidden="true"` and keep the list/table as the named primary path, or remove duplication and make the SVG's alt describe only unique information.

### D-010 — Minor — Repeated action names lack row context

- **Affected IDs:** `observatory-shell-pulse`, `atlas`, `ebb`, `selected-inspector-lineage`.
- **Evidence:** Core open-work rows use repeated `Inspect` controls (`observatory.html:52-53`); Ebb's bounded table uses repeated `Inspect` buttons (`knowledge-ops/ebb.html:38`). No row-specific accessible name is present in the mockup.
- **Why it matters:** A screen-reader user navigating buttons by name cannot distinguish which job/record will open.
- **Acceptance:** Include the durable job/resource/record identifier in each accessible name, or expose a row-scoped link/action whose name includes the target.

### D-011 — Major evidence gap — 900–1260px and interactive accessibility checks are not rendered or run

- **Affected IDs:** all families at `desktop-900-1260`, plus keyboard/focus/reduced-motion/forced-colors cases.
- **Evidence:** Core captures are documented at 1440, 390, and 320 only (`core-atlas/README.md:88-96`); Knowledge Ops captures are documented at the same three widths (`knowledge-ops/README.md:93-101`). The lane records `pageErrors: []`, but `qaStatus: NOT_RUN`; no keyboard-only, screen-reader, contrast, focus, or live-dialog run is recorded. The contract explicitly requires 900–1260 behavior and later verification (`design/contract.md:458-469,639-650`).
- **Why it matters:** The two-column inspector move, tab focus path, modal recovery, reduced motion, and forced-colors behavior remain assertions in notes, not review evidence.
- **Acceptance:** Capture representative shell and long-content/error/dialog states at at least one 900–1260 width. Run the authorized browser checks for keyboard order, focus visibility/restoration, labels/statuses, 320px reflow, reduced motion, and forced colors; retain exact evidence paths and keep unavailable assistive-technology checks explicit.

## Strengths

- The approved Cortex Tabs + Signal Deck direction is recognizable and coherent in the rendered dark surfaces: restrained ink canvas, cyan signal, sparse amber/violet/coral semantics, framed HUD panels, and no stock/watermarked raster imagery.
- Observatory materially enlarges and contains the brain activity surface. The local SVG is static, explicitly synthetic, and paired with a fact table; pipeline stages distinguish known units from provider wait without inventing a percentage (`core-atlas/observatory.html:57-89`, `assets/brain-activity.svg`, `assets/pipeline-activity.svg`).
- Atlas relationships follow the NosisArt concept without copying the reference assets: named modules/nodes, typed edges, a connector hub, deterministic local geometry, visible caps, and a list alternative (`assets/relationship-field.svg`, `atlas.html:64-67`, `relationship.html:35-42`).
- Evidence meaning is unusually well preserved across Inspector, Lore, Reverie, Forge, Attunement, and Ebb: source/derived/generated/authored/hypothetical labels, retrieved/included/applied/validated separation, stale/conflict language, Ebb versus validity/retention, and export no-side-effect boundaries are visible in the mockups.
- Failure and recovery copy generally preserves scope, revision, input, and durable job identity. The fixture is repeatedly labelled synthetic/planned instead of pretending to be live service evidence.
- Recorded visual evidence is useful but bounded: direct Core Atlas captures report `CAPTURE_COMPLETE`, `pageErrors: []`, `qaStatus: NOT_RUN`, and no observed page-level horizontal overflow at 1440/390/320 (`core-atlas/README.md:88-96`). Direct Knowledge Ops captures likewise report empty page-error lists and no direct-page overflow (`knowledge-ops/README.md:93-101`). These are visual observations, not application passes.
- A source scan found no runtime `particles.js`, canvas, remote asset, or gradient dependency in the mockup runtime files. The no-remote/no-new-dependency boundary is respected.

## Checked artifacts

- Project instructions and requirements: `AGENTS.md`, `docs/01-PRODUCT-SPEC.md`, `docs/02-ARCHITECTURE.md`, `docs/07-DASHBOARD-AND-LORE.md`, `docs/10-VALIDATION-AND-EVALUATION.md`, `ui-design-studio.json`.
- Studio references: `project-context.md`, `workflow.md`, `quality-gates.md`, `visual-system.md`, `multi-agent.md`.
- Run records: `brief.md`, `report.md`, `findings.json`, run-level `coverage.json`, `plan/selection.md`, `decisions.json`, `design/contract.md`, `design/nosis-art-reference.md`, `run.json`, `model-routing.md`, and `design/coverage.json`.
- Core Atlas lane: `README.md`, `coverage.json`, `index.html`, `pairing.html`, `observatory.html`, `atlas.html`, `inspector.html`, `relationship.html`, `styles.css`, `mockup.js`, and all three local SVG assets.
- Knowledge Ops lane: `README.md`, `index.html`, `lore.html`, `reverie.html`, `forge.html`, `attunement.html`, `ebb.html`, `dialogs.html`, and `styles.css`.
- Rendered evidence: Core Observatory 1440/390/320, Atlas 1440/320, Relationship 390, Forge 1440/320, Ebb 320, Dialogs 320, outer Design index 390, and recorded forced-colors index capture.

## Limitations

- No application implementation was reviewed as a passing runtime; all lane coverage records correctly mark implementation unverified.
- No authenticated service, pairing, durable job, API, network-recovery, second-device, or real-data behavior was exercised.
- Existing capture receipts report no page errors and direct-page overflow checks, but the checks were visual-only and not re-run in this review.
- Screen-reader output, real forced-colors behavior, contrast ratios across all states, text zoom, orientation, safe-area insets, and on-screen-keyboard behavior remain unverified.
- Synthetic fixture values cannot establish production data binding or prove that graphics will remain evidence-bound.

## Design gate recommendation

**BLOCKED — request changes.** Resolve D-001 through D-008 before Design approval. Resolve D-009 and D-010 before implementation handoff, and close D-011 with recorded browser evidence or explicitly document unavailable checks. Re-review the current bytes after the coverage, shell, modal, theme, status, and 320px changes. Do not treat the existing visual captures, `pageErrors: []`, or application test baseline as a Design or WCAG pass.
