# NOESIS v1.6.1 installation report

## Identity

- Release: `v1.6.1`.
- Published tag: `v1.6.1`.
- Release URL: https://github.com/Geeboh/noesis/releases/tag/v1.6.1.
- Artifact SHA-256: `770e3409f0e522a6f63a667bfaa6f22e9e17a06e27b24692fdb2a6f248b0376e`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Data preservation

The live service used `/tmp/noesis-m3-dashboard`. A fresh online-safe backup was created before stopping v1.6.0.

- Backup: `/tmp/noesis-live-backup-v1.6.1-preinstall/mind.sqlite`.
- Backup SHA-256: `4eb67fbd88fda131dd0eb5ef4065c4d66ebdcda6284c86524a69826097484aaa`.
- Pre-install counts: schema 5, records 0, resources 1, import runs 0.
- Post-install counts: schema 5, records 0, resources 1, import runs 0.

The existing data directory and configuration were preserved. No migration was needed.

## Running service

- Listener: `0.0.0.0:7337`.
- Advertised URL: `http://192.168.1.107:7337/`.
- Terminal QR: printed for the advertised URL at startup.
- Pairing: fresh one-use code accepted through the advertised LAN origin. The code is not recorded here.
- Health: `/healthz` returned `{"status":"ready"}`.
- Paired capabilities: revision 2 with `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`.
- Authenticated recall: returned `status=ok`.

## Native OMP loop

A disposable native OMP session loaded the v1.6.1 extension, saved a synthetic sentinel through `mind_note`, and recalled it. The process exited 0. The disposable store ended with schema 5, 8 records, and 8 events. The live database was not used for this loop.

## Rollback

Stop the v1.6.1 service and restore `/tmp/noesis-live-backup-v1.6.1-preinstall/mind.sqlite` to a separate destination first. Restart the published v1.6.0 service with the restored database. Do not delete the live data directory during rollback.

## Limitations

The LAN check used the actual advertised interface and local HTTP pairing. No second physical device was used. HTTP remains unencrypted LAN transport. Full JSON Schema validation remains unavailable because optional validation dependencies are not installed.
