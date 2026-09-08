#!/usr/bin/env python3
"""Fill a word TSV with 200px image URLs. No dataset download.

Looks up each word on Wikipedia and keeps thumbnail.source when one exists.
A miss stays blank. About 200 hits is a few megabytes of URLs, not image files.

Example:
  python3 scripts/fill_word_image_urls.py \\
    --words /tmp/gloss-parts/01.tsv \\
    --out src/components/interactive/typingCopy/word-images/01.tsv
"""

from __future__ import annotations

import argparse
import os
import csv
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = "https://en.wikipedia.org/w/api.php"
USER_AGENT = "learn-programming-word-images/1.0 (local typing game; contact: local)"

STOPWORDS = {
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


def load_rows(path: Path) -> list[tuple[str, str]]:
    rows: list[tuple[str, str]] = []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle, delimiter="\t")
        for row in reader:
            if not row or not row[0].strip() or row[0].startswith("#"):
                continue
            word = row[0].strip()
            zh = row[1].strip() if len(row) > 1 else ""
            rows.append((word, zh))
    return rows


def fetch_batch(titles: list[str], size: int) -> dict[str, str]:
    last_error: Exception | None = None
    for attempt in range(5):
        try:
            return _fetch_batch(titles, size)
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code != 429:
                raise
            time.sleep(2 + attempt * 3)
    if last_error:
        raise last_error
    return {}


def _fetch_batch(titles: list[str], size: int) -> dict[str, str]:
    query = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "redirects": "1",
            "prop": "pageimages",
            "piprop": "thumbnail",
            "pithumbsize": str(size),
            "titles": "|".join(titles),
        }
    )
    request = urllib.request.Request(
        f"{API}?{query}",
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)

    found: dict[str, str] = {}
    pages = payload.get("query", {}).get("pages", [])
    normalized = {
        item.get("from", "").lower(): item.get("to", "")
        for item in payload.get("query", {}).get("normalized", [])
    }
    redirects = {
        item.get("from", "").lower(): item.get("to", "")
        for item in payload.get("query", {}).get("redirects", [])
    }

    by_title = {}
    for page in pages:
        title = page.get("title") or ""
        thumb = (page.get("thumbnail") or {}).get("source") or ""
        if title and thumb and page.get("missing") is not True:
            by_title[title.lower()] = thumb

    for title in titles:
        key = title.lower()
        resolved = key
        if key in normalized:
            resolved = normalized[key].lower()
        if resolved in redirects:
            resolved = redirects[resolved].lower()
        if key in redirects:
            resolved = redirects[key].lower()
        thumb = by_title.get(resolved) or by_title.get(key) or ""
        if thumb:
            found[key] = thumb
    return found


def unsplash_thumb(word: str, size: int, access_key: str) -> str:
    """One 200x200 Unsplash photo URL. Empty string if Unsplash has no hit."""
    query = urllib.parse.urlencode(
        {
            "query": word,
            "per_page": "1",
            "orientation": "squarish",
            "content_filter": "high",
        }
    )
    request = urllib.request.Request(
        f"https://api.unsplash.com/search/photos?{query}",
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Accept-Version": "v1",
            "Authorization": f"Client-ID {access_key}",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)
    results = payload.get("results") or []
    if not results:
        return ""
    raw = ((results[0].get("urls") or {}).get("raw") or "").strip()
    if not raw:
        return ""
    parsed = urllib.parse.urlparse(raw)
    kept = [
        (key, value)
        for key, value in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
        if key not in {"w", "h", "fit", "crop", "q"}
    ]
    kept.extend(
        [
            ("w", str(size)),
            ("h", str(size)),
            ("fit", "crop"),
            ("crop", "entropy"),
            ("q", "80"),
        ]
    )
    return urllib.parse.urlunparse(parsed._replace(query=urllib.parse.urlencode(kept)))


def commons_thumb(word: str, size: int) -> str:
    """First small Commons bitmap for this word, preferring a filename that contains it."""
    query = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "generator": "search",
            "gsrnamespace": "6",
            "gsrlimit": "8",
            "gsrsearch": f"filetype:bitmap {word} filew:<500",
            "prop": "imageinfo",
            "iiprop": "url|size|mime",
            "iiurlwidth": str(size),
            "iiurlheight": str(size),
        }
    )
    request = urllib.request.Request(
        f"https://commons.wikimedia.org/w/api.php?{query}",
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    last_error: Exception | None = None
    payload = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = json.load(response)
            break
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code != 429:
                raise
            time.sleep(2 + attempt * 3)
    if payload is None:
        if last_error:
            raise last_error
        return ""

    pages = payload.get("query", {}).get("pages", [])
    needle = word.lower()
    ranked = []
    for page in pages:
        info = (page.get("imageinfo") or [{}])[0]
        thumb = info.get("thumburl") or info.get("url") or ""
        mime = info.get("mime") or ""
        if not thumb or not mime.startswith("image/"):
            continue
        title = (page.get("title") or "").lower()
        ranked.append((0 if needle in title else 1, thumb))
    ranked.sort(key=lambda item: item[0])
    return ranked[0][1] if ranked else ""


def write_table(path: Path, rows: list[tuple[str, str]], lookup: dict[str, str]) -> tuple[int, int]:
    path.parent.mkdir(parents=True, exist_ok=True)
    hits = 0
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, delimiter="\t", lineterminator="\n")
        writer.writerow(["word", "zh", "image"])
        for word, zh in rows:
            image = lookup.get(word.lower(), "")
            if image:
                hits += 1
            writer.writerow([word, zh, image])
    return hits, len(rows) - hits


def load_existing(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    found: dict[str, str] = {}
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            word = (row.get("word") or "").strip()
            image = (row.get("image") or "").strip()
            if word and image:
                found[word.lower()] = image
    return found


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--words", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--size", type=int, default=200)
    parser.add_argument("--batch", type=int, default=10)
    parser.add_argument("--pause", type=float, default=1.2)
    parser.add_argument("--source", choices=("ordered", "wikipedia", "commons"), default="ordered")
    args = parser.parse_args(argv)

    if not args.words.is_file():
        print(f"Missing words TSV: {args.words}", file=sys.stderr)
        return 2

    rows = load_rows(args.words)
    lookup = load_existing(args.out)
    pending: list[str] = []
    seen: set[str] = set()
    for word, _zh in rows:
        key = word.lower()
        if key in STOPWORDS or len(key) < 3 or key in seen:
            continue
        if args.source != "ordered" and key in lookup:
            continue
        seen.add(key)
        pending.append(word)

    access_key = os.environ.get("UNSPLASH_ACCESS_KEY", "").strip()
    if args.source == "ordered":
        unsplash_off = not access_key
        if unsplash_off:
            print("unsplash skipped: UNSPLASH_ACCESS_KEY is not set", file=sys.stderr)
        for index, word in enumerate(pending, start=1):
            thumb = ""
            if not unsplash_off:
                try:
                    thumb = unsplash_thumb(word, args.size, access_key)
                except urllib.error.HTTPError as error:
                    print(f"unsplash {word}: {error}", file=sys.stderr)
                    if error.code in {401, 403}:
                        unsplash_off = True
                except Exception as error:
                    print(f"unsplash {word}: {error}", file=sys.stderr)
            if thumb:
                lookup[word.lower()] = thumb
            elif word.lower() not in lookup:
                try:
                    thumb = commons_thumb(word, args.size)
                except Exception as error:
                    print(f"commons {word}: {error}", file=sys.stderr)
                if thumb:
                    lookup[word.lower()] = thumb
            if index % 10 == 0 or index == len(pending):
                hits, misses = write_table(args.out, rows, lookup)
                print(f"ordered {index}/{len(pending)} hits={hits} misses={misses}", file=sys.stderr)
            time.sleep(args.pause)
        hits, misses = write_table(args.out, rows, lookup)
        print(f"words={len(rows)} hits={hits} misses={misses} out={args.out}")
        return 0

    if args.source == "commons":
        for index, word in enumerate(pending, start=1):
            try:
                thumb = commons_thumb(word, args.size)
            except Exception as error:
                print(f"{word}: {error}", file=sys.stderr)
                thumb = ""
            if thumb:
                lookup[word.lower()] = thumb
            if index % 10 == 0 or index == len(pending):
                hits, misses = write_table(args.out, rows, lookup)
                print(f"commons {index}/{len(pending)} hits={hits} misses={misses}", file=sys.stderr)
            time.sleep(args.pause)
        hits, misses = write_table(args.out, rows, lookup)
        print(f"words={len(rows)} hits={hits} misses={misses} out={args.out}")
        return 0

    for start in range(0, len(pending), args.batch):
        chunk = pending[start : start + args.batch]
        try:
            lookup.update(fetch_batch(chunk, args.size))
        except Exception as error:
            print(f"batch {start}: {error}", file=sys.stderr)
        time.sleep(args.pause)
        print(f"looked up {min(start + len(chunk), len(pending))}/{len(pending)}", file=sys.stderr)

    hits, misses = write_table(args.out, rows, lookup)
    print(f"words={len(rows)} hits={hits} misses={misses} out={args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
