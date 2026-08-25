---
sidebar_position: 2
title: Interactive embeds
---

# Interactive embeds

Lesson animations (CPU pipeline, 0-1 BFS, cache pyramid, branch predictor) all live in `src/components/interactive/` and share the same card chrome.

## Shared shell

| Piece | Role |
|---|---|
| `CEBlock` | Outer card, title bar, labeled sections |
| `StepControls` | Reset / Prev / Next + “Step n of m” |
| `ColorLegend` | Color keys with hover text |

Copy `src/components/interactive/shell/_template.js` when you add a new demo.

## What works in class

- **Step through time**, don’t autoplay. Pipeline = clock cycle. 0-1 BFS = one pop or one relax.
- **Caption the change.** “Pop front → 2” beats a silent animation.
- **Keep theory in Markdown.** The widget is a figure, not the textbook.
- **Same import root:** `@site/src/components/interactive/Name.js`

## Current demos

- [CPU pipeline](./computer-engineering/lesson-notes/cpu-pipeline)
- [Cache hierarchy](./computer-engineering/lesson-notes/cache-hierarchy)
- [Branch prediction](./computer-engineering/lesson-notes/branch-prediction)
- [0-1 BFS](./algorithms/01-bfs)

Developer notes: `src/components/interactive/README.md`.
