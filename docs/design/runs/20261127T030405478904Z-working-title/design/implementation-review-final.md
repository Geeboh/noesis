# NOESIS Observatory — final implementation review

- **Reviewer:** `ImplementationReviewFinal`
- **Independence:** I did not author `src/server.mjs`. This is a separate review task. The implementer and reviewer use the same resolved model (`openai-codex/gpt-5.6-luna`), so this is task-independent but not model-diverse validation.
- **Reviewed source:** `HEAD dc1a719e88aae6f1905d7e695db2ec22fcc9bb8d`; modified `src/server.mjs` SHA-256 `6b24d82d73666560e6ad899004af48ae27f6028d614de16140d154d995cf9466`.
- **Contract:** `design-contract-20261127.2`.
- **Scope:** Current real Observatory implementation after IR fixes. This review does not approve registration, packaging, deployment, or release.

## Verdict

**PASS — implementation blockers IR-001 through IR-005 are closed.**

The current implementation has live command-palette, Lineage, Chronicle, partial-recall, pairing-status, and modal-focus behavior. No new major implementation blocker was found. The application remains unregistered and unpublished, and the limitations below remain explicit.

## Evidence and method

### Fresh runtime evidence

I started isolated local Observatory services with fresh temporary data directories and exercised the real rendered page through the UI in headless WebKit:

- Paired through the rendered form.
- Opened command palette, searched results and no-results, invoked an action with ArrowDown + Enter, escaped, and checked focus restoration.
- Opened the destructive forgetting dialog, checked forward/reverse Tab cycles, Escape safety, cancellation, focus restoration, and input preservation.
- Loaded Atlas, selected the dashboard resource, and inspected returned Lineage/Chronicle projections and deep links.
- Created nine observations through Capture and recalled them through the rendered form to produce a real bounded partial response.
- Checked 320px, 390px, 960px, and 1440px widths, labels, status regions, overflow, and theme persistence.

Fresh rendered captures were taken at 390px (`/tmp/omp-sshots-15de7663686751bb.png`) and 1440px light/dark (`/tmp/omp-sshots-15de7669156751c2.webp`, `/tmp/omp-sshots-15de76ce3c675203.webp`). WebKit reported no page errors. Direct Chromium 159 headless emulation of `prefers-reduced-motion: reduce` reported `scrollBehavior: auto`, `animationDuration: 0s`, `transitionDuration: 0s`, no page errors, and 390px document/body widths equal to the viewport.

### Supplied evidence accepted, not rerun

- Focused Observatory tests: `7/7`.
- Full `npm run release:check`: `81` tests plus bootstrap integrity, schema examples, and syntax checks.
- Supplied paired Chromium smoke and shell captures.

No test, build, lint, formatter, or release command was run for this review.

## IR finding disposition

### IR-001 — CLOSED — destructive dialog focus containment

**Affected IDs:** `forgetting-confirm`, `ebb`, `V-024`.

Fresh WebKit reproduction after the fix:

- Dialog opened with `#forget-cancel` focused.
- Four forward Tab observations cycled `forget-cancel → forget-confirm → forget-cancel → forget-confirm`.
- Four reverse Tab observations stayed within the same two controls.
- `Escape` left the destructive dialog open and did not add a request.
- Cancel closed the dialog, restored focus to `#forget-record-id`, and preserved entered record ID and reason.

The native dialog markup and `trapModalFocus` implementation are in `src/server.mjs:225-246`.

### IR-002 — CLOSED — command palette surface and local action semantics

**Affected IDs:** `observatory-shell`, `command-palette`.

Fresh runtime evidence:

- Header exposes a labelled `Command palette` button with `aria-haspopup="dialog"` and `aria-controls`.
- Native dialog opens with focus on `#command-palette-query`.
- Empty, result, and no-result states render local status text.
- Paired result `Open Selected resource` changed only the local hash/view; it added zero API requests.
- ArrowDown moved focus to the result and Enter invoked it.
- Escape closed the palette and restored focus to `#command-palette-trigger`.
- In a fresh unpaired service, private actions such as Atlas produced `No results: no authorized local actions match Atlas.`; only public local actions were available.
- Focus cycling stayed inside the palette for empty and result states.

The action set is explicitly local navigation/theme behavior; data-changing actions remain in existing forms. The implementation is in `src/server.mjs:142`, `:228-229`, and `:243-246`.

The action-error/recovery branch is present in source, but no normal valid action can fail because every current action targets an existing local surface. No fault injection was used.

### IR-003 — CLOSED — Lineage and Chronicle surfaces

**Affected IDs:** `lineage`, `chronicle`, `observatory-shell`.

Fresh runtime evidence:

- Secondary navigation exposes stable `#lineage` and `#chronicle` links.
- Atlas selection fetched `/api/trace/project%3Adashboard` and rendered returned data only.
- Actual response had `edges: []` and one `resource_registered` Chronicle event.
- UI showed `Unknown: no lineage relationships returned; absence is not established.` with an explicit unknown/absence distinction.
- UI showed `Returned: 1 history events returned.` and rendered the actual event and subject.
- Activating `#lineage` and `#chronicle` switched to the Observatory view without losing selected resource ID.
- No fabricated edges, revisions, or history rows appeared.

The trace panels and renderer are in `src/server.mjs:174-195`, `:246-247`, and `:252`.

A limit-sized trace fixture was not created; the source handles a service `coverage.limit` with `Partial` wording and an omission note, but that branch was not runtime-exercised here.

### IR-004 — CLOSED — partial recall honesty

**Affected IDs:** `capture-recall`, `observatory-shell`, `V-003`, `V-024`.

Fresh UI fixture: nine observations with the same query were captured through the rendered form. Recall status reported:

```text
Partial: 8 included of 9 matched; 1 omitted (item_limit 1); continuation not supplied; ...
```

A no-match query separately reported:

```text
Complete: 0 included of 0 matched; 9 omitted (non_match 9); continuation not supplied; ...
```

The rendered copy now distinguishes complete from partial, shows omitted count/reason, preserves matched/included counts, and states when continuation is not supplied. Source branch is `src/server.mjs:255`.

The `Unknown` fallback for a response without a boolean `coverage.truncated` field is source-covered but was not produced by the current service fixture.

### IR-005 — CLOSED — pairing live status exposure

**Affected IDs:** `pairing`, `observatory-shell`, `V-024`.

Fresh runtime evidence:

- After pairing, the header `#connection-state` remained exposed in the accessibility tree as `status`, `aria-live="polite"`, `aria-atomic="true"`, with text `Paired · local`.
- Pairing success moved focus to the meaningful `#observatory-title` heading.
- A fresh unpaired service exposed only the pairing surface; `#private-shell` was hidden and no private resource/activity data was visible.
- Pairing status remained local to the pairing surface before transition; Atlas/Lore/Reverie messages use their own status regions.

The persistent header status is `src/server.mjs:142`; pairing transition and focus behavior are `src/server.mjs:255`.

## Additional review results

### Responsive and visual behavior — PASS for exercised widths

Measured fresh WebKit widths:

- 320px: document/body `scrollWidth = 320`.
- 390px: document/body `scrollWidth = 390`.
- 960px: document/body `scrollWidth = 960`; inspector moved below the main content.
- 1440px: document/body `scrollWidth = 1440`; three-column layout rendered.

The primary tab strip and narrow section rail scroll internally without causing page-wide horizontal overflow. Important buttons measured at 44px height or larger. The 390px and 1440px captures showed readable labels, bounded panels, selected state, visible status words, and no obvious clipping. The 320px DOM inspection found seven visible form controls with accessible names and no unnamed visible buttons.

### Labels, status, and semantics — PASS for inspected DOM/accessibility tree

- Visible form controls had labels: Observation, Query, Origin, Preference, Record ID, Forget record ID, and Reason.
- Header, navigation, main, aside, tablist, tabs, tabpanels, labelled regions, dialogs, and status regions were exposed.
- Primary tabs used `aria-selected` and roving `tabindex`; only the active tab was sequentially reachable.
- Error status code changes status regions to `role="alert"`; normal async updates use local `role="status"` regions.
- Brain and relationship SVGs are decorative (`aria-hidden="true"`) with visible text/list alternatives.

### Theme and motion — PASS for exercised behavior; broader conformance pending

- System → light and light → dark theme changes persisted through reload in fresh WebKit.
- Dark and light captures rendered without page errors.
- Reduced-motion Chromium evidence produced zero animation/transition duration and `scrollBehavior: auto`.
- CSS includes forced-colors mappings and preserves status words/icons, but forced-colors runtime behavior was not verified.

### API, service, dependency, and network boundaries — PASS by scoped diff and runtime evidence

- `git diff --unified=0 -- src/server.mjs | grep '^@@'` showed changes only inside the inline `OBSERVATORY_HTML` markup/style/client script region (source lines 20–270). No request-handler/service route hunk changed.
- Scoped diff of `package.json`, `test/observatory.test.mjs`, `src/service.mjs`, `src/atlas.mjs`, and `src/web-auth.mjs` showed only `src/server.mjs` changed.
- No remote `<script src>`, stylesheet import, hosted font, or remote asset reference was found in `src/server.mjs`. Browser requests were same-origin localhost plus a data URI; no remote origin request occurred.
- Existing pairing, Atlas, trace, recall, note, and service API behavior continued to respond during fresh UI exercises.

## Limitations and unverified checks

- No real screen-reader session was available. Accessibility-tree evidence supports the pairing live-status implementation, but AT announcement timing remains unverified.
- No complete numeric WCAG contrast matrix was run across light, dark, selected, disabled, error, dialog, SVG, overlay, and forced-colors states.
- Forced-colors runtime behavior remains unverified.
- Firefox release matrix, text resizing/zoom, orientation, safe-area/IME behavior, LAN failure/recovery, second-device pairing, field performance, memory/CPU/GPU pressure, and complete long-content/error/recovery journeys were not run.
- Trace partial, recall unknown, command-palette action-error, and several service-projection states were source-covered or represented honestly but not all runtime-exercised with dedicated fixtures.
- Supplied tests and release checks were accepted as evidence and not rerun.
- The implementation remains unregistered/unpublished. This review does not approve packaging, deployment, or release.

## Recommendation

**Approve the current implementation review for Produce.** Keep Finalize, registration, packaging, deployment, and release pending until their required independent evidence and project gates are complete.
