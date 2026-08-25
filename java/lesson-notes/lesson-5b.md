---
title: Chapter 5b - Randomness - Continued
---

In the previous lecture we learnt about Random using `nextInt()`
Here are some other random methods that you can use.

:::note Other random Methods

![](../../static/img/2022-06-07-22-19-23.png)

:::

---

## Mini quiz — more Random methods

<MultipleChoice
  id="java-ch5b-random-methods"
  title="More Random methods"
  questions={[
    {
      prompt: 'rand.nextDouble() returns a value in which range?',
      choices: ['0 to 1, including both ends', '0.0 (inclusive) to 1.0 (exclusive)', '-1.0 to 1.0', '1 to 100'],
      answer: 1,
      why: 'nextDouble() always returns a value from 0.0 up to (but not including) 1.0.',
    },
    {
      prompt: 'To get a random letter grade from a fixed list like {"A","B","C","D"}, which call picks a valid random index?',
      choices: ['rand.nextInt(4)', 'rand.nextInt(3)', 'rand.nextDouble(4)', 'rand.nextInt() % 3'],
      answer: 0,
      why: 'A 4-element array has valid indexes 0-3, and nextInt(4) returns exactly 0-3.',
    },
  ]}
/>

---

## Challenge: percent to a letter

Given a random-looking percent (`0-99`, passed in as if from `rand.nextInt(100)`), print `"low"` for under 33, `"mid"` for 33-65, `"high"` for 66 and up.

<CodingExam
  title="percent to a letter"
  heading="Challenge: percent to a letter"
  lang="java"
  filename="Main.java"
  prompt="if/else if bands on the incoming percent value."
  sampleLog={`(input) 80
high`}
  starter={`public class Main {
    public static String band(int percent) {
        // TODO
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int p = sc.nextInt();
        System.out.println(Main.band(p));
    }
}
`}
  tests={[
    { name: 'low', stdin: '10', equals: 'low' },
    { name: 'mid', stdin: '50', equals: 'mid' },
    { name: 'high', stdin: '80', equals: 'high' },
  ]}
/>

---

## Exercises

<ExerciseSet>
<Exercise title="Pick from a list" anchor="exercise-pick-from-list">

:::tip Activity: Pick from a list
Write `letterFor(int index)` that returns `"A"`, `"B"`, `"C"`, or `"D"` for `index` values `0`, `1`, `2`, `3` (as if the index came from `rand.nextInt(4)`).

<CodingExam
  title="Pick from a list"
  heading="exercise-pick-from-list"
  lang="java"
  filename="Main.java"
  prompt={"Use an array {\"A\",\"B\",\"C\",\"D\"} and return grades[index], or an if/else chain."}
  sampleLog={`(input) 2
C`}
  starter={`public class Main {
    public static String letterFor(int index) {
        // TODO
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int index = sc.nextInt();
        System.out.println(Main.letterFor(index));
    }
}
`}
  tests={[
    { name: 'index 0', stdin: '0', equals: 'A' },
    { name: 'index 2', stdin: '2', equals: 'C' },
    { name: 'index 3', stdin: '3', equals: 'D' },
  ]}
/>

:::

</Exercise>

<Exercise title="Scale a fraction" anchor="exercise-scale-fraction">

:::tip Activity: Scale a fraction
Given a value from `0.0` to `1.0` (as if from `rand.nextDouble()`), scale it into a percentage `0-100` and print it as an `int` (drop the decimal).

<CodingExam
  title="Scale a fraction"
  heading="exercise-scale-fraction"
  lang="java"
  filename="Main.java"
  prompt="Multiply the fraction by 100 and cast to int."
  sampleLog={`(input) 0.5
50`}
  starter={`public class Main {
    public static int toPercent(double fraction) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double f = sc.nextDouble();
        System.out.println(Main.toPercent(f));
    }
}
`}
  sourceChecks={[
    { name: 'Casts to int', pattern: '\\(int\\)', must: true, hint: '(int) (fraction * 100)' },
  ]}
  tests={[
    { name: 'half', stdin: '0.5', equals: '50' },
    { name: 'zero', stdin: '0.0', equals: '0' },
    { name: 'near one', stdin: '0.99', equals: '99' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>



