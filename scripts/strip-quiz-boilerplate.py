#!/usr/bin/env python3
"""Remove auto-balance boilerplate tails from quiz choice strings."""
from __future__ import annotations

import importlib.util
import pathlib
import re

spec = importlib.util.spec_from_file_location(
    "fq", pathlib.Path(__file__).parent / "fix-scalable-quiz-bias.py"
)
fq = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fq)

ROOT = (
    pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "scalable-systems"
)
SKIP = {"02-hash-indexes-and-lsm-trees.mdx"}

STRIP_RES = [
    re.compile(
        r",?\s*offered as a complete explanation but inconsistent with the mechanism named in the prompt\.?",
        re.I,
    ),
    re.compile(
        r",?\s*describing a different subsystem than the rule-evaluation or storage behavior asked about\.?",
        re.I,
    ),
    re.compile(
        r"[;,]\s*where '[^']+' is mistaken for the invariant the surrounding system actually relies on\.?",
        re.I,
    ),
    re.compile(
        r"[;,]\s*as if '[^']+' alone removed the need for the extra structure the question names\.?",
        re.I,
    ),
    re.compile(
        r",?\s*swapping cause and effect relative to the protocol step named in the prompt\.?",
        re.I,
    ),
    re.compile(r",?\s*stated as a full alternative but missing the mechanism the prompt asks about\.?", re.I),
    re.compile(
        r",?\s*naming a side effect that is not the amplification or coupling behavior the question defines\.?",
        re.I,
    ),
    re.compile(
        r"[;,]\s*which treats '[^']+' as the whole story rather than one piece of the design under discussion\.?",
        re.I,
    ),
    re.compile(
        r"[;,]\s*where '[^']+' is mistaken for the invariant the surrounding system actually relies on\.?",
        re.I,
    ),
    re.compile(
        r"[;,]\s*as if '[^']+' alone removed the need for the extra structure the question names\.?",
        re.I,
    ),
    re.compile(
        r",?\s*which treats syntax size as proof of expressiveness instead of comparing each language to the query shape it favors\.?",
        re.I,
    ),
    re.compile(
        r",?\s*swapping cause and effect relative to the protocol step named in the prompt\.?",
        re.I,
    ),
    re.compile(
        r",?\s*which misreads the storage or replication behavior the question is asking about\.?",
        re.I,
    ),
    re.compile(r",?\s*a constraint story that does not match the failure mode or guarantee under discussion\.?", re.I),
]


def clean_choice(s: str) -> str:
    out = s
    for _ in range(5):
        prev = out
        for rx in STRIP_RES:
            out = rx.sub("", out)
        out = re.sub(r"\s+", " ", out).strip(" ,;—-")
        if out == prev:
            break
    return out


def process_file(path: pathlib.Path) -> int:
    text = path.read_text(encoding="utf-8")
    pos = 0
    changed = 0
    while True:
        found = fq.find_choices_block(text, pos)
        if not found:
            break
        c_start, c_end, choices = found
        ans = fq.find_answer(text, c_end)
        if not ans:
            pos = c_end
            continue
        new_choices = [clean_choice(c) for c in choices]
        if new_choices != choices:
            choices_js = ",\n".join(f"        '{fq.js_escape(c)}'" for c in new_choices)
            block = f"choices: [\n{choices_js},\n      ]"
            text = text[:c_start] + block + text[c_end:]
            changed += 1
            pos = c_start + len(block)
        else:
            pos = ans[1]
    if changed:
        path.write_text(text, encoding="utf-8", newline="\n")
    return changed


def main() -> None:
    n = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        if path.name in SKIP:
            continue
        n += process_file(path)
    print(f"blocks cleaned: {n}")


if __name__ == "__main__":
    main()
