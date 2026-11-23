# 12 — References and adoption decisions

## How to use this review

These references informed the design; they are not mandatory dependencies or evidence that NOESIS already works. The bootstrap uses a local SQLite-based baseline and an OMP-native adapter. It does not require another Python runtime, a graph server, a hosted memory account, or an MCP transport to deliver its first useful slice. See [Architecture](02-ARCHITECTURE.md) and [OMP integration](06-OMP-INTEGRATION.md).

Review date: **2026-11-23 UTC**. OMP is pinned below to the retrieved source revision. Other links identify the design references reviewed in this conversation; mutable branch/docs pages must be rechecked if a component is selected for implementation. Distinguish a repository's claims, a documented interface, code inspected during the review, and behavior actually measured in the NOESIS environment. No third-party benchmark establishes the quality of NOESIS.

## Adoption matrix

| Reference | What it contributes | Borrow or adapt | Do not assume or copy |
| --- | --- | --- | --- |
| [Oh My Pi](https://github.com/can1357/oh-my-pi) | Native extension/tool/session integration and existing memory behavior | Thin file-backed adapter; lifecycle-aware capture; model selection through the user's host; explicit coexistence policy | Universal coverage from one event; a generic memory backend as a rich evidence ledger; compatibility with every Pi example |
| [Pi Continuous Learning](https://github.com/MattDevy/pi-extensions/tree/main/packages/pi-continuous-learning) | Persistent lessons, reflection/dream interaction, and procedural reuse | Visible consolidation, lightweight capture, recurring-pattern review, reviewable improvement artifacts | Heuristic confidence as measured correctness; slash-command dreaming as a complete agent tool; decay as truth loss; direct installation into OMP without a compatibility check |
| [Mem0](https://github.com/mem0ai/mem0) | Memory management and retrieval as a reusable service/library layer | A small store/search/update interface and configurable storage/provider boundaries | That CRUD or relevance retrieval supplies NOESIS provenance, job durability, permissions, temporal validity, or creative dreaming automatically |
| [Zep](https://github.com/getzep/zep) and [Graphiti](https://github.com/getzep/graphiti) | Temporal and relational context, entity/relationship organization | Time-aware claims, relationships with source evidence, explicit scope, and selective context assembly | That a graph score establishes truth; that the Zep product and Graphiti OSS have identical features, deployment, or licensing |
| [LangChain memory concepts](https://docs.langchain.com/oss/python/concepts/memory), [LangGraph](https://docs.langchain.com/oss/python/langgraph/stores), and [LangMem](https://github.com/langchain-ai/langmem) | Memory taxonomy, namespace/store contracts, active/background processing, and procedural proposals | Separate memory type, scope, timing, and effort; typed episodes; deferred processing; versioned improvement proposals | Namespaces alone enforce access; asynchronous execution is durable; example code proves validated learning; a Python framework is required for OMP |
| [Cognee](https://github.com/topoteretes/cognee) | Connected knowledge, memory improvement workflows, and portable knowledge artifacts | Staged changes, explicit provenance, source-linked relationships, and inspectable portable packages | Automatic confirmation equals verification; checksums are necessarily verified on import; imported metadata and full source text are always preserved |
| [SimpleMem](https://github.com/aiming-lab/SimpleMem) | Multiple memory-processing layers, compression, cross-session handling, and evolution ideas | Budget-aware extraction/compression, separate processing layers, targeted retrieval, and evaluation-driven improvement | Compressed text is independent evidence; similarity proves supersession; per-run fading measures elapsed time; the MCP interface exposes every library capability |

The decisions in the last two columns are NOESIS engineering judgments. They do not assert that each reference implements every desired safeguard or that it must be rejected wholesale.

## 1. OMP is the host, not a framework to replace

The retrieved OMP HEAD was `0aefd54236b60109f8423423bebb2995c237cf0a`. Its [coding-agent manifest](https://github.com/can1357/oh-my-pi/blob/0aefd54236b60109f8423423bebb2995c237cf0a/packages/coding-agent/package.json) reports version 19.1.1 and Bun >=1.4.4. This is a source snapshot, not an installation claim.

Use the exact sources in [OMP integration](06-OMP-INTEGRATION.md): extension loading, exported types, session history, model APIs, memory runtime, and autolearn. M0 must verify the user's actual version and produce compatibility evidence before committing to APIs or dependency versions. The native `memory.backend: off` mode is supported; NOESIS does not need to impersonate a built-in backend.

Adoption decision: keep domain logic, records, jobs, and web/API behavior outside host-specific hooks. Use native events for coverage and agent tools for deliberate operations. Add MCP later only when it provides a useful additional client.

## 2. Lessons from Pi Continuous Learning

The [package](https://github.com/MattDevy/pi-extensions/tree/main/packages/pi-continuous-learning) is a useful design precedent for recurring lessons and an explicit dreaming interaction. The earlier source review examined revision `86cbbbb1d65eeca88ce2f820dd958301625e394c`; recheck that package before borrowing implementation details.

NOESIS carries forward an explicit reflection workflow, but expands `mind_dream` into an actual agent-callable, durable, budgeted operation. Its effort levels remain Snooze, Nap, Dream, and Deep Sleep, while modes and authorized scopes stay separate. This is a NOESIS design choice, not a claim that the reference already implements it.

The review found reasons to avoid directly inheriting confidence and promotion heuristics: observed alignment, absent errors, repeated exposure, and age are not interchangeable with independent outcome evidence. Preserve failures, contrary evidence, and applicability conditions. Keep instruction/tool changes reviewable and evaluated. Do not silently transplant a Pi extension's package assumptions, storage paths, hooks, or promotion destinations into OMP.

## 3. Mem0 and Zep/Graphiti are optional backend ideas

The [Mem0 repository](https://github.com/mem0ai/mem0) and its [official documentation](https://docs.mem0.ai/) are relevant to replaceable memory APIs and retrieval infrastructure. The [Zep repository](https://github.com/getzep/zep), [official Zep documentation](https://help.getzep.com/), and [Graphiti repository](https://github.com/getzep/graphiti) are relevant to connected and temporal knowledge.

For NOESIS, storage/retrieval integration is subordinate to the canonical record contract. Every supported adapter must preserve stable identity, source lineage, scope, validity, deletion semantics, and versioned updates, or explicitly declare its limitations. Maintain the local baseline until an optional backend demonstrates a concrete benefit on representative workloads.

Do not infer capabilities or deployment rights from a familiar brand name. Before adoption, check the exact package version/license, OSS versus hosted boundaries, supported metadata/filter operations, failure behavior, data export, and cost. These are selection criteria, not extra user approval ceremonies.

## 4. LangChain/LangGraph/LangMem: borrow the decomposition

The [memory concepts guide](https://docs.langchain.com/oss/python/concepts/memory) separates semantic, episodic, and procedural memory; thread state and cross-thread information; and hot-path versus background processing. It distinguishes semantic memory from semantic search. This supports NOESIS's independent dimensions rather than a single memory-strength score.

The concrete [store API](https://docs.langchain.com/oss/python/langgraph/stores) uses JSON records, namespace prefixes, and bounded searches. A recall result is not an exhaustive dream corpus. NOESIS must record coverage, use pagination where required, and resolve access before retrieval. The [Agent Server isolation guide](https://docs.langchain.com/langsmith/store-auth) makes authorization a separate configured concern.

[LangMem's tools](https://langchain-ai.github.io/langmem/guides/memory_tools/) provide useful small management/search operations. The [custom-agent guide](https://langchain-ai.github.io/langmem/guides/use_tools_in_custom_agent/) shows that they need not replace the agent loop. NOESIS may borrow the contract shape without introducing the Python stack.

The [delayed-processing guide](https://langchain-ai.github.io/langmem/guides/delayed_processing/) demonstrates debouncing. The inspected [reflection implementation](https://github.com/langchain-ai/langmem/blob/main/src/langmem/reflection.py) uses a process-local queue/thread for local execution; replacing a pending task does not merge its omitted input into the new payload. The [basic background example](https://langchain-ai.github.io/langmem/background_quickstart/) awaits the manager in its displayed code. Therefore, NOESIS must supply durable jobs, source watermarks, idempotent application, and honest response-latency behavior rather than assuming that an async helper supplies them.

The [episodic example](https://langchain-ai.github.io/langmem/guides/extract_episodic_memories/) offers structure, but its displayed learning path does not establish a measured success gate. Capture observable actions/results and concise rationale instead of manufacturing internal reasoning. [Prompt optimization](https://langchain-ai.github.io/langmem/guides/optimize_memory_prompt/) produces changed instructions from trajectories/feedback; evaluate the resulting proposal before treating it as improved behavior.

## 5. Cognee: staged improvement and portable evidence

The [Cognee source](https://github.com/topoteretes/cognee) is a candidate for connected knowledge and improvement processing. The design review particularly valued staged revisions and portable artifacts, while identifying implementation details that need scrutiny before reuse: automatic current-to-confirmed transitions, whether integrity checks run at import, metadata preservation, and text truncation in personalization paths.

NOESIS adopts the principle of proposed changes with evidence and revisions. It does not equate an internal status transition with external verification. An import must validate its declared format/version, verify integrity when promised, preserve provenance and scope, and report loss or unsupported fields. Derived summaries cannot strengthen confidence in their own source claims. These requirements belong to NOESIS regardless of the backend chosen.

The baseline does not require Cognee. Re-evaluate an optional adapter only against a pinned source revision and a round-trip fixture that exercises the metadata actually used by NOESIS.

## 6. SimpleMem: compress for access, retain evidence identity

The [SimpleMem repository](https://github.com/aiming-lab/SimpleMem) presents multiple related memory approaches, including compression and cross-session/evolution work. Treat their interfaces and resource needs separately. Do not assume that a transport example supports the full library's capabilities.

NOESIS adopts bounded processing stages and concise retrieval views. Compression output remains a derivative linked to source records; loss of detail must be visible where it affects a decision. Similarity can suggest a relationship or replacement candidate but does not prove that one claim supersedes another. Activation fading is distinct from truth and can use explicit time/use/context signals rather than an undocumented processing-run count.

Any evolution loop needs held-out or otherwise independent evaluation relevant to the proposed change. Repeatedly optimizing against the same examples is not sufficient evidence of general improvement. The local SQLite baseline should remain usable without adopting SimpleMem's additional runtime/dependencies.

## 7. Common adoption rules

Apply these rules to every optional component:

1. **Define the job it earns.** State the measurable benefit over the baseline: retrieval quality, latency, cost, temporal handling, interoperability, or operational simplicity.
2. **Pin what was inspected.** Record source/package revision, runtime, license, relevant docs, and tested capabilities. A mutable README is insufficient as a compatibility contract.
3. **Preserve meaning.** Round-trip identity, scope, evidence, revision, validity, manual edits, and deletion. Report any lossy mapping explicitly.
4. **Separate generation and validation.** Model-generated confidence, summaries, and status transitions are not independent evidence.
5. **Retain truthful accounting.** Distinguish retrieved versus included context, scheduled versus completed work, measured versus estimated costs, and tested versus assumed behavior.
6. **Keep exit paths practical.** Provide usable exports and restoration before a backend becomes the only copy of valuable state.
7. **Evaluate the integration.** Use NOESIS acceptance criteria and representative fixtures, not vendor performance claims. Stop when the selection question is resolved; do not build adapters for every reference by default.

These choices preserve the user's intended product: a universal mind with preferences, reversible fading, exploration, a LAN-accessible dashboard, a living wiki, budgeted dreaming, and evidence-based improvement exports. The references supply ideas and optional components; the NOESIS contracts and measured behavior determine the implementation.
