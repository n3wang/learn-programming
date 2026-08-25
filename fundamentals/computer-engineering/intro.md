---
sidebar_position: 1
title: Computer Engineering
---

# Computer Engineering

This section covers the **hardware-level foundations** of how computers work — from individual transistors up through the operating system.

Understanding these topics makes you a better engineer: you'll write faster code, reason clearly about performance bottlenecks, and understand why systems behave the way they do.

## Topics

| Topic | What you'll learn |
|-------|------------------|
| [CPU Pipeline Stages](./lesson-notes/cpu-pipeline) | How modern CPUs overlap instruction execution for throughput |
| [Cache Hierarchy](./lesson-notes/cache-hierarchy) | Why memory latency varies 100,000× and how CPUs hide it |
| [Branch Prediction](./lesson-notes/branch-prediction) | How CPUs speculatively fetch before knowing which path executes |

## Recommended Background

- Basic understanding of binary / hexadecimal numbers
- Familiarity with variables and loops in any programming language

No prior hardware or assembly experience is required. All pages have interactive simulators.

---

## Adding a New Topic

Each interactive page is built from three reusable primitives in `src/components/interactive/shell/`:

| Primitive | What it does |
|-----------|-------------|
| `CEBlock` | Outer card with a title bar and labeled sub-sections |
| `StepControls` | Prev / Next / Reset buttons + cycle counter |
| `ColorLegend` | Row of color swatches with hover tooltips |

### Steps

1. **Copy the component template**
   ```
   src/components/interactive/shell/_template.js → src/components/interactive/MyTopicSimulator.js
   ```
   Fill in `ITEMS`, `STEPS`, and replace the placeholder visualization.

2. **Copy the page template**
   ```
   computer-engineering/lesson-notes/_template.mdx → lesson-notes/my-topic.mdx
   ```
   Update the `sidebar_position`, title, import path, and prose sections.

3. **Add a navbar link** in `docusaurus.config.js` under the `Computer Eng` dropdown:
   ```js
   { to: '/computer-engineering/lesson-notes/my-topic', label: 'My Topic' }
   ```

That's the full workflow — the data definition and visualization logic are the only custom parts.

### Common visualization patterns

| Pattern | Use for | Key trick |
|---------|---------|-----------|
| **Space-time grid** | Pipelines, scheduling | CSS grid rows=entities, cols=time |
| **Pyramid / hierarchy** | Cache, memory, OSI model | `width: ${20 + i*13}%` per level |
| **State machine nodes** | Branch predictor, MESI protocol | Flex row of boxes + arrows, highlight active state |
| **Timeline bars** | Process scheduling, Gantt | Absolute-positioned divs inside a fixed-height row |
