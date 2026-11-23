# Validation report: M6 Forge and Blueprints

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | VAL-M6-001 |
| Recorded at | 2026-11-24 |
| Operator | integration owner |
| Evidence class | application tests, authenticated HTTP, privacy and baseline checks, headless browser capture |
| Validation targets | `blueprints.portability`, `atlas.provenance`, `observatory.journeys`, `reverie.quality` |
| Behavioral scenarios | V-020, V-021 |
| Tasks / milestone | M6-01 through M6-06 / M6 |
| Result | passed for scoped deterministic Forge and Blueprint workflow |

## Candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | `4408fc6` |
| Runtime / package manager | Node v24.22.3; npm 11.19.1 |
| SQLite | 3.45.1 via `node:sqlite` `DatabaseSync` |
| OMP | omp/19.1.1 |
| Fixture/data | temporary SQLite stores and authenticated temporary Observatory stores |
| Physical second device | unavailable; no claim made |

## Observed checks

| Target | Exact command or procedure | Result | Limitation |
| --- | --- | --- | --- |
| `blueprints.portability` | `npm test`; structured Blueprint, redacted export, delta, and incompatible-baseline tests | passed | no remote patch or publication attempted |
| `atlas.provenance` | authenticated plugin and project resources with resource-attributed observations | passed | no cross-scope data included |
| `observatory.journeys` | `node --test test/observatory.test.mjs`; Forge, Blueprint, focused-dream, and scope journey | passed | browser capture is visual evidence only |
| `reverie.quality` | `npm test` | passed, 55 tests | deterministic local jobs only |

## Direct observations

A plugin resource and a project resource each produced one Forge finding from a resource-attributed observation. The Forge view kept their findings separate. A Blueprint included evidence, findings, suggestions, hypotheses, reproduction cases, scope, and version fields.

Redacted Blueprint output removed home-directory paths and bearer-like tokens. Delta output carried its cutoff and added record IDs. An incompatible baseline returned an explicit error instead of an ambiguous partial export. Focused dream admission preserved the selected resource ID in job focus.

Headless Chromium rendered the Forge and Blueprint controls at 1280x720 and 390x844 with title `NOESIS Observatory` and no page errors.

## Limitations and disposition

Forge and Blueprint execution is deterministic and local. No model enrichment, remote patch, publication, or external experiment is performed. Interactive browser controls, physical second-device LAN validation, and final release reproducibility remain unverified. M6 is closed with these limits recorded.
