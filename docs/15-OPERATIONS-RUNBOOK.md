# NOESIS v1.0 operations runbook

Supported environment is Linux x86_64 with Node.js 24.x, npm 11.x, SQLite through `node:sqlite`, and OMP 19.1.1. Runtime data stays outside the checkout.

## Clean install

```bash
npm ci --ignore-scripts
npm run release:check
```

The release gate runs the application suite, bootstrap validator, and CLI/server syntax checks.

## Start and pair

```bash
NOESIS_DATA_DIR="$HOME/.local/share/noesis" npm start
curl -fsS http://127.0.0.1:7337/healthz
```

Open the actual URL printed after `NOESIS ready at`. Enter the separate one-use pairing code. The QR contains the URL, not the pairing code.

Use `NOESIS_PORT=<port>` for a deliberate port override. A bind failure is fatal and does not print a working-access claim. Stop with `Ctrl-C`; restart with the same data directory.

## Backup and restore

```bash
node --input-type=module -e 'import { backupDatabase } from "./src/operations.mjs"; console.log(backupDatabase(process.argv[1], process.argv[2]))' "$HOME/.local/share/noesis/mind.sqlite" "$HOME/backups/noesis-mind.sqlite"
node --input-type=module -e 'import { restoreDatabase } from "./src/operations.mjs"; console.log(restoreDatabase(process.argv[1], process.argv[2]))' "$HOME/backups/noesis-mind.sqlite" "$HOME/restore/noesis-mind.sqlite"
```

Restore to a separate absent destination first. Inspect it before switching `NOESIS_DATA_DIR`. Native archive export verifies SHA-256 integrity and reports omitted uncontrolled copies.
## Import an OMP JSONL session

Run preflight before writing. Preflight reads one UTF-8 JSONL file and reports its digest, session metadata, visible message coverage, chunk count, and quarantine candidates.

```bash
npm run import:omp -- preflight --source /path/to/session.jsonl
```

Start a run against the selected NOESIS database. The importer stores the exact raw source in SQLite and returns a run ID.

```bash
npm run import:omp -- start --source /path/to/session.jsonl --database "$NOESIS_DATABASE"
```

Resume a run in bounded batches. Repeat the command with the returned run ID until `state` is `completed`.

```bash
npm run import:omp -- resume --run-id RUN_ID --database "$NOESIS_DATABASE" --max-lines 64
npm run import:omp -- status --run-id RUN_ID --database "$NOESIS_DATABASE"
```

Imported visible text remains `document_import` evidence. Hidden reasoning, tool-call arguments, and derived summaries are not imported. Malformed, unsupported, or text-free entries remain in the run quarantine. The raw source remains available for later inspection. Back up the database before importing live data.

## Upgrade and rollback

1. Stop NOESIS.
2. Copy the current database through `backupDatabase`.
3. Check out or unpack the candidate.
4. Run `npm ci --ignore-scripts` and `npm run release:check`.
5. Start with the existing data directory. Migrations run transactionally.
6. If the candidate fails, stop it and start the prior candidate with the backup or restored database.

Never copy a live SQLite main file as a backup. Do not delete the data directory when removing the code checkout.

## Pairing and privacy

Pairing protects private reads and mutations. Revoke active sessions by restarting the service. HTTP on a trusted LAN is not transport encryption; use an authorized HTTPS reverse proxy when required. NOESIS does not configure routers, firewalls, certificates, or public forwarding.

Exports redact selected paths and bearer-like tokens when requested. Imported or dreamed content does not gain trust, scope, or verification automatically. External copies are outside service-controlled deletion.

## Known limits

MCP and external memory backends are deferred and unavailable. Provider-backed model enrichment is not enabled by default. Physical second-device LAN validation was unavailable during this candidate check.
