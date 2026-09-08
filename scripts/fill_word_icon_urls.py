#!/usr/bin/env python3
"""Add an `icon` column from a small `[word] icon` image search. Does not touch `image`.

DuckDuckGo image search returns 403 after a few queries, so this uses Bing's
small-image results. Those are the same icon URLs DuckDuckGo was returning.

Example:
  python3 scripts/fill_word_icon_urls.py \\
    --tsv src/components/interactive/typingCopy/word-images/01.tsv
"""

from __future__ import annotations

import argparse
import csv
import html
import http.cookiejar
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
ICON_COL = "icon"
FIELDS = ("word", "zh", "image", ICON_COL)

SKIP = {
    "a",
    "an",
    "and",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "into",
    "of",
    "on",
    "or",
    "the",
    "to",
    "with",
    "without",
}


DDG_OK = True
VQD_RE = re.compile(r'vqd="([^"]+)"')


def ddg_icon(word: str) -> str:
    query = f"{word} icon"
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

    def fetch(url: str, accept: str) -> str:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": accept,
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": "https://duckduckgo.com/",
                "x-vqd-accept": "1",
            },
        )
        with opener.open(req, timeout=20) as resp:
            return resp.read().decode("utf-8", "replace")

    page = fetch(
        "https://duckduckgo.com/?" + urllib.parse.urlencode({"q": query, "iax": "images", "ia": "images"}),
        "text/html",
    )
    match = VQD_RE.search(page)
    if not match:
        return ""
    payload = json.loads(
        fetch(
            "https://duckduckgo.com/i.js?"
            + urllib.parse.urlencode(
                {
                    "l": "us-en",
                    "o": "json",
                    "q": query,
                    "vqd": match.group(1),
                    "f": ",,,,size:Small,,,",
                    "p": "1",
                }
            ),
            "application/json",
        )
    )
    for item in payload.get("results") or []:
        width = int(item.get("width") or 0)
        height = int(item.get("height") or 0)
        image = (item.get("image") or "").strip()
        thumb = (item.get("thumbnail") or "").strip()
        chosen = image if image and width and height and width <= 256 and height <= 256 else thumb or image
        if chosen.startswith("http"):
            return chosen
    return ""


def request(url: str, accept: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": accept,
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.bing.com/images/search",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", "replace")


def prefer_small(murl: str, turl: str) -> str:
    if re.search(r"/(?:32|48|64|96|128|256)/", murl) or re.search(r"[?&]s=\d{2,3}\b", murl):
        return murl
    return turl or murl


def search_icon(word: str) -> str:
    global DDG_OK
    if DDG_OK:
        try:
            found = ddg_icon(word)
            if found:
                return found
        except Exception as error:
            print(f"duckduckgo skipped: {error}", file=sys.stderr)
            DDG_OK = False
    query = f"{word} icon"
    url = "https://www.bing.com/images/async?" + urllib.parse.urlencode(
        {
            "q": query,
            "first": "1",
            "count": "12",
            "qft": "+filterui:imagesize-small",
        }
    )
    page = request(url, "text/html")
    for raw in re.findall(r'm="(\{.*?\})"', page):
        try:
            item = json.loads(html.unescape(raw))
        except json.JSONDecodeError:
            continue
        chosen = prefer_small((item.get("murl") or "").strip(), (item.get("turl") or "").strip())
        if chosen.startswith("http"):
            return chosen
    return ""


def load_table(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        rows = []
        for raw in reader:
            row = {field: (raw.get(field) or "").strip() for field in FIELDS}
            if not row["word"]:
                continue
            rows.append(row)
    return rows


def write_table(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(FIELDS), delimiter="\t", lineterminator="\n", extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def refresh_index(tsv_dir: Path, index_path: Path) -> int:
    images: dict[str, str] = {}
    for path in sorted(tsv_dir.glob("*.tsv")):
        for row in load_table(path):
            word = row["word"].lower()
            icon = row.get(ICON_COL) or ""
            image = row.get("image") or ""
            chosen = icon or image
            if word and chosen:
                images[word] = chosen
    lines = ["/** word -> image URL. Prefers the DuckDuckGo `icon` column. */", "const WORD_IMAGES = {"]
    for word, url in images.items():
        lines.append(f"  {json.dumps(word)}: {json.dumps(url)},")
    lines.extend(
        [
            "};",
            "",
            "export function imageForWord(word) {",
            "  const key = String(word || '').replace(/[.,]/g, '').toLowerCase();",
            "  return WORD_IMAGES[key] || '';",
            "}",
            "",
        ]
    )
    index_path.write_text("\n".join(lines), encoding="utf-8")
    return len(images)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--tsv", type=Path, action="append", required=True)
    parser.add_argument("--pause", type=float, default=0.6)
    parser.add_argument("--limit", type=int, default=0, help="Stop after this many new lookups (0 = all)")
    parser.add_argument(
        "--index",
        type=Path,
        default=Path("src/components/interactive/typingCopy/wordImageIndex.js"),
    )
    args = parser.parse_args(argv)

    looked = 0
    for path in args.tsv:
        if not path.is_file():
            print(f"Missing TSV: {path}", file=sys.stderr)
            return 2
        rows = load_table(path)
        write_table(path, rows)
        pending = [
            row
            for row in rows
            if not row.get(ICON_COL)
            and len(row["word"]) >= 3
            and row["word"].lower() not in SKIP
        ]
        print(f"=== {path.name} pending={len(pending)} ===", flush=True)
        hits = sum(1 for row in rows if row.get(ICON_COL))
        failures = 0
        for index, row in enumerate(pending, start=1):
            if args.limit and looked >= args.limit:
                write_table(path, rows)
                print(f"stopped at limit {args.limit}", flush=True)
                if args.index:
                    count = refresh_index(path.parent, args.index)
                    print(f"index={count}", flush=True)
                return 0
            try:
                row[ICON_COL] = search_icon(row["word"])
            except Exception as error:
                failures += 1
                print(f"{row['word']}: {error}", file=sys.stderr)
                if failures >= 5:
                    write_table(path, rows)
                    print("stopped after 5 failures so remaining words stay empty for a later resume", flush=True)
                    return 1
                time.sleep(max(args.pause * 4, 2))
                continue
            failures = 0
            looked += 1
            if row[ICON_COL]:
                hits += 1
            if index % 10 == 0 or index == len(pending):
                write_table(path, rows)
                if args.index:
                    refresh_index(path.parent, args.index)
                print(
                    f"{path.name} {index}/{len(pending)} icons={hits} last={row['word']}",
                    flush=True,
                )
            time.sleep(args.pause)
        write_table(path, rows)
        print(f"{path.name} done icons={hits}/{len(rows)}", flush=True)
        if args.index:
            count = refresh_index(path.parent, args.index)
            print(f"index={count}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
