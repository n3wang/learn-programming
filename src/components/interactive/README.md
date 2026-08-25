# Interactive lesson embeds

Lesson demos (steppers, graphs, pyramids) live here so they share one look and one import path.

## Layout

```text
src/components/interactive/
  CpuPipelineSimulator.js      # space-time grid + StepControls
  ZeroOneBfsSimulator.js       # graph + deque + StepControls
  CacheHierarchyVisualizer.js  # pyramid + click-to-inspect
  BranchPredictorSimulator.js  # state machine + sequence runner
  shell/
    CEBlock.js                 # card + titled sections
    StepControls.js            # Reset / Prev / Next
    ColorLegend.js             # color keys
    _template.js               # copy this for a new demo
```

## Design rules (what we learned)

1. **Frame first.** Every demo is a `CEBlock` with a short title and subtitle. Inner chunks are `CEBlock.Section`. Do not invent a second card style.

2. **One idea per step.** Pipeline uses clock cycles; 0-1 BFS uses one pop or one edge relax. Students should see *what changed* in the caption, not a full algorithm dump.

3. **Legend + controls at the bottom.** `ColorLegend` then `StepControls` (when the demo is a stepper). Same button labels everywhere.

4. **Data above UI.** Arrays of `{ key, label, color, desc }` or precomputed `frames[]`. Keep the render function dumb.

5. **MDX only embeds.** Prose, tables, and quizzes stay in the lesson file. The component does not teach the whole topic.

```mdx
import ZeroOneBfsSimulator from "@site/src/components/interactive/ZeroOneBfsSimulator.js";

## Interactive deque

<ZeroOneBfsSimulator />
```

6. **Copy the template.** `shell/_template.js` → `interactive/MyDemo.js`, then a lesson `.mdx` that imports it.

## Live pages

| Demo | Lesson |
|---|---|
| CPU pipeline | `/fundamentals/computer-engineering/lesson-notes/cpu-pipeline` |
| Cache hierarchy | `/fundamentals/computer-engineering/lesson-notes/cache-hierarchy` |
| Branch predictor | `/fundamentals/computer-engineering/lesson-notes/branch-prediction` |
| 0-1 BFS | `/fundamentals/algorithms/01-bfs` |
