# NOESIS v1.7.0 installation report

## Identity

- Release: `v1.7.0`.
- Published tag: `v1.7.0`.
- Release URL: https://github.com/Geeboh/noesis/releases/tag/v1.7.0.
- Artifact SHA-256: `cbc578c19a312e39c5729ca9ad0915470852a8f1a614ce52b7e7bc5a3161f186`.
- Environment: Linux x86_64, Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Data preservation

The live service used `/tmp/noesis-m3-dashboard`. A fresh online-safe backup was created before stopping v1.6.1.

- Backup: `/tmp/noesis-live-backup-v1.7-preinstall/mind.sqlite`.
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

## Native OMP validation
The bounded `NOESIS_PROBE=1 npm run probe:omp` check loaded the v1.7 extension and advertised its capabilities. Two model-driven synthetic note/recall attempts were inconclusive, including one strict explicit-argument prompt. OMP emitted `note content must be 1-16000 characters` extension errors and exceeded the 20-second deadline. Both disposable stores were used, not the live database. This is a model/tool-call behavior limitation, not a dashboard startup failure.

## Rollback

Stop the v1.7.0 service and restore `/tmp/noesis-live-backup-v1.7-preinstall/mind.sqlite` to a separate destination first. Restart the published v1.6.1 service with the restored database. Do not delete the live data directory during rollback.

## Limitations

The LAN check used the actual advertised interface and local HTTP pairing. No second physical device was used. HTTP remains unencrypted LAN transport. The model-driven OMP loop remains inconclusive despite a strict retry because the model emitted invalid empty note calls.
