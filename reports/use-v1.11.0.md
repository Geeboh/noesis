# NOESIS v1.11.0 installation report

## Identity

- Release: `v1.11.0`.
- Release URL: https://github.com/Geeboh/noesis/releases/tag/v1.11.0
- Application artifact SHA-256: `14178b8a0c2604ccac1dd422170e8c46fe79f0446b340f278a44db8a4458523a`.
- Theme package: `noesis-cortex-tabs-1.0.0.zip`.
- Theme package SHA-256: `adb42040e11d3959e45c7b2102af7aecd8bbf49689180947803dae265cb6576f`.
- Installed package: `.runtime/installed-v1.11.0/node_modules/noesis`.
- Runtime: Node 24.22.3, npm 11.19.1.

## Data preservation

- Pre-install backup: `.runtime/artifacts/noesis-live-backup-v1.11.0-preinstall/mind.sqlite`.
- Pre-install live/backup SHA-256: `a196773c0acf38771831e145849f6148a224f3b75ee8fa8fff62fc05d6dc8d5b`.
- Pre-install counts: schema migrations 5, records 0, resources 1, import runs 0.
- Post-install counts: schema migrations 5, records 0, resources 1, import runs 0.
- The live SQLite file digest changed after startup while semantic counts remained preserved. Treat the retained pre-install copy as rollback authority.

## Running service

- Listener: `0.0.0.0:7337`.
- Advertised URL: `http://192.168.1.107:7337/`.
- Health: `/healthz` returned `{"status":"ready"}`.
- Advertised-origin pairing accepted a fresh one-use code.
- Authenticated `/api/resources?limit=100` returned the preserved one resource.
- Terminal QR printed at startup.

## Installed feature checks

- Installed package version: `1.11.0`.
- Theme registry default: `cortex-tabs`.
- Theme settings and local asset routes validated before installation.
- Full release gate: 83 tests, bootstrap/schema/syntax checks passed before packaging.

## Rollback

Stop `v1.11.0`, preserve `.runtime/live`, restore `.runtime/artifacts/noesis-live-backup-v1.11.0-preinstall/mind.sqlite` to a separate verified destination, and install the prior release. Do not delete `.runtime/live`. HTTP LAN transport remains unencrypted.

## Limitations

No second physical LAN device was available. Screen-reader output, forced-colors runtime emulation, full contrast matrix, field performance, and deployment validation remain unverified.
