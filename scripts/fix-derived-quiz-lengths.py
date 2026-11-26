#!/usr/bin/env python3
"""Balance derived-data MultipleChoice: strip auto-filler, length-pad distractors."""
from __future__ import annotations

import importlib.util
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "fundamentals/scalable-systems/derived-data"
GAP = 40

_fz_path = pathlib.Path(__file__).resolve().parent / "fix-scalable-quiz-bias.py"
_spec = importlib.util.spec_from_file_location("fix_scalable_quiz_bias", _fz_path)
assert _spec and _spec.loader
fz = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(fz)

EXTRA_PADS = [
    " Concurrent clients can still observe different final values when no shared leader orders commits.",
    " The divergence still appears when both systems return success and no error is logged anywhere.",
    " Retries and idempotent handlers do not retroactively serialize independent write paths.",
    " Network timing can still reverse perceived commit order across separate storage engines.",
    " A slow consumer and a fast consumer on the same log still advance independent offset cursors.",
    " Materialized views that lag do not automatically heal mismatches with the authoritative source.",
]


def balance_choices(choices: list[str], answer: int, salt: int) -> list[str]:
    balanced = [fz.normalize_claim(fz.unwrap_claim(c)) for c in choices]
    # Strip legacy quiz filler phrase if any survived unwrap.
    for i, t in enumerate(balanced):
        balanced[i] = t.replace(
            ", which does not explain the behavior the question is asking about", ""
        ).replace(
            " which does not explain the behavior the question is asking about", ""
        )
    cl = len(balanced[answer])
    wrong_i = [i for i in range(len(balanced)) if i != answer]
    pi = 0
  # pylint: disable=invalid-name
    mo = max(len(balanced[i]) for i in wrong_i)
    while cl > mo and cl - mo >= GAP:
        wi = max(wrong_i, key=lambda i: len(balanced[i]))
        balanced[wi] = balanced[wi].rstrip(".") + "." + EXTRA_PADS[(salt + pi) % len(EXTRA_PADS)]
        pi += 1
        mo = max(len(balanced[i]) for i in wrong_i)
    return balanced


def process_file(path: pathlib.Path) -> int:
    text = path.read_text(encoding="utf-8")
    if "choices:" not in text:
        return 0
    sites: list[tuple[int, int, int, list[str], int]] = []
    pos = 0
    qn = 0
    while True:
        found = fz.find_choices_block(text, pos)
        if not found:
            break
        c_start, c_end, choices = found
        ans = fz.find_answer(text, c_end)
        if not ans:
            pos = c_end
            continue
        _, a_end, answer = ans
        if answer < 0 or answer >= len(choices):
            pos = c_end
            continue
        qn += 1
        sites.append((c_start, c_end, answer, choices, qn))
        pos = a_end

    new_text = text
    for c_start, c_end, answer, choices, qn in reversed(sites):
        balanced = balance_choices(choices, answer, qn)
        block = "choices: [\n" + ",\n".join(f"        '{fz.js_escape(c)}'" for c in balanced) + ",\n      ]"
        new_text = new_text[:c_start] + block + new_text[c_end:]

    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
    return len(sites)


def main() -> int:
    n = sum(process_file(p) for p in sorted(ROOT.glob("*.mdx")))
    print("questions", n)
    return 0


if __name__ == "__main__":
    sys.exit(main())