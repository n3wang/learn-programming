---
sidebar_position: 1
title: Chapter 1a - Variables
---


## Variables

Example Variables
```java
int age=15;
```

<details>
<summary>
🧪 Try the code out!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="520px"
  code={`public class Main {
  public static void main(String[] args) {
    int age=15;
  }
}
`}
/>

</details>

- Do you think you are able to change the printing message from `Hello World` to a different thing?

## Basic Math Operations using Variables

```java
  int num = 100;
  // Addition
  int sum    = 20 + 10;
  System.out.println(sum);

  // Subtraction
  int sub    = 20 - 10;
  System.out.println(sub);

  // Multiplication
  int mul    = 20 * 10;
  System.out.println(mul);

  // Division
  int div    = 20 - 10;
  System.out.println(div);

```

<details>
<summary>
🧪 Try the code out!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="520px"
  code={`public class Main {
  public static void main(String[] args) {
    int age=15;
  }
}
`}
/>

</details>

### Try it: math operators

<PistonRunner
  lang="java"
  interactive={false}
  height="320px"
  code={`public class Main {
  public static void main(String[] args) {
    int num = 100;
    int sum = 20 + 10;
    int sub = 20 - 10;
    int mul = 20 * 10;
    int div = 20 / 10;
    System.out.println(sum);
    System.out.println(sub);
    System.out.println(mul);
    System.out.println(div);
  }
}
`}
/>

<MultipleChoice
  id="java-ch1a-math"
  title="Basic math operators"
  questions={[
    {
      prompt: 'int result = 20 - 10; What is result?',
      code: 'int result = 20 - 10;',
      codeLang: 'java',
      choices: ['30', '10', '2', '200'],
      answer: 1,
      why: '20 minus 10 is 10.',
    },
    {
      prompt: 'What does the = symbol do in int sum = 20 + 10;?',
      choices: [
        'Checks if the two sides are equal',
        'Stores the value on the right into the variable on the left',
        'Prints the value',
        'Declares a new class',
      ],
      answer: 1,
      why: 'In Java, = is assignment, not equality. It computes the right side, then stores that value in sum.',
    },
  ]}
/>

<CodeExercise
  title="add two numbers"
  heading="Try it: add two numbers"
  lang="java"
  filename="Main.java"
  prompt="Read two integers on one line and print their sum."
  sampleLog={`(input) 10 20
30`}
  starter={`public class Main {
    public static int add(int a, int b) {
        // TODO: return a + b
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
        System.out.println(Main.add(a, b));
    }
}
`}
  tests={[
    { name: '10 20', stdin: '10 20', equals: '30' },
    { name: 'negatives', stdin: '-5 5', equals: '0' },
    { name: 'zeros', stdin: '0 0', equals: '0' },
  ]}
/>

---

### Example Program that adds two variables
```java
class Main{ //”class” is a keyword which is used to define a class.
  public static void main(String[] args) {
    System.out.println("PROGRAM TO ADD TWO NUMBERS");
    int num1 = 10; // num1 is a variable of int data type
    int num2 = 20; // num2 is a variable of int data type
    int sum = num1 + num2; //sum is a variable of int data type
    System.out.println(num1);
    System.out.println(num2);
    System.out.println(sum);
  }
}

```

### Rules for Defining Variables
It is important to follow the below guidelines to name a variable in java.

- A variable must start with a letter of the alphabet or an underscore (_).
- A variable name can have alphabets, numbers & underscore (_).
- No white space (spaces) is allowed within the variable name.
- Variable names are case sensitive.
- A variable name must not be any reserved word or keyword e.g. char, float etc.

![](../../static/img/2022-04-27-04-14-39.png)
<details>
<summary>
🧪 Try the code out!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="520px"
  code={`public class Main {
  public static void main(String[] args) {
    int age=15;
  }
}
`}
/>

</details>

## Concatenation

### Concatenating Words

```java
System.out.println("Pineapple " + " Pen");
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
    int age=15;
  }
}
`}
/>

</details>

### You can also concatenate int and words

```java
int books = 51;
System.out.println("I have " + books + " books in my study");  

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
    int age=15;
  }
}
`}
/>

</details>


### Try it: concatenation

<PistonRunner
  lang="java"
  interactive={false}
  height="260px"
  code={`public class Main {
  public static void main(String[] args) {
    int books = 51;
    System.out.println("I have " + books + " books in my study");
  }
}
`}
/>

<MultipleChoice
  id="java-ch1a-concat"
  title="Concatenation"
  questions={[
    {
      prompt: 'System.out.println("Score: " + 5 + 5); What does this print?',
      code: 'System.out.println("Score: " + 5 + 5);',
      codeLang: 'java',
      choices: ['Score: 10', 'Score: 55', '10', 'Error'],
      answer: 1,
      why: '+ runs left to right. "Score: " + 5 becomes the string "Score: 5" first, then + 5 appends another "5", giving "Score: 55".',
    },
    {
      prompt: 'Which of these concatenates a String and an int correctly?',
      choices: [
        'System.out.println("Age: " + age);',
        'System.out.println("Age: ".plus(age));',
        'System.out.println("Age: " & age);',
        'System.out.println(concat("Age: ", age));',
      ],
      answer: 0,
      why: 'The + operator works between a String and any other type in Java — the other value is converted to text automatically.',
    },
  ]}
/>

<CodeExercise
  title="greeting sentence"
  heading="Try it: greeting sentence"
  lang="java"
  filename="Main.java"
  prompt="Read a name (one word) and an integer age. Print: NAME is AGE years old"
  sampleLog={`(input) Sam 12
Sam is 12 years old`}
  starter={`public class Main {
    public static String greet(String name, int age) {
        // TODO: return name + " is " + age + " years old"
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
        System.out.println(Main.greet(name, age));
    }
}
`}
  sourceChecks={[
    { name: 'Uses string concatenation', pattern: '\\+', must: true, hint: 'name + " is " + age + " years old"' },
  ]}
  tests={[
    { name: 'Sam 12', stdin: 'Sam 12', equals: 'Sam is 12 years old' },
    { name: 'Ada 30', stdin: 'Ada 30', equals: 'Ada is 30 years old' },
  ]}
/>

---

[👀 E2 Practice 3](https://learn2codelive.com/courses/107/pages/lesson-1-learning-activities-e2-practice-activity-3-age-calculator?module_item_id=9031)

### Exercises

:::tip Activity: Age Calculator 
Write a Java program that uses year of birth and current year to calculate the age of a person. Make sure to output the year of birth, current year and age in a neatly formatted sentence.

Before you start, think about how many variables you will need for this activity.
Expected Output:
```
Age Calculator
---------------
Year Of Birth: 2005
Current Year: 2020
Age : 15
```

<details>
<summary>
✍ Solve the problem using Replit
</summary>
<a href="https://replit.com/@n3wang/EmptyJavaCanvas#Main.java" >Feel free to use Repl, you can fork from this empty canvas in Repl.it</a>

</details>

<details>
<summary>
✍  You can solve the problem here using Piston below
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="520px"
  code={`public class Main {
  public static void main(String[] args) {
    int age=15;
  }
}
`}
/>

</details>

<details>
    <summary>
        💡 Hint Program: This program calculates when you will be 20.
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`public class Main {
  public static void main(String[] args) {
    int age=15;
  }
}
`}
/>

</details>

:::


[👀 E2 Practice 4](https://learn2codelive.com/courses/107/pages/lesson-1-learning-activities-e2-practice-activity-4-hiking?module_item_id=9032)

:::tip Activity Hiking ⛰

Pete and Shannon are hiking. Shannon is always 2 miles ahead of Pete. What is the distance Shannon has covered if Pete has covered 10 miles? How would the program change if Shannon has covered twice as much distance as Pete?
The output should look something like this:
```
If Shannon is two miles ahead of Pete, distance hiked by Shannon is 12 miles

If Shannon covers twice as much distance as Pete, distance travelled by Shannon is 20 miles
```
<details>
<summary>
✍ Solve the problem using Replit
</summary>
<a href="https://replit.com/@n3wang/EmptyJavaCanvas#Main.java" >Feel free to use Repl, you can fork from this empty canvas in Repl.it</a>

</details>

<details>
<summary>
✍  You can solve the problem here using Piston below
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="520px"
  code={`public class Main {
  public static void main(String[] args) {
    int age=15;
  }
}
`}
/>

</details>

:::

---

## Chapter summary

:::important Key takeaways

1. A variable is a named box for a value; give it a type (`int`, `float`, ...), a name, and a value with `=`.
2. Variable names must start with a letter or underscore, contain no spaces, and cannot be a reserved keyword.
3. `+` between numbers adds; `+` between a `String` and anything else concatenates text, evaluated left to right.
4. `System.out.println` adds a newline after printing; `System.out.print` does not.

:::

## Exercises

<ExerciseSet>
<Exercise title="Temperature converter" anchor="exercise-temp-converter">

:::tip Activity: Temperature converter
Read a temperature in Celsius as a `double`. Print the Fahrenheit equivalent using `F = C * 9 / 5 + 32`.

<CodeExercise
  title="Temperature converter"
  heading="exercise-temp-converter"
  lang="java"
  filename="Main.java"
  prompt="Return celsius * 9 / 5 + 32."
  sampleLog={`(input) 0
32.0`}
  starter={`public class Main {
    public static double toFahrenheit(double celsius) {
        // TODO
        return 0.0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double c = sc.nextDouble();
        System.out.println(Main.toFahrenheit(c));
    }
}
`}
  tests={[
    { name: 'freezing', stdin: '0', equals: '32.0' },
    { name: 'boiling', stdin: '100', equals: '212.0' },
    { name: 'body temp', stdin: '37', equals: '98.6' },
  ]}
/>

:::

</Exercise>

<Exercise title="Rectangle area" anchor="exercise-rectangle-area">

:::tip Activity: Rectangle area
Read a width and a height (integers). Print the area.

<CodeExercise
  title="Rectangle area"
  heading="exercise-rectangle-area"
  lang="java"
  filename="Main.java"
  prompt="Return width * height."
  sampleLog={`(input) 4 5
20`}
  starter={`public class Main {
    public static int area(int width, int height) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int w = sc.nextInt();
        int h = sc.nextInt();
        System.out.println(Main.area(w, h));
    }
}
`}
  tests={[
    { name: '4 5', stdin: '4 5', equals: '20' },
    { name: '1 1', stdin: '1 1', equals: '1' },
  ]}
/>

:::

</Exercise>

<Exercise title="Simple interest" anchor="exercise-simple-interest">

:::tip Activity: Simple interest
Read a principal, a rate (percent, e.g. `5` means 5%), and time in years — all as `double`. Print the simple interest using `I = P * R * T / 100`.

<CodeExercise
  title="Simple interest"
  heading="exercise-simple-interest"
  lang="java"
  filename="Main.java"
  prompt="Return principal * rate * time / 100."
  sampleLog={`(input) 1000 5 2
100.0`}
  starter={`public class Main {
    public static double interest(double principal, double rate, double time) {
        // TODO
        return 0.0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double p = sc.nextDouble();
        double r = sc.nextDouble();
        double t = sc.nextDouble();
        System.out.println(Main.interest(p, r, t));
    }
}
`}
  tests={[
    { name: '1000 5 2', stdin: '1000 5 2', equals: '100.0' },
    { name: '2000 10 1', stdin: '2000 10 1', equals: '200.0' },
  ]}
/>

:::

</Exercise>

<Exercise title="Swap with a helper" anchor="exercise-swap">

:::tip Activity: Swap with a helper
Read two integers `a` and `b`. Using a third variable, print them swapped: `b a`.

<CodeExercise
  title="Swap with a helper"
  heading="exercise-swap"
  lang="java"
  filename="Main.java"
  prompt={"Copy a into a temp variable, assign b into a, then temp into b. Return the pair as \"b a\"."}
  sampleLog={`(input) 1 2
2 1`}
  starter={`public class Main {
    public static String swap(int a, int b) {
        // TODO: use a third variable to swap, return b + " " + a
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(Main.swap(a, b));
    }
}
`}
  tests={[
    { name: '1 2', stdin: '1 2', equals: '2 1' },
    { name: '9 4', stdin: '9 4', equals: '4 9' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>
