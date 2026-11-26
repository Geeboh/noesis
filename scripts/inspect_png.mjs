#!/usr/bin/env node

import { inspectPng } from "../src/prism.mjs";

function parseSource(argv) {
 let source;
 for (let index = 0; index < argv.length; index += 1) {
  if (argv[index] !== "--source") throw new Error("Usage: node scripts/inspect_png.mjs --source PATH");
  if (source !== undefined || typeof argv[index + 1] !== "string" || argv[index + 1].startsWith("--")) {
   throw new Error("Usage: node scripts/inspect_png.mjs --source PATH");
  }
  source = argv[++index];
 }
 if (source === undefined) throw new Error("Usage: node scripts/inspect_png.mjs --source PATH");
 return source;
}

try {
 const source_path = parseSource(process.argv.slice(2));
 process.stdout.write(`${JSON.stringify(inspectPng({ source_path }))}\n`);
} catch (error) {
 const message = error instanceof Error ? error.message : String(error);
 process.stderr.write(`inspect_png: ${message}\n`);
 process.exitCode = 1;
}
