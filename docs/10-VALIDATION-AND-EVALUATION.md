# Validation and evaluation

## Four different kinds of evidence

1. **Bootstrap integrity:** delivered files, schema examples, plan consistency and working helper behavior.
2. **Application correctness:** deterministic unit/integration/property tests for service and UI contracts.
3. **Real OMP integration:** the installed host loads the adapter and actual events/tools produce the expected records.
4. **Learning quality:** held-out examples show useful recall, preference adaptation, careful consolidation and actionable exports.

Report these separately. Passing bootstrap checks does not make M1 complete. A fake in-memory adapter cannot establish host compatibility. A good model-generated explanation does not establish an actual successful outcome.

## Validation targets

The authoritative registry is `planning/backlog.json` -> `validation_policy.target_registry`. M0 binds these named targets to actual runtime commands, fixtures and CI jobs in a generated validation registry. Commands are concrete only after the toolchain is selected; never report a planned target as a command that ran.

The delivered bootstrap commands are already executable:

```bash
python3 scripts/validate_bootstrap.py
python3 scripts/validate_bootstrap.py --delivery-snapshot
python3 -m unittest discover -s tests/bootstrap -v
```

`--delivery-snapshot` checks the initial all-planned/unreleased state and is only for the original bootstrap. Ordinary validation allows documented task status transitions. Full contract example checks require the isolated dependencies in `requirements-validation.txt` and `--strict-schemas`.

## Required behavioral scenarios

These define meaningful tests, not an implementation-specific test count. Bind each scenario to the corresponding milestone task and record its fixture/command.

| Scenario | Expected observation | Milestone |
| --- | --- | --- |
| V-001 Restart/replay | Replaying a captured OMP event after restart creates one canonical event and no extra independent confirmation. | M1 |
| V-002 Extraction failure | A failed transform remains retryable; successful-empty is distinct from failure; source remains accessible. | M1 |
| V-003 Scoped recall | Records outside effective scope do not appear in results, graph expansion, citations, pages or exports. | M1/M2 |
| V-004 Real host | Actual OMP loads extension, exposes tools, captures an episode and recalls it across a fresh session. | M1 |
| V-005 Minimal dream | Deterministic Snooze has a durable job, bounded effects, restart behavior and honest capability reporting. | M1 |
| V-006 LAN/QR | Post-readiness URL uses a real interface/port; decoded terminal QR equals that URL; pairing gates private API/UI/streams. | M1 |
| V-007 Resource identity | Duplicate title, renamed tool, URL alias, snapshot update and shared tool ownership do not collapse distinct identities incorrectly. | M2 |
| V-008 Use tracing | Retrieved-only records are not reported as applied; positive feedback does not validate unused evidence. | M2 |
| V-009 Preference | Repeated independent progress requests produce a contextual preference; repeats within one incident do not multiply evidence. | M3 |
| V-010 Instruction override | A current quiet-execution instruction controls the task while preserving the stored preference's history. | M3 |
| V-011 Fading invariance | Two maintenance runs at the same effective time equal one; reopening/exploring does not confirm a record. | M3 |
| V-012 Protected guidance | Applicable explicit constraints and open commitments survive inactivity; revival preserves counterevidence. | M3 |
| V-013 Deletion propagation | Controlled indexes, dependent generated text and caches reconcile with explicit deletion; coverage limitations are reported. | M3/M5 |
| V-014 Dream crash | Crash at each commit boundary, retry and cancellation do not duplicate accepted changes or advance failed work. | M4 |
| V-015 Full budget | Child calls, retry reservations and model/embedding costs count against the same hard limit; unknown prices are not zero. | M4 |
| V-016 Hypothesis origin | Rehearsed outcomes remain hypothetical and cannot support a claim that a tool executed successfully. | M4 |
| V-017 Independent evaluation | A proposed retrieval-policy change is tuned on development cases and evaluated on held-out cases before promotion. | M4 |
| V-018 Lore authorship | Generated refresh preserves authored blocks and identifies the exact claims affected by changed evidence. | M5 |
| V-019 No circular proof | A source -> memory -> wiki -> export chain still has one underlying source family. | M5/M6 |
| V-020 Export scope | Tool export stays within selected scope; plugin aggregation attributes shared-tool events and selected versions correctly. | M6 |
| V-021 Weak evidence | Mention-only target yields an investigation brief, not an invented list of confirmed shortcomings. | M6 |
| V-022 Round trip | Native archive validates hashes/schema and restores identities/lineage; optional format losses are explicit. | M7 |
| V-023 Backup/upgrade | Restore and migration against realistic fixtures preserve evidence and allow an operational rollback. | M8 |
| V-024 Accessible UI | Main journeys work with keyboard, visible focus, handheld layout and a non-graph alternative. | M8 |
| V-025 Load and interruption | Bounded paginated queries, streaming reconnect and concurrent writers behave within measured limits. | M8 |
| V-026 Real second device | Where available, a second LAN device scans/pairs/reads/receives events; otherwise this exact environmental check remains unverified. | M8 |

## Test layers and scope

Keep pure policy and serialization tests cheap. Use a real temporary database for transactions, migrations, revisions and recovery. Use deterministic clocks for Ebb and job deadlines. Use seeded failure injection for ingestion, provider timeouts, dropped streams and restart points. Test schema compatibility at adapter boundaries. Use browser automation for critical journeys once a working web UI exists.

A few carefully chosen end-to-end journeys are preferable to duplicating every unit test through the browser. Add tests for material behavior, corrections and risks, not reversible text edits or assertions that merely repeat the code.

## Learning evaluation set

Build a small synthetic/consented corpus spanning coding, research, writing, operations and planning. Include failures, ambiguity, old versions, contradictory sources and unsupported questions. Separate independent incidents and source families. Hold out whole tasks/projects or later time windows when testing generalization; do not split near-duplicate turns between train and evaluation.

Initial cases should cover: progress preference; resource mentioned but unread; useful old constraint; updated tool version; plausible but wrong dream; shared plugin/tool attribution; a copied lesson returning via an import; wiki source withdrawal; source with an embedded instruction; multi-project retrieval boundaries.

Measure retrieval usefulness, precision/recall on labeled cases, appropriate abstention, source correctness, stale-guidance rate, erroneous preference generalization, practical export usefulness and cost. Record denominator and confidence limitations. No universal intelligence score. A changed metric is not proof of causation; inspect the cases and regression constraints.

## Performance and cost protocol

Use declared hardware/runtime/model versions and a fixed corpus size. Record p50/p95 latency for actual capture/lookup/recall/search/graph/page/job operations, ingestion throughput, storage size, peak resource use and total model/embedding tokens. Distinguish cold and warm paths and background load. M0 sets initial targets after baseline measurement; do not invent a target from an unrelated benchmark.

For each release compare to the previous accepted version and a simple searchable-journal baseline. Optional vector/graph backends must justify themselves with measured benefit and operational cost. Parallelism changes latency and contention; it does not make work free.

## Evidence records and release decisions

A useful record contains target ID, task/milestone, exact revision, command, environment, start/end, exit status, sanitized relevant output and limitations. Synthetic, mock, real-host, browser and real-device observations are labeled. Tests run before a later code change must be rerun for the affected behavior.

Statuses: passed, failed, not_run, unavailable, or waived with explicit rationale. A waiver cannot rename a failing behavior as passed. Fix release-critical regressions; defer unrelated improvements in the backlog. Human user testing is optional during implementation and cannot become an invented gate. The stable release must state any remaining deployment/environment limitations honestly.

Bootstrap-generated reports remain about the bootstrap. The included CI must not publish application release badges until application checks and real evidence exist.
