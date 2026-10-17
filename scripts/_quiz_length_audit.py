#!/usr/bin/env python3
"""Audit MultipleChoice option length imbalance."""
import importlib.util
import json
import pathlib

spec = importlib.util.spec_from_file_location(
    "fq", pathlib.Path(__file__).parent / "fix-scalable-quiz-bias.py"
)
fq = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fq)

ROOT = pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "scalable-systems"
DIRS = [
    "designing-data-intensive-applications",
    "derived-data",
    "distributed-data",
    "distributed-systems",
]
skip_files = {"02-hash-indexes-and-lsm-trees.mdx"}

bad_questions = []
total = 0

for d in DIRS:
    for path in sorted((ROOT / d).glob("*.mdx")):
        if d == "designing-data-intensive-applications" and path.name in skip_files:
            continue
        text = path.read_text(encoding="utf-8")
        pos = 0
        qn = 0
        while True:
            found = fq.find_choices_block(text, pos)
            if not found:
                break
            c_start, c_end, choices = found
            ans = fq.find_answer(text, c_end)
            if not ans or len(choices) < 2:
                pos = c_end
                continue
            _, _, answer = ans
            total += 1
            qn += 1
            correct = choices[answer]
            L = len(correct)
            wrongs = []
            for i, c in enumerate(choices):
                if i == answer:
                    continue
                ratio = len(c) / L if L else 0
                if ratio < 0.8 or ratio > 1.2:
                    wrongs.append({"idx": i, "len": len(c), "ratio": round(ratio, 2), "text": c})
            if wrongs:
                bad_questions.append(
                    {
                        "file": str(path.relative_to(ROOT.parent.parent)),
                        "q": qn,
                        "answer": answer,
                        "correct_len": L,
                        "correct": correct,
                        "wrongs": wrongs,
                    }
                )
            pos = ans[1]

print("total questions", total)
print("questions needing work", len(bad_questions))
out = pathlib.Path(__file__).parent / "_quiz_length_audit.json"
out.write_text(json.dumps(bad_questions, indent=2), encoding="utf-8")
print("wrote", out)
