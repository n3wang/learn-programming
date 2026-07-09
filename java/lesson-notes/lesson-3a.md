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



