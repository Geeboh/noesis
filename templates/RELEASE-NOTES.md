# NOESIS <product version> — release notes

**Release state:** <local candidate / locally accepted / published with authorization>  
**Date:** <actual date>  
**Source:** <accepted commit>  
**Artifact:** <filename and checksum, if produced>  
**Milestone:** <M1–M8>  
**Supported environment:** <tested OMP/runtime/platform versions>

The bootstrap package is version 1.0.0; that number is independent of this product version. M0 has no product release. Do not list planned functionality as shipped.

## What changed

<Lead with the concrete user problem addressed and the resulting working behavior. Describe substantial changes in clear language.>

## Included capabilities

| Capability | Available behavior | Evidence or relevant guide |
| --- | --- | --- |
| <feature> | <what this artifact supports> | <reference> |

## Installation and startup

<Use the executable commands verified in M0 and exercised for this artifact. Include the supported configuration and actual optional components. Do not invent package names, registry URLs, or app commands.>

For a release with the Observatory, explain the default LAN listener, actual advertised address, terminal text QR, multi-interface selection, and initial pairing flow. Keep secrets out of URLs and examples. State whether a real cross-device check was performed; identify a specific validation limitation if no second device was available.

## Compatibility and migration

<Describe persisted schema changes, backup advice tied to actual migrations, configuration changes, and backward-compatibility limits. Include a concrete rollback or recovery procedure only if it has been verified.>

## Validation evidence

| Target/workflow | Candidate-specific result | Evidence | Practical limit |
| --- | --- | --- | --- |
| <app target> | <passed / failed / partial / unavailable / not run> | <reference> | <limit> |

<Summarize measured latency/resource usage when material, with workload, hardware, and model conditions. Avoid unqualified universal accuracy or performance claims.>

## Known limitations

<State material unsupported cases, model uncertainty, compatibility restrictions, and unavailable checks. Link concrete follow-up tasks. Do not turn a limitation into an invented successful result.>

## Scope and publication

<State what was produced locally and what was actually published, if anything. Preparing this artifact does not authorize remote pushes, package publication, deployments, or automatic source changes suggested by a Blueprint.>

## Next release

<Identify the next roadmap goal and evidence-based changes to the forecast. Treat dates as estimates unless the user has explicitly agreed a delivery commitment.>
