# NOESIS v1.2.1 release notes

**Status:** local patch candidate, not published or installed.
**Candidate:** `b6be3179506e9e8844978c585bfd5cf8cf88c199`

## Implemented

- Recall continues after a matched record exceeds the remaining character budget.
- Oversized hits remain omitted and counted in coverage.
- Later fitting records can fill the remaining budget.
- R2 lexical score order, scope authorization, provenance, trace accounting, and result limits remain unchanged.

## Validation

The v1.2.0 baseline returned no records when one oversized high-score hit preceded smaller fitting records. The candidate returned the three smaller records, omitted the oversized hit, recorded one budget omission, and excluded the unauthorized record.

`npm run release:check` passed 58 tests. Service tests, Observatory tests, paired temporary Observatory recall, bootstrap validation, tracker validation, and artifact creation passed.

## Known limitations

- No labeled live recall corpus exists. This result is not a general quality claim.
- No model, vector, graph, MCP, connector, or external backend was added.
- The candidate was not installed into the live v1.2.0 service.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

R3 is local only. No branch, tag, package, deployment, or hosted release was published.
