# Bootstrap validation report

Prepared 24 November 2026. Scope: the delivered bootstrap and its helper programs. The NOESIS application remains unreleased and its implementation tasks remain planned.

## Observed results

- **17 behavioral tests passed**, with no failures, errors or skipped tests in the isolated validation environment.
- **3 JSON Schemas and 21 synthetic examples passed** full offline draft-2020-12 validation using a local reference registry.
- Planning checks passed for **9 milestones, 54 tasks, 52 required tasks, 2 optional MCP tasks and 16 registered validation targets**; dependencies are acyclic.
- All 28 product requirements and 26 behavioral scenarios have task mappings in the traceability document.
- Markdown links/fences, JSON parsing, original-file hashes and package-path checks passed.
- Temporary Git tests passed for fresh initialization, initial commit/branch, preserved unlisted files, refusal of existing/nested repositories, identity handling and inherited-index rejection. No Git history is included in the delivered directory.
- Packaging tests produced byte-identical archives from the same allowlist, excluded an unrelated private fixture, passed ZIP integrity and refused overwrite.
- QR tests preserved the encoder matrix through Unicode, inverted Unicode and ASCII rendering. The explicit sample URL rendered successfully. This does not claim a phone scan or a live dashboard.
- Pinned optional Python dependencies installed successfully; `pip check` found no broken requirements. GitHub workflow and issue YAML parsed successfully; the workflow was not run on GitHub.

## Commands observed

```bash
python scripts/validate_bootstrap.py --delivery-snapshot --strict-schemas --json
python -m unittest discover -s tests/bootstrap -v
python -m pip check
python scripts/lan_qr.py --url http://192.168.1.20:7337/pair --invert
```

Commands used Python 3.12.14 in an isolated environment; Git was 2.56.1 on Linux. The sample address is an example, not a running endpoint. The full test run completed in 5.366 seconds. [Machine-readable results](reports/bootstrap-validation.json) record outcomes and limits.

## Validation limits carried into implementation

OMP and Bun were not installed in this packaging environment. No native OMP event capture, NOESIS application runtime, installed dashboard, hosted CI execution or physical second-device LAN connection is claimed. The appropriate checks are explicit M0/M1/M8 work, not silently marked complete by these bootstrap results.

The original delivery manifest identifies the packaged bytes. Ordinary bootstrap validation permits later planning progress; `--delivery-snapshot` is specifically for the initial all-planned package. Application validation commands and their evidence registry are established in M0.
