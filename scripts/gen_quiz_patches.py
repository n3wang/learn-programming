#!/usr/bin/env python3
"""Emit patch candidates for imbalanced wrong options."""
import json
import pathlib

audit = json.loads(
    (pathlib.Path(__file__).parent / "_quiz_length_audit.json").read_text(encoding="utf-8")
)
for item in audit:
    for w in item["wrongs"]:
        if w["ratio"] >= 0.75:
            old = w["text"].replace("\\", "\\\\").replace("'", "\\'")
            need = int(item["correct_len"] * 0.85) - w["len"]
            print(f"    # {item['file']} q{item['q']} need ~{need} chars")
            print(f'    "{old}": "",')
