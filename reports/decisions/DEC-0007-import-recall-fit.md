# Decision 0007: import chunks fit recall budget

## Status

Accepted for local implementation as a bounded Resonance follow-up.

## Evidence

The v1.6.1 target probe found one design/research miss. The target message was 31,282 characters and split into two imported records. Both chunks exceeded the 12,000-character recall budget, so lexical recall omitted the target under budget pressure.

## Selected change

Set the OMP importer record chunk limit to 12,000 characters, matching the existing default inline recall budget. Existing source digest, line, character-range, provenance, quarantine, and resumable semantics remain unchanged. Re-importing the same source creates more smaller records without content loss.

## Acceptance

The existing chunk reconstruction test passes with the lower limit. A real coding and design/research import probe returns all selected unique target entries under `max_chars=12000`, or records an honest residual miss. Existing recall, archive, scope, and release checks pass.

## Limits

This change improves imported-history continuity only. It is not a semantic retrieval claim. Existing imported records are not rewritten automatically. Operators must re-import a source to apply the smaller chunking policy.
