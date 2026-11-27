# Observatory UX assessment lane

## Scope, method, and evidence

**Scope.** Read-only assessment of the current Observatory route, pairing, capture/recall, Reverie, Atlas, Attunement, Ebb, Forge, and Lore. No application files or shared run records changed.

**Methods.**

- Read `AGENTS.md`, `docs/01-PRODUCT-SPEC.md`, `docs/02-ARCHITECTURE.md`, `docs/07-DASHBOARD-AND-LORE.md`, `docs/10-VALIDATION-AND-EVALUATION.md`, `package.json`, `src/server.mjs`, `test/observatory.test.mjs`, `ui-design-studio.json`, and Studio references.
- Inspected source markup/CSS at `src/server.mjs:19-72`, client handlers at `src/server.mjs:48-69`, and service routes at `src/server.mjs:74-303`.
- Inspected baseline provenance at `baseline/README.md:1-15`, `baseline/observatory-desktop.png`, and `baseline/observatory-handheld.png`.
- Read the saved test artifact `baseline/npm-test.log:2-93`; did not run tests, builds, lint, or formatters.

**Evidence labels.** `[Observed]` is directly established by source or supplied capture. `[Measured]` is a recorded artifact measurement. `[Inferred]` is usability impact/recommendation from observed evidence. `[Unverified]` is required evidence not present. This is expert review, not a user study; no user success rates, quotations, or accessibility certification are claimed.

**Constraints to preserve.** Pairing gates private reads and mutations; same-origin policy, scope, identifiers, revisions, provenance, budgets, durable jobs, hypothetical dream output, and authored/generated Lore separation remain authoritative. The target is WCAG 2.2 AA; 44px is the configured preferred touch size, not the WCAG minimum. No remote runtime requests or added runtime dependencies are allowed. Offline product operation is not required, but LAN/network failure and recovery matter.

## Baseline and strengths

- `[Measured]` Supplied Chromium 159 capture rendered the unpaired route without page errors at 1440px (`1440x2623`) and 390px (`390x3734`); evidence is visual only (`baseline/README.md:5-15`).
- `[Observed]` The UI is one server-rendered `/` HTML document with inline CSS and browser JavaScript (`src/server.mjs:19-72`). `body` is capped at 960px, `main` is a single grid, and sections share the same border/card treatment (`src/server.mjs:26-31`).
- `[Observed]` The desktop capture centers a narrow single-column page with large unused side margins. Pairing, capture, recall, Reverie, Atlas, Attunement, Ebb, Forge, and Lore appear as equal-weight stacked cards. The handheld capture is a very tall stack with controls wrapping within cards.
- `[Observed]` Static sections have headings and `aria-labelledby`; most static form fields have explicit labels. Pairing has `inputmode="numeric"`, `autocomplete="one-time-code"`, `required`, and an eight-digit pattern (`src/server.mjs:37`). Reverie groups modes in a `fieldset` with a `legend` (`src/server.mjs:40`).
- `[Observed]` A visible-focus rule exists (`:focus-visible`, 3px outline) and several sections have local `role="status"` or `aria-live` regions (`src/server.mjs:30`, `37-45`). This is a useful base, but rendered contrast, keyboard behavior, and announcements remain unverified.
- `[Observed]` Saved service tests demonstrate pairing/private-data gating, one-use pairing, Atlas snapshots/history, Attunement correction, Ebb evaluation/revival/forgetting, Reverie queue/run/cancel, Lore persistence, scoped Forge/Blueprint, and Catalyst idempotency (`test/observatory.test.mjs:47-301`). These tests exercise HTTP/service behavior, not browser interaction or visual usability. The saved test artifact reports 81 passing tests (`baseline/npm-test.log:86-93`).

## Inventory and state coverage

The current source inventory is below. `Observed` means visible in the supplied unpaired capture or directly rendered by source. No authenticated browser state was captured.

| ID | Surface / trigger | Source and task | Implemented state visible now | Required or source-supported states not observed |
|---|---|---|---|---|
| `S-01` | Observatory shell, direct address or terminal QR | `/`, header/main/nav and all sections, `src/server.mjs:35-46`; orient, open work, and navigate | Unpaired landing only | Paired empty/populated, loading, partial, error, permission failure, LAN/network failure, recovery; active area and selected scope; desktop multi-pane and handheld back path |
| `S-02` | Pairing, unpaired browser | Pairing card and `/pair` client handler, `src/server.mjs:37`, `50`; enter one-use code without private data | Code-entry card | Invalid, expired, reused, origin-rejected, rate-limited, success, revocation, intended-route return; paired theme/focus behavior |
| `S-03` | Capture and Recall, paired operator | Note form and recall form, `src/server.mjs:38-39`, `51-52`; save observation and inspect bounded recall | Empty forms/results containers | Save success/error, recall loading/empty/results/partial/error/retry; source/revision/coverage explanation; inspect continuation |
| `S-04` | Reverie, paired operator | Level/mode/focus form and run/cancel actions, `src/server.mjs:40`, `53`; queue and operate bounded dream | Form with Consolidate checked; Run/Cancel disabled | Queued, running, heartbeat/known progress, partial, budget exhausted, cancelled, completed, failed, reconnect, resume, output review, applied-change review |
| `S-05` | Atlas, paired operator | Resource load/list/detail and trace, `src/server.mjs:41`, `54`, `61`; browse and inspect resource history | Empty list/detail containers | Loading, empty, list, selected, filtered/partial, unavailable source, error/retry, stable selected snapshot/version, links to Lore/Forge/Lineage |
| `S-06` | Attunement, paired operator | Preference create/load/correct, `src/server.mjs:42`, `55-57`; distinguish explicit/inferred and correct | Empty form/list | Populated explicit/inferred, correction success/conflict/error, counterevidence/context, “only this context,” “not preference,” stop using |
| `S-07` | Ebb, paired operator | Evaluate/revive/forget forms, `src/server.mjs:43`, `58-60`; inspect fading and explicit forgetting | Empty forms | Active/quiet/dormant, score explanation, evaluate/revive success/error, destructive confirmation, affected-derivative report, recovery/undo or compensating revision |
| `S-08` | Forge, paired operator | Resource/version/privacy/delta form and Blueprint/focused-dream actions, `src/server.mjs:44`, `66-69`; inspect and export scoped improvement | Empty form and `<pre>` | Loading, loaded, weak evidence/investigation brief, export preview, redacted/standard result, delta cutoff, queued dream, error/retry, scope/version confirmation |
| `S-09` | Lore, paired operator | Resource load, manual edit, refresh, `src/server.mjs:45`, `62-65`; read and correct sourced page | Empty forms/results | Loaded generated/manual sections, stale/conflict, diff, save conflict/error, refresh reconciliation, authored preservation, generated refresh, network recovery |
| `S-10` | Required but not surfaced in current shell | Product shell requires Observatory, Atlas, Lore, Reverie, Forge; Pulse, Chronicle, Lineage and command palette are panels/views (`docs/07-DASHBOARD-AND-LORE.md:9-21`) | No visible Pulse/status dashboard, Lineage view, Chronicle view, or command palette. `h1` is not a navigable Observatory item. | Since-last-visit status, active jobs, recently changed knowledge, processing failures, provenance graph/list alternative, history, searchable actions/records |

`[Unverified]` The source and provisional `coverage.json` enumerate many required states, but only the unpaired state has supplied visual evidence. Required viewport coverage includes at least 320px reflow and 390px handheld; no 320px capture is present.

## Findings

### UX-001 — Primary navigation omits implemented and required work

- **Evidence:** `[Observed]` Primary nav contains only Atlas, Reverie, and Forge (`src/server.mjs:35`). Attunement, Ebb, and Lore are rendered later as sections (`src/server.mjs:42-45`) but have no nav links. Product navigation requires Observatory, Atlas, Lore, Reverie, and Forge; Pulse/Chronicle/Lineage are relevant views (`docs/07-DASHBOARD-AND-LORE.md:9-21`). The desktop and handheld captures show the resulting long stack.
- **Impact:** `[Inferred]` Operators must scan or remember section order. Resource, Lore, job, and evidence tasks lack a stable current-area signal, and required status/history work is undiscoverable.
- **Severity / confidence:** High, P0 / high confidence.
- **Recommendation:** Design an explicit shell with primary navigation, active state, a named Observatory/Pulse landing area, and addressable panels. Keep plain descriptions below branded names. Preserve direct deep links and selected scope.
- **Acceptance test:** From the displayed address, a paired operator can reach every implemented primary surface and the Observatory status view by visible navigation at desktop and 320/390px widths. Current area, selected resource/version/scope, and back path remain visible or recoverable after navigation.

### UX-002 — Atlas does not hand selected context into Lore or Forge

- **Evidence:** `[Observed]` Atlas resource buttons call `showResource`; that function renders only heading, counts, snapshot list, and history text into `atlas-detail` (`src/server.mjs:54`, `61`). Forge and Lore require manually entering a Resource ID (`src/server.mjs:44-45`, `66`, `62`). No visible Atlas-to-Lore/Forge action or selected-resource state exists in the source.
- **Impact:** `[Inferred]` The operator must copy opaque identifiers and re-enter them, increasing wrong-resource/version risk and breaking recognition over recall. The product requires one resource page reused across Atlas, Lore, and Forge and persistent selected scope (`docs/07-DASHBOARD-AND-LORE.md:7`, `21`, `31`).
- **Severity / confidence:** High, P0 / high confidence.
- **Recommendation:** Make resource selection a first-class state. Expose “Open Lore,” “Improve in Forge,” “Inspect lineage,” and history actions from the selected resource; carry resource ID, scope, and selected version through links and back navigation.
- **Acceptance test:** Selecting one synthetic resource in Atlas and opening Lore or Forge carries the same resource identity, scope, and chosen version without retyping. Returning preserves filters and selection.

### UX-003 — Recall and Atlas feedback is written into the pairing status

- **Evidence:** `[Observed]` Recall writes both success and failure to `pair-status` (`src/server.mjs:52`). Atlas load and resource-detail failures also write to `pair-status` (`src/server.mjs:61`). Pairing status is physically in the first card (`src/server.mjs:37`), far from these actions. Note, Reverie, Attunement, Ebb, Forge, and Lore use nearer status elements (`src/server.mjs:51`, `53`, `55-60`, `63-69`).
- **Impact:** `[Inferred]` Sighted and assistive-technology users can miss the result of an action they just invoked. A later recall or Atlas error can overwrite pairing feedback and falsely suggest a pairing problem.
- **Severity / confidence:** High, P0 / high confidence.
- **Recommendation:** Give every asynchronous task a local status and result region. Never reuse pairing status for non-pairing work. Keep status text plain, scoped, and tied to the action heading.
- **Acceptance test:** Trigger recall success/error and Atlas load/detail success/error. Each result is announced in its own region, pairing status remains unchanged, and focus or an explicit result heading makes the response discoverable.

### UX-004 — Async states lack explicit loading, empty, partial, and recovery presentation

- **Evidence:** `[Observed]` Handlers replace lists or text only after a response (`src/server.mjs:52`, `54`, `55`, `61`, `62`, `66`). There is no loading state, `aria-busy`, retry action, empty-state copy, partial-result explanation, or network-recovery path in the markup/handlers. Recall coverage/trace and inspection continuation are available from service tests (`test/observatory.test.mjs:67-79`) but are not presented as structured UI.
- **Impact:** `[Inferred]` A blank list is ambiguous: loading, no matches, denied data, failed request, or not-yet-run. Users cannot tell whether work is safe to retry or whether results are complete.
- **Severity / confidence:** High, P0 / high confidence.
- **Recommendation:** Define reusable loading, empty, filtered-empty, partial/truncated, permission, server/network error, success, and retry states per task. Preserve entered values and expose coverage/truncation in plain language.
- **Acceptance test:** For each async surface, exercise slow response, zero results, partial coverage, 401/403, server error, and recovery. The region states what happened, retains input, provides a safe retry, and does not imply completion for a queued job.

### UX-005 — Dynamic preference controls lose labels and selection semantics

- **Evidence:** `[Observed]` Static preference fields are labeled in the markup (`src/server.mjs:42`), but `loadPreferences` creates each correction `<input>` without an `id` or `<label>`, appending only a generic `Correct` button (`src/server.mjs:55`). Atlas creates resource buttons with text but no selected/current state (`src/server.mjs:61`).
- **Impact:** `[Inferred]` Screen-reader users cannot associate a correction field with its preference. Keyboard users cannot identify which resource is selected after detail loads. Similar repeated controls become ambiguous.
- **Severity / confidence:** High, P1 / high confidence.
- **Recommendation:** Generate accessible names from the preference/resource statement, use fieldsets or grouped articles for repeated controls, expose `aria-current`/selected state, and keep stable IDs.
- **Acceptance test:** Inspect the accessibility tree for a populated preference list and Atlas list. Every input has a unique accessible name tied to its item; every selected resource exposes current state; repeated `Correct` actions identify their target.

### UX-006 — Focus behavior is declared only for outline styling, not task transitions

- **Evidence:** `[Observed]` Source defines `:focus-visible` styling (`src/server.mjs:30`) and uses native controls, but handlers do not move focus to newly rendered results, set busy state, restore focus after updates, or mark the active resource/job (`src/server.mjs:48-69`).
- **Impact:** `[Inferred]` After a load, save, error, or dynamic list replacement, keyboard users remain at a control with no clear place to continue. Screen-reader users may not hear newly inserted content, especially where the result container lacks `aria-live` (Recall and most list outputs).
- **Severity / confidence:** Medium, P1 / medium-high confidence. Missing behavior is source-observed; actual keyboard impact is unverified.
- **Recommendation:** Define focus order and restoration for every panel. Use native controls where possible, `aria-busy` during requests, appropriately scoped live regions, and a visible result heading/summary. Do not steal focus for passive updates.
- **Acceptance test:** Complete capture, recall, Atlas selection, preference correction, dream run/cancel, Lore save/refresh, and Forge export with keyboard only. Focus remains visible, logical, and not lost; result/status changes are announced once; focus returns predictably after navigation or panel replacement.

### UX-007 — Handheld layout is natural wrapping, not deliberate task reflow

- **Evidence:** `[Observed]` CSS has one max-width/grid rule and no responsive rules (`src/server.mjs:27-29`). The 390px capture shows inline labels, inputs, and adjacent actions wrapping into dense rows, especially Ebb, Forge, and Lore (`baseline/observatory-handheld.png`). The full page is 3734px tall (`baseline/README.md:14`).
- **Impact:** `[Inferred]` Long workflows require repeated scrolling and make label/control/action relationships harder to parse. Opaque IDs and destructive actions are difficult to review on a QR-launched handheld browser.
- **Severity / confidence:** High, P1 / high confidence. Exact target dimensions and overflow behavior are not instrumented.
- **Recommendation:** Define deliberate narrow reflow: stacked field groups, persistent selected scope, compact back path, readable long-value treatment, safe action separation, and no reliance on horizontal alignment. Prefer 44px important touch targets; measure rather than infer.
- **Acceptance test:** At 320px and 390px, key journeys have no horizontal overflow, labels remain associated with controls, long IDs can be reviewed/copyable, primary/destructive actions are separated, and selected scope persists through Atlas → Lore/Forge → back.

### UX-008 — Forgetting has no confirmation, impact explanation, or recovery affordance

- **Evidence:** `[Observed]` Ebb exposes a required record ID/reason pair and posts directly to `/api/forget`; the client immediately reports “Forgetting recorded...” (`src/server.mjs:43`, `60`). No confirmation dialog, affected-derivative summary, or recovery action exists in the UI. The product requires explicit deletion handling and derivative coverage explanation (`docs/07-DASHBOARD-AND-LORE.md:39-45`).
- **Impact:** `[Inferred]` An opaque identifier and a single button do not help the operator verify target, scope, or consequences before a potentially irreversible action. Success text can be mistaken for complete deletion when external exports or derivatives have limits.
- **Severity / confidence:** High, P1 / high confidence.
- **Recommendation:** Add a confirmation state naming target, scope, revisions, controlled derivatives, and limits on external copies. Provide cancellation before commit and a clear receipt/compensating-revision path after commit.
- **Acceptance test:** Submit forgetting for a synthetic record. Confirmation names the exact target and affected coverage; cancel performs no mutation; confirm shows controlled derivative status and any unrecallable external-copy limitation; retry is idempotent.

### UX-009 — Reverie lifecycle is not reconnectable from the browser UI

- **Evidence:** `[Observed]` The client stores only `activeDream` in JavaScript memory, enables Run/Cancel after queueing, and renders a compact state/progress/budget line (`src/server.mjs:53`). It does not load a job by ID on page reload, reconnect to a durable cursor, expose resume, or distinguish all completion outcomes. The API and tests support queued, run, completed hypothesis output, and cancelled jobs (`src/server.mjs:74-303`; `test/observatory.test.mjs:153-179`).
- **Impact:** `[Inferred]` Reloading or losing the handheld browser loses the visible job handle. Operators cannot reliably follow, resume, or inspect durable work even though the service retains it. A `completed/total` line also risks implying precise progress for an indeterminate stage.
- **Severity / confidence:** High, P1 / high confidence.
- **Recommendation:** Make job ID/deep link durable in the shell. Add status refresh/reconnect, honest queued/running/partial/budget-exhausted/cancelled/failed/completed states, supported resume/cancel actions, stage/denominator semantics, outputs separated by epistemic status, and applied-change review.
- **Acceptance test:** Queue a job, reload or reopen its deep link, and verify status and outputs return without duplicate work. Simulate interruption/cancel/failure/budget exhaustion; the UI states the exact outcome and offers only supported recovery.

### UX-010 — Evidence, provenance, and authorship meaning remains too implicit

- **Evidence:** `[Observed]` Recall displays statement plus `record_id@revision`; Atlas displays resource kind/origin, snapshot digest/status, and event count; Reverie displays record type/epistemic status; Lore headings show ownership and stale marker; Forge renders counts or raw Markdown (`src/server.mjs:52`, `54`, `53`, `62`, `66`, `68`). `[Observed]` None of these regions explains source evidence versus derivation, retrieval versus inclusion/application, hypothetical output, or authored versus generated meaning in plain language.
- **Impact:** `[Inferred]` Users can treat a retrieved hit, generated Lore text, dream hypothesis, or summary count as independently validated evidence. This conflicts with product provenance and authorship requirements (`docs/07-DASHBOARD-AND-LORE.md:39-45`, `67-73`; `docs/02-ARCHITECTURE.md:60-63`).
- **Severity / confidence:** High, P1 / high confidence.
- **Recommendation:** Design a stable inspector and semantic badges with plain definitions, source/version links, scope, uncertainty, applicability, revision history, and action consequences. Keep raw IDs available but secondary to meaning.
- **Acceptance test:** Inspect representative Recall, Atlas, Reverie, Lore, and Forge states. Each shows origin/source, revision, scope, uncertainty, and whether content is retrieved, included, applied, hypothetical, authored, generated, stale, or validated. No generated page or dream output is presented as independent proof.

### UX-011 — Pairing failure and return flow are under-specified in the page

- **Evidence:** `[Observed]` The pairing card only says “Enter the short-lived code printed by the local operator,” with one code input and a status paragraph (`src/server.mjs:37`). Browser code displays the API error in that status (`src/server.mjs:50`). Service tests prove private data is denied before pairing and code reuse is rejected (`test/observatory.test.mjs:52-64`), but no browser evidence covers these states.
- **Impact:** `[Inferred]` A user who receives an expired, reused, invalid, or origin-rejected code has no visible explanation of expiry, retry, or revocation, and no source-backed indication that the intended route will be restored after pairing. Product requirements call for those explanations and intended-route return (`docs/07-DASHBOARD-AND-LORE.md:83-87`).
- **Severity / confidence:** Medium, P1 / high confidence.
- **Recommendation:** Make pairing states explicit: code entry, invalid, expired, rate-limited, already used, origin rejected, paired, and revoked. Explain that the page exposes no private memory before pairing, preserve intended deep link safely, and place focus on the next actionable field/status.
- **Acceptance test:** Exercise invalid, expired/reused, origin-rejected, successful, and revoked sessions in a browser fixture. Each state has local plain-language feedback, no private data leaks, retry preserves safe context, and success returns to the intended surface.

### UX-012 — Lore promises diffs but the rendered flow drops the returned diff

- **Evidence:** `[Observed]` Lore copy promises “inspect diffs” (`src/server.mjs:45`). The manual-save request receives `{ page, diff }` but calls `renderLore(body.page)` and only renders page sections; the refresh path likewise renders `body.page` without a diff view (`src/server.mjs:64-65`).
- **Impact:** `[Inferred]` Operators cannot verify what changed, distinguish authored edits from generated refresh, or review stale/conflict consequences before trusting the result. This undermines the required source correction/reconciliation flow (`docs/07-DASHBOARD-AND-LORE.md:67-73`).
- **Severity / confidence:** Medium, P1 / high confidence.
- **Recommendation:** Make save/refresh response a review step: show changed sections, ownership, stale/conflict status, source revisions, and authored-block preservation. Keep the page readable after review and expose a stable revision link.
- **Acceptance test:** Edit an authored section, refresh generated content, and change source evidence in a fixture. The UI shows a scoped diff/reconciliation summary, preserves authored content, marks affected generated claims stale/conflicted, and exposes the new revision.

## Reconciliation with provisional UI-001–UI-007

- `UI-001` is supported and sharpened by `UX-001`/`UX-002`: the source confirms three nav anchors for nine visible sections, plus no visible resource handoff.
- `UI-002` is supported by `UX-005`/`UX-007`/`UX-008`. The 44px statement should remain a preferred-size policy; exact control dimensions were not measured, so the screenshot alone must not be treated as a WCAG target-size failure.
- `UI-003` is directly confirmed by `UX-003`, with exact cross-region writes at `src/server.mjs:52` and `61`. Other sections do have local status elements, so the finding is leakage/inconsistency, not absence of all status regions.
- `UI-004` is supported by `UX-010`; some raw provenance fields and an epistemic-status token are present. The gap is plain-language meaning, stable inspection, and separation of retrieval/inclusion/application, not total absence of metadata.
- `UI-005` is supported by `UX-007`. The supplied capture establishes dense wrapping and a tall page, but horizontal overflow, exact target sizes, and 320px behavior remain unverified.
- `UI-006` is source-backed (`src/server.mjs:25-31`) but is primarily a theme/lifecycle concern. Preserve it as a handoff to the theme/performance lane; this UX lane does not assess or modify theme packaging.
- `UI-007` must remain a verification gap, not a claimed accessibility defect. Supplied screenshots and source inspection do not establish keyboard-only, screen-reader, contrast, reduced-motion, forced-color, authenticated browser, or second-device results.

## Recommended next phase

Build the Plan phase around one representative, evidence-sensitive story: **pair safely → select a resource in Atlas → inspect its provenance → open Lore or Forge with scope/version retained → recover from a failed or interrupted request**. Compare directions using the same story at desktop and handheld widths. Freeze the shell/navigation, selected-context, local-status, and inspector patterns before cosmetic styling; carry all inventory states above into later mockups.

## Unanswered design questions

1. Which task group is the true first priority after pairing: status/Pulse, resource inspection, Reverie operations, or correction/export?
2. Is the default post-pairing destination the Observatory/Pulse status view, the last intended deep link, or a selected-resource context?
3. Which resource actions must be one-click from Atlas (Lore, Forge, Lineage, Chronicle, export), and which may stay in an inspector?
4. Which Reverie states support resume versus inspect-only recovery after reload, cancellation, or network loss?
5. Must the guided design guarantee 320px operation in addition to the recorded 390px handheld baseline? WCAG reflow makes 320px a required validation case, but no runtime evidence exists yet.

## Coverage gaps and handoff

- `[Unverified]` No authenticated browser interaction, keyboard-only walkthrough, screen-reader/accessibility-tree check, contrast check, reduced-motion/forced-color check, 320px capture, network failure/recovery run, second-device LAN check, performance measurement, or real user study was performed.
- `[Unverified]` The supplied visual baseline covers only the unpaired landing surface. It does not establish paired, populated, loading, error, partial, destructive, or recovery presentation.
- `[Observed]` Existing saved service tests are useful behavioral evidence, but browser UI acceptance still needs separate checks (`docs/10-VALIDATION-AND-EVALUATION.md:55-63`).
- **Next action for Main:** merge these UX findings and the expanded inventory into the shared assessment artifacts, then request only the guided decisions that change Plan direction or task priority. No application change is recommended from this lane before that decision.
