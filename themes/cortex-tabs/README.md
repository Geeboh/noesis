# Cortex Tabs

Cortex Tabs is the NOESIS Observatory Theme Module v1 package. It provides a restrained dark HUD, a pale instrument mode, cyan signal accents, sparse violet derived accents, and explicit amber/coral status styling.

This package is declarative. It contains tokens, scoped CSS, passive local SVG symbols, a local preview, and documentation. It contains no application logic, routing, API calls, authorization, storage, theme-selection code, animation engine, canvas, raster image, hosted font, remote request, or runtime dependency.

## Package

- `theme.json` — Theme Module v1 manifest, compatibility, budgets, and declared contrast pairs.
- `tokens.json` — editable DTCG-compatible source tokens. Primitive palette values use `-light` and `-dark` names; unsuffixed `color.*` paths are semantic roles; `component.*` paths hold shared geometry. `color.border` uses the stronger dark boundary primitive for the declared 3:1 surface pair; `color.border-subtle` retains the quieter HUD line.
- `tokens.css` — deterministic output from `tokens.json`. Do not hand-edit it.
- `theme.css` — selectors scoped beneath `[data-ui-theme="cortex-tabs"]`; component presentation only.
- `icons.svg` — original passive local symbol subset for shell, atlas, lore, reverie, forge, pipeline, brain, relationship, and state language.
- `preview.html` — local synthetic specimen. Fixture IDs are illustrative and are not live NOESIS records.
- `LICENSE.txt` — repository-policy notice. This package does not guess a public license.
- `CHANGELOG.md` — version history.

## Host boundary and current status

The current NOESIS host consumes the local registry through a trusted adapter in `src/server.mjs`. It validates the registry, serves only declared local assets, applies `data-ui-theme="cortex-tabs"`, persists a valid local selection, falls back to the known-good default, and exposes Theme settings with reset-to-default. The registry is local and not published.

The host adapter behavior is:

1. Validate the known local registry entry and `themeApi: "1"` before activation.
2. Serve only declared local `tokens.css`, `theme.css`, and `icons.svg` paths.
3. Apply `data-ui-theme="cortex-tabs"` on the stable application root; color mode remains independent.
4. Resolve local user preference, then default, then bundled fallback.
5. Persist valid selection in browser local storage while preserving route, forms, selected context, and service state.
6. Reject invalid IDs or missing assets, retain the previous known-good theme, and announce an actionable local error.
7. Expose local Theme settings with apply and reset-to-default.

The package helper validates the declarative module. Runtime tests cover registry metadata, exact asset allowlists, traversal rejection, fallback, settings, and reset. Full screen-reader, forced-colors, field-performance, and multi-theme rollback evidence remains separate.

## Modes and states

- Dark is the token default.
- Light maps the same semantic roles to the approved pale palette.
- System uses the host `prefers-color-scheme` preference only when the root says `data-ui-color-mode="system"`.
- `prefers-reduced-motion: reduce` removes transitions and animation durations and switches scrolling to `auto`. It does not remove labels, facts, status words, or list/table alternatives.
- `forced-colors: active` maps roles to system colors, removes nonessential shadows, preserves borders/focus, and retains textual state meaning.
- Comfortable geometry keeps important controls at least 44 CSS px high. Narrow layouts use internal tab/rail scrolling instead of page-wide horizontal overflow.
- Brain, pipeline, and relationship treatments are static supplemental surfaces. Host data must supply every fact, stage, node, and edge. The package never creates particles, confidence, causality, or progress.

## Integrate locally

Serve this directory from a local origin when testing external SVG `<use>` references; do not open the preview through a production host. Load the styles in this order:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="theme.css">
```

Then place the attribute on the stable root:

```html
<html data-ui-theme="cortex-tabs" data-ui-color-mode="system" data-ui-density="comfortable">
```

Use semantic variables in host components:

```css
color: var(--ui-color-text);
background: var(--ui-color-surface);
border-color: var(--ui-color-border);
```

Do not copy primitive palette names into application markup. Do not use the preview as application runtime code.

## Rebuild and validate

Run from the repository root:

```bash
tools/ui-design build-theme themes/cortex-tabs
tools/ui-design check-theme themes/cortex-tabs
tools/ui-design theme-digest themes/cortex-tabs
tools/ui-design package themes/cortex-tabs --output /tmp/cortex-tabs-1.0.0.zip
```

Edit `tokens.json`, rebuild `tokens.css`, then run `check-theme`. The helper checks the manifest, supported token subset, required semantic paths, generated CSS freshness, scoped CSS, passive SVG, declared opaque-token contrast pairs, and runtime budgets. It does not prove application integration, browser accessibility, screen-reader output, forced-colors runtime behavior, complete contrast across rendered states, selection persistence, fallback, rollback, or performance of the full application.

## Budgets and provenance

The manifest declares the project limits of 131,072 raw bytes and 40,960 summed per-file gzip bytes for runtime assets (`theme.json`, `tokens.css`, `theme.css`, and `icons.svg`). Preview, source tokens, and documentation are excluded by the helper's runtime accounting. Application shell bytes, data payloads, fonts, request overhead, and field performance require separate host measurements.

All icons and CSS geometry in this module are original local work authored for NOESIS. No reference image, stock mark, particles.js code, remote font, external stylesheet, or hosted asset is included. The particles.js URL remains visual inspiration only. `preview.html` uses synthetic fixture IDs from the approved Design contract and must not be treated as service evidence.

The manifest covers these required checks at 4.5:1: text/background, text/surface, muted/background, on-primary/primary, on-danger/danger, and on-success/success. Focus/background and border/surface are declared at 3:1. Light-mode equivalents and warning/derived status pairs are also declared. Run `check-theme` for measured ratios from current bytes.

## Rollback

Keep the prior theme directory and registry backup. The host adapter must restore the prior theme ID/version atomically when activation, asset loading, or compatibility validation fails. Rollback must not clear application data, route state, forms, selected context, dialogs, or durable job handles. A theme directory alone cannot perform rollback.

## Native targets

No native adapter is included. The supplied compiler validates the web CSS/SVG contract only. A native target requires a separate versioned native contract, deterministic token conversion, native resources, platform accessibility checks, packaging, byte/resource measurement, invalid-selection fallback, and rollback evidence before acceptance.
