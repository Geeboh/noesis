# v1.2.3 installation and use observation

**Date:** 2026-11-24
**Checkout:** `/code/helpers/noesis-bootstrap-v1.0.0`
**Release:** product `1.2.3`, bootstrap `1.0.0`
**Candidate:** `2b68c01da84cffa52581b6fceca632256c0339e8`
**OMP:** `omp/19.1.1`
**Runtime:** Node `v24.22.3`, npm `11.19.1`
**Data directory:** `/tmp/noesis-m3-dashboard`

## Installation and recovery

The candidate passed `npm ci --ignore-scripts` and `npm run release:check` with 60 tests before restart. The live SQLite store was backed up before stopping v1.2.2:

- Backup: `/tmp/noesis-live-backup-v1.2.3/mind.sqlite`
- Backup SHA-256: `bc24f605f71af09570523b553a7f3537d22868c27e5ecda02513fb852da0fd9f`
- Backup contents: 0 records, 1 resource, SQLite schema version 0

The same data directory was reused. No migration or data replacement occurred. The v1.2.2 process was stopped through the managed `noesis-dashboard` service and restarted from the v1.2.3 checkout.

## Running dashboard

- Candidate process started from package `noesis@1.2.3`.
- Listener: `0.0.0.0:7337`.
- Actual URL: `http://192.168.1.107:7337/`.
- Health: `/healthz` returned `{"status":"ready"}`.
- Terminal QR: printed after listener readiness and encoded the actual URL.
- Unpaired `/api/capabilities`: HTTP 401.
- Pairing with the printed one-use code: HTTP 200.
- Paired `/api/capabilities`: HTTP 200 with all four NOESIS tools and full bounded Reverie capability advertisement.

## Native OMP path

A live OMP probe loaded the installed extension, printed `NOESIS_EXTENSION_READY`, and completed a simple `OK` prompt. No native OMP configuration or paid background work was changed.

## Limitations

Physical second-device LAN validation was unavailable. The live data path remains a temporary `/tmp` directory. Full JSON Schema validation dependencies remain unavailable. This installation verifies adapter startup, not model acceptance or task usefulness of the added attachment metadata.
