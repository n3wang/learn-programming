---
title: Chapter 6b - For Loops
---


## Introducing For Loops


```java

import java.util.*;
class Main {
  public static void main(String[] args) {
    for(int i = 1; i<3; i++){
      System.out.println(i);
    }
    
  }
}

```

<iframe src="https://trinket.io/embed/java/4827fcc3f6" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>


:::note
![](https://qph.cf2.quoracdn.net/main-qimg-57de0b301da5ce4c0dd813bc26162c80)

Animation extracted from [Quora](https://www.quora.com/How-do-I-use-a-for-loop-in-Java)
:::

[👀](https://learn2codelive.com/courses/107/pages/lesson-6-learning-activities-e1-introduce-for-loop-in-python?module_item_id=9181)


## Placing Tables

```java
import java.util.*;
// https://www.geeksforgeeks.org/java-for-loop-with-examples/
class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    // a simulation of setting the table
    System.out.println("Enter number of table placements to be set");
    int n = sc.nextInt();
    sc.close();
    int i;
    for(i = 1; i<=n; i++){
      System.out.println("Plate placed");
      System.out.println("Silverware placed");
      System.out.println("Napkin placed");
      System.out.println("Glass of water placed");
      System.out.println("Table has been set for " + i);
      System.out.println();
    }
    System.out.println("It's dinner time!");
  }
}
```

---

### Try it: for loops

<PistonRunner
  lang="java"
  interactive={false}
  height="260px"
  code={`public class Main {
  public static void main(String[] args) {
    for (int i = 1; i <= 5; i++) {
      System.out.println("Count: " + i);
    }
  }
}
`}
/>

<MultipleChoice
  id="java-ch6b-forloop"
  title="For loops"
  questions={[
    {
      prompt: 'for (int i = 0; i < 5; i++) { ... } — how many times does the body run?',
      code: 'for (int i = 0; i < 5; i++) { ... }',
      codeLang: 'java',
      choices: ['4', '5', '6', 'infinite'],
      answer: 1,
      why: 'i takes the values 0, 1, 2, 3, 4 — five values — before i < 5 becomes false and the loop stops.',
    },
    {
      prompt: 'The three parts of for (init; condition; update) run in what order?',
      choices: [
        'update, condition, body, repeat',
        'init once, then repeatedly: check condition, run body, run update',
        'condition, init, body, update',
        'They all run once, in order, and then the loop ends',
      ],
      answer: 1,
      why: 'init runs exactly once at the very start. Then the loop repeatedly checks the condition, runs the body if true, and runs the update — in that order — until the condition is false.',
    },
  ]}
/>

<CodeExercise
  title="sum 1 to n"
  heading="Try it: sum 1 to n"
  lang="java"
  filename="Main.java"
  prompt="Read n. Use a for loop to add 1 + 2 + ... + n, print the total."
  sampleLog={`(input) 5
15`}
  starter={`public class Main {
    public static int sumToN(int n) {
        // TODO: for loop accumulating 1..n
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(Main.sumToN(n));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a for loop', pattern: 'for\\s*\\(', must: true, hint: 'for (int i = 1; i <= n; i++) { ... }' },
  ]}
  tests={[
    { name: 'n=5', stdin: '5', equals: '15' },
    { name: 'n=1', stdin: '1', equals: '1' },
    { name: 'n=10', stdin: '10', equals: '55' },
  ]}
/>

---

## Chapter summary

:::important Key takeaways

1. `for (init; condition; update)` bundles a loop's setup, its stopping condition, and its per-pass update into one line — reach for it whenever you already know the number of repetitions (or can compute it).
2. The `init` runs once; then Java repeatedly checks `condition`, runs the body, and runs `update`, in that order, until `condition` is false.
3. A `for` loop is usually the clearer choice when counting up or down over a known range; a `while` loop is usually clearer when you are waiting for something to happen (like valid input).
4. Nesting a `for` loop inside another is exactly how you build grids, tables, and patterns — covered in the next chapter.

:::

## Exercises

<ExerciseSet>
<Exercise title="Print evens" anchor="exercise-print-evens">

:::tip Activity: Print evens
Read an integer `n`. Print every even number from `2` up to `n` (inclusive), one per line, using a `for` loop.

<CodeExercise
  title="Print evens"
  heading="exercise-print-evens"
  lang="java"
  filename="Main.java"
  prompt="for (int i = 2; i <= n; i += 2) print i."
  sampleLog={`(input) 8
2
4
6
8`}
  starter={`public class Main {
    public static void printEvens(int n) {
        // TODO
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        Main.printEvens(n);
    }
}
`}
  sourceChecks={[
    { name: 'Uses a for loop', pattern: 'for\\s*\\(', must: true, hint: 'for (int i = 2; i <= n; i += 2) { ... }' },
  ]}
  tests={[
    { name: 'n=8', stdin: '8', equals: '2\n4\n6\n8' },
    { name: 'n=2', stdin: '2', equals: '2' },
  ]}
/>

:::

</Exercise>

<Exercise title="Multiplication table" anchor="exercise-mult-table">

:::tip Activity: Multiplication table
Read an integer `n`. Print the multiplication table for `n`, from `n * 1` to `n * 10`, one line per row formatted as `n x i = result`.

<CodeExercise
  title="Multiplication table"
  heading="exercise-mult-table"
  lang="java"
  filename="Main.java"
  prompt={"for i from 1 to 10, print n + \" x \" + i + \" = \" + (n * i)."}
  sampleLog={`(input) 3
3 x 1 = 3
3 x 2 = 6`}
  starter={`public class Main {
    public static void table(int n) {
        // TODO: print 10 lines, "n x i = n*i"
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        Main.table(n);
    }
}
`}
  sourceChecks={[
    { name: 'Uses a for loop', pattern: 'for\\s*\\(', must: true, hint: 'for (int i = 1; i <= 10; i++) { ... }' },
  ]}
  tests={[
    { name: 'n=3 first two rows', stdin: '3', includes: ['3 x 1 = 3', '3 x 2 = 6', '3 x 10 = 30'] },
  ]}
/>

:::

</Exercise>

<Exercise title="Count vowels" anchor="exercise-count-vowels">

:::tip Activity: Count vowels
Read a lowercase word. Loop over its characters with a `for` loop (`word.charAt(i)`) and print how many are vowels (`a`, `e`, `i`, `o`, `u`).

<CodeExercise
  title="Count vowels"
  heading="exercise-count-vowels"
  lang="java"
  filename="Main.java"
  prompt="for (int i = 0; i < word.length(); i++) check word.charAt(i) against the vowels."
  sampleLog={`(input) banana
3`}
  starter={`public class Main {
    public static int countVowels(String word) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        String word = sc.next();
        System.out.println(Main.countVowels(word));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a for loop', pattern: 'for\\s*\\(', must: true, hint: 'for (int i = 0; i < word.length(); i++) { ... }' },
    { name: 'Uses charAt', pattern: 'charAt', must: true, hint: 'word.charAt(i)' },
  ]}
  tests={[
    { name: 'banana', stdin: 'banana', equals: '3' },
    { name: 'no vowels', stdin: 'gym', equals: '0' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>






