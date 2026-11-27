# Produce validation evidence

## Revision and scope

- Target: NOESIS Observatory in `src/server.mjs`.
- UI contract: `design/contract.md` revision `design-contract-20261127.2`.
- Runtime: Node `v24.22.3`, Chromium `159.0.8154.6`, Firefox `159.0`, WebKit `27.2`.
- Service: isolated local `127.0.0.1:17340`, disposable `/tmp/noesis-ui-evidence` data directory.
- Evidence boundary: browser observations cover this local implementation. They do not prove field behavior, user research, screen-reader conformance, or second-device LAN behavior.

## Project checks

`npm run release:check` passed. It ran 81 Node tests, bootstrap integrity, 21 schema examples, and Node syntax checks.

Focused `node --test test/observatory.test.mjs` passed 7/7 after the UI regression fix preserving the `Queue dream` contract label.

## Accessibility and responsive smoke

A Playwright script loaded unpaired Observatory at 1440px, 390px, and 320px.

- Page errors: none.
- `document.documentElement.scrollWidth === document.body.scrollWidth === innerWidth`: true at all three widths.
- Labels: 22.
- Tab roles: 5.
- Local status/alert regions: 13.
- First keyboard focus: skip link.
- Important controls are covered by the implementation's 44px CSS contract. Full numeric WCAG contrast and screen-reader output remain unverified.

A paired 390px smoke passed pairing, Atlas tab activation, theme switching, command-palette open/escape, destructive-dialog focus cycling, Escape safety, and no horizontal overflow. Modal focus stayed within `forget-cancel` and `forget-confirm`; Escape left destructive confirmation open.

## Cross-browser capture

`playwright_fast capture --browser all` passed at 390px. Chromium 159, Firefox 159, and WebKit 27.2 all rendered `NOESIS Observatory` with `pageErrors: []`. This is visual capture evidence, not full interaction parity or Safari-device validation.

## Performance and network

Three cold local Chromium shell loads measured `21ms`, `34ms`, and `18ms` to `load` in one local process. Shell response measured `89,052` bytes. Browser resource entries were local-origin only, with 4 local resources observed. These are local laboratory measurements, not field Core Web Vitals.

Network recovery smoke aborted `/api/recall`. The UI reported `Error: recall failed. Failed to fetch`. After restoring the route, recall reported `Complete: 0 included of 0 matched; 0 omitted (none reported); continuation not supplied`. No input loss or page error occurred.

## Unverified checks

Screen-reader/assistive-technology output, full WCAG contrast matrix, forced-colors runtime emulation, Firefox/WebKit keyboard parity, text zoom/orientation/safe-area/IME behavior, LAN failure from another device, field performance, CPU/memory/GPU pressure, and production data-volume rendering remain unverified. Offline product operation is not required by resolved context; LAN/network failure recovery remains applicable and only the local recall failure path was exercised.
