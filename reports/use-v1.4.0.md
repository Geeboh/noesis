# v1.4.0 installation and use observation

**Date:** 2026-11-25
**Checkout:** `/code/helpers/noesis-bootstrap-v1.0.0`
**Release:** product `1.4.0`, bootstrap `1.0.0`
**Candidate:** `58099033e7259862da824631c566d5ee82e2db68`
**OMP:** `omp/19.1.1`
**Runtime:** Node `v24.22.3`, npm `11.19.1`
**Data directory:** `/tmp/noesis-m3-dashboard`

## Installation and recovery

The candidate passed `npm ci --ignore-scripts` and `npm run release:check` with 63 tests before restart. The live SQLite store was backed up before stopping v1.3.0:

- Backup: `/tmp/noesis-live-backup-v1.4/mind.sqlite`
- Backup SHA-256: `bc24f605f71af09570523b553a7f3537d22868c27e5ecda02513fb852da0fd9f`
- Backup contents: 0 records, 1 resource, SQLite schema version 0

The same data directory was reused. No migration or data replacement occurred. The v1.3.0 process was stopped through the managed `noesis-dashboard` service and restarted from the v1.4.0 checkout.

## Running dashboard

- Candidate process started from package `noesis@1.4.0`.
- Listener: `0.0.0.0:7337`.
- Actual URL: `http://192.168.1.107:7337/`.
- Health: `/healthz` returned `{"status":"ready"}`.
- Terminal QR: printed after listener readiness and encoded the actual URL.
- Unpaired `/api/capabilities`: HTTP 401.
- Pairing with the printed one-use code: HTTP 200.
- Paired `/api/capabilities`: HTTP 200 with all four NOESIS tools and full bounded Reverie capability advertisement.

## Catalyst workflow

The proposal-task manifest route was validated on a disposable paired resource. It returned `kind=proposal_task_manifest`, `status=proposed`, and no executable task action. No live user task was created or executed.

## Native OMP path

A live OMP probe loaded the installed extension, printed `NOESIS_EXTENSION_READY`, and completed a simple `OK` prompt. No native OMP configuration or paid background work was changed.

## Limitations

Physical second-device LAN validation was unavailable. The live data path remains a temporary `/tmp` directory. Full JSON Schema validation dependencies remain unavailable. No real project proposal-to-task outcome was measured.
