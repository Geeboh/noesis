# NOESIS v1.2.4 release notes

**Status:** installed locally; GitHub publication authorized and pending.
**Candidate:** local change from published v1.2.3.

## Implemented

- Default recall coverage now lists effective owner-authorized scopes.
- Returned records, explicit scope requests, authorization, provenance, trace, and budgets remain unchanged.

## Validation

The v1.2.3 baseline returned an authorized record with an empty coverage scope list. The candidate reported `operator-scope`, returned the same record, and excluded another owner's record.

`npm run release:check` passed 61 tests. Service tests, paired Observatory scope recall, bootstrap validation, tracker validation, and artifact creation passed.

## Known limitations

- No labeled live scope corpus exists. This result is not a general quality claim.
- No model, vector, graph, MCP, connector, or external backend was added.
- The candidate was not installed into the live v1.2.3 service.
- Physical second-device LAN validation and full JSON Schema validation remain unavailable.

R6 is installed locally. GitHub publication is authorized and pending. No branch, tag, package, deployment, or hosted release was published yet.
