---
sidebar_position: 1
title: Welcome to Godot
---

# Welcome to Godot

Godot is a free, open-source game engine. Games and tools are written in **GDScript** — a Python-like language built for Godot.

These lessons teach GDScript basics for programmers. You run scripts in the browser sandbox (Piston), not the full Godot editor.

## What You'll Learn

| Lesson | Topics |
|---|---|
| Lesson 1a | First script, `print`, strings |
| Lesson 2a | Variables, types, string formatting |
| Lesson 3a | `if` / `elif` / `else` |
| Lesson 4a | Loops and arrays |

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
- End the chapter with **Exercises**
- Run code with **Piston** (`lang="godot"`)
