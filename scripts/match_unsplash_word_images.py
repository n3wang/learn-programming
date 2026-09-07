#!/usr/bin/env python3
"""Match a word TSV to Unsplash dataset image URLs.

Reads a small word list (for example gloss 01.tsv) and joins it to the
Unsplash Lite tables from https://github.com/unsplash/datasets :

  keywords.tsv  photo_id + keyword
  photos.tsv    photo_id + photo_image_url

A miss is skipped. The join is a local lookup only. The dataset terms do not
allow publishing or redistributing those rows or image links in a product.
Use the Unsplash API if the game needs to show photos.

Example:
  python3 scripts/match_unsplash_word_images.py \\
    --words /tmp/gloss-parts/01.tsv \\
    --keywords /path/to/unsplash-lite/keywords.tsv \\
    --photos /path/to/unsplash-lite/photos.tsv \\
    --out /tmp/01-word-images.tsv
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

# Function words almost never have a useful photo. A miss is better than a
# random match.
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


def normalize(text: str) -> str:
    return " ".join(str(text).strip().lower().replace("_", " ").replace("-", " ").split())


def lemmas(word: str) -> set[str]:
    word = normalize(word)
    if not word:
        return set()
    found = {word}
    if word.endswith("ies") and len(word) > 4:
        found.add(word[:-3] + "y")
    if word.endswith("es") and len(word) > 4:
        found.add(word[:-2])
    if word.endswith("s") and not word.endswith("ss") and len(word) > 3:
        found.add(word[:-1])
    if word.endswith("ing") and len(word) > 5:
        found.add(word[:-3])
        found.add(word[:-3] + "e")
    if word.endswith("ed") and len(word) > 4:
        found.add(word[:-2])
        found.add(word[:-1])
    return found


def truthy(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "t", "yes", "y"}


def confidence(row: dict[str, str]) -> float:
    best = 0.0
    for key in (
        "ai_service_1_confidence",
        "ai_service_2_confidence",
    ):
        raw = (row.get(key) or "").strip()
        if not raw:
            continue
        try:
            best = max(best, float(raw))
        except ValueError:
            continue
    return best


def score_keyword(row: dict[str, str], exact: bool) -> float:
    score = 1000.0 if exact else 700.0
    if truthy(row.get("suggested_by_user", "")):
        score += 40.0
    if truthy(row.get("confirmed_by_ai_service_3", "")):
        score += 20.0
    score += confidence(row) * 0.5
    return score


def resize_image_url(url: str, size: int) -> str:
    parsed = urlparse(url.strip())
    query = [
        (key, value)
        for key, value in parse_qsl(parsed.query, keep_blank_values=True)
        if key not in {"w", "h", "fit", "crop", "q", "fm"}
    ]
    query.extend(
        [
            ("w", str(size)),
            ("h", str(size)),
            ("fit", "crop"),
            ("crop", "entropy"),
            ("q", "80"),
        ]
    )
    return urlunparse(parsed._replace(query=urlencode(query)))


def load_words(path: Path) -> list[str]:
    words: list[str] = []
    seen: set[str] = set()
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle, delimiter="\t")
        for row in reader:
            if not row or not row[0].strip() or row[0].startswith("#"):
                continue
            word = row[0].strip()
            key = normalize(word)
            if not key or key in seen or key in STOPWORDS or len(key) < 3:
                continue
            seen.add(key)
            words.append(word)
    return words


def index_targets(words: list[str]) -> dict[str, set[str]]:
    lemma_to_words: dict[str, set[str]] = {}
    for word in words:
        for lemma in lemmas(word):
            lemma_to_words.setdefault(lemma, set()).add(word)
    return lemma_to_words


def pick_photos(keywords_path: Path, lemma_to_words: dict[str, set[str]]) -> dict[str, dict]:
    best: dict[str, dict] = {}
    with keywords_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            keyword = normalize(row.get("keyword") or "")
            photo_id = (row.get("photo_id") or "").strip()
            if not keyword or not photo_id:
                continue
            hits = lemma_to_words.get(keyword)
            if not hits:
                continue
            exact_words = {word for word in hits if normalize(word) == keyword}
            for word in hits:
                exact = word in exact_words
                ranked = score_keyword(row, exact)
                current = best.get(word)
                if current is None or ranked > current["score"]:
                    best[word] = {
                        "score": ranked,
                        "photo_id": photo_id,
                        "keyword": keyword,
                        "exact": exact,
                    }
    return best


def attach_urls(photos_path: Path, best: dict[str, dict], size: int) -> None:
    wanted = {item["photo_id"] for item in best.values()}
    found: dict[str, dict[str, str]] = {}
    with photos_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        for row in reader:
            photo_id = (row.get("photo_id") or "").strip()
            if photo_id not in wanted or photo_id in found:
                continue
            image = (row.get("photo_image_url") or "").strip()
            if not image:
                continue
            found[photo_id] = row
            if len(found) == len(wanted):
                break
    for item in best.values():
        row = found.get(item["photo_id"])
        if not row:
            item["image"] = ""
            continue
        item["image"] = resize_image_url(row["photo_image_url"], size)
        item["photo_url"] = (row.get("photo_url") or "").strip()
        item["photographer"] = " ".join(
            part
            for part in (
                (row.get("photographer_first_name") or "").strip(),
                (row.get("photographer_last_name") or "").strip(),
            )
            if part
        )


def write_hits(path: Path, words: list[str], best: dict[str, dict]) -> tuple[int, int]:
    hits = 0
    misses = 0
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, delimiter="\t", lineterminator="\n")
        writer.writerow(
            ["word", "image", "keyword", "exact", "photo_id", "photo_url", "photographer"]
        )
        for word in words:
            item = best.get(word)
            image = (item or {}).get("image") or ""
            if not image:
                misses += 1
                continue
            hits += 1
            writer.writerow(
                [
                    word,
                    image,
                    item.get("keyword", ""),
                    "1" if item.get("exact") else "0",
                    item.get("photo_id", ""),
                    item.get("photo_url", ""),
                    item.get("photographer", ""),
                ]
            )
    return hits, misses


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--words", type=Path, required=True, help="Word TSV, first column is the word")
    parser.add_argument("--keywords", type=Path, required=True, help="Unsplash keywords.tsv")
    parser.add_argument("--photos", type=Path, required=True, help="Unsplash photos.tsv")
    parser.add_argument("--out", type=Path, required=True, help="Output TSV of word,image links")
    parser.add_argument("--size", type=int, default=200, help="Square crop size, default 200")
    args = parser.parse_args(argv)

    for label, path in (
        ("words", args.words),
        ("keywords", args.keywords),
        ("photos", args.photos),
    ):
        if not path.is_file():
            print(f"Missing {label} TSV: {path}", file=sys.stderr)
            return 2

    words = load_words(args.words)
    lemma_to_words = index_targets(words)
    best = pick_photos(args.keywords, lemma_to_words)
    attach_urls(args.photos, best, args.size)
    hits, misses = write_hits(args.out, words, best)
    print(
        f"words={len(words)} hits={hits} misses={misses} out={args.out}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
