#!/usr/bin/env python3
"""Pad short MultipleChoice distractors in distributed-data (parser-safe)."""

from __future__ import annotations

import hashlib
import pathlib
import re
import sys

ROOT = (
    pathlib.Path(__file__).resolve().parents[1]
    / "fundamentals"
    / "scalable-systems"
    / "distributed-data"
)

FILLER = re.compile(
    r",?\s*which does not explain the behavior the question is asking about\.?$",
    re.I,
)

EXTRA = [
    "A stalled follower could still block every write if you treated that model as synchronous end-to-end.",
    "Partial failures would still surface as ambiguous timeouts without the retry rules the chapter develops.",
    "That account ignores replication lag between partitions that replicate on independent timelines.",
    "It presumes one global commit instant even when leaders fail over with unreplicated writes.",
    "Transport delivery would be mistaken for application-level completion before handlers finish.",
    "Unanimous votes would be required on every step, recreating classic two-phase-commit blocking.",
    "Clock skew would be harmless under that story, contradicting later timestamp ordering limits.",
    "A single hot key would still land on one hash partition no matter how many clients hammer it.",
    "Scatter/gather would still be required for every secondary-index lookup under that design.",
    "Stale leaders could keep issuing writes without fencing tokens or epoch checks.",
]


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def parse_js_string(s: str, i: int) -> tuple[str, int]:
    assert s[i] == "'"
    i += 1
    out: list[str] = []
    while i < len(s):
        ch = s[i]
        if ch == "\\":
            out.append(s[i + 1])
            i += 2
            continue
        if ch == "'":
            return "".join(out), i + 1
        out.append(ch)
        i += 1
    raise ValueError("unclosed")


def find_choices(text: str, start: int):
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
        if text[i] != "'":
            return None
        val, i = parse_js_string(text, i)
        choices.append(val)
    return None


def find_answer(text: str, after: int):
    m = re.search(r"answer:\s*(\d+)", text[after : after + 200])
    return int(m.group(1)) if m else None


def grow(wrong: str, min_len: int, key: str, idx: int) -> str:
    base = FILLER.sub("", wrong.strip())
    if len(base) >= min_len:
        return base
    if base and base[-1] not in ".!?":
        base += "."
    h = hashlib.sha256(f"{key}:{idx}".encode()).hexdigest()
    out = base
    n = 0
    while len(out) < min_len and n < 12:
        ext = EXTRA[(int(h[2 * n : 2 * n + 8], 16) + idx + n) % len(EXTRA)]
        out = f"{out} {ext}".strip()
        n += 1
    return out


def process(path: pathlib.Path) -> int:
    text = path.read_text(encoding="utf-8")
    sites = []
    pos = 0
    qn = 0
    while True:
        found = find_choices(text, pos)
        if not found:
            break
        c_start, c_end, choices = found
        ans = find_answer(text, c_end)
        if not ans or len(choices) < 2:
            pos = c_end
            continue
        qn += 1
        sites.append((c_start, c_end, choices, ans, qn))
        pos = c_end

    new_text = text
    nq = 0
    for c_start, c_end, choices, answer, qn in reversed(sites):
        lens = [len(c) for c in choices]
        cl = lens[answer]
        max_other = max(l for i, l in enumerate(lens) if i != answer)
        if cl - max_other < 35:
            continue
        min_len = max(int(cl * 0.9), cl - 35)
        rebuilt = []
        for i, c in enumerate(choices):
            if i == answer:
                rebuilt.append(c)
            else:
                rebuilt.append(grow(c, min_len, f"{path.name}:{qn}", i))
        if rebuilt == choices:
            continue
        js = ",\n".join(f"        '{js_escape(c)}'" for c in rebuilt)
        block = f"choices: [\n{js},\n      ]"
        new_text = new_text[:c_start] + block + new_text[c_end:]
        nq += 1
    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
    return nq


def main() -> int:
    t = sum(process(p) or 0 for p in sorted(ROOT.glob("*.mdx")))
    print("questions updated:", t)
    return 0


if __name__ == "__main__":
    sys.exit(main())