---
sidebar_position: 3
title: Chapter 2a - Data Types in Java
---



## Data Types
:::note Data Types Tree
![](./2022-04-28-16-20-50.png)

Image extracted from [Geek for Geeks](https://www.geeksforgeeks.org/data-types-in-java/)
:::


| Data Type | Size    | Description                                                                       |
| --------- | ------- | --------------------------------------------------------------------------------- |
| boolean   | 1 bit   | Stores true or false                                                              |
| char      | 2 bytes | Stores a single character i.e. 'a'. '1' etc.                                      |
| byte      | 1 byte  | Stores whole numbers from -128 to 127                                             |
| short     | 2 bytes | Stores whole numbers from -32,768 to 32,767                                       |
| int       | 4 bytes | Stores whole numbers from -2,147,483,648 to 2,147,483,647                         |
| long      | 8 bytes | Stores whole numbers from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 |
| float     | 4 bytes | Sufficient for storing 6 to 7 decimal digits                                      |
| double    | 8 bytes | Stores decimal numbers. It can store up to 15 decimal digits.                     |

- Don't worry about the size in this class yet!

## Working with Variables

Lets start by looking at some data types for variables

| Data Type | Size    | Description                                               |
| --------- | ------- | --------------------------------------------------------- |
| int       | 4 bytes | Stores whole numbers from -2,147,483,648 to 2,147,483,647 |
| short     | 2 bytes | Stores whole numbers from -32,768 to 32,767               |

### Variable Declarations
```java
int myInteger = 23;
short myShort = 50;
```

Checking datatype's size
```java
System.out.println("Size of short: " + (Short.SIZE / 8) + " bytes.");
System.out.println("Size of int: " + (Integer.SIZE / 8) + " bytes.");
```



<details>
<summary>
🧪 Try the code out! 
</summary>
<iframe src="https://trinket.io/embed/java/e694e1d8b3" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

## Arithmetic Operators

| Operator | Name           | Description                            | Example |
| -------- | -------------- | -------------------------------------- | ------- |
| +        | Addition       | Adds together two values               | x + y   |
| -        | Subtraction    | Subtracts one value from another       | x - y   |
| *        | Multiplication | Multiplies two values                  | x * y   |
| /        | Division       | Divides one value by another           | x / y   |
| %        | Modulus        | Returns the division remainder         | x % y   |
| ++       | Increment      | Increases the value of a variable by 1 | x++     |
| --       | Decrement      | Decreases the value of a variable by 1 | x--     |

### Using Math Operators
```java
public class Main {
 public static void main(String[] args) {
   int num=100;
   //Add
   int sum    = 20 + 10;
   System.out.println(sum);

   //Subtraction
   int sub    = 20 - 10;
   System.out.println(sub);

   //multiply
   int mul    = 20 * 10;
   System.out.println(mul);

   //divide
   int div    = 20 - 10;
   System.out.println(div);

   //modulo
   int modulo = 20 % 10;
   System.out.println(modulo);

   //increment
   num++;
   System.out.println(num);

   //decrement
   num--;
   System.out.println(num);
 }
}
```
<details>
<summary>
🧪 Try the code out! 
</summary>
<iframe src="https://trinket.io/embed/java/4ae86c0fd1" width="100%" height="400" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

### Try it: arithmetic operators

<PistonRunner
  lang="java"
  interactive={false}
  height="360px"
  code={`public class Main {
  public static void main(String[] args) {
    int a = 17;
    int b = 5;
    System.out.println(a + b);
    System.out.println(a - b);
    System.out.println(a * b);
    System.out.println(a / b);
    System.out.println(a % b);
  }
}
`}
/>

<MultipleChoice
  id="java-ch2a-arithmetic"
  title="Arithmetic operators"
  questions={[
    {
      prompt: 'int result = 17 / 5; What is result?',
      code: 'int result = 17 / 5;',
      codeLang: 'java',
      choices: ['3.4', '3', '2', '0'],
      answer: 1,
      why: 'Dividing two ints in Java performs integer division: the decimal part is dropped, so 17 / 5 is 3.',
    },
    {
      prompt: 'int result = 17 % 5; What is result?',
      code: 'int result = 17 % 5;',
      codeLang: 'java',
      choices: ['3', '2', '3.4', '5'],
      answer: 1,
      why: '% gives the remainder after division: 17 = 5*3 + 2, so the remainder is 2.',
    },
  ]}
/>

<CodeExercise
  title="remainder check"
  heading="Try it: remainder check"
  lang="java"
  filename="Main.java"
  prompt="Read two integers a and b. Print a % b."
  sampleLog={`(input) 17 5
2`}
  starter={`public class Main {
    public static int remainder(int a, int b) {
        // TODO: return a % b
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
        System.out.println(Main.remainder(a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Uses the modulus operator', pattern: '%', must: true, hint: 'a % b' },
  ]}
  tests={[
    { name: '17 5', stdin: '17 5', equals: '2' },
    { name: 'exact', stdin: '10 5', equals: '0' },
    { name: 'a smaller than b', stdin: '3 7', equals: '3' },
  ]}
/>

---

## Compound Assigment Operator

| operator | Definition                    |
| -------- | ----------------------------- |
| +=       | Addition and assignment       |
| -=       | Subtraction and assignment    |
| *=       | Multiplication and assignment |
| /=       | Division and assignment       |
| %=       | Remainder and assignment      |
### 👨🏻‍💻 Compound assignment operator example

```java
 int a =20;
   int b =20;
   
   System.out.println(a);
   System.out.println(b);
   
   a += 15;
   System.out.println("a is " + a);
   
   b = 15 + b;
   System.out.println("b is " + b);
   
   a -= 3;
   System.out.println("a is " + a);
```

<details>
<summary>
🧪 Try the code out! 
</summary>
<iframe src="https://trinket.io/embed/java/2bfb91b7e7" width="100%" height="1200" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

### Try it: compound assignment

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`public class Main {
  public static void main(String[] args) {
    int total = 10;
    total += 5;
    System.out.println(total);
    total *= 2;
    System.out.println(total);
    total -= 3;
    System.out.println(total);
  }
}
`}
/>

<MultipleChoice
  id="java-ch2a-compound"
  title="Compound assignment"
  questions={[
    {
      prompt: 'int x = 8; x /= 2; What is x now?',
      code: 'int x = 8;\nx /= 2;',
      codeLang: 'java',
      choices: ['8', '4', '6', '16'],
      answer: 1,
      why: 'x /= 2; is short for x = x / 2;, so 8 / 2 gives 4.',
    },
    {
      prompt: 'a += b; is shorthand for',
      choices: ['a = b;', 'a = a + b;', 'b = a + b;', 'a = a + a;'],
      answer: 1,
      why: 'Every compound assignment operator expands to "variable = variable OP other;".',
    },
  ]}
/>

<CodeExercise
  title="apply a discount"
  heading="Try it: apply a discount"
  lang="java"
  filename="Main.java"
  prompt="Read a starting price (int). Subtract 10 using -=, then print the result."
  sampleLog={`(input) 50
40`}
  starter={`public class Main {
    public static int applyDiscount(int price) {
        // TODO: subtract 10 using the -= operator, then return price
        return price;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int price = sc.nextInt();
        System.out.println(Main.applyDiscount(price));
    }
}
`}
  sourceChecks={[
    { name: 'Uses -= compound assignment', pattern: '-=', must: true, hint: 'price -= 10;' },
  ]}
  tests={[
    { name: '50', stdin: '50', equals: '40' },
    { name: '10', stdin: '10', equals: '0' },
  ]}
/>

---

[👀 Practice Activity](https://learn2codelive.com/courses/107/pages/lesson-2-learning-activities-r-practice-activity-1-prediction-with-integer-data-type-and-math-operations?module_item_id=9048)

## Integrated Example
*Here an example showing everything together, please feel free to try it out!*

The following program prints makes operations with differents variables you can try the code out below!

```java
  int a = 4;
  int b = 3;
  int num1 = 5;
  int num2 = 4;
  System.out.println("a+b = " + (a + b)); //a + b evaluates to  7
  //println() - inserts newline character
  //print() -will continue on printing in the same line
  System.out.println("a-b = " + (a - b)); //a - b evaluates to  1
  System.out.println("a*b = " + (a * b)); //a * b evaluates to  7
  System.out.println("a%b = " + (a % b)); //a % b evaluates to  1 ,as it returns remainder
  a++; //increments the value of a by 1, so a becomes 5
  System.out.println("a = " + a);
  a--; //decrements the value of a by 1, so a becomes 4
  System.out.println("a = " + a);
  // a+=b equivalent or short form of a=a+b;
  // a-=b equivalent or short form of a=a-b;
  System.out.println("num1 + num2 = " + (num1 + num2));
  num1 += num2; //num1 will be added to num2 and stored in num1, so num1=9
  System.out.println("num1 + num2 = " + num1);
  //subtraction
  System.out.println("num1 - num2 = " + (num1 - num2));
  num1 -= num2; // num2 will be subtracted to num1 and stored in num1, so num1=5 (9-4=5)
  System.out.println("num1 - num2 = " + num1);
  //------increment operation----
  // ++ (increment operator) is equivalent to a=a+1 (a++ is equivalent to a=a+1)
  //prefix
  System.out.println("prefixed a = " + (++a)); // a becomes 5
  //postfix
  System.out.println("postfixed a = " + (a++)); // a becomes 6 but after assignment. Here it will print original value(before postfix increment operation)
  System.out.println("postfixed a =" + a); // postfix operation can be checked here
  //----decrement operator----
  // --(decrement operator)is equivalent to a=a-1 (a-- is equivalent to a=a-1)
  //prefix
  System.out.println("prefixed a = " + --a); // a becomes 5
  //postfix
  System.out.println("postfixed a = " + a--); // Ask students what they think this does?
  // a becomes 4 but after assignment.Here it will print original value(before postfix decrement operation)
  System.out.println("postfixed a = " + a); //a=4, postfix operation can be checked here

```


<details>
<summary>
🧪 Try the code out! 
</summary>
<iframe src="https://trinket.io/embed/java/28a729f904" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>

## Class Excercise:

:::tip Exercise 1: 🔨 Fix the following code Piggy Bank 🐖🏦

This is the prompt
Rene has $29.80 in her piggy bank. Rene’s dad has promised to give her $2.50 if she takes out trash. Her mom has promised to give her another $2.50 if she does her laundry. Her mom and dad have also promised to give her $2.75 if she walks the dog. Write a program that calculates the money that Rene will have if she does all the three chores. Use variables for each number and output the result in a complete sentence. Before you start, think about the data type(s) that you will use and why.


The following code **should print**:
```output
Piggy bank bal : 29.8
Total amount after Trash Cleaning : 29.8 + 2.5 = 32.3
Total amount after doing Laundry : 32.3 + 2.5 = 34.8
Total amount after taking dog on walk : 34.8 + 2.75 = 37.55
```

**But instead** it prints this:
```Output
Piggy bank bal : 29.8
Total amount after Trash Cleaning : 29.8 + 2.5 = 29.82.5
Total amount after doing Laundry : 32.3 + 2.5 = 32.32.5
```

Code with error:
```java
public class Main {
  public static void main(String args[]) {
      float piggy_bank_bal = 29.80f;// what will happen when we make it 'int'
      float earning_from_trash = 2.50f;
      float earning_from_laundry = 2.50f;
      float earning_from_petsitter = 2.75f;
      float total = piggy_bank_bal;
      System.out.println("Piggy bank bal : " + piggy_bank_bal);
      System.out.println("Total amount after Trash Cleaning : " + total + " + " + earning_from_trash + " = " + total + earning_from_trash);
      total = total + earning_from_trash; //total calculation after trash cleaning
      System.out.println("Total amount after doing Laundry : " + total + " + " + earning_from_laundry + " = " + total + earning_from_laundry);
      total = total + earning_from_laundry; //total calculation after laundry
      System.out.println("Total amount after taking dog on walk : " + total + " + " + earning_from_petsitter + " = " + total + earning_from_petsitter);
  }
}
```


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
<iframe src="https://trinket.io/embed/java/eebac3afea" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>
</details>



:::
<!-- 


:::tip Exercise 1 🐖🏦 Piggy Bank

Rene has $29.80 in her piggy bank. Rene’s dad has promised to give her $2.50 if she takes out trash. Her mom has promised to give her another $2.50 if she does her laundry. Her mom and dad have also promised to give her $2.75 if she walks the dog. Write a program that calculates the money that Rene will have if she does all the three chores. Use variables for each number and output the result in a complete sentence. Before you start, think about the data type(s) that you will use and why.



<details>
<summary>
✍ Solve the problem using Replit
</summary>
<a href="https://replit.com/@n3wang/EmptyJavaCanvas#Main.java" >Feel free to use Repl, you can fork from this empty canvas in Repl.it</a>

</details>

<details>
<summary>
✍  You can solve the problem <b> here </b>using Trinket
</summary>
<iframe src="https://trinket.io/embed/java/6e661a677c" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

</details>
:::


 -->

---

## Chapter summary

:::important Key takeaways

1. Java's whole-number types (`byte`, `short`, `int`, `long`) and decimal types (`float`, `double`) trade off range and precision — `int` and `double` cover most everyday programs.
2. `/` between two `int`s performs **integer division** and drops the decimal part; mix in a `double` if you need a fractional result.
3. `%` returns the remainder of a division — useful for even/odd checks and wrap-around counting.
4. Compound assignment (`+=`, `-=`, `*=`, `/=`, `%=`) is shorthand for "take the variable, apply the operator, store it back."

:::

## Exercises

<ExerciseSet>
<Exercise title="BMI inputs" anchor="exercise-bmi">

:::tip Activity: BMI inputs
Read a weight in kg and a height in meters (both `double`). Print the BMI using `weight / (height * height)`.

<CodeExercise
  title="BMI inputs"
  heading="exercise-bmi"
  lang="java"
  filename="Main.java"
  prompt="Return weight / (height * height)."
  sampleLog={`(input) 70 1.75
22.857142857142858`}
  starter={`public class Main {
    public static double bmi(double weight, double height) {
        // TODO
        return 0.0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        double w = sc.nextDouble();
        double h = sc.nextDouble();
        System.out.println(Main.bmi(w, h));
    }
}
`}
  tests={[
    { name: '70 1.75', stdin: '70 1.75', equals: '22.857142857142858' },
    { name: '60 1.5', stdin: '60 1.5', equals: '26.666666666666668' },
  ]}
/>

:::

</Exercise>

<Exercise title="Last two digits" anchor="exercise-last-two-digits">

:::tip Activity: Last two digits
Read a positive integer. Print its last two digits using `%`.

<CodeExercise
  title="Last two digits"
  heading="exercise-last-two-digits"
  lang="java"
  filename="Main.java"
  prompt="Return n % 100."
  sampleLog={`(input) 13579
79`}
  starter={`public class Main {
    public static int lastTwo(int n) {
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
        System.out.println(Main.lastTwo(n));
    }
}
`}
  sourceChecks={[
    { name: 'Uses the modulus operator', pattern: '%', must: true, hint: 'n % 100' },
  ]}
  tests={[
    { name: '13579', stdin: '13579', equals: '79' },
    { name: 'single digit', stdin: '7', equals: '7' },
  ]}
/>

:::

</Exercise>

<Exercise title="Running total" anchor="exercise-running-total">

:::tip Activity: Running total
Read a starting balance, then two more integers to add. Using `+=` twice, print the final balance.

<CodeExercise
  title="Running total"
  heading="exercise-running-total"
  lang="java"
  filename="Main.java"
  prompt="Start with balance, then balance += a; balance += b; return balance."
  sampleLog={`(input) 100 20 5
125`}
  starter={`public class Main {
    public static int total(int balance, int a, int b) {
        // TODO: use += twice
        return balance;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int balance = sc.nextInt();
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(Main.total(balance, a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Uses += compound assignment', pattern: '\\+=', must: true, hint: 'balance += a;' },
  ]}
  tests={[
    { name: '100 20 5', stdin: '100 20 5', equals: '125' },
    { name: '0 1 1', stdin: '0 1 1', equals: '2' },
  ]}
/>

:::

</Exercise>

<Exercise title="Size in bytes" anchor="exercise-size-bytes">

:::tip Activity: Size in bytes
Print how many bytes an `int` and a `long` each use, one per line, using `Integer.SIZE` and `Long.SIZE` (both in bits — divide by 8).

<CodeExercise
  title="Size in bytes"
  heading="exercise-size-bytes"
  lang="java"
  filename="Main.java"
  prompt="Print Integer.SIZE / 8, then Long.SIZE / 8, one per line."
  sampleLog={`(no input)
4
8`}
  starter={`public class Main {
    public static void printSizes() {
        // TODO: print Integer.SIZE / 8 then Long.SIZE / 8, each on its own line
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        Main.printSizes();
    }
}
`}
  tests={[
    { name: 'sizes', stdin: '', equals: '4\n8' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>





