#!/usr/bin/env python3
"""Remove repeated auto-balance stamp phrases inside quiz choices."""
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
    pathlib.Path(__file__).parent.parent / "fundamentals" / "scalable-systems"
)
SKIP = {"02-hash-indexes-and-lsm-trees.mdx"}

STAMPS = [
    ", which does not explain the behavior the question is asking about",
    ", judging languages by syntax length instead of by how well the data model fits the query",
    " — which stops after «",
    " — which treats «",
    " — as if «",
    " — which misses the invariant the question is targeting",
    " — which swaps two mechanisms the design keeps separate",
    " — which ignores the failure mode named in the prompt",
    " — which misidentifies the mechanism under discussion",
    " — which conflates two separate design concerns",
    " — which ignores the failure mode the prompt names",
]


def dedupe_stamp(s: str, stamp: str) -> str:
    while stamp + stamp in s:
        s = s.replace(stamp + stamp, stamp)
    # keep first stamp only
    if s.count(stamp) > 1:
        first = s.find(stamp)
        rest = s[first + len(stamp) :]
        rest = rest.replace(stamp, "")
        s = s[: first + len(stamp)] + rest
    return s


def clean_choice(s: str) -> str:
    out = s
    for stamp in STAMPS:
        if stamp.startswith(" — which stops"):
            out = re.sub(r" — which stops after «[^»]*»?[^'\"]*", "", out)
        elif stamp.startswith(" — which treats"):
            out = re.sub(r" — which treats «[^»]*»?[^'\"]*", "", out)
        elif stamp.startswith(" — as if"):
            out = re.sub(r" — as if «[^»]*»?[^'\"]*", "", out)
        elif stamp.startswith(" — which mis") or stamp.startswith(" — which conflates") or stamp.startswith(" — which ignores the failure mode the prompt"):
            out = out.replace(stamp, "")
        else:
            out = dedupe_stamp(out, stamp)
    return re.sub(r"\s+", " ", out).strip(" ,;")


def main() -> None:
    n = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        if path.name in SKIP:
            continue
        text = path.read_text(encoding="utf-8")
        pos = 0
        changed = False
        while True:
            found = fq.find_choices_block(text, pos)
            if not found:
                break
            c_start, c_end, choices = found
            new_choices = [clean_choice(c) for c in choices]
            if new_choices != choices:
                block = "choices: [\n" + ",\n".join(
                    f"        '{fq.js_escape(c)}'" for c in new_choices
                ) + ",\n      ]"
                text = text[:c_start] + block + text[c_end:]
                changed = True
                pos = c_start + len(block)
            else:
                ans = fq.find_answer(text, c_end)
                pos = ans[1] if ans else c_end
        if changed:
            path.write_text(text, encoding="utf-8", newline="\n")
            n += 1
    print(f"files cleaned: {n}")


if __name__ == "__main__":
    main()
