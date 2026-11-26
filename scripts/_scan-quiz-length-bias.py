#!/usr/bin/env python3
"""Report MultipleChoice questions where the correct option is uniquely longest."""

from __future__ import annotations

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


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
    if not m:
        return None
    return after + m.end(), int(m.group(1))


def scan(root: pathlib.Path, gap_min: int = 40):
    rows = []
    for path in sorted(root.rglob("*.mdx")):
        text = path.read_text(encoding="utf-8")
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
            _, answer = ans
            if answer < 0 or answer >= len(choices):
                pos = c_end
                continue
            qn += 1
            lens = [len(c) for c in choices]
            cl = lens[answer]
            others = [l for i, l in enumerate(lens) if i != answer]
            max_other = max(others)
            avg_other = sum(others) / len(others)
            uniquely = cl > max_other
            gap = cl - max_other
            ratio = cl / max(avg_other, 1)
            rows.append(
                {
                    "path": path,
                    "qn": qn,
                    "answer": answer,
                    "cl": cl,
                    "max_other": max_other,
                    "min_other": min(others),
                    "gap": gap,
                    "ratio": ratio,
                    "uniquely": uniquely,
                    "correct": choices[answer],
                    "choices": choices,
                }
            )
            pos = ans[0]
    return rows


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--root",
        default="fundamentals/scalable-systems",
        help="Relative path under repo root",
    )
    ap.add_argument("--gap", type=int, default=40)
    ap.add_argument("--section", default="", help="Substring filter on path")
    args = ap.parse_args()
    root = ROOT / args.root
    rows = scan(root, args.gap)
    if args.section:
        rows = [r for r in rows if args.section in r["path"].as_posix()]

    total = len(rows)
    uniq = [r for r in rows if r["uniquely"]]
    bad = [r for r in uniq if r["gap"] >= args.gap]
    print(f"root={args.root} questions={total}")
    print(f"correct uniquely longest: {len(uniq)} ({100 * len(uniq) / max(total, 1):.1f}%)")
    print(f"uniquely longest with gap>={args.gap}: {len(bad)}")

    from collections import defaultdict

    sec: dict[str, list[int]] = defaultdict(lambda: [0, 0, 0])
    for r in rows:
        parts = r["path"].relative_to(root).parts
        key = parts[0] if parts else "?"
        sec[key][0] += 1
        if r["uniquely"]:
            sec[key][1] += 1
        if r["uniquely"] and r["gap"] >= args.gap:
            sec[key][2] += 1
    print("--- section: total / uniq-longest / gap>={} ---".format(args.gap))
    for k, v in sorted(sec.items()):
        print(f"{k}: {v[0]} / {v[1]} / {v[2]}")

    print("--- worst offenders ---")
    for r in sorted(bad, key=lambda x: -x["gap"])[:50]:
        rel = r["path"].relative_to(ROOT)
        preview = r["correct"].replace("\n", " ")[:70]
        print(
            f"gap={r['gap']:3d} ratio={r['ratio']:.2f} q#{r['qn']} ans={r['answer']} "
            f"{rel} :: {preview}..."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
