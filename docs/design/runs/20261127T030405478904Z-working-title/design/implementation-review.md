# NOESIS Observatory implementation review

- **Reviewer:** `ImplementationReview` (separate review task; did not author `src/server.mjs`). Same session model as the implementer, so this is task-independent, not model-diverse review.
- **Reviewed source:** current worktree at `dc1a719e88aae6f1905d7e695db2ec22fcc9bb8d`; `src/server.mjs` is modified. The diff changes only that application file (`223` additions, `40` deletions).
- **Contract:** `design-contract-20261127.2` (`docs/design/runs/20261127T030405478904Z-working-title/design/contract.md`).
- **Review boundary:** implementation/runtime review only. This is not release, deployment, user-acceptance, or full WCAG approval.

## Verdict

**REQUEST CHANGES.**

The live shell, pairing gate, tab interaction, selected-resource handoff, theme persistence, responsive width, labels, local status regions, evidence text alternatives, local-only requests, and reduced-motion CSS are substantially implemented. The following contract failures block approval: modal focus leaves the open destructive dialog; required command-palette, Lineage, and Chronicle surfaces are absent; and partial recall can be announced as complete.

## Evidence and method

### Fresh runtime inspection

- Started the current service on `127.0.0.1:17439` with a fresh data directory.
- Exercised the real page in headless Chromium `150.0.0.0` at `390px` and `320px`.
- Paired through the rendered form. Pairing returned `200`; private shell became visible; unpaired pairing panel became hidden.
- Used keyboard tab navigation: `ArrowRight` moved focus to Atlas; `Enter` selected Atlas; `ArrowLeft`/`Enter` returned to Observatory.
- Loaded the real Atlas projection and selected `project:dashboard`; Lore and Forge inherited that ID without retyping.
- Switched the rendered Theme control to light and reloaded. `data-ui-color-mode`, label, and `aria-label` remained light after reload.
- Measured `document.documentElement.scrollWidth === document.body.scrollWidth === innerWidth` at both `390px` and `320px`.
- Measured visible buttons, fields, links, and tabs at `320px`: important controls were `44px` high or larger; tabs were `62px`. Native dream checkboxes measured `20px`, but each is wrapped by a `.choice` label row measuring `44px`.
- No page errors occurred. Requests were local only (`127.0.0.1`); the initial unauthenticated `/api/capabilities` `401` was the expected pairing guard. No remote asset request appeared.
- Captures: `/tmp/omp-sshots-15de6c29eb26bde3.png` (`390px`) and `/tmp/omp-sshots-15de6c2e9de6bde4.png` (`1440px`).
- Reduced-motion emulation was accepted. `prefers-reduced-motion: reduce` was true; computed scroll behavior was `auto`; animation and transition durations were `0s`.

### Supplied evidence accepted as supplied, not rerun

- Focused Observatory tests: `7/7`.
- Full `npm run release:check`: `81` tests plus bootstrap/schema/syntax checks.
- Supplied Chromium `159` smoke: `pageErrors: []`, shell response `74,623` bytes, `390px`/`320px` DOM widths equal viewport, `21` labels, `5` tabs, `9` local status/alert regions, pairing/Atlas/theme smoke passed.

## Findings

### IR-001 — Major — destructive dialog loses focus containment

**Affected IDs:** `forgetting-confirm`, `ebb`, `V-024`.

**Reproduction, fresh Chromium:**

1. Pair the browser.
2. Open Observatory → Activation and forgetting.
3. Enter a record ID and reason, then submit `Forget record`.
4. Dialog opens with `#forget-cancel` focused.
5. Press `Tab` twice.

Observed state sequence:

```text
forget-cancel → forget-confirm → BODY (dialog still open)
```

A further `Shift+Tab` returned to `forget-confirm`, then `forget-cancel`. Cancel restored focus to `#forget-record-id`, and Escape did not mutate or close the dialog.

**Exact evidence:** native dialog markup is `src/server.mjs:220-222`; open/focus/close logic is `src/server.mjs:246`. `document.activeElement` was `BODY` while `#forget-dialog.open === true` after the second forward Tab.

**Why it fails:** the contract requires focus to stay inside a modal dialog while open (`design/contract.md:483-490`). A visible dialog with document-body focus is not a complete keyboard path.

**Acceptance:** while `#forget-dialog` is open, repeated forward and reverse Tab cycles only between Cancel and Confirm (or another intentional in-dialog control); focus never becomes `BODY` or an outside element. Preserve current no-mutation Escape behavior and focus restoration after Cancel/Confirm.

### IR-002 — Major — required command-palette surface is absent

**Affected IDs:** `observatory-shell`, `command-palette`.

**Exact evidence:** the header at `src/server.mjs:139-142` contains identity, connection state, and Theme only. The only dialog in the source is `#forget-dialog` at `src/server.mjs:220-222`. A source search found no command-palette trigger, query, results, no-results, action-error, or recovery surface.

**Why it fails:** the contract requires a command-palette trigger in the stable header (`design/contract.md:196-200`), a native command-palette pattern (`:230-238`), and the full overlay state family (`:617`). Product specification also assigns command-palette search to the Observatory shell (`docs/07-DASHBOARD-AND-LORE.md:19`).

**Acceptance:** add a keyboard-operable, labeled command-palette trigger in the header and a native modal implementation with open-empty, results, no-results, action-error, and recovery states. Keep background inert, trap focus, close safely, restore focus, and do not expose actions unsupported by the service.

### IR-003 — Major — Lineage and Chronicle are not addressable implementation surfaces

**Affected IDs:** `lineage`, `chronicle`, `observatory-shell`.

**Exact evidence:** the private secondary rail at `src/server.mjs:163-172` contains Pulse, Capture / recall, Attunement, Ebb, Selected resource, and Lore only. Primary tabs at `src/server.mjs:143-148` contain the five expected workspaces, but the document has no `data-section="lineage"`, `data-section="chronicle"`, `id="lineage"`, or `id="chronicle"` surface. The contract explicitly requires these as addressable panels/views with source/derivation/retrieval/application/validation and revision/dispute states (`design/contract.md:301-308`, `:614-616`).

**Acceptance:** provide stable deep-linkable Lineage and Chronicle views or panels, linked from the secondary navigation and reachable without losing selected resource/version/scope. Render the required edge meanings, source/revision history, disputes, partial/unknown states, and keyboard/list alternatives from service data.

### IR-004 — Major — bounded recall can announce partial results as complete

**Affected IDs:** `capture-recall`, `observatory-shell`, `V-003`, `V-024`.

**Exact evidence:** the service returns `coverage.matched`, `included`, `omitted`, and `truncated` (`src/service.mjs:209-261`). The browser handler at `src/server.mjs:240` always emits `Complete: ...` and only renders `included` and `matched`; it ignores `omitted` and `truncated`. With more than the hard `max_items: 8`, the service can return a truncated result while the UI announces success/completion without a limitation.

**Why it fails:** contract coverage requires partial/omission visibility and distinguishes unknown from zero (`design/contract.md:252-259`, `:314-329`). “Complete” can make a bounded result look exhaustive.

**Acceptance:** when `coverage.truncated` is true, announce `Partial` (not `Complete`), expose omitted counts/reason and any continuation, and keep result count and scope explicit. Keep `unknown`/`null` visible as unknown rather than zero. Add the same treatment to any other bounded response that can be partial.

### IR-005 — Moderate — pairing success live region is hidden before reliable announcement

**Affected IDs:** `pairing`, `observatory-shell`, `V-024`.

**Exact evidence:** `#pair-status` is the only pairing live region (`src/server.mjs:157-160`). The success handler writes `Paired: private data is available.`, then `setAuthenticated(true)` hides `#pairing-panel` (`src/server.mjs:232`), and the handler immediately moves focus to `#tab-observatory` (`src/server.mjs:238`). The visible `#connection-state` at `src/server.mjs:141` has no `role` or `aria-live`. Fresh paired ARIA inspection did not expose `#pair-status` in the active tree; fresh focus ended on `tab-observatory`.

**Why it matters:** the contract requires paired state to be announced locally (`design/contract.md:217-222`). Visual “Paired · local” passed, but a screen-reader announcement is not established when the live region is hidden immediately.

**Acceptance:** keep pairing success/failure in a live region that remains exposed after the gate transition, or make the connection state a correctly labeled live status and move focus to a meaningful paired-content heading. Verify with a screen reader or equivalent accessibility-tree announcement test.

## Passed checks

- **Pairing privacy boundary — PASS by source and runtime:** unpaired shell showed no resource names, private records, jobs, or service activity facts; private API remained guarded until pairing.
- **Tabs and selected context — PASS for exercised path:** native tab roles, `aria-selected`, roving `tabindex`, Arrow navigation, Enter activation, no page overflow at `390px`/`320px`, and selected resource handoff to Lore/Forge worked.
- **Labels and local status regions — PASS for inspected DOM:** `21` visible/DOM labels were present in the supplied smoke; fresh ARIA inspection exposed labeled textboxes, combobox, buttons, tabpanel, and local status regions.
- **Theme — PASS for exercised system → light path:** rendered control changed mode, label, and next-theme name; light persisted on reload. Dark was not independently captured in this review.
- **Brain/pipeline/relationship alternatives — PASS for current unavailable/empty data:** brain SVG is `aria-hidden` with an explicit text summary and facts; pipeline has a captioned table; relationship SVG is `aria-hidden` and the explicit relationship list remains primary. Fresh Atlas empty relationship state said the visual field was unavailable and distinct from unknown coverage.
- **Responsive controls — PASS for measured widths:** no document/body horizontal overflow at `390px` or `320px`; important controls measured at least `44px` high. The tab strip and bounded table may scroll internally as designed.
- **Reduced motion — PASS for CSS and fresh emulation:** source has the reduced-motion media rule at `src/server.mjs:133`; fresh emulation produced `scrollBehavior: auto`, `animationDuration: 0s`, and `transitionDuration: 0s`.
- **Local-only dependency boundary — PASS for inspected revision:** no remote asset references in `src/server.mjs`; fresh request inventory contained only the local document, pairing, and local API calls. No package or test file changed in the inspected diff.
- **Native forgetting dialog safety — PARTIAL PASS:** native dialog opens with labeled title/description, Cancel is initially focused, Escape does not mutate, Cancel restores focus, and entered values persist. IR-001 blocks approval because the forward Tab cycle leaves the dialog.

## Limitations and unverified checks

- No screen-reader session was available; IR-005 is based on DOM/ARIA evidence and needs AT confirmation.
- No complete numeric WCAG contrast matrix was run across light, dark, selected, disabled, error, dialog, SVG, and forced-colors states. Fresh screenshots showed no obvious contrast failure; that is expert visual judgment, not conformance evidence.
- Forced-colors media could not be emulated by the browser tool (`forcedColors` is unsupported). Source intent exists at `src/server.mjs:134`, but runtime behavior is **UNVERIFIED**.
- Firefox/WebKit release matrix, zoom/text resizing, orientation, safe-area/IME behavior, LAN failure/recovery, second-device pairing, field performance, memory/CPU/GPU pressure, and full long-content/error-state journeys were not run.
- Supplied tests and release checks were accepted as evidence and not rerun. They do not cover the missing contract surfaces or the modal focus sequence above.
- The run record remains `phase: produce`, `status: pending`; this review does not approve registration, packaging, deployment, or release.
