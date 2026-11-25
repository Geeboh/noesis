# NOESIS v1.5.0 release notes

**Status:** local Aperture candidate, not published or installed.
**Candidate:** local change from published v1.4.0.

## Implemented

- Added revision-bound bounded `mind_inspect` pages.
- Added exact, partial, and unavailable coverage semantics.
- Added UTF-8-safe byte ranges and opaque continuation cursors bound to revision and authorization.
- Bumped capability revision to 2 with inspection limits.
- Preserved OMP compaction ownership and all existing Mind tools.

## Validation

Focused paging, cursor, scope, Observatory, and native capability checks passed. The full release gate passed 64 tests. Exact paging matched retained UTF-8 statement content across continuation pages.

## Known limitations

- Source snapshot objects are not byte-range paged in this slice.
- No model-accepted delivery or long-history usefulness result exists.
- Origami summaries remain deferred.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

R9 is local only. No branch, tag, package, deployment, or hosted release was published.
