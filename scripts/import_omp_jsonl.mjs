#!/usr/bin/env node
import { join } from "node:path";
import { getOmpJsonlImportStatus, preflightOmpJsonl, resumeOmpJsonlImport, startOmpJsonlImport } from "../src/importer.mjs";
import { openService } from "../src/service.mjs";

function usage() {
  console.error("Usage: node scripts/import_omp_jsonl.mjs <preflight|start|resume|status> [--source PATH] [--run-id ID] [--database PATH] [--max-lines N]");
  process.exitCode = 2;
}
function options(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2).replaceAll("-", "_");
    result[key] = argv[index + 1]?.startsWith("--") ? true : argv[++index];
  }
  return result;
}
const [command, ...rest] = process.argv.slice(2);
const opts = options(rest);
if (!["preflight", "start", "resume", "status"].includes(command)) {
  usage();
} else if (command === "preflight" && typeof opts.source !== "string") {
  usage();
} else if (["resume", "status"].includes(command) && typeof opts.run_id !== "string") {
  usage();
} else {
  const owner_id = typeof opts.owner === "string" ? opts.owner : "local";
  const database = opts.database ?? process.env.NOESIS_DATABASE ?? join(process.env.NOESIS_DATA_DIR ?? join(process.cwd(), ".noesis"), "mind.sqlite");
  if (command === "preflight") {
    console.log(JSON.stringify(preflightOmpJsonl({ source_path: opts.source }), null, 2));
  } else {
    const service = openService(database);
    try {
      const principal = { owner_id, scope_ids: [] };
      const result = command === "start"
        ? startOmpJsonlImport({ store: service.store, principal, source_path: opts.source })
        : command === "resume"
          ? resumeOmpJsonlImport({ service, principal, run_id: opts.run_id, max_lines: opts.max_lines === undefined ? 64 : Number(opts.max_lines) })
          : getOmpJsonlImportStatus({ store: service.store, principal, run_id: opts.run_id });
      console.log(JSON.stringify(result, null, 2));
    } finally {
      service.close();
    }
  }
}
