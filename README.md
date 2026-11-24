# NOESIS — OMP Bootstrap Package

**Build a universal, inspectable Mind for Oh My Pi.**

Package **1.0.0** is the bootstrap package version. Product candidate **v1.0.0** is implemented for the declared Node 24, npm 11, SQLite, Linux x86_64, and OMP 19.1.1 environment. This repository retains the bootstrap contracts and the reproducible application source.

## Start

Read [START-HERE.md](START-HERE.md). The [package index](PACKAGE-INDEX.md) lists every file, and the [validation report](BOOTSTRAP-VALIDATION.md) states exactly what was checked. For a fresh extracted directory:

```bash
python3 scripts/doctor.py
python3 scripts/validate_bootstrap.py
python3 scripts/init_repo.py --commit --branch feat/m0-foundation
```

The last command creates a new local Git repository and initial commit, then opens the implementation branch. It refuses an existing or enclosing repository and requires a configured Git identity. It does not configure a remote or publish. Existing-repository instructions are in START-HERE.

Open OMP in the project directory and use [the bootstrap prompt](prompts/01-BOOTSTRAP-OMP.md). Runtime/dependency setup is a concrete M0 task grounded in your installed OMP, not a guessed global configuration.

## The product

| Capability | Purpose |
| --- | --- |
| Observatory / Pulse | Modern LAN web dashboard, live activity, budgets and job progress. |
| Atlas | Resources I know about: plugins, tools, skills, pages, websites, repositories, projects, workflows, APIs, documents and datasets. |
| Lineage / Chronicle | Evidence, use traces, history, revisions and applicability. |
| Attunement | Explicit and inferred collaboration preferences. |
| Ebb | Active, quiet and dormant memories; resurfacing; distinct deletion. |
| Reverie / Retrospection | `mind_dream`: Snooze, Nap, Dream, Deep Sleep; experience review and creative exploration. |
| Lore | A sourced, editable, living wiki with protected authored sections. |
| Forge / Blueprints | Select a resource, inspect learning, dream about improvements and export an evidence-based guide. |

The default dashboard listener is proposed as `0.0.0.0:7337`, with paired access and a terminal text QR code containing the actual access URL. The first application alpha includes the native OMP path, a small working web UI and this LAN access flow.

## Read by task

| Need | Document |
| --- | --- |
| Step-by-step operator walkthrough and exact initial prompt | [Operator Playbook](docs/13-OPERATOR-PLAYBOOK.md) |
| Requirement-to-task/test coverage | [Traceability](docs/14-REQUIREMENTS-TRACEABILITY.md) |
| Authoritative scope and requirement IDs | [Product specification](docs/01-PRODUCT-SPEC.md) |
| Components and deployment boundaries | [Architecture](docs/02-ARCHITECTURE.md) |
| Records, revisions and identity | [Data model](docs/03-DATA-MODEL.md) |
| Agent tools, service and errors | [Contracts](docs/04-AGENT-AND-SERVICE-CONTRACTS.md) |
| Preferences, fading and dreaming | [Learning](docs/05-LEARNING-AND-DREAMING.md) |
| Verified OMP integration | [OMP integration](docs/06-OMP-INTEGRATION.md) |
| Dashboard, resource pages and wiki | [Dashboard and Lore](docs/07-DASHBOARD-AND-LORE.md) |
| Branches, worktrees and releases | [Git workflow](docs/08-GIT-WORKFLOW.md) |
| Timeline, milestones and release goals | [Roadmap](docs/09-ROADMAP-AND-RELEASES.md) |
| Quality criteria and evaluations | [Validation](docs/10-VALIDATION-AND-EVALUATION.md) |
| LAN, QR, pairing, storage and budgets | [Operations](docs/11-OPERATIONS-AND-BUDGETS.md) |
| Prior art and adoption decisions | [References](docs/12-REFERENCES-AND-ADOPTION.md) |

Machine-readable planning lives in [milestones.json](planning/milestones.json) and [backlog.json](planning/backlog.json). The current handover is [STATUS.md](planning/STATUS.md). Start with [AGENTS.md](AGENTS.md) for continuation, progress and collaboration rules.

## Delivery contents and truthfulness

- JSON Schemas and examples remain versioned contract fixtures; runtime behavior is validated separately by `npm run release:check`.
- `config/noesis.example.json` is a proposed NOESIS policy file, **not** an OMP global config and not currently consumed by an application.
- `scripts/doctor.py` inventories local prerequisites without installing or changing them.
- `scripts/validate_bootstrap.py` checks package structure, references, planning consistency, configuration and optional full schema validation.
- `scripts/init_repo.py` safely seeds a fresh local repository.
- `scripts/lan_qr.py` renders an operator-supplied access URL as a terminal QR. It does not start a dashboard or discover a running server.
- `scripts/pack_bootstrap.py` produces an allowlisted, reproducible ZIP and checksum manifest.
- Application validation is bound to `npm run release:check`; bootstrap helpers remain separate integrity checks.

## Versioning

The bootstrap package version and product version remain distinct. Product `v1.0.0` is a local stable candidate for the declared supported environment. Remote publication remains separately authorized.

The 12–18 week roadmap is a planning envelope for one experienced primary implementer with bounded parallel assistance, not a forecast of autonomous wall-clock time. Re-estimate from the first real vertical slice.
