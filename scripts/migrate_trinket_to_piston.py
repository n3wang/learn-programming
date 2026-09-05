#!/usr/bin/env python3
"""Replace dead Trinket iframes with PistonRunner, using nearby code fences.

Collect all embeds first and replace from the end so earlier edits cannot
make the details+iframe regex skip into a later iframe.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TURTLE_IDS = {
    "553d685b05",
    "a4f2245773",
    "e35694aae3",
    "9d34972885",
    "7f899ec800",
    "7153a4c734",
    "f9fc67c57a",
    "62caae5597",
    "aced5f41ad",
    "a4b30cd75b",
    "1d7cd31485",
}
CANVAS_IDS = {"050b5b6826", "05705cf21d", "0407f93539"}
# Shared empty-canvas exercise embeds (no demo code in the page).
EMPTY_JAVA_IDS = {"6e661a677c"}

IFRAME_RE = re.compile(
    r'<iframe\s+[^>]*?src="https://trinket\.io/embed/(python3?|java)/([a-f0-9]+)[^"]*"[^>]*?>\s*</iframe>',
    re.IGNORECASE | re.DOTALL,
)

# Fence immediately before an embed — require a language tag so bare ``` lists
# (e.g. kaomoji catalogs) are not treated as runnable source.
FENCE_RE = re.compile(r"```(java|python|python3)\n(.*?)```", re.DOTALL | re.IGNORECASE)

TURTLE_NOTICE = """:::caution Canvas not available on Piston
This activity used **Trinket turtle / canvas** graphics. Piston runs text programs only, so the interactive drawing pad is gone.

Run turtle locally in Python (or Thonny / Mu) with the snippets above. Text I/O practice elsewhere on this page still uses **Piston**.
:::
"""

CANVAS_NOTICE = """:::caution Canvas game not available on Piston
This lab used a Trinket **canvas / game** embed (Sanic). Piston cannot host that UI.

Use the written steps and any screenshots on this page; rebuild the game locally if you still have a copy of the starter.
:::
"""


@dataclass
class Embed:
    start: int
    end: int
    lang: str
    tid: str
    iframe: str
    summary: str | None  # if wrapped in <details><summary>…</summary> … </details>


def wrap_java(body: str) -> str:
    body = body.strip("\n")
    if re.search(r"\b(class|public\s+class)\s+\w+", body):
        return body + ("\n" if not body.endswith("\n") else "")
    indented = "\n".join(("    " + line if line.strip() else line) for line in body.splitlines())
    return (
        "public class Main {\n"
        "  public static void main(String[] args) {\n"
        f"{indented}\n"
        "  }\n"
        "}\n"
    )


def wrap_python(body: str) -> str:
    body = body.strip("\n")
    return body + ("\n" if not body.endswith("\n") else "")


def nearest_lang_fence(text: str, pos: int) -> tuple[str, str] | None:
    best = None
    for m in FENCE_RE.finditer(text[:pos]):
        # Prefer a fence that ends near the embed (skip distant earlier samples).
        if pos - m.end() > 2500:
            continue
        best = ((m.group(1) or "").lower(), m.group(2))
    return best


def height_from_iframe(iframe: str) -> str:
    m = re.search(r'height="(\d+)"', iframe)
    if not m:
        return "320px"
    h = int(m.group(1))
    return f"{min(max(h, 220), 480)}px"


def empty_java_starter() -> str:
    return (
        "public class Main {\n"
        "  public static void main(String[] args) {\n"
        "    // TODO: write your program here\n"
        "    System.out.println(\"Hello\");\n"
        "  }\n"
        "}\n"
    )


def empty_python_starter() -> str:
    return '# TODO: write your program here\nprint("Hello")\n'


def piston_block(lang: str, code: str, height: str = "320px") -> str:
    if lang.startswith("python") or lang == "":
        piston_lang = "python"
        code = wrap_python(code)
    else:
        piston_lang = "java"
        code = wrap_java(code)
    code = code.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    return (
        f'<PistonRunner\n'
        f'  lang="{piston_lang}"\n'
        f'  interactive={{false}}\n'
        f'  height="{height}"\n'
        f'  code={{`{code}`}}\n'
        f'/>'
    )


def find_embeds(text: str) -> list[Embed]:
    embeds: list[Embed] = []
    for m in IFRAME_RE.finditer(text):
        lang = m.group(1).lower()
        if lang == "python3":
            lang = "python"
        tid = m.group(2)
        iframe = m.group(0)
        start, end = m.start(), m.end()
        summary = None

        # Expand to the immediately preceding <details>…</details> only.
        # Use rfind so we never span from an earlier details block (DOTALL +
        # non-greedy summary would otherwise stretch to the last </summary>).
        before = text[:start]
        after = text[end:]
        det_idx = before.lower().rfind("<details>")
        det = None
        if det_idx != -1:
            chunk = before[det_idx:]
            det = re.match(
                r"<details>\s*<summary>\s*(.*?)\s*</summary>\s*\Z",
                chunk,
                re.IGNORECASE | re.DOTALL,
            )
        close = re.match(r"\s*</details>", after, re.IGNORECASE)
        if det and close:
            summary = det.group(1).strip()
            start = det_idx
            end = end + close.end()

        embeds.append(
            Embed(
                start=start,
                end=end,
                lang=lang,
                tid=tid,
                iframe=iframe,
                summary=summary,
            )
        )
    return embeds


def body_for(embed: Embed, text: str) -> str:
    height = height_from_iframe(embed.iframe)
    if embed.tid in TURTLE_IDS:
        return TURTLE_NOTICE
    if embed.tid in CANVAS_IDS:
        return CANVAS_NOTICE
    if embed.tid in EMPTY_JAVA_IDS:
        return piston_block("java", empty_java_starter(), height)

    fence = nearest_lang_fence(text, embed.start)
    if fence and fence[1].strip():
        flang, code = fence
        use = flang if flang else embed.lang
        return piston_block(use, code, height)

    if embed.lang == "java":
        return piston_block("java", empty_java_starter(), height)
    return piston_block("python", empty_python_starter(), height)


def render(embed: Embed, body: str) -> str:
    if embed.summary is not None:
        return (
            f"<details>\n<summary>\n{embed.summary}\n</summary>\n\n"
            f"{body}\n\n</details>"
        )
    return body


def migrate_file(path: Path) -> int:
    original = path.read_text(encoding="utf-8")
    embeds = find_embeds(original)
    if not embeds:
        # Still clean leftover Trinket wording / links
        text2 = soft_rewrite(original)
        if text2 != original:
            path.write_text(text2, encoding="utf-8")
        return 0

    # Compute every replacement from the untouched original so fence pairing
    # cannot see already-rewritten details/PistonRunner blocks.
    bodies = [body_for(emb, original) for emb in embeds]

    # Apply from the end so earlier indices stay valid.
    text = original
    for emb, body in zip(reversed(embeds), reversed(bodies)):
        text = text[: emb.start] + render(emb, body) + text[emb.end :]

    text = soft_rewrite(text)
    if text != original:
        path.write_text(text, encoding="utf-8")
    return len(embeds)


def soft_rewrite(text: str) -> str:
    text = re.sub(r"using Trinket", "using Piston below", text, flags=re.IGNORECASE)
    text = re.sub(
        r"\[View in Trinket\]\([^)]+\)",
        "Run with Piston below",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(
        r"\[Colors supported in Trinket\]\([^)]+\)",
        "[Turtle color names](https://docs.python.org/3/library/turtle.html#turtle.color)",
        text,
        flags=re.IGNORECASE,
    )
    text = text.replace(
        "share the [link / embed the Trinket]",
        "share a screenshot or your local turtle file",
    )
    text = re.sub(
        r"Instructions window of your Trinket",
        "editor (local Python / Thonny)",
        text,
    )
    text = re.sub(
        r"^- \[Trinklet\]\(https://trinket\.io/\)\s*$",
        "- Code runners use **Piston** (local API). Turtle labs need a local Python install.",
        text,
        flags=re.MULTILINE,
    )
    return text


def main() -> int:
    paths = sorted(
        p
        for p in ROOT.rglob("*")
        if p.suffix in {".md", ".mdx"}
        and "node_modules" not in p.parts
        and "trinket.io" in p.read_text(encoding="utf-8", errors="ignore")
    )
    total = 0
    for path in paths:
        n = migrate_file(path)
        print(f"{path.relative_to(ROOT)}: {n} embeds")
        total += n
    print(f"total: {total}")
    leftover = [
        str(p.relative_to(ROOT))
        for p in ROOT.rglob("*")
        if p.suffix in {".md", ".mdx"}
        and "node_modules" not in p.parts
        and "trinket.io/embed" in p.read_text(encoding="utf-8", errors="ignore")
    ]
    if leftover:
        print("leftover embeds:", *leftover, sep="\n  ")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
