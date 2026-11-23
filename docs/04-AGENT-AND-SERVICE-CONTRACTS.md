# Agent and service contracts

**Status:** proposed API contract, version `0.1.0`. Tool and operation names below describe the NOESIS interface to implement. They are not claims that an installed OMP build exposes these tools or that this package implements them. M0 pins actual OMP integration APIs; the [integration plan](06-OMP-INTEGRATION.md) owns that work.

## 1. One service, several clients

The OMP extension, dashboard, CLI, and optional MCP adapter call one service boundary. Authorization, record validation, budgets, lifecycle transitions, and job execution live behind that boundary. A client cannot obtain broader access by switching transport or supplying a different `owner_id`.

The transport may initially be authenticated same-origin HTTP plus an internal TypeScript interface. The default dashboard/API listener is `0.0.0.0:7337`, with paired access and a terminal QR containing its selected LAN URL. The local OMP adapter can use a local credential or supported local IPC. Transport framing is pinned in M0; the envelopes and semantics below must remain equivalent across transports.

Use snake_case for serialized fields. Use opaque IDs for resources, records, scopes, operations, jobs, and actors. Clients may display human-readable names, but a rename must not change identity.

## 2. Compact agent surface

The following eleven tools are the complete planned top-level agent surface. Their short descriptions are enough for discovery; detailed schemas and record bodies are fetched when needed. A release may advertise a subset. It must not advertise an unavailable mode as implemented.

| Tool | Main input | Main result | Effect |
| --- | --- | --- | --- |
| `mind_recall` | Query, authorized scopes, context/version filters, result budget | Short relevant records, applicability, provenance pointers, coverage | Read |
| `mind_note` | Observation or statement, source references, scope, intended record kind | Durable receipt, accepted record references, pending extraction job if any | Capture/write |
| `mind_assess` | Proposed choice or action, context, relevant records, assessment budget | Applicable experience, uncertainty, contradictions, suggested validation | Read or bounded analysis |
| `mind_feedback` | Target revision/application, correction or outcome, supporting evidence | New correction/outcome revision and resulting lifecycle decision | Write |
| `mind_dream` | Level, modes, focus, scopes, finite budget | Durable job receipt and eventually typed dream outputs | Bounded job |
| `mind_explore` | Query or root, projection, filters, depth/node budget | Bounded map, clusters, timelines, open questions, continuation cursor | Read |
| `mind_inspect` | Exact record/job/blueprint reference, selected fields | Detailed object and current lifecycle/coverage | Read |
| `mind_trace` | Record or decision, direction, depth/evidence budget | Source-to-derivative lineage and explanation of transformations | Read |
| `mind_wiki` | Page query or explicit action: read, build, edit manual section | Lore page, section edit receipt, or generation job | Read/write |
| `mind_export` | Scope/component target, format, versions/time range, privacy policy | Export job, manifest, artifact reference, coverage and redactions | Bounded job |
| `mind_manage` | Named management operation and typed arguments | Capability/status, configuration, lifecycle, or job receipt | Depends on operation |

Every tool accepts an operation-specific typed object. Do not make one parameter a free-form shell command, SQL string, arbitrary handler name, or unrestricted provider request. Memory content is data, including text that resembles instructions.

### Example compact discovery

The following is an illustrative service response, not a runtime report:

```json
{
  "contract_version": "0.1.0",
  "capability_revision": 3,
  "available_tools": ["mind_recall", "mind_note", "mind_dream", "mind_manage"],
  "dream": {
    "levels": ["snooze"],
    "modes": ["consolidate"],
    "execution_kinds": ["deterministic"]
  },
  "retrieval": {"full_text": true, "vectors": false},
  "limits": {"max_inline_records": 8, "max_inline_chars": 12000},
  "details_ref": "capability:noesis:3"
}
```

Capability revision changes when available operations, limits, or integration coverage change. Cache the summary for the session and refresh on mismatch. Include a short memory-use policy once; avoid appending all schemas, all lessons, or all source documents to every prompt. The implementation must measure actual tool-description and recall tokens against [operations budgets](11-OPERATIONS-AND-BUDGETS.md).

## 3. Common request and response envelopes

These TypeScript-shaped definitions are a design notation. They do not pin a runtime library or generate a client by themselves.

```ts
type Request<T> = {
  contract_version: "0.1.0";
  request_id: string;
  operation: string;              // closed operation registry
  scope_ids: string[];
  args: T;
  idempotency_key?: string;       // required for mutation and job creation
  expected_revision?: number;    // required when replacing an existing object
  result_budget?: {
    max_items: number;
    max_chars: number;
  };
};

type Response<T> = {
  contract_version: "0.1.0";
  request_id: string;
  status: "ok" | "accepted" | "partial" | "error";
  data: T | null;
  error: ServiceError | null;
  coverage: Coverage;
  usage: UsageReceipt;
  warnings: Warning[];
  continuation: string | null;
};
```

The authenticated connection supplies the acting principal, authorization, and effective policy. A model-provided actor or scope is an assertion to validate, not a credential. `scope_ids` request a subset of that principal's access. An operation cannot widen its access through a record link, export source, parent job, or graph traversal.

`ok` means the requested bounded operation finished. `accepted` means durable work was queued; include `job_id` and current status. `partial` means useful results exist but a requested part was not completed; state why. `error` carries a typed error and no claim of success. A job can succeed while its underlying source coverage remains partial; the response must distinguish job execution from knowledge completeness.

Coverage includes the considered scopes, filters, time/version bounds, processed counts when known, omissions, and index freshness. Use `null` for unknown totals. A count of returned search results is not a count of all relevant facts.

Usage includes known model calls, input/output tokens, duration, reservation/actual cost, currency, provider receipt references, and measurement completeness. Unknown values remain unknown; do not silently report zero. Deterministic work has measured local duration and zero model calls.

### Error vocabulary

| Code | Meaning and retry behavior |
| --- | --- |
| `INVALID_ARGUMENT` | Failed structural or semantic validation; fix the request |
| `CONTRACT_MISMATCH` | Unsupported contract version; refresh discovery or upgrade deliberately |
| `NOT_SUPPORTED` | Operation/mode unavailable in this build; use advertised capabilities |
| `NOT_FOUND_OR_FORBIDDEN` | Target unavailable to the principal; do not reveal its existence |
| `REVISION_CONFLICT` | Expected revision is stale; inspect and deliberately reconcile |
| `IDEMPOTENCY_CONFLICT` | Same key was reused with different normalized input |
| `BUDGET_EXHAUSTED` | Cannot reserve the next bounded step within the existing budget |
| `RATE_LIMITED` | Retry only after a supplied interval, within remaining budget |
| `PROVIDER_UNAVAILABLE` | Source/model unavailable; preserve captures and checkpoints |
| `INDEX_PARTIAL` | Requested index incomplete; bounded fallback may return `partial` |
| `LEASE_LOST` | Worker no longer owns a step and cannot commit its result |
| `CANCELLED` | Work stopped; distinguish retained completed outputs from unfinished steps |
| `DEPENDENCY_DELETED` | A required source was removed or access was revoked |
| `MIGRATION_REQUIRED` | Store needs a supported migration before requested writes |
| `INTERNAL_ERROR` | Opaque incident reference; no secret-bearing stack traces in agent output |

Errors include `code`, concise `message`, `retryable`, optional `retry_after_ms`, and safe structured details. A retriable error does not imply permission to retry indefinitely or reserve a new budget.

## 4. Read contracts

### `mind_recall`

Required inputs are query/context and allowed scopes. Optional filters include record types, resource/component references, version constraints, effective date, adoption state, and a historical flag. Ordinary recall excludes rejected/retired advice and known-inapplicable procedures. Historical recall can return them with their lifecycle labels.

Each hit contains an exact record revision, concise statement, relevance explanation, applicability, confidence assessment, validity, source references, and estimated inline size. A ranked hit must not erase a contradiction or hide that its source is stale. Contradictory applicable records appear together or as a linked conflict summary. Supply a cursor for additional authorized results.

Use exact identifiers and full-text retrieval as the baseline. Optional semantic search, graph expansion, or planning consumes the caller's budget and is disclosed. If vector search fails, preserve lexical/metadata retrieval and report reduced coverage. Automatic context injection is a separate caller policy, with a smaller budget than interactive exploration.

### `mind_assess`

Assess an intended choice against retrieved experience: relevant constraints, expected benefit, applicability, counterevidence, uncertainty, and a reasonable next check. Return an `assessment_id` or traceable record only when persistence is requested or required for an application decision. An assessment is analysis; it does not execute the proposed action or make a hypothesis empirically verified.

The service may propose an experiment, but executing it requires a separate application under existing task authority and an explicit execution budget. A larger assessment budget never grants new access.

### `mind_explore`, `mind_inspect`, and `mind_trace`

Explore returns bounded projections: resource neighborhoods, timelines, topic clusters, conflicts, outcomes, or unanswered questions. Declare node/edge/depth limits and truncated paths. Graph connections distinguish explicit recorded relations from inferred candidate relations.

Inspect returns selected fields from an exact revision or the latest authorized revision. Large content and media use artifact references/ranges rather than unconditional inline bodies. Trace explains derivation, source versions, transformations, decisions, applications, and observed outcomes. Mark missing/deleted/restricted ancestors without exposing their content.

Neither a display graph nor repeated derivation creates independent corroboration. Trace should make circular evidence or multiple summaries of one event visible.

## 5. Capture, correction, and learning contracts

### `mind_note`

Capture the supplied statement or event durably before optional extraction. Minimum inputs: scope, content or artifact reference, statement kind, source references when available, and idempotency key. The host adapter attaches event/session/task identity it actually observes. Unknown tool versions and timestamps stay unknown.

Distinguish `direct_user`, `tool_observation`, imported source content, and `agent_derivation`. A model cannot label its own inferred preference as an explicit user statement. Requested record kinds are suggestions subject to validation; a speculative idea becomes a hypothesis/candidate, not an observed outcome.

The receipt identifies the immutable capture and any normalized record revisions. If extraction is queued or fails, the original capture remains retrievable with its processing status and coverage. Duplicate event delivery produces the same receipt, not another supporting event.

### `mind_feedback`

Feedback types include correction, counterexample, preference clarification, application result, and usefulness feedback. Require the exact target/application revision, explanation, and evidence references when claiming an observed result. A click or positive rating may show usefulness; it does not independently establish factual accuracy or causal benefit.

Corrections preserve history and generate a new revision or linked contradictory record. Materially different scope or version creates a separate scoped claim. Current explicit user corrections may update their own preferences immediately, within existing authorization. Inferred changes remain labelled inferred. Retirement prevents ordinary reuse while keeping the audit history until retention/deletion policy removes it.

Applications and outcomes have separate IDs. Applying a recommendation is not evidence that it worked. Record actual results, unresolved attribution, adverse effects, and cost. A tool's own success message is reported evidence unless a stronger observation exists.

## 6. Dreaming and durable work

`mind_dream` creates a job with independent `level`, `modes`, `focus`, `scope_ids`, `execution_kind`, and finite `budget`. See [learning and dreaming](05-LEARNING-AND-DREAMING.md) and [dream job schema](contracts/dream-job.schema.json). Defaults resolve to an explicit profile in the accepted job receipt; a client can inspect the exact limits before execution.

The UI/tool shorthand `mixed` expands to selected concrete modes before job acceptance. The durable `modes` array contains only `consolidate`, `associate`, `imagine`, `rehearse`, and/or `reframe`, so the job remains inspectable and bounded.

Start is idempotent. Status/cancel/pause/resume are management operations on the original job; resuming never resets expenditure or counts. Parent budgets include all children. A job must reserve its next call before dispatch, checkpoint completed outputs, and honor cancellation between bounded steps. Cooperative provider cancellation may leave an in-flight call billable; reconcile it rather than pretending it did not occur.

The first useful release advertises deterministic Snooze and `consolidate` only. Requests for unavailable creative modes return `NOT_SUPPORTED`, with supported alternatives. M4 adds model-assisted modes after budgeting, provenance, and cancellation are verified. A dream output is an insight candidate, hypothesis, question, relation proposal, rehearsal, or Blueprint. It is not empirical evidence by virtue of appearing in a completed job.

## 7. Lore, export, and management

### `mind_wiki`

Actions: `read`, `build`, and `edit_manual_section`. A generated page names exact source revisions, generation configuration, coverage, unresolved conflicts, and verification time. Manual edits target stable section IDs and expected page revision. Generated rebuilds preserve manual sections; merge conflicts become explicit conflicts rather than silent replacement.

Building Lore is a bounded job when it exceeds foreground limits. Reading Lore must retain its derived status. Manual additions may supply a new assertion or point to a new source, but do not become verified evidence without their own provenance. No generated page may re-enter learning as an independent witness for its own sources.

### `mind_export`

Supported planned targets are a scope, resource set, component/tool/plugin, or selected Blueprint. Formats can include portable JSON plus a Markdown improvement guide. Exports include a manifest, schema/contract versions, exact source revisions, time/version scope, coverage limits, redactions, and artifact checksums when computed.

A component improvement guide separates observed findings from inferred explanations and dreamed ideas. Attribute each finding to the component, usage, configuration, host, dependency, or unknown cause, with confidence and evidence. Include actionable proposed changes, regression cases, expected benefit, validation criteria, rollback, and a post-upgrade verification plan. Do not call a problem a plugin defect merely because it occurred while that plugin was present.

The export builder applies the selected privacy policy to quotes, credentials, paths, personal data, media, and cross-project references. Redact first, then compute export checksums and validate remaining links. Mark references withheld or unavailable. Redacted or incomplete evidence can support a hypothesis but may not support a reproducible defect claim. The user can export useful imperfect evidence if limitations are explicit.

An export is not a publication or message. Sending, posting, opening an external issue, or modifying the component requires separately authorized action. Export copies under service control participate in deletion; downloaded copies outside service control are listed as a residual limit.

### `mind_manage`

Use a closed operation registry, grouped for discovery:

- `capabilities`, `health`, `usage`, `coverage`, and `config_read`.
- `job_status`, `job_pause`, `job_resume`, and `job_cancel`.
- `record_pin`, `record_unpin`, `record_adopt`, `record_retire`, and `record_revalidate`.
- `scope_create`, `scope_update`, and `scope_share` under existing authority.
- `retention_preview`, `delete_preview`, `delete_execute`, and `deletion_status`.
- `config_update`, `provider_status`, `index_rebuild`, and controlled import/backup/restore operations as capabilities become available.

Each operation has its own argument schema and authorization class. A broad management tool is not a generic administrator bypass. Reversible authorized pinning, correction, and budget changes do not acquire extra approval prompts. Actual destructive or external effects retain the user's existing authority and applicable host controls. A deletion preview makes the intended scope reviewable; do not silently widen it when executing.

## 8. Identity, retries, and optimistic concurrency

An idempotency key is scoped to authenticated producer and operation. Store the normalized request digest and original receipt atomically with the accepted mutation/job. Same key plus same body returns that receipt. Same key plus a different body returns `IDEMPOTENCY_CONFLICT`. Content similarity alone cannot deduplicate independent sources or collapse distinct contexts.

Updates require `expected_revision`; on conflict return current authorized revision metadata and require a deliberate merge. Append-only captures can omit an expected revision. Every derived record names exact input revisions so a later source correction can invalidate or rebuild the affected derivatives.

Server-generated events carry event ID, event type, correlation/causation IDs, actor, observed time, object revision, scope, and schema version. Delivery is at least once unless an implementation proves a stronger guarantee. Consumers deduplicate by event ID; no design relies on exactly-once network delivery.

## 9. Required contract checks before release

Validate structure with the candidate schemas and validate semantic invariants in the service: authorization through every relation, exact input revisions, idempotent retries, conflict rejection, incomplete source reporting, preserved capture on provider failure, budget aggregation, fencing, deletion closure, and no empirical promotion of imagined outcomes.

Keep the machine contract small and versioned. A breaking field/meaning change requires a new contract version, migration or adapter, and compatibility tests. Treat the JSON examples as synthetic fixtures, never evidence that the service has run successfully.
