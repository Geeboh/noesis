# R-0009 Aperture exact inspection review

**Candidate:** local v1.5.0 change from published v1.4.0.
**Target:** `1.5.0`.
**Decision:** READY locally. Adopt exact inspection for deterministic correctness. Defer Origami summaries and external compactor reuse.

## Review result

`mind_inspect` now supports bounded UTF-8 statement/content pages with revision-bound continuation, explicit exact/partial/unavailable coverage, returned ranges, byte counts, and honest unverified integrity status. Existing full inspection remains compatible. Scope and cursor authorization are rechecked on every page.

OMP capability revision 2 advertises inspection limits. No new top-level tool, compactor, provider, storage backend, or lifecycle policy was added.

## Checks

- Focused service/Atlas tests: passed, 20 tests.
- Observatory/native attachment tests: passed, 8 tests.
- `npm run release:check`: passed, 64 tests.
- Native OMP probe: extension readiness and `OK` passed.
- Bootstrap/tracker validation: passed; full JSON Schema dependencies unavailable.
- Artifact: `/tmp/noesis-r9-release/noesis-1.5.0.tgz`, SHA-256 `891a98ec75c0a4ec923696961a02d26ba537b0541eebcf0061f1f59aa39aa30d`.

## Limitations

Source snapshot objects are not byte-range paged in this slice. No model-accepted delivery or long-history usefulness result exists. No physical second-device check, provider proxy, upstream kernel, or remote publication was used.
