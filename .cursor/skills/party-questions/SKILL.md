---
name: party-questions
description: >-
  Add bilingual number-guess questions to Bets & Wagers party packs
  (grade7.json, grade8.json, classic.json, electronics.json), including
  attached textbook figures, cropped images under static/img/party/, and
  KaTeX reveal notes. Use when the user adds a party / 课堂测验 / School Quiz
  question, pastes a 初一/初二 problem, or attaches a figure for grade7/grade8.
---

# Party quiz questions

School Quiz (Bets & Wagers) is **guess a number, closest wins**. One question = one numeric `answer`. Do not store `16°22′` or two-part keys.

Packs (imported in `src/components/BetsAndWagers/logic.js`):

| Pack | File | Id prefix |
| --- | --- | --- |
| Grade 7 / 初一 | `src/data/party/grade7.json` | `g7-` |
| Grade 8 / 初二 | `src/data/party/grade8.json` | `g8-` |
| Classics | `src/data/party/classic.json` | `math-` / `phys-` / … |
| Electronics | `src/data/party/electronics.json` | `el-` |

This is **not** lesson MDX (`LessonFigure`, `npm run fetch-image`). Those stay in `static/img/<section>/`.

## Workflow

1. Read the target pack and 3–4 **neighbor** questions. Match their length, tone, and unit style.
2. Read `src/data/party/notes.js` around the same ids.
3. Rewrite the stem in **original** EN + ZH. Do not paste a copyrighted textbook listing.
4. If the source has two asks, **split** into two cards that can share one image.
5. Pick a single number the class can type. For “精确到分”, ask for the leftover minutes (unit `′`), not the compound angle.
6. Save any figure (below), then append the JSON object(s) next to related items.
7. Add `NOTES['id']` with a short KaTeX walkthrough (EN + ZH).
8. `python3 -c "import json; json.load(open('src/data/party/<pack>.json'))"` — must parse.

## Question shape

```json
{
  "id": "g7-gear-24",
  "text": "The gear has 24 teeth. Adjacent tooth centerlines make equal angles α. How many degrees is α?",
  "textZh": "如图，一个齿轮有 24 个齿，每相邻两齿中心线的夹角都相等。这个夹角 α 是多少度？",
  "answer": "15",
  "unit": "°",
  "unitZh": "度",
  "image": {
    "src": "/img/party/g7-gear.png",
    "alt": "A 24-tooth gear with equal central angle α between adjacent tooth centerlines",
    "altZh": "一个 24 齿齿轮，相邻齿中心线的夹角记为 α"
  }
}
```

- `id` unique across packs. `answer` is a string number (`"15"`, `"47.5"`).
- Empty `unit` / `unitZh` when the number is bare (`x = 6`).
- `image` optional. Wikimedia cards also set `credit` + `source` (caption is a link). User-supplied textbook crops: **omit** both — do not invent Commons metadata. `QuestionImage` hides the caption when `credit` is missing.

## Figures

Copy into `static/img/party/<slug>.png` (or `.jpg`). `src` is `/img/party/<slug>.png`.

Crop exam banners (`第12题`, headers, page numbers) before shipping. Prefer ImageMagick; then **Read** the PNG:

```bash
magick "$SRC" -gravity North -chop 0x78 -gravity South -chop 0x78 static/img/party/<slug>.png
```

Nudge the chop until only the useful drawing remains. Same file may be reused on every split card.

Prefer a Commons photo with real `credit`/`source` when the user did not attach a figure and one is needed. Never hotlink a remote URL as `src`.

## Notes

`src/data/party/notes.js` — original classroom prose, `$...$` / `$$...$$`. Escape backslashes in the template literal (`\\circ`, `\\div`, `\\overline{36}`).

```js
'g7-gear-24': {
  en: `$$\\alpha = 360^\\circ \\div 24 = 15^\\circ$$`,
  zh: `$$\\alpha = 360^\\circ \\div 24 = 15^\\circ$$`,
},
```

## Split example (deg + min)

Source: 24 齿夹角多少度？22 齿又是多少度（精确到分）？

| Id | Ask | Answer |
| --- | --- | --- |
| `g7-gear-24` | α for 24 teeth, in degrees | `15` `°` |
| `g7-gear-22` | 22 teeth: 16° plus how many minutes? | `22` `′` |

\(360 \div 22 = 16.\overline{36}^\circ\), leftover \(0.\overline{36}\times 60' \approx 22'\). Do not use `16.37` unless the user wants decimal degrees.
