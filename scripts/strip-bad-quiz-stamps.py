#!/usr/bin/env python3
"""Strip low-quality auto-expanded quiz distractor stamps from scalable-systems MDX."""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "scalable-systems"

# Cut from the first match of these substrings (case-insensitive) to end of choice.
CUT_MARKERS = [
    r" — which stops after",
    r" — which treats",
    r" — as if",
    r" — which does not explain the behavior",
    r" — which ignores the failure mode",
    r", judging languages by syntax length",
    r" judging languages by syntax length",
    r" — which stops after «",
    r"which stops after «",
    r"as if «",
    r"which treats «",
]

CUT_RES = [re.compile(p, re.I) for p in CUT_MARKERS]

# Collapse accidental duplicated trailing clauses.
DUP_RES = [
    re.compile(r"( — which stops after «[^»]+»[^—]*)(?:\s*\1)+", re.I),
    re.compile(r"( — which treats «[^»]+»[^—]*)(?:\s*\1)+", re.I),
    re.compile(r"( — as if «[^»]+»[^—]*)(?:\s*\1)+", re.I),
    re.compile(
        r"(judging languages by syntax length instead of by how well the data model fits the query)"
        r"(?:\s*,?\s*\1)+",
        re.I,
    ),
]


def parse_js_string(s: str, i: int) -> tuple[str, int]:
    assert s[i] == "'"
    i += 1
    out: list[str] = []
    while i < len(s):
        ch = s[i]
        if ch == "\\":
            mapping = {"n": "\n", "t": "\t", "'": "'", '"': '"', "\\": "\\"}
            out.append(mapping.get(s[i + 1], s[i + 1]))
            i += 2
            continue
        if ch == "'":
            return "".join(out), i + 1
        out.append(ch)
        i += 1
    raise ValueError("unclosed")


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def clean_choice(text: str) -> str:
    t = text.strip()
    for rx in DUP_RES:
        t = rx.sub(r"\1", t)
    changed = True
    while changed:
        changed = False
        for rx in CUT_RES:
            m = rx.search(t)
            if m:
                t = t[: m.start()].rstrip(" —-,").strip()
                changed = True
                break
    # Drop dangling guillemet fragments
    t = re.sub(r"\s*«[^»]*»?\s*$", "", t).strip()
    t = re.sub(r"\s{2,}", " ", t)
    return t


def process_file(path: pathlib.Path) -> int:
    text = path.read_text(encoding="utf-8")
    if "choices:" not in text:
        return 0
    out: list[str] = []
    i = 0
    n_changed = 0
    while i < len(text):
        if text.startswith("choices:", i):
            # copy through 'choices: ['
            m = re.match(r"choices:\s*\[", text[i:])
            if not m:
                out.append(text[i])
                i += 1
                continue
            out.append(text[i : i + m.end()])
            i += m.end()
            choices: list[str] = []
            while i < len(text):
                while i < len(text) and text[i] in " \t\r\n,":
                    i += 1
                if i < len(text) and text[i] == "]":
                    cleaned = [clean_choice(c) for c in choices]
                    if cleaned != choices:
                        n_changed += sum(1 for a, b in zip(cleaned, choices) if a != b)
                    block = ",\n".join(f"        '{js_escape(c)}'" for c in cleaned)
                    out.append(f"\n{block},\n      ")
                    out.append("]")
                    i += 1
                    break
                if i >= len(text) or text[i] != "'":
                    # abort unusual structure: emit rest raw
                    out.append(text[i:])
                    i = len(text)
                    break
                val, i = parse_js_string(text, i)
                choices.append(val)
            continue
        out.append(text[i])
        i += 1
    new_text = "".join(out)
    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
    return n_changed


def main() -> int:
    total = 0
    for path in sorted(ROOT.rglob("*.mdx")):
        n = process_file(path)
        if n:
            print(f"{path.relative_to(ROOT.parent.parent)}: cleaned {n} choices")
            total += n
    print(f"total cleaned choices: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
