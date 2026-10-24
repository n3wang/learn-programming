---
name: pdf-figures
description: Pull the figures for a book chapter out of a PDF and put them on this site's lesson pages — PNG crops matched to "Figure N.M" captions, LessonFigure embeds, and a FigureMatchGame deck per page. Use when the user points at a PDF (often under ~/koofr_sync/Books) and asks for "the images/figures for chapter X" or to add them to a page.
---

# PDF figures → lesson pages

Requests look like: *"@book.pdf — put the images for chapters 2–4 on /fundamentals/…"*.

## 1. Tooling (once per session)

PyMuPDF is not installed globally. Make a venv in the scratchpad (pip can be slow; run it in the background):

```bash
python3 -m venv "$SCRATCH/venv" && "$SCRATCH/venv/bin/pip" install --timeout 30 --progress-bar off pymupdf
```

Script: `.claude/skills/pdf-figures/scripts/extract_figures.py` (run with `"$SCRATCH/venv/bin/python" -I`).

## 2. Find the chapters

```bash
python -I extract_figures.py chapters "BOOK.pdf"
```

Prints the PDF outline with **1-based PDF page numbers** (printed page numbers differ). A chapter runs to the page before the next one. Map each chapter to its site page by title / `sidebar_position`. Book chapter numbers are often offset from the site's (CCNA: book ch 2 = site page 1).

## 3. Extract

```bash
python -I extract_figures.py extract "BOOK.pdf" --pages 76-94 --out "$SCRATCH/figs/ch5"
```

- Finds real captions ("Figure 5.3 …" set in a non-body font; body-text references like "Figure 5.3 shows" are skipped).
- Raster figures: unions the embedded images above (or beside) the caption plus nearby vector callouts.
- Vector figures: renders the band between the last body paragraph and the caption.
- Writes `fig-5-3.png`, `captions.json` (page, caption, clip in points), `_contact.png`.
- Several chapters at once (zsh does not word-split `$var`, so pair the loop variables):

  ```bash
  for c p in 5 76-94 6 95-111 7 112-139; do python -I extract_figures.py extract "BOOK.pdf" --pages $p --out "$SCRATCH/figs/ch$c"; done
  ```
- Compare the count against the chapter's highest figure number; a gap (e.g. no `fig-11-9`) is usually a caption merged with a figure label — crop it with `render`.

**Always look at `_contact.png`** (Read tool) before using anything. Typical faults: body text caught above a vector figure, a label clipped at the edge. Fix one with:

```bash
python -I extract_figures.py render "BOOK.pdf" --page 64 --clip 60,168,476,345 --out "$SCRATCH/figs/ch4/fig-4-1.png"
```

Start from the `clip` in `captions.json` and nudge. Get exact text positions with `page.get_text('blocks')` if needed. Don't open files in GUI apps (no `open -a Preview`).

Books with no "Figure N.M" captions (e.g. engineering handbooks with vector art and garbled text layers) need manual clip boxes: render low-res page previews, montage them, and pick boxes by eye.

Known hand-crop cases in this book family: a caption merged into the same text block as a figure label (CCNA fig 11.9), and bullet lists set in a symbol font right above a vector figure (fig 14.15). After any change to the script, rerun every chapter you've already shipped and `cmp` the PNGs against `static/img/...` — only crops you meant to change should differ.

## 4. Put them on the page

Before editing a page, check its mtime (`ls -la`): if it changed in the last few minutes, another session may still be writing it — wait or ask.

- Copy to `static/img/<book-slug>/fig-N-M.png` (e.g. `static/img/ccna/`). Reference as `/img/<book-slug>/fig-N-M.png`.
- Embed next to the paragraph the figure illustrates:

  ```mdx
  <LessonFigure src="/img/ccna/fig-5-3.png" alt="…" caption="Figure 5.3 — …" maxWidth={560} />
  ```

  `maxWidth`: ~420 for small/square, ~560 default, ~640 for wide network diagrams. Insert with a Python script keyed on unique anchor strings (`assert s.count(anchor) == 1`).
- **Captions in our own words** — short, no verbatim book text (the figures themselves are copyrighted; mention that once to the user if the site is public).

## 5. FigureMatchGame deck (one per page)

Add a deck to `src/components/interactive/figureMatch/presets.js`:

```js
'ccna-ios-cli': {
  figures: [
    fig('5-1', 'Caption that tells this figure apart from the others in the deck.'),
  ],
},
```

For many pages, keep one Python table per page of `(anchor line start, fig, caption, maxWidth)` and generate both the `<LessonFigure>` inserts and the deck from it, so each caption is written once. Anchors match the start of the line the figure goes *before*; match against the original lines so two figures can share an anchor.

Game captions should name the detail that distinguishes look-alike figures (same topology, different labels/traffic). A deck needs ≥ 4 figures for four options (fewer just shows fewer options). Then on the page, right before `## Summary`, with no heading or intro text:

```mdx
<FigureMatchGame preset="ccna-ios-cli" />
```

`FigureMatchGame` is registered in `src/components/interactive/lazySimulators.js`.

## 6. Verify

Open each page on the user's dev server (`http://localhost:7652/...`, check with curl first; `npm run dev` otherwise), confirm every `/img/...` returns 200, scroll to the game, and play one round (wrong → red + "Try again", right → green + "Next →"). Note: `src/css/custom.css` caps every `img` at `max-width: 70%`; components that overlay or tile images must override it.

Don't commit — the user commits.
