---
title: Chapter 9a - Methods
---

## Why Write a Method?

So far every line of your programs has lived inside `main`. A **method** is a named, reusable block of code that you can call whenever you need it — instead of copy-pasting the same lines again and again.

```java
public class Main {

  // a method: return type, name, parameters
  public static int square(int n) {
    return n * n;
  }

  public static void main(String[] args) {
    System.out.println(square(4));  // 16
    System.out.println(square(7));  // 49
    int x = square(3);
    System.out.println(x);          // 9
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
  height="340px"
  code={`public class Main {
  public static int square(int n) {
    return n * n;
  }

  public static void main(String[] args) {
    System.out.println(square(4));
    System.out.println(square(7));
    int x = square(3);
    System.out.println(x);
  }
}
`}
/>

</details>

:::note Anatomy of a method
```java
public static int square(int n) {
//     ^^^^^^ ^^^^^^ ^^^^^^ ^
//     return   name  parameter
//     type
  return n * n;
}
```
- **Return type** — what kind of value comes back out (`int`, `double`, `String`, or `void` for nothing).
- **Name** — how you call it, e.g. `square(...)`.
- **Parameter(s)** — the inputs it needs, listed in parentheses. `n` here is a **parameter**; the `4` you pass in when calling is the **argument**.
- **`return`** — hands a value back to whoever called the method. A `void` method never uses `return value;` (it may use a bare `return;` to exit early).
:::

---

## Mini quiz — method anatomy

<MultipleChoice
  id="java-ch9a-anatomy"
  title="Method anatomy"
  questions={[
    {
      prompt: 'public static int square(int n) { return n * n; } — what is n called here?',
      choices: ['An argument', 'A parameter', 'A return type', 'A method name'],
      answer: 1,
      why: 'n is the variable listed in the method definition — that makes it a parameter. The value you pass in when calling, like square(4), is the argument.',
    },
    {
      prompt: 'A method declared as public static void greet() { ... }',
      choices: [
        'Must end with return someValue;',
        'Cannot use return at all, ever',
        'Never returns a value, but may use a bare return; to exit early',
        'Only works inside main',
      ],
      answer: 2,
      why: 'void means "returns nothing." You may still write a bare return; to leave the method early, just not return something;.',
    },
  ]}
/>

---

## Calling Methods From Each Other

Methods can call other methods, which is how larger programs stay organized into small, testable pieces.

```java
public class Main {
  public static boolean isEven(int n) {
    return n % 2 == 0;
  }

  public static String describe(int n) {
    if (isEven(n)) {
      return n + " is even";
    } else {
      return n + " is odd";
    }
  }

  public static void main(String[] args) {
    System.out.println(describe(4));
    System.out.println(describe(7));
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
  public static boolean isEven(int n) {
    return n % 2 == 0;
  }

  public static String describe(int n) {
    if (isEven(n)) {
      return n + " is even";
    } else {
      return n + " is odd";
    }
  }

  public static void main(String[] args) {
    System.out.println(describe(4));
    System.out.println(describe(7));
  }
}
`}
/>

</details>

:::tip Parameters are local
A parameter only exists **inside** its own method. Changing `n` inside `square` never affects any variable named `n` somewhere else — each method call gets its own fresh copy.
:::

---

## Mini quiz — calling and scope

<MultipleChoice
  id="java-ch9a-scope"
  title="Calling methods and scope"
  questions={[
    {
      prompt: 'Why can describe(int n) call isEven(n) directly, without importing anything?',
      choices: [
        'It cannot, this would be a compile error',
        'Both methods live in the same class, so they can call each other freely',
        'isEven must be declared inside describe',
        'You need to create a new Main object first',
      ],
      answer: 1,
      why: 'static methods in the same class can call one another directly by name.',
    },
    {
      prompt: 'public static int square(int n) { n = 100; return n * n; } — after calling int x = square(5); is the original 5 changed anywhere else?',
      choices: [
        'Yes, every variable named n anywhere becomes 100',
        'No, n is a local copy that only exists inside this call to square',
        'Only if n was declared static',
        'It depends on the return type',
      ],
      answer: 1,
      why: 'Parameters are local to the method call. Reassigning n inside square has no effect outside it.',
    },
  ]}
/>

---

## Challenge: isEven

Write a method `isEven(int n)` that returns `true` if `n` is even, `false` otherwise. Read one integer and print the result.

<CodingExam
  title="isEven"
  heading="Challenge: isEven"
  lang="java"
  filename="Main.java"
  prompt="Return n % 2 == 0."
  sampleLog={`(input) 4
true`}
  starter={`public class Main {
    public static boolean isEven(int n) {
        // TODO
        return false;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(Main.isEven(n));
    }
}
`}
  sourceChecks={[
    { name: 'Uses the modulus operator', pattern: '%', must: true, hint: 'n % 2 == 0' },
  ]}
  tests={[
    { name: 'even', stdin: '4', equals: 'true' },
    { name: 'odd', stdin: '7', equals: 'false' },
    { name: 'zero', stdin: '0', equals: 'true' },
    { name: 'negative even', stdin: '-6', equals: 'true' },
  ]}
/>

---

## Challenge: max of two

Write a method `maxOf(int a, int b)` that returns the larger of the two. Read two integers and print the result.

<CodingExam
  title="max of two"
  heading="Challenge: max of two"
  lang="java"
  filename="Main.java"
  prompt="Compare a and b, return the bigger one."
  sampleLog={`(input) 3 9
9`}
  starter={`public class Main {
    public static int maxOf(int a, int b) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(Main.maxOf(a, b));
    }
}
`}
  tests={[
    { name: 'b bigger', stdin: '3 9', equals: '9' },
    { name: 'a bigger', stdin: '20 5', equals: '20' },
    { name: 'equal', stdin: '4 4', equals: '4' },
  ]}
/>

---

## Chapter summary

:::important Key takeaways

1. A method groups reusable code under a name, so you write the logic once and call it as many times as you need.
2. Its signature has a **return type**, a **name**, and zero or more **parameters** — the values passed in when calling are **arguments**.
3. `void` methods return nothing; every other return type must use `return value;` on every path through the method.
4. Parameters are local: each call gets its own fresh copies, and changes inside one method call never leak out to other variables.
5. Methods in the same class can call each other directly by name — this is how you build bigger programs from small, testable pieces.

:::

## Exercises

<ExerciseSet>
<Exercise title="Factorial" anchor="exercise-factorial">

:::tip Activity: Factorial
Write a method `factorial(int n)` that returns `n!` (`n * (n-1) * ... * 1`, and `0! = 1`). Read one integer and print the result.

<CodingExam
  title="Factorial"
  heading="exercise-factorial"
  lang="java"
  filename="Main.java"
  prompt="Multiply a running total by every number from 1 to n (loop inside the method)."
  sampleLog={`(input) 5
120`}
  starter={`public class Main {
    public static long factorial(int n) {
        // TODO
        return 1;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(Main.factorial(n));
    }
}
`}
  tests={[
    { name: '5!', stdin: '5', equals: '120' },
    { name: '0!', stdin: '0', equals: '1' },
    { name: '1!', stdin: '1', equals: '1' },
  ]}
/>

:::

</Exercise>

<Exercise title="Sentence builder" anchor="exercise-sentence">

:::tip Activity: Sentence builder
Write a method `intro(String name, int age)` that returns the sentence `"NAME is AGE years old"`. Read a name (one word) and an age, then print the result.

<CodingExam
  title="Sentence builder"
  heading="exercise-sentence"
  lang="java"
  filename="Main.java"
  prompt="Concatenate the parameters into one sentence and return it."
  sampleLog={`(input) Ada 28
Ada is 28 years old`}
  starter={`public class Main {
    public static String intro(String name, int age) {
        // TODO
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        String name = sc.next();
        int age = sc.nextInt();
        System.out.println(Main.intro(name, age));
    }
}
`}
  tests={[
    { name: 'Ada 28', stdin: 'Ada 28', equals: 'Ada is 28 years old' },
    { name: 'Lin 15', stdin: 'Lin 15', equals: 'Lin is 15 years old' },
  ]}
/>

:::

</Exercise>

<Exercise title="Is prime" anchor="exercise-is-prime">

:::tip Activity: Is prime
Write a method `isPrime(int n)` that returns `true` if `n` is a prime number (greater than 1, only divisible by 1 and itself), `false` otherwise. Read one integer and print the result.

<CodingExam
  title="Is prime"
  heading="exercise-is-prime"
  lang="java"
  filename="Main.java"
  prompt="Loop divisors from 2 up to n-1 (or sqrt(n)); if any divides n evenly, it is not prime. Numbers below 2 are not prime."
  sampleLog={`(input) 7
true`}
  starter={`public class Main {
    public static boolean isPrime(int n) {
        // TODO
        return false;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(Main.isPrime(n));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a loop', pattern: 'for\\s*\\(|while\\s*\\(', must: true, hint: 'Check divisors with a loop.' },
  ]}
  tests={[
    { name: 'prime 7', stdin: '7', equals: 'true' },
    { name: 'not prime 8', stdin: '8', equals: 'false' },
    { name: 'edge 1', stdin: '1', equals: 'false' },
    { name: 'smallest prime', stdin: '2', equals: 'true' },
  ]}
/>

:::

</Exercise>

<Exercise title="Reverse digits" anchor="exercise-reverse-digits">

:::tip Activity: Reverse digits
Write a method `reverseDigits(int n)` that returns `n` with its digits reversed (`n` is a positive integer). Read one integer and print the result.

<CodingExam
  title="Reverse digits"
  heading="exercise-reverse-digits"
  lang="java"
  filename="Main.java"
  prompt="Peel off digits with % 10 and / 10, build the reversed number."
  sampleLog={`(input) 1234
4321`}
  starter={`public class Main {
    public static int reverseDigits(int n) {
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
        System.out.println(Main.reverseDigits(n));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a loop', pattern: 'for\\s*\\(|while\\s*\\(', must: true, hint: 'Peel digits off with % and / inside a loop.' },
  ]}
  tests={[
    { name: '1234', stdin: '1234', equals: '4321' },
    { name: 'single digit', stdin: '7', equals: '7' },
    { name: 'trailing zero', stdin: '1200', equals: '21' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>
