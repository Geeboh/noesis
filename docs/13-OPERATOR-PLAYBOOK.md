# Operator playbook — from ZIP to a developed product

This is the practical guide for you. OMP performs the implementation; you supply the repository location, access to your existing OMP/model environment, and any decisions it cannot obtain from evidence. The build is designed to continue without asking permission at every milestone.

## Phase A — Put the package in place

### Fresh Linux / WSL / development container

Download `NOESIS-OMP-Bootstrap-v1.0.0.zip` to your development machine. Extract it into a fresh location. For example, with the ZIP in your current directory:

```bash
mkdir -p "$HOME/projects"
unzip NOESIS-OMP-Bootstrap-v1.0.0.zip -d "$HOME/projects"
cd "$HOME/projects/noesis-bootstrap-v1.0.0"
```

The ZIP has one top-level `noesis-bootstrap-v1.0.0` directory. If that directory already exists, compare first or extract elsewhere; do not accept overwrite prompts blindly. You may give the directory a shorter name before initialization if desired.

If OMP runs in a container, extract into the path it can actually access. Runtime data should eventually live outside the Git checkout; M0 records the intended paths. For LAN testing from the host's network, container/VM networking must expose the actual service port. Binding inside a container does not itself publish its port on the host.

### Windows

Use Explorer's Extract All, or PowerShell:

```powershell
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\NOESIS-OMP-Bootstrap-v1.0.0.zip" -DestinationPath "C:\code"
Set-Location "C:\code\noesis-bootstrap-v1.0.0"
```

Use `python` where your installation does not expose `python3`. If your normal OMP environment is Linux/WSL, perform the build there instead of assuming native Windows runtime support. M0 declares the supported initial host; handheld Windows/mobile browsers are separate dashboard clients.

### Existing repository

Do not run the fresh initializer. Inspect the existing branch and uncommitted work, then create a dedicated branch or worktree. Review differences before merging the package's instructions, docs and helper files. Keep the existing license, remote, history, project identity and user changes. A root `AGENTS.md` or CI file may already be meaningful; merge deliberately instead of overwriting.

## Phase B — Verify the package and initialize Git

From the extracted root:

```bash
python3 scripts/doctor.py
python3 scripts/validate_bootstrap.py
python3 -m unittest discover -s tests/bootstrap -v
```

Expected: integrity checks pass; the doctor identifies Python, Git, OMP and available candidate runtimes, with missing optional capabilities called out. The doctor does not install dependencies or change configuration. A basic schema check may report that optional full validation is unavailable.

For the complete schema checks and text QR helper:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-validation.txt
.venv/bin/python scripts/validate_bootstrap.py --strict-schemas
```

Windows equivalents use `.venv\Scripts\python.exe`. These are bootstrap dependencies only. OMP will resolve and pin application dependencies after checking its installed interfaces.

For a fresh repository:

```bash
python3 scripts/init_repo.py --commit --branch feat/m0-foundation
git status --short --branch
git log -1 --oneline
```

Expected: a local initial package commit on `main`, a clean implementation branch `feat/m0-foundation`, and no remote publication. If Git author identity is missing, supply your actual name and email using the following local-only options. The initializer does not invent an author or change global Git settings.

If no Git identity is configured, replace the placeholders below with your actual commit name and email. These options configure only the new repository:

```bash
python3 scripts/init_repo.py --commit --branch feat/m0-foundation --author-name "YOUR REAL NAME" --author-email "YOUR COMMIT EMAIL"
```
 It refuses an existing/enclosing repository and does not delete files to obtain a clean state.

Git branch protection on a remote is configured only after you choose a remote host. The supplied local workflow is useful before any remote exists.

## Phase C — Start OMP and issue the first prompt

Launch your installed OMP from the repository root (normally `omp`; use the launcher you already use if it differs). Confirm it is working in this directory. Exact host interfaces are checked against the installed version in M0; upstream research in this package is a starting reference.

Paste this as the first user message:

```text
Read AGENTS.md, START-HERE.md, and prompts/01-BOOTSTRAP-OMP.md.

Build NOESIS from this repository's specification through the required v1.0
scope and M8. Begin with M0: inspect the repository and my installed OMP,
verify the extension and model interfaces, resolve and record the toolchain,
and bind the planned validation targets to executable commands.

Then implement dependency-ready tasks and continue across milestones without
routine permission prompts. Preserve my existing work and configuration.
Use isolated branches/worktrees for parallel workers and one integration owner.
Give concise progress updates during substantial work. Record actual evidence,
update the backlog and STATUS.md, and commit coherent validated checkpoints.

The dashboard must be LAN-accessible by default, with its actual access URL
and a terminal text QR code. M1 must include the real native OMP loop, a working
web dashboard with pairing, and a durable deterministic mind_dream Snooze.

Complete the full requested capabilities in the roadmap, including Atlas
resources, Attunement, Ebb, full Reverie, Lore, Forge and Blueprints. Native
portability is part of the product; optional transports/backends may be scoped
out explicitly if their value does not justify their cost.

Do not claim mocks, planned commands, generated documentation or unrun checks
as implementation evidence. Continue independent work when one path is blocked.
Ask only for a concrete decision, access or destructive action that cannot be
resolved from the authorized task. Prepare releases locally; do not publish
or expose the service to the Internet without my authorization.
```

You do not need to paste all the documents into the chat. The prompt directs OMP to read them from the repository. Do not assume a special `/goal` or `/vibe` mode is required. If your installed environment offers a persistent goal mode you prefer, give it the same task and repository; verify its actual behavior first.

### Optional budget steering

If cost is important, add concrete ceilings you are comfortable with. For example, state a currency and amount for model-assisted evaluation or dreaming. Do not copy an example amount as a purchase authorization. Tell OMP to reuse your configured models and propose cheaper compatible paths where useful. It must not silently enable paid background work. Deterministic capture, inspection and Snooze remain useful without such a budget.

## Phase D — What should happen first

During M0, expect OMP to produce:

- An environment record identifying actual OMP/runtime versions and supported platform.
- A minimal verified extension probe and an architecture decision grounded in that result.
- Chosen dependencies with exact versions and an authoritative lockfile.
- Real build/test/development commands, including the future service launcher.
- A mapping from planned validation targets to those commands.
- A bounded task/worktree ownership plan and updated status.

A repository containing only more plans does not complete M1. The first usable alpha must capture real host activity, persist it, recall and inspect it, show it in the dashboard, and execute the durable Snooze path.

## Phase E — Follow the staged build

| Checkpoint | What you should be able to see | What OMP should establish |
| --- | --- | --- |
| M0 | Verified setup, actual commands and recorded choices. | The environment and interfaces are usable; no invented package/API setup. |
| M1 | Real OMP memory loop and working LAN dashboard; text QR and pairing; basic Snooze. | Persistence, replay/deduplication, source inspection, startup/access and real-host evidence. |
| M2 | Resource catalog covering local/external items; linked history and evidence. | Identity, snapshots, scope filtering, pagination and accurate knowledge-depth distinctions. |
| M3 | Preferences you can inspect/correct and memories that fade/revive. | Contextual inference, instruction override and decay independent of truth. |
| M4 | All dream levels/modes, progress, budgets, cancellation and resumption. | Creative outputs retain provenance; jobs recover without duplicated effects. |
| M5 | Readable, editable Lore pages with sources and preserved authored content. | Source changes invalidate affected claims; summaries do not confirm themselves. |
| M6 | Select a plugin, tool, project or source and export useful learning. | Blueprint scope, evidence, version attribution and delta exports. |
| M7 | Native portable archive and faithful restore; selected optional adapters. | Integrity and semantics survive the required round trip. |
| M8 | Installable release candidate, operational runbooks and stable artifact. | Reliability, meaningful evaluation, backup/restore, migration and declared support. |

The reference estimate is 59–86 engineering days / roughly 12–18 working weeks under the roadmap's assumptions. Agent wall-clock time may differ substantially. Use completed behavior and actual throughput to reforecast after M1; do not demand a fake percentage to match the estimate.

You can inspect and try each release as it becomes useful. Your availability for manual testing is not a routine gate on ongoing development. OMP records the exact limits of checks that require another physical device or an unavailable environment.

## Phase F — Use the LAN dashboard when M1 exists

Use the implemented launch command documented by M0/M1; no final application launcher exists in this bootstrap yet. Successful startup must print the actual URL and text QR. On another device on the reachable LAN, scan the QR or type the printed URL, then enter the short-lived code shown in the operator console.

The proposed default is port 7337. `0.0.0.0` is a listener setting, not an address to type on your phone. If the machine has multiple interfaces, choose the reachable LAN address from the startup list. If the service is in a container, verify the address and port exposure selected for that environment. Do not open a router port to the Internet to solve an ordinary LAN issue.

If access fails, ask OMP:

```text
Diagnose the implemented NOESIS LAN startup and pairing path. Compare the
actual listener, advertised URL, decoded terminal QR, interface addresses and
container/host networking. Check logs without exposing secrets. Make the
smallest authorized local fix and report what you verified. Do not treat
loopback success as proof that another LAN device connected.
```

## Phase G — Continue after a context reset or interruption

Open OMP in the same repository and paste:

```text
Read AGENTS.md, planning/STATUS.md and prompts/03-RESUME.md. Reconcile the
actual Git branch/worktrees, task statuses, artifacts and validation evidence.
Resume the next dependency-ready NOESIS task and continue toward the required
v1.0 scope. Preserve unrelated work; do not repeat completed work or infer
passed checks from an old narrative. Give me the current milestone, verified
progress, remaining work and next step, then continue.
```

If a task is genuinely blocked, ask for the concrete blocker record: missing fact/capability, evidence, attempted alternatives, affected tasks and the smallest user action needed. Independent tasks should continue. A new self-invented review ceremony is not a technical blocker.

For a deliberately bounded session use [prompts/02-IMPLEMENT-MILESTONE.md](../prompts/02-IMPLEMENT-MILESTONE.md) and name the milestone. That explicit limit overrides the default continuous build.

## Phase H — Handle new ideas without losing the release

Use a change request with requirement, expected value, affected contracts, estimate and proposed milestone. If the idea belongs after v1.0, retain it in the backlog. If it is needed now, update the requirement allocation and dependencies before implementation. Do not silently overwrite a feature freeze or postpone an already promised capability.

A useful steering prompt:

```text
Assess this change against the NOESIS product scope and current release plan:
<my change>. Identify affected contracts, implementation and validation work.
Record a decision and update the backlog. Continue the currently authorized
build; ask only if the change creates a material unresolved tradeoff.
```

## Phase I — Move from beta to stable

When required milestones are complete, use [prompts/04-REVIEW-RELEASE.md](../prompts/04-REVIEW-RELEASE.md). Ask OMP to prepare a local `v1.0.0-rc.1` candidate, execute the relevant checks, fix release-blocking defects and prepare stable artifacts with truthful release notes.

Check that the candidate includes actual installation/upgrade/uninstall instructions, configuration reference, supported OMP/platform versions, LAN/QR/pairing behavior, backup/restore, data retention/deletion, model/cost behavior, known limitations and reproducible validation evidence. A version string or successful build alone is insufficient.

After the candidate is stable, explicitly choose whether and where to publish. A remote repository, package registry, hosted deployment, license and release audience are real choices. Local preparation and testing can finish before those decisions. Never paste credentials into the documentation or commit them.

## Phase J — Maintain the product

After v1.0, use short-lived branches and named patch/minor goals. Fix defects with a reproduction and focused test, update relevant docs and migrations, and compare learning/evaluation cases before changing retrieval or preference policy. Keep the previous accepted policy available for rollback.

Use NOESIS's own Forge/Blueprints to suggest improvements once the evidence loop exists. Evaluate those proposals through the same repository workflow; generated recommendations do not bypass it. Revisit the roadmap using observed usefulness, cost and reliability rather than memory counts.

The next useful result after importing this package is an evidence-backed M0 completion and the beginning of the real M1 loop. OMP should carry that work forward using the prompts and status records provided here.
