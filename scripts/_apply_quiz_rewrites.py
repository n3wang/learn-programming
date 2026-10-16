#!/usr/bin/env python3
"""Apply pre-authored wrong-choice rewrites to MDX quiz blocks."""
from __future__ import annotations

import importlib.util
import pathlib
import re
import sys

spec = importlib.util.spec_from_file_location(
    "fq", pathlib.Path(__file__).parent / "fix-scalable-quiz-bias.py"
)
fq = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fq)

# Key: relative path from fundamentals/scalable-systems/ using forward slashes
# Value: list of questions; each question is list of 4 choice strings (full arrays)
REWRITES: dict[str, list[list[str]]] = {}


def process_file(root: pathlib.Path, rel: str, questions: list[list[str]]) -> int:
    path = root / rel.replace("/", pathlib.os.sep)
    text = path.read_text(encoding="utf-8")
    pos = 0
    qi = 0
    updated = 0
    while qi < len(questions):
        found = fq.find_choices_block(text, pos)
        if not found:
            break
        c_start, c_end, choices = found
        ans = fq.find_answer(text, c_end)
        if not ans or len(choices) != len(questions[qi]):
            pos = c_end
            qi += 1
            continue
        new_choices = questions[qi]
        if new_choices == choices:
            pos = ans[1]
            qi += 1
            continue
        _, _, answer = ans
        # preserve correct text exactly
        assert new_choices[answer] == choices[answer], (
            f"{rel} q{qi+1}: correct choice changed"
        )
        choices_js = ",\n".join(
            f"        '{fq.js_escape(c)}'" for c in new_choices
        )
        choices_block = f"choices: [\n{choices_js},\n      ]"
        text = text[:c_start] + choices_block + text[c_end:]
        pos = c_start + len(choices_block)
        updated += 1
        qi += 1
    if updated:
        path.write_text(text, encoding="utf-8", newline="\n")
    return updated


def main() -> int:
    root = pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "scalable-systems"
    total = 0
    for rel, qs in REWRITES.items():
        n = process_file(root, rel, qs)
        if n:
            print(f"{rel}: {n} questions")
            total += n
    print(f"total updated: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
