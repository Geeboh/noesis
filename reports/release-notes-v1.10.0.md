# NOESIS v1.10.0 release notes

## Prism PNG inspection

NOESIS now has a bounded deterministic PNG header inspector.

- Reports exact source locator, byte length, and SHA-256.
- Validates the PNG signature and IHDR structure.
- Reports dimensions, bit depth, color type, compression, filter, interlace, and inspected byte range.
- Rejects malformed, truncated, non-PNG, and oversized inputs.
- Emits JSON without copying source bytes.
- Does not decode pixels or run OCR.

## Validation

The local candidate passed 81 tests and 21 JSON Schema examples. A relocated real screenshot inspected successfully. v1.9.2 remains installed and is the rollback baseline.
