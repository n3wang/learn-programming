#!/usr/bin/env python3
"""List remaining unique-longest-correct quizzes under computer-engineering."""
import pathlib
import re

root = pathlib.Path("fundamentals/computer-engineering")


def parse_js_string(s, i):
    assert s[i] == "'"
    i += 1
    out = []
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


def find_choices(text, start):
    m = re.search(r"choices:\s*\[", text[start:])
    if not m:
        return None
    i = start + m.end()
    choices = []
    while i < len(text):
        while i < len(text) and text[i] in " \t\r\n,":
            i += 1
        if i < len(text) and text[i] == "]":
            return choices, i + 1
        if text[i] != "'":
            return None
        val, i = parse_js_string(text, i)
        choices.append(val)
    return None


rows = []
for f in sorted(root.rglob("*.mdx")):
    text = f.read_text(encoding="utf-8")
    rel = str(f.relative_to(root)).replace("\\", "/")
    pos = 0
    q = 0
    while True:
        found = find_choices(text, pos)
        if not found:
            break
        choices, end = found
        am = re.search(r"answer:\s*(\d+)", text[end : end + 80])
        if not am:
            pos = end
            continue
        ans = int(am.group(1))
        pos = end + am.end()
        q += 1
        if ans >= len(choices):
            continue
        lens = [len(c) for c in choices]
        if lens[ans] == max(lens) and lens.count(max(lens)) == 1:
            # mild if within 25% of second longest
            others = sorted(lens)[-2]
            mild = others >= int(lens[ans] * 0.75)
            prompt = ""
            window = text[max(0, end - 500) : end]
            pm = re.search(r"prompt:\s*'((?:\\'|[^'])*)'", window)
            if pm:
                prompt = pm.group(1)[:70]
            rows.append((rel, q, mild, lens[ans], others, prompt))

mild_n = sum(1 for r in rows if r[2])
print(f"remaining unique-longest: {len(rows)} (mild gap ~25%: {mild_n})")
for rel, q, mild, cl, ol, prompt in rows:
    tag = "mild" if mild else "gap"
    print(f"  [{tag}] {rel} q{q} correct={cl} 2nd={ol} | {prompt}")
