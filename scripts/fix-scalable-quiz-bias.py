#!/usr/bin/env python3
"""Reshuffle MultipleChoice answers and balance option lengths under scalable-systems.

Idempotent enough to re-run: strips prior auto-filler suffixes first, then
reshuffles for an even answer distribution and lengthens short distractors
with varied, claim-specific wording (no shared boilerplate tell).
"""

from __future__ import annotations

import hashlib
import pathlib
import random
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "scalable-systems"

# Prior run's bolted-on suffixes — remove before rebuilding.
OLD_FILLER_RES = [
    re.compile(
        r" — which is why experienced teams usually treat this as the default production strategy"
        r"(?:, rather than the approach the lesson actually develops)?$"
    ),
    re.compile(
        r" — so the lesson's mechanism would be unnecessary if this were how real systems worked"
        r"(?:, rather than the approach the lesson actually develops)?$"
    ),
    re.compile(
        r" — making the usual trade-offs described in the text largely irrelevant in practice"
        r"(?:, rather than the approach the lesson actually develops)?$"
    ),
    re.compile(
        r" — and therefore this alone would fully explain the behavior without any other factors"
        r"(?:, rather than the approach the lesson actually develops)?$"
    ),
    re.compile(
        r" — a design that would remove the need for the techniques covered in this section"
        r"(?:, rather than the approach the lesson actually develops)?$"
    ),
    re.compile(r", rather than the approach the lesson actually develops$"),
]

# Each expander keeps the original wrong claim and adds a distinct coda.
# Codas must stay varied within a question so no shared "wrong-option stamp."
EXPANDERS = [
    "{claim} — but that would erase the I/O and durability costs this lesson focuses on.",
    "{claim} — a reading that makes the rest of the section look unnecessary, which is a warning sign.",
    "{claim} — it feels simpler on paper, yet it never explains the actual read/write path.",
    "{claim} — if that were the whole story, none of the machinery in this chapter would exist.",
    "{claim} — tempting under light demos, but it conflicts with the constraints the text argues for.",
    "{claim} — treat it as a misconception: production bottlenecks show up somewhere else.",
    "{claim} — that account skips the failure modes and trade-offs developed here.",
    "{claim} — plausible at first glance, wrong once you compare it to the mechanism in the lesson.",
]


def js_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def strip_old_fillers(s: str) -> str:
    out = s
    changed = True
    while changed:
        changed = False
        for rx in OLD_FILLER_RES:
            nxt = rx.sub("", out)
            if nxt != out:
                out = nxt
                changed = True
    return out.strip()


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


# Recover the original short claim from earlier auto-expanded wording.
OLD_WRAPPER_RES = [
    re.compile(
        r"^That story says (.+) — a neat simplification, but it does not match how "
        r"these systems actually spend time or manage state\.$"
    ),
    re.compile(
        r"^If it were true that (.+), the designs in this lesson would be pointless; "
        r"real engines behave differently under the workloads that matter\.$"
    ),
    re.compile(
        r"^One tempting misconception is that (.+)\. That sounds tidy, yet it fails "
        r"once you look at the read/write path the text actually describes\.$"
    ),
    re.compile(
        r"^You might conclude that (.+), and stop there\. Production systems show "
        r"the opposite constraint, which is why the lesson emphasizes a different mechanism\.$"
    ),
    re.compile(
        r"^A common wrong intuition is that (.+)\. It feels simpler, but it does not "
        r"explain the costs, failure modes, or trade-offs covered here\.$"
    ),
    re.compile(
        r"^Suppose (.+)\. Then none of the indexing or replication machinery in this "
        r"section would be needed — which is exactly why that reading is incorrect\.$"
    ),
    # v3 glued forms / v4 em-dash codas
    re.compile(
        r"^(.+?)\s+Tempting, yet it conflicts with the workload constraints and "
        r"design choices the text actually argues for\.$"
    ),
    re.compile(
        r"^(.+?)\s+That reading would make the rest of the section unnecessary, which "
        r"is a sign it misses how production engines actually behave\.$"
    ),
    re.compile(
        r"^(.+?)\s+It feels simpler on paper, but it does not explain the read/write "
        r"path, failure modes, or trade-offs covered here\.$"
    ),
    re.compile(
        r"^(.+?)\s+If that were the whole story, teams would not bother with the "
        r"structures and protocols developed in this chapter\.$"
    ),
    re.compile(
        r"^(.+?)\s+Treat that as a misconception: real systems hit different bottlenecks "
        r"than that story predicts\.$"
    ),
    re.compile(
        r"^(.+?) — a neat-sounding shortcut that would erase the real costs and "
        r"mechanisms this lesson spends time on\.$"
    ),
    re.compile(r"^(.+?) — but that would erase the I/O and durability costs this lesson focuses on\.$"),
    re.compile(
        r"^(.+?) — a reading that makes the rest of the section look unnecessary, which is a warning sign\.$"
    ),
    re.compile(r"^(.+?) — it feels simpler on paper, yet it never explains the actual read/write path\.$"),
    re.compile(
        r"^(.+?) — if that were the whole story, none of the machinery in this chapter would exist\.$"
    ),
    re.compile(
        r"^(.+?) — tempting under light demos, but it conflicts with the constraints the text argues for\.$"
    ),
    re.compile(
        r"^(.+?) — treat it as a misconception: production bottlenecks show up somewhere else\.$"
    ),
    re.compile(r"^(.+?) — that account skips the failure modes and trade-offs developed here\.$"),
    re.compile(
        r"^(.+?) — plausible at first glance, wrong once you compare it to the mechanism in the lesson\.$"
    ),
    re.compile(r"^(.+?) The lesson's correct account points somewhere else\.$"),
    re.compile(r"^(.+?) Compare that claim against the concrete mechanism in the text\.$"),
]


def unwrap_claim(wrong: str) -> str:
    s = strip_old_fillers(wrong).strip()
    for rx in OLD_WRAPPER_RES:
        m = rx.match(s)
        if m:
            claim = m.group(1).strip()
            # Undo mid-sentence lowercasing from the previous pass.
            if claim and claim[0].islower():
                claim = claim[0].upper() + claim[1:]
            if not claim.endswith("."):
                # Keep original punctuation style of short distractors (often no period).
                pass
            return claim
    return s


CODA_MARKERS = (
    "that account skips",
    "neat-sounding shortcut",
    "tempting under light demos",
    "it feels simpler on paper",
    "if that were the whole story",
    "treat it as a misconception",
    "a reading that makes the rest",
    "but that would erase the i/o",
    "plausible at first glance",
    "compare that claim against",
    "the lesson's correct account",
    "a design that would remove the need",
    "which is why experienced teams",
    "so the lesson's mechanism would be unnecessary",
    "making the usual trade-offs described",
    "and therefore this alone would fully explain",
)


def normalize_claim(claim: str) -> str:
    c = claim.strip()
    # Drop trailing expander residue if a previous run glued poorly.
    c = re.sub(
        r"\s+(Tempting, yet|That reading|Treat that|It feels simpler|If that were).*$",
        "",
        c,
    ).strip()
    lower = c.lower()
    for marker in CODA_MARKERS:
        idx = lower.find(marker)
        if idx == -1:
            continue
        # Prefer cutting at the em dash / hyphen before the marker.
        cut = c.rfind(" — ", 0, idx)
        if cut == -1:
            cut = c.rfind(" - ", 0, idx)
        if cut == -1:
            cut = idx
        c = c[:cut].rstrip(" —-").strip()
        lower = c.lower()
    return c


def lengthen_wrong(wrong: str, target: int, expander: str) -> str:
    base = normalize_claim(unwrap_claim(wrong))
    if len(base) >= int(target * 0.92):
        return base
    claim = base
    # Em-dash expanders already include punctuation between claim and coda.
    expanded = expander.format(claim=claim)
    expanded = re.sub(r"\s+", " ", expanded).strip()
    expanded = expanded.replace(" — — ", " — ")
    if len(expanded) < int(target * 0.75):
        expanded += " Compare that claim against the concrete mechanism in the text."
    return expanded


def clean_choices(choices: list[str], answer: int, rng: random.Random) -> list[str]:
    """Strip prior auto-expansions only. Length balance is left to authors —
    bolted-on codas create a new 'wrong option' tell."""
    del rng  # kept in signature for call-site stability
    return [normalize_claim(unwrap_claim(c)) for c in choices]


def seeded_rng(prompt_hint: str, file_key: str) -> random.Random:
    h = hashlib.sha256(f"{file_key}::{prompt_hint}::v6".encode()).hexdigest()
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

    targets = [i % len(s[4]) for i, s in enumerate(sites)]

    new_text = text
    dist: dict[int, int] = {}
    for (c_start, c_end, a_start, a_end, choices, answer), target in zip(
        reversed(sites), reversed(targets)
    ):
        prompt_hint = extract_prompt_nearby(text, c_start)
        rng = seeded_rng(prompt_hint, str(path.as_posix()))
        balanced = clean_choices(choices, answer, rng)
        correct_text = balanced[answer]
        others = [c for i, c in enumerate(balanced) if i != answer]
        rng.shuffle(others)
        new_choices = list(others)
        new_choices.insert(min(target, len(new_choices)), correct_text)
        # Recompute actual index in case insert edge cases
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
