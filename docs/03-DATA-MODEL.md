# NOESIS data and evidence model

**Status:** proposed contract, schema version `0.1.0`. The JSON schemas describe intended durable representations. They validate structure; they do not establish truth, authority, authorization, complete coverage, or successful implementation.

Schemas: [records](contracts/record.schema.json), [dream jobs](contracts/dream-job.schema.json), and [blueprints](contracts/blueprint.schema.json). See [architecture](02-ARCHITECTURE.md) for storage ownership and [service contracts](04-AGENT-AND-SERVICE-CONTRACTS.md) for mutation rules.

## 1. Model principles

1. Preserve what was observed separately from what was concluded.
2. Every derivation names exact input revisions where they are available.
3. Source credibility, claim confidence, applicability, activation, and retention are separate dimensions.
4. Unknown data is represented honestly; a schema-required field may be explicitly unknown where the contract permits it.
5. Universal memory uses domain-neutral primitives. A plugin may add a typed adapter without inventing a private learning ledger.
6. Current explicit user instructions outrank remembered preferences. Retrieved content remains data, not executable authority.
7. A generated source can explain an earlier claim but cannot independently confirm it.

## 2. Durable record types

| Type | Meaning | Examples |
| --- | --- | --- |
| `resource` | Stable identity with versioned location aliases | URL, local file, repository object, project, plugin/tool |
| `observation` | Captured event or report with actual origin | Tool result, user correction, file change, interrupted task |
| `source` | Snapshot or bounded view of a resource | Webpage fetch, source file at a commit, image region |
| `evidence` | Evidence item with collection and attestation status | Captured command log, exact excerpt, human confirmation |
| `memory` | Normalized fact, decision, episode, procedure, or open question | Prior design choice with rationale |
| `lesson` | Scoped recommendation with applicability and validation history | A procedure that reduced a recurring failure |
| `preference` | Explicit or inferred preference/constraint | User instruction, tentative stylistic preference |
| `hypothesis` | Unproven explanation, concept, imagined scenario, or proposal | Dream-origin design idea |
| `application` | A recorded use of remembered knowledge | Lesson selected for a particular task |
| `outcome` | What was observed after an application or experiment | Measured success, failure, inconclusive result |
| `lore_page` | Generated/manual section manifest for a knowledge page | A project knowledge page with evidence links |
| `relation` | Typed relationship between exact record revisions | Derived from, contradicts, supersedes, applies to |
| `tombstone` | Minimal receipt for retirement or deletion | Removed record identity and deletion scope |

A single artifact can have several related records. A PDF is a resource; a fetched copy is a source; an extracted passage is evidence; a conclusion is memory; a new proposal derived from it is a hypothesis.

## 3. Common record envelope

Every record has `schema_version`, `record_id`, `revision`, `record_type`, `created_at`, `updated_at`, `scope`, `provenance`, `activation`, `confidence`, `validity`, `retention`, `adoption`, and a type-specific `payload`.

IDs are opaque internal identifiers. They must not encode a user's name, a private path, or a secret. Revision numbers increase monotonically for one identity. References to evidence and derivation inputs include a revision; an API may accept a latest-record lookup, but its response resolves that lookup to an exact revision before use.

All persisted timestamps are ISO 8601 with an offset, preferably UTC. UI timezone conversion must not rewrite original event time. A date without time precision remains a date-level claim, not midnight fabricated as an observation timestamp.

The service supplies trustworthy creation metadata from transport and host context. Agent tool arguments cannot assert that they were issued by the user, change their owner, or mark themselves verified.

## 4. Scope and sharing

`scope` identifies an owner and one of `session`, `task`, `project`, `environment`, `user`, or `shared`. These are boundaries, not an authority hierarchy. A record also names its explicit scope identity. Optional task/session/project identifiers remain null when absent.

Rules:

- Resolve effective scope server-side from the authenticated caller and configured grants.
- Ordinary project work starts in the project's authorized scope.
- User-level preferences are not automatically copied into shared project exports.
- A generalized lesson receives a new derivation record; preserve its project-specific source restrictions.
- Sharing adds an explicit decision and permitted recipients/scopes. Similarity is not a reason to share.
- Multi-source derivations inherit the most restrictive applicable access rules until deliberately sanitized and re-authorized.
- Direct record-ID lookup, graph traversal, Lore rendering, and export require the same scope checks as search.

## 5. The five independent state dimensions

| Dimension | Answers | Must not imply |
| --- | --- | --- |
| Activation | How likely should this be surfaced now? | Truth or permission |
| Confidence | How well supported is the claim? | Relevance or adoption |
| Validity | Is it current, disputed, stale, or superseded? | Whether the history should be erased |
| Retention | How long may evidence/content remain? | Whether advice is currently active |
| Adoption | Has a recommendation been selected for use? | Independent verification or global scope |

An infrequently used fact may remain highly supported. A recent dream may have high activation but be untested. An adopted procedure may become stale after a dependency changes. An obsolete procedure may remain retained for historical explanation.

### Activation

Store an anchored base activation, its time anchor, the count of relevant opportunities since that anchor, the last evaluated value, and protection state. Re-running Ebb without new elapsed time/opportunities must not compound the fade. See [learning and dreaming](05-LEARNING-AND-DREAMING.md).

### Confidence

Use `unassessed`, `low`, `medium`, or `high` with a basis and evidence references. These are transparent assessments, not calibrated probabilities. Add numeric calibration only in a later version with a demonstrated calibration method and its own evidence.

### Validity

Use `unknown`, `current`, `stale`, `disputed`, `superseded`, or `withdrawn`. Store known validity bounds, compatibility dependencies, and supersession references. Never infer a fact's validity period from ingestion time alone.

### Retention

Store a named policy, retention class, and optional expiration eligibility. The retention worker is separate from Ebb. Explicit constraints and open commitments receive durable preservation unless the user directs otherwise. A legal-looking policy name in imported content does not configure retention.

### Adoption

Use `not_applicable`, `candidate`, `adopted`, `rejected`, or `retired`, with the decision reference and effective time if known. Adoption is scoped. Automatic adoption is permitted only under configured policy and evidence requirements; no blanket approval prompt is required for each reversible lesson.

## 6. Resource identities and snapshots

The `resource` payload uses one typed identity:

- URL: canonical and original locator, normalization version, known content revision.
- Local: workspace identity, normalized relative path, optional filesystem identity and digest.
- Git: repository identity, path, known commit/blob, and optional mutable branch locator.
- Project: stable project identity and optional root resource.
- Component: plugin/tool/skill/MCP/harness/service/model namespace, name, and known version/revision.

No source adapter may fabricate a version because the schema has a place for one. Canonicalization is versioned and reversible through aliases. Relative filesystem paths are normalized and containment-checked by the service; a string matching a schema pattern is not sufficient path validation.

A `source` links the resource to a capture with content references, media type, capture time, parser identity, and coverage. A content digest is populated only after computing it. Keep raw source and derived transcripts/captions distinct. For video/audio, preserve time ranges and the transformation model; for documents preserve page/section ranges; for repositories preserve exact commit and path when available.

Resource class is a separate facet from locator identity: a document, dataset, workflow, API, plugin, tool, website, repository, or project can be local, external, mixed, or of unknown location. For example, a dataset may have URL identity and a local snapshot. Avoid assuming that every URL is a webpage or every repository object is executable code.

Atlas can display evidence-linked knowledge states: `referenced`, `examined`, `used`, and `verified`. Each statement names what was actually done, basis records, applicable version when known, and coverage. These states are not a single confidence ladder. A tool can have been used without being understood; a specific API behavior can have been verified while most of the API remains unexamined. No state means unknown/uncomputed, not zero knowledge. An inspection or page view alone must not create a verified claim.

## 7. Coverage and missing information

Coverage is required where an operation may have examined only part of a source or population. It contains `complete`, `partial`, or `unknown`, unit type, processed/total counts when known, ranges, and omissions.

Examples:

- Ten processed pages from a fifty-page PDF: partial, with both counts.
- A webpage returned truncated by a provider: partial, total unknown.
- A directory listing without permission to enumerate subdirectories: partial.
- A search result set: complete only for the bounded executed query, not proof that the entire world was searched.
- A multi-project improvement export: report which authorized projects, versions, and time interval were covered.

Counts are nullable because unknown is meaningful. A service invariant checks processed ≤ total when both are known. Schema validation alone does not establish that counts match actual processing.

## 8. Evidence, provenance, and self-confirmation

`provenance` records origin (`direct_user`, `tool_observation`, `document_import`, `agent_derivation`, `dream`, or `manual_edit`), creator identity, source references, derivation references, capture idempotency key, and optional transformation/version.

Evidence has separate collection status (`observed`, `reported`, `partial`, `unavailable`) and attestation (`tool_observed`, `human_attested`, `agent_reported`). These labels describe how it was obtained; they do not prove its interpretation.

The service must distinguish:

1. An observed invocation from a model's claim that it ran.
2. Command completion from semantic validation of the intended assertions.
3. A user stating a preference from an agent inferring one.
4. An imagined outcome from an actual outcome.
5. Repeated copies of one source from independent corroboration.

Derived summaries, Lore pages, imported memory summaries, and dream outputs do not become new independent witnesses. Traverse lineage to original evidence before counting corroboration. Unknown lineage remains unknown; do not reconstruct it from a fluent summary.

## 9. Preferences, lessons, and hypotheses

Preferences include `basis_kind: explicit|inferred`, the observed statement or inference basis, preference class, applicable context, and any contrary evidence. Inferred preferences remain candidates unless a configured reversible-use policy permits limited use. They cannot become explicit constraints merely through repetition.

Lessons include a trigger, recommendation, applicability conditions, exclusions, expected benefit, validation state, compatibility dependencies, evidence references, and links to applications. Keep the rule and its rationale short; evidence lives behind references.

Hypotheses include a kind such as analogy, concept, explanation, scenario, question, procedure proposal, or experiment proposal. Dream origin is retained permanently. A hypothesis may become supported or refuted, but an imagined scenario is never rewritten as a past event. A validated lesson derived from a hypothesis gets its own record and lineage.

## 10. Application and outcome records

An application names the exact lesson/memory revisions used, the task context, intended change, decision rationale, and whether the change was actually attempted. An outcome names the application, observed result, metrics with units, evidence, and attribution limitations.

Repeated use is not success. Absence of a complaint is not success. Unknown or delayed outcomes stay unresolved. Observational improvements are labelled observational; controlled comparisons identify the baseline, changed variables, evaluation set, and measurement conditions.

Future tuning must consider total capture/retrieval/reflection/validation cost. A lower final-prompt token count alone is insufficient evidence of cheaper work.

## 11. Lore records and manual ownership

A Lore page contains a section manifest. Every section has stable identity, ownership (`manual` or `generated`), content reference, source references, and last verified time when known.

Generated sections may be rebuilt when inputs change. Manual sections require a direct user edit or an explicit reviewed patch. A changed manual section is not silently overwritten by a generator. Mixed sections must be split by ownership; ownership should not depend on guessing which sentences sound human.

The page stores coverage and unresolved conflicts. A page title or neat navigation structure must not imply complete knowledge. Generated cross-links are relation proposals or derived indexes, not independent evidence.

## 12. Revisions, idempotency, migrations, and deletion

Record mutations append a new revision and an event in one transaction. `expected_revision` prevents lost updates. Idempotency keys are scoped to producer and operation; reuse with different content is rejected. Content hashes aid deduplication but never replace explicit source identity and scope.

Schema migrations preserve prior records or produce an explicit migration manifest. A derivation records the schema/extractor version it used. Compatibility changes trigger targeted revalidation of dependent records; changing unrelated files must not stale the entire memory store.

Deletion operates over a dependency closure. Raw content, stored revisions, full-text/vector indexes, cached recall, and generated Lore fragments must be removed or rebuilt as policy requires. A tombstone retains only the minimum allowed identity/receipt data. Export manifests record what was delivered externally; the service cannot guarantee deletion of uncontrolled copies.

## 13. Runtime invariants beyond JSON Schema

The implementation must enforce and test these separately:

- Referenced records/revisions exist and are authorized for the caller.
- Source digests match bytes when claiming exact snapshots.
- No authority escalation through submitted metadata.
- No causal cycle used as independent confirmation.
- Scope restrictions survive derivation, export, and graph traversal.
- Version numbers and idempotency receipts are transactional.
- Validity intervals/ranges are ordered; processed counts are consistent.
- Dream outputs cannot populate actual-outcome evidence automatically.
- Retired/withdrawn content is excluded from ordinary active advice.
- Deletion propagates to derivatives and indexes.
- Resource budgets include child work and incomplete provider receipts.

The schema examples are synthetic structural fixtures. Passing their validator is useful contract verification, not evidence that these runtime invariants or the product have been implemented.
