#!/usr/bin/env python3
"""Reshuffle MultipleChoice answers under computer-engineering (OS / OSTEP).

Shuffles authored answer indices for an even distribution per file.
Does not bolt filler suffixes onto distractors (those create a new tell).
"""

from __future__ import annotations

import hashlib
import pathlib
import random
import re
import sys

# Reuse scalable-systems helpers by importing the sibling module's logic inline.
ROOT = pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "computer-engineering"


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def parse_js_string(s: str, i: int) -> tuple[str, int]:
    assert s[i] == "'"
    i += 1
    out: list[str] = []
    while i < len(s):
        ch = s[i]
        if ch == "\\":
            if i + 1 >= len(s):
                raise ValueError("dangling escape")
            nxt = s[i + 1]
            mapping = {"n": "\n", "t": "\t", "'": "'", '"': '"', "\\": "\\"}
            out.append(mapping.get(nxt, nxt))
            i += 2
            continue
        if ch == "'":
            return "".join(out), i + 1
        out.append(ch)
        i += 1
    raise ValueError("unclosed string")


def find_choices_block(text: str, start: int) -> tuple[int, int, list[str]] | None:
    m = re.search(r"choices:\s*\[", text[start:])
    if not m:
        return None
    abs_start = start + m.start()
    i = start + m.end()
    choices: list[str] = []
    while i < len(text):
        while i < len(text) and text[i] in " \t\r\n,":
            i += 1
        if i < len(text) and text[i] == "]":
            return abs_start, i + 1, choices
        if i >= len(text) or text[i] != "'":
            return None
        val, i = parse_js_string(text, i)
        choices.append(val)
    return None


def find_answer(text: str, after: int) -> tuple[int, int, int] | None:
    m = re.search(r"answer:\s*(\d+)", text[after : after + 200])
    if not m:
        return None
    return after + m.start(), after + m.end(), int(m.group(1))


def seeded_rng(prompt_hint: str, file_key: str) -> random.Random:
    h = hashlib.sha256(f"{file_key}::{prompt_hint}::os-v1".encode()).hexdigest()
    return random.Random(int(h[:16], 16))


def extract_prompt_nearby(text: str, choices_start: int) -> str:
    window = text[max(0, choices_start - 400) : choices_start]
    m = re.search(r"prompt:\s*'((?:\\'|[^'])*)'\s*,\s*$", window, re.S)
    if m:
        return m.group(1)
    return window[-80:]


def process_file(path: pathlib.Path) -> tuple[int, dict[int, int]]:
    text = path.read_text(encoding="utf-8")
    if "choices:" not in text or "answer:" not in text:
        return 0, {}

    sites = []
    pos = 0
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
        sites.append((c_start, c_end, a_start, a_end, choices, answer))
        pos = a_end

    if not sites:
        return 0, {}

    # Spread targets across choice indices for this file.
    targets = [i % len(s[4]) for i, s in enumerate(sites)]

    new_text = text
    dist: dict[int, int] = {}
    for (c_start, c_end, a_start, a_end, choices, answer), target in zip(
        reversed(sites), reversed(targets)
    ):
        prompt_hint = extract_prompt_nearby(text, c_start)
        rng = seeded_rng(prompt_hint, str(path.as_posix()))
        correct_text = choices[answer]
        others = [c for i, c in enumerate(choices) if i != answer]
        rng.shuffle(others)
        new_choices = list(others)
        new_choices.insert(min(target, len(new_choices)), correct_text)
        actual = new_choices.index(correct_text)

        choices_js = ",\n".join(f"        '{js_escape(c)}'" for c in new_choices)
        choices_block = f"choices: [\n{choices_js},\n      ]"
        new_text = new_text[:a_start] + f"answer: {actual}" + new_text[a_end:]
        new_text = new_text[:c_start] + choices_block + new_text[c_end:]
        dist[actual] = dist.get(actual, 0) + 1

    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
    return len(sites), dist


def main() -> int:
    totals: dict[int, int] = {}
    qcount = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        n, dist = process_file(path)
        if n:
            qcount += n
            for k, v in dist.items():
                totals[k] = totals.get(k, 0) + v
            print(f"{path.relative_to(ROOT.parent.parent)}: {n} questions")
    print("---")
    print(f"questions updated: {qcount}")
    print("new answer distribution:", dict(sorted(totals.items())))
    return 0


if __name__ == "__main__":
    sys.exit(main())
