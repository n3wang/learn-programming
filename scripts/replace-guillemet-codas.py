#!/usr/bin/env python3
"""Replace guillemet topic_detail codas with shorter unique clauses."""
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

GUILLEMET_RES = [
    re.compile(
        r" — which stops after «[^»]+» and never reaches the mechanism under discussion"
    ),
    re.compile(
        r" — which treats «[^»]+» as sufficient without the coordinating step the question names"
    ),
    re.compile(
        r" — as if «[^»]+» alone replaced the structure the design actually adds"
    ),
    re.compile(r" — which misses the invariant the question is targeting"),
    re.compile(r" — which swaps two mechanisms the design keeps separate"),
    re.compile(r" — which ignores the failure mode named in the prompt"),
]

REPLACEMENTS = [
    " — which misidentifies the mechanism under discussion",
    " — which conflates two separate design concerns",
    " — which ignores the failure mode the prompt names",
]


def clean(s: str, idx: int) -> str:
    out = s
    for rx in GUILLEMET_RES:
        out = rx.sub(REPLACEMENTS[idx % len(REPLACEMENTS)], out, count=1)
    return re.sub(r"\s+", " ", out).strip()


def main() -> None:
    n = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        if path.name in SKIP:
            continue
        text = path.read_text(encoding="utf-8")
        pos = 0
        wi = 0
        changed = False
        while True:
            found = fq.find_choices_block(text, pos)
            if not found:
                break
            c_start, c_end, choices = found
            ans = fq.find_answer(text, c_end)
            new_choices = []
            local_wi = 0
            for i, c in enumerate(choices):
                if ans and i == ans[2]:
                    new_choices.append(c)
                else:
                    new_choices.append(clean(c, local_wi))
                    local_wi += 1
            if new_choices != choices:
                block = "choices: [\n" + ",\n".join(
                    f"        '{fq.js_escape(c)}'" for c in new_choices
                ) + ",\n      ]"
                text = text[:c_start] + block + text[c_end:]
                changed = True
                pos = c_start + len(block)
            else:
                pos = ans[1] if ans else c_end
        if changed:
            path.write_text(text, encoding="utf-8", newline="\n")
            n += 1
    print(f"files updated: {n}")


if __name__ == "__main__":
    main()
