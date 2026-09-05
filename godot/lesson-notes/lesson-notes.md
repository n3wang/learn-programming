---
sidebar_position: 1
title: Welcome to Godot
---


# Welcome to Godot

Godot is a free, open-source game engine. Games and tools are written in **GDScript** — a Python-like language built for Godot.

These lessons teach GDScript basics for programmers. You run scripts in the browser sandbox (Piston), not the full Godot editor.

## What You'll Learn

| Lesson | Topics | End-of-chapter exercises |
|---|---|---|
| [Lesson 1a](./lesson-1a) | First script, `print`, strings | 3 — two lines → score label → battle cry |
| [Lesson 2a](./lesson-2a) | Variables, types, formatting | 3 — HP line → after hit → status board |
| [Lesson 3a](./lesson-3a) | `if` / `elif` / `else` | 3 — parity → HP band → can attack |
| [Lesson 4a](./lesson-4a) | Loops and arrays | 3 — countdown → names → highest score |
| [Lesson 4b](./lesson-4b) | Functions, params, returns | 3 — triple → status line → clamp |
| [Lesson 4c](./lesson-4c) | Dicts, classes, iterating objects | 3 — loot bag → coin purse → alive names |
| [Lesson 5a](./lesson-5a) | `Vector2` + `game_kit` actors | 3 — length → walk → in range |
| [Lesson 6a](./lesson-6a) | Character / Static / Rigid bodies (mocked) | 3 — floor → static → impulse |
| [Lesson 7a](./lesson-7a) | Areas, overlap, collision layers | 3 — far → mask → fix mask |
| [Lesson 8a](./lesson-8a) | Mini arena (chase, score, goals) | 3 — score → goal → kite |

Each chapter teaches a couple of ideas, then a **mini quiz** and a **graded challenge**. The **Exercises** block at the end is ordered easy → harder — finish them in order.

## Real engine vs mocks

| Available here | Needs the Godot editor |
|---|---|
| `Vector2`, `Color`, `Time`, arrays, classes | Scene tree editing, InputMap, AnimationPlayer |
| `game_kit.gd` actors & body/area **mocks** | Real `CharacterBody2D` physics frames |

Piston copies `game_kit.gd` into every run as `res://game_kit.gd`:

```python
var Kit = preload("res://game_kit.gd")
```

## How scripts run here

GDScript uses **4 spaces** for indentation in these lessons (the editor Tab key inserts spaces). Mixing tabs and spaces causes a parse error. If a starter looks flat, click **Reset**.

1. `extends SceneTree`
2. Start work in `_init()`
3. Call `quit()` when finished (or the sandbox will hang until timeout)

```python
extends SceneTree

func _init():
    print("Hello Godot")
    quit()
```

## Class rhythm

Same pattern as Python / C++:

- Teach 1–2 ideas, then a **mini quiz** or **graded challenge**
- End the chapter with **Exercises** (at least three, getting harder)
- Run code with **Piston** (`lang="godot"`)
