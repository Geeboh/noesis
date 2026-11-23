# Validation report — <target and short purpose>

This report records one actual check or a clearly unrun check. A planned command, generated test file, static dashboard, or bootstrap check is not evidence that an application behavior works.

## Identity and scope

| Field | Value |
| --- | --- |
| Report ID | <stable ID> |
| Recorded at | <actual date/time and timezone> |
| Operator | <actual person or agent> |
| Evidence class | <bootstrap / synthetic policy / real persistence / real OMP host / browser / real second device / learning evaluation> |
| Validation target | <ID from the backlog target registry> |
| Behavioral scenarios | <V-IDs actually exercised> |
| Product requirements | <N-IDs supported by this check> |
| Tasks / milestone | <actual task IDs and milestone> |
| Result | <passed / failed / not_run / unavailable / waived> |

`passed` requires observed results meeting the stated criteria. Partial execution is described explicitly and is not a pass for unexecuted criteria. `waived` needs a concrete rationale and authorized scope decision; it cannot rename a failure or silently remove a required product capability. Optional adapter deferral belongs in planning as well as the applicable report.

## Exact candidate and environment

| Field | Observed value |
| --- | --- |
| Source revision | <actual commit, or explicitly no commit> |
| Working-tree changes | <clean, or exact patch/diff identity and affected paths> |
| Artifact identity | <actual filename/version/hash when applicable> |
| Dependency lock / schema version | <actual identifiers> |
| OS / hardware | <observed environment relevant to the claim> |
| Runtime / package manager | <actual versions> |
| OMP / client / browser | <actual versions, or not used> |
| Model / provider / price assumptions | <actual configuration and known/unknown prices, or not used> |
| Fixture / dataset | <identity, scope, size, source families, and consent/synthetic status> |
| Relevant configuration | <sanitized configuration; no tokens or pairing codes> |

A result for an earlier revision does not automatically apply after a relevant source, configuration, or dependency change. Identify the affected checks to rerun rather than repeating every unrelated test.

## Invocation and observed execution

**Working directory:** <actual path>  
**Exact command or procedure:** <what actually ran; leave explicitly unrun if not executed>

```text
<exact command and arguments, or numbered observed procedure>
```

| Execution field | Actual observation |
| --- | --- |
| Started / ended | <timestamps, or not run> |
| Exit code | <actual integer; not applicable for a non-command observation; never invent 0> |
| Termination / timeout | <actual signal/reason, none, or not run> |
| Duration | <measured time or unavailable> |
| Relevant output | <sanitized excerpt or durable log reference> |
| Result artifact | <existing reference, or none> |

## Criteria and outcomes

| Criterion / scenario | Expected observation | Actual observation | Result / evidence |
| --- | --- | --- | --- |
| <criterion or V-ID> | <testable condition> | <what occurred> | <result and reference> |

Report denominators and source-family independence for learning-quality claims. State whether comparisons use development or held-out cases. For budgets, include child calls, retries, embeddings, and tool work; unknown cost is not zero cost.

## Web, LAN, and device detail when applicable

<Record the actual listener, advertised interface/port, decoded text-QR target, pairing/denied-access observations, and stream behavior. Do not store credentials, pairing codes, authenticated URLs, or private memory payloads.>

**Actual second device used:** <device/browser type, or unavailable/not used>  
**Network conditions:** <relevant observed conditions>  
**Boundary of the claim:** <for example, automated interface/QR/pairing tests passed but a physical second-device check was unavailable>

Loopback, mocks, browser emulation, and interface enumeration are not a physical second-device observation. Unavailable hardware creates that precise validation limit; it does not justify a fabricated pass or an unrelated manual QA gate.

## Limitations, defects, and disposition

<State what this evidence cannot establish, concrete failures, unavailable parts, and affected task IDs. Keep a failing supported behavior separate from an explicitly deferred optional adapter. Native archive/integrity/restore remains a required M7 capability.>

**Next action:** <bounded fix, affected rerun, explicit optional deferral, or none>  
**Planning update:** <actual status/evidence references changed, or pending>  
**Reviewer conclusion:** <ready for the named criterion / not ready, with reason>

Stop optional retesting once the check resolves the actual risk and the existing gate is met. Do not generalize a narrow check into a claim that every feature, client, or deployment works.
