#!/usr/bin/env python3
"""Apply hand-authored MultipleChoice distractor overrides for system-design-interview."""
from __future__ import annotations

import importlib.util
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
INTERVIEW = ROOT / "fundamentals" / "scalable-systems" / "system-design-interview"

_spec = importlib.util.spec_from_file_location(
    "fix_scalable", ROOT / "scripts" / "fix-scalable-quiz-bias.py"
)
fq = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(fq)

# (filename, 1-based question index, 0-based choice index) -> new text
# Correct indices are never listed.
from sdi_quiz_overrides_data import OVERRIDES  # noqa: E402

find_choices_block = fq.find_choices_block
find_answer = fq.find_answer
js_escape = fq.js_escape


def extract_prompt(text: str, choices_start: int) -> str:
    window = text[max(0, choices_start - 500) : choices_start]
    m = re.search(r"prompt:\s*'((?:\\'|[^'])*)'", window, re.S)
    return (m.group(1) if m else "").replace("\\'", "'")


def process_file(path: pathlib.Path) -> int:
    text = path.read_text(encoding="utf-8")
    sites = []
    pos = 0
    qn = 0
    while True:
        found = find_choices_block(text, pos)
        if not found:
            break
        c_start, c_end, choices = found
        ans = find_answer(text, c_end)
        if not ans or len(choices) < 2:
            pos = c_end
            continue
        a_start, a_end, answer = ans
        if answer < 0 or answer >= len(choices):
            pos = c_end
            continue
        qn += 1
        sites.append((c_start, c_end, choices, answer, qn))
        pos = a_end

    new_text = text
    changed = 0
    for c_start, c_end, choices, answer, qn in reversed(sites):
        new_choices = list(choices)
        any_change = False
        for i in range(len(choices)):
            if i == answer:
                continue
            key = (path.name, qn, i)
            if key in OVERRIDES:
                if new_choices[i] != OVERRIDES[key]:
                    new_choices[i] = OVERRIDES[key]
                    any_change = True
        if not any_change:
            continue
        changed += 1
        choices_js = ",\n".join(f"        '{js_escape(c)}'" for c in new_choices)
        block = f"choices: [\n{choices_js},\n      ]"
        new_text = new_text[:c_start] + block + new_text[c_end:]

    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
    return changed


def main() -> int:
    n = 0
    for path in sorted(INTERVIEW.glob("*.mdx")):
        c = process_file(path)
        if c:
            print(path.name, c)
            n += c
    print("total blocks", n)
    return 0


if __name__ == "__main__":
    sys.exit(main())