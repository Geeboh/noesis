#!/usr/bin/env python3
"""Read-only prerequisite inventory; never installs or changes configuration."""
from __future__ import annotations
import argparse
import importlib.metadata
import json
import platform
import shutil
import subprocess
import sys


def inspect_command(name: str) -> dict:
    executable = shutil.which(name)
    if not executable:
        return {"available": False, "version": None}
    try:
        result = subprocess.run([executable, "--version"], capture_output=True,
                                text=True, timeout=10, check=False)
        text = (result.stdout or result.stderr).strip().splitlines()
        version = text[0][:240] if text else None
        return {"available": True, "path": executable, "version": version,
                "exit_code": result.returncode}
    except (OSError, subprocess.TimeoutExpired) as error:
        return {"available": True, "path": executable,
                "version": None, "error": type(error).__name__}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="Print structured results")
    parser.add_argument("--require-omp", action="store_true")
    args = parser.parse_args()
    result = {"kind": "bootstrap-environment-observation",
              "python": platform.python_version(), "platform": platform.system(),
              "python_supported": sys.version_info >= (3, 10),
              "commands": {n: inspect_command(n) for n in ("git", "omp", "bun", "node")},
              "optional_validation_dependencies": {}}
    for name in ("jsonschema", "qrcode"):
        try:
            result["optional_validation_dependencies"][name] = importlib.metadata.version(name)
        except importlib.metadata.PackageNotFoundError:
            result["optional_validation_dependencies"][name] = None
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print("NOESIS bootstrap prerequisite inventory (read-only)")
        print(f"Python {result['python']} on {result['platform']}")
        for name, item in result["commands"].items():
            print(f"{name}: " + (str(item.get("version") or "found; version unavailable")
                  if item["available"] else "not found on PATH"))
        for name, value in result["optional_validation_dependencies"].items():
            print(f"optional {name}: {value or 'not installed'}")
        print("M0 must verify installed OMP interfaces and select/pin the application toolchain.")
        print("No software, global settings, firewall rules or repositories were changed.")
    okay = result["python_supported"] and result["commands"]["git"]["available"]
    if args.require_omp:
        okay = okay and result["commands"]["omp"]["available"]
    return 0 if okay else 1

if __name__ == "__main__":
    raise SystemExit(main())
