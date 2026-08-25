---
title: Chapter 2c - Built-in Functions and Math
---

![](../../static/img/2022-05-04-05-12-31.png)


## Built In Functions

### Java Math Methods Table

| Function       | Explanation                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Math. max(x,y) | This method is used to find the highest value of x and y.                                                                                   |
| Math. min(x,y) | This method is used to find the smallest value of x and y.                                                                                  |
| Math. round(x) | This method is used to round off the decimal numbers to the nearest value. (4.25 will be rounded off to 4 & 4.55 will be rounded off to 5). |
| Math. sqrt(x)  | This method is used to find the square root of a number.                                                                                    |
| Math. pow(x,y) | This method returns the value of the first argument raised to the power to the second argument.(i.e. xy).                                   |
| Math.abs(x)    | This method returns the absolute (positive) value of x.                                                                                     |
| Math. ceil(x)  | This method is used to find the smallest integer value that is greater than or equal to the given number.                                   |
| Math. floor()  | This method is used to find the largest integer value which is less than or equal to the given number.                                      |

### Example Usage
```java
public class Main {

public static void main(String[] args)   
  {  
      double num1 = 4;  
      double num2 = 2;  
      double num3 = 4.25;
      // return the Minimum of two numbers
      System.out.println("Minimum of " + num1 + " and " + num2 + "is: " + Math.min(num1, num2));
      // returns the Maximum of two numbers
      System.out.println("Maximum of " + num1 + " and " + num2 + "is: " + Math.max(num1, num2));
      //returns 16 i.e. 4*4 
      System.out.println("Power of " + num1 + " and " + num2 + "is: " + Math.pow(num1, num2)); 
      // returns the decimal number rounded to the nearest whole number value.
      System.out.println("Rounding off " + num3 + " yields: " + Math.round(num3));
      // returns the square root of num1 
      System.out.println("Square root of " + num1 + " is " + Math.sqrt(num1));
      // returns the absolute value of int type
      System.out.println("Absolute value " + num1 + " is " + Math.abs(num1));
      // returns the smallest integer value that is greater than or equal to the given numbe 
      System.out.println("Ceiling  of " + num3 + " is " + Math.ceil(num3));
      // returns the largest integer value which is less than or equal to the given number
      System.out.println("Floor  of " + num3 + " is " + Math.floor(num3));
  }
}

```

<details>
<summary>
🧪 Try the code out! 
</summary>
<iframe src="https://trinket.io/embed/java/ef0b0d44ad" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

### Try it: Math methods

<PistonRunner
  lang="java"
  interactive={false}
  height="280px"
  code={`public class Main {
  public static void main(String[] args) {
    System.out.println(Math.max(4, 9));
    System.out.println(Math.min(4, 9));
    System.out.println(Math.pow(2, 5));
    System.out.println(Math.sqrt(81));
    System.out.println(Math.abs(-12));
  }
}
`}
/>

<MultipleChoice
  id="java-ch2c-mathmethods"
  title="Math methods"
  questions={[
    {
      prompt: 'What does Math.pow(2, 5) return?',
      code: 'Math.pow(2, 5)',
      codeLang: 'java',
      choices: ['10', '32', '25', '7'],
      answer: 1,
      why: 'Math.pow(x, y) raises x to the power y: 2^5 = 32.',
    },
    {
      prompt: 'Math.ceil(4.1) and Math.floor(4.9) return respectively',
      choices: ['4.0 and 5.0', '5.0 and 4.0', '4 and 5', '5 and 4'],
      answer: 1,
      why: 'ceil rounds up to 5.0, floor rounds down to 4.0. Both return a double.',
    },
  ]}
/>

<CodingExam
  title="distance between two points"
  heading="Try it: distance between two points"
  lang="java"
  filename="Main.java"
  prompt="Read x1 y1 x2 y2 (doubles). Print the distance using Math.sqrt and Math.pow: sqrt((x2-x1)^2 + (y2-y1)^2)."
  sampleLog={`(input) 0 0 3 4
5.0`}
  starter={`public class Main {
    public static double distance(double x1, double y1, double x2, double y2) {
        // TODO: use Math.sqrt and Math.pow
        return 0.0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double x1 = sc.nextDouble();
        double y1 = sc.nextDouble();
        double x2 = sc.nextDouble();
        double y2 = sc.nextDouble();
        System.out.println(Main.distance(x1, y1, x2, y2));
    }
}
`}
  sourceChecks={[
    { name: 'Uses Math.sqrt', pattern: 'Math\\.sqrt', must: true, hint: 'Math.sqrt(...)' },
  ]}
  tests={[
    { name: '3-4-5 triangle', stdin: '0 0 3 4', equals: '5.0' },
    { name: 'same point', stdin: '1 1 1 1', equals: '0.0' },
  ]}
/>

---

[👀](https://learn2codelive.com/courses/107/pages/lesson-2-learning-activities-r-practice-activity-5-movies?module_item_id=9057)

### Practice Activity 
:::tip Movies Calculation Activity 🎥
You got $37.50 from your dad to go to the movies with your friends. 
- You have $37 in bills and $0.50 in coins. 
- Each ticket costs $7.50. Upon reaching the theatre you find out that the ticket kiosk is broken and can’t take coins. 

Write a program to calculate how many friends you can take to the movies with you, and how much money you are left with after buying the tickets. Use variables for each number used in your program. 

Notes:
- Remember to buy a ticket for yourself
- Money left = Initial amount of money - total cost of tickets (for yourself)

**Expected Output**
```
I have $37.5
Since I can't use the coins, I can only use $37.0 to buy tickets.
Each ticket costs $7.5
I can take 3 friends to the movies along with me!
I am left with $7.5
```


<details>
<summary>
✍  <b>Modify the following code</b> so that it fulfills the assigment requirements.
</summary>
<iframe src="https://trinket.io/embed/java/72fd16661e" width="100%" height="1000" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

:::

---

## Chapter summary

:::important Key takeaways

1. `Math` methods are called with `Math.methodName(...)` — no import needed, `Math` is always available.
2. `Math.max`/`Math.min` compare two values; `Math.pow`/`Math.sqrt` handle exponents and roots; `Math.abs` strips a sign.
3. `Math.round` rounds to the nearest whole number; `Math.ceil` always rounds up, `Math.floor` always rounds down — both return a `double`.
4. Combine `Math` methods to build formulas (like distance) instead of writing the math by hand with loops.

:::

## Exercises

<ExerciseSet>
<Exercise title="Clamp a value" anchor="exercise-clamp">

:::tip Activity: Clamp a value
Read a value, a minimum, and a maximum. Print the value clamped into that range, using `Math.max` and `Math.min` together.

<CodingExam
  title="Clamp a value"
  heading="exercise-clamp"
  lang="java"
  filename="Main.java"
  prompt="Return Math.max(min, Math.min(value, max))."
  sampleLog={`(input) 15 0 10
10`}
  starter={`public class Main {
    public static int clamp(int value, int min, int max) {
        // TODO
        return value;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int value = sc.nextInt();
        int min = sc.nextInt();
        int max = sc.nextInt();
        System.out.println(Main.clamp(value, min, max));
    }
}
`}
  tests={[
    { name: 'above max', stdin: '15 0 10', equals: '10' },
    { name: 'below min', stdin: '-5 0 10', equals: '0' },
    { name: 'in range', stdin: '4 0 10', equals: '4' },
  ]}
/>

:::

</Exercise>

<Exercise title="Round money" anchor="exercise-round-money">

:::tip Activity: Round money
Read a price as a double. Print it rounded to the nearest whole number using `Math.round` (which returns a `long`).

<CodingExam
  title="Round money"
  heading="exercise-round-money"
  lang="java"
  filename="Main.java"
  prompt="Return Math.round(price)."
  sampleLog={`(input) 19.6
20`}
  starter={`public class Main {
    public static long roundPrice(double price) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double p = sc.nextDouble();
        System.out.println(Main.roundPrice(p));
    }
}
`}
  tests={[
    { name: '19.6', stdin: '19.6', equals: '20' },
    { name: '19.4', stdin: '19.4', equals: '19' },
  ]}
/>

:::

</Exercise>

<Exercise title="Absolute difference" anchor="exercise-abs-diff">

:::tip Activity: Absolute difference
Read two integers. Print the absolute value of their difference using `Math.abs`.

<CodingExam
  title="Absolute difference"
  heading="exercise-abs-diff"
  lang="java"
  filename="Main.java"
  prompt="Return Math.abs(a - b)."
  sampleLog={`(input) 3 9
6`}
  starter={`public class Main {
    public static int absDiff(int a, int b) {
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
        System.out.println(Main.absDiff(a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Uses Math.abs', pattern: 'Math\\.abs', must: true, hint: 'Math.abs(a - b)' },
  ]}
  tests={[
    { name: '3 9', stdin: '3 9', equals: '6' },
    { name: '9 3', stdin: '9 3', equals: '6' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>








