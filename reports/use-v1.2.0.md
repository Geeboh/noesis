# v1.2.0 installation and use observation

**Date:** 2026-11-24
**Checkout:** `/code/helpers/noesis-bootstrap-v1.0.0`
**Release:** product `1.2.0`, bootstrap `1.0.0`
**Candidate implementation:** `7e3ff807688b3edc8a5da62582a464c1f8559bef`
**OMP:** `omp/19.1.1`
**Runtime:** Node `v24.22.3`, npm `11.19.1`
**Data directory:** `/tmp/noesis-m3-dashboard`

## Installation and recovery

The candidate passed `npm ci --ignore-scripts` and `npm run release:check` with 57 tests before restart. The live SQLite store was backed up before stopping v1.1.0:

- Backup: `/tmp/noesis-live-backup-v1.2/mind.sqlite`
- Backup SHA-256: `bc24f605f71af09570523b553a7f3537d22868c27e5ecda02513fb852da0fd9f`
- Backup contents: 0 records, 1 resource, SQLite schema version 0

The same data directory was reused. No migration or data replacement occurred. The v1.1.0 process was stopped through the managed `noesis-dashboard` service and restarted from the v1.2.0 checkout.

## Running dashboard

- Candidate process started from package `noesis@1.2.0`.
- Listener: `0.0.0.0:7337`.
- Actual URL: `http://192.168.1.107:7337/`.
- Health: `/healthz` returned `{"status":"ready"}`.
- Terminal QR: printed after listener readiness and encoded the actual URL.
- Unpaired `/api/capabilities`: HTTP 401.
- Pairing with the printed one-use code: HTTP 200.
- Paired `/api/capabilities`: HTTP 200 with all four NOESIS tools and full bounded Reverie capability advertisement.

## Native OMP path

A live OMP probe loaded the installed extension and printed `NOESIS_EXTENSION_READY`, then completed a simple `OK` prompt. A follow-up prompt intended to force `mind_note` and `mind_recall` produced two extension errors stating `note content must be 1-16000 characters` before returning the requested text. The native extension was loaded, but this prompt did not provide valid tool-call arguments, so no successful fresh native write/recall is claimed here. Existing v1.1.0 native evidence remains the recovery baseline.

No paid model or background inference was enabled.

## Limitations

Physical second-device LAN validation was unavailable. The live data path remains a temporary `/tmp` directory. The forced native tool prompt emitted invalid empty note arguments; direct OMP tool execution is not claimed from that attempt. Full JSON Schema validation dependencies remain unavailable.
