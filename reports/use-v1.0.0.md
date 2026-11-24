# v1.0.0 installation and use observation

**Date:** 2026-11-24
**Checkout:** `/code/helpers/noesis-bootstrap-v1.0.0`
**Release:** product `1.0.0`, bootstrap `1.0.0`
**OMP:** `omp/19.1.1`
**Runtime:** Node `v24.22.3`, npm `11.19.1`
**Data directory:** `/tmp/noesis-m3-dashboard`

## Installation and migration

`npm ci --ignore-scripts` completed successfully. The live SQLite store was backed up before upgrade:

- Backup: `/tmp/noesis-live-backup/mind.sqlite`
- Backup SHA-256: `06d16301e1d191e56ded578afa5c367704739ba0cdbab437379b8b66ab5730c8`
- Copied migration test: `/tmp/noesis-migration-test/mind.sqlite`
- Migration result: schema 4, 0 records, 1 resource

The accepted artifact was verified before use:

- Artifact: `/tmp/noesis-release-review-final2/noesis-1.0.0.tgz`
- SHA-256: `e1a1ad454be160ae3f8cb2a7080f1faa265e828b52c655edf453bd4cbf8b0e3e`

The live store was not replaced. The service restarted with the same data directory.

## Native OMP loop

A separate synthetic store at `/tmp/noesis-v1-omp-jJ8q74` verified the actual file-backed extension.

- `mind_note` returned record `059d5393-eb26-4e23-9407-6365d5483a15`.
- Fresh `mind_recall` returned the same record ID.
- `mind_inspect` returned statement `v1 native loop verification` and provenance `tool_observation`.
- Store inspection found one project resource and 11 lineage edges.
- `mind_dream` Snooze returned job `7b6f81a1-816f-4c6e-baa3-823f288b0ac9` with durable queued state.

No paid model or background inference was enabled.

## Live dashboard

The accepted service restarted successfully on `0.0.0.0:7337`.

- Actual URL: `http://192.168.1.107:7337/`
- Health: `/healthz` returned `{"status":"ready"}`
- Terminal QR: printed after listener readiness and encoded the actual URL.
- Pairing code: `04957049`, one-use and short-lived.
- Unpaired private capabilities request: HTTP 401.
- Pairing: HTTP 200.
- Paired capabilities: all four dream levels and five concrete modes.
- Paired Atlas listing: one live resource returned.

## Limitations

The OMP print-mode probe loaded the extension but did not observe live `before_agent_start` delivery. No second LAN device was available. Full JSON Schema validation dependencies are not installed. The live data path is a temporary `/tmp` path for this environment, not a durable operator home path.
