---
title: Chapter 3b - Errors
---



**Syntax error**: Syntax errors are mistakes that a developer/user can do while writing the code.
Examples of syntax errors are missing commas,  quotes or spelling errors.

### Example Syntax Error
```java
System.out.print(" I Love Java ");// This line is correct
system.out.print(" I Love Java ");//Syntax Error as  's' of "system" is in lowercase.
```

**Logical Error**: A logical error is a bug in a program that causes it to produce wrong or unintended result. However, the program compiles and runs without showing an error on the console. 


### Example Logical Error

```java
class Main {
   public static void main(String args[]){
   int a = 20;
   int b = 0;
   int result=a/b;// it is logical error as program will compile and throw
   }              // error at runtime i.e. java.lang.ArithmeticException: / by zero
}

```

---

## Mini quiz — spot the error type

<MultipleChoice
  id="java-ch3b-errors"
  title="Syntax vs logical errors"
  questions={[
    {
      prompt: 'System.out.println("Hi") (missing the closing semicolon) is an example of a',
      choices: ['Logical error', 'Syntax error', 'Neither, it compiles fine', 'Runtime crash only'],
      answer: 1,
      why: 'A missing semicolon breaks the rules of Java grammar, so the compiler rejects it before the program can even run — that is a syntax error.',
    },
    {
      prompt: 'A program that compiles, runs, and prints "Total: 45" when it should print "Total: 50" has a',
      choices: ['Syntax error', 'Compile error', 'Logical error', 'Missing import'],
      answer: 2,
      why: 'The code is valid Java and runs without crashing, but produces the wrong result — that is a logical error, usually a mistake in the formula or logic.',
    },
    {
      prompt: 'int result = a / b; crashes with ArithmeticException when b is 0. This is best described as a',
      choices: [
        'Syntax error caught by the compiler',
        'Logical error that also causes a runtime crash',
        'A feature, not a bug',
        'A typo',
      ],
      answer: 1,
      why: 'The code compiles fine (it is valid Java), but dividing by zero is a logic mistake that the JVM detects and reports at runtime.',
    },
  ]}
/>

---

## Chapter summary

:::important Key takeaways

1. A **syntax error** breaks Java's grammar rules (missing semicolons, wrong capitalization, mismatched braces) — the compiler catches these before your program ever runs.
2. A **logical error** compiles and runs fine, but produces the wrong answer — these are the hardest to catch because Java gives you no error message.
3. Some logical mistakes (like dividing by zero) surface as a **runtime exception**, which at least tells you *where* things went wrong, even though the compiler could not catch it in advance.
4. Reading the exact wording of a compiler error (and the line number it points to) is the fastest way to fix a syntax error.

:::

## Exercises

<ExerciseSet>
<Exercise title="Fix the syntax error" anchor="exercise-fix-syntax">

:::tip Activity: Fix the syntax error
The starter code below is missing a semicolon. Fix it so it compiles and prints `Ready`.

<CodeExercise
  title="Fix the syntax error"
  heading="exercise-fix-syntax"
  lang="java"
  filename="Main.java"
  prompt="Add the missing semicolon so the program compiles and prints Ready."
  sampleLog={`(no input)
Ready`}
  starter={`public class Main {
    public static void main(String[] args) {
        System.out.println("Ready")
    }
}
`}
  tests={[
    { name: 'prints Ready', stdin: '', equals: 'Ready' },
  ]}
/>

:::

</Exercise>

<Exercise title="Fix the logical error" anchor="exercise-fix-logical">

:::tip Activity: Fix the logical error
The starter code is meant to print the average of `a` and `b`, but it has a logic bug — it divides by the wrong number. Read two integers and fix it so it prints the correct average as a `double`.

<CodeExercise
  title="Fix the logical error"
  heading="exercise-fix-logical"
  lang="java"
  filename="Main.java"
  prompt="The average of two numbers divides the sum by 2.0, not by the numbers themselves."
  sampleLog={`(input) 4 6
5.0`}
  starter={`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        double average = (a + b) / a; // bug: should divide by 2.0
        System.out.println(average);
    }
}
`}
  tests={[
    { name: '4 6', stdin: '4 6', equals: '5.0' },
    { name: '0 0', stdin: '0 0', equals: '0.0' },
  ]}
/>

:::

</Exercise>

<Exercise title="Guard against division by zero" anchor="exercise-guard-zero">

:::tip Activity: Guard against division by zero
Read two integers `a` and `b`. If `b` is `0`, print `Cannot divide by zero`. Otherwise print `a / b` as an integer.

<CodeExercise
  title="Guard against division by zero"
  heading="exercise-guard-zero"
  lang="java"
  filename="Main.java"
  prompt="Check if b == 0 before dividing to avoid the runtime ArithmeticException."
  sampleLog={`(input) 10 0
Cannot divide by zero`}
  starter={`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        // TODO: guard against b == 0
    }
}
`}
  sourceChecks={[
    { name: 'Checks for zero before dividing', pattern: 'b\\s*==\\s*0', must: true, hint: 'if (b == 0) { ... }' },
  ]}
  tests={[
    { name: 'divide by zero', stdin: '10 0', equals: 'Cannot divide by zero' },
    { name: 'normal division', stdin: '10 2', equals: '5' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>


