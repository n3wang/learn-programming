#!/usr/bin/env python3
"""Add an `image` URL to each card in an l0l-cards deck, using the word-icon search.

Reuses `search_icon()` from fill_word_icon_urls.py (DuckDuckGo, then Bing small
images). The query is the card's `imageQuery` if set, otherwise the term plus a
topic hint, so "FOB" searches "FOB shipping icon" instead of a random logo.
Cards that already have `image` are skipped unless --force, or unless listed in --ids.

Examples:
  python3 scripts/fill_card_icons.py --deck src/data/cards/decks/export-import.json
  python3 scripts/fill_card_icons.py --deck src/data/cards/decks/export-import.json --ids ei-fob,ei-cif
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fill_word_icon_urls import search_icon  # noqa: E402

# Last category segment -> word added to the search so abbreviations stay on topic.
TOPIC_HINTS = {
    'foundations': 'trade',
    'documents': 'document',
    'incoterms': 'shipping',
    'trade-law': 'law',
    'sale-contract': 'contract',
    'disputes': 'law',
    'arbitration': 'arbitration',
    'payments': 'payment',
    'fx': 'currency',
    'letters-of-credit': 'bank',
    # inventory-optimization
    'policies': 'inventory',
    'quantities': 'inventory',
    'safety-stock': 'inventory',
    'service': 'service',
    'demand': 'demand',
    'newsvendor': 'newspaper',
    'multi-echelon': 'supply chain',
    'simulation': 'simulation',
    # computer-engineering
    'cpu': 'computer',
    'memory': 'memory',
    'hardware': 'cpu',
    'concurrency': 'thread',
    'devices': 'hard disk',
    'files': 'file',
    'distributed': 'network',
    # game-engine / scalable-systems
    'software': 'software',
    'layout': 'binary',
    'parallelism': 'parallel',
    'os': 'operating system',
    'atomics': 'atomic',
    'storage': 'database',
    'replication': 'database',
    'partitioning': 'database',
    'faults': 'network',
    'consistency': 'distributed',
    'batch': 'data',
    'streams': 'data stream',
    'patterns': 'cloud',
}


def card_query(card: dict) -> str:
    if card.get('imageQuery'):
        return card['imageQuery']
    term = re.sub(r'\s*\(.*?\)', '', card['term'])  # "Purchase order (PO)" -> "Purchase order"
    term = term.replace('®', '').replace('“', '').replace('”', '').strip()
    hint = TOPIC_HINTS.get(card.get('category', '').split('/')[-1], '')
    if hint and hint.lower() not in term.lower():
        return f'{term} {hint}'
    return term


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--deck', type=Path, action='append', required=True)
    parser.add_argument('--pause', type=float, default=0.6)
    parser.add_argument('--limit', type=int, default=0, help='Stop after this many lookups (0 = all)')
    parser.add_argument('--force', action='store_true', help='Re-search cards that already have an image')
    parser.add_argument('--ids', default='', help='Comma-separated card ids to (re)search; other cards are left alone')
    args = parser.parse_args(argv)
    only = {i.strip() for i in args.ids.split(',') if i.strip()}

    lookups = 0
    for path in args.deck:
        deck = json.loads(path.read_text(encoding='utf-8'))
        changed = 0
        for card in deck['cards']:
            if only and card['id'] not in only:
                continue
            if card.get('image') and not args.force and not only:
                continue
            if args.limit and lookups >= args.limit:
                break
            query = card_query(card)
            lookups += 1
            try:
                url = search_icon(query)
            except Exception as error:  # network hiccup: back off and keep going
                print(f'{card["id"]}: {error}', file=sys.stderr)
                time.sleep(max(args.pause * 4, 2))
                continue
            if url:
                card['image'] = url
                changed += 1
                print(f'{card["id"]}\t{query}\t{url}')
            else:
                print(f'{card["id"]}\t{query}\t(no result)', file=sys.stderr)
            time.sleep(args.pause)
        if changed:
            path.write_text(json.dumps(deck, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'{path}: {changed} images added', file=sys.stderr)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
