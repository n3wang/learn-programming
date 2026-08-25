---
title: Chapter 4a - Conditionals
---





## Boolean Expression 


```java
public class Main {
  public static void main(String[] args) {
    boolean isJavaFun = true;
    boolean isFishTasty = false;    
    System.out.println(isJavaFun);
    System.out.println(isFishTasty);
  }
}
```

<details>
<summary>
🧪 Try the code out~!
</summary>
<iframe src="https://trinket.io/embed/java/db4b075d67" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

:::tip Practice
-  Now you like fish: Change `isFishTasty` to `true` and see what happens.
:::



### Simple Comparison to get Boolean expressions
```java
class Main{
 public static void main (String args[]){
    int my_age    = 21;
    int age_marie  = 25;
   
   System.out.println("Am I older than Marie? " + (my_age < age_marie));
   }
}
```


<details>
<summary>
🧪 Try the code out~!
</summary>
<iframe src="https://trinket.io/embed/java/e8aaef8339" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>




### Comparison Operator
[👀](https://learn2codelive.com/courses/107/pages/lesson-4-learning-activities-r-wrap-up-comparison-operators?module_item_id=9109)

```
== (equal to; example: x == 5)

!= (not equal to; example: x != 5)

> (greater than; example: y > 3)

< (less than; example: x <  5 )

>= (greater than or equal to; example: x >= y) 

<= (less than or equal to; example: x <= y)
```


:::note Comparison Operators


| Comparison Operator | Definition       | Example                     |
| ------------------- | ---------------- | --------------------------- |
| `==`                | Equals           | 2==2 -> True, 2==4 -> False |
| `!=`               | Not Equal        | 2!=3 -> True, 2!=2 -> False |
| `>`                 | Larger           | 3>2 -> True                 |
| `<`                 | Smaller          | 4 < 5 -> True               |
| `>=`                | Larger or Equals | 4 >= 2 -> True, 2>=2 -> Tru |

:::


Example Use
```python
is_greater_than = 10 > 5  // True

In this case, 10 > 5 is a Boolean expression that evaluates to True because 10 is greater than 5

is_less_than = 10 < 5 // False

In this case, 10 < 5 is a Boolean expression that evaluates to False because 10 is not less than 5
```




[👀](https://learn2codelive.com/courses/107/pages/lesson-4-learning-activities-e1-introduce-boolean-expression?module_item_id=9108)

![](2022-05-23-13-37-42.png)

```java
class Main{
 public static void main (String args[]){
   //heights are in inches
   //create variables for heights of the five friends
    int ht_tom    = 61;
    int ht_marie  = 53;
    int ht_darell = 60;
    int ht_alisha = 55;
    int ht_joe    = 66;
   //boolean expression evaluates to True or False
   System.out.println("Tom is of the same height as Marie: " + (ht_tom != ht_marie));
   System.out.println("Tom is as tall as Marie or taller: " + (ht_tom >= ht_marie));
   System.out.println("Darell is shorter or the same height as Joe: "+ (ht_darell <= ht_joe));
   System.out.println("Alisha is shorter than Tom: " + (ht_alisha < ht_tom));
   }
}
```


<details>
<summary>
🧪 Try the code out! 
</summary>
<iframe src="https://trinket.io/embed/java/f4a2082f58" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>





### Try it: comparison operators

<PistonRunner
  lang="java"
  interactive={false}
  height="260px"
  code={`public class Main {
  public static void main(String[] args) {
    int a = 8;
    int b = 12;
    System.out.println(a == b);
    System.out.println(a != b);
    System.out.println(a < b);
    System.out.println(a >= b);
  }
}
`}
/>

<MultipleChoice
  id="java-ch4a-comparisons"
  title="Comparison operators"
  questions={[
    {
      prompt: 'int x = 5; System.out.println(x = 6); What does this print, and why is it different from ==?',
      choices: [
        'true, because x equals 6',
        '6, because = is assignment (it sets x to 6, then prints that value), while == is comparison',
        'false',
        'This will not compile',
      ],
      answer: 1,
      why: 'A single = assigns and evaluates to the assigned value; == compares two values and evaluates to true/false. Mixing them up is a classic bug.',
    },
    {
      prompt: '7 >= 7 evaluates to',
      choices: ['true', 'false', '0', 'Error'],
      answer: 0,
      why: '>= is true when the left side is greater than OR equal to the right side. 7 is equal to 7.',
    },
  ]}
/>

<CodingExam
  title="compare two ages"
  heading="Try it: compare two ages"
  lang="java"
  filename="Main.java"
  prompt="Read two ages. Print true if the first is strictly older (greater) than the second, false otherwise."
  sampleLog={`(input) 21 18
true`}
  starter={`public class Main {
    public static boolean isOlder(int ageA, int ageB) {
        // TODO: return ageA > ageB
        return false;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(Main.isOlder(a, b));
    }
}
`}
  tests={[
    { name: 'a older', stdin: '21 18', equals: 'true' },
    { name: 'b older', stdin: '15 20', equals: 'false' },
    { name: 'equal', stdin: '10 10', equals: 'false' },
  ]}
/>

---

## Activity

[👀](https://learn2codelive.com/courses/107/pages/lesson-4-learning-activities-r-practice-activity-1-comparing-ages?module_item_id=9110)

:::tip Age Comparison
Write code that takes two values from the user, user’s age and his/her friend’s age. The code should compare the ages in this manner: 

(i) if one is greater than the other.

(ii) if one is less than or equal to the other age.

(iii) if both the ages are equal. Ensure that the output shown is user friendly.

<details>
<summary>
💻 Sample Program
</summary>
<iframe src="https://trinket.io/embed/java/7989b0de78?outputOnly=true" width="100%" height="400" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>
</details>



### Solve it here:

<!-- <details>
<summary>
✍ Solve the problem using Replit
</summary>
<a href="https://replit.com/@n3wang/EmptyJavaCanvas#Main.java" >Feel free to use Repl, you can fork from this empty canvas in Repl.it</a>

</details> -->

<details>
<summary>
✍  You can solve the problem <b>here</b> using Trinket
</summary>
<iframe src="https://trinket.io/embed/java/4b11cfc604" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>



:::

---

## Chapter summary

:::important Key takeaways

1. A boolean expression (`a < b`, `a == b`, ...) evaluates to `true` or `false` — nothing else.
2. `==` compares two values; a single `=` assigns a value. Mixing them up is a very common bug.
3. Comparison operators (`==`, `!=`, `>`, `<`, `>=`, `<=`) work the same on numbers whether the values come from literals or variables.
4. Storing a comparison's result in a `boolean` variable lets you reuse and name a condition instead of repeating it.

:::

## Exercises

<ExerciseSet>
<Exercise title="Is multiple of" anchor="exercise-is-multiple">

:::tip Activity: Is multiple of
Read two integers `n` and `d`. Print `true` if `n` is a multiple of `d`, `false` otherwise.

<CodingExam
  title="Is multiple of"
  heading="exercise-is-multiple"
  lang="java"
  filename="Main.java"
  prompt="Return n % d == 0."
  sampleLog={`(input) 15 5
true`}
  starter={`public class Main {
    public static boolean isMultiple(int n, int d) {
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
        int d = sc.nextInt();
        System.out.println(Main.isMultiple(n, d));
    }
}
`}
  sourceChecks={[
    { name: 'Uses the modulus operator', pattern: '%', must: true, hint: 'n % d == 0' },
  ]}
  tests={[
    { name: 'multiple', stdin: '15 5', equals: 'true' },
    { name: 'not multiple', stdin: '14 5', equals: 'false' },
  ]}
/>

:::

</Exercise>

<Exercise title="Min of two" anchor="exercise-min-of-two">

:::tip Activity: Min of two
Read two integers. Print the smaller one, using a comparison (no `Math.min`).

<CodingExam
  title="Min of two"
  heading="exercise-min-of-two"
  lang="java"
  filename="Main.java"
  prompt="Use < to compare a and b, return the smaller."
  sampleLog={`(input) 9 4
4`}
  starter={`public class Main {
    public static int minOf(int a, int b) {
        // TODO: use a comparison, not Math.min
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
        System.out.println(Main.minOf(a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Uses a comparison operator', pattern: '<|>', must: true, hint: 'a < b ? a : b' },
    { name: 'Does not use Math.min', pattern: 'Math\\.min', must: false, hint: 'Compare with < or > instead of Math.min.' },
  ]}
  tests={[
    { name: 'a bigger', stdin: '9 4', equals: '4' },
    { name: 'b bigger', stdin: '2 8', equals: '2' },
    { name: 'equal', stdin: '5 5', equals: '5' },
  ]}
/>

:::

</Exercise>

<Exercise title="In range" anchor="exercise-in-range">

:::tip Activity: In range
Read three integers: `value`, `low`, `high`. Print `true` if `value` is between `low` and `high` (inclusive), `false` otherwise.

<CodingExam
  title="In range"
  heading="exercise-in-range"
  lang="java"
  filename="Main.java"
  prompt="Return value >= low && value <= high."
  sampleLog={`(input) 5 1 10
true`}
  starter={`public class Main {
    public static boolean inRange(int value, int low, int high) {
        // TODO
        return false;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int value = sc.nextInt();
        int low = sc.nextInt();
        int high = sc.nextInt();
        System.out.println(Main.inRange(value, low, high));
    }
}
`}
  tests={[
    { name: 'inside', stdin: '5 1 10', equals: 'true' },
    { name: 'outside', stdin: '15 1 10', equals: 'false' },
    { name: 'boundary', stdin: '10 1 10', equals: 'true' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>