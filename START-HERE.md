# Start building NOESIS in Oh My Pi

For the complete walkthrough, copy-and-paste first prompt, resume instructions and path to stable v1.0, read the [Operator Playbook](docs/13-OPERATOR-PLAYBOOK.md).

## 1. Choose a repository destination

Extract the ZIP into a fresh directory such as `/code/noesis`. Keep the extracted directory's contents at the repository root. In examples below, change into your actual directory first.

For an existing repository, create a dedicated branch or worktree and compare the package before copying. Preserve existing `AGENTS.md`, README, CI, configuration and license; merge their relevant content deliberately. The included initializer refuses existing or enclosing repositories. Do not run it as a way to overwrite an existing project.

The package contains no runtime secrets, personal memories or repository history.

## 2. Run the bootstrap checks

Python 3.10+ and Git are sufficient for the basic checks. No application dependencies are installed by these commands.

```bash
python3 scripts/doctor.py
python3 scripts/validate_bootstrap.py
python3 -m unittest discover -s tests/bootstrap -v
```

`doctor.py` reports the OMP executable and candidate runtimes if present. Missing OMP does not mean the package is corrupt; install or locate the host before M0's integration probe. Preserve the reported distinction between local observations and upstream references.

For full JSON Schema validation and the QR helper, use an isolated Python environment:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-validation.txt
.venv/bin/python scripts/validate_bootstrap.py --strict-schemas
```

On Windows use `.venv\Scripts\python.exe` and `python` where appropriate. The application's runtime is chosen and pinned in M0; this Python environment only supports bootstrap validation and the QR utility.

## 3. Initialize a fresh Git repository

Inspect the extracted files, then run:

```bash
python3 scripts/init_repo.py --commit --branch feat/m0-foundation
```

The initializer verifies package integrity and the Git identity before creating a repository. It never invents an author, changes global Git settings, creates a remote, or pushes.

If no Git identity is configured, replace the placeholders below with your actual commit name and email. These options configure only the new repository:

```bash
python3 scripts/init_repo.py --commit --branch feat/m0-foundation --author-name "YOUR REAL NAME" --author-email "YOUR COMMIT EMAIL"
```


Without `--commit`, it only initializes the repository and selects the requested unborn branch. With `--commit`, the initial package commit is on `main` and implementation continues on the chosen branch. Keep the package manifest until the bootstrap is integrated.

## 4. Start OMP and give it the build prompt

Open your installed OMP in the project directory using the invocation supported by that installation. Give it the contents of [prompts/01-BOOTSTRAP-OMP.md](prompts/01-BOOTSTRAP-OMP.md).

The prompt directs OMP to:

1. Verify its installed version, extension interfaces and available model/runtime configuration.
2. Inspect the repository without discarding changes.
3. Resolve the M0 architecture and dependency decisions.
4. Bind planned test targets to real executable commands.
5. Implement dependency-ready tasks, preserve progress and continue through authorized milestones.

No particular `/goal`, `/vibe`, or other mode is assumed to exist. See [OMP integration](docs/06-OMP-INTEGRATION.md) for verified interfaces and installed-version checks.

## 5. First usable release

M1 must demonstrate a real loop: native OMP event -> durable evidence -> memory -> recall/inspection -> visible dashboard. It also includes an actual durable deterministic `mind_dream` Snooze.

The dashboard starts on the LAN by default, shows real access URLs and a text QR, and pairs another browser before it exposes private memory. Proposed port: **7337**. The startup output must reflect the actual listener; a startup failure must not display a working-access claim.

The standalone QR helper can demonstrate rendering for a URL you supply:

```bash
.venv/bin/python scripts/lan_qr.py --url http://192.168.1.20:7337/pair
```

That address is an example. Substitute the address printed by a real running service. The helper renders text only and does not start or verify a service.

## 6. Continue or resume

Use [the milestone prompt](prompts/02-IMPLEMENT-MILESTONE.md) for focused work, [the resume prompt](prompts/03-RESUME.md) after interruption, and [the release review prompt](prompts/04-REVIEW-RELEASE.md) when a release candidate is actually ready.

For each checkpoint, OMP updates planning status, records meaningful verification and commits a coherent change. Local progress does not require repeated permission. Publishing, deployment and external distribution follow your actual authorization.

## What is intentionally decided during M0

Exact application runtime and versions; package manager and lockfile; compatible OMP extension schema helpers; available model roles and monetary limits; application test commands; license and distribution destination. The package gives defaults and decision criteria without pretending to know your installed environment.
