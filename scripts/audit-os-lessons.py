#!/usr/bin/env python3
"""Audit computer-engineering (OS) lessons against lesson-components rule."""
import collections
import pathlib
import re

root = pathlib.Path("fundamentals/computer-engineering")
files = sorted(root.rglob("*.mdx"))
print("mdx_files", len(files))

answers = collections.Counter()
longest_unique = 0
total_q = 0
no_set_multi = []
direct_imports = []
mc_files = 0
ce_files = 0
es_files = 0
per_file_answers = []


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


for f in files:
    text = f.read_text(encoding="utf-8")
    rel = str(f.relative_to(root)).replace("\\", "/")
    if re.search(
        r"""import\s+.+\s+from\s+['\"]@site/src/components/interactive""",
        text,
    ):
        direct_imports.append(rel)
    n_mc = len(re.findall(r"<MultipleChoice\b", text))
    n_ce = len(re.findall(r"<CodeExercise\b|<CodingExam\b", text))
    n_es = len(re.findall(r"<ExerciseSet\b", text))
    if n_mc:
        mc_files += 1
    if n_ce:
        ce_files += 1
    if n_es:
        es_files += 1
    if n_ce >= 2 and n_es == 0:
        no_set_multi.append((rel, n_ce))

    file_answers = collections.Counter()
    pos = 0
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
        if ans >= len(choices):
            continue
        total_q += 1
        answers[ans] += 1
        file_answers[ans] += 1
        lens = [len(c) for c in choices]
        cl = lens[ans]
        if cl == max(lens) and lens.count(max(lens)) == 1:
            longest_unique += 1
    if sum(file_answers.values()) >= 3:
        # flag files where one index owns >= 60% of answers
        total = sum(file_answers.values())
        top_idx, top_n = file_answers.most_common(1)[0]
        if top_n / total >= 0.6:
            per_file_answers.append((rel, total, dict(file_answers), top_idx, top_n))

print("MultipleChoice files", mc_files)
print("CodeExercise files", ce_files)
print("ExerciseSet files", es_files)
print("quiz total", total_q, "answers", dict(sorted(answers.items())))
if total_q:
    print(
        "unique_longest_correct",
        longest_unique,
        f"{100 * longest_unique / total_q:.1f}%",
    )
print("direct_interactive_imports", len(direct_imports))
for x in direct_imports:
    print("  import", x)
print("multi_CodeExercise_no_ExerciseSet", len(no_set_multi))
for rel, n in no_set_multi:
    print(f"  {n} exercises: {rel}")
print("biased_files (>=60% same answer index, n>=3)", len(per_file_answers))
for rel, total, dist, top_idx, top_n in sorted(
    per_file_answers, key=lambda x: -x[4] / x[1]
):
    print(f"  {top_n}/{total} answer={top_idx}: {rel} {dist}")
