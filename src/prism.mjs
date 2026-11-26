import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";

export const MAX_IMAGE_BYTES = 64 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_HEADER_BYTES = 33;

function invalid(message) {
 throw new Error(message);
}

function readSource(source_path, max_bytes) {
 if (typeof source_path !== "string" || source_path.length === 0) invalid("source_path is required");
 if (!Number.isInteger(max_bytes) || max_bytes < 1 || max_bytes > MAX_IMAGE_BYTES) invalid(`max_bytes must be an integer from 1 to ${MAX_IMAGE_BYTES}`);

 let stat;
 try {
  stat = statSync(source_path);
 } catch (error) {
  throw new Error(`unable to read source: ${error.message}`);
 }
 if (!stat.isFile()) invalid("source_path must be a regular file");
 if (stat.size > max_bytes) invalid(`source exceeds ${max_bytes} bytes`);

 let bytes;
 try {
  bytes = readFileSync(source_path);
 } catch (error) {
  throw new Error(`unable to read source: ${error.message}`);
 }
 if (bytes.byteLength > max_bytes) invalid(`source exceeds ${max_bytes} bytes`);
 return bytes;
}

function parseHeader(bytes) {
 if (bytes.byteLength < PNG_HEADER_BYTES) invalid("PNG header is truncated: expected at least 33 bytes");
 if (!PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) invalid("source does not have a PNG signature");
 if (bytes.readUInt32BE(8) !== 13) invalid("PNG IHDR length must be 13 bytes");
 if (bytes.toString("ascii", 12, 16) !== "IHDR") invalid("PNG first chunk must be IHDR");

 return {
  coverage: "complete_header",
  byte_range: { start: 0, end: PNG_HEADER_BYTES },
  width: bytes.readUInt32BE(16),
  height: bytes.readUInt32BE(20),
  bit_depth: bytes[24],
  color_type: bytes[25],
  compression: bytes[26],
  filter: bytes[27],
  interlace: bytes[28],
 };
}

export function inspectPng({ source_path, max_bytes = MAX_IMAGE_BYTES } = {}) {
 const bytes = readSource(source_path, max_bytes);
 const inspection = parseHeader(bytes);
 return {
  format: "png",
  source: {
   locator: source_path,
   digest: createHash("sha256").update(bytes).digest("hex"),
   byte_length: bytes.byteLength,
  },
  inspection,
  limitations: ["pixels were not decoded", "OCR was not performed"],
 };
}
