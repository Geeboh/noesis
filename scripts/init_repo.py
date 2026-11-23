#!/usr/bin/env python3
"""Seed a fresh local repository; refuse existing history and never publish."""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from validate_bootstrap import ROOT, validate, safe_member


def git(root: Path, *args: str, capture: bool = False, check: bool = True, identity=None):
    environment = None
    if identity:
        environment = dict(os.environ)
        environment.update({"GIT_AUTHOR_NAME": identity[0], "GIT_AUTHOR_EMAIL": identity[1],
                            "GIT_COMMITTER_NAME": identity[0], "GIT_COMMITTER_EMAIL": identity[1]})
    return subprocess.run(["git", "-C", str(root), *args], check=check, text=True,
                          capture_output=capture, env=environment)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--commit", action="store_true", help="Commit only manifest-listed package files")
    parser.add_argument("--branch", default="feat/m0-foundation")
    parser.add_argument("--author-name", help="Your actual commit name; stored only in this new repository")
    parser.add_argument("--author-email", help="Your actual commit email; supply with --author-name")
    args = parser.parse_args()
    if bool(args.author_name) != bool(args.author_email):
        parser.error("Supply both --author-name and --author-email, or neither")
    identity = (args.author_name, args.author_email) if args.author_name else None
    if identity and any(not value.strip() or any(ord(c) < 32 for c in value) for value in identity):
        parser.error("Identity values must be nonempty and contain no control characters")
    root = args.root.resolve()
    overrides = [name for name in ("GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE",
                 "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_NAMESPACE",
                 "GIT_PREFIX", "GIT_CONFIG_COUNT", "GIT_CONFIG_PARAMETERS") if os.environ.get(name)]
    if overrides:
        print("Repository-affecting Git environment overrides must be unset first: " + ", ".join(overrides), file=sys.stderr)
        return 2
    if not shutil.which("git"):
        print("Git is required; nothing changed.", file=sys.stderr); return 2
    if not root.is_dir():
        print("Project directory does not exist; nothing changed.", file=sys.stderr); return 2
    existing = git(root, "rev-parse", "--git-dir", capture=True, check=False)
    if existing.returncode == 0 or (root / ".git").exists():
        print("Refusing existing/enclosing Git repository. Use its branch/worktree workflow; nothing changed.", file=sys.stderr)
        return 2
    valid_branch = git(root, "check-ref-format", "--branch", args.branch, capture=True, check=False)
    if valid_branch.returncode or args.branch.startswith("-"):
        print("Invalid branch name; nothing changed.", file=sys.stderr); return 2
    result = validate(root, delivery_snapshot=True)
    if not result["passed"]:
        print(json.dumps(result, indent=2), file=sys.stderr); return 2
    if args.commit:
        for identity_key in ("GIT_AUTHOR_IDENT", "GIT_COMMITTER_IDENT"):
            identified = git(root, "var", identity_key, capture=True, check=False, identity=identity)
            if identified.returncode:
                print("A real Git identity is required before --commit. Supply your own --author-name and --author-email, or configure an identity. Nothing changed.", file=sys.stderr)
                return 2
    initial = "main" if args.commit else args.branch
    try:
        git(root, "init", "--initial-branch=" + initial)
        if identity:
            git(root, "config", "--local", "user.name", identity[0])
            git(root, "config", "--local", "user.email", identity[1])
        if args.commit:
            manifest = json.loads((root / "MANIFEST.json").read_text(encoding="utf-8"))
            paths = [x["path"] for x in manifest["files"]] + ["MANIFEST.json"]
            for path in paths: safe_member(root, path)
            git(root, "add", "--", *paths)
            git(root, "diff", "--cached", "--stat")
            git(root, "commit", "-m", "chore: bootstrap NOESIS implementation plan", identity=identity)
            if args.branch != "main": git(root, "switch", "-c", args.branch)
        print("Local repository initialized. No remote, push, global configuration or publication was performed.")
        if not args.commit:
            print("No commit was requested; inspect and commit explicit paths when ready.")
        return 0
    except subprocess.CalledProcessError as error:
        print(f"Git step failed with exit {error.returncode}. Existing work is preserved; inspect state before retrying.", file=sys.stderr)
        return error.returncode or 1

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError) as error:
        print(f"Initialization failed: {error}. Inspect the preserved state before retrying.", file=sys.stderr)
        raise SystemExit(2)
