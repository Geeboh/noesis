# Performance and engineering assessment

## Scope and evidence

Read-only lane. No application files or shared run records changed.

- Source revision/context: current `feat/m0-foundation` worktree, Node `v24.22.3`, Chromium `159.0.8154.6`, per `brief.md` and `baseline/README.md`.
- Requirements: `ui-design-studio.json` sets `addedRuntimeDependencies: 0`, `remoteRuntimeRequests: 0`, `maxThemeRawBytes: 131072`, `maxThemeGzipBytes: 40960`, and preferred 44px touch targets (`ui-design-studio.json:6-10,25-29`).
- Product constraints: LAN-served same-origin UI, pairing before private reads/mutations, responsive desktop/handheld experience, preserved scope/provenance/revisions/budgets, and no remote runtime requests (`project-context.md:23-37`, `docs/02-ARCHITECTURE.md:60-74`). Offline product operation is resolved `not-required`; LAN/network failure and recovery remain relevant (`project-context.md:29-36`, `run.json:6-12`).
- Existing visual evidence: unpaired landing only, `baseline/observatory-desktop.png` (1440x2623) and `baseline/observatory-handheld.png` (390x3734). Capture reports `CAPTURE_COMPLETE` and empty page errors, but explicitly is not application QA, accessibility, usability, performance, or approval (`baseline/README.md:3-15`).
- Existing application-test evidence: `baseline/npm-test.log:2-93` records 81 passing Node tests. This lane did not run tests, builds, lint, or formatters.

## Measured payload and dependency cost

Measured from `src/server.mjs`'s `OBSERVATORY_HTML` and the available local runtime. Compression figures use gzip level 9 on extracted source bytes; they are laboratory figures, not wire captures.

| Item | Observed result | Evidence/method |
| --- | ---: | --- |
| HTML shell, raw | 18,039 B | Extracted `OBSERVATORY_HTML`; live `GET /` body also measured 18,039 B |
| Inline CSS, raw / gzip | 557 B / 355 B | `src/server.mjs:25-32`; source extraction |
| Inline browser JS, raw / gzip | 11,352 B / 2,666 B | `src/server.mjs:47-70`; source extraction |
| Complete shell, gzip | 4,722 B | Source extraction, gzip level 9 |
| Live `/` response | 200, `text/html; charset=utf-8`, chunked; no `Content-Encoding` header observed | `curl -sS -D - http://127.0.0.1:17339/` |
| Fonts/icons/images | 0 declared external links, `@font-face`, or `<img>` tags | `src/server.mjs:19-46`; source scan |
| Runtime browser dependencies | None shipped to page; one inline script | `src/server.mjs:47-70` |
| Server runtime dependency | `qrcode@1.5.4`, installed footprint 404 KiB; transitive `pngjs`, `yargs`, `dijkstrajs` | `package.json:19-24`, `src/lan.mjs:1-3`, lockfile; `du -sk node_modules/...` |
| Browser test dependency | `@playwright/test@1.65.1` is dev-only, not page payload | `package.json:22-24`, `package-lock.json:12-27` |

The current shell is far below theme byte budgets. The zero-dependency and zero-remote-request budgets are the important constraints: adding a UI framework, runtime theme engine, hosted font, icon CDN, or remote analytics would be a regression even if the resulting CSS remains small. Existing `qrcode` is server-side LAN startup support, not a reason to add browser QR assets.

**PERF-001 — Low shell cost, incomplete wire evidence (low, confirmed for unpaired route).** The initial shell is small and has no external asset fetches in source. However, there is no HAR, transfer-size capture, cache state, or browser resource-timing artifact. Actual request count, DNS/connect/TTFB, and whether the active server applies compression are unverified. `Transfer-Encoding: chunked` was observed; no content encoding was observed on the local response.

## Runtime and network behavior

- `api()` wraps `fetch()` and parses every response as JSON (`src/server.mjs:48-49`). Calls are event-driven from form/button handlers, not startup hydration (`src/server.mjs:50-69`). The unpaired screenshot therefore measures only the static shell; it does not measure paired reads, populated lists, dream output, Lore, Forge, or error/recovery traffic.
- The shell has no service worker, manifest, cache policy, EventSource, WebSocket, or reconnect loop in the inspected UI (`src/server.mjs:47-70`). Reverie exposes POST queue/run/cancel and GET status routes (`src/server.mjs:278-300`), but no browser-side durable-cursor stream. The product spec requires reconnectable durable progress and honest interruption/recovery (`docs/07-DASHBOARD-AND-LORE.md:59-65`). This is primarily a functional verification gap, with possible future polling/streaming cost that must be measured before implementation approval.
- Pairing is server-gated before private APIs (`src/server.mjs:135-143`). The static HTML is public, while authenticated payload cost remains unmeasured. Do not infer private-data performance from the landing screenshot.
- Request bodies are capped at 256,000 bytes (`src/server.mjs:81-90`). This protects input handling but is not a response-size or rendering budget.

**PERF-002 — Authenticated and recovery paths have no runtime budget evidence (high, unverified).** No measured latency, response bytes, request count, reconnect cost, or failure/recovery behavior exists for pairing, note capture, recall, Atlas, Reverie, Attunement, Ebb, Lore, or Forge. The requirements call for p50/p95 capture/lookup/recall/search/graph/page/job latency, throughput, storage, peak resources, and cold/warm comparison (`docs/10-VALIDATION-AND-EVALUATION.md:73-77`).

## Data and rendering growth risks

The small shell does not bound application data cost:

- Atlas UI requests `limit=100` with no visible pagination control (`src/server.mjs:61`; route accepts `limit` and `offset` at `src/server.mjs:175`).
- Resource trace defaults to 100 items (`src/server.mjs:54,196`).
- Forge, Blueprint, and task-manifest routes pass `service.store.listRecords()` without a UI-selected bound (`src/server.mjs:220,225,264`). This can make server CPU, memory, serialization, and response size scale with the whole record store even when one resource is selected.
- Client rendering expands response arrays into DOM nodes with `replaceChildren(...map(...))` (`src/server.mjs:53-69`). There is no virtual list, result window, truncation indicator in the DOM renderer, or maximum rendered-output policy visible in this shell.
- Dream output, resource snapshots, trace entries, Lore sections, and Forge JSON are rendered as growing lists/preformatted content (`src/server.mjs:53-69`). Their cost is absent from the 18 KB shell measurement.

**PERF-003 — Data payloads are less bounded than the shell (high, source-confirmed risk).** Keep the initial shell budget separate from data budgets. Add server-side pagination/coverage and client-side render limits for Atlas, trace, Forge, Blueprint, Lore, and dream output before testing large stores. Measure small, representative, and long-record fixtures; record payload bytes and DOM node counts separately. Do not hide map/data cost inside “application shell” bytes.

## Responsive and visual cost

The screenshots show a simple, low-layout-complexity page, not expensive visual effects:

- Desktop full-page height: 2,623 px at 1,440 px width.
- Handheld full-page height: 3,734 px at 390 px width.
- The handheld route is roughly 1.42x taller and stacks all nine sections and ten forms. This supports provisional `UI-001`/`UI-005` findings about discoverability and task continuity, but it does **not** establish slow layout, CPU pressure, or a performance regression.
- CSS has no media queries, transitions, animations, shadows, gradients, canvases, maps, or graph renderer (`src/server.mjs:25-31`). The visual cost is therefore likely dominated by document length and future data rendering, not effects.
- Required 320px reflow, orientation, text scaling, authenticated populated content, long outputs, and keyboard/on-screen-input behavior have no captured evidence (`coverage.json:7-30,33-52,55-130`).

**PERF-004 — Narrow layout cost is interaction cost, not measured runtime slowness (medium, confirmed visually / runtime unverified).** Preserve the assessment finding that the handheld page is an excessive scroll stack. Do not label it a Web Vital failure or claim a speedup until a controlled browser run measures layout, long tasks, input latency, and memory with equivalent paired data.

## Theme integration risk

Current styling is entirely inline and unversioned (`src/server.mjs:25-31`). It exposes only three semantic-ish variables (`--surface`, `--ink`, `--accent`) while hard-coding border, muted text, and focus colors. `color-scheme: light dark` is present, but there is no theme module, registry, settings surface, validation, persistence, invalid-selection fallback, or rollback path (`findings.json:UI-006`, `src/server.mjs:25-31`).

A later theme must:

1. Keep the current inline style as a working fallback until a validated replacement exists.
2. Use local CSS/SVG assets only; do not add runtime dependencies or remote requests.
3. Stay under 131,072 raw and 40,960 gzip bytes for declared theme assets, while measuring the full application shell separately.
4. Preserve same-origin pairing, route/API behavior, identifiers, revisions, scope, provenance, budgets, authored/generated Lore separation, and hypothetical dream state.
5. Test light/dark, forced colors, reduced motion, contrast in real states, and 320px/390px/desktop reflow; source token review alone is insufficient.

**PERF-005 — Theme lifecycle is an integration risk (medium, source-confirmed).** The current CSS is cheap but not an integration contract. A framework or runtime theme loader could consume most budget and introduce hidden network or startup work. Freeze semantic tokens and a no-dependency adapter before page-family implementation. `UI-006` is directionally correct; its acceptance still lacks runtime theme-switch, fallback, persistence, and rollback evidence.

## Dependency and reproducibility notes

- `package.json` exposes `test`, `test:m0`, `start`, `mcp:start`, import, PNG inspection, OMP probe, and `release:check` scripts (`package.json:9-17`). There is no bundle-size, browser-performance, request-trace, accessibility, or network-failure script.
- `release:check` runs Node tests, bootstrap validation, and syntax checks, but no Playwright/browser check (`package.json:17`). Existing Playwright is available as a dev dependency, yet no package script binds it to Observatory acceptance.
- `package.json` reports version `1.11.0`, while the lockfile root package reports `1.5.0` (`package.json:1-4`, `package-lock.json:7-18`). This is a reproducibility/release evidence risk. It does not change the measured page bytes, but future payload reports must record which installed revision produced them.

## Verification matrix

| Check | Status | Evidence or gap |
| --- | --- | --- |
| Raw inline CSS/JS/shell bytes | measured | Source extraction above |
| Gzip CSS/JS/shell bytes | measured laboratory result | gzip level 9; not a wire capture |
| External runtime assets/remote URLs | source-checked | No `<link>`, `<img>`, font-face, or remote URL in shell; actual network trace absent |
| Unpaired landing render | observed | Chromium screenshots, page errors empty |
| Paired/authenticated render | unverified | No authenticated screenshot or browser interaction evidence |
| API response sizes and p50/p95 latency | unverified | No fixture, HAR, timing table, or sample count |
| Cold/warm cache comparison | unverified | No cache-control/resource-timing evidence |
| LAN failure and recovery | unverified | Offline product is not required, but this network behavior remains applicable |
| 320px reflow and long data | unverified | Coverage marks only unpaired 1440/390 cases observed |
| CPU, memory, GPU, long tasks, input latency | unverified | No performance trace or platform measurement |
| Field Core Web Vitals | not applicable to current evidence | Local single capture cannot establish field p75; no LCP/INP/CLS trace |
| Node application tests | baseline passed, not rerun here | `baseline/npm-test.log:86-93`; 81/81 pass |
| Browser/accessibility checks | unverified | `UI-007`; screenshots cannot establish WCAG 2.2 AA |

## Single next-phase recommendation

Build one controlled Playwright measurement fixture before theme/page implementation: pair a fresh local browser, seed bounded small/medium/large records, capture HAR plus `performance` entries for each existing action, and record response bytes, p50/p95 latency, long tasks, DOM node count, and memory where available at 1440, 390, and 320 px. Repeat cold and warm cache, then simulate LAN request failure and recovery. Use this baseline to set data/render budgets separately from the 18 KB shell and to reject theme changes that breach zero-remote/zero-added-dependency constraints.

## Limitations

No second-device LAN test, screen-reader session, contrast measurement, authenticated screenshot, populated-data capture, browser trace, HAR, Core Web Vitals field sample, CPU/memory/GPU profile, or network failure/recovery run was available. Findings above separate source-confirmed behavior, visual observations, local payload measurements, and unverified runtime claims.