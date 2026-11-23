# Decision DEC-0001 — M0 application toolchain

**Status:** accepted
**Date:** 2026-11-24
**Owner:** integration owner
**Related tasks:** M0-01, M0-03, M0-05, M0-06
**Supersedes / superseded by:** none

## Decision

Use Node.js 24 ESM with npm 11, the built-in `node:sqlite` `DatabaseSync` API, same-origin `node:http`, and the pinned `qrcode` 1.5.4 package. Keep OMP 19.1.1 as the host runtime and load a file-backed JavaScript extension. Use SQLite as the sole authority; keep search, graphs, Lore, and exports derived.

## Context and constraints

Observed host: Linux x86_64, Python 3.12.3, Node v24.22.3, npm 11.19.1, SQLite CLI 3.45.1, and `/root/.local/bin/omp` version 19.1.1. Bun and pnpm are absent. A real extension probe loaded `pi.registerTool`, `pi.on`, `pi.arktype`, `pi.zod`, `pi.typebox`, and the events facade. Global OMP memory is configured `off`; this choice remains user-owned and NOESIS does not rewrite it.

The repository requires a host-independent service, SQLite authority, native OMP integration, durable jobs, same-origin LAN access, pairing, and a terminal text QR. No application dependency may replace the installed OMP host or copy monorepo workspace specifiers.

## Options considered

| Option | Benefit | Cost or limitation | Evidence |
| --- | --- | --- | --- |
| Node 24 plus `node:sqlite` and npm | Available now, no native database build, one runtime for service and extension tooling | `node:sqlite` is host-version dependent and must remain pinned by the engine range | `node --version`; successful `DatabaseSync` probe |
| Bun plus SQLite package | Matches upstream OMP ecosystem | Bun is not installed; adding a second runtime violates the local-first constraint | `python3 scripts/doctor.py` |
| Python service | QR helper and SQLite are available | Does not match the verified OMP extension ecosystem and adds a second application language | Host inventory and architecture contract |

## Reasoning and consequences

Node 24 removes a database driver dependency and keeps transactions in the selected runtime. `qrcode` is the only direct application dependency because the service must render a deterministic terminal QR after binding. The service will call no model by default; deterministic Snooze remains usable when model access is unavailable. If a future supported Node release removes or changes `node:sqlite`, replace it with one pinned driver and rerun storage evidence before changing the supported environment.

The OMP extension uses the installed host's runtime API, not an independently bundled OMP package. User credentials, global settings, and native memory configuration remain outside the repository.

## Validation and reversal

M0 targets `environment.compatibility`, `contracts.schema`, and `bootstrap.integrity`. The scaffold command is `npm run test:m0`; the full application command is `npm test`; OMP loading uses `npm run probe:omp`. Reversal means removing `qrcode` and selecting a tested SQLite driver if the Node engine check fails. No user data or global configuration is changed by this decision.

## Authorization boundary

No external or irreversible action is required. Remote publication, deployment, and license selection remain unauthorized and unresolved.

## Outcome

The selected candidate is recorded in `validation/registry.json`. The M0 scaffold check passed against Node 24, built-in SQLite, and qrcode 1.5.4. Real service behavior, native capture, and dashboard behavior remain pending M1.
