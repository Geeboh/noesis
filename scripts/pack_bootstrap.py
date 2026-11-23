#!/usr/bin/env python3
"""Create a reproducible allowlisted archive of the original bootstrap package."""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path
import sys
import zipfile
from validate_bootstrap import ROOT, safe_member, validate


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root, output = args.root.resolve(), args.output.resolve()
    if output.is_relative_to(root) or output.suffix.lower() != ".zip":
        print("Choose a .zip output outside the package root.", file=sys.stderr); return 2
    checksum = output.with_suffix(output.suffix + ".sha256")
    if output.exists() or checksum.exists():
        print("Refusing to overwrite an archive or checksum.", file=sys.stderr); return 2
    result = validate(root, delivery_snapshot=True)
    if not result["passed"]:
        print(json.dumps(result, indent=2), file=sys.stderr); return 2
    metadata = json.loads((root / "bootstrap.json").read_text(encoding="utf-8"))
    manifest = json.loads((root / "MANIFEST.json").read_text(encoding="utf-8"))
    prefix = metadata["package_root"]
    if not isinstance(prefix, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", prefix):
        print("Unsafe package root name.", file=sys.stderr); return 2
    entries = {x["path"]: x for x in manifest["files"]}
    output.parent.mkdir(parents=True, exist_ok=True)
    created = False
    try:
        with output.open("xb") as stream:
            created = True
            with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
                for rel in sorted([*entries, "MANIFEST.json"]):
                    path = safe_member(root, rel)
                    data = path.read_bytes()
                    if rel in entries and hashlib.sha256(data).hexdigest() != entries[rel]["sha256"]:
                        raise ValueError("Source changed during packaging: " + rel)
                    info = zipfile.ZipInfo(prefix + "/" + rel, date_time=(1980, 1, 1, 0, 0, 0))
                    info.create_system = 3
                    info.external_attr = (0o100644 << 16)
                    info.compress_type = zipfile.ZIP_DEFLATED
                    archive.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
        digest = hashlib.sha256(output.read_bytes()).hexdigest()
        with checksum.open("x", encoding="utf-8") as stream:
            stream.write(digest + "  " + output.name + "\n")
        print(json.dumps({"archive": str(output), "sha256": digest,
                          "files": len(entries) + 1, "size_bytes": output.stat().st_size}, indent=2))
        return 0
    except (OSError, ValueError) as error:
        if created and output.exists(): output.unlink()
        print(f"Packaging failed: {error}", file=sys.stderr); return 2

if __name__ == "__main__":
    raise SystemExit(main())
