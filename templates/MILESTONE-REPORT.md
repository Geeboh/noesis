# Milestone report — <M0–M8 and title>

**Date:** <actual report date>  
**Owner/reviewer:** <actual people or agents>  
**State:** <in_progress / blocked / needs_review / done>  
**Candidate:** <commit ID or artifact identifier>  
**Product target:** <unreleased for M0, otherwise the planned version>  
**Bootstrap version:** 1.0.0

## Outcome

<State what now works, why it matters, and any material limit. Distinguish implemented behavior from proposed behavior.>

## Scope delivered

| Task ID | Concrete output | Acceptance result | Evidence |
| --- | --- | --- | --- |
| <M?-??> | <existing output> | <met / partial / unmet> | <candidate-specific reference> |

## Exit criteria

| Roadmap criterion | Observed result | Evidence or remaining work |
| --- | --- | --- |
| <copy the applicable criterion> | <met / partial / unmet> | <reference or bounded next action> |

Do not mark the milestone done while required tasks or criteria remain unmet. An explicit scope change must identify its decision record and release consequence; it is not a substitute for evidence.

## Validation

**Environment:** <actual OS, runtime, package manager, OMP version, model/provider when relevant>  
**Tested candidate:** <commit/artifact identity>  
**Fixture/data origin:** <synthetic or authorized source; no private payloads in this report>

| Target | Exact command or observed procedure | Result | Evidence | Limitation |
| --- | --- | --- | --- | --- |
| <registered target> | <what actually ran> | <passed / failed / partial / unavailable / not run> | <log/artifact reference> | <specific limit or none> |

Bootstrap validation verifies the package, not application behavior. Do not claim a command passed because a plan or CI file contains it. Keep checks proportional to the changed invariants and existing milestone gate; do not add broad testing without a concrete remaining risk.

## Web and LAN evidence, when applicable

<Describe the actual Observatory journey using real data. Record the bound port, advertised interface/address selection, text QR correctness, pairing and denied-access results. Never include pairing secrets or authenticated URLs.>

**Cross-device status:** <actually observed on a named type of second device / unavailable / not applicable>  
**Evidence or precise limitation:** <what was verified; do not imply a physical device check from loopback or mocked tests>

## Decisions and deviations

| Decision or change | Reason/evidence | Effect on scope, compatibility, cost, or schedule |
| --- | --- | --- |
| <decision reference> | <reason> | <effect> |

## Remaining risks and bounded follow-up

<List material unresolved issues with task IDs and owners. Separate release blockers from nonblocking limitations. Human feedback is optional input unless a particular external action actually requires authorization; a mandatory human QA session is not a milestone gate.>

## Integration and release disposition

<Record reviewed integration, actual source/artifact identity, migration notes, and local release readiness. State separately whether remote publication is authorized or has occurred. Never treat a local tag or package as a published release.>

## Next milestone

<Identify newly unblocked tasks, available parallel lanes, and any evidence-based forecast adjustment. Update both planning JSON files and STATUS.md after acceptance. Populate the accepted tasks' and milestone's completion_evidence arrays with actual report/result references before setting their status to done; planned evidence criteria do not satisfy this requirement.>
