# v1.1.0 installation and use observation

**Date:** 2026-11-24
**Checkout:** `/code/helpers/noesis-bootstrap-v1.0.0`
**Release:** product `1.1.0`, bootstrap `1.0.0`
**Candidate commit:** `b66327b9335a506e8521d20821540933bcf8e880`
**OMP:** `omp/19.1.1`
**Runtime:** Node `v24.22.3`, npm `11.19.1`
**Data directory:** `/tmp/noesis-m3-dashboard`

## Installation and recovery

The candidate artifact was verified before installation:

- Artifact: `/tmp/noesis-r1-release/noesis-1.1.0.tgz`
- SHA-256: `9adb40fdd90a01bb6a52c4a3bae136b65fc15faa1ecacd4d5c15e877fbf85900`

The live service was stopped through the managed `noesis-dashboard` service. The live database was backed up before restart:

- Backup: `/tmp/noesis-live-backup-v1.1/mind.sqlite`
- Backup SHA-256: `bc24f605f71af09570523b553a7f3537d22868c27e5ecda02513fb852da0fd9f`
- Backup contents: 0 records, 1 resource, SQLite schema version 0

`npm ci --ignore-scripts` and `npm run release:check` passed after installation. The running package reports version `1.1.0`. The same data directory was reused. No migration or data replacement occurred.

## Live dashboard

The managed service restarted successfully on `0.0.0.0:7337`.

- Actual URL: `http://192.168.1.107:7337/`
- Health: `/healthz` returned `{"status":"ready"}`
- Terminal QR: printed after listener readiness and encoded the actual URL.
- Pairing: unpaired `/api/capabilities` returned HTTP 401; the printed one-use code paired with HTTP 200; paired capabilities returned HTTP 200.
- Existing live data remained visible to the service. The store still contained 0 records and 1 resource.

## Native OMP path

`NOESIS_EXTENSION_READY` advertised `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream` from the installed checkout. The direct print-mode OMP prompt smoke reached extension readiness but ended with `Deadline exceeded` before tool execution. This preserves the existing declared limitation around observing live print-mode tool delivery. The release gate and prior v1.0.0 native OMP evidence remain valid; no provider or paid background work was enabled.

## Limitations

Physical second-device LAN validation was unavailable. The live data path remains a temporary `/tmp` directory. Native print-mode tool execution was not re-observed during this upgrade because the OMP smoke timed out after extension readiness. Full JSON Schema validation dependencies remain unavailable.
