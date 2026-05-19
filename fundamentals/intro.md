---
sidebar_position: 1
title: Fundamentals
---

# CS & Engineering Fundamentals

Deep dives into the underlying systems that every software engineer should understand — hardware behavior, algorithm design, rendering pipelines, concurrent execution, and machine learning.

## Disciplines

| Section | Focus |
|---------|-------|
| [Computer Engineering](./computer-engineering/intro) | CPU microarchitecture, memory hierarchy, OS internals |
| [Algorithms](./algorithms/intro) | Complexity, data structures, sorting, graph algorithms |
| [Graphics](./graphics/intro) | Rasterization, ray tracing, shaders, GPU pipeline |
| [Concurrency](./concurrency/intro) | Threads, synchronization, lock-free structures, async models |
| [Artificial Intelligence](./artificial-intelligence/intro) | ML fundamentals, neural networks, optimization, transformers |

Each section has interactive simulators and worked examples alongside the theory.

---

## Adding a New Topic

All interactive pages share three primitives from `src/components/ce/`:

| Primitive | Role |
|-----------|------|
| `CEBlock` | Outer card with title bar + labeled sub-sections |
| `StepControls` | Prev / Next / Reset + step counter |
| `ColorLegend` | Color swatches with hover tooltips |

### Workflow

1. **Copy the component template**
   `src/components/ce/_template.js` → `src/components/MyTopicSimulator.js`
   Fill in the data arrays and replace the placeholder visualization.

2. **Copy the page template**
   `fundamentals/<section>/lesson-notes/_template.mdx` → `lesson-notes/my-topic.mdx`
   Update `sidebar_position`, title, import path, and prose.

3. No navbar changes needed — the sidebar auto-generates from the directory structure.

### Common visualization patterns

| Pattern | Good for |
|---------|---------|
| Space-time grid | Pipelines, scheduling, Gantt |
| Pyramid / hierarchy | Cache, memory, OSI model |
| State machine nodes | Branch predictor, MESI, protocol FSMs |
| Timeline bars | Process scheduling, event loops |
| Force graph | Dependency graphs, call graphs |
