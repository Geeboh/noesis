# 06 — Oh My Pi integration

## Purpose and verification boundary

NOESIS is an application to be built from this package. This document defines its OMP adapter; it does not claim that an extension, service, dashboard, or installation already exists.

The preferred integration is a **file-backed native OMP extension**, backed by the host-independent NOESIS core and durable store described in [Architecture](02-ARCHITECTURE.md). The extension handles host discovery, agent tools, event capture, and bounded recall. The same core serves the web dashboard, which is LAN-accessible by default as specified in [Dashboard and Lore](07-DASHBOARD-AND-LORE.md). An MCP transport is optional at M7; it does not replace the native event adapter.

Upstream was retrieved on **2026-11-23 UTC**. `git ls-remote https://github.com/can1357/oh-my-pi.git HEAD` resolved to **`0aefd54236b60109f8423423bebb2995c237cf0a`**. Its coding-agent manifest reports **19.1.1**, the `omp` executable, and Bun **>=1.4.4**. These are facts about that source revision, not a claim about the user's installed version or the latest published package. [Source manifest][manifest]

**M0 must inspect the actual installation.** Record the executable path, version, operating system, runtime, active profile/config roots, relevant exported types, source/package revision when available, and supported adapter capabilities. Use the installed release's interfaces when they differ from this snapshot. Record material differences in a decision record and update this guide. Do not upgrade OMP or replace user configuration merely to match the snapshot.

## 1. Discovery and packaging

The verified extension contract is a TS/JS module with a default factory accepting `ExtensionAPI` from `@oh-my-pi/pi-coding-agent`. Register tools and handlers in the factory; perform session actions after runtime initialization. [Extension guide][extensions]

Current loading supports:

- An explicit `--extension` / `-e` entry path.
- Project-native `<cwd>/.omp/extensions` and the active agent directory's `extensions/`.
- Package manifests using `omp.extensions`; `pi.extensions` remains a legacy alternative, with `omp` taking precedence.
- A configured `extensions` array. Array replacement across settings layers makes blind append-by-overlay unsafe.

Native project extension discovery is cwd-only, unlike some other OMP capability searches. `.pi/extensions` is not a native discovery root in this revision. Profile and directory overrides affect the user root. Prefer an explicit development entry path first, then package installation/discovery after it is verified. [Loading rules][loading]

M0 should create a minimal file-backed entry, resolve compatible SDK/schema imports, and load it in an isolated development session. Do not copy monorepo `catalog:` dependency specifiers into a standalone package. Resolve runtime and package versions, pin direct dependencies, and generate the selected package manager's lockfile. Record host compatibility rather than bundling a second, conflicting OMP runtime.

The following are verified OMP inspection commands, not NOESIS product commands:

```sh
omp --version
omp --help
omp config --help
```

Current launch syntax includes `--extension <path>`, `--config <file>`, `--profile <name>`, and `--no-extensions`. The last disables ambient extension discovery while explicit `-e` entries still load. Generate commands with real paths only after M0 has created the entry and overlay; a named profile may need its own existing authentication. Do not introduce a mandatory trusted-extension ceremony. [CLI reference][cli]

## 2. Advertise real tools

Use `pi.registerTool` for the tools defined in [Agent and service contracts](04-AGENT-AND-SERVICE-CONTRACTS.md). In particular, **`mind_dream` is an agent-callable core tool**, not only a slash command or a dashboard button. Snooze must work in the M1 slice.

At the inspected revision, extension tools default to discoverable loading; `loadMode: "essential"` keeps a tool top-level. Approval tiers are explicit (`read`, `write`, `exec`), with `exec` the default if omitted. The execute signature receives `toolCallId`, validated parameters, cancellation signal, update callback, and context. `getAllTools()` includes schemas and source metadata; `getActiveTools()` identifies enabled names. [Extension types][types]

Design requirements:

1. Keep the essential surface small. Ensure `mind_dream` is discoverable in a fresh ordinary session without relying on the user to remind the agent that it exists. Use the installed version's supported advertisement mechanism.
2. Describe scope, budget, job status, and side effects accurately. A tool that schedules a durable dream is not read-only merely because it immediately returns a job identifier.
3. Advertise only implemented levels and operations. Before M4, unsupported levels return a structured capability limitation; they must not secretly run Snooze while reporting Deep Sleep.
4. Preserve the host's tool restrictions. Do not reactivate NOESIS tools that the user or a restricted child session excluded.
5. Use concise, agent-authored guidance where needed. Do not inject generated instructions as a new human request.
6. Treat the dashboard, OMP tools, and optional MCP tools as clients of the same contracts and authorization rules.

The schema builders and compatible schema types have evolved. The inspected guide exposes omptype-backed helpers, including `pi.arktype`, a Zod-compatible `pi.zod`, and a legacy `pi.typebox`. M0 must compile a minimal registered tool against the actual host; do not blindly transplant a Pi example or assume an older Zod dependency. [Schema/runtime guide][extensions]

## 3. Capture events without changing their meaning

Use passive observers for capture. In particular, returning patched `tool_result` content or replacing assistant messages changes what the agent sees; it is not necessary to observe an outcome. Keep those mechanisms out of the normal capture path.

| Host surface | NOESIS use | Boundary to preserve |
| --- | --- | --- |
| `session_start`, `session_switch` | Bind session identity, reconcile persisted entries, refresh availability | Loading may be deferred; events emitted before binding are not generally replayed. |
| `input` | Optional ingress context and explicit user preference signals | It is not a complete user-message feed across every mode or programmatic delivery. |
| `message_end` | Observe finalized visible messages and enqueue capture | It is notification-only; persistence does not wait for the handler. |
| `tool_execution_start/end` and `tool_result` | Link tool call identity, execution, results, errors, and provenance | Partial progress is not final success; middleware order can affect observed tool results. |
| `agent_end` | Reconcile/flush observed work and schedule bounded processing | Its messages are active context, not a guaranteed fresh delta. |
| `before_agent_start` | Prepare bounded, scoped recall for ordinary user work | It can re-enter; synthetic-only continuations and wakes have different coverage. |
| `session_clear`, branch/tree/switch events | Invalidate context-presence caches and refresh lineage | Context reset and branch changes are not instructions to delete durable memory. |
| `session.compacting`, `session_compact` | Preserve compact references and invalidate stale injection bookkeeping | A summary is derived evidence; do not recount it as another observation. |
| `session_shutdown` | Best-effort flush and cleanup | It has a short handler budget; persistence must already be durable. |

Event names and payloads are verified in the [types][types]; lifecycle qualifications are documented in the [guide][extensions] and implemented in [AgentSession][agent-session]. M0 must record which events the installed host supports instead of silently dropping a required capability.

Normalize observations into the core's versioned event envelope. Capture session/agent identity, source entry or tool-call identity, origin, attribution, scope, timestamps, final/error/aborted state, and redacted evidence references. User-authored text, extension-generated prompts, imported content, and model interpretations must remain distinguishable. Retain concise visible rationale and outcomes; hidden reasoning is not a required input or an inspection product.

**Do not learn success from the absence of a tool error.** An operation can complete technically while failing the user's objective. Store the observable result and later outcome feedback separately.

## 4. Replay, branches, and exactly-once effects

The read-only session manager exposes `getSessionId()`, `getSessionFile()`, `getEntry()`, `getEntries()`, `getBranch()`, and related history accessors. Persisted session entries are the reconciliation source; raw event callbacks need not arrive with a final persisted entry identifier. [Session manager][session-manager]; [session format][session-doc]

Implement these rules:

- Capture the session and agent identity before awaiting work. Do not let a later session switch redirect the write.
- Use durable event keys and database uniqueness to deduplicate capture and job application. A content hash alone must not collapse two real, identical user messages.
- Associate provisional live observations with persisted entries when available. Save capture cursors only after the corresponding durable write commits.
- Reconcile missed persisted entries on start/resume and at safe lifecycle boundaries. A replay must not create new independent evidence, duplicate a preference reinforcement, or reschedule a completed dream.
- Preserve branch/fork ancestry. Copied history is shared evidence, not a second independent experience. Do not erase the original record merely because the current branch no longer displays it.
- Treat compaction and branch summaries as derived records. Do not repeatedly extract the same underlying observations from both raw entries and their summaries.
- If a non-persisted session cannot be replayed, report that capture coverage honestly. Do not force all private/ephemeral sessions onto disk.

The same imported module can be rebound to several sessions. Keep session-local caches scoped by identity; do not put a mutable current-user or current-project singleton at module level. Persist shared state behind the core's transactional boundary. [Extension runtime][extensions]

## 5. Recall and compaction

Use `before_agent_start` as the normal prompt-time recall boundary. Return early for `reason: "revive"` when present: current OMP uses that notification to re-establish registrations, discards its result, and waits for handlers. Its prompt-time chain can re-enter after a source-base change, so retrieval preparation must be repeatable and free of irreversible learning side effects. Wake turns, tool-only iterations, retries, and synthetic-only queues must not be assumed to generate a new recall event. [Prompt preparation][extensions]; [host implementation][agent-session]

Recall must:

1. Resolve the authorized scope from the host/session, then retrieve within it.
2. Apply a hard context budget and record what was retrieved, actually included, excluded, and why.
3. Return a compact context attachment through the verified hook result, preserving the host prompt. Do not replace the full system prompt just to add memory.
4. Mark content as sourced memory with record identifiers, validity, and uncertainty. Recalled documents and tool output remain evidence, not new authority.
5. Track pending versus accepted delivery honestly. A prepared recall trace is not proof that the context reached the model; reconcile it against accepted session state where the host allows that observation.
6. Avoid treating ordinary read/access activity as factual reinforcement.

The optional `context` hook can transform outgoing conversation messages without rewriting persisted history. Use it only for a narrowly defined, tested need. It can run more often than user prompts, so expensive retrieval there can multiply costs. Provider-payload hooks are a poor default memory integration boundary.

During compaction, preserve only bounded references needed to resume work: active goal/commitment IDs, unresolved decisions, applicable memory IDs, and running job IDs. Durable evidence and job state belong in NOESIS storage. OMP's `session.compacting` hook permits additional summary context and preservation data but is skipped if an earlier hook supplies a complete replacement compaction. Build a fallback reconciliation path; do not depend on one hook firing universally. [Compaction hooks][types]; [extension guide][extensions]

## 6. Subagents, loops, and jobs

`ctx.agent` identifies main/subagent activity and parentage in the inspected host. `session_stop` is main-session-only and waits for owned background activity; it is not a universal capture event. NOESIS must not keep an otherwise finished conversation alive merely to complete housekeeping. Use normal durable enqueue-and-return behavior. [Agent identity and stop semantics][extensions]

File-backed extensions are important: worker-hosted subagents re-import prepared files; inline factories do not cross that boundary. Restricted children retain parent-loaded hooks but do not gain additional tool privileges. Verify the installed host's task/eval/worker coverage and record gaps. Do not claim that parent events alone contain every child interaction. [Child loading][loading]; [task runtime][task]

`mind_dream` should durably accept a bounded job and return its ID/status, or complete a genuinely small operation within its advertised limit. The same service supports dashboard initiation, cancellation, progress, and restart recovery. Session hooks should schedule work, not perform long model calls.

OMP managed timers contain callback failures and are cleared on shutdown; they are useful for lightweight session tasks. They are not a durable queue. Keep queued jobs, checkpoints, leases, idempotent apply operations, and budget reservations in the NOESIS service. Never leave an unhandled detached promise in the extension process. [Managed timers][extensions]

M1 also includes the real dashboard listener. The proposed service default is `0.0.0.0:7337`, not loopback-only. After the listener is ready, print its actual usable LAN URLs and a terminal text QR for the selected dashboard or pairing URL. Do not print a successful startup URL before binding, put a long-lived secret in the QR, or expose private memory before the local-console pairing step. Keep OMP provider credentials in the host; they never belong in browser bootstrap data. See [Operations and budgets](11-OPERATIONS-AND-BUDGETS.md) for the service contract. These are NOESIS requirements to implement, not existing OMP CLI flags.

Snooze at M1 can perform deterministic bookkeeping, deduplication checks, source reconciliation, and a recorded no-change result without paid inference. It must still have a real durable job lifecycle and budget/accounting record. Later dream levels add bounded model work without changing the tool's identity.

## 7. Model selection and costs

`ctx.models` exposes `list`, `current`, `resolve`, and `family` in this revision. It can resolve configured roles/model selectors; it is a query facade, not an inference method. The official handoff example obtains credentials through `ctx.modelRegistry.getApiKey` and invokes `complete` from `@oh-my-pi/pi-ai` with cancellation. These are verified examples, not a promise that a direct helper automatically inherits every session cost, concurrency, or provider policy. [Model query types][types]; [handoff example][handoff]; [model configuration][models]

M0 must select and verify a model adapter for the installed version. Keep roles/configuration separate from concrete provider/model IDs. Honor the user's existing authenticated routes and restrictions; do not hardcode a preferred vendor, invent credentials, or alter the main conversation's model to run a dream.

Before each model request, reserve the job's remaining token/cost/time budget, apply supported caps, propagate cancellation, and record actual usage when returned. Report estimated versus measured cost separately. Reject or defer a request when its required bound cannot be enforced; do not silently remove a cap. Missing model access should leave deterministic Snooze and memory browsing usable.

`ctx.runEphemeralTurn` exists in the inspected guide, but it uses a current conversation snapshot and has transport-specific limits. It is not the default detached dream worker and not a substitute for durable scheduling. Any use needs an explicitly scoped use case and local verification. [Side-turn contract][extensions]

## 8. Native memory: coexistence without double learning

Current `MemoryBackendId` supports `off`, `local`, `hindsight`, `mnemopi`, and `sharpshooter`; `ctx.memory` is optional and exposes `status`, `search`, and `save`. The local backend generates project summaries and lessons; its guide does not expose structured recall for that backend. This narrow runtime is not NOESIS's canonical evidence, revision, dream, or deletion ledger. [Backend types][memory-types]; [memory guide][memory]

For the isolated NOESIS development session, an explicit OMP overlay may contain:

```yaml
memory:
  backend: off
autolearn:
  enabled: false
  autoContinue: false
```

These are **OMP settings**, distinct from the proposed NOESIS policy in `config/noesis.example.json`. Create the overlay during implementation and pass it only to the intended development launch. Preserve the user's existing global configuration. Never set `memory.backend: noesis`; no such backend ID is verified.

At the snapshot, native autolearn defaults to disabled; its automatic capture is separately controlled and skips goal/plan cases. Its minimum tool-call setting currently defaults to 5. Do not base NOESIS on that heuristic or rely on autolearn to capture every work mode. [Autolearn settings][autolearn-settings]; [controller][autolearn-controller]

If the user keeps a native backend enabled, choose an explicit ownership policy: NOESIS primary with native extraction disabled, or intentional coexistence with origin-aware deduplication and a documented boundary. Optional import or mirror adapters must preserve provenance, distinguish copies from independent evidence, and avoid feeding NOESIS-generated text back into another learner as new experience. Do not edit private backend tables or delete native memory to make the systems appear synchronized.

## 9. Compatibility and failure behavior

M0/M1 evidence must demonstrate a fresh-session tool advertisement, a real write/recall round trip, a real Snooze job, paired LAN dashboard access with startup text QR, and persistence across restart. Later validation should cover queued/repeated prompt preparation, clear/compaction/resume, duplicate replay, supported subagent paths, scoped concurrent clients, and native-memory coexistence when offered. Use the IDs and expected outcomes in [Validation](10-VALIDATION-AND-EVALUATION.md).

An unavailable NOESIS service should produce a concise degraded status and a recoverable capture backlog where configured; it must not fabricate a successful write or block all ordinary OMP work. A missing host capability should be explicit in the compatibility report. `resources_discover` is documented as typed but lacking AgentSession callsites at this snapshot, so it is not a foundation for tool advertisement or memory injection. [Extension guide][extensions]

M7 requires native archive portability, integrity verification, and faithful restore; it may additionally expose the same core over MCP. MCP alone does not grant transcript capture, session lifecycle hooks, or installed-component inventory. Verify transport and configuration against the installed OMP [MCP configuration guide][mcp] when implementing that optional transport. Its exclusion does not waive the required native portability work.

## Sources

All links below identify the retrieved upstream revision. They are implementation references to check against the installed release, not instructions to modify OMP internals.

[manifest]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/package.json
[extensions]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/extensions.md
[loading]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/extension-loading.md
[cli]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/cli-reference.md
[types]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/src/extensibility/extensions/types.ts
[agent-session]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/src/session/agent-session.ts
[session-manager]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/src/session/session-manager.ts
[session-doc]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/session.md
[task]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/tools/task.md
[handoff]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/examples/hooks/handoff.ts
[models]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/models.md
[memory-types]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/src/memory-backend/types.ts
[memory]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/memory.md
[autolearn-settings]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/src/autolearn/settings.ts
[autolearn-controller]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/src/autolearn/controller.ts
[mcp]: https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/docs/mcp-config.md
