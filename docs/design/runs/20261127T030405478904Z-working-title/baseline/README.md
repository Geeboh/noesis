# Assessment baseline

## Environment

- Source revision: current `feat/m0-foundation` worktree.
- Runtime command: `NOESIS_BIND_HOST=127.0.0.1 NOESIS_PORT=17339 NOESIS_DATA_DIR=/tmp/noesis-ui-assess npm start`.
- Browser capture command: `playwright_fast capture --projectDir . --browser chromium --url http://127.0.0.1:17339/ --output <path> --width <width> --height <height> --fullPage`.
- Browser: Chromium 159.0.8154.6.
- Capture status: `CAPTURE_COMPLETE`, page errors empty.
- Limitation: capture is visual evidence only. It does not establish application QA, accessibility conformance, usability, performance, or approval.

## Files

- `observatory-desktop.png` is the unpaired 1440px-wide full-page landing surface.
- `observatory-handheld.png` is the unpaired 390px-wide full-page landing surface.
