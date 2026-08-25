---
title: Chapter 8a - Arrays
---

## What Is an Array?

Up to now, one variable has held one value. An **array** is a single variable that holds a fixed-size list of values, all of the **same type**, side by side in memory. Each value has a position called its **index**, starting at `0`.

```java
public class Main {
  public static void main(String[] args) {
    int[] scores = {90, 85, 77, 100}; // an array literal
    System.out.println(scores[0]); // 90 - first element
    System.out.println(scores[3]); // 100 - last element
    System.out.println(scores.length); // 4 - how many slots (no parentheses!)
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
    int[] scores = {90, 85, 77, 100};
    System.out.println(scores[0]);
    System.out.println(scores[3]);
    System.out.println(scores.length);
  }
}
`}
/>

</details>

:::note Two ways to make an array
```java
int[] scores = {90, 85, 77, 100}; // literal, size and values fixed at creation
int[] empty  = new int[5];        // size 5, every slot starts at 0
```
:::

:::caution Index out of bounds
`scores[4]` on a 4-element array crashes with `ArrayIndexOutOfBoundsException` — valid indexes only go from `0` to `scores.length - 1`.
:::

---

## Mini quiz — array basics

<MultipleChoice
  id="java-ch8a-basics"
  title="Array basics"
  questions={[
    {
      prompt: 'int[] nums = {5, 10, 15}; What is nums[2]?',
      code: 'int[] nums = {5, 10, 15};',
      codeLang: 'java',
      choices: ['5', '10', '15', 'Error, index too high'],
      answer: 2,
      why: 'Indexes start at 0, so nums[0]=5, nums[1]=10, nums[2]=15.',
    },
    {
      prompt: 'What does nums.length return for the array above?',
      choices: ['2', '3', '15', 'You must call nums.length()'],
      answer: 1,
      why: 'length is a field on arrays, not a method — no parentheses, and it counts slots, so it is 3.',
    },
  ]}
/>

---

## Looping Over an Array

Two common ways to visit every element:

```java
public class Main {
  public static void main(String[] args) {
    int[] scores = {90, 85, 77, 100};

    // classic index loop - use this when you need the position too
    for (int i = 0; i < scores.length; i++) {
      System.out.println("Index " + i + " = " + scores[i]);
    }

    // for-each loop - use this when you only need the values
    for (int s : scores) {
      System.out.println("Score: " + s);
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
  height="360px"
  code={`public class Main {
  public static void main(String[] args) {
    int[] scores = {90, 85, 77, 100};
    for (int i = 0; i < scores.length; i++) {
      System.out.println("Index " + i + " = " + scores[i]);
    }
    for (int s : scores) {
      System.out.println("Score: " + s);
    }
  }
}
`}
/>

</details>

:::tip Which loop to use?
Use the index (`for (int i = 0; ...)`) loop when you need to know **where** something is, change a value, or compare neighbors. Use the for-each (`for (int s : scores)`) loop when you just need to look at every value once.
:::

---

## Mini quiz — looping and mutating

<MultipleChoice
  id="java-ch8a-looping"
  title="Looping over arrays"
  questions={[
    {
      prompt: 'Which loop would you use to double every value in an array in place?',
      choices: [
        'for (int v : arr) { v = v * 2; }',
        'for (int i = 0; i < arr.length; i++) { arr[i] = arr[i] * 2; }',
        'Either works exactly the same',
        'You cannot change array values once created',
      ],
      answer: 1,
      why: 'The for-each variable v is a copy of the value, changing it does not touch the array. You need the index to write back into arr[i].',
    },
    {
      prompt: 'What is the last valid index of an array declared as new int[6]?',
      choices: ['6', '5', '0', 'It depends on the values'],
      answer: 1,
      why: 'A 6-slot array has indexes 0 through 5.',
    },
  ]}
/>

---

## Challenge: sum of an array

Read an integer `n`, then read `n` integers on the next line. Print their sum.

<CodingExam
  title="sum of an array"
  heading="Challenge: sum of an array"
  lang="java"
  filename="Main.java"
  prompt="Fill the array from input, loop over it, add every value into a running total, print the total."
  sampleLog={`(input) 4
1 2 3 4
10`}
  starter={`public class Main {
    public static int sumArray(int[] nums) {
        // TODO: return the sum of all elements
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        System.out.println(Main.sumArray(nums));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a loop over the array', pattern: 'for\\s*\\(', must: true, hint: 'Loop with an index or for-each over nums.' },
  ]}
  tests={[
    { name: '4 nums', stdin: '4\n1 2 3 4', equals: '10' },
    { name: '1 num', stdin: '1\n7', equals: '7' },
    { name: 'with negatives', stdin: '3\n-1 5 -2', equals: '2' },
  ]}
/>

---

## Challenge: find the max

Read an integer `n`, then read `n` integers. Print the largest value.

<CodingExam
  title="find the max"
  heading="Challenge: find the max"
  lang="java"
  filename="Main.java"
  prompt="Track the biggest value seen so far while looping through the array."
  sampleLog={`(input) 5
3 9 1 9 4
9`}
  starter={`public class Main {
    public static int maxOf(int[] nums) {
        // TODO: return the largest value in nums
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        System.out.println(Main.maxOf(nums));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a loop over the array', pattern: 'for\\s*\\(', must: true, hint: 'Loop through nums comparing to a running max.' },
  ]}
  tests={[
    { name: 'mixed', stdin: '5\n3 9 1 9 4', equals: '9' },
    { name: 'single', stdin: '1\n-5', equals: '-5' },
    { name: 'increasing', stdin: '4\n1 2 3 4', equals: '4' },
  ]}
/>

---

## Chapter summary

:::important Key takeaways

1. An array holds many values of the **same type** under one name; each value is reached by its **index**, starting at `0`.
2. `.length` is a **field**, not a method — no parentheses. Valid indexes run from `0` to `length - 1`.
3. Use an index loop (`for (int i = 0; ...)`) when you need position or want to change values; use a for-each loop (`for (int v : arr)`) when you only need to read each value once.
4. Reading past the end (or before the start) throws `ArrayIndexOutOfBoundsException` at runtime — Java will not let you silently read garbage memory.

:::

## Exercises

<ExerciseSet>
<Exercise title="Reverse print" anchor="exercise-reverse-print">

:::tip Activity: Reverse print
Read an integer `n`, then `n` integers. Print them in reverse order, space-separated.

<CodingExam
  title="Reverse print"
  heading="exercise-reverse-print"
  lang="java"
  filename="Main.java"
  prompt="Loop the index from the last slot down to 0, building the output."
  sampleLog={`(input) 4
1 2 3 4
4 3 2 1`}
  starter={`public class Main {
    public static String reversed(int[] nums) {
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
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(Main.reversed(nums));
    }
}
`}
  tests={[
    { name: '4 nums', stdin: '4\n1 2 3 4', equals: '4 3 2 1' },
    { name: '1 num', stdin: '1\n9', equals: '9' },
    { name: '3 nums', stdin: '3\n5 6 7', equals: '7 6 5' },
  ]}
/>

:::

</Exercise>

<Exercise title="Count evens" anchor="exercise-count-evens">

:::tip Activity: Count evens
Read an integer `n`, then `n` integers. Print how many of them are even.

<CodingExam
  title="Count evens"
  heading="exercise-count-evens"
  lang="java"
  filename="Main.java"
  prompt="Loop through the array, increment a counter when nums[i] % 2 == 0."
  sampleLog={`(input) 5
1 2 3 4 6
3`}
  starter={`public class Main {
    public static int countEvens(int[] nums) {
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
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(Main.countEvens(nums));
    }
}
`}
  tests={[
    { name: '5 nums', stdin: '5\n1 2 3 4 6', equals: '3' },
    { name: 'all odd', stdin: '3\n1 3 5', equals: '0' },
    { name: 'all even', stdin: '2\n2 4', equals: '2' },
  ]}
/>

:::

</Exercise>

<Exercise title="Index of value" anchor="exercise-index-of">

:::tip Activity: Index of value
Read `n` integers, then a target value. Print the index of the **first** array slot that equals the target, or `-1` if it is not found.

<CodingExam
  title="Index of value"
  heading="exercise-index-of"
  lang="java"
  filename="Main.java"
  prompt="Loop with the index, return i as soon as nums[i] equals target; return -1 if the loop finishes."
  sampleLog={`(input) 4
5 8 2 8
8
1`}
  starter={`public class Main {
    public static int indexOf(int[] nums, int target) {
        // TODO
        return -1;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        int target = sc.nextInt();
        System.out.println(Main.indexOf(nums, target));
    }
}
`}
  tests={[
    { name: 'found', stdin: '4\n5 8 2 8\n8', equals: '1' },
    { name: 'not found', stdin: '3\n1 2 3\n9', equals: '-1' },
    { name: 'first slot', stdin: '3\n7 1 1\n7', equals: '0' },
  ]}
/>

:::

</Exercise>

<Exercise title="Average of array" anchor="exercise-average">

:::tip Activity: Average of array
Read `n` integers. Print their average as a `double` (e.g. `2.5`).

<CodingExam
  title="Average of array"
  heading="exercise-average"
  lang="java"
  filename="Main.java"
  prompt="Sum the array, then divide by nums.length using double division (cast one side to double)."
  sampleLog={`(input) 4
1 2 3 4
2.5`}
  starter={`public class Main {
    public static double average(int[] nums) {
        // TODO
        return 0.0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        System.out.println(Main.average(nums));
    }
}
`}
  tests={[
    { name: '4 nums', stdin: '4\n1 2 3 4', equals: '2.5' },
    { name: '2 nums', stdin: '2\n3 4', equals: '3.5' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>
