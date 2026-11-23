"""Behavioral tests for delivered bootstrap utilities; not application tests."""
from __future__ import annotations
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
from validate_bootstrap import graph_errors, safe_member, validate
from lan_qr import checked_url, qr_matrix, render_matrix


def copied_package(destination: Path, delivery_fixture: bool = False) -> Path:
    shutil.copytree(ROOT, destination, ignore=shutil.ignore_patterns(".git", ".venv", "__pycache__", "*.pyc"))
    if delivery_fixture:
        # Build a synthetic initial-delivery fixture from current files. This
        # keeps helper tests useful while the real product statuses evolve.
        for rel, key in (("planning/milestones.json", "milestones"), ("planning/backlog.json", "tasks")):
            path = destination / rel
            data = json.loads(path.read_text())
            data["product_version"] = "unreleased"
            for entry in data[key]:
                entry["status"] = "planned"
                entry["completion_evidence"] = []
            path.write_text(json.dumps(data, indent=2) + "\n")
        metadata_path = destination / "bootstrap.json"
        metadata = json.loads(metadata_path.read_text())
        metadata["product_version"] = "unreleased"
        metadata["application_implemented"] = False
        manifest_path = destination / "MANIFEST.json"
        manifest = json.loads(manifest_path.read_text())
        metadata["manifest_file_count"] = len(manifest["files"])
        metadata_path.write_text(json.dumps(metadata, indent=2) + "\n")
        for entry in manifest["files"]:
            data = (destination / entry["path"]).read_bytes()
            entry["size_bytes"] = len(data)
            entry["sha256"] = hashlib.sha256(data).hexdigest()
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    return destination


def isolated_git_env(directory: Path, identity: bool = True) -> dict:
    config = directory / "empty-git-config"
    config.write_text("", encoding="utf-8")
    env = dict(os.environ)
    env.update({"GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": str(config),
                "GIT_AUTHOR_NAME": "Bootstrap Fixture" if identity else "",
                "GIT_AUTHOR_EMAIL": "fixture@example.invalid" if identity else "",
                "GIT_COMMITTER_NAME": "Bootstrap Fixture" if identity else "",
                "GIT_COMMITTER_EMAIL": "fixture@example.invalid" if identity else "",
                "GIT_TERMINAL_PROMPT": "0"})
    for key in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_CONFIG_COUNT"):
        env.pop(key, None)
    return env


class IntegrityTests(unittest.TestCase):
    def test_current_package_integrity(self):
        result = validate(ROOT)
        self.assertTrue(result["passed"], result["errors"])
        self.assertFalse(result["application_tests_run"])

    def test_cycles_and_unknown_dependencies(self):
        self.assertTrue(graph_errors({"a": {"depends_on": ["b"]}, "b": {"depends_on": ["a"]}}))
        self.assertTrue(graph_errors({"a": {"depends_on": ["missing"]}}))
        self.assertFalse(graph_errors({"a": {"depends_on": []}, "b": {"depends_on": ["a"]}}))

    def test_deep_dependency_graph_is_iterative(self):
        nodes = {str(i): {"depends_on": [str(i + 1)] if i < 1500 else []} for i in range(1501)}
        self.assertFalse(graph_errors(nodes))

    def test_partial_manifest_and_malformed_metadata_fail_cleanly(self):
        with tempfile.TemporaryDirectory() as td:
            root = copied_package(Path(td) / "package")
            path = root / "MANIFEST.json"
            data = json.loads(path.read_text()); data["files"] = []
            path.write_text(json.dumps(data))
            result = validate(root)
            self.assertFalse(result["passed"])
            (root / "bootstrap.json").write_text("[]")
            result = validate(root)
            self.assertFalse(result["passed"])

    def test_package_paths_cannot_escape(self):
        for path in ("../secret", "/etc/passwd", "docs/../../secret", "docs//x", "C:/secret", r"docs\secret", "./README.md"):
            with self.assertRaises(ValueError): safe_member(ROOT, path)

    def test_done_requires_observed_evidence(self):
        with tempfile.TemporaryDirectory() as td:
            root = copied_package(Path(td) / "package")
            path = root / "planning/backlog.json"
            data = json.loads(path.read_text())
            data["tasks"][0]["status"] = "done"
            data["tasks"][0]["completion_evidence"] = []
            path.write_text(json.dumps(data))
            result = validate(root)
            self.assertFalse(result["passed"])
            self.assertTrue(any("completion_evidence" in e for e in result["errors"]))

    def test_mutated_original_fails_snapshot_hashes(self):
        with tempfile.TemporaryDirectory() as td:
            root = copied_package(Path(td) / "package")
            with (root / "README.md").open("a") as stream: stream.write("\nChanged after delivery.\n")
            result = validate(root, delivery_snapshot=True)
            self.assertFalse(result["passed"])
            self.assertTrue(any("hash/size mismatch" in e for e in result["errors"]))


@unittest.skipUnless(shutil.which("git"), "Git unavailable")
class RepositoryTests(unittest.TestCase):
    def test_fresh_commit_preserves_unlisted_file_and_refuses_reinitialization(self):
        with tempfile.TemporaryDirectory() as td:
            base = Path(td); root = copied_package(base / "package", delivery_fixture=True)
            (root / "operator-private.txt").write_text("not part of the package\n")
            env = isolated_git_env(base)
            command = [sys.executable, str(root / "scripts/init_repo.py"), "--commit", "--branch", "feat/test"]
            run = subprocess.run(command, capture_output=True, text=True, env=env)
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            branch = subprocess.check_output(["git", "-C", str(root), "branch", "--show-current"], text=True, env=env).strip()
            self.assertEqual(branch, "feat/test")
            tracked = subprocess.check_output(["git", "-C", str(root), "ls-files"], text=True, env=env)
            self.assertIn("AGENTS.md", tracked)
            self.assertNotIn("operator-private.txt", tracked)
            self.assertEqual((root / "operator-private.txt").read_text(), "not part of the package\n")
            before = subprocess.check_output(["git", "-C", str(root), "rev-parse", "HEAD"], env=env)
            rerun = subprocess.run(command, capture_output=True, text=True, env=env)
            self.assertNotEqual(rerun.returncode, 0)
            after = subprocess.check_output(["git", "-C", str(root), "rev-parse", "HEAD"], env=env)
            self.assertEqual(before, after)

    def test_refuses_nested_repository(self):
        with tempfile.TemporaryDirectory() as td:
            base = Path(td); env = isolated_git_env(base)
            subprocess.run(["git", "-C", str(base), "init", "--initial-branch=main"], check=True, capture_output=True, env=env)
            root = copied_package(base / "child")
            run = subprocess.run([sys.executable, str(root / "scripts/init_repo.py")], capture_output=True, text=True, env=env)
            self.assertNotEqual(run.returncode, 0)
            self.assertFalse((root / ".git").exists())

    def test_repository_environment_override_is_rejected(self):
        with tempfile.TemporaryDirectory() as td:
            base = Path(td); root = copied_package(base / "package", delivery_fixture=True)
            env = isolated_git_env(base)
            env["GIT_INDEX_FILE"] = str(base / "external-index")
            run = subprocess.run([sys.executable, str(root / "scripts/init_repo.py"), "--commit"],
                                 capture_output=True, text=True, env=env)
            self.assertNotEqual(run.returncode, 0)
            self.assertFalse((root / ".git").exists())
            self.assertFalse((base / "external-index").exists())

    def test_explicit_identity_is_local_only(self):
        with tempfile.TemporaryDirectory() as td:
            base = Path(td); root = copied_package(base / "package", delivery_fixture=True)
            env = isolated_git_env(base, False)
            run = subprocess.run([sys.executable, str(root / "scripts/init_repo.py"), "--commit",
                                  "--author-name", "Fixture Owner", "--author-email", "owner@example.invalid"],
                                 capture_output=True, text=True, env=env)
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)
            name = subprocess.check_output(["git", "-C", str(root), "config", "--local", "--get", "user.name"], text=True, env=env).strip()
            self.assertEqual(name, "Fixture Owner")
            self.assertEqual((base / "empty-git-config").read_text(), "")

    def test_missing_identity_changes_nothing(self):
        with tempfile.TemporaryDirectory() as td:
            base = Path(td); root = copied_package(base / "package", delivery_fixture=True)
            run = subprocess.run([sys.executable, str(root / "scripts/init_repo.py"), "--commit"],
                                 capture_output=True, text=True, env=isolated_git_env(base, False))
            self.assertNotEqual(run.returncode, 0)
            self.assertFalse((root / ".git").exists())


class PackagingTests(unittest.TestCase):
    def test_reproducible_and_allowlisted_archive(self):
        with tempfile.TemporaryDirectory() as td:
            base = Path(td); root = copied_package(base / "package", delivery_fixture=True)
            (root / "private-not-in-package.txt").write_text("must not ship")
            archives = [base / "one.zip", base / "two.zip"]
            for output in archives:
                result = subprocess.run([sys.executable, str(root / "scripts/pack_bootstrap.py"), "--output", str(output)],
                                        capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual(archives[0].read_bytes(), archives[1].read_bytes())
            with zipfile.ZipFile(archives[0]) as archive:
                self.assertIsNone(archive.testzip())
                names = archive.namelist()
                self.assertFalse(any("private-not-in-package" in n for n in names))
                self.assertTrue(all(n.startswith("noesis-bootstrap-v1.0.0/") for n in names))
                self.assertTrue(all(".." not in Path(n).parts for n in names))
            original = hashlib.sha256(archives[0].read_bytes()).hexdigest()
            refused = subprocess.run([sys.executable, str(root / "scripts/pack_bootstrap.py"), "--output", str(archives[0])], capture_output=True)
            self.assertNotEqual(refused.returncode, 0)
            self.assertEqual(hashlib.sha256(archives[0].read_bytes()).hexdigest(), original)


class QRTests(unittest.TestCase):
    def test_access_url_validation(self):
        self.assertEqual(checked_url("http://192.168.1.20:7337/pair"), "http://192.168.1.20:7337/pair")
        self.assertEqual(checked_url("http://[fd00::12]:7337/pair"), "http://[fd00::12]:7337/pair")
        for value in ("http://0.0.0.0:7337", "http://[::]:7337", "http://host/pair?token=x",
                      "http://name:secret@host/pair", "javascript:alert(1)", "http://host:99999", "http://host/\n", "http://bad host/",
                      "http://999.999.999.999/", "http://@127.0.0.1/"):
            with self.assertRaises(ValueError): checked_url(value)

    @unittest.skipUnless(importlib.util.find_spec("qrcode"), "Optional qrcode dependency unavailable")
    def test_terminal_render_preserves_encoder_matrix(self):
        matrix = qr_matrix("http://192.168.1.20:7337/pair")
        glyphs = {" ": (False, False), "▀": (True, False), "▄": (False, True), "█": (True, True)}
        for invert in (False, True):
            lines = render_matrix(matrix, "unicode", invert).split("\n")
            recovered = []
            for line in lines:
                top, bottom = [], []
                for character in line:
                    a, b = glyphs[character]
                    top.append(not a if invert else a); bottom.append(not b if invert else b)
                recovered.extend([top, bottom])
            self.assertEqual(recovered[:len(matrix)], matrix)
        ascii_lines = render_matrix(matrix, "ascii").split("\n")
        recovered = [[line[i:i+2] == "##" for i in range(0, len(line), 2)] for line in ascii_lines]
        self.assertEqual(recovered, matrix)


@unittest.skipUnless(importlib.util.find_spec("jsonschema"), "Optional schema validator unavailable")
class ContractTests(unittest.TestCase):
    def validator(self, filename):
        import jsonschema
        from referencing import Registry, Resource
        schemas = [json.loads(p.read_text()) for p in (ROOT / "docs/contracts").glob("*.schema.json")]
        registry = Registry().with_resources((s["$id"], Resource.from_contents(s)) for s in schemas)
        schema = json.loads((ROOT / "docs/contracts" / filename).read_text())
        return jsonschema.Draft202012Validator(schema, registry=registry, format_checker=jsonschema.FormatChecker())

    def test_snooze_rejects_model_usage(self):
        data = json.loads((ROOT / "docs/contracts/examples/dream-job-snooze.json").read_text())
        data["usage"]["model_calls"] = 1
        self.assertTrue(list(self.validator("dream-job.schema.json").iter_errors(data)))

    def test_unknown_record_fields_are_rejected(self):
        data = json.loads((ROOT / "docs/contracts/examples/record-preference.json").read_text())
        data["pretend_verified"] = True
        self.assertTrue(list(self.validator("record.schema.json").iter_errors(data)))

if __name__ == "__main__":
    unittest.main()
