# Decision 0013: Prism bounded PNG inspection

## Status

Accepted for local implementation.

## User problem

NOESIS has text and web source inspection, but no modality-specific artifact inspection. PNG evidence can be identified by a path or filename without proving its exact bytes, dimensions, or inspected range.

## Selected behavior

Add a bounded PNG inspection module and CLI. The inspector validates the PNG signature and IHDR structure, computes the full SHA-256 and byte length, reports dimensions, bit depth, color type, interlace, and the exact inspected header range. It never decodes pixels, runs OCR, sends data to a model, or replaces the original artifact.

## Invariants

The original file remains the authority. A digest and locator do not claim that another copy is available. Malformed or truncated PNGs fail without creating a derived claim. The inspection is deterministic and has no Mind, OMP compaction, backend, or schema change.

## Acceptance

Synthetic PNG fixtures and one existing local screenshot prove valid metadata, exact digest/range reporting, truncation rejection, and size limits. The release gate passes. The feature remains an inspection utility until a later product decision connects it to Atlas sources.
