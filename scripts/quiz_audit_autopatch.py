#!/usr/bin/env python3
"""Apply length patches to remaining imbalanced wrong options from audit JSON."""
from __future__ import annotations

import importlib.util
import json
import pathlib
import re

spec = importlib.util.spec_from_file_location(
    "fq", pathlib.Path(__file__).parent / "fix-scalable-quiz-bias.py"
)
fq = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fq)

ROOT = (
    pathlib.Path(__file__).parent.parent / "fundamentals" / "scalable-systems"
)
AUDIT = pathlib.Path(__file__).parent / "_quiz_length_audit.json"

CLAUSES: list[str] = []


def patch_text(old: str, correct_len: int, idx: int) -> str | None:
    lo = int(correct_len * 0.8)
    hi = int(correct_len * 1.2)
    if lo <= len(old) <= hi:
        return None
    if len(old) > hi:
        return old[:hi].rsplit(" ", 1)[0]
    base = old.rstrip(" ,.;")
    for clause in CLAUSES[idx % len(CLAUSES) :]:
        cand = base + clause
        if lo <= len(cand) <= hi:
            return cand
    for clause in CLAUSES:
        cand = base + clause
        if lo <= len(cand) <= hi:
            return cand
    return None


def main() -> None:
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    patches: dict[str, str] = {}
    for item in audit:
        for w in item["wrongs"]:
            if w["ratio"] >= 0.81:
                continue
            old = w["text"]
            new = patch_text(old, item["correct_len"], w["idx"])
            if new and new != old:
                patches[old] = new

    applied = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        if path.name == "02-hash-indexes-and-lsm-trees.mdx":
            continue
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in patches.items():
            o = fq.js_escape(old)
            n = fq.js_escape(new)
            text = text.replace(f"'{o}'", f"'{n}'")
        if text != orig:
            path.write_text(text, encoding="utf-8", newline="\n")
            applied += 1
    print(f"files patched: {applied}, unique strings: {len(patches)}")


if __name__ == "__main__":
    main()
