# Release report: R-0010 bounded OMP JSONL import

## Identity

- Release: `R-0010-omp-jsonl-import`.
- Target: `1.6.0`.
- Baseline: local R9 candidate `f15ed0026c31f96b9fd2a459756b6ca6622f047c`.
- Publication: not authorized.

## Status
Ready local. Validation and adoption passed for the declared scope.

## Delivered result

The candidate adds a SQLite-native OMP JSONL importer. Preflight is read-only. Start retains the exact UTF-8 source and digest. Resume processes bounded line batches with durable progress. Visible text imports as `document_import` evidence. Oversized messages chunk into ordered records. Unsupported and malformed entries enter quarantine. Native archive and restore preserve the import state and raw source.

The CLI is `npm run import:omp -- <preflight|start|resume|status>`. The importer does not add a Mind tool, model work, a provider proxy, or an OMP compaction hook.

## Validation

`reports/validation-R-0010.md` records the exact candidate, commands, focused evidence, release gate, native OMP probe, real-session smoke, and limitations.

- Focused importer and integration checks: 27 passed.
- Full release gate: 70 passed.
- Real coding session smoke: completed, 39 imported records, 58 quarantined entries.
- Real design/research session smoke: completed, 35 imported records, 79 quarantined entries.
- Artifact: `/tmp/noesis-r10-release/noesis-1.6.0.tgz`, SHA-256 `d4fec7d21116bfbeda13863d35d1525f4dbb4ad8793b30e31ee14a1b25f79c33`.
- Native OMP probe: capability revision 2 and existing four tools advertised.

## Disposition

Adopt the bounded importer as the published `1.6.0` candidate. Keep the installed v1.4.0 service as the live recovery baseline. Full JSON Schema validation was unavailable because the optional validation dependencies were not installed.

## Known limits

The importer accepts one UTF-8 source up to 64 MiB and one JSONL line up to 4 MiB. It imports visible user, assistant, and tool-result text only. Hidden reasoning, tool-call arguments, and derived summaries remain excluded. Raw source retention increases SQLite size. Public status omits quarantined raw bodies while the authoritative store retains them.

## Publication

- Branch `feat/m0-foundation` pushed to commit `bc236d55b92aab511593789f8b364804ab47351c`.
- Annotated tag `v1.6.0` pushed.
- GitHub release published at https://github.com/Geeboh/noesis/releases/tag/v1.6.0.
- Asset `noesis-1.6.0.tgz` uploaded with the recorded SHA-256.
- Live installation was not performed. v1.4.0 remains installed.
