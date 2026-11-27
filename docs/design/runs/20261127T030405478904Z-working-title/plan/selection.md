# Plan selection

Status: approved for the Plan direction only. Application implementation is not approved.

## User decision

Actor: `user`.

The user selected a hybrid with Cortex Tabs as the preferred visual base. The user specifically requested a larger brain graphic that holds the activity inside it and activity visualization inspired by particle fields. The user supplied this reference for interaction inspiration: `https://vincentgarreau.com/particles.js/`.

## Reconciled direction

Use Cortex Tabs' visual base and responsive shell:

- dark/light restrained science-fiction palette;
- modern tabbed Observatory, Atlas, Lore, Reverie, and Forge;
- sticky selected resource/version/scope context;
- status-first Observatory canvas;
- right-side resource inspector on desktop and following inspector on handheld;
- deliberate 390px and 320px reflow;
- semantic tab/focus/dialog/status behavior;
- explicit loading, empty, unavailable, validation, error, and recovery states.

Use Signal Deck's operational discipline:

- explicit pipeline stages and known versus indeterminate activity;
- persistent provenance and evidence-meaning inspector;
- local retry that preserves scope and does not imply fabricated progress;
- bounded rows and visible omission/coverage language;
- small local SVG/icon subset and zero added runtime dependencies.

## Brain and pipeline graphic contract

The brain graphic is a larger local vector surface. It may show only actual service activity facts supplied by the API, such as active observation count, known stage count, waiting state, or explicit unknown. It must never synthesize particles, confidence, progress, or causality. Particle-field inspiration is visual only. Do not add `particles.js` or any remote dependency. Prefer deterministic local SVG/CSS or a reviewed vendored implementation only if a later budget and security review justifies it. `prefers-reduced-motion: reduce` disables motion and retains a readable static/list alternative.

The pipeline graphic shows named stages and known denominators. Indeterminate stages use a heartbeat or waiting label without a percentage. Every graphic has a text/table alternative and visible status labels.

## Alternatives rejected

- Signal Deck as the complete base. Rejected because the user preferred Cortex Tabs' overall look, while retaining its provenance/activity strengths.
- Cortex Tabs without reconciliation. Rejected because activity graphics must remain evidence-bound and data rendering must retain bounded/indeterminate semantics.
- External `particles.js` dependency. Rejected for the current zero-remote and zero-added-runtime-dependency constraints.

## Approval inputs

The Plan approval binds the current concept comparison and both concept contracts:

- `plan/index.html`
- `plan/index.png`
- `plan/concept-signal/concept.md`
- `plan/concept-signal/board-desktop-final.png`
- `plan/concept-cortex/concept.md`
- `plan/concept-cortex/render-desktop.png`
- `brief.md`
- `report.md`

This selection does not approve Design, Produce, registration, package publication, deployment, or release.

## Scope refinement from user interjection

The user requested the same visual language in other useful areas, especially Atlas memory relationships. Extend the direction to bounded Atlas relationship/explorer views:

- Use a local particle-field or node-field treatment only as a visual layer over actual resource, lineage, Chronicle, and relationship records.
- Keep the relationship list/table and edge-meaning labels available as the primary accessible alternative.
- Never synthesize nodes, edges, confidence, progress, or causality for atmosphere.
- Disable or simplify motion under `prefers-reduced-motion`; retain deterministic static positions where possible.
- Do not load particles.js from the network. The reference is visual inspiration. Any later local vendoring would require explicit license/provenance, security, payload, and runtime-cost review before implementation.

This refinement changes the Plan input set and supersedes the earlier approval digest once the updated digest is recorded.
