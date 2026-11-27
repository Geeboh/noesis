# Direct particles.js integration assessment

Status: read-only assessment. No application files, package manifests, lockfiles, or theme registry changed.

## Judgment

Do not integrate particles.js directly in the current NOESIS Design or Produce scope.

Use the reference for atmosphere and spatial rhythm only. Implement the approved brain, pipeline, and Atlas relationship visuals with local deterministic SVG/CSS. Revisit direct or vendored use only through a separate dependency, security, accessibility, and performance review.

## Evidence

| Source | Observation | Consequence |
| --- | --- | --- |
| `package.json:19-24` | NOESIS currently has `qrcode` as its only runtime dependency. | Direct integration adds a new runtime dependency and maintenance surface. |
| `ui-design-studio.json:6-10` | Added runtime dependencies budget is `0`; remote runtime requests budget is `0`. | npm runtime addition or remote script loading violates the configured UI budget. |
| `design/contract.md:22-29` | The approved contract excludes `particles.js`, canvas/chart libraries, remote requests, and new runtime dependencies. | Direct integration is outside the approved Design boundary. |
| `design/contract.md:389-438` | Atlas relationship field requires actual bounded nodes/edges, deterministic layout, max 24 nodes/48 edges, list/table alternative, reduced motion, and local SVG. | A generic particle system cannot be the source of relationship truth. It can only be a constrained presentation layer. |
| `src/server.mjs:19-72` | Current Observatory is server-rendered HTML with inline CSS/JavaScript and no canvas runtime. | Integration would cross the current server-rendered boundary and require lifecycle, teardown, resize, and state synchronization code. |
| `npm ls particles.js --all --json` | No `particles.js` dependency is installed. | No existing integration or lockfile provenance exists. |
| Context7 `/vincentgarreau/particles.js` docs | `particlesJS(tag_id, params)` appends a canvas, starts immediately, stores instances in `window.pJSDom`, and removes prior canvases in the target. `particlesJS.load` fetches config via XHR. | Direct use introduces a global imperative canvas lifecycle. The config-loader path is incompatible with zero remote requests unless all assets/config are local. |
| [particles.js reference](https://vincentgarreau.com/particles.js/) | The project presents particle animation and interaction demos. | Useful visual reference. It does not establish suitability for evidence-bound data or accessibility. |
| [particles.js license](https://github.com/VincentGarreau/particles.js/blob/master/LICENSE.md) | Repository search identifies an MIT license. | License compatibility appears plausible, but exact vendored bytes, notices, security review, and package provenance would still need recording. |

## Technical fit

### What direct integration would provide

- Canvas particle rendering with configurable count, color, size, links, movement, hover, click, and retina scaling.
- A familiar atmosphere for the larger brain activity surface and Atlas relationship field.
- A ready-made animation engine instead of writing a particle loop.

### What it would not provide

- Actual NOESIS activity semantics.
- Relationship identity, edge meaning, source record IDs, revisions, scope, uncertainty, or coverage.
- A DOM-accessible graph or text alternative.
- Honest progress semantics for queued or indeterminate work.
- Reduced-motion compliance without a wrapper that disables or replaces the engine.
- Safe lifecycle across tab changes, reload, theme changes, narrow reflow, and destroyed panels.

## Options

| Option | Fit | Main risk | Recommendation |
| --- | --- | --- | --- |
| Remote CDN/script tag | Fails current constraints | Remote request, unavailable cold/local operation, supply-chain drift | Reject |
| npm runtime dependency | Fails current configured budget | Package/lockfile change, payload, global canvas lifecycle, accessibility wrapper | Reject for current scope |
| Vendored particles.js source | Technically possible | License/provenance, security updates, code ownership, payload, imperative lifecycle, still needs semantics/accessibility wrapper | Defer to separately approved spike |
| Local custom SVG/CSS field | Fits current contract | Limited visual richness; needs deterministic layout and bounded rendering | Choose now |
| particles.js-inspired static composition | Fits current contract | Must avoid implying generic particles are evidence | Choose as visual language only |

## Atlas-specific assessment

Atlas is the only plausible place for a relationship field because the product already defines bounded exploration around a selected entity. Direct particles.js is still the wrong data model.

A safe Atlas visual would require the service projection to provide:

- one stable center ID;
- bounded nodes and edges with actual IDs;
- relation labels such as `derived from`, `used by`, `contradicts`, `supersedes`, `applies to`, and `hypothetical association`;
- source record IDs and revisions;
- scope, state, and coverage/omission facts;
- deterministic coordinates or a seeded layout input.

The canvas or SVG may draw those facts. It must not invent nodes, orphan particles, random edges, force distance meaning, or completion through animation. The DOM list/table remains the keyboard and screen-reader path.

## If direct integration is later reconsidered

Run a bounded, isolated spike. Do not add it to the application first.

1. Pin an exact package or vendored commit and preserve license/notice files.
2. Measure raw/gzip bytes, startup cost, frame time, long tasks, CPU, memory, and resize cost at 1440px, 390px, and 320px with 24 nodes and 48 edges.
3. Verify `prefers-reduced-motion`, forced colors, keyboard operation, screen-reader alternative, high zoom, and no-horizontal-overflow.
4. Pause/destroy/recreate the instance across tab changes, reload, theme changes, and route changes.
5. Bind every drawn node/edge to a real bounded service record and compare the visual against the list/table.
6. Test cold installed operation without WAN access and confirm no config/assets are fetched remotely.
7. Record security and dependency review, then seek explicit scope approval before changing the contract or package.

## Conclusion

Direct particles.js integration does not earn its place in the current release. The reference is valuable as a visual cue. Local deterministic SVG/CSS preserves the project constraints, evidence semantics, accessibility path, rollback simplicity, and payload budget. A later vendoring spike can be justified only if the visual benefit survives the measured cost and semantic/accessibility checks.
