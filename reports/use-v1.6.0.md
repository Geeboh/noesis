# NOESIS v1.6.0 installation report

## Identity

- Release: `v1.6.0`.
- Published tag: `v1.6.0`.
- Published artifact SHA-256: `d4fec7d21116bfbeda13863d35d1525f4dbb4ad8793b30e31ee14a1b25f79c33`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Data preservation

The live service used `/tmp/noesis-m3-dashboard`. A fresh online-safe backup was created before stopping v1.4.0.

- Backup: `/tmp/noesis-live-backup-v1.6-preinstall/mind.sqlite`.
- Backup SHA-256: `bc24f605f71af09570523b553a7f3537d22868c27e5ecda02513fb852da0fd9f`.
- Pre-install live counts: schema 4, records 0, resources 1.
- Post-install live counts: schema 5, records 0, resources 1, import runs 0.

The existing data directory and configuration were preserved. The schema migration ran on startup.

## Running service

- Listener: `0.0.0.0:7337`.
- Advertised URL: `http://192.168.1.107:7337/`.
- Terminal QR: printed for the advertised URL at startup.
- Pairing: fresh one-use code accepted through the advertised LAN origin. The code is not recorded here.
- Health: `/healthz` returned `{"status":"ready"}`.
- Paired capabilities: revision 2 with `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`.
- Authenticated recall: returned `status=ok`.

## Native OMP loop

A disposable native OMP session loaded the v1.6 extension, called `mind_note` with a synthetic sentinel, and recalled it. The process exited 0. The disposable store ended with schema 5, 10 records, and 10 events. The live database was not used for this loop.

## Rollback

Stop the v1.6 service and restore `/tmp/noesis-live-backup-v1.6-preinstall/mind.sqlite` to a separate destination first. Restart the published v1.4.0 service with the restored database. Do not delete the live data directory during rollback.

## Limitations

The LAN check used the actual advertised interface and local HTTP pairing. No second physical device was used. HTTP remains unencrypted LAN transport. Full JSON Schema validation remains unavailable because optional validation dependencies are not installed.
