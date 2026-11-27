# UI assessment brief

## Audience and task priorities

NOESIS serves an operator or agent using a local-first memory service across coding, research, writing, operations, planning, and creative work. The highest-value dashboard tasks are pairing safely, capturing an observation, recalling evidence with coverage, inspecting a resource and lineage, managing a bounded dream job, correcting preferences, reviving or forgetting records, editing sourced Lore, and exporting a scoped Blueprint.

Suggested order for design attention:

1. Understand current status and open work from Observatory and Pulse.
2. Search and inspect evidence in Atlas without losing scope or provenance.
3. Operate Reverie jobs with honest progress, interruption, recovery, and output states.
4. Correct, revive, forget, edit, and export without confusing derived views for evidence.
5. Pairing, narrow layouts, keyboard navigation, errors, and recovery.

## Design objective

Turn the current single long form into a clear, responsive Observatory shell with stable navigation, task-focused panels, explicit evidence meaning, and safe recovery. Preserve same-origin API behavior, authorization, identifiers, revisions, scope, budgets, provenance, and all existing actions.

## Constraints

- Web target. Existing host is server-rendered HTML with inline CSS and browser JavaScript in `src/server.mjs`.
- LAN is the default access path. HTTP is unencrypted trusted-LAN transport, not a TLS guarantee.
- Pairing is required before private reads and mutations. The pairing surface must not expose private memory.
- No remote runtime requests, added runtime dependencies, or model/provider installation.
- WCAG 2.2 AA target and 44px preferred touch controls from `ui-design-studio.json`.
- Existing application gates remain authoritative. UI evidence cannot replace service, pairing, release, or browser checks.
- Offline product operation is not required by the inspected scope. Network failure and recovery remain relevant because the application is LAN-served.

## Baseline evidence

- Source revision: current `feat/m0-foundation` worktree, ahead of origin by one commit and containing unrelated user changes.
- Runtime: local Observatory on `127.0.0.1:17339`, Node 24.22.3, Chromium 159.0.8154.6.
- Desktop screenshot: `baseline/observatory-desktop.png`, 1440x2623 full page.
- Handheld screenshot: `baseline/observatory-handheld.png`, 390x3734 full page.
- Capture result: Chromium rendered `NOESIS Observatory` with no page errors. Capture is visual evidence only, not application QA or approval.

## Scope

Assessment first. Do not change application styles or behavior until guided direction and later design approval. The initial inventory covers the existing Observatory route and its pairing, capture, recall, Reverie, Atlas, Attunement, Ebb, Forge, and Lore surfaces. Later design must reconcile the requirements' Observatory, Atlas, Lore, Reverie, Forge, Pulse, Lineage, Chronicle, and command-palette surfaces with actual route and capability evidence.

## Guided decisions recorded

- Priority: status and open work first, then resource inspection, Reverie, and correction/export.
- Requested interaction direction: convert the current single page into a modern tabbed interface.
- Visual preference: restrained calm with a futuristic, understated science-fiction feel.
- Requested graphics: brain activity animations and pipeline activity graphics. These must explain real activity, use local assets, honor reduced motion, and never imply fabricated progress.
- Required coverage: desktop keyboard/pointer, 390px handheld touch, and 320px reflow. Screen-reader review was not selected by the user and remains a project accessibility requirement to verify where tooling permits.
- Familiarity/frustration: retain core NOESIS behavior and evidence semantics; current experience needs more graphics and a clearer activity-oriented interface.

These are user preferences for Plan. They do not approve concepts, application changes, deployment, or fabricated activity data.

## Plan refinement

The approved hybrid extends the same activity visual language to bounded Atlas memory relationships. A local particle-field treatment may sit over actual resource/lineage/Chronicle edges, with a list/table and edge labels as the accessible primary alternative. No network-loaded `particles.js`, fabricated nodes/edges/progress, or motion without reduced-motion fallback.

## NosisArt reference inputs

The user supplied `/code/NosisArt/`. `braingraphconcept.webp` is an implementation concept for modules, nodes, edges, and connector hubs. `braingraphstyle1.jpg` and `braingraphstyle2.jpg` are style references. `braingraphidea1.webp` through `braingraphidea5.webp` are feel/look references. Parenthetical filenames are exclusions and interpretation guides. Several images show stock/watermark marks and have no production license, so they remain inspiration only.

Design implication: enlarge the brain activity surface, use dark technical HUD framing with restrained cyan signal and sparse amber/violet semantic accents, contain actual activity within a bounded brain/data surface, and avoid literal people, rooms, tables, stock imagery, or unbounded decorative particles. Preserve the typed node/edge semantics and accessible list/table alternative.
