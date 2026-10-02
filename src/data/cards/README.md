# Card decks — `l0l-cards/1`

Shared flashcard format for **learn.l.l0l.in** and **Mastery CLI**. One JSON file per deck in `decks/`. The site loads them through `index.js`. The same files are meant to be published for the CLI to download (see *Integration roadmap*).

Answers are plain strings. Nothing is auto-graded: a player reveals the answer and judges for themself.

## Deck file

```json
{
  "schema": "l0l-cards/1",
  "deck": {
    "id": "export-import",
    "title": "Export–Import practice",
    "category": "international-business/export-import",
    "source": "https://learn.l.l0l.in/fundamentals/international-business/export-import",
    "version": 1,
    "translations": { "zh-Hans": { "title": "进出口实务" } },
    "categories": {
      "international-business/export-import/incoterms": {
        "label": "Incoterms®",
        "translations": { "zh-Hans": { "label": "国际贸易术语" } }
      }
    }
  },
  "cards": [ ... ]
}
```

| Deck field | Required | Notes |
|---|---|---|
| `id` | yes | Stable, kebab-case, unique across decks |
| `title` | yes | Display name |
| `category` | yes | Root category path of the deck |
| `source` | no | Public page the deck belongs to |
| `version` | no | Integer; bump when cards are added/changed so clients can re-sync |
| `translations` | no | `{ "<locale>": { "title": … } }` |
| `categories` | no | Labels (and translations) for sub-category paths |

## Card

```json
{
  "id": "ei-fob",
  "term": "FOB",
  "definition": "Free On Board — sea-only Incoterm; seller delivers once goods are on board…",
  "example": "“FOB Shanghai”: the buyer books and pays the ocean freight.",
  "category": "international-business/export-import/incoterms",
  "link": "/fundamentals/international-business/export-import/incoterms-trade-terms",
  "translations": { "zh-Hans": { "term": "船上交货", "definition": "…" } }
}
```

| Field | Required | Notes |
|---|---|---|
| `id` | yes | **Stable forever**. Progress on every client is keyed by it. Prefix by deck (`ei-`, `py-pd-`, …). Never reuse a deleted id |
| `term` | yes | The thing being learned: a word, abbreviation, or method name |
| `definition` | yes | One or two sentences, original wording |
| `category` | yes | Path, `/`-separated. Decks filter by prefix: `international-business/export-import` matches every sub-category |
| `example` | no | Short usage sentence or code |
| `prompt` | no | Recall question. If present, games show it instead of term/definition |
| `answer` | no | Expected recall answer (string, e.g. code). Shown on reveal, never graded |
| `link` | no | Site-relative URL of the lesson that teaches it |
| `aliases` | no | Other names the term goes by in prose (e.g. “Letter of credit” for *Documentary credit*). Used by Shift-hover term cards; a plain trailing “s” plural is matched automatically |
| `tags` | no | Free-form strings for extra filters |
| `image` | no | Small icon/picture URL shown with the card. Filled by `scripts/fill_card_icons.py`; clients hide it if it fails to load |
| `imageQuery` | no | Search words for the icon script when the term alone is ambiguous (e.g. `"cargo ship loading"` for FOB) |
| `translations` | no | `{ "<locale>": { "term", "definition", "example"?, "prompt"?, "answer"? } }` — any omitted field falls back to English |

### Two card shapes, one format

- **Glossary card**: `term` + `definition`. Games ask term → definition, definition → term, or matching.
- **Recall card**: also has `prompt` + `answer`, for example a programming method:

```json
{
  "id": "py-pd-sum",
  "term": "DataFrame.sum()",
  "definition": "Sums each column (axis=0 by default); axis=1 sums across rows.",
  "prompt": "Return the total of every column in df.",
  "answer": "df.sum()",
  "category": "programming/python/pandas/aggregation"
}
```

### Icons

```sh
python3 scripts/fill_card_icons.py --deck src/data/cards/decks/export-import.json            # fill missing
python3 scripts/fill_card_icons.py --deck src/data/cards/decks/export-import.json --force    # re-search all
```

The script reuses the word-icon search (`fill_word_icon_urls.py`). The query is `imageQuery` if set, otherwise the term plus a topic hint (`incoterms` → “shipping”, `letters-of-credit` → “bank”, …). If an icon is wrong, set `imageQuery` (or edit `image`) and re-run for that card. Images are hotlinked URLs, so treat them as decoration, never as content.

## Rules

- Keep ids stable. Edit the text freely, because the id carries the history.
- Write definitions and examples in your own words. Lessons are rewrites, not reprints, and cards follow the same rule.
- Use `zh-Hans` translations where they help. A missing translation is fine.
- Links point to existing doc routes (numeric file prefixes are stripped by Docusaurus).

## Mapping to Mastery CLI (current `Term`)

| `l0l-cards/1` | Mastery `Term` | Note |
|---|---|---|
| `id` | *(none today)* | CLI keys progress by a hash of term+description+example+prompt, so any edit resets history. Needs an `id` field |
| `term` | `term` | CLI markdown loader prefixes `"N - "`; JSON decks should not |
| `definition` | `description` | |
| `prompt` | `prompt` | Default when absent: “What is {term}?” |
| `answer` | `example` | CLI stores the answer in `example`; add an explicit `answer` and keep `example` as alias |
| `example` | *(none)* | Could map to `prompt_description` or a new field |
| `category` | `category` | CLI derives it from the file name; JSON keeps the full path |
| `link` | `references` | Prefix with the deck `source` origin |
| `translations` | *(none)* | CLI could pick a `--locale` |

The same mapping in markdown (`#### term` / description / `?p:` prompt / `?x` answer) lets a converter emit Mastery markdown if the CLI is not refactored yet.

## Integration roadmap (learn site ↔ Mastery CLI)

Ordered from cheapest to most involved. Each step works without the later ones.

### 1. Publish decks as static files
- A build step copies `decks/*.json` to `static/cards/` and writes `static/cards/index.json`, a manifest of deck ids, titles, versions, card counts and content hashes.
- URLs: `https://learn.l.l0l.in/cards/index.json` and `https://learn.l.l0l.in/cards/export-import.json`.
- No backend, cacheable, versioned by `version` + hash.

### 2. CLI reads JSON decks
- Mastery deck `index.js` gains `JSON_FILES: ['cards.json']`; loader maps fields as above.
- Progress keyed by `id` when present (hash fallback for markdown decks, so existing history is untouched).

### 3. `mastery deck pull`
- `mastery deck list --remote` reads the manifest.
- `mastery deck pull export-import` downloads into `$MASTERY_HOME/decks/l0l-export-import/` and writes `index.js` with `JSON_FILES`.
- `mastery deck update` re-pulls when the manifest version or hash changed. Local progress survives because ids are stable.
- Optional: `--category international-business/export-import/incoterms` pulls a slice.

### 4. Deep links both ways
- CLI shows `link` as a URL after a wrong answer (“read more: learn.l.l0l.in/…”).
- Site cards show a “Study in terminal: `mastery deck pull export-import`” hint.
- Lesson pages can list “cards from this lesson” by matching `link`.

### 5. Shared progress format (local first)
- A common progress record, `{ cardId, deck, seen, correct, wrong, lastSeen, box }`, exportable as JSON from both sides.
- Site: “Export progress” / “Import progress” buttons (IndexedDB ↔ file).
- CLI: `mastery progress export|import --format l0l`.
- Manual sync with no accounts needed. Fits the CLI’s offline-by-default promise.

### 6. Account sync (opt-in)
- The site already has an auth session (`siteAuthSession`) and an API base (`src/api/apiBase.js`). Add endpoints:
  - `GET /cards/progress`, `PUT /cards/progress` (merge by `cardId`, last-write-wins on `lastSeen`, sum counters)
  - `GET /cards/decks/mine`, `PUT /cards/decks/mine` for personal decks
- CLI: `mastery login` uses a device-code flow (prints a code; the user approves on the site), and the token is stored in the vault config, kept out of git. `mastery sync` pushes and pulls progress.
- Off by default. Nothing leaves the machine until the user runs `login`. This preserves the CLI’s privacy stance.

### 7. Two-way decks
- `mastery deck push` uploads a personal markdown/JSON deck to the user’s account, so it is playable in the site’s Cards tab.
- Site “Make a deck from this lesson’s highlights / scratch notes” exports `l0l-cards/1`.
- Shareable deck links (`/cards/play?deck=<id>`), and later public community decks with review.

### 8. Content beyond glossary
- Recall decks for programming methods (`prompt` + `answer`), e.g. pandas, SQL, Git. The CLI already has Git and Java decks that could be converted and published.
- Order cards could reuse the lesson rank questions (`items` in correct order). This would be a future `type: "order"` extension that bumps the schema to `l0l-cards/2`.
- Site wiki procedures (`src/data/wiki`) could export as order cards.

### 9. Habit hooks across both
- CLI commit hook pulls due cards from the synced progress, so cards missed on the site come back in the terminal.
- Site shows a “due today” count from the same progress.
