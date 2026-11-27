# NOESIS extra-surface mockups

**Phase:** Design mockups only; not application implementation or Design approval.  
**Owner path:** `docs/design/runs/20261127T030405478904Z-working-title/design/extra-surfaces/`  
**Contract:** `design-contract-20261127.2`  
**Direction:** Cortex Tabs shell + Signal Deck provenance discipline.  
**Fixture:** synthetic Threadloom MCP, `v2.4.1`, `sha256:8a41…c2d7`, scope `local / project:noesis`.

## Artifacts

| Surface ID | Artifact | Coverage |
|---|---|---|
| `chronicle` | [`chronicle.html`](./chronicle.html) | Empty, list, loading, selected revision, partial, conflict/dispute, error, recovery |
| `lineage` | [`lineage.html`](./lineage.html) | Selected, source, derived, hypothetical, empty/loading, partial/unknown, conflict, error, recovery |
| `command-palette` | [`command-palette.html`](./command-palette.html) | Closed, open-empty, results, no-results, action-error, recovery; one active native dialog |
| shared system | [`styles.css`](./styles.css) | Dark/light/system semantic tokens, forced colors, reduced motion, focus, 44px controls, 320px reflow |
| `mockup.js` | Local theme-cycle, skip-focus, and command-palette dialog harness; no service actions |
| handoff matrix | [`coverage.json`](./coverage.json) | State × viewport records; implementation remains unverified |

## Synthetic fixture boundary

All names, IDs, revisions, counts, timestamps, relations, and errors are synthetic/planned. They do not establish live NOESIS data, authorization, routes, or service capabilities.

- Resource: **Threadloom MCP** (`fixture-resource-threadloom-mcp`), kind `MCP server`, origin `local / managed`.
- Version: `v2.4.1` (`fixture-version-threadloom-mcp-v2-4-1`).
- Scope: `local / project:noesis` (`fixture-scope-project-noesis`).
- Chronicle records: `fixture-record-source-001`, `fixture-record-derived-001`, `fixture-record-lore-generated-001`, `fixture-failure-lore-request-001`.
- Lineage projection: 5 bounded nodes, 4 typed relations, 2 omitted by scope; list remains primary.
- Command query: `not-a-command`, zero authorized results; action-error and retry are separate state specimens.

## Semantics and interaction

### Chronicle

- The visible timeline is a visual framing of the same bounded revision records in the readable revision list.
- Each row keeps revision ID, observed time, change meaning, source/job origin, and a target-specific action name.
- Empty says zero history; partial says `4 shown · 2 omitted`; unknown is not converted to zero.
- Conflict/dispute names expected/current revision and keeps the draft recoverable. Retry preserves resource, version, snapshot, scope, and cursor.
- Browsing history is inspection only. It does not confirm, apply, delete, or promote a record.

### Lineage

- The local SVG is decorative (`aria-hidden="true"`); relation rows are the accessible keyboard/list alternative.
- Every displayed node maps to a synthetic ID. Every edge has an explicit meaning: `derived from`, `generated from`, `retrieved`, or `hypothetical association`.
- The field is bounded and labels omitted coverage. Proximity never implies causality. No drag, hover, force simulation, random layout, or decorative orphan nodes.
- Source evidence, derived observation, generated Lore, applied/retrieved facts, and hypothetical proposals remain separate. A dream proposal is not an executed experiment or validated outcome.
- Loading, empty, partial, unknown, conflict, error, and recovery states preserve selected context and never fill missing data with decoration.

### Command palette

- The page has exactly one active `<dialog open aria-modal="true">`; the background is `inert` while it is open.
- The active specimen is no-results. Other cases are ordinary, non-modal state cards: closed, open-empty, results, action-error, and recovery.
- Local `mockup.js` wires Escape, backdrop click, Close, query clearing, contained Tab order, and focus restoration to the invoking trigger. The static command palette does not call service actions.
- Action errors use local alert semantics, retain the query and selected context, and offer retry or return. No failure becomes empty or success.
- Command search is limited to authorized service-projected actions/records; this static board does not implement that service boundary.

## Shared responsive and accessibility intent

- DOM order: skip link → header → primary navigation → selected context → section rail → heading/actions/content → inspector.
- Primary navigation uses native links with `aria-current="page"`, so every branded tab has a real local destination and native keyboard activation.
- Important buttons, links, fields, and dialog actions are at least 44px. At 320px action groups become full width; IDs and hashes wrap; the page itself is not intended to scroll horizontally.
- At `1440px`: rail + main task canvas + inspector. Timeline/list and field/list can sit side by side.
- At `900–1260px`: rail + main canvas; inspector moves below and uses a two-column detail grid where readable.
- At `390px`: one stack with horizontally scrollable tabs, sticky selected context, compact rail, task content, then inspector.
- At `320px`: tabs scroll rather than clip, lineage becomes vertical, rows stack, and important actions stay full width.
- Production should add safe-area padding and verify orientation, text resize, zoom, and on-screen keyboard. These static boards do not claim those checks.
- `role="status"` is local to queued/loading/partial/recovery information. `role="alert"` is local to request/action errors. Passive updates do not steal focus.
- Dark, light, and system mode share markup. `forced-colors: active` switches to system colors while retaining borders, focus, status words, and icons. Reduced motion removes transitions/animations; no state meaning depends on motion.

## Visual evidence

Captures are local Chromium visual concept evidence only. They do not prove application behavior, authorization, WCAG conformance, screen-reader output, contrast, performance, network recovery, or second-device reachability.

| Surface | 1440px | 390px | 320px |
|---|---|---|---|
| Chronicle | [`captures/chronicle-1440.png`](./captures/chronicle-1440.png) | [`captures/chronicle-390.png`](./captures/chronicle-390.png) | [`captures/chronicle-320.png`](./captures/chronicle-320.png) |
| Lineage | [`captures/lineage-1440.png`](./captures/lineage-1440.png) | [`captures/lineage-390.png`](./captures/lineage-390.png) | [`captures/lineage-320.png`](./captures/lineage-320.png) |
| Command palette | [`captures/command-palette-1440.png`](./captures/command-palette-1440.png) | [`captures/command-palette-390.png`](./captures/command-palette-390.png) | [`captures/command-palette-320.png`](./captures/command-palette-320.png) |

Capture command used for each page/width:

```text
playwright_fast capture --browser chromium --url file:///<absolute-page> --output <capture>.png --width <1440|390|320> --height 900 --fullPage
```

- Observed capture receipts: Chromium `159.0.8154.6`, all nine original captures plus fresh `1024px` repairs returned `CAPTURE_COMPLETE`, `pageErrors: []`, `qaStatus: NOT_RUN`. Visual inspection found no page-level horizontal overflow at the captured widths. The forced-color representative also reported `forced-colors: active` and `pageErrors: []`; broader DOM overflow, keyboard order, reduced-motion behavior, and screen-reader output remain unverified.

No remote assets, hosted fonts, gradients, canvas, particles.js, executable SVG, runtime dependency, or application code are used.

## Repair evidence

- Shared-shell adapter boundary is intentional: Extra Surfaces keeps trace-field and command-palette geometry for Chronicle, Lineage, and command search. Core Atlas retains the larger HUD/brain treatment; Knowledge Ops retains denser task panels. All lanes expose the same `data-ui-color-mode="system|light|dark"` root API, focusable `#main-content`, 44px controls, local status/alert roles, and forced-color intent.
- Theme controls on Lineage and Chronicle cycle `system` → `light` → `dark`; the active command-palette dialog uses native modal containment and restores focus to `#palette-trigger` after Escape, Close, or backdrop click. No destructive mutation exists in this static surface.
- Fresh visual captures: `captures/chronicle-1024-repair-v3.png`, `captures/lineage-1024-repair-v3.png`, `captures/command-palette-1024-repair-v4.png`, and forced-color `captures/command-palette-390-forced-v4.png`. Chromium `159.0.8154.6`; receipts returned `CAPTURE_COMPLETE`, `pageErrors: []`, and `qaStatus: NOT_RUN`.
- Browser spot-checks covered theme cycling, skip focus, command-palette Escape/Close/backdrop paths, and focus restoration. This is design evidence only; application implementation, screen-reader output, and WCAG conformance remain unverified.
