---
title: ♋ 4b - Zodiac Signs!
---

# Zodiac Signs ♋

改代码，按运行，让输出对上目标。 Fix the code, press Run, match the target.

<br />

## Zodiac Lookup

<ExerciseSet>

<Exercise title="aries">
<OutputChallenge
  title="aries"
  target={`Bold and quick to act.`}
  starter={`sign = "Aries"
if sign == "Taurus":
    print("Bold and quick to act.")
`}
/>
</Exercise>

<Exercise title="taurus">
<OutputChallenge
  title="taurus"
  target={`Steady and loves comfort.`}
  starter={`sign = "Taurus"
if sign == "Aries":
    print("Bold and quick to act.")
`}
/>
</Exercise>

<Exercise title="gemini">
<OutputChallenge
  title="gemini"
  target={`Curious and talks a lot.`}
  starter={`sign = "Gemini"
if sign == "Aries":
    print("Bold and quick to act.")
elif sign == "Taurus":
    print("Steady and loves comfort.")
`}
/>
</Exercise>

<Exercise title="cancer">
<OutputChallenge
  title="cancer"
  target={`Caring and a little moody.`}
  starter={`sign = "Cancer"
if sign == "Aries":
    print("Bold and quick to act.")
elif sign == "Taurus":
    print("Steady and loves comfort.")
elif sign == "Gemini":
    print("Curious and talks a lot.")
`}
/>
</Exercise>

<Exercise title="unknown_sign">
<OutputChallenge
  title="unknown_sign"
  target={`Unknown sign.`}
  starter={`sign = "Pluto"
if sign == "Aries":
    print("Bold and quick to act.")
elif sign == "Taurus":
    print("Steady and loves comfort.")
elif sign == "Gemini":
    print("Curious and talks a lot.")
elif sign == "Cancer":
    print("Caring and a little moody.")
`}
/>
</Exercise>

</ExerciseSet>

## More Signs

<ExerciseSet>

<Exercise title="leo">
<OutputChallenge
  title="leo"
  target={`Confident and loves attention.`}
  starter={`sign = "Leo"
if sign == "Virgo":
    print("Confident and loves attention.")
`}
/>
</Exercise>

<Exercise title="leo_virgo">
<OutputChallenge
  title="leo_virgo"
  target={`Careful and very organized.`}
  sourceChecks={[
    {name: 'elif', pattern: '\\belif\\b', must: true, hint: 'use elif to add a branch'},
  ]}
  starter={`sign = "Virgo"
if sign == "Leo":
    print("Confident and loves attention.")
`}
/>
</Exercise>

<Exercise title="leo_virgo_libra">
<OutputChallenge
  title="leo_virgo_libra"
  target={`Fair and seeks balance.`}
  sourceChecks={[
    {name: 'elif', pattern: '\\belif\\b', must: true, hint: 'use elif to add a branch'},
  ]}
  starter={`sign = "Libra"
if sign == "Leo":
    print("Confident and loves attention.")
elif sign == "Virgo":
    print("Careful and very organized.")
`}
/>
</Exercise>

<Exercise title="three_signs_default">
<OutputChallenge
  title="three_signs_default"
  target={`Unknown sign.`}
  sourceChecks={[
    {name: 'else', pattern: '\\belse\\b', must: true, hint: 'add an else branch'},
  ]}
  starter={`sign = "Mars"
if sign == "Leo":
    print("Confident and loves attention.")
elif sign == "Virgo":
    print("Careful and very organized.")
elif sign == "Libra":
    print("Fair and seeks balance.")
`}
/>
</Exercise>

</ExerciseSet>
