# Operations, LAN access and budgets

## Deployment baseline

One local NOESIS service owns its database, derived views and durable jobs. The OMP adapter and dashboard connect to the same service. Optional MCP uses the same policy. Multiple projects may be visible to one principal without becoming a single unscoped namespace.

Proposed defaults: bind `0.0.0.0`, port `7337`, same-origin dashboard/API/event stream, paired sessions, no automatic router mapping or Internet publication. IPv6 can be enabled deliberately with equivalent access controls. Local-first persistence remains compatible with default LAN access.

## Startup and terminal text QR

The application startup sequence MUST:

1. Load validated configuration; resolve the data directory; acquire the service/database ownership mechanism.
2. Open/migrate storage according to backup/compatibility policy; start required workers without duplicating ownership.
3. Successfully bind the listener and verify readiness before printing usable access instructions.
4. Enumerate actual non-loopback interface candidates, honoring a valid explicit advertised host. Prefer a relevant LAN address but list alternatives; virtual adapters, VPNs and containers may make automatic selection ambiguous.
5. Print the actual port, selected pairing URL and alternate addresses. Never present `0.0.0.0` or `::` as a client address. Bracket IPv6 literals when supported. If no usable LAN address exists, explain the limitation and show loopback as a fallback, not as LAN success.
6. Render a high-contrast, quiet-zone-preserving **text QR in the terminal** for the selected access/pairing URL. Use a deterministic QR library and support dense Unicode plus an ASCII fallback. Print the URL next to it. The code must scan in both common terminal color schemes; offer an inverted renderer where needed.
7. Display a short-lived, one-use pairing code locally, separately from the QR. Do not put a durable bearer token, database path, private scope or API credential in the URL.

The QR reflects the advertised URL after any selected port change. A port conflict fails clearly by default; if an explicit fallback-port policy is enabled, display and encode the actual selected port. Do not silently announce an occupied port.

The bootstrap's `scripts/lan_qr.py` demonstrates text rendering for an explicit URL. It does not implement service startup, discovery or pairing; M1 ports/implements the behavior in the chosen application runtime.

## Pairing and sessions

All private reads, writes, searches, source previews, graph expansions, exports, job streams and MCP calls require an authenticated principal. The unauthenticated surface is limited to pairing, non-sensitive static assets and minimal liveness information.

Generate pairing codes from a cryptographically secure source, expire them, limit attempts and invalidate after use. A proposed initial policy is 8 numeric digits, 5-minute lifetime, conservative per-client plus global attempt limits, and explicit local regeneration. Bind successful pairing to a revocable server-side session. Use HttpOnly cookies, SameSite protection, origin/Host validation and CSRF protection for mutations; set Secure when serving HTTPS. No wildcard credentialed CORS. Recheck authorization on streams and job effects. The local CLI has an intentional operator channel for pairing reset/revocation rather than an unauthenticated reset endpoint.

Default HTTP on a trusted LAN provides convenience, not transport encryption. Document optional TLS/reverse-proxy deployment for networks requiring confidentiality in transit. Do not claim TLS protection merely because pairing is enabled. Do not automatically modify host firewall, router, DNS or certificates. Supply exact environment-specific steps after discovery when the operator asks.

M1 tests wrong/expired/reused codes, rate limits, private unauthenticated reads, cross-origin mutations, streams, restart/session persistence and the displayed URL. M8 exercises a real second device when available and reports the actual environment.

## Storage and backups

Separate runtime data from the code checkout. Respect platform data/config/cache locations and explicit overrides; resolve and display the actual paths. Suggested logical contents: authoritative SQLite database; source blobs/snapshots; rebuildable indexes; job state; exports; bounded logs. Do not put raw memory, credentials or paired-session secrets into Git.

Use transactional schema migrations with a recorded version, compatibility preflight and a verified recovery path. Create a backup before destructive migration. SQLite backup operations must use an online-safe backup/checkpoint method appropriate to the chosen driver; copying only a live main file can omit journal state. Test restore with both database and referenced blobs. A backup is useful only after a restore has been demonstrated.

Retention policies distinguish authoritative evidence, large raw blobs, caches, jobs and logs. Preserve locators and explicit source-unavailable state when retention removes bytes. Do not promise infinite retention or erase lineage silently. Explicit deletion reconciles controlled derivatives and reports external copies the service cannot change.

## Concurrency and recovery

Use transactions and optimistic revision checks for mutations. One lease owner processes a durable job at a time; leases expire and retries use stable operation IDs. Store stage checkpoints before claiming progress, and commit output records with their lineage and applied-operation receipt. A crash after an effect but before acknowledgement must not create a duplicate effect.

Scope and budget are revalidated at execution and commit. Cancellation is durable; cooperate at bounded checkpoints and release reservations. A browser disconnect does not cancel the underlying job. Foreground requests have priority over discretionary background work. Backpressure pauses expensive ingestion rather than discarding sources.

## Budget defaults

`config/noesis.example.json` is a proposed policy fixture, not installed OMP configuration. Starting limits are engineering defaults to calibrate in M0/M1, not measured optimal values.

| Level | Initial model-token ceiling | Initial wall-time ceiling | Candidate ceiling | Model calls |
| --- | --- | --- | --- | --- |
| Snooze | 0 | 30 seconds | 100 | 0 |
| Nap | 12,000 | 90 seconds | 150 | 3 |
| Dream | 40,000 | 300 seconds | 400 | 8 |
| Deep Sleep | 100,000 | 900 seconds | 1,200 | 20 |

Token budget covers aggregate input+output across parent/child calls and retries. Embedding tokens and provider charges are additionally tracked and included in a monetary cap when configured. Wall time includes waits; pause/resume must not silently reset consumed work budgets. Limit concurrency separately (1/1/2/2 for Snooze/Nap/Dream/Deep Sleep); total child-job ceilings are 0/1/3/6 and output-record ceilings are 100/25/50/100 and reserve a maximum cost before admission when price information is available.

Automatic default: deterministic Snooze only, debounced after activity, with bounded batches and a durable backlog. Enable model-assisted automatic Naps only after a usable model and explicit operating budget are configured. User-invoked jobs use configured ceilings; a null price estimate means unknown, never zero. If a monetary cap is required and a provider's price cannot be bounded, decline that model path and explain available alternatives. Estimates and actuals are separate fields.

Reserve configured model roles by capability (extraction, synthesis, evaluation) rather than hardcoded provider/model names. Apply the user's existing choices and limits. Cache source transformations by content hash, model/prompt/config version and effective scope. Reusing a result does not create new evidence.

## Observability

Emit structured events with job/operation/source/resource IDs, revision, stage, actual cost and reason. Avoid logging source bodies or secrets by default. Display progress with known work units and coverage; use an indeterminate state where the denominator is unknown. Separate heartbeats from substantive advancement.

Pulse reports queue depth, oldest pending work, recent errors, available capabilities, resource use and last successful backup. Counts are operational metrics, not intelligence scores. Include an exportable sanitized diagnostic bundle and explain its contents.

## Operational runbooks required by v1.0

- Install, first start, pair device, choose advertised interface, port conflict and firewall troubleshooting.
- Start/stop/restart, data path discovery, graceful shutdown and stale lease recovery.
- Provider unavailable, unknown cost, budget exhausted, malformed extraction and failed migration.
- Search/index repair from authoritative records; interrupted Lore refresh; invalid import.
- Backup, restore to a separate location, upgrade and rollback.
- Pairing/session revocation, lost local pairing access, optional HTTPS and MCP credentials.
- Export/archive verification, explicit deletion and uninstall while choosing whether to retain data.

The application runbooks must contain commands that exist in the implemented CLI. Proposed commands in design documents must be labeled until implemented and tested.
