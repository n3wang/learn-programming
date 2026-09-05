#!/usr/bin/env python3
"""Replace dead Trinket iframes with PistonRunner, using nearby code fences."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Turtle / canvas embeds — Piston has no drawing surface.
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
# Sanic game canvas in project-1b
CANVAS_IDS = {"050b5b6826", "05705cf21d", "0407f93539"}

IFRAME_RE = re.compile(
    r'<iframe\s+[^>]*src="https://trinket\.io/embed/(python3?|java)/([a-f0-9]+)[^"]*"[^>]*>\s*</iframe>',
    re.IGNORECASE,
)

DETAILS_IFRAME_RE = re.compile(
    r"<details>\s*<summary>\s*(.*?)\s*</summary>\s*"
    r'(<iframe\s+[^>]*src="https://trinket\.io/embed/(python3?|java)/([a-f0-9]+)[^"]*"[^>]*>\s*</iframe>)\s*'
    r"</details>",
    re.IGNORECASE | re.DOTALL,
)

FENCE_RE = re.compile(r"```(java|python|python3)?\n(.*?)```", re.DOTALL | re.IGNORECASE)

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


def wrap_java(body: str) -> str:
    body = body.strip("\n")
    if re.search(r"\b(class|public\s+class)\s+\w+", body):
        if "main(" not in body and "public class" in body:
            # unlikely
            pass
        return body + ("\n" if not body.endswith("\n") else "")
    # Indent snippet into main
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


def nearest_fence(text: str, pos: int) -> tuple[str, str] | None:
    """Return (lang, code) for the fence ending closest before pos."""
    best = None
    for m in FENCE_RE.finditer(text[:pos]):
        lang = (m.group(1) or "").lower()
        code = m.group(2)
        best = (lang, code)
    return best


def piston_block(lang: str, code: str, height: str = "320px") -> str:
    if lang in ("python", "python3", ""):
        piston_lang = "python"
        code = wrap_python(code)
    else:
        piston_lang = "java"
        code = wrap_java(code)
    # Escape backticks in code for MDX template literals — use no nested ```
    code = code.replace("`", "\\`").replace("${", "\\${")
    return (
        f'<PistonRunner\n'
        f'  lang="{piston_lang}"\n'
        f'  interactive={{false}}\n'
        f'  height="{height}"\n'
        f'  code={{`{code}`}}\n'
        f'/>'
    )


def height_from_iframe(iframe: str) -> str:
    m = re.search(r'height="(\d+)"', iframe)
    if not m:
        return "320px"
    h = int(m.group(1))
    return f"{min(max(h, 220), 520)}px"


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


def replace_match(text: str, start: int, end: int, summary: str | None, iframe: str, lang: str, tid: str) -> str:
    height = height_from_iframe(iframe)
    if tid in TURTLE_IDS:
        body = TURTLE_NOTICE
    elif tid in CANVAS_IDS:
        body = CANVAS_NOTICE
    else:
        fence = nearest_fence(text, start)
        if fence and fence[1].strip():
            flang, code = fence
            use_lang = flang or lang
            if use_lang.startswith("python"):
                use_lang = "python"
            body = piston_block(use_lang if use_lang else lang, code, height)
        else:
            # Empty canvas / exercise without nearby fence
            if lang == "java":
                body = piston_block("java", empty_java_starter(), height)
            else:
                body = piston_block("python", empty_python_starter(), height)

    if summary is not None:
        return (
            f"<details>\n<summary>\n{summary.strip()}\n</summary>\n\n"
            f"{body}\n\n</details>"
        )
    return body


def migrate_file(path: Path) -> int:
    original = path.read_text(encoding="utf-8")
    text = original
    replacements = 0

    # Prefer details+iframe blocks so summary is preserved
    while True:
        m = DETAILS_IFRAME_RE.search(text)
        if not m:
            break
        summary, iframe, lang, tid = m.group(1), m.group(2), m.group(3).lower(), m.group(4)
        if lang == "python3":
            lang = "python"
        new = replace_match(text, m.start(), m.end(), summary, iframe, lang, tid)
        text = text[: m.start()] + new + text[m.end() :]
        replacements += 1

    # Standalone iframes (not wrapped in details)
    while True:
        m = IFRAME_RE.search(text)
        if not m:
            break
        lang, tid = m.group(1).lower(), m.group(2)
        if lang == "python3":
            lang = "python"
        iframe = m.group(0)
        new = replace_match(text, m.start(), m.end(), None, iframe, lang, tid)
        text = text[: m.start()] + new + text[m.end() :]
        replacements += 1

    # Soften leftover Trinket wording for solve-here lines
    text2 = re.sub(
        r"using Trinket",
        "using Piston below",
        text,
        flags=re.IGNORECASE,
    )
    text2 = re.sub(
        r"\[View in Trinket\]\([^)]+\)",
        "Run with Piston below",
        text2,
        flags=re.IGNORECASE,
    )
    text2 = re.sub(
        r"\[Colors supported in Trinket\]\([^)]+\)",
        "[Turtle color names](https://docs.python.org/3/library/turtle.html#turtle.color)",
        text2,
        flags=re.IGNORECASE,
    )
    text2 = text2.replace(
        "share the [link / embed the Trinket]",
        "share a screenshot or your local turtle file",
    )
    text2 = re.sub(
        r"Instructions window of your Trinket",
        "editor (local Python / Thonny)",
        text2,
    )

    if text2 != original:
        path.write_text(text2, encoding="utf-8")
    return replacements


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
        rel = path.relative_to(ROOT)
        print(f"{rel}: {n} embeds")
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
