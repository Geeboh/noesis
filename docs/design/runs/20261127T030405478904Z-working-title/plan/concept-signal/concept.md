# Signal Deck

Concept ID: `signal-deck`
Phase: Plan
Status: proposed concept; not user-approved and not an application implementation.
Board: `board.html`
Local asset: `icons.svg`

## Direction

Signal Deck treats Observatory as a quiet operations deck: one calm canvas, a high-signal tab strip, and a three-part desktop layout (navigation, work surface, provenance inspector). Light and dark surfaces use the same semantic roles. Thin rules, compact data labels, and a restrained teal/violet signal language create the understated science-fiction feel without decorative noise.

The first view is **Observatory / open work**. Atlas, Lore, Reverie, and Forge remain visible as tabs. A selected resource/version/scope bar stays above the work surface so the operator can move from Atlas to provenance, Lore, or Forge without retyping opaque IDs.

## Evidence-backed rationale

- `UI-001` / `UX-001`: replaces the long stacked page with visible primary tabs and a stable current-area label.
- `UX-002`: the selected context rail carries **Threadloom MCP / v2.4.1 / local project scope** into Lore and Forge actions.
- `UI-002` / `UX-007`: groups fields into labelled blocks, uses 44px preferred controls, and deliberately reflows at 390px and 320px.
- `UX-003` / `UX-004`: gives each async region a local status, explicit loading/empty/error/recovery treatment, and retry that preserves context.
- `UX-006` / `UX-009`: keeps the job handle and pipeline stage identity visible; indeterminate work uses a heartbeat, not invented percentage.
- `UX-010`: the inspector names source snapshot, derived summary, retrieval state, uncertainty, revision, scope, and hypothetical status in plain language.
- `UX-012`: Lore/Forge handoff is framed as a review step with source revision and generated/authored distinction.
- `PERF-003`: cards and tables show bounded rows (`18 of 42 resources`) and visible omission language rather than pretending to render the whole store.

These are design implications from the supplied assessment, not measured user preference. Authenticated, screen-reader, contrast, network-recovery, and field-performance evidence remain unverified in the run.

## Representative synthetic fixture

The board uses the same task and data in every frame:

- Pairing target: local Observatory, one-use code `482 913 07`.
- Resource: **Threadloom MCP**, kind `MCP server`, origin `local / managed`.
- Selected version: `v2.4.1`, observed `2026-11-26`, snapshot `sha256: 8a41…c2d7`.
- Scope: `local / project: noesis`.
- Source evidence: `source snapshot · observed`.
- Derived content: Lore summary is marked `generated`; a manual note is marked `authored`.
- Activity fixture: `18 records captured`, `14 extracted`, `2 active`, `1 deferred`; provider wait is explicitly **indeterminate**.
- Failure fixture: Atlas request times out once at `09:42:18 UTC`; retry keeps the selected resource/version/scope and returns to the same inspector.

All data is synthetic and illustrative. No board label claims live service progress.

## Navigation and layout

### Desktop / pointer + keyboard

- Header: product identity, pairing state, theme control, command hint.
- Primary tab strip: Observatory, Atlas, Lore, Reverie, Forge; each tab has a plain description and visible active state.
- Left rail: current work, recent resources, and durable job link.
- Main surface: open-work summary, brain signal graphic, pipeline activity table, and selected-resource handoff.
- Right inspector: scope/version, provenance chain, evidence meanings, and next actions.
- `Tab` order follows header → primary tabs → left rail → main work → inspector. Focus is never represented by colour alone.

### Handheld / touch

At 390px, the three-pane shell becomes one stack: header → tab grid → selected-scope bar → active work → inspector. The inspector follows the selected resource and has a visible back path. At 320px, tab labels wrap within a 3-column grid, metadata rows stack, and action groups become full-width. No horizontal scrolling is required for the task.

## Activity graphics

The brain and pipeline visuals are local inline SVG/CSS concept assets. The brain is a static network of observed signals plus a reduced-motion-safe heartbeat marker. It does not animate by default in the board. If implementation later adds motion, it must stop under `prefers-reduced-motion: reduce`.

The pipeline graphic uses stage nodes and explicit labels (`captured`, `extracting`, `waiting`, `failed`) instead of a decorative progress bar. Known units use a denominator (`14 / 18 records`); provider wait remains indeterminate and is described in text. A list/table alternative remains visible beside the graphic.

## Visual system

### Semantic palette and actual contrast pairs

Contrast ratios below use the listed foreground/background values, rounded down to two decimals. All ordinary text pairs clear 4.5:1; control/graphic accents are also intended to clear 3:1. Status is never conveyed by hue alone.

| Semantic role | Light value | Dark value | Example pair / ratio |
|---|---|---|---|
| Canvas | `#F2F5F7` | `#10151A` | primary text `#14202B` / light canvas `16.52:1`; `#E9F0F2` / dark canvas `14.59:1` |
| Surface | `#FFFFFF` | `#161E26` | primary text `#14202B` / light surface `16.52:1`; `#E9F0F2` / dark surface `14.59:1` |
| Muted text | `#4D5B66` | `#A9BAC2` | light muted / canvas `6.38:1`; dark muted / surface `8.41:1` |
| Accent / active | `#0B6F80` | `#74D5E5` | light accent / white `5.83:1`; dark accent / surface `9.93:1` |
| Focus ring | `#6B4FD5` | `#B7A9FF` | light focus / white `5.67:1`; dark focus / surface `8.12:1` |
| Success | `#1B6B55` | `#7BD4B2` | light success / canvas `5.85:1`; dark success / surface `9.54:1` |
| Warning | `#815B0A` | `#F2C979` | light warning / `#FFF8E8` `5.78:1`; dark warning / surface `10.74:1` |
| Error | `#9C3344` | `#FF9CA9` | light error / white `7.07:1`; dark error / surface `8.48:1` |

### Type and space

- Font: local system stack `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; no remote font.
- IDs, hashes, counts, and timestamps use local `ui-monospace, SFMono-Regular, Consolas, monospace` with tabular numerals.
- Type scale: `12px / 1.35` metadata, `14px / 1.4` labels, `16px / 1.5` body, `20px / 1.3` card title, `28px / 1.15` page title, `40px / 1.05` board title.
- Spacing: base `4px`; steps `4, 8, 12, 16, 24, 32, 48`; cards use `16px` padding, desktop regions use `24px`, section breaks use `32px`.
- Shapes: 8px controls, 12px cards, 16px shell; 1px borders; no glass blur and no large shadow. Elevation is one low-contrast shadow only for the app window and pairing dialog.
- Density: default comfortable; compact tables may reduce vertical padding to `10px` but never below 44px interactive rows.

## Icon language

`icons.svg` contains a six-icon subset: signal/brain, pipeline, resource, lineage, retry, and lock. Icons use a 24×24 viewBox, 1.75px round strokes, no filled text, and a single optical weight. Icon-only controls have an accessible label. The board embeds the same paths to remain renderable from `file://` without a fetch.

## Component and state sheet

`board.html` includes visible specimens for:

- tab navigation with selected/unselected/focus states;
- primary, secondary, quiet, and destructive buttons;
- labelled field, helper text, validation error, and disabled state;
- evidence badges for source, generated, authored, retrieved, hypothetical, stale, and indeterminate;
- compact status table with known-denominator and indeterminate rows;
- cards, scope bar, inspector, durable Reverie job, correction/export, and action groups;
- loading skeleton, empty state, local error with retry, and recovered result;
- pairing dialog with code-entry, invalid-code, and paired-return copy;
- success storyboard and failure/recovery storyboard.

## Storyboard contract

Success path: pair safely → land on Observatory open work → select Threadloom MCP in Atlas → inspect source/version/scope in inspector → open Lore while context stays pinned → return through tabs.

Failure path: same selection → Atlas request times out → local error explains that no data was changed → `Retry Atlas` preserves context and focus → result shows bounded coverage and the same provenance chain. The board also shows an indeterminate provider-wait state to prevent false percentage progress.

## Cost and dependency estimate

These are estimates for a future implementation, not measurements:

- Added runtime dependencies: **0**.
- Remote runtime requests: **0**.
- Theme/board CSS plus inline SVG: **approximately 22–30 KiB raw**, **approximately 7–10 KiB gzip** if extracted and compressed; measure against the 131,072 raw / 40,960 gzip theme budgets during implementation.
- Browser JavaScript: **approximately 1–2 KiB** for tab/theme state if implemented; no chart library or animation runtime.
- Runtime graphics cost: low estimate; static SVG paths and CSS borders, with no canvas, blur, web font, or continuous animation. Long data remains a separate server/render-budget risk identified by `PERF-003`.
- Maintenance: semantic tokens and a small SVG subset are easy to audit; the main risk is keeping status/provenance labels aligned with service state and not turning the graphics into a second progress model.

## Limitations and inspection

The concept is a browser-rendered board, not proof of native or server behavior. It does not exercise real pairing, API recovery, durable job reconnect, scope authorization, screen readers, forced colors, or second-device LAN access. The board can be visually inspected locally; application QA and WCAG evidence require later host checks. The board was authored with local assets only and no user approval is claimed.

## Source labels

- User direction in current task: modern tabbed Observatory; restrained calm; futuristic understated science-fiction; status/open work first; resource inspection; Reverie; correction/export; local brain and pipeline graphics.
- `docs/design/runs/20261127T030405478904Z-working-title/brief.md`
- `docs/design/runs/20261127T030405478904Z-working-title/report.md`
- `docs/design/runs/20261127T030405478904Z-working-title/findings.json`
- `docs/design/runs/20261127T030405478904Z-working-title/coverage.json`
- `docs/design/runs/20261127T030405478904Z-working-title/worker-ux.md`
- `docs/design/runs/20261127T030405478904Z-working-title/worker-performance.md`
- `docs/01-PRODUCT-SPEC.md`
- `docs/02-ARCHITECTURE.md`
- `docs/07-DASHBOARD-AND-LORE.md`
- `.omp/skills/ui-design-studio/references/visual-system.md`
