---
sidebar_position: 4
title: Chapter 2b - Typecasting
---

## Typecasting


:::note Casting
![](../../static/img/2022-05-04-04-15-52.png)
We can sort of do something similar in Java, but with Variable Types
| Images extracted from [P Akthy](https://en.wikipedia.org/wiki/Casting#/media/File:Cast_iron_melting.JPG) and [machinemfg](https://www.machinemfg.com/types-of-casting/)
:::


<details>
<summary>
📚 Explicit & Implicit?
    </summary>

- **Explicit**: stated clearly and in detail, leaving no room for confusion or doubt.
- **Implicit**: implied though not plainly expressed.

</details>

### Example Implicit Typecasting
```java
public class Main {
 public static void main(String args[]) {
   int x = 10; // integer x
   // x is implicitly converted to float
   float z =x + 1.0f;
   System.out.println("x = " + x );
   System.out.println("z = 'x+1.0f'(x=10) = " + z );
 }
}
```

Output
```
x = 10
z = 'x+1.0f'(x=10) = 11.0
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
    // TODO: write your program here
    System.out.println("Hello");
  }
}
`}
/>

</details>


### Example Explicit Typecasting

```java
public class Main {

public static void main(String args[]) {
  double d=1.6;
  int val=(int)d; //casting from double to int
  System.out.println("val = "+val );
  }
}
```
Output
```
val = 1
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
    val = 1
  }
}
`}
/>

🙋‍♂️ Analysis
- Why do you think that the code prints `1` instead of `1.6`?


</details>



:::caution Typecasting might lead to loss of precision
In Implicit conversions, one data type is automatically converted into another if found compatible, but it should be in the right order else it may lead to loss of precision.
 
 ```
 char->short-> int->float->double->long
 ```
:::

## Potential Errors When Typecasting

### Avoiding Errors: This will throw you an error
```java
public class Main {
 public static void main(String args[]) {
 int val=(int)2.4 - 2.1;
 System.out.println("val = " +val);
 }
}
```

![](2022-05-04-13-58-33.png)

<details>
<summary>
🧪 Try the code out! - This will throw an error
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`public class Main {
  public static void main(String[] args) {
    // TODO: write your program here
    System.out.println("Hello");
  }
}
`}
/>

</details>

###  Do this instead

```java
public class Main {
 public static void main(String args[]) {
 int val=(int)(2.4 - 2.1);
 System.out.println("val = " +val);
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
    // TODO: write your program here
    System.out.println("Hello");
  }
}
`}
/>

</details>

---

### Try it: explicit casting

<PistonRunner
  lang="java"
  interactive={false}
  height="280px"
  code={`public class Main {
  public static void main(String[] args) {
    double price = 19.99;
    int wholeDollars = (int) price;
    System.out.println(wholeDollars);
  }
}
`}
/>

<MultipleChoice
  id="java-ch2b-casting"
  title="Typecasting"
  questions={[
    {
      prompt: 'int x = (int) 9.9; What is x?',
      code: 'int x = (int) 9.9;',
      codeLang: 'java',
      choices: ['10', '9', '9.9', 'Error'],
      answer: 1,
      why: 'Casting a double to int truncates (chops off) the decimal part instead of rounding, so 9.9 becomes 9.',
    },
    {
      prompt: 'int x = 5; double y = x; — does this need an explicit (double) cast?',
      choices: [
        'Yes, or it will not compile',
        'No, int fits inside double without losing data, so Java converts it implicitly',
        'Only for negative numbers',
        'Only if x is greater than 100',
      ],
      answer: 1,
      why: 'Widening conversions (int to double) never lose data, so Java performs them automatically — no cast needed.',
    },
  ]}
/>

<CodeExercise
  title="truncate to int"
  heading="Try it: truncate to int"
  lang="java"
  filename="Main.java"
  prompt="Read a double. Cast it to int and print the result (truncated, not rounded)."
  sampleLog={`(input) 7.8
7`}
  starter={`public class Main {
    public static int truncate(double d) {
        // TODO: cast d to int and return it
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double d = sc.nextDouble();
        System.out.println(Main.truncate(d));
    }
}
`}
  sourceChecks={[
    { name: 'Uses an explicit (int) cast', pattern: '\\(int\\)', must: true, hint: '(int) d' },
  ]}
  tests={[
    { name: '7.8', stdin: '7.8', equals: '7' },
    { name: '2.1', stdin: '2.1', equals: '2' },
    { name: 'negative', stdin: '-3.7', equals: '-3' },
  ]}
/>

---

## Chapter summary

:::important Key takeaways

1. **Implicit** casting happens automatically when no data can be lost (`int` → `double`). **Explicit** casting — `(type) value` — is required when data could be lost (`double` → `int`).
2. Casting a `double` to `int` **truncates** toward zero; it does not round.
3. Wrap an expression in parentheses before casting it (`(int)(2.4 - 2.1)`), otherwise the cast only applies to the first value, not the whole expression.
4. The safe widening order is `char → short → int → float → double → long`; going the other way risks losing precision or overflowing.

:::

## Exercises

<ExerciseSet>
<Exercise title="Round vs truncate" anchor="exercise-round-vs-truncate">

:::tip Activity: Round vs truncate
Read a double. Print two lines: the truncated `int` value (`(int)`), then the rounded value using `Math.round`.

<CodeExercise
  title="Round vs truncate"
  heading="exercise-round-vs-truncate"
  lang="java"
  filename="Main.java"
  prompt="Print (int) d on one line, then Math.round(d) on the next."
  sampleLog={`(input) 4.7
4
5`}
  starter={`public class Main {
    public static void showBoth(double d) {
        // TODO: print (int) d, then Math.round(d), each on its own line
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double d = sc.nextDouble();
        Main.showBoth(d);
    }
}
`}
  tests={[
    { name: '4.7', stdin: '4.7', equals: '4\n5' },
    { name: '4.2', stdin: '4.2', equals: '4\n4' },
  ]}
/>

:::

</Exercise>

<Exercise title="Average as double" anchor="exercise-average-as-double">

:::tip Activity: Average as double
Read two integers. Print their average as a decimal (cast one of them to `double` before dividing).

<CodeExercise
  title="Average as double"
  heading="exercise-average-as-double"
  lang="java"
  filename="Main.java"
  prompt="Cast one operand to double before dividing so the division is not integer division."
  sampleLog={`(input) 3 4
3.5`}
  starter={`public class Main {
    public static double average(int a, int b) {
        // TODO: cast before dividing
        return 0.0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(Main.average(a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Casts to double', pattern: '\\(double\\)', must: true, hint: '(double) a / 2' },
  ]}
  tests={[
    { name: '3 4', stdin: '3 4', equals: '3.5' },
    { name: '5 5', stdin: '5 5', equals: '5.0' },
  ]}
/>

:::

</Exercise>

<Exercise title="Char to int" anchor="exercise-char-to-int">

:::tip Activity: Char to int
Read a single character. Print its integer (ASCII) value.

<CodeExercise
  title="Char to int"
  heading="exercise-char-to-int"
  lang="java"
  filename="Main.java"
  prompt="A char is already a numeric type in Java; assigning it to an int gives the ASCII value directly."
  sampleLog={`(input) A
65`}
  starter={`public class Main {
    public static int charCode(char c) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        char c = sc.next().charAt(0);
        System.out.println(Main.charCode(c));
    }
}
`}
  tests={[
    { name: 'A', stdin: 'A', equals: '65' },
    { name: 'a', stdin: 'a', equals: '97' },
    { name: '0', stdin: '0', equals: '48' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>






