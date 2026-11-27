# Cortex Tabs

Concept ID: `cortex-tabs`  
Phase: Plan / guided  
Surface: browser concept board, not application implementation  
Representative data: synthetic Astra Parser resource, version `v2.4.1`, scope `project / nebula`

## Rationale

**Cortex Tabs** treats NOESIS as a calm cognitive workspace instead of a stack of forms. A persistent tab strip exposes Observatory, Atlas, Lore, Reverie, and Forge. A selected-context strip carries resource identity, version, and scope through every handoff. The desktop composition uses a section rail, status-first task canvas, and resource inspector; handheld deliberately stacks the same relationship rather than shrinking a desktop screenshot.

The visual direction is restrained science fiction: deep ink surfaces, quiet cyan signal lines, sparse violet/amber/coral status accents, thin geometry, and no decorative gradients that compete with evidence. The brain graphic visualizes active observations and a waiting source-confirmation link. The pipeline graphic names known stages and uses a heartbeat for indeterminate acknowledgement; it never invents a percentage.

The board directly addresses assessment findings `UI-001`, `UI-002`, `UI-003`, `UI-004`, `UI-005`, `UX-001`, `UX-002`, `UX-003`, `UX-006`, `UX-007`, `UX-009`, and `UX-010` by making status local and addressable, preserving resource context, separating lineage labels, and specifying narrow reflow.

## Files

- `index.html` — complete renderable concept board with Observatory status, Atlas selection, provenance inspector, Lore/Forge handoff, failure recovery, state specimens, dialog, and local interactions.
- `styles.css` — tokenized no-dependency CSS, dark/light theme preview, desktop/handheld/reflow layout, reduced-motion and forced-colors rules.
- `assets/brain-activity.svg` — local static brain signal graphic.
- `assets/pipeline-activity.svg` — local static pipeline stage graphic.

Open `index.html` directly or serve this directory with any static local server. No network or runtime dependency is needed.

## Shared visual rules

### Semantic swatches

| Role | Dark value | Light preview | Intended use | Contrast intent |
|---|---|---|---|---|
| Canvas | `#07111e` | `#f1f6fb` | page background | deep ink / signal ink |
| Surface | `#0d1b2a` | `#ffffff` | cards and inspector | `#eaf2ff` / `#14263a` text |
| Signal | `#71d7d0` | `#087b83` | active tab, links, focus halo, source state | text is paired with labels/shapes |
| Review | `#f4c96b` | `#946509` | pending, indeterminate, caution | never sole status cue |
| Failure | `#ff8f86` | `#b94b49` | error and recovery | paired with `request failed` / icon |
| Validated | `#7ee3a1` | `#1c7b47` | completed / healthy | paired with `done` / `examined` |
| Derived | `#ae9cff` | `#5b49ad` | interpretation badge | paired with `derived observation` |

Semantic meaning is always written as text. Status color is redundant support, not the only channel. The `<button>` theme switch previews a light surface without adding a second asset or dependency.

### Type and spacing

- Font: system stack (`Inter`, `ui-sans-serif`, `system-ui` fallback); no hosted font.
- Body: `15px / 1.5`; small metadata: `10–12px`; headings: `17–28px`; avoid all-caps prose.
- Numerals and digests use a local monospace stack.
- Spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 56px`.
- Shape: 7–12px controls, 15–16px cards, 22px major panels; 1px lines, minimal shadow.
- Density: desktop compact but readable; handheld keeps 44px important controls and stacks rather than compressing labels into rows.

### Icon language

Five local text/SVG-friendly glyphs repeat across navigation and shortcuts: `◌` Observatory pulse, `⌘` Atlas resource, `⟿` Lineage, `↻` Recovery/Reverie, and `✦` Reverie. They share rounded containers, 1px outlines, and no icon-only critical action without an accessible label. The board intentionally avoids a bundled icon library.

## Navigation and interaction contract

1. Pairing succeeds before private data appears. The header shows `Paired · local`; unpaired/error pairing variants remain a later application state, not fabricated board behavior.
2. Primary tab strip: Observatory → Atlas → Lore → Reverie → Forge. Tabs use `role=tab`, `aria-selected`, roving `tabindex`, and Arrow/Home/End keyboard movement. `Enter` or Space activates the focused tab.
3. Observatory is status-first: Pulse/open work, activity pipeline, selected resource, provenance, recovery. Secondary rail links anchor to the same board without losing context.
4. Atlas selection makes `Astra Parser · v2.4.1 · project / nebula` a first-class sticky strip. Lore and Forge actions are direct and preserve those three values.
5. Provenance labels distinguish `source evidence`, `derived observation`, and `generated Lore`; the dialog explains labels in plain language. Retrieved, included, applied, and validated are separate facts.
6. Failed local request uses a local alert region with retry and safe continuation. Retry keeps context and says “waiting,” not “complete.”
7. Keyboard path: skip link → primary tabs → context actions → rail → panel heading/actions → inspector quick paths. Async responses use local `role=status`; focus is not stolen from passive updates.
8. Modal label guide uses native `<dialog>` semantics, close button, backdrop close, and return focus. It is explanatory, not destructive.

## Responsive coverage

| Case | Behavior |
|---|---|
| Desktop 1440 | Three columns: 205px Observatory rail, fluid task canvas, 312px resource inspector. Pipeline and lineage remain side-by-side where readable. |
| Desktop 900–1260 | Two columns: rail + canvas; inspector moves below canvas and becomes a two-column detail grid. |
| Handheld 390 | Horizontal-scroll tab strip; sticky selected context; compact rail becomes a horizontal section row; cards stack; inspector follows task content. Actions remain separated and important buttons retain 44px heights. |
| Reflow 320 | Tabs scroll rather than wrap into clipped controls; selected-context action reduces to Details; resource depth column hides while text remains; lineage becomes vertical; meaning grid becomes one column; long locators wrap. |
| Orientation / safe area | Board uses viewport-relative flow and no fixed-height canvas; production shell should add `env(safe-area-inset-*)` to handheld shell padding. This static board has no orientation-specific native surface. |
| Text resizing | Layout uses flexible tracks, `minmax()`, wrapping, and no text baked into graphics. Long IDs/locators use `overflow-wrap:anywhere`. |

## State and storyboard coverage

### State specimens in board

- Loading: skeleton metadata with “Reading snapshot metadata…”
- Empty: “No matching observations” with zero-vs-unknown explanation
- Error: failed Lore request with exact endpoint, reason, preserved context, retry
- Unavailable: provider not configured, explicitly distinct from failure
- Validation: labelled scope input and helper text
- Long content: wrapped source locator that remains copyable
- Recovery: retry status changes to “Retry queued… no progress assumed”
- Known activity: complete/done stages show known counts
- Indeterminate activity: mapping shows heartbeat only and explicit no-denominator note
- Selected resource: `aria-current="true"` and sticky context strip

### Success storyboard

| Frame | Intent → action | Response | Next decision |
|---|---|---|---|
| 1. Pair | Operator enters one-use code from local terminal | Private data becomes available; intended route returns to Observatory | Start with status/open work |
| 2. Orient | Operator reads Pulse and sees two open threads | Brain signal says 2 active observations; one review is waiting | Inspect the resource named in the review |
| 3. Select | Operator chooses Astra Parser in Atlas | Selected strip pins resource, version, and scope; row is marked selected | Open provenance |
| 4. Inspect | Operator reads source → derived → generated chain | Labels and retrieval/inclusion/application/validation facts remain separate | Continue to Lore or Forge |
| 5. Handoff | Operator opens Lore or Forge | Same `Astra Parser / v2.4.1 / project-nebula` context remains visible | Review sourced page or scoped export |

### Failure / recovery storyboard

| Frame | Intent → action | Response | Recovery |
|---|---|---|---|
| 1. Request | Operator selects Open Lore | Local request fails; alert names endpoint and timestamp | No revision written; context stays pinned |
| 2. Diagnose | Operator reads `Connection interrupted` | Failure is not shown as empty content or successful-empty | Retry is safe and local |
| 3. Retry | Operator activates Retry request | Status says queued/waiting; does not fabricate percent or completion | Continue only after local service responds |
| 4. Continue | Operator chooses Keep working offline or reopens Forge | Selected resource/version/scope remain available | Return to Lore when service recovers |

## Estimate and dependencies

- **Incremental concept asset estimate:** 2 local SVGs ~6.5 KiB source; CSS ~36 KiB source; HTML ~26.5 KiB source. These are uncompressed concept bytes, not a production bundle measurement.
- **Runtime dependencies:** none. Uses native HTML, CSS, SVG, and a small inline interaction script.
- **Implementation effort estimate:** 1–2 days for shell primitives and responsive state pattern; 2–4 days to connect real service state, durable job cursors, and route/deep-link behavior; separate browser accessibility and performance verification required.
- **Cost risk:** pipeline/brain visuals stay static and low-complexity. If production adds live SVG animation, keep it reduced-motion-safe and measure CPU/GPU cost. The inspector and long data need bounded pagination before implementation.

## Limitations and unverified items

- This is a Plan concept, not a working Observatory and does not prove pairing, API authorization, durable job recovery, or LAN reachability.
- Synthetic content is illustrative. No values imply real NOESIS progress, confidence, or validation.
- Browser render inspection is required for final concept comparison; this directory does not claim WCAG conformance, screen-reader success, field performance, or second-device evidence.
- The board uses native browser `<dialog>` and tab semantics as a web concept. Native toolkit behavior, if later targeted, needs host-specific validation.
- Shared run coverage files and plan index are outside this worker-owned path; the coordinator should link this concept to inventory cases during Plan reconciliation.
