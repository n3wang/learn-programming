---
title: Chapter 3a - User Input
---

## Scanner

### Scanning for User Input

```java

import java.util.*;
class Main {
    public static void main(String arg[]) {
      System.out.print("Enter Your Name : ");  // user prompt
      Scanner sc = new Scanner(System.in);     // take user input
      String name = sc.nextLine();             // store the user input in the name variable
      System.out.println("Name : "+ name);     // output the value stored in name
    }
}

```

<details>
<summary>
🧪 Try the code out~! 
</summary>
<iframe src="https://trinket.io/embed/java/5b1603aee0" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

<details>
<summary>
🙋‍♀️ What's also imported from Java Util?
</summary>
Here is a list of al the things we are importing when we write:

```java
import java.util.*
```

https://docs.oracle.com/javase/8/docs/api/java/util/package-summary.html

</details>

### Methods for accepting user Input


| Code          | What is used for                                              |
| ------------- | ------------------------------------------------------------- |
| nextInt()     | It is used to take an integer as an input.                    |
| nextFloat()   | It is used to take float as an input.                         |
| nextDouble()  | It is used to take double as an input.                        |
| nextLine()    | It is used to take String as an input(It will accept a line). |
| nextBoolean() | It is used to take the boolean value as an input.             |
| nextLong()    | It is used to take long as an input.                          |

:::tip Asking for a char

- The following line will save the first letter on the next line 
- To do that we are using charAt(0) which means `The character that is on the index 0 (we start counting from 0 as the first letter)`
```java
char character = sc.nextLine().charAt(0);
```
:::

### Number Inputs

[👀 Lesson 3 Learning Activities [E1] : Prediction with User Inputs in Java](https://learn2codelive.com/courses/107/pages/lesson-3-learning-activities-e1-prediction-with-user-inputs-in-java?module_item_id=9075)

:::note Example: Bake Store Program
In this example we create a Program for a Bake Bar that helps the store clerk
into calculating the total cost of the items the customer purchases.
```java
import java.util.*;
class Main {
    public static void main(String args[]) {
        Scanner scan = new Scanner(System.in);
        System.out.println("------------------------------------------------");
        System.out.println("The following items are availabe at Bake Bar: ");
        System.out.println("Shortcakes at $1.5 per cake");
        System.out.println("Macaron at $1 per piece");
        System.out.println("Chocochip cookies at $1 per cookie");
        System.out.println("-------------------------------------------------");
        System.out.print("Enter the number of shortcakes you want: ");
        int shortcake = scan.nextInt();
        System.out.print("Enter the number of macarons you want: ");
        int macaron = scan.nextInt();
        System.out.print("Enter the number of cookies you want: ");
        int cookie = scan.nextInt();
        double costCake = 1.5 * shortcake; //calculate the money spent on shortcake
        double costMacaron = 1 * macaron; // calculate the money spent on macarons
        double costCookie = 1 * cookie; // calculate the money spent on cookies
        double totalCost = costCake + costMacaron + costCookie;
        //calculate the total money spent on all 3 items
        System.out.println("Bill amount for your shopping is $" + totalCost);
    }
}
```

<details>
<summary>
🧪 Try the code out! 
</summary>
<iframe src="https://trinket.io/embed/java/7646d28f5c" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

:::


### Try it: reading two numbers

<PistonRunner
  lang="java"
  interactive={true}
  height="280px"
  code={`import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    System.out.print("Enter the first number: ");
    int a = sc.nextInt();
    System.out.print("Enter the second number: ");
    int b = sc.nextInt();
    System.out.println("Sum: " + (a + b));
  }
}
`}
/>

<MultipleChoice
  id="java-ch3a-scanner"
  title="Scanner basics"
  questions={[
    {
      prompt: 'Which Scanner method reads a whole line of text, including spaces?',
      choices: ['nextInt()', 'nextLine()', 'nextDouble()', 'next()'],
      answer: 1,
      why: 'nextLine() reads everything up to the next newline, spaces included. next() only reads a single word.',
    },
    {
      prompt: 'What must you do before calling any Scanner method?',
      choices: [
        'Nothing, Scanner works automatically',
        'Create a Scanner object with new Scanner(System.in)',
        'Call System.in.open()',
        'Import java.io.File',
      ],
      answer: 1,
      why: 'You need a Scanner object wired to System.in before you can call nextInt(), nextLine(), etc. on it.',
    },
  ]}
/>

<CodingExam
  title="add two scanned numbers"
  heading="Try it: add two scanned numbers"
  lang="java"
  filename="Main.java"
  prompt="Read two integers with Scanner (one per call to nextInt()) and print their sum."
  sampleLog={`(input) 4 7
11`}
  starter={`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: read two ints with sc.nextInt() and print their sum
    }
}
`}
  sourceChecks={[
    { name: 'Uses Scanner', pattern: 'new Scanner', must: true, hint: 'new Scanner(System.in)' },
    { name: 'Calls nextInt', pattern: 'nextInt\\(\\)', must: true, hint: 'sc.nextInt()' },
  ]}
  tests={[
    { name: '4 7', stdin: '4 7', equals: '11' },
    { name: '0 0', stdin: '0 0', equals: '0' },
  ]}
/>

---

:::caution No need to store inputs
The following code works just fine too!
```java
System.out.println("Enter Your Name");
Scanner sc=new Scanner(System.in);
System.out.println(sc.nextLine());
```
:::


<br/>

### Create a Madlib

[👀 Madlib Exercise ](https://learn2codelive.com/courses/107/pages/lesson-3-learning-activities-r-practice-activity-2-madlib?module_item_id=9078)

:::tip Create the following Program
 
 - Take user inputs for words to fill in the blanks. 
 - Be sure to provide appropriate prompts to let your user know what she/he should be entering. 
 - Print out the completed madlib using string concatenation. 
 - You may store the text blocks for your madlib in variables or use them directly as strings for concatenation when you output. 

**Sample Program**

<iframe src="https://trinket.io/embed/java/81d66c8055?outputOnly=true&start=result" width="100%" height="400" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

<details>
<summary>
✍ Solve the problem using Replit
</summary>
<a href="https://replit.com/@n3wang/EmptyJavaCanvas#Main.java" >Feel free to use Repl, you can fork from this empty canvas in Repl.it</a>

</details>

<details>
<summary>
✍  You can solve the problem <b>here</b> using Trinket
</summary>


**Steps**
1. [ ] Complete The following code so that it scans for the **noun** and prints the **noun entered**.
2. [ ] Complete the code so that it also asks for the **adverb**. Feel free to uncomment **line 13**
3. [ ] Complete the code so that it also ask the **verb**. Feel free to uncomment **line 14**
4. [ ] Scan and print the **adjective**. Feel free to uncomment **line 15**

<iframe src="https://trinket.io/embed/java/e12496b61e" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>


:::


### Exercise: Improving the Bake Shop 

- The following code only have the following menu items on it.

| Item    | Price |
| ------- | ----- |
| Cake    | $1.5  |
| Macaron | $1    |
| Cookie  | $1    |

-  🔨 Modify this code so that now you have a menu itme available:
e.g.:

| Item  | Price |
| ----- | ----- |
| Bread | $5    |


```java
import java.util.*;
class Main {
    public static void main(String args[]) {
        Scanner scan = new Scanner(System.in);
        System.out.println("------------------------------------------------");
        System.out.println("The following items are availabe at Bake Bar: ");
        System.out.println("Shortcakes at $1.5 per cake");
        System.out.println("Macaron at $1 per piece");
        System.out.println("Chocochip cookies at $1 per cookie");
        System.out.println("-------------------------------------------------");
        System.out.print("Enter the number of shortcakes you want: ");
        int shortcake = scan.nextInt();
        System.out.print("Enter the number of macarons you want: ");
        int macaron = scan.nextInt();
        System.out.print("Enter the number of cookies you want: ");
        int cookie = scan.nextInt();
        double costCake = 1.5 * shortcake; //calculate the money spent on shortcake
        double costMacaron = 1 * macaron; // calculate the money spent on macarons
        double costCookie = 1 * cookie; // calculate the money spent on cookies
        double totalCost = costCake + costMacaron + costCookie;
        //calculate the total money spent on all 3 items
        System.out.println("Bill amount for your shopping is $" + totalCost);
    }
}
```


<details>
<summary>
✍  You can solve the problem <b>here</b> using Trinket
</summary>
<iframe src="https://trinket.io/embed/java/fb7a26acfd" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

---

## Chapter summary

:::important Key takeaways

1. `Scanner sc = new Scanner(System.in);` wires up keyboard input; call `sc.nextInt()`, `sc.nextDouble()`, `sc.nextLine()`, etc. depending on the type you expect.
2. `nextLine()` reads a whole line including spaces; `next()`/`nextInt()`/`nextDouble()` read one token up to the next whitespace.
3. You do not have to store what you read in a variable — you can print or use a `Scanner` call's result directly.
4. Mixing `nextInt()`/`next()` with `nextLine()` can leave a leftover newline in the buffer — read `charAt(0)` off a `next()` call when you only need one character.

:::

## Exercises

<ExerciseSet>
<Exercise title="Average of three" anchor="exercise-average-three">

:::tip Activity: Average of three
Read three integers with `Scanner`. Print their average as a `double`.

<CodingExam
  title="Average of three"
  heading="exercise-average-three"
  lang="java"
  filename="Main.java"
  prompt="Read three ints, sum them, divide by 3.0, print the result."
  sampleLog={`(input) 3 4 5
4.0`}
  starter={`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: read three ints, print their average
    }
}
`}
  sourceChecks={[
    { name: 'Calls nextInt three times', pattern: '(nextInt\\(\\).*){3}', flags: 's', must: true, hint: 'Call sc.nextInt() three times.' },
  ]}
  tests={[
    { name: '3 4 5', stdin: '3 4 5', equals: '4.0' },
    { name: '0 0 0', stdin: '0 0 0', equals: '0.0' },
  ]}
/>

:::

</Exercise>

<Exercise title="Name and age sentence" anchor="exercise-name-age">

:::tip Activity: Name and age sentence
Read a name (`next()`) and an age (`nextInt()`). Print: `Hello NAME, you are AGE years old.`

<CodingExam
  title="Name and age sentence"
  heading="exercise-name-age"
  lang="java"
  filename="Main.java"
  prompt="Read name with sc.next(), age with sc.nextInt(), then print the formatted sentence."
  sampleLog={`(input) Sam 12
Hello Sam, you are 12 years old.`}
  starter={`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO
    }
}
`}
  tests={[
    { name: 'Sam 12', stdin: 'Sam 12', equals: 'Hello Sam, you are 12 years old.' },
    { name: 'Ada 30', stdin: 'Ada 30', equals: 'Hello Ada, you are 30 years old.' },
  ]}
/>

:::

</Exercise>

<Exercise title="Total cost" anchor="exercise-total-cost">

:::tip Activity: Total cost
Read the price of one item (`double`) and the quantity bought (`int`). Print the total cost.

<CodingExam
  title="Total cost"
  heading="exercise-total-cost"
  lang="java"
  filename="Main.java"
  prompt="Read price as a double, quantity as an int, print price * quantity."
  sampleLog={`(input) 2.5 4
10.0`}
  starter={`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO
    }
}
`}
  tests={[
    { name: '2.5 4', stdin: '2.5 4', equals: '10.0' },
    { name: '1.0 1', stdin: '1.0 1', equals: '1.0' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>



