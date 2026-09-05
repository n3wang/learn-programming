---
title: Chapter 2d - Char Data Type
---

The char data type is used to store a single character. The character must be surrounded by single quotes, like 'A' or 'c':


```java
char x = 'a';    
System.out.print(x);
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
    char x = 'a';    
    System.out.print(x);
  }
}
`}
/>

</details>


## The ASCII code

![](../../static/img/2022-05-04-05-31-24.png)

```java
char x = 97;
System.out.println(x);    //Should print 'a'
```
<details>
<summary>
🧪 Try the code out!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="220px"
  code={`public class Main {
  public static void main(String[] args) {
    char x = 97;
    System.out.println(x);    //Should print 'a'
  }
}
`}
/>

</details>


## Upper and Lower Case
```java
public class Main
{
 public static void main(String[] args) 
 {
   char ch1 = 'a';
   char ch2 = 'B';
   System.out.println(Character.toUpperCase(ch1));//converts lowercase to uppercase
   System.out.println(Character.toLowerCase(ch2));//converts uppercase to lowercase
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
  height="480px"
  code={`public class Main
{
 public static void main(String[] args) 
 {
   char ch1 = 'a';
   char ch2 = 'B';
   System.out.println(Character.toUpperCase(ch1));//converts lowercase to uppercase
   System.out.println(Character.toLowerCase(ch2));//converts uppercase to lowercase
 }
}
`}
/>

</details>

### Try it: upper and lower case

<PistonRunner
  lang="java"
  interactive={false}
  height="280px"
  code={`public class Main {
  public static void main(String[] args) {
    char ch1 = 'j';
    char ch2 = 'D';
    System.out.println(Character.toUpperCase(ch1));
    System.out.println(Character.toLowerCase(ch2));
  }
}
`}
/>

<MultipleChoice
  id="java-ch2d-charcase"
  title="char and ASCII"
  questions={[
    {
      prompt: "char c = 'a' + 1; What character does c hold?",
      code: "char c = 'a' + 1;",
      codeLang: 'java',
      choices: ["'a1'", "'b'", "98", "Error"],
      answer: 1,
      why: "'a' is ASCII 97. Adding 1 gives 98, which is 'b'. Adding an int to a char shifts along the ASCII table.",
    },
    {
      prompt: 'Character.toUpperCase(ch) where ch is already uppercase',
      choices: [
        'Throws an error',
        'Returns the same character unchanged',
        'Returns a lowercase version instead',
        'Returns the ASCII code as an int',
      ],
      answer: 1,
      why: 'toUpperCase leaves characters that are already uppercase (or not letters) unchanged.',
    },
  ]}
/>

<CodeExercise
  title="next letter"
  heading="Try it: next letter"
  lang="java"
  filename="Main.java"
  prompt="Read a single lowercase letter. Print the next letter in the alphabet (wrap 'z' back to 'a')."
  sampleLog={`(input) x
y`}
  starter={`public class Main {
    public static char nextLetter(char c) {
        // TODO: if c is 'z', return 'a'; otherwise return c + 1
        return c;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        char c = sc.next().charAt(0);
        System.out.println(Main.nextLetter(c));
    }
}
`}
  tests={[
    { name: 'x -> y', stdin: 'x', equals: 'y' },
    { name: 'a -> b', stdin: 'a', equals: 'b' },
    { name: 'wrap z -> a', stdin: 'z', equals: 'a' },
  ]}
/>

---

## Chars and ASCII In Practice
<details>
<summary>
✍ Try the following examples in this playground
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="480px"
  code={`public class Main
{
 public static void main(String[] args) 
 {
   char ch1 = 'a';
   char ch2 = 'B';
   System.out.println(Character.toUpperCase(ch1));//converts lowercase to uppercase
   System.out.println(Character.toLowerCase(ch2));//converts uppercase to lowercase
 }
}
`}
/>

</details>


What happens when we try to store a char value in an integer?
```java
public class Main {
    public static void main(String args[]) {
    int val='A';
    System.out.println("val = " +val);
    }`
} 
```

What happens when we typecast an int value to a char type?
```java
public class Main {
 public static void main(String[] args) {
   int x = 5;
   char y = (char)x;  
   System.out.println(x + y);  
 }
}
```


What happens we try to add a char to an integer?

*Java will take ASCII value of char and add it to the int, so the result will be unpredicted. Try this:*
```java

int x = 5;
char y = '5';
System.out.println (x + y);
```

```SHELL
OUTPUT: 58 (because it will take ASCII value of '5' that is 53 and add it to 5)
```

What is the output seen when combining int and String variables? 

*if x = 5 and y = “6”, then output is 56 (string concatenation). Anything added to string is converted to string in java.*
```java
public class Main {
 public static void main(String[] args)    
   {   
       int x = 5;
       String y = "6";
       System.out.println(x + y);
   } 
}
```

---

## Chapter summary

:::important Key takeaways

1. `char` is a numeric type under the hood — every character has an ASCII (or Unicode) code, and Java freely converts between `char` and `int`.
2. Adding an `int` to a `char` shifts it along the character table; casting an `int` to `char` looks up the character at that code.
3. `Character.toUpperCase`/`toLowerCase` convert case without touching non-letter characters.
4. `+` between an `int` and a `String` always produces a `String` — concatenation wins over addition once a `String` is involved.

:::

## Exercises

<ExerciseSet>
<Exercise title="Is vowel" anchor="exercise-is-vowel">

:::tip Activity: Is vowel
Read a single lowercase letter. Print `true` if it is a vowel (`a`, `e`, `i`, `o`, `u`), `false` otherwise.

<CodeExercise
  title="Is vowel"
  heading="exercise-is-vowel"
  lang="java"
  filename="Main.java"
  prompt="Compare c against 'a', 'e', 'i', 'o', 'u'."
  sampleLog={`(input) e
true`}
  starter={`public class Main {
    public static boolean isVowel(char c) {
        // TODO
        return false;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        char c = sc.next().charAt(0);
        System.out.println(Main.isVowel(c));
    }
}
`}
  tests={[
    { name: 'vowel e', stdin: 'e', equals: 'true' },
    { name: 'consonant k', stdin: 'k', equals: 'false' },
    { name: 'vowel u', stdin: 'u', equals: 'true' },
  ]}
/>

:::

</Exercise>

<Exercise title="ASCII offset" anchor="exercise-ascii-offset">

:::tip Activity: ASCII offset
Read a single letter. Print how many letters after `'a'` it is (e.g. `'a'` is 0, `'c'` is 2). Assume lowercase input.

<CodeExercise
  title="ASCII offset"
  heading="exercise-ascii-offset"
  lang="java"
  filename="Main.java"
  prompt="Return c - 'a' (char subtraction gives an int)."
  sampleLog={`(input) c
2`}
  starter={`public class Main {
    public static int offsetFromA(char c) {
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
        System.out.println(Main.offsetFromA(c));
    }
}
`}
  sourceChecks={[
    { name: "Subtracts 'a'", pattern: "'a'", must: true, hint: "c - 'a'" },
  ]}
  tests={[
    { name: 'a', stdin: 'a', equals: '0' },
    { name: 'c', stdin: 'c', equals: '2' },
    { name: 'z', stdin: 'z', equals: '25' },
  ]}
/>

:::

</Exercise>

<Exercise title="Capitalize first letter" anchor="exercise-capitalize">

:::tip Activity: Capitalize first letter
Read a lowercase word. Print it with only the first letter capitalized (e.g. `apple` → `Apple`). Use `Character.toUpperCase` on the first character and `.substring` for the rest.

<CodeExercise
  title="Capitalize first letter"
  heading="exercise-capitalize"
  lang="java"
  filename="Main.java"
  prompt="Return Character.toUpperCase(word.charAt(0)) + word.substring(1)."
  sampleLog={`(input) apple
Apple`}
  starter={`public class Main {
    public static String capitalize(String word) {
        // TODO
        return word;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        String word = sc.next();
        System.out.println(Main.capitalize(word));
    }
}
`}
  sourceChecks={[
    { name: 'Uses Character.toUpperCase', pattern: 'Character\\.toUpperCase', must: true, hint: 'Character.toUpperCase(word.charAt(0))' },
  ]}
  tests={[
    { name: 'apple', stdin: 'apple', equals: 'Apple' },
    { name: 'zebra', stdin: 'zebra', equals: 'Zebra' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>

