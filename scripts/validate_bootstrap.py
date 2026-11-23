#!/usr/bin/env python3
"""Validate bootstrap files and design fixtures, not NOESIS application behavior."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
STATUSES = {"planned", "in_progress", "active", "blocked", "done", "deferred", "needs_review"}
REQUIRED = ["README.md", "START-HERE.md", "AGENTS.md", "bootstrap.json", "MANIFEST.json",
            "planning/milestones.json", "planning/backlog.json", "planning/STATUS.md",
            "config/noesis.example.json", "docs/13-OPERATOR-PLAYBOOK.md",
            "scripts/doctor.py", "scripts/init_repo.py", "scripts/pack_bootstrap.py",
            "scripts/validate_bootstrap.py", "scripts/lan_qr.py",
            "docs/contracts/record.schema.json", "docs/contracts/dream-job.schema.json",
            "docs/contracts/blueprint.schema.json", "tests/bootstrap/test_helpers.py",
            "docs/14-REQUIREMENTS-TRACEABILITY.md", "requirements-validation.txt"]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def safe_member(root: Path, rel: str) -> Path:
    if not isinstance(rel, str) or not rel or "\\" in rel or ":" in rel:
        raise ValueError(f"Unsafe portable package path: {rel!r}")
    if any(ord(c) < 32 or ord(c) == 127 for c in rel):
        raise ValueError("Control character in package path")
    parts = rel.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise ValueError(f"Non-normalized package path: {rel}")
    target = root.joinpath(*parts)
    if target.is_symlink() or any(parent.is_symlink() for parent in target.parents if parent != root.parent):
        raise ValueError(f"Symlink not permitted in package: {rel}")
    if not target.resolve().is_relative_to(root.resolve()):
        raise ValueError(f"Escaping package path: {rel}")
    return target


def graph_errors(nodes: dict, field: str = "depends_on") -> list[str]:
    errors, done = [], set()
    for start in nodes:
        if start in done:
            continue
        active = {start}
        stack = [(start, iter(nodes[start].get(field, [])))]
        while stack:
            key, dependencies = stack[-1]
            dependency = next(dependencies, None)
            if dependency is None:
                stack.pop(); active.remove(key); done.add(key)
            elif dependency not in nodes:
                errors.append(f"{key}: unknown dependency {dependency}")
            elif dependency in active:
                errors.append(f"Dependency cycle at {dependency}")
            elif dependency not in done:
                active.add(dependency)
                stack.append((dependency, iter(nodes[dependency].get(field, []))))
    return errors


def schema_checks(root: Path, strict: bool) -> tuple[list[str], list[str], int]:
    errors, warnings, checked = [], [], 0
    try:
        import jsonschema
        from referencing import Registry, Resource
    except ImportError:
        message = "Full JSON Schema validation unavailable; install requirements-validation.txt."
        (errors if strict else warnings).append(message)
        return errors, warnings, checked
    schemas = {}
    try:
        for path in sorted((root / "docs/contracts").glob("*.schema.json")):
            schema = read_json(path)
            jsonschema.Draft202012Validator.check_schema(schema)
            schemas[path.name] = schema
        if len(schemas) != 3:
            errors.append("Expected three contract schemas")
        registry = Registry().with_resources((s["$id"], Resource.from_contents(s)) for s in schemas.values())
        for path in sorted((root / "docs/contracts/examples").glob("*.json")):
            family = "dream-job" if path.name.startswith("dream-job-") else "blueprint" if path.name.startswith("blueprint-") else "record"
            validator = jsonschema.Draft202012Validator(schemas[family + ".schema.json"], registry=registry,
                                                       format_checker=jsonschema.FormatChecker())
            issues = sorted(validator.iter_errors(read_json(path)), key=lambda e: str(list(e.path)))
            errors.extend(f"{path.relative_to(root)}: {list(e.path)}: {e.message}" for e in issues)
            checked += 1
    except Exception as error:
        errors.append(f"Contract validation failed: {type(error).__name__}: {error}")
    return errors, warnings, checked


def validate(root: Path, delivery_snapshot: bool = False, strict_schemas: bool = False,
             check_hashes: bool = False) -> dict:
    root = root.resolve()
    errors, warnings = [], []
    for rel in REQUIRED:
        if not (root / rel).is_file():
            errors.append(f"Missing required file: {rel}")
    if errors:
        return {"passed": False, "errors": errors, "warnings": warnings}
    try:
        metadata = read_json(root / "bootstrap.json")
        manifest = read_json(root / "MANIFEST.json")
        if not isinstance(metadata, dict) or not isinstance(manifest, dict):
            raise ValueError("Metadata and manifest must be JSON objects")
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", metadata.get("package_root", "")):
            raise ValueError("Invalid portable package_root")
        members = manifest["files"]
        if not isinstance(members, list) or not members or any(not isinstance(x, dict) for x in members):
            raise ValueError("Manifest files must be a nonempty array of objects")
        paths = [item["path"] for item in members]
        if len(paths) != len(set(paths)):
            errors.append("Duplicate manifest path")
        if "MANIFEST.json" in paths:
            errors.append("Manifest must not list itself")
        missing_members = (set(REQUIRED) - {"MANIFEST.json"}) - set(paths)
        if missing_members:
            errors.append("Manifest omits essential files: " + ", ".join(sorted(missing_members)))
        if delivery_snapshot or check_hashes:
            expected = set(REQUIRED) - {"MANIFEST.json"}
            for folder in ("docs", "prompts", "planning", "templates", "config", ".github"):
                expected.update(str(x.relative_to(root)).replace("\\", "/") for x in (root / folder).rglob("*") if x.is_file())
            if expected - set(paths):
                errors.append("Manifest omits distributable files: " + ", ".join(sorted(expected - set(paths))))
            if metadata.get("manifest_file_count") != len(members):
                errors.append("Manifest count differs from bootstrap metadata")
        for item in members:
            path = safe_member(root, item["path"])
            if not path.is_file():
                errors.append(f"Missing manifest file: {item['path']}")
                continue
            data = path.read_bytes()
            if check_hashes or delivery_snapshot:
                if hashlib.sha256(data).hexdigest() != item["sha256"] or len(data) != item["size_bytes"]:
                    errors.append(f"Original package hash/size mismatch: {item['path']}")
            if path.suffix == ".json":
                read_json(path)
            if path.suffix == ".md":
                text = data.decode("utf-8")
                if not text.endswith("\n"):
                    errors.append(f"Missing final newline: {item['path']}")
                fences = re.findall(r"^\s*```", text, re.M)
                if len(fences) % 2:
                    errors.append(f"Unbalanced Markdown fences: {item['path']}")
                for target in re.findall(r"!?\[[^\]\n]*\]\(([^\s)]+)(?:\s+[^)]*)?\)", text):
                    parts = urlsplit(target.strip("<>"))
                    if parts.scheme or target.startswith("#"):
                        continue
                    local = unquote(parts.path)
                    if local and not (path.parent / local).exists():
                        errors.append(f"Broken local link in {item['path']}: {target}")
        ms = read_json(root / "planning/milestones.json")
        backlog = read_json(root / "planning/backlog.json")
        milestones = {x["id"]: x for x in ms["milestones"]}
        tasks = {x["id"]: x for x in backlog["tasks"]}
        if len(milestones) != len(ms["milestones"]) or len(tasks) != len(backlog["tasks"]):
            errors.append("Duplicate milestone/task ID")
        if set(milestones) != {f"M{i}" for i in range(9)}:
            errors.append("Expected M0 through M8")
        targets = {x["id"] for x in backlog["validation_policy"]["target_registry"]}
        for key, task in tasks.items():
            if task["milestone_id"] not in milestones:
                errors.append(f"{key}: unknown milestone")
            for field in ("acceptance", "outputs", "evidence", "validation_targets"):
                if not task.get(field):
                    errors.append(f"{key}: missing {field}")
            for target in task.get("validation_targets", []):
                if target not in targets:
                    errors.append(f"{key}: unregistered validation target {target}")
            if task.get("status") not in STATUSES:
                errors.append(f"{key}: unsupported status")
            if delivery_snapshot and task["status"] != "planned":
                errors.append(f"{key}: delivery snapshot must be planned")
            if task["status"] == "done" and not task.get("completion_evidence"):
                errors.append(f"{key}: done needs actual completion_evidence, separate from planned evidence")
        for key, milestone in milestones.items():
            if milestone.get("status") not in STATUSES:
                errors.append(f"{key}: unsupported status")
            if not milestone.get("exit_criteria"):
                errors.append(f"{key}: no exit criteria")
            for task_id in milestone["task_ids"]:
                if task_id not in tasks or tasks[task_id]["milestone_id"] != key:
                    errors.append(f"{key}: inconsistent task mapping {task_id}")
            actual = {t["id"] for t in tasks.values() if t["milestone_id"] == key}
            if actual != set(milestone["task_ids"]):
                errors.append(f"{key}: incomplete task index")
            if delivery_snapshot and milestone["status"] != "planned":
                errors.append(f"{key}: delivery snapshot must be planned")
            if milestone["status"] == "done":
                if not milestone.get("completion_evidence"):
                    errors.append(f"{key}: done needs completion_evidence")
                for task_id in milestone["task_ids"]:
                    task = tasks.get(task_id, {})
                    if task.get("required_for_v1", True) and task.get("status") != "done":
                        errors.append(f"{key}: required task {task_id} is not done")
        errors.extend(graph_errors(milestones))
        errors.extend(graph_errors(tasks))
        if delivery_snapshot:
            for name, record in (("bootstrap", metadata), ("milestones", ms), ("backlog", backlog)):
                if record.get("product_version") != "unreleased":
                    errors.append(f"{name}: initial product must be unreleased")
            if metadata.get("application_implemented") is not False:
                errors.append("Initial application_implemented must be false")
        policy = read_json(root / "config/noesis.example.json")
        if policy["service"]["bind_host"] != "0.0.0.0" or policy["service"]["port"] != 7337:
            errors.append("Proposed LAN default must be 0.0.0.0:7337")
        if not policy["onboarding"]["text_qr"] or policy["onboarding"]["qr_contains_secret"]:
            errors.append("Text QR must be enabled without a URL secret")
        if policy["auth"]["anonymous_private_reads"]:
            errors.append("Private reads must require pairing/authentication")
        for name, profile in policy["dream_profiles"].items():
            if any(not isinstance(v, int) or v < 0 for v in profile.values()):
                errors.append(f"{name}: finite nonnegative integer caps required")
            if profile["max_wall_seconds"] <= 0 or profile["max_concurrency"] <= 0:
                errors.append(f"{name}: positive time/concurrency required")
        if policy["dream_profiles"]["snooze"]["max_model_calls"] or policy["dream_profiles"]["snooze"]["max_model_tokens"]:
            errors.append("Initial Snooze must be deterministic")
        schema_errors, schema_warnings, examples = schema_checks(root, strict_schemas)
        errors.extend(schema_errors); warnings.extend(schema_warnings)
        counts = {"manifest_files": len(members), "milestones": len(milestones),
                  "tasks": len(tasks), "validation_targets": len(targets), "schema_examples": examples}
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as error:
        errors.append(f"Malformed bootstrap: {type(error).__name__}: {error}")
        counts = {}
    return {"passed": not errors, "kind": "bootstrap-integrity-only", "counts": counts,
            "errors": errors, "warnings": warnings,
            "application_tests_run": False, "real_omp_integration_run": False}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--delivery-snapshot", action="store_true")
    parser.add_argument("--strict-schemas", action="store_true")
    parser.add_argument("--check-hashes", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    result = validate(args.root, args.delivery_snapshot, args.strict_schemas, args.check_hashes)
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(("PASS" if result["passed"] else "FAIL") + ": NOESIS bootstrap integrity")
        for key, value in result.get("counts", {}).items(): print(f"  {key}: {value}")
        for value in result["warnings"]: print("  WARNING: " + value)
        for value in result["errors"]: print("  ERROR: " + value)
        print("This result does not validate the NOESIS application or an installed OMP host.")
    return 0 if result["passed"] else 1

if __name__ == "__main__":
    raise SystemExit(main())
