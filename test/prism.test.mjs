import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { inspectPng, MAX_IMAGE_BYTES } from "../src/prism.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "scripts", "inspect_png.mjs");
const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pngHeader({ width = 640, height = 480, bit_depth = 8, color_type = 6, compression = 0, filter = 0, interlace = 0 } = {}) {
 const bytes = Buffer.alloc(33);
 signature.copy(bytes, 0);
 bytes.writeUInt32BE(13, 8);
 bytes.write("IHDR", 12, 4, "ascii");
 bytes.writeUInt32BE(width, 16);
 bytes.writeUInt32BE(height, 20);
 bytes[24] = bit_depth;
 bytes[25] = color_type;
 bytes[26] = compression;
 bytes[27] = filter;
 bytes[28] = interlace;
 return bytes;
}

function tempSource(bytes, name = "fixture.png") {
 const directory = mkdtempSync(join(tmpdir(), "noesis-prism-"));
 const source = join(directory, name);
 writeFileSync(source, bytes);
 return { directory, source };
}

test("inspectPng reports exact source identity and complete IHDR metadata", () => {
 const bytes = pngHeader({ width: 1920, height: 1080, bit_depth: 16, color_type: 2, interlace: 1 });
 const { directory, source } = tempSource(bytes);
 try {
  assert.deepEqual(inspectPng({ source_path: source }), {
   format: "png",
   source: {
    locator: source,
    digest: createHash("sha256").update(bytes).digest("hex"),
    byte_length: 33,
   },
   inspection: {
    coverage: "complete_header",
    byte_range: { start: 0, end: 33 },
    width: 1920,
    height: 1080,
    bit_depth: 16,
    color_type: 2,
    compression: 0,
    filter: 0,
    interlace: 1,
   },
   limitations: ["pixels were not decoded", "OCR was not performed"],
  });
 } finally {
  rmSync(directory, { recursive: true, force: true });
 }
});

test("CLI emits JSON only and does not copy the source", () => {
 const bytes = pngHeader({ width: 320, height: 200 });
 const { directory, source } = tempSource(bytes);
 try {
  const before = readdirSync(directory).sort();
  const run = spawnSync(process.execPath, [cli, "--source", source], { encoding: "utf8" });
  const after = readdirSync(directory).sort();
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stderr, "");
  assert.deepEqual(after, before);
  assert.deepEqual(JSON.parse(run.stdout), inspectPng({ source_path: source }));
 } finally {
  rmSync(directory, { recursive: true, force: true });
 }
});

test("malformed, truncated, non-PNG, and oversized inputs fail without stdout claims", () => {
 const valid = pngHeader();
 const invalidLength = Buffer.from(valid);
 invalidLength.writeUInt32BE(12, 8);
 const cases = [
  ["non-PNG", Buffer.from("not a png header; still 33 bytes........".padEnd(33, ".")), /PNG signature/],
  ["truncated", valid.subarray(0, 32), /truncated/],
  ["invalid IHDR length", invalidLength, /IHDR length/],
 ];
 for (const [name, bytes, message] of cases) {
  const { directory, source } = tempSource(bytes, `${name.replaceAll(" ", "-")}.png`);
  try {
   assert.throws(() => inspectPng({ source_path: source }), message);
   const run = spawnSync(process.execPath, [cli, "--source", source], { encoding: "utf8" });
   assert.notEqual(run.status, 0);
   assert.equal(run.stdout, "");
   assert.match(run.stderr, message);
  } finally {
   rmSync(directory, { recursive: true, force: true });
  }
 }

 const { directory, source } = tempSource(valid);
 try {
  assert.throws(() => inspectPng({ source_path: source, max_bytes: 32 }), /source exceeds/);
  assert.throws(() => inspectPng({ source_path: source, max_bytes: MAX_IMAGE_BYTES + 1 }), /max_bytes/);
 } finally {
  rmSync(directory, { recursive: true, force: true });
 }
});
