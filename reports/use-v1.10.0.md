# NOESIS v1.10.0 installation report

## Identity

- Release: `v1.10.0`.
- Published tag: `v1.10.0`.
- Release URL: https://github.com/Geeboh/noesis/releases/tag/v1.10.0.
- Artifact SHA-256: `70685f9d6bb3410dd1cb1de2c3189912ddc442848e7ab9ea6bc3ed7c4a6ed7f1`.
- Installed artifact: `.runtime/installed-v1.10.0/node_modules/noesis`.
- Runtime: Node 24.22.3, npm 11.19.1, SQLite 3.45.1, OMP 19.1.1.

## Data preservation

- Pre-install backup: `.runtime/artifacts/noesis-live-backup-v1.10.0-preinstall/mind.sqlite`.
- Live and backup SHA-256: `f520e627431c42c9df18a16e07cfdd850a3abac22cde18483bfb01cb0a6360a5`.
- Pre-install counts: schema 5, records 0, resources 1, import runs 0.
- Post-install counts: schema 5, records 0, resources 1, import runs 0.

## Running service

- Installed process working directory: `.runtime/installed-v1.10.0/node_modules/noesis`.
- Listener: `0.0.0.0:7337`.
- Advertised URL: `http://192.168.1.107:7337/`.
- Health: `/healthz` returned `{"status":"ready"}`.
- Pairing: advertised LAN origin accepted the fresh one-use code and private `/api/resources` returned the preserved project resource.
- Terminal QR: printed for the advertised URL at startup.

## Installed feature checks

- Installed package version: `1.10.0`.
- Installed Prism CLI inspected the relocated screenshot and returned PNG, 181402 bytes, dimensions 390 by 3734, and header range 0 through 33.
- Installed MCP adapter returned protocol `2025-11-25`, server `noesis` version `1.10.0`, and the tools capability.
- No model calls, embeddings, retries, child jobs, or monetary cost occurred.

## Rollback

Stop the v1.10.0 service and restore `.runtime/artifacts/noesis-live-backup-v1.10.0-preinstall/mind.sqlite` to a separate destination first. Restart v1.9.2 only after verifying the restored copy. Do not delete `.runtime/live` during rollback.

## Limitations

The LAN check used the actual advertised interface from this host. No second physical device was available. HTTP remains unencrypted LAN transport. Prism is header-only and does not decode pixels or run OCR. The model-driven native note/recall loop remains inconclusive from the prior host investigation.
