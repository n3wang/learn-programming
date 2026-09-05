---
title: Chapter 4d - String Comparison
---


## using Equals() to compare Strings

```java
String  hello1 = "Hello";
String  hello2 = "Hello";
System.out.print(hello1.equals(hello2));
```

<details>
<summary>
🧪 Try the code out~!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`public class Main {
  public static void main(String[] args) {
    String  hello1 = "Hello";
    String  hello2 = "Hello";
    System.out.print(hello1.equals(hello2));
  }
}
`}
/>

</details>




```java
String  word1 = "test"
String  word2 = "Test"
System.out.print(word1.equals(word2)); 
System.out.println(word1.equalsIgnoreCase(word2));
```
<details>
<summary>
🧪 Try the code out~!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="520px"
  code={`public class Main {
  public static void main(String[] args) {
    String  hello1 = "Hello";
    String  hello2 = "Hello";
    System.out.print(hello1.equals(hello2));
  }
}
`}
/>

</details>

## Using compareTo() to compare Strings:

```java
String s1 = "hello";
String s2 = "hello";
String s3 = "apple";
String s4 = "nation";
System.out.println(s1.compareTo(s2)); //0 because both are equal 
System.out.println(s1.compareTo(s3)); //7 because "h" is 7 times greater than "a" 
System.out.println(s1.compareTo(s4)); //-6 because "h" is 6 times lower than "n" 
```
<details>
<summary>
🧪 Try the code out~!
</summary>

<PistonRunner
  lang="java"
  interactive={false}
  height="520px"
  code={`public class Main {
  public static void main(String[] args) {
    String  hello1 = "Hello";
    String  hello2 = "Hello";
    System.out.print(hello1.equals(hello2));
  }
}
`}
/>

</details>



### Try it: comparing strings

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`public class Main {
  public static void main(String[] args) {
    String a = "banana";
    String b = "apple";
    System.out.println(a.equals(b));
    System.out.println(a.equalsIgnoreCase("BANANA"));
    System.out.println(a.compareTo(b) > 0);
  }
}
`}
/>

<MultipleChoice
  id="java-ch4d-stringcompare"
  title="Comparing strings"
  questions={[
    {
      prompt: 'String a = "cat"; String b = "cat"; a == b vs a.equals(b) —',
      choices: [
        'Both always give the same result',
        '.equals() compares the actual characters; == may or may not, depending on how the Strings were created',
        '== is the only correct way to compare Strings',
        '.equals() only works on numbers',
      ],
      answer: 1,
      why: 'Strings are objects. .equals() checks the characters themselves. == checks whether both variables point to the exact same object in memory — always prefer .equals() for text.',
    },
    {
      prompt: '"apple".compareTo("banana") returns a value that is',
      choices: ['Exactly 0', 'Positive', 'Negative', 'Always -1'],
      answer: 2,
      why: "'a' comes before 'b' alphabetically, so compareTo returns a negative number when the calling String is alphabetically earlier.",
    },
  ]}
/>

<CodeExercise
  title="same word, ignoring case"
  heading="Try it: same word, ignoring case"
  lang="java"
  filename="Main.java"
  prompt="Read two words. Print true if they are equal ignoring case, false otherwise."
  sampleLog={`(input) Hello hello
true`}
  starter={`public class Main {
    public static boolean sameIgnoreCase(String a, String b) {
        // TODO: use equalsIgnoreCase
        return false;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        String a = sc.next();
        String b = sc.next();
        System.out.println(Main.sameIgnoreCase(a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Uses equalsIgnoreCase', pattern: 'equalsIgnoreCase', must: true, hint: 'a.equalsIgnoreCase(b)' },
  ]}
  tests={[
    { name: 'match different case', stdin: 'Hello hello', equals: 'true' },
    { name: 'different words', stdin: 'Hello World', equals: 'false' },
  ]}
/>

---

[👀 TODO: Trvia](https://learn2codelive.com/courses/107/pages/lesson-4-learning-activities-e2-assessment-quiz?module_item_id=9128)


## Dictionary Exercise

[👀](https://learn2codelive.com/courses/107/pages/lesson-4-learning-activities-r-practice-activity-6-dictionary-order?module_item_id=9124)

:::tip Exercise

- Modify this program so that it compares and orders two words lexicographically.

```java
import java.util.Scanner;

class Main{
public static void main (String args[]){
   Scanner scan=new Scanner(System.in);
   System.out.print("\n Enter the first word : ");
   String word1=scan.nextLine();
   System.out.print("\n Enter the second word : ");
   String word2=scan.nextLine();
   
   if(true){
      System.out.println(word1 + " and " + word2 + " are lexicographically same");
   }else if(true){
      System.out.println(word1 + " ," + word2);
   }else{
      System.out.println(word2 + ", " + word1);
   }
 }
}
```

***

🙋‍♀️ Sample Program

<PistonRunner
  lang="java"
  interactive={false}
  height="300px"
  code={`import java.util.Scanner;

class Main{
public static void main (String args[]){
   Scanner scan=new Scanner(System.in);
   System.out.print("\n Enter the first word : ");
   String word1=scan.nextLine();
   System.out.print("\n Enter the second word : ");
   String word2=scan.nextLine();
   
   if(true){
      System.out.println(word1 + " and " + word2 + " are lexicographically same");
   }else if(true){
      System.out.println(word1 + " ," + word2);
   }else{
      System.out.println(word2 + ", " + word1);
   }
 }
}
`}
/>

:::

---

## Chapter summary

:::important Key takeaways

1. Use `.equals()` (or `.equalsIgnoreCase()`) to compare the **contents** of two `String`s — never `==`, which compares object identity.
2. `.compareTo()` returns negative, zero, or positive to say whether the calling string sorts before, equal to, or after the argument alphabetically.
3. `.equalsIgnoreCase()` treats `"Test"` and `"test"` as equal; `.equals()` treats them as different.
4. String comparison, like number comparison, gives you a `boolean` you can feed straight into `if`.

:::

## Exercises

<ExerciseSet>
<Exercise title="Alphabetical order" anchor="exercise-alpha-order">

:::tip Activity: Alphabetical order
Read two words. Print them in alphabetical order, space-separated, using `.compareTo()`.

<CodeExercise
  title="Alphabetical order"
  heading="exercise-alpha-order"
  lang="java"
  filename="Main.java"
  prompt="If a.compareTo(b) <= 0, print a then b; otherwise print b then a."
  sampleLog={`(input) banana apple
apple banana`}
  starter={`public class Main {
    public static String order(String a, String b) {
        // TODO
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        String a = sc.next();
        String b = sc.next();
        System.out.println(Main.order(a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Uses compareTo', pattern: 'compareTo', must: true, hint: 'a.compareTo(b)' },
  ]}
  tests={[
    { name: 'reversed input', stdin: 'banana apple', equals: 'apple banana' },
    { name: 'already sorted', stdin: 'apple banana', equals: 'apple banana' },
  ]}
/>

:::

</Exercise>

<Exercise title="Longest word" anchor="exercise-longest-word">

:::tip Activity: Longest word
Read two words. Print the longer one (use `.length()`). If they are the same length, print the first one.

<CodeExercise
  title="Longest word"
  heading="exercise-longest-word"
  lang="java"
  filename="Main.java"
  prompt="Compare a.length() and b.length(), return the longer (or a if tied)."
  sampleLog={`(input) cat elephant
elephant`}
  starter={`public class Main {
    public static String longer(String a, String b) {
        // TODO
        return "";
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        String a = sc.next();
        String b = sc.next();
        System.out.println(Main.longer(a, b));
    }
}
`}
  sourceChecks={[
    { name: 'Uses .length()', pattern: '\\.length\\(\\)', must: true, hint: 'a.length() vs b.length()' },
  ]}
  tests={[
    { name: 'b longer', stdin: 'cat elephant', equals: 'elephant' },
    { name: 'a longer', stdin: 'elephant cat', equals: 'elephant' },
    { name: 'tied', stdin: 'cat dog', equals: 'cat' },
  ]}
/>

:::

</Exercise>

<Exercise title="Same word regardless of case" anchor="exercise-same-word">

:::tip Activity: Same word regardless of case
Read three words. Print how many of the last two match the first one, ignoring case.

<CodeExercise
  title="Same word regardless of case"
  heading="exercise-same-word"
  lang="java"
  filename="Main.java"
  prompt="Compare word2 and word3 against word1 using equalsIgnoreCase, count the matches."
  sampleLog={`(input) Cat cat DOG
1`}
  starter={`public class Main {
    public static int countMatches(String word1, String word2, String word3) {
        // TODO
        return 0;
    }
}
`}
  wrapSuffix={`
class Runner {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        String w1 = sc.next();
        String w2 = sc.next();
        String w3 = sc.next();
        System.out.println(Main.countMatches(w1, w2, w3));
    }
}
`}
  sourceChecks={[
    { name: 'Uses equalsIgnoreCase', pattern: 'equalsIgnoreCase', must: true, hint: 'word1.equalsIgnoreCase(word2)' },
  ]}
  tests={[
    { name: 'one match', stdin: 'Cat cat DOG', equals: '1' },
    { name: 'both match', stdin: 'Cat cat CAT', equals: '2' },
    { name: 'no match', stdin: 'Cat dog fish', equals: '0' },
  ]}
/>

:::

</Exercise>
</ExerciseSet>

