# NOESIS v1.8.0 installation report

## Identity

- Release: `v1.8.0`.
- Published tag: `v1.8.0`.
- Release URL: https://github.com/Geeboh/noesis/releases/tag/v1.8.0.
- Artifact SHA-256: `6ee4e8873774dfb634d8ca7a02dd0e7d9e615ebb0c6caf4affdbbafcbeec0ed0`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Data preservation

The live service used `/tmp/noesis-m3-dashboard`. A fresh online-safe backup was created before stopping v1.7.0.

- Backup: `/tmp/noesis-live-backup-v1.8-preinstall/mind.sqlite`.
- Backup SHA-256: `4eb67fbd88fda131dd0eb5ef4065c4d66ebdcda6284c86524a69826097484aaa`.
- Pre-install counts: schema 5, records 0, resources 1, import runs 0.
- Post-install counts: schema 5, records 0, resources 1, import runs 0.

The existing data directory and configuration were preserved.

## Running service

- Listener: `0.0.0.0:7337`.
- Advertised URL: `http://192.168.1.107:7337/`.
- Terminal QR: printed for the advertised URL at startup.
- Pairing: fresh one-use code accepted through the advertised LAN origin. The code is not recorded here.
- Health: `/healthz` returned `{"status":"ready"}`.
- Paired capabilities: revision 2 with `mind_note`, `mind_recall`, `mind_inspect`, and `mind_dream`.
- Authenticated recall: returned `status=ok`.
- Native extension probe: loaded and advertised capabilities.

## Catalyst validation

The paired Catalyst application/outcome journey passed on disposable data in the release gate. The live dashboard was not mutated during installation verification.

## Rollback

Stop the v1.8.0 service and restore `/tmp/noesis-live-backup-v1.8-preinstall/mind.sqlite` to a separate destination first. Restart the published v1.7.0 service with the restored database. Do not delete the live data directory during rollback.

## Limitations

The LAN check used the actual advertised interface and local HTTP pairing. No second physical device was used. HTTP remains unencrypted LAN transport. The model-driven native note/recall loop remains inconclusive from the prior v1.7 host investigation.
