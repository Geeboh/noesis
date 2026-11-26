import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { openService } from "../src/service.mjs";
import { createMcpAdapter } from "../src/mcp-adapter.mjs";

const dataDirectory = process.env.NOESIS_DATA_DIR ?? join(process.cwd(), ".noesis");
const filename = process.env.NOESIS_DATABASE ?? join(dataDirectory, "mind.sqlite");
mkdirSync(dirname(filename), { recursive: true });

const service = openService(filename);
const adapter = createMcpAdapter({ service });
const input = createInterface({ input: process.stdin, crlfDelay: Infinity });

try {
  for await (const line of input) {
    const response = adapter.handleLine(line);
    if (response !== null && response !== undefined) process.stdout.write(`${JSON.stringify(response)}\n`);
  }
} catch (error) {
  console.error(error?.stack ?? error);
  process.exitCode = 1;
} finally {
  service.close();
}
