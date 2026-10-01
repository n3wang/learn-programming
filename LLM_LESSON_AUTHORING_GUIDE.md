# Lesson Authoring Guide for LLMs

Use this guide when adding or improving lessons in this repository. The goal is a lesson that is accurate, teachable, interactive, and consistent with nearby course material. Work on the lesson the user asked for; do not expand into unrelated cleanup.

## User Workflow

- For this user, create or edit lesson content without running a build, compiler, or broad test suite unless they explicitly ask or provide a compilation error.
- Do not say that a lesson was compiled or validated if no build was run. A source review and a build are different things.
- Keep edits focused. Never overwrite or revert unrelated user changes.
- Before editing, inspect the target lesson area, its track index, the previous/next lesson links, and the relevant component example. Read only enough to choose the right local pattern.
- After editing, inspect the changed content, math, sample outputs, IDs, and links. Report that no build was run.

## Lesson Structure

For a new Docusaurus MDX lesson:

1. Use valid frontmatter with a unique `sidebar_position`, title, and optional `sidebar_label`.
2. Match the established course voice and level of detail in adjacent lessons.
3. Introduce the learning goal and assumptions before equations or code.
4. Define notation and units before using them. Make time buckets explicit and dimensionally consistent.
5. Explain the idea, work a numerical example, identify limitations, and finish with practice and takeaways.
6. Keep titles and navigation sequential. Update the track index and the previous lesson's `Next` link; avoid duplicate links.
7. Keep chapter source prose original. Treat supplied book pages as topic outlines, not copy to reproduce. Preserve the key ideas in fresh wording and check formulas independently.

For a new International Business inventory lesson, the current track is under `fundamentals/international-business/inventory-optimization/`. The index is `fundamentals/international-business/intro.md`. Existing chapters cover policies, EOQ, timing, safety stock, policy application, and a Python simulation lab; inspect current files before choosing the next number.

## Math and Examples

- State model assumptions next to formulas: deterministic or stochastic demand, fixed or variable lead time, continuous or periodic review, lost sales or backorders, and any independence/Normal assumptions.
- Distinguish inventory position, on-hand, on-order/in-transit, backorders, cycle stock, and safety stock. Do not call an order-up-to target average on-hand inventory.
- Check arithmetic by hand. Include enough intermediate values that a learner can reproduce the result.
- Do not present safety-stock reference bands as guaranteed physical bounds under random demand.
- Distinguish service metrics by their denominator and event: cycle service, period service, fill rate, and OTIF are not interchangeable.
- For simulations, specify event order and timing exactly: receipt, demand, shortage treatment, inventory-position update, review decision, and future receipt date.
- Keep simulation tests deterministic. Randomness without fixed seeds or tolerances can make practice flaky.

## Quizzes and Rank Questions

Use the global `<MultipleChoice>` component, following nearby MDX examples:

```mdx
<MultipleChoice
  id="unique-stable-id"
  title="Focused practice title"
  questions={[
    {
      prompt: 'A precise question?',
      choices: ['Plausible distractor', 'Correct choice', 'Common misconception', 'Another distractor'],
      answer: 1,
      why: 'Explain the reasoning, not just the selected letter.',
      whyWrong: 'When useful, explain the likely misconception in a wrong response.',
    },
  ]}
/>
```

- Give every quiz a unique, stable `id`; do not reuse IDs across lessons.
- `answer` is a zero-based index into `choices`.
- Make one answer unambiguously correct. Use plausible distractors that diagnose real misunderstandings, not joke answers.
- Feedback should explain units, assumptions, or the distinction being tested. This repository's quiz component supports optional `whyWrong` feedback.
- For a procedure question, use `type: 'order'`. List `items` in the correct order, or provide an explicit `order` array of item indexes when it improves clarity. Add `why` and `whyWrong`.
- Rank only steps with a defensible dependency order. If setup steps are independent, say so or provide their results in the prompt instead of arbitrarily requiring one order.
- Test core learning outcomes, not just vocabulary: include at least one application/calculation question when suitable.

## FormulaExplorer

Use FormulaExplorer when changing parameters can reveal a relationship, trade-off, threshold, or sensitivity. Static prose is better for a formula that has no meaningful interactive consequence.

- Embed a preset in MDX as `<FormulaExplorer preset="inventorySafetyStock" />`.
- Add the preset to `src/components/interactive/formulaExplorer/inventoryPresets.js` and register `INVENTORY_PRESETS` in `src/components/interactive/formulaExplorer/presets.js`.
- Give every preset an ID, title, subtitle, formula, bounded parameter sliders with unit-rich labels, an example, computed chart data, numeric stats, and a concise note about assumptions.
- Keep slider defaults aligned with the lesson's adjacent worked example.
- Make plotted values and stats match the equation exactly; constrain sliders to valid domains.
- In the existing `FormulaChart`, the `yLabel` prop labels the horizontal axis. Do not describe it as the vertical-axis label.
- Say whether a chart is illustrative/theoretical and whether its bounds are operational guarantees.

## Python Practice

Use the global `<CodeExercise>` component for general Python coding. It supports `lang`, `title`, `prompt`, `starter`, `wrapPrefix`, `wrapSuffix`, `tests`, `hint`, and `solution`. It executes the authored code with the configured runner and compares stdout to test expectations.

```mdx
<CodeExercise
  lang="python"
  title="Calculate a policy target"
  prompt={`Implement target(mu, sigma, periods, z) and return the safety buffer.`}
  starter={`import math\n\ndef target(mu, sigma, periods, z):\n    pass\n`}
  wrapSuffix={`\nimport sys\nmu, sigma, periods, z = map(float, sys.stdin.read().split())\nprint(f'{target(mu, sigma, periods, z):.1f}')\n`}
  tests={[
    {name: 'Typical case', stdin: '100 25 1 1.645', equals: '41.1'},
    {name: 'No variation', stdin: '100 0 4 1.645', equals: '0.0'},
  ]}
  hint="Combine the standard deviation over the protection window with the service factor."
  solution={`import math\n\ndef target(mu, sigma, periods, z):\n    return z * sigma * math.sqrt(periods)\n`}
/>
```

- Keep student code focused on a named function; put stdin parsing and output formatting in `wrapSuffix` when appropriate.
- Provide varied deterministic tests: normal case, boundaries, timing/off-by-one cases, and a case that distinguishes competing interpretations.
- For a simulation, test outstanding pipeline at a review boundary, lost sales versus backorders, zero-demand periods, and service-metric denominators where applicable.
- `CodeExercise` does **not** provide the SQL exercise's Data tab. Put input rows in an adjacent Markdown table and pass matching rows as test stdin. Do not claim the code editor has a data preview.
- Avoid external Python packages unless the runner guarantees them. The standard library is the safest default.
- Expected strings must match formatting from the wrapper. Round only for presentation, not inside calculation functions unless requested.

## SQL Practice and Data Tables

Use `<ExerciseSet>` to group related exercises. `SqlChapter8Exercise` is a wrapper around the data-science Chapter 8 seed bank; it only accepts known Chapter 8 problem IDs. Do not reuse those IDs for inventory questions.

For inventory SQL exercises, use the generic `<SqlExercise>` runner with explicit `seed`, `tables`, `starter`, `tests`, `hint`, and `solution`, as done in Chapter 5. Keep fixtures in a local module under `src/components/SqlExercise/` when they are shared across several exercises.

- Keep SQL seeds, preview tables, and test expectations synchronized.
- Use small datasets that expose the intended edge cases: duplicate events, unequal cycle lengths, tied ranks, missing data, or empty groups where relevant.
- State exact output columns, rounding, sort order, and tie behavior in each prompt.
- Prefer explicit columns, named CTEs, clear aliases, and deterministic ordering. Avoid `SELECT *` in model answers.
- Include tests that distinguish the correct query from tempting wrong queries, not just one happy-path result.
- Explain when a tiny synthetic data set is only for query mechanics and must not be interpreted as statistical evidence about which inventory policy is better.

## Final Review Checklist

- [ ] Frontmatter and lesson numbering match the track.
- [ ] Index and previous/next links exist once and point to real files.
- [ ] Formula notation, units, assumptions, and arithmetic are consistent.
- [ ] Quiz IDs are unique; answers are valid indexes; feedback matches the answers.
- [ ] Rank lists have a genuine dependency order and explain it.
- [ ] Explorer IDs resolve; defaults match the examples; chart outputs match the formulas.
- [ ] Python test inputs match visible tables; tests cover realistic edge cases and deterministic outputs.
- [ ] SQL seed, table preview, reference solution, and expected output agree.
- [ ] No build or compilation was run unless the user explicitly asked for it.
