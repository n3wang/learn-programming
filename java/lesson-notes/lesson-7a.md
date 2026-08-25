---
title: Chapter 7a - Nested Loops
---

## Why Nest a Loop?

A single loop repeats **one line of work**. A **nested loop** — a loop inside another loop — repeats a whole **block of work**, once for every pass of the outer loop. That is exactly what you need for anything shaped like a grid: rows and columns, a multiplication table, a pattern of stars.

Rule of thumb: the **outer loop** picks the row, the **inner loop** draws everything in that row.

```java
public class Main {
  public static void main(String[] args) {
    for (int row = 1; row <= 3; row++) {
      for (int col = 1; col <= 3; col++) {
        System.out.print("* ");
      }
      System.out.println(); // move to the next line after each row
    }
  }
}
```

<details>
<summary>
🧪 Try the code out!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`public class Main {
  public static void main(String[] args) {
    for (int row = 1; row <= 3; row++) {
      for (int col = 1; col <= 3; col++) {
        System.out.print("* ");
      }
      System.out.println();
    }
  }
}
`}
/>

</details>

:::tip Trace it before you run it
For every **one** pass of the outer loop, the inner loop runs **completely** — start to finish. With `row` going 1→3 and `col` going 1→3, the inner `print` runs 3 × 3 = 9 times total, but `println()` (the newline) only runs 3 times, once per row.
:::

---

## Mini quiz — tracing nested loops

<MultipleChoice
  id="java-ch7a-trace"
  title="Tracing nested loops"
  questions={[
    {
      prompt: 'How many times does the inner System.out.print run in total?',
      code: 'for (int row = 1; row <= 4; row++) {\n  for (int col = 1; col <= 2; col++) {\n    System.out.print("*");\n  }\n}',
      codeLang: 'java',
      choices: ['4', '2', '6', '8'],
      answer: 3,
      why: 'The outer loop runs 4 times, and for each of those the inner loop runs 2 times: 4 * 2 = 8.',
    },
    {
      prompt: 'Why does a fresh for(int col = 1; ...) inside the outer loop matter?',
      choices: [
        'It does not matter, col could be declared once outside',
        'It resets col back to 1 at the start of every row, so each row is drawn the same way',
        'It makes the program run faster',
        'It is required by Java syntax and has no other purpose',
      ],
      answer: 1,
      why: 'Declaring col inside the outer loop means every new row gets its own fresh counter starting at 1.',
    },
  ]}
/>

---

## A Row That Grows: Triangles

Patterns get more interesting once the inner loop's limit depends on the **outer** loop's current value.

```java
public class Main {
  public static void main(String[] args) {
    int n = 4;
    for (int row = 1; row <= n; row++) {
      for (int col = 1; col <= row; col++) { // notice: col <= row, not col <= n
        System.out.print("*");
      }
      System.out.println();
    }
  }
}
```

Output for `n = 4`:
```
*
**
***
****
```

<details>
<summary>
🧪 Try the code out!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`public class Main {
  public static void main(String[] args) {
    int n = 5;
    for (int row = 1; row <= n; row++) {
      for (int col = 1; col <= row; col++) {
        System.out.print("*");
      }
      System.out.println();
    }
  }
}
`}
/>

</details>

---

## Mini quiz — growing patterns

<MultipleChoice
  id="java-ch7a-growing"
  title="Growing patterns"
  questions={[
    {
      prompt: 'To print a triangle where row 1 has 1 star and row 5 has 5 stars, the inner loop condition should be',
      choices: ['col <= 5', 'col <= row', 'col < row', 'row <= col'],
      answer: 1,
      why: 'The inner limit has to change with the current row, so it depends on row, not a fixed number.',
    },
    {
      prompt: 'If you forget System.out.println() after the inner loop, what happens?',
      choices: [
        'The program will not compile',
        'Every star from every row gets printed on one single line',
        'Only the last row prints',
        'Nothing changes',
      ],
      answer: 1,
      why: 'println() is what moves output to a new line between rows. Without it, print() just keeps appending to the same line.',
    },
  ]}
/>

---

## Challenge: star triangle

Read one integer `n`. Print a triangle of `*` with `n` rows: row `i` has `i` stars, no spaces between stars, one row per line.

<CodingExam
  title="star triangle"
  heading="Challenge: star triangle"
  lang="java"
  filename="Main.java"
  prompt="Use a nested for loop: outer loop for rows 1..n, inner loop prints row stars."
  sampleLog={`(input) 3
*
**
***`}
  starter={`public class Main {
    public static void printTriangle(int n) {
        // TODO: print n rows, row i has i stars
    }
}
`}
  wrapPrefix={``}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        Main.printTriangle(n);
    }
}
`}
  sourceChecks={[
    { name: 'Uses a nested for loop', pattern: 'for\\s*\\(.*for\\s*\\(', flags: 's', must: true, hint: 'A for loop inside another for loop.' },
  ]}
  tests={[
    { name: 'n = 3', stdin: '3', equals: '*\n**\n***' },
    { name: 'n = 1', stdin: '1', equals: '*' },
    { name: 'n = 5', stdin: '5', equals: '*\n**\n***\n****\n*****' },
  ]}
/>

:::caution About the class name
Piston runs the file as `Main.java`, so the **public** class the tests call into must be named `Main`. If you want a separate class to hold your own `main`, name it something else (like `Runner` above) — Java allows more than one class per file as long as only one is `public`.
:::

---

## Challenge: multiplication row

Read two integers on one line: `row` and `limit`. Print the multiplication table row for `row`, from `row * 1` up to `row * limit`, space-separated.

<CodingExam
  title="multiplication row"
  heading="Challenge: multiplication row"
  lang="java"
  filename="Main.java"
  prompt="Loop col from 1 to limit, print row * col each time, separated by spaces."
  sampleLog={`(input) 3 5
3 6 9 12 15`}
  starter={`public class Main {
    public static String multRow(int row, int limit) {
        // TODO: build "row*1 row*2 ... row*limit" space separated
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int row = sc.nextInt();
        int limit = sc.nextInt();
        System.out.println(Main.multRow(row, limit));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a for loop', pattern: 'for\\s*\\(', must: true, hint: 'for (int col = 1; col <= limit; col++) { ... }' },
  ]}
  tests={[
    { name: '3 5', stdin: '3 5', equals: '3 6 9 12 15' },
    { name: '7 3', stdin: '7 3', equals: '7 14 21' },
    { name: '1 4', stdin: '1 4', equals: '1 2 3 4' },
  ]}
/>

---

## Chapter summary

:::important Key takeaways

1. A nested loop is a loop inside another loop: the **outer** loop picks the row, the **inner** loop does the work for that row.
2. The inner loop runs **completely** for every single pass of the outer loop — multiply the two trip counts to know the total number of inner-loop runs.
3. When a pattern grows or shrinks by row, the inner loop's limit depends on the outer loop's current variable (`col <= row`), not a fixed number.
4. `println()` (not `print()`) is what moves you to a new row between passes of the outer loop.

:::

## Exercises

<ExerciseSet>
<Exercise title="Checkerboard row" anchor="exercise-checkerboard">

:::tip Activity: Checkerboard row
Read one integer `n`. Print a single row of `n` characters alternating `#` and `.`, starting with `#` (e.g. for `n = 5`: `#.#.#`). You do not need a second nested loop for this one — think about how the column index (`col % 2`) decides which character to print.

<CodingExam
  title="Checkerboard row"
  heading="exercise-checkerboard"
  lang="java"
  filename="Main.java"
  prompt="For col from 0 to n-1, print '#' when col is even, '.' when col is odd."
  sampleLog={`(input) 5
#.#.#`}
  starter={`public class Main {
    public static String checker(int n) {
        // TODO
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(Main.checker(n));
    }
}
`}
  tests={[
    { name: 'n=5', stdin: '5', equals: '#.#.#' },
    { name: 'n=2', stdin: '2', equals: '#.' },
    { name: 'n=1', stdin: '1', equals: '#' },
  ]}
/>

:::

</Exercise>

<Exercise title="Grid sum" anchor="exercise-grid-sum">

:::tip Activity: Grid sum
Read one integer `n`. Using two nested loops (rows 1..n, cols 1..n), add up `row * col` for every cell and print the total.

<CodingExam
  title="Grid sum"
  heading="exercise-grid-sum"
  lang="java"
  filename="Main.java"
  prompt="Nested loop over rows and cols 1..n, accumulate row*col, print the sum."
  sampleLog={`(input) 3
36`}
  starter={`public class Main {
    public static int gridSum(int n) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(Main.gridSum(n));
    }
}
`}
  sourceChecks={[
    { name: 'Nested for loops', pattern: 'for\\s*\\(.*for\\s*\\(', flags: 's', must: true, hint: 'One for loop inside another.' },
  ]}
  tests={[
    { name: 'n=3', stdin: '3', equals: '36' },
    { name: 'n=1', stdin: '1', equals: '1' },
    { name: 'n=2', stdin: '2', equals: '9' },
  ]}
/>

:::

</Exercise>

<Exercise title="Fizz grid" anchor="exercise-fizz-grid">

:::tip Activity: Fizz grid
Read one integer `n`. For rows 1..n and cols 1..n, print `FB` if `row+col` is divisible by both 3 and 5, `F` if divisible by 3 only, `B` if divisible by 5 only, otherwise the sum `row+col` — all on one line per row, space-separated.

<CodingExam
  title="Fizz grid"
  heading="exercise-fizz-grid"
  lang="java"
  filename="Main.java"
  prompt="Nested loop: build one line per row, applying FizzBuzz rules to row+col, joined with spaces, one println per row."
  sampleLog={`(input) 2
2 F
F 4`}
  starter={`public class Main {
    public static void fizzGrid(int n) {
        // TODO: print n lines, each with n space-separated tokens
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        Main.fizzGrid(n);
    }
}
`}
  sourceChecks={[
    { name: 'Nested for loops', pattern: 'for\\s*\\(.*for\\s*\\(', flags: 's', must: true, hint: 'One for loop inside another.' },
  ]}
  tests={[
    { name: 'n=2', stdin: '2', equals: '2 F\nF 4' },
    { name: 'n=1', stdin: '1', equals: '2' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>
