# Final quality evidence

## Accessibility smoke

Scoped browser accessibility smoke passed on Chromium 159 at 1440px, 390px, and 320px. The first Tab reaches the skip link. The rendered page exposes 22 labels, 5 tab roles, and 13 local status/alert regions. The paired smoke verified tab keyboard activation, command-palette open/Escape, destructive-dialog focus containment, and no horizontal overflow. This is not a screen-reader session, full WCAG audit, or numeric contrast audit.

## Performance lab

Three cold local shell loads measured 21ms, 34ms, and 18ms to `load` in one local process. HTML response measured 89,052 bytes with four local browser resources. These are repeatable local laboratory observations, not field Core Web Vitals, production data-volume, or CPU/memory/GPU evidence.

## Browser matrix

Chromium 159, Firefox 159, and WebKit 27.2 captured the unpaired Observatory at 390px with no page errors. This is visual engine coverage, not full interaction parity or physical Safari-device validation.

## Network recovery

A local recall request was intentionally aborted. The UI announced `Error: recall failed. Failed to fetch`. Restoring the route produced a bounded recall status without page error or input loss. Offline product operation is not required by the resolved context, so this is network recovery evidence only.

## Limits

Screen-reader output, forced-colors runtime emulation, full contrast states, field performance, LAN failure from another device, second-device pairing, and deployment remain unverified.
