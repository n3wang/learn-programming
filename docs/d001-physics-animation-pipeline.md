# Interactive Lesson Animation Pipeline

A workflow for automatically generating interactive lesson pages from a CSV task list.
Each row produces one MDX page + one React component — matching the style of `fundamentals/computer-engineering/lesson-notes/cpu-pipeline.mdx`.

Covers any subject: physics, math, chemistry, computer science, etc.

---

## How It Works

```
static/tasks/lesson-tasks.csv
    ↓  (scheduled agent reads next pending row)
    ↓  (AI infers formula, variables, nice numbers from description if blank)
generates: src/components/simulators/[category]/[subcategory]/[topic]/[id].js
           [category]/lesson-notes/[subcategory]/[topic]/[id].mdx
    ↓  (marks row done, commits)
Live Docusaurus page with:
  • Interactive sliders / buttons
  • Formula display with live computed result
  • Randomized practice problem with "nice" answer
```

One topic folder can hold many exercises. All exercises for `projectile-motion` live in `kinematics/projectile-motion/` and are named by their `id`.

---

## CSV Schema

File location: `static/tasks/lesson-tasks.csv`

```csv
id,status,category,subcategory,topic,description,formula,variables_json,nice_numbers_json,answer_template,related_image,sidebar_position,completed_at
```

| Column | Required | Description |
|---|---|---|
| `id` | ✅ | Unique integer — used as the filename (`1.mdx`, `2.js`) |
| `status` | ✅ | `pending` \| `done` \| `skip` — agent picks next `pending` |
| `category` | ✅ | Subject: `physics`, `math`, `chemistry`, `cs`, etc. |
| `subcategory` | ✅ | Topic group: `kinematics`, `dynamics`, `algebra`, `calculus`, etc. |
| `topic` | ✅ | Folder slug grouping exercises: `projectile-motion`, `quadratic-formula` |
| `description` | ✅ | What this specific exercise illustrates — AI reads this to infer everything below |
| `formula` | optional | Core equation(s). **Left blank → AI infers from description** |
| `variables_json` | optional | Slider definitions. **Left blank → AI infers reasonable ranges** |
| `nice_numbers_json` | optional | Practice problem seeds. **Left blank → AI generates clean examples** |
| `answer_template` | optional | JS expression for live result. **Left blank → AI derives from formula** |
| `related_image` | optional | Path under `static/` to a reference diagram |
| `sidebar_position` | optional | Ordering in the sidebar |
| `completed_at` | — | Set by agent when done — leave blank |

### Minimum viable row

The only columns you truly need to fill are the first six:

```csv
id,status,category,subcategory,topic,description
1,pending,physics,kinematics,projectile-motion,Animate a ball launched at an angle showing range vs angle. Sliders for initial velocity and launch angle.
```

The agent infers formula, variables, nice numbers, and answer template from the description.

---

## Output Paths (derived — not in CSV)

| Asset | Path |
|---|---|
| React component | `src/components/simulators/[category]/[subcategory]/[topic]/[id].js` |
| MDX page | `[category]/lesson-notes/[subcategory]/[topic]/[id].mdx` |

**Example** for id=`3`, category=`physics`, subcategory=`kinematics`, topic=`projectile-motion`:
- Component: `src/components/simulators/physics/kinematics/projectile-motion/3.js`
- MDX: `physics/lesson-notes/kinematics/projectile-motion/3.mdx`

Multiple exercises under the same topic sit side by side in the same folder:

```
physics/lesson-notes/kinematics/projectile-motion/
    1.mdx   ← "animate range vs angle"
    2.mdx   ← "animate max height vs initial velocity"
    3.mdx   ← "compare Earth vs Moon gravity"
```

---

## Category & Subcategory Reference

| `category` | Example `subcategory` values |
|---|---|
| `physics` | `dynamics`, `kinematics`, `optics`, `thermodynamics`, `waves`, `electromagnetism` |
| `math` | `algebra`, `geometry`, `calculus`, `statistics`, `trigonometry`, `linear-algebra` |
| `chemistry` | `stoichiometry`, `thermochemistry`, `kinetics`, `equilibrium` |
| `cs` | `algorithms`, `data-structures`, `networking`, `os` |

---

## `variables_json` Format (when you fill it manually)

```json
[
  {
    "name": "m",
    "label": "Mass (kg)",
    "min": 1,
    "max": 100,
    "step": 1,
    "default": 10,
    "locked": false
  }
]
```

- `locked: true` — renders as a static chip (for constants like `g`, `π`)
- If left blank in the CSV, the agent picks sensible ranges from the physics/math context

---

## `nice_numbers_json` Format (when you fill it manually)

```json
[
  { "m": 10, "a": 5,  "answer": 50  },
  { "m": 4,  "a": 25, "answer": 100 }
]
```

If left blank, the agent generates sets where the answer is an integer or ≤2 decimal places.
For multi-value answers (e.g. quadratic roots), `answer` can be a string: `"x=3 or x=2"`.

---

## Generated Component Structure

Each `.js` file follows `src/components/ce/_template.js` using the three CE primitives.

```
CEBlock
├── Section "Formula & Variables"    ← sliders + live formula result
├── Section "Visualization"          ← SVG/canvas reacting to slider state
└── Section "Practice Problem"       ← randomizer → given values → answer reveal
```

---

## Generated MDX Structure

```mdx
---
sidebar_position: 1
---

import Sim from "@site/src/components/simulators/physics/kinematics/projectile-motion/1.js";

# [AI-generated title from description]

[description + context]

## Core Formula

| Symbol | Meaning | Unit |
...

## Interactive Simulator

<Sim />

**Things to try:**
- ...

## How It Works

...

:::note Key Insight
...
:::
```

---

## Automation Agent Workflow

```
1. Read static/tasks/lesson-tasks.csv
2. Find first row where status == "pending"
3. If formula / variables_json / nice_numbers_json / answer_template are blank → infer from description
4. Derive output paths from category + subcategory + topic + id
5. Create parent directories if needed
6. Write src/components/simulators/[category]/[subcategory]/[topic]/[id].js
7. Write [category]/lesson-notes/[subcategory]/[topic]/[id].mdx
8. Update CSV row: status=done, completed_at=<ISO timestamp>
9. git add only the three changed/new files
10. git commit "feat([category]/[subcategory]/[topic]): add exercise [id]"
```

---

## Quality Checklist Per Row

- [ ] `description` is specific enough to infer the concept and what variables should be sliders
- [ ] If you fill `variables_json`, all `nice_numbers_json` seeds are reachable by the slider ranges
- [ ] `category` and `subcategory` match the reference table (or add a new one consistently)
- [ ] `related_image` path exists under `static/` or is left empty
- [ ] No other row has the same `id`

---

## File Layout After Generation

```
learn-programming/
├── static/tasks/
│   └── lesson-tasks.csv
│
├── physics/lesson-notes/
│   ├── kinematics/
│   │   └── projectile-motion/
│   │       ├── 1.mdx
│   │       └── 2.mdx
│   ├── dynamics/
│   │   └── newtons-second-law/
│   │       └── 3.mdx
│   └── waves/
│       └── wave-speed/
│           └── 4.mdx
│
├── math/lesson-notes/
│   ├── algebra/
│   │   └── quadratic-formula/
│   │       ├── 5.mdx
│   │       └── 6.mdx
│   └── trigonometry/
│       └── unit-circle/
│           └── 7.mdx
│
└── src/components/simulators/
    ├── physics/
    │   ├── kinematics/projectile-motion/
    │   │   ├── 1.js
    │   │   └── 2.js
    │   ├── dynamics/newtons-second-law/3.js
    │   └── waves/wave-speed/4.js
    └── math/
        ├── algebra/quadratic-formula/
        │   ├── 5.js
        │   └── 6.js
        └── trigonometry/unit-circle/7.js
```

Docusaurus picks up new MDX files automatically if the section uses `autogenerated` sidebars.

---

## Adding New Tasks (Minimum Effort)

```csv
# Fill only id, status, category, subcategory, topic, description
42,pending,physics,optics,snells-law,Show how light bends at a water-air interface. Slider for incident angle and refractive index. Animate the refracted ray.
43,pending,math,calculus,derivative-power-rule,Visualize the slope of x^n at a point. Sliders for coefficient and exponent. Show tangent line moving as x changes.
44,pending,physics,kinematics,projectile-motion,Same topic as exercise 1 but focus on max height instead of range. Compare trajectories side by side.
```

The agent fills in everything else.
