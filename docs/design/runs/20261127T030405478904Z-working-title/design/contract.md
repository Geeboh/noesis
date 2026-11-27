# NOESIS Observatory — shared Design contract

**Contract revision:** `design-contract-20261127.2`
**Phase:** Design, after the recorded Plan selection  
**Status:** implementation-ready contract draft; **not** a Design approval, Produce approval, registration, package publication, deployment, or release decision.  
**Owner:** `ui-theme-engineer` (`openai-codex/gpt-5.6-luna`, `provider-default`)  
**Owned file:** `docs/design/runs/20261127T030405478904Z-working-title/design/contract.md`

**Revision and invalidation note:** This revision incorporates the inspected NosisArt references. It invalidates any downstream Design approval until the mockup inputs are refreshed and reviewed. It does not claim approval.

The recorded Plan decision is the authority for the direction: the user selected a hybrid with **Cortex Tabs** as the visual base and **Signal Deck** as the operational discipline. The Plan decision is recorded in `plan/selection.md` and `decisions.json`. This contract freezes the shared Design language only. It does not claim that the user approved this contract or any application change.

## 1. Scope and authority

### In scope

- A responsive web Design contract for the server-rendered NOESIS Observatory.
- Shared primitive, semantic, component, state, interaction, responsive, graphic, and theme-boundary rules.
- The modern tabbed shell for Observatory, Atlas, Lore, Reverie, and Forge.
- Status/open work first, resource inspection second, Reverie third, and correction/export after that.
- A larger brain activity surface and a bounded Atlas relationship/activity field inspired by the supplied particles.js reference, using only local reviewed SVG/CSS in the current scope.
- Desktop keyboard/pointer coverage at `1440px`, intermediate desktop coverage at `900–1260px`, handheld touch coverage at `390px`, and reflow coverage at `320px`.

### Out of scope for this phase

- Application source, tests, package manifests, lockfiles, routes, API handlers, service policy, or data-model changes.
- Theme files, theme registry edits, default-theme registration, production CSS/JS, or application integration.
- New runtime dependencies, remote requests, hosted fonts, CDN assets, `particles.js`, canvas/chart libraries, or model/provider installation.
- Native desktop/mobile resources or native adapters.
- New service capabilities. The contract may describe a view-model boundary, but it does not create an endpoint or invent a field absent from an authoritative service projection.
- WCAG, browser compatibility, field-performance, screen-reader, or second-device claims. Those remain later verification work.

### Authority order

1. Current project instructions and preserved product/service behavior.
2. User direction and the recorded Plan selection.
3. This contract for shared Design decisions.
4. Later approved mockups and implementation evidence.

A visual preference never overrides pairing, authorization, scope, identifiers, revisions, provenance, budgets, durable jobs, hypothetical-output rules, or authored/generated Lore separation.

## 2. Product behavior that Design must preserve

The dashboard projects service state. It does not become a second memory store or a second policy engine.

- Pairing gates private reads and mutations. The unpaired surface contains no private memory.
- Same-origin requests, authorization, scope, identifiers, revisions, provenance, budgets, durable jobs, cancellation/resume behavior, and existing service routes remain authoritative.
- Acknowledged work is not silently shown as completed work.
- `retrieved`, `included`, `applied`, and `validated` remain separate facts.
- Source evidence, derived observations, generated Lore, authored Lore, imported/copied descendants, hypotheses, and actual outcomes remain visibly distinct.
- A simulated or imagined outcome remains hypothetical and cannot be shown as an executed experiment.
- Current explicit instructions override stored preferences.
- Ebb activation is separate from evidence, confidence, validity, and retention.
- Scoped exports never include unrelated preferences or credentials and never patch or publish a target.
- Missing, partial, unknown, stale, unavailable, failed, or indeterminate service facts stay visibly different from zero, success, or completion.
- Tab changes, theme changes, reloads, dialogs, retry, and responsive rearrangement preserve route, selected resource/version/scope, input values, business data, and durable job identity unless the service explicitly reports a mutation.

## 3. Direction and visual principles

The look is restrained, calm, and understated science fiction:

- deep ink and pale instrument surfaces;
- quiet cyan signal accents;
- sparse violet derived/focus accents;
- restrained amber review/waiting accents;
- restrained coral failure accents;
- thin geometry, small local SVG symbols, and minimal shadow;
- no decorative gradient, blur, or animation competing with evidence;
- text, shape, and icon always reinforce status color.

Cortex Tabs supplies the shell: persistent tabs, selected-context strip, status-first Observatory, desktop rail/canvas/inspector, and deliberate narrow reflow. Signal Deck supplies the discipline: explicit stages, provenance inspection, bounded data, local retry, and indeterminate-state honesty.

The particles.js reference is **visual inspiration only** in this scope. It does not authorize importing, linking, copying, or executing particles.js. A later local vendoring decision would require a separate approved security, licensing, dependency, and budget review.

## 4. Token architecture

Use three layers. Application components consume semantic or component tokens only. Primitive names never carry business meaning in application markup.

1. **Primitive tokens:** raw color, dimension, type, radius, and motion values.
2. **Semantic tokens:** roles such as canvas, surface, text, focus, success, warning, danger, evidence, and selection. Light/dark values map here.
3. **Component tokens:** aliases for a specific shared component state, such as tab-selected underline, inspector border, button height, alert background, or field error border.

The editable source remains `tokens.json`. Generated CSS remains deterministic `tokens.css`; component rules remain scoped `theme.css`. The Theme Module v1 required paths must exist: `color.background`, `color.surface`, `color.text`, `color.muted`, `color.primary`, `color.on-primary`, `color.border`, `color.focus`, `color.danger`, `color.on-danger`, `color.success`, `color.on-success`, `space.1`, `space.2`, `space.3`, `space.4`, `space.6`, `space.8`, `radius.sm`, `radius.md`, `radius.lg`, `motion.fast`, and `font.family`.

### 4.1 Primitive palette

These values reconcile the approved concepts. They are Design inputs, not a completed contrast audit.

| Primitive | Light | Dark | Intended role |
|---|---:|---:|---|
| `color.canvas-light` | `#f1f6fb` | — | light page canvas |
| `color.canvas-dark` | — | `#07111e` | dark page canvas |
| `color.surface-light` | `#ffffff` | — | light card/inspector surface |
| `color.surface-dark` | — | `#0d1b2a` | dark card/inspector surface |
| `color.text-light` | `#14263a` | — | light primary text |
| `color.text-dark` | — | `#eaf2ff` | dark primary text |
| `color.muted-light` | `#4d5b66` | — | light secondary text |
| `color.muted-dark` | — | `#a9bac2` | dark secondary text |
| `color.border-light` | `#7a8d99` | — | light boundaries |
| `color.border-dark` | — | `#294356` | dark boundaries |
| `color.signal-light` | `#087b83` | — | light primary signal |
| `color.signal-dark` | — | `#71d7d0` | dark primary signal |
| `color.focus-light` | `#6b4fd5` | — | light focus ring |
| `color.focus-dark` | — | `#b7a9ff` | dark focus ring |
| `color.success-light` | `#1b6b55` | — | light validated/healthy |
| `color.success-dark` | — | `#7bd4b2` | dark validated/healthy |
| `color.warning-light` | `#815b0a` | — | light review/waiting |
| `color.warning-dark` | — | `#f2c979` | dark review/waiting |
| `color.danger-light` | `#9c3344` | — | light error/destructive |
| `color.danger-dark` | — | `#ff9ca9` | dark error/destructive |
| `color.derived-light` | `#5b49ad` | — | light derived/interpreted |
| `color.derived-dark` | — | `#ae9cff` | dark derived/interpreted |

The implementation must re-check every actual foreground/background pair, including hover, selected, disabled, focus, alert, badge, overlay, chart, SVG, and forced-colors states. The source concepts report sample ordinary-text ratios, but this contract records intent, not a passed contrast result.

### 4.2 Semantic tokens

| Semantic token | Light mapping | Dark mapping | Required meaning |
|---|---|---|---|
| `color.background` | `color.canvas-light` | `color.canvas-dark` | application canvas |
| `color.surface` | `color.surface-light` | `color.surface-dark` | card, panel, inspector |
| `color.surface-raised` | `#ffffff` | `#13263a` | raised dialog/command surface |
| `color.text` | `color.text-light` | `color.text-dark` | primary readable text |
| `color.muted` | `color.muted-light` | `color.muted-dark` | secondary/read-only text |
| `color.primary` | `color.signal-light` | `color.signal-dark` | links, active controls, signal |
| `color.on-primary` | `#ffffff` | `#07111e` | text on primary control |
| `color.border` | `color.border-light` | `color.border-dark` | non-decorative boundaries |
| `color.focus` | `color.focus-light` | `color.focus-dark` | visible keyboard focus |
| `color.success` | `color.success-light` | `color.success-dark` | completed/validated/healthy |
| `color.on-success` | `#ffffff` | `#07111e` | text on success fill |
| `color.warning` | `color.warning-light` | `color.warning-dark` | pending/review/indeterminate |
| `color.on-warning` | `#ffffff` | `#07111e` | text on warning fill |
| `color.danger` | `color.danger-light` | `color.danger-dark` | error/destructive |
| `color.on-danger` | `#ffffff` | `#07111e` | text on danger fill |
| `color.derived` | `color.derived-light` | `color.derived-dark` | derived/generated interpretation |
| `color.on-derived` | `#ffffff` | `#07111e` | text on derived fill |
| `color.selection` | `#dceff1` | `#153c47` | selected row/context, never focus alone |
| `color.overlay` | `rgb(7 17 30 / 0.55)` | `rgb(0 0 0 / 0.68)` | dialog backdrop |
| `color.chart-line` | `#087b83` | `#71d7d0` | actual relationship/activity line |
| `color.chart-node` | `#5b49ad` | `#ae9cff` | actual derived/related node |

Spacing uses `space.1=4px`, `space.2=8px`, `space.3=12px`, `space.4=16px`, `space.6=24px`, and `space.8=32px`. Add `space.10=40px` and `space.14=56px` only where the supported token compiler accepts them.

Typography uses a local system stack only: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Identifiers, hashes, timestamps, and aligned counts use `ui-monospace, SFMono-Regular, Consolas, monospace` with tabular numerals where supported.

| Type role | Size / line height | Use |
|---|---|---|
| `type.meta` | `0.75rem / 1.35` | timestamps, IDs, metadata |
| `type.label` | `0.875rem / 1.4` | labels, helper text |
| `type.body` | `1rem / 1.5` | body and long content |
| `type.card-title` | `1.25rem / 1.3` | panel/card heading |
| `type.page-title` | `1.75rem / 1.15` | active view heading |
| `type.display` | `2.5rem / 1.05` | sparse Observatory summary only |

Shapes: `radius.sm=8px`, `radius.md=12px`, `radius.lg=16px`, and optional `radius.xl=22px` for the application frame. Use `1px` borders and one low-contrast shadow only for the application frame, pairing dialog, and command surface. Do not use glass blur.

### 4.3 Component tokens

Component tokens alias semantics; components do not hard-code palette values.

| Component | Required component tokens and rules |
|---|---|
| Tab | `tab-height >=44px`; `tab-padding-inline=16px`; `tab-gap=8px`; selected uses `color.primary` plus text/underline; focus uses `color.focus`; selected and focus remain distinct |
| Button | `control-height >=44px` for important actions; primary uses `color.primary`/`color.on-primary`; secondary uses surface/border; destructive uses danger; disabled remains readable and explains unavailable state |
| Field | `field-height >=44px`; surface/background, border, focus ring, invalid border, helper/error text; labels remain visible |
| Card/panel | surface, border, `radius.md` or `radius.lg`, space.4/space.6 padding; no decorative elevation |
| Context bar | selection background, border, monospaced version/ID treatment, clear/details action tokens |
| Badge | text + icon/shape + semantic role; never color-only; `min-height` 24px for noninteractive badge |
| Status region | `role=status` or `role=alert` surface, border, icon, explicit status phrase, retry/action token where safe |
| Inspector | surface, border-start on desktop, stacked border-top on handheld; stable heading and deep-link target |
| Dialog | raised surface, overlay, `max-inline-size` constrained to viewport, safe close/control spacing, focus ring |
| Graph/field | actual data line/node colors, static fallback surface, legend and text alternative; no unbound decorative points |

Colour mode, density, and motion are independent. A dark selection does not imply compact density or animation. Default density is comfortable. Compact density may reduce table row padding but never reduces critical interactive controls below 44px.

### 4.4 Light, dark, and forced-colors intent

- Support `data-ui-color-mode="light|dark|system"` on the stable application root.
- `system` follows the host preference through the existing host adapter; it does not load remote assets.
- Light and dark modes share semantic roles and component geometry. Do not fork markup for color mode.
- Under `@media (forced-colors: active)`, use system colors (`Canvas`, `CanvasText`, `ButtonFace`, `ButtonText`, `Highlight`, `HighlightText`, `GrayText`), preserve visible borders and focus, remove nonessential background images, and retain status words/icons. Never rely on the particle/brain/pipeline stroke alone.
- High-contrast/forced-colors behavior requires actual browser verification later; this contract specifies intent only.

### 4.5 Reduced-motion intent

- Motion is an independent preference. `prefers-reduced-motion: reduce` maps transition/animation durations to `0ms`, disables keyframes, disables brain/pipeline heartbeat, and disables relationship-field layout movement.
- Reduced motion does not remove facts, labels, focus, stage state, coverage, or text/list alternatives. Static geometry and explicit status words remain.
- Normal mode may use only short, state-bound transitions for user-triggered changes or an actual service event. No autoplay, parallax, flashing, continuous decorative loop, or motion that delays a task.
- Do not use motion to communicate progress that the service did not provide. Verify reduced-motion behavior in a real browser later; this contract is intent, not evidence.


## 5. Shell and navigation contract

### 5.1 Stable structure

The application root owns `data-ui-theme`, `data-ui-color-mode`, and `data-ui-density`. The semantic structure is:

1. Skip link to `#main-content`.
2. Header: NOESIS Observatory identity, pairing state, theme/preferences action, and command-palette trigger.
3. Primary tablist: `Observatory`, `Atlas`, `Lore`, `Reverie`, `Forge`. Each branded label has a plain description in accessible text.
4. Selected-context bar: resource identity, selected version/snapshot, and effective scope. It remains visible through tab handoffs and has a stable deep-link target.
5. Secondary section rail: current work, recent resources, durable jobs, Pulse/Chronicle/Lineage/Attunement/Ebb links where applicable.
6. Main task canvas: active area content, local loading/empty/error/recovery region, and bounded data.
7. Resource/provenance inspector: right-side on desktop, following the task content on narrow layouts.

The app may use one document with addressable state or a later router. The Design contract does not choose a routing implementation. Existing service routes and same-origin API behavior remain unchanged.

### 5.2 Primary tabs

- Use a native button-based tab pattern with `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and `tabindex`.
- Use roving `tabindex`: only the active/focused tab is in the sequential tab order; arrow movement moves focus among tabs.
- `ArrowLeft`/`ArrowRight` move within the tab strip, wrapping only if the implementation documents that behavior; `Home` and `End` move to first/last. `Enter` or `Space` activates the focused tab.
- Tab activation never clears selected resource/version/scope, form fields, filters, or durable job handles.
- Active tab is communicated by text, `aria-selected`, and non-color styling. Focus remains separately visible.
- At 390px and 320px, the tab strip may horizontally scroll. The page itself must not horizontally scroll.

### 5.3 Pairing gate

- Unpaired landing shows pairing explanation, one-use code field, expiry/invalid feedback, and no private records, counts, resource names, job IDs, or activity graphics based on private data.
- Successful pairing returns to the intended route when the service authorizes it. The paired state is announced locally.
- Invalid/expired code preserves entered context where safe, identifies the failure, and offers retry without exposing private data.
- Pairing errors do not get routed into an unrelated panel's status region.

## 6. Shared components and states

### 6.1 Shared primitives

Implement shared primitives before page-specific decoration:

- `AppFrame`, `SkipLink`, `Header`, `PairingStatus`, and `ThemeControl`.
- `PrimaryTabs`, `SectionRail`, `SelectedContextBar`, and `Inspector`.
- `Panel`, `Card`, `Stack`, `Cluster`, `Divider`, `Heading`, and `MonospaceValue`.
- `Button` variants: primary, secondary, quiet, destructive, icon-with-label. Critical icon-only actions are not allowed.
- `Field`, `FieldGroup`, `Select`, `Textarea`, `CheckboxGroup`, helper text, validation error, and required marker.
- `Badge`, `Status`, `Alert`, `Skeleton`, `EmptyState`, `PartialState`, `UnavailableState`, and `RetryAction`.
- `BoundedList`, `Table`, `Pagination/continuation`, `CoverageNote`, `ProvenanceChain`, and `RevisionHistory`.
- `BrainActivity`, `PipelineActivity`, `RelationshipField`, and their always-available text/list alternatives.
- Native `<dialog>`-based `InfoDialog`, `ConfirmDialog`, and `CommandPalette` patterns.

Use native controls wherever possible. A custom widget requires an explicit keyboard, focus, name, state, and recovery contract before implementation.

### 6.2 Common state semantics

| State | Required presentation and behavior |
|---|---|
| Default | readable label, helper text where needed, normal surface/border |
| Hover | small border/surface change; never the only indication |
| Focus-visible | strong `color.focus` outline/halo, at least 2px, not clipped or color-only |
| Pressed | short local state; no persistent busy indicator unless request starts |
| Selected | text + surface/border/indicator; distinct from focus |
| Disabled | `disabled` semantics where supported, readable reason, no pointer-only explanation |
| Loading | local `aria-busy`, skeleton or explicit “Loading …” phrase; preserve input and context |
| Empty | say “No …” and explain zero versus unknown/uncomputed; offer next action if applicable |
| Partial | show returned coverage, truncation/omission, continuation, and limitation |
| Unavailable | distinguish capability/provider not configured from request failure |
| Invalid | field-level error linked with `aria-describedby`; preserve input; name corrective action |
| Error | local alert names operation, reason, affected scope, and safe retry; no false empty/success |
| Recovery | “Retry queued”/“Waiting” wording; no invented percent or completion; preserve focus/context |
| Stale/conflict | identify revision/source mismatch; provide inspect/refresh/correct path, never overwrite silently |
| Queued | durable job ID and queued state; do not call it running/completed |
| Running-known | actual stage and known denominator only when API supplies both |
| Waiting-indeterminate | heartbeat/waiting label and reason; no percentage |
| Cancelled | explicit cancellation result and whether any accepted changes exist |
| Completed | completion report with actual outputs and coverage |
| Budget-exhausted | distinguish from failed/cancelled and list deferred work |
| Failed | preserve source/job state and retry/resume action only where service supports it |

## 7. Area contracts

### Observatory / Pulse

Default landing after pairing. Put open work, recent changes, unresolved processing failures, actual usage, and bounded activity first. Show actual counts only when the service projection supplies them. Pulse is not a decorative dashboard score and never shows an invented knowledge percentage.

Required regions:

- open-work list with durable links;
- brain activity figure and text alternative;
- pipeline stages/table with known versus indeterminate status;
- selected-resource handoff;
- local error/recovery region;
- coverage/omission note when the source projection is partial.

### Atlas

Heading: **Resources I know about**. Preserve resource identity, aliases, kind, origin, selected version/snapshot, scope, evidence facets, activity, unresolved problems, and dormant inclusion. Similar names do not merge resources. Bounded results show pagination/continuation and returned coverage.

Atlas selection pins resource ID, selected version/snapshot, and scope in the context bar. Lore and Forge actions consume that same context without retyping opaque identifiers. Atlas relationship exploration opens around a selected entity, with bounded depth/node count and explicit edge meanings: `derived from`, `used by`, `contradicts`, `supersedes`, `applies to`, and `hypothetical association`. A graph/field is optional enhancement; list/table remains the primary keyboard and screen-reader alternative.

### Lore

Show source-linked claims, generated sections, authored sections, last generated, last verified, stale/conflict state, backlinks, and refresh/edit actions. Generated and authored blocks remain separate. Refresh changes only dependent generated blocks and preserves authored blocks. A save/refresh response must show scoped diff and ownership, not discard the diff.

### Reverie

Creation form exposes only service-advertised level, mode, focus, scope, and budget. Unsupported capabilities are disabled with a reason. Job pages show durable job ID, evidence snapshot, actual stages, known units/denominators, actual usage, remaining/deferred work, outputs, applied changes, and reconnect/cancel/resume support as advertised. Output tabs distinguish observations/lessons, speculative ideas, experiments, wiki revisions, and changed memory state. Hypotheses remain hypothetical.

### Forge and Blueprint

Selected resource/version/scope stay pinned. Show supported strengths, problems, lessons, ideas, uncertainty, omissions, and attribution. Preview exact export before download. Export cannot patch or publish the target. A weak-evidence target becomes an investigation brief, not invented confirmed shortcomings.

### Attunement, Ebb, Lineage, Chronicle

These are addressable panels/views even when reached from another primary tab:

- Attunement separates stated and inferred preferences, episodes, counterevidence, correction, and exceptions.
- Ebb separates active/quiet/dormant from evidence/confidence/validity/retention and makes revival reversible.
- Lineage separates source, derivation, retrieval, inclusion, application, validation, dream origin, and hypothetical association.
- Chronicle shows revision/time history and disputes without treating browsing as confirmation.

## 8. Data and graphic contracts

### 8.1 General view-model rules

The browser consumes a service projection or fixture with an explicit `sourceRevision`, `scope`, `observedAt`, `coverage`, and `traceId` where the service provides them. It may format, sort within an explicitly documented UI order, and paginate. It may not infer new evidence, merge identities, compute confidence from color, manufacture progress, or promote hypothetical output.

Every bounded response should expose:

```text
coverage: {
  matched: number | null,
  included: number | null,
  omitted: number | null,
  truncated: boolean,
  continuation: string | null,
  reason: string | null
}
```

`null`/unknown stays visible as “unknown” or “not computed”; it is never rendered as zero.

### 8.2 Brain activity contract

`BrainActivity` is a larger local SVG surface. It is a visualization of facts already supplied by the service, not a second activity model.

```text
BrainActivity = {
  id: string,
  scopeId: string,
  sourceRevision: string,
  observedAt: string,
  facts: [
    {
      id: string,
      label: string,
      value: number | string | null,
      unit: string | null,
      state: "known" | "unknown" | "indeterminate",
      source: string | null,
      href: string | null
    }
  ],
  summary: string,
  coverage: Coverage
}
```

Rules:

- Render a marker, label, or signal only for an actual `fact`.
- `summary` is service-provided or a deterministic presentation of displayed facts; it never claims causality or confidence.
- No random particles, synthetic neural firings, fake counters, confidence clouds, or implied progress.
- The static SVG has a text caption and a visible list/table alternative. If the SVG duplicates the list, mark it `aria-hidden="true"`; if it conveys unique information, give it a precise accessible name and description.
- If facts are unavailable, show a static “Activity unavailable” state with the reason and alternative; do not animate an empty brain.
- Motion may show only a short transition for a newly observed service fact or an explicitly indeterminate waiting heartbeat. It must not run a continuous loop to imply work.

### 8.3 Pipeline activity contract

```text
PipelineStage = {
  id: string,
  label: string,
  state: "queued" | "running" | "waiting" | "completed" | "failed" |
         "cancelled" | "unavailable" | "unknown",
  completedUnits: number | null,
  totalUnits: number | null,
  unitLabel: string | null,
  updatedAt: string | null,
  sourceRevision: string,
  message: string | null,
  href: string | null
}
```

- Stage order comes from the service projection.
- Show `completedUnits / totalUnits` only when both values are known and valid.
- With no denominator, show `Waiting`, `Running`, `Unknown`, or the service message; never show a percentage.
- A failed stage is not rendered as a completed stage because later stages exist.
- The graphic is paired with a semantic table/list containing stage name, state, units, timestamp, and message.
- A reconnecting stream shows cursor/reconnect state and preserves the last known facts with a freshness label.

### 8.4 Atlas relationship field and particles.js-inspired treatment

A bounded **RelationshipField** may use a local static particle-field treatment in Atlas memory/resource relationships and the Observatory selected-resource handoff. The treatment is an understated arrangement of actual nodes and edges, not an ambient animation layer.

```text
RelationshipField = {
  centerId: string,
  depth: number,
  nodes: [
    {
      id: string,
      label: string,
      kind: string,
      state: string,
      relationCount: number | null,
      href: string | null,
      sourceRevision: string | null
    }
  ],
  edges: [
    {
      id: string,
      from: string,
      to: string,
      relation: string,
      state: "observed" | "derived" | "hypothetical" | "disputed" | "unknown",
      sourceRecordIds: string[],
      href: string | null
    }
  ],
  coverage: Coverage,
  textSummary: string
}
```

Rules:

- Every visible node maps to one actual bounded resource/record/entity ID.
- Every visible edge maps to one actual relation and preserves its relation label and source record IDs.
- Decorative particles, orphan dots, random edges, distance-based meaning, and force-simulation claims are prohibited.
- Use deterministic local layout based on stable IDs or server-provided coordinates. Do not use unseeded random layout.
- Apply a presentation cap of at most **24 visible nodes and 48 visible edges per field** unless a later budget review explicitly changes it. This is a rendering guard, not a substitute for service pagination. If the service returns more, show omitted/truncated coverage and an expand/next action where supported.
- The field never replaces the bounded list/table. The alternative lists node label, kind, relation, status, source/revision, and destination link in DOM order.
- Keyboard users operate the list/table and explicit “Open relationship” actions. Do not require pointer dragging, hover, or a graph gesture.
- SVG is local, reviewed, and scoped. No remote stylesheet/import, `particles.js`, executable SVG, canvas runtime, or unreviewed vendored code.
- Motion is off by default for relationship layout. If a later implementation adds a brief transition or heartbeat, it must stop under reduced motion and must not change node/edge data.
- Labels say “Relationship field” and “N nodes, M relationships; K omitted” where coverage is partial. They never call a graph complete unless the service says coverage is complete.
- If relationship data is absent or unauthorized, show list-safe unavailable/empty text. Never fill the field with decorative stand-ins.

The supplied particles.js URL remains a reference for atmosphere and spatial rhythm only. Reuse of its code or assets requires a later, separately recorded approval with license, security, byte, and performance evidence.

### 8.5 Provenance inspector contract

The inspector must expose:

- selected resource identity, version/snapshot, and scope;
- current record/revision identifiers;
- source/origin and observed time;
- evidence labels: `source evidence`, `derived observation`, `generated Lore`, `authored Lore`, `hypothetical`, and any applicable imported/copied status;
- retrieval, inclusion, application, and validation facts separately;
- temporal validity and Ebb activation separately;
- stale/conflict/uncertainty and coverage/truncation;
- revision history and safe correction/refresh/forget actions;
- external-export recall limit where a destructive action affects controlled derivatives.

A relation label is descriptive evidence of a link, not proof that the linked records are true.

## 9. Responsive contract

Use flexible tracks, logical properties, wrapping, and content-driven changes. Do not bake text into graphics. Long IDs, locators, hashes, and error messages use `overflow-wrap:anywhere` and remain copyable.

| Viewport | Layout contract |
|---|---|
| `1440px` desktop | Three columns: approximately `205px` section rail, fluid main task canvas, approximately `312px` inspector. Pipeline and lineage may sit side-by-side when readable. Pointer and keyboard paths both supported. |
| `900–1260px` desktop | Two columns: rail + main canvas. Inspector moves below the main content and uses a two-column detail grid when width permits. No important control is clipped. |
| `390px` handheld | One stack: header → horizontally scrollable primary tabs → sticky selected-context bar → active task → inspector. Compact rail becomes a horizontal section row. Cards stack; important controls remain at least 44px high. |
| `320px` reflow | Tabs scroll rather than wrap into clipped controls. Actions become full-width. Resource depth metadata may hide only when the same identity remains in text/context. Lineage becomes vertical; meaning grids become one column; locators wrap. The page itself has no horizontal overflow. |

Apply `padding-inline-start/end: env(safe-area-inset-*)` to the production handheld shell where supported. This contract has no native orientation-specific surface. Verify text resizing, zoom, on-screen keyboard, landscape, and safe-area behavior during later browser review.

## 10. Keyboard, focus, dialog, and status behavior

### 10.1 Focus and reading order

- DOM order is header → primary tabs → selected context actions → section rail → main heading/actions/content → inspector.
- A skip link is the first focusable item and moves to `#main-content`.
- Focus-visible outlines use the semantic focus token, remain visible on every surface, and are not entirely obscured by sticky bars/dialogs.
- Passive async updates never steal focus. A user-triggered action may move focus to its newly revealed result heading or error only when the move is necessary and documented.
- Focus survives tab changes and responsive rearrangement as far as the same logical control exists.
- Dynamic lists have stable labels and do not reuse ambiguous generated inputs. Repeated preference correction controls include preference ID or statement in their accessible name.
- No critical action is hover-only, drag-only, icon-only without a name, or dependent on color vision.

### 10.2 Dialogs and command palette

Use native `<dialog>` where the web host supports it, with a tested fallback only if the host requires one.

- Every dialog has `aria-labelledby` and, when needed, `aria-describedby`.
- On open, focus the first meaningful control. Destructive confirmation initially focuses Cancel/safe action.
- Keep focus within a modal dialog while open. `Escape` closes without mutation. Return focus to the invoking control after close.
- Backdrop click may close explanatory dialogs. Destructive confirmation dialogs require explicit Cancel/Confirm and do not mutate on backdrop/Escape.
- Do not nest modal dialogs. Explain pairing, provenance, coverage, or graph semantics in an information dialog; place irreversible forgetting/export-impact confirmation in a confirm dialog.
- Command palette has a labelled input, result count/status, keyboard movement, `Enter` to invoke, `Escape` to close, and a no-results state. It searches only authorized actions/records returned by the service.
- Dialogs and portals inherit the stable root theme attributes. A theme swap must not detach or restyle an open dialog into an unreadable state.

### 10.3 Accessible status and labels

- Use landmarks: `header`, labelled `nav`, `main`, `aside`, and labelled regions.
- Every form control has a visible label or an explicit accessible name. Helper/error content is linked with `aria-describedby`; required state is programmatically exposed.
- Use one local `role="status"` live region per async surface for queued/success/recovery updates. Use `role="alert"` for actionable errors. Do not send Atlas/Lore/Reverie messages to the pairing status region.
- Status text includes the state word and scope, for example `Queued: Reverie job <id>` or `Waiting: provider response has no known denominator`.
- `aria-busy="true"` is limited to the region actually loading. Preserve submitted input and selected context.
- Status badges include text and may include the local SVG icon; color is redundant.
- Each graph/brain/pipeline has a visible caption and a list/table alternative. Meaningful icons have a name; decorative icons are `aria-hidden="true"`.

## 11. Theme API boundary and lifecycle

The project currently has no inspected versioned theme module, registry, settings surface, or theme build script. This contract defines the boundary for later Produce work; it does not implement or register one.

### Theme module boundary

Later web implementation uses Theme Module v1:

```text
themes/<id>/
  theme.json       # manifest, compatibility, budgets, contrast pairs
  tokens.json      # editable source of truth
  tokens.css       # generated deterministic variables
  theme.css        # scoped component presentation only
  icons.svg        # small local reviewed subset
  preview.html     # local specimen, not application runtime
  README.md
  LICENSE.txt
  CHANGELOG.md
```

- The app adapter owns theme selection, validation, state persistence, root attributes, fallback, and portal inheritance.
- The theme module owns declarative tokens, scoped CSS, and local SVG symbols. It owns no application behavior, API calls, routing, authorization, storage, or arbitrary executable hooks.
- Scope selectors beneath `[data-ui-theme="<id>"]`; do not use global resets, `:root`, remote imports, data URLs, executable SVG, or incidental route selectors.
- `tokens.json` is edited; generated CSS is rebuilt, never hand-diverged.
- Registry entries are local, known, and validated before activation. Do not offer arbitrary archive upload in this scope.
- Resolve preference in this order: user preference → device/project default → known-good bundled fallback → preserved current baseline styling while recovery runs.
- Invalid, missing, removed, or incompatible selection keeps the previous known-good theme, reports an actionable local status, and preserves route, focus, forms, scroll, selected context, and business data.
- Theme swap does not reload the page where the host supports safe swapping. It must be tested against every dialog and async state, not just preview.html.
- `light|dark|system`, density, and reduced-motion behavior remain separate settings. Unsupported controls are not shown.
- Registration/default selection is a later lifecycle action. Scaffolding or a successful module check must not register or activate a default.

### Current fallback and rollback

Before any later theme migration, preserve the current inline Observatory styling as a known-good fallback. A rollback restores the prior style pointer/version and registry backup without deleting run history or application data. If activation fails, restore the prior theme before surfacing the error. Never clear the UI or silently reset business state to recover from a theme error.

## 12. Dependency, network, and byte budgets

Hard project constraints for this scope:

- Added runtime dependencies: **0**.
- Remote runtime requests: **0**. This includes fonts, icons, images, scripts, stylesheets, analytics, and particle libraries.
- Declared theme runtime assets: at most **131,072 raw bytes** and **40,960 gzip bytes** as measured by the supplied validator. These are project budgets, not browser-wire guarantees.
- Theme preview/docs/token source are excluded from runtime byte totals, but application shell JS, data payloads, fonts, request overhead, and maps require separate measurement.
- Prefer system fonts, a small SVG subset, static local geometry, no canvas, no blur, no continuous GPU animation, and no chart/graph library.
- Concept byte estimates are estimates only. No production byte or performance result is claimed by this contract.

If a local particle-field implementation cannot fit the budget or introduces measurable runtime cost, keep the static SVG/list treatment and reject the richer effect. Do not weaken the validator or add a dependency to pass a visual preference.

## 13. Ownership and integration contract

- `ui-theme-engineer` owns this shared contract and any later shared token/primitive/adapter change. Page workers consume it and must not fork shared semantics.
- The main director owns integration, Design approval, coverage reconciliation, and phase transitions.
- A future implementer owns application integration only after Produce is authorized. The implementer must preserve the current service routes and report exact changed paths, checks, evidence, and deviations.
- A future independent reviewer must inspect shared-component and page output without authoring the same files.
- No worker may edit this contract, a theme registry, or shared tokens outside its assigned ownership. Proposed changes return to the contract owner and invalidate affected mockup/review inputs.
- This phase has no application code/test/package/registry changes. Only this contract file is owned output.

## 14. Synthetic fixture identifiers

Fixtures are deterministic, synthetic, and illustrative. They are not live NOESIS records and must never be presented as real activity, confidence, progress, or validation.

### Canonical selected-resource fixture

| Fixture ID | Value |
|---|---|
| `fixture-resource-astra-parser` | display name `Astra Parser`; kind `tool`; origin `local / managed` |
| `fixture-version-astra-parser-v2-4-1` | version `v2.4.1` |
| `fixture-scope-project-nebula` | scope `project / nebula` |
| `fixture-snapshot-astra-parser-v2-4-1` | synthetic snapshot identifier |

### Secondary concept-shape fixture

| Fixture ID | Value |
|---|---|
| `fixture-resource-threadloom-mcp` | display name `Threadloom MCP`; kind `MCP server`; origin `local / managed` |
| `fixture-version-threadloom-mcp-v2-4-1` | version `v2.4.1` |
| `fixture-scope-project-noesis` | scope `local / project: noesis` |

### State and evidence fixtures

- `fixture-pairing-unpaired`, `fixture-pairing-invalid`, `fixture-pairing-expired`, `fixture-pairing-paired-return`.
- `fixture-record-source-001`, `fixture-record-derived-001`, `fixture-record-lore-generated-001`, `fixture-record-lore-authored-001`, `fixture-record-hypothesis-001`.
- `fixture-job-reverie-form`, `fixture-job-reverie-queued`, `fixture-job-reverie-running-known`, `fixture-job-reverie-waiting-indeterminate`, `fixture-job-reverie-cancelled`, `fixture-job-reverie-completed`, `fixture-job-reverie-budget-exhausted`, `fixture-job-reverie-failed`.
- `fixture-failure-atlas-timeout-001`, `fixture-failure-lore-request-001`, `fixture-recovery-retry-preserves-context-001`.
- `fixture-coverage-partial-001` with bounded rows, omitted count, and continuation.
- `fixture-relationship-field-bounded-001` with real-looking fixture IDs only, explicit relation labels, and an omitted/truncated case.

Fixtures must retain stable IDs across mockups and browser tests. A fixture name does not grant authorization or imply a backend route exists.

## 15. Complete coverage mapping prerequisites

The initial assessment `coverage.json` was an explicit `inventoryComplete: false` baseline. The current Design handoff is `design/coverage.json`, which is `inventoryComplete: true` with reconciled mockup families, exact state × viewport records, overlays, and `applicationImplementation: "unverified"`. This contract is not application coverage evidence and does not claim runtime behavior.

### Required surface IDs and state families

Every declared state must map to every applicable viewport (`desktop-1440`, `desktop-900-1260`, `narrow-390`, `reflow-320`) or carry an explicit applicability exclusion with a reason. Critical empty, failure, and recovery states cannot all be excluded.

| Surface ID | Required state families |
|---|---|
| `observatory-shell` | unpaired, paired-empty, paired-populated, loading, partial, error, recovery |
| `pairing` | code-entry, invalid-code, expired-code, paired-return, unavailable/error |
| `capture-recall` | empty, editing, submitting, success, results, partial, error, recovery |
| `reverie` | form, validation, queued, running-known, waiting-indeterminate, reconnecting, cancelled, completed, budget-exhausted, failed |
| `atlas` | empty, loading, list, selected, relationship-field, partial, stale/disputed, error, recovery |
| `attunement` | empty, list, correcting, success, conflict, error, recovery |
| `ebb` | empty, list, evaluating, active/quiet/dormant, reviving, forgetting-confirm, success, conflict/error |
| `lore` | empty, loading, loaded, editing-authored, generated, stale, conflict, diff, refresh-success, error, recovery |
| `forge` | empty, loaded, export-preview, partial/omitted, dream-queued, export-success, error, recovery |
| `pulse` | open-work, no-open-work, known-activity, indeterminate-wait, partial, error |
| `lineage` | selected, source-chain, derived-chain, hypothetical-chain, partial, unknown, error |
| `chronicle` | empty, list, selected-revision, conflict/dispute, partial, error |
| `command-palette` | closed, open-empty, results, no-results, action-error, recovery |

Also map all applicable overlays/dialogs: pairing feedback, provenance explanation, graph relationship explanation, forgetting confirmation, export-impact confirmation, correction conflict, command palette, and any route-specific dialog discovered during source reconciliation.

### Required case record

For each applicable state × viewport case, coverage must record:

```text
{
  state,
  viewport,
  mockup,
  implementation,
  qaEvidence
}
```

`implementation` must link actual application source/runtime evidence, not relabel a mockup. `qaEvidence` must identify visual, keyboard/accessibility, functional, and relevant performance/recovery evidence. Use stable surface IDs and real route/trigger names. Reconcile navigation, feature/capability states, authorization states, dialogs, deep links, long content, orientation/safe area, and on-screen keyboard effects before setting `inventoryComplete: true`.

Design approval inputs must include this contract, every approved mockup file, and all approved Plan inputs. Any change to tokens, shared components, route inventory, source requirements, or selected direction invalidates affected mockups and review evidence.

## 16. Later verification gates

This contract enables implementation; it does not satisfy these gates:

- early host-feasibility slice with real controls, theme variables, focus, dialog/portal, narrow layout, and one failure/recovery state;
- complete mockup coverage and independent Design review;
- browser keyboard, focus, labels, status, dialog, reflow, reduced-motion, forced-colors, and representative assistive-technology checks;
- authenticated pairing, same-origin API, durable job reconnect/cancel/resume, scoped resource handoff, authored Lore preservation, correction, forgetting, and export behavior;
- actual Atlas relationship data, bounded rendering, list/table equivalence, and no fabricated graph facts;
- theme build/check, runtime registry selection, reload persistence, invalid-selection fallback, and rollback;
- raw/gzip theme and application payload measurements, request count, long-content behavior, and representative interaction performance;
- network failure/recovery on the LAN-served application and second-device reachability where available;
- any native adapter/build/accessibility/device checks, if a native target is later introduced.

A successful local concept render, CSS check, package check, or browser screenshot cannot replace these checks.

## 17. Explicit risks

| Risk | Control |
|---|---|
| Activity graphics become a second progress model | Bind every marker/stage to service facts; show known denominator only when supplied; keep text/table alternative. |
| Particle-field treatment implies fabricated relationships | Render only bounded API nodes/edges; stable IDs; relation labels/source IDs; no orphan particles or random edges. |
| Relationship field becomes inaccessible | Keep list/table as the keyboard and assistive-technology path; graph is supplemental. |
| Tabs lose selected scope or form/job state | Treat context bar and durable IDs as shared shell state; verify tab/reload/resize preservation. |
| Status colors fail contrast or forced-colors | Recheck actual rendered states; use words/icons/borders; forced-colors overrides. |
| Theme activation breaks current shell | Preserve baseline fallback; validate local assets and API version before activation; rollback pointer/version atomically. |
| Unbounded Atlas/Lore/dream data harms performance | Server pagination/continuation remains authoritative; apply rendering caps and visible omission language. |
| Concept fixture is mistaken for live service evidence | Mark all fixtures synthetic; never display them in production; require real service projections in integration. |
| Browser/native capability is assumed from a concept board | Keep unverified facts explicit; run actual host/browser/native checks before any acceptance claim. |

## 18. Source record

- Current user direction in the task: modern tabbed interface; Cortex Tabs preferred; restrained futuristic understated science fiction; status/open work first; resource inspection; Reverie; correction/export; desktop keyboard/pointer; `390px` touch; `320px` reflow; larger brain graphic containing actual activity; particles.js-inspired visual treatment without remote/runtime dependencies.
- `AGENTS.md`
- `docs/01-PRODUCT-SPEC.md`
- `docs/02-ARCHITECTURE.md`
- `docs/07-DASHBOARD-AND-LORE.md`
- `docs/10-VALIDATION-AND-EVALUATION.md`
- `package.json`
- `src/server.mjs`
- `test/observatory.test.mjs`
- `ui-design-studio.json`
- `.omp/skills/ui-design-studio/references/project-context.md`
- `.omp/skills/ui-design-studio/references/workflow.md`
- `.omp/skills/ui-design-studio/references/visual-system.md`
- `.omp/skills/ui-design-studio/references/theme-module.md`
- `.omp/skills/ui-design-studio/references/quality-gates.md`
- `.omp/skills/ui-design-studio/references/run-records.md`
- `.omp/skills/ui-design-studio/references/multi-agent.md`
- `docs/design/runs/20261127T030405478904Z-working-title/brief.md`
- `docs/design/runs/20261127T030405478904Z-working-title/report.md`
- `docs/design/runs/20261127T030405478904Z-working-title/findings.json`
- `docs/design/runs/20261127T030405478904Z-working-title/coverage.json`
- `docs/design/runs/20261127T030405478904Z-working-title/plan/selection.md`
- `docs/design/runs/20261127T030405478904Z-working-title/plan/concept-cortex/concept.md`
- `docs/design/runs/20261127T030405478904Z-working-title/plan/concept-signal/concept.md`

## 19. NosisArt source/reconciliation

The source is the user-supplied `/code/NosisArt/` reference set, not a production asset grant:

- `braingraphconcept.webp` is an implementation concept. Reconcile its explicit modules, named nodes, typed edges, and connector hubs with source identity; do not copy labels or infer causality from proximity.
- `braingraphstyle1.jpg` and `braingraphstyle2.jpg` are style inspiration: use a larger contained brain/data surface, dark technical HUD framing, restrained cyan signal, and sparse amber/violet/coral semantic accents.
- `braingraphidea1.webp` through `braingraphidea5.webp` are general inspiration only. Filename guidance excludes literal people, rooms, and tables where stated.
- Do not ship raster, stock, watermarked, or unknown-license reference assets. Use local reviewed vector/CSS treatment only; preserve the existing no-remote, no-new-dependency, and no-`particles.js` exclusions.
- Bind brain, module, node, edge, and connector visuals only to actual bounded service data. Keep a list/table alternative as the accessible primary path; reduced motion disables or simplifies animation and retains static/text alternatives.

These references reconcile visual direction only. They do not override provenance, accessibility, budget, responsive, or runtime behavior requirements.
