/** Lesson snippets used as the JAVA_SOLUTIONS typing corpus. */
export const JAVA_SOLUTIONS = [
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int age=15;\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n      int num = 100;\n      // Addition\n      int sum    = 20 + 10;\n      System.out.println(sum);\n\n      // Subtraction\n      int sub    = 20 - 10;\n      System.out.println(sub);\n\n      // Multiplication\n      int mul    = 20 * 10;\n      System.out.println(mul);\n\n      // Division\n      int div    = 20 - 10;\n      System.out.println(div);\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int num = 100;\n    int sum = 20 + 10;\n    int sub = 20 - 10;\n    int mul = 20 * 10;\n    int div = 20 / 10;\n    System.out.println(sum);\n    System.out.println(sub);\n    System.out.println(mul);\n    System.out.println(div);\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "class Main{ //”class” is a keyword which is used to define a class.\n  public static void main(String[] args) {\n    System.out.println(\"PROGRAM TO ADD TWO NUMBERS\");\n    int num1 = 10; // num1 is a variable of int data type\n    int num2 = 20; // num2 is a variable of int data type\n    int sum = num1 + num2; //sum is a variable of int data type\n    System.out.println(num1);\n    System.out.println(num2);\n    System.out.println(sum);\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Pineapple \" + \" Pen\");\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int books = 51;\n    System.out.println(\"I have \" + books + \" books in my study\");  \n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int books = 51;\n    System.out.println(\"I have \" + books + \" books in my study\");\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    // TODO: read year of birth and current year, print age\n    int yearOfBirth = 2005;\n    int currentYear = 2020;\n    // int age = ...\n    System.out.println(\"Age Calculator\");\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int yearOfBirth = 2005;\n    int targetAge = 20;\n    int yearWhenTarget = yearOfBirth + targetAge;\n    System.out.println(\"You will be \" + targetAge + \" in the year \" + yearWhenTarget);\n  }\n}"
  },
  {
    "title": "lesson-1a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    // TODO: Pete hiked some miles; Shannon is 2 ahead, or twice as far\n    int pete = 10;\n    // int shannonAhead = ...\n    // int shannonDouble = ...\n    System.out.println(\"Hiking\");\n  }\n}"
  },
  {
    "title": "lesson-2a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Size of short: \" + (Short.SIZE / 8) + \" bytes.\");\n    System.out.println(\"Size of int: \" + (Integer.SIZE / 8) + \" bytes.\");\n  }\n}"
  },
  {
    "title": "lesson-2a",
    "code": "public class Main {\n public static void main(String[] args) {\n   int num=100;\n   //Add\n   int sum    = 20 + 10;\n   System.out.println(sum);\n\n   //Subtraction\n   int sub    = 20 - 10;\n   System.out.println(sub);\n\n   //multiply\n   int mul    = 20 * 10;\n   System.out.println(mul);\n\n   //divide\n   int div    = 20 - 10;\n   System.out.println(div);\n\n   //modulo\n   int modulo = 20 % 10;\n   System.out.println(modulo);\n\n   //increment\n   num++;\n   System.out.println(num);\n\n   //decrement\n   num--;\n   System.out.println(num);\n }\n}"
  },
  {
    "title": "lesson-2a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int a = 17;\n    int b = 5;\n    System.out.println(a + b);\n    System.out.println(a - b);\n    System.out.println(a * b);\n    System.out.println(a / b);\n    System.out.println(a % b);\n  }\n}"
  },
  {
    "title": "lesson-2a",
    "code": "public class Main {\n  public static void main(String[] args) {\n     int a =20;\n       int b =20;\n   \n       System.out.println(a);\n       System.out.println(b);\n   \n       a += 15;\n       System.out.println(\"a is \" + a);\n   \n       b = 15 + b;\n       System.out.println(\"b is \" + b);\n   \n       a -= 3;\n       System.out.println(\"a is \" + a);\n  }\n}"
  },
  {
    "title": "lesson-2a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int total = 10;\n    total += 5;\n    System.out.println(total);\n    total *= 2;\n    System.out.println(total);\n    total -= 3;\n    System.out.println(total);\n  }\n}"
  },
  {
    "title": "lesson-2a",
    "code": "public class Main {\n  public static void main(String args[]) {\n      float piggy_bank_bal = 29.80f;// what will happen when we make it 'int'\n      float earning_from_trash = 2.50f;\n      float earning_from_laundry = 2.50f;\n      float earning_from_petsitter = 2.75f;\n      float total = piggy_bank_bal;\n      System.out.println(\"Piggy bank bal : \" + piggy_bank_bal);\n      System.out.println(\"Total amount after Trash Cleaning : \" + total + \" + \" + earning_from_trash + \" = \" + total + earning_from_trash);\n      total = total + earning_from_trash; //total calculation after trash cleaning\n      System.out.println(\"Total amount after doing Laundry : \" + total + \" + \" + earning_from_laundry + \" = \" + total + earning_from_laundry);\n      total = total + earning_from_laundry; //total calculation after laundry\n      System.out.println(\"Total amount after taking dog on walk : \" + total + \" + \" + earning_from_petsitter + \" = \" + total + earning_from_petsitter);\n  }\n}"
  },
  {
    "title": "lesson-2a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    float piggyBankBal = 29.80f;\n    float earningFromTrash = 2.50f;\n    float earningFromLaundry = 2.50f;\n    float earningFromPetsitter = 2.75f;\n    float total = 0; // TODO: start from piggyBankBal, then add each chore\n    // TODO: print each step and the final total in a complete sentence\n    System.out.println(\"Piggy bank bal : \" + piggyBankBal);\n  }\n}"
  },
  {
    "title": "lesson-2b",
    "code": "public class Main {\n public static void main(String args[]) {\n   int x = 10; // integer x\n   // x is implicitly converted to float\n   float z =x + 1.0f;\n   System.out.println(\"x = \" + x );\n   System.out.println(\"z = 'x+1.0f'(x=10) = \" + z );\n }\n}"
  },
  {
    "title": "lesson-2b",
    "code": "public class Main {\n\npublic static void main(String args[]) {\n  double d=1.6;\n  int val=(int)d; //casting from double to int\n  System.out.println(\"val = \"+val );\n  }\n}"
  },
  {
    "title": "lesson-2b",
    "code": "public class Main {\n public static void main(String args[]) {\n int val=(int)2.4 - 2.1;\n System.out.println(\"val = \" +val);\n }\n}"
  },
  {
    "title": "lesson-2b",
    "code": "public class Main {\n public static void main(String args[]) {\n int val=(int)(2.4 - 2.1);\n System.out.println(\"val = \" +val);\n }\n}"
  },
  {
    "title": "lesson-2b",
    "code": "public class Main {\n  public static void main(String[] args) {\n    double price = 19.99;\n    int wholeDollars = (int) price;\n    System.out.println(wholeDollars);\n  }\n}"
  },
  {
    "title": "lesson-2c",
    "code": "public class Main {\n\npublic static void main(String[] args)   \n  {  \n      double num1 = 4;  \n      double num2 = 2;  \n      double num3 = 4.25;\n      // return the Minimum of two numbers\n      System.out.println(\"Minimum of \" + num1 + \" and \" + num2 + \"is: \" + Math.min(num1, num2));\n      // returns the Maximum of two numbers\n      System.out.println(\"Maximum of \" + num1 + \" and \" + num2 + \"is: \" + Math.max(num1, num2));\n      //returns 16 i.e. 4*4 \n      System.out.println(\"Power of \" + num1 + \" and \" + num2 + \"is: \" + Math.pow(num1, num2)); \n      // returns the decimal number rounded to the nearest whole number value.\n      System.out.println(\"Rounding off \" + num3 + \" yields: \" + Math.round(num3));\n      // returns the square root of num1 \n      System.out.println(\"Square root of \" + num1 + \" is \" + Math.sqrt(num1));\n      // returns the absolute value of int type\n      System.out.println(\"Absolute value \" + num1 + \" is \" + Math.abs(num1));\n      // returns the smallest integer value that is greater than or equal to the given numbe \n      System.out.println(\"Ceiling  of \" + num3 + \" is \" + Math.ceil(num3));\n      // returns the largest integer value which is less than or equal to the given number\n      System.out.println(\"Floor  of \" + num3 + \" is \" + Math.floor(num3));\n  }\n}"
  },
  {
    "title": "lesson-2c",
    "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(Math.max(4, 9));\n    System.out.println(Math.min(4, 9));\n    System.out.println(Math.pow(2, 5));\n    System.out.println(Math.sqrt(81));\n    System.out.println(Math.abs(-12));\n  }\n}"
  },
  {
    "title": "lesson-2c",
    "code": "public class Main {\n  public static void main(String[] args) {\n    double totalMoney = 37.50;\n    double usableMoney = 37.0; // bills only — kiosk can't take coins\n    double ticketPrice = 7.50;\n    int tickets = 0; // TODO: how many tickets from usableMoney?\n    int friends = 0; // TODO: tickets minus yourself\n    double moneyLeft = 0; // TODO: leftover after buying all tickets\n    System.out.println(\"I have $\" + totalMoney);\n    System.out.println(\"Since I can't use the coins, I can only use $\" + usableMoney + \" to buy tickets.\");\n    System.out.println(\"Each ticket costs $\" + ticketPrice);\n    System.out.println(\"I can take \" + friends + \" friends to the movies along with me!\");\n    System.out.println(\"I am left with $\" + moneyLeft);\n  }\n}"
  },
  {
    "title": "lesson-2d",
    "code": "public class Main {\n  public static void main(String[] args) {\n    char x = 'a';    \n    System.out.print(x);\n  }\n}"
  },
  {
    "title": "lesson-2d",
    "code": "public class Main {\n  public static void main(String[] args) {\n    char x = 97;\n    System.out.println(x);    //Should print 'a'\n  }\n}"
  },
  {
    "title": "lesson-2d",
    "code": "public class Main\n{\n public static void main(String[] args) \n {\n   char ch1 = 'a';\n   char ch2 = 'B';\n   System.out.println(Character.toUpperCase(ch1));//converts lowercase to uppercase\n   System.out.println(Character.toLowerCase(ch2));//converts uppercase to lowercase\n }\n}"
  },
  {
    "title": "lesson-2d",
    "code": "public class Main {\n  public static void main(String[] args) {\n    char ch1 = 'j';\n    char ch2 = 'D';\n    System.out.println(Character.toUpperCase(ch1));\n    System.out.println(Character.toLowerCase(ch2));\n  }\n}"
  },
  {
    "title": "lesson-3a",
    "code": "import java.util.*;\nclass Main {\n    public static void main(String arg[]) {\n      System.out.print(\"Enter Your Name : \");  // user prompt\n      Scanner sc = new Scanner(System.in);     // take user input\n      String name = sc.nextLine();             // store the user input in the name variable\n      System.out.println(\"Name : \"+ name);     // output the value stored in name\n    }\n}"
  },
  {
    "title": "lesson-3a",
    "code": "import java.util.*;\nclass Main {\n    public static void main(String args[]) {\n        Scanner scan = new Scanner(System.in);\n        System.out.println(\"------------------------------------------------\");\n        System.out.println(\"The following items are availabe at Bake Bar: \");\n        System.out.println(\"Shortcakes at $1.5 per cake\");\n        System.out.println(\"Macaron at $1 per piece\");\n        System.out.println(\"Chocochip cookies at $1 per cookie\");\n        System.out.println(\"-------------------------------------------------\");\n        System.out.print(\"Enter the number of shortcakes you want: \");\n        int shortcake = scan.nextInt();\n        System.out.print(\"Enter the number of macarons you want: \");\n        int macaron = scan.nextInt();\n        System.out.print(\"Enter the number of cookies you want: \");\n        int cookie = scan.nextInt();\n        double costCake = 1.5 * shortcake; //calculate the money spent on shortcake\n        double costMacaron = 1 * macaron; // calculate the money spent on macarons\n        double costCookie = 1 * cookie; // calculate the money spent on cookies\n        double totalCost = costCake + costMacaron + costCookie;\n        //calculate the total money spent on all 3 items\n        System.out.println(\"Bill amount for your shopping is $\" + totalCost);\n    }\n}"
  },
  {
    "title": "lesson-3a",
    "code": "import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    System.out.print(\"Enter the first number: \");\n    int a = sc.nextInt();\n    System.out.print(\"Enter the second number: \");\n    int b = sc.nextInt();\n    System.out.println(\"Sum: \" + (a + b));\n  }\n}"
  },
  {
    "title": "lesson-3a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Enter Your Name\");\n    Scanner sc=new Scanner(System.in);\n    System.out.println(sc.nextLine());\n  }\n}"
  },
  {
    "title": "lesson-4a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    boolean isJavaFun = true;\n    boolean isFishTasty = false;    \n    System.out.println(isJavaFun);\n    System.out.println(isFishTasty);\n  }\n}"
  },
  {
    "title": "lesson-4a",
    "code": "class Main{\n public static void main (String args[]){\n    int my_age    = 21;\n    int age_marie  = 25;\n   \n   System.out.println(\"Am I older than Marie? \" + (my_age < age_marie));\n   }\n}"
  },
  {
    "title": "lesson-4a",
    "code": "class Main{\n public static void main (String args[]){\n   //heights are in inches\n   //create variables for heights of the five friends\n    int ht_tom    = 61;\n    int ht_marie  = 53;\n    int ht_darell = 60;\n    int ht_alisha = 55;\n    int ht_joe    = 66;\n   //boolean expression evaluates to True or False\n   System.out.println(\"Tom is of the same height as Marie: \" + (ht_tom != ht_marie));\n   System.out.println(\"Tom is as tall as Marie or taller: \" + (ht_tom >= ht_marie));\n   System.out.println(\"Darell is shorter or the same height as Joe: \"+ (ht_darell <= ht_joe));\n   System.out.println(\"Alisha is shorter than Tom: \" + (ht_alisha < ht_tom));\n   }\n}"
  },
  {
    "title": "lesson-4a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int a = 8;\n    int b = 12;\n    System.out.println(a == b);\n    System.out.println(a != b);\n    System.out.println(a < b);\n    System.out.println(a >= b);\n  }\n}"
  },
  {
    "title": "lesson-4a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int myAge = 16;\n    int friendAge = 18;\n    System.out.println(\"Am I older than my friend? \" + (myAge > friendAge));\n    System.out.println(\"Am I younger than or the same age as my friend? \" + (myAge <= friendAge));\n    System.out.println(\"Are we the same age? \" + (myAge == friendAge));\n  }\n}"
  },
  {
    "title": "lesson-4a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int myAge = 16; // change these ages\n    int friendAge = 18;\n    // TODO: print a friendly message for myAge > friendAge\n    // TODO: print a friendly message for myAge <= friendAge\n    // TODO: print a friendly message for myAge == friendAge\n  }\n}"
  },
  {
    "title": "lesson-4b",
    "code": "public class Main {\n  public static void main(String[] args) {\n    if(false){\n      System.out.println(\"Is True\");\n    }else {\n      System.out.println(\"Is False\");\n    }\n  }\n}"
  },
  {
    "title": "lesson-4b",
    "code": "class Main{\n public static void main (String args[]){\n    int my_age    = 21;\n    int age_marie  = 25;\n   \n     if(my_age < age_marie){\n       System.out.println(\"I am Younger than Marie\");\n     }else if(my_age > age_marie){\n       System.out.println(\"I am Older than Marie\");\n     }\n   }\n}"
  },
  {
    "title": "lesson-4b",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int num = 5;\n    if (num > 0) {\n      System.out.println(\"num is positive.\");\n    } else if (num < 0) {\n      System.out.println(\"num is negative\");\n    } else {\n      System.out.println(\"num is ZERO (0)\");\n    }\n  }\n}"
  },
  {
    "title": "lesson-4b",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int score = 72;\n    if (score >= 90) {\n      System.out.println(\"A\");\n    } else if (score >= 80) {\n      System.out.println(\"B\");\n    } else if (score >= 70) {\n      System.out.println(\"C\");\n    } else {\n      System.out.println(\"F\");\n    }\n  }\n}"
  },
  {
    "title": "lesson-4b",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int num = 5; // try -5 and 0 too\n    if (num > 0) {\n      // TODO: print num is positive.\n    } else if (num < 0) {\n      // TODO: print num is negative\n    } else {\n      // TODO: print num is ZERO (0)\n    }\n  }\n}"
  },
  {
    "title": "lesson-4b",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int num = 5; // try -5 and 0 too\n    if (num > 0) {\n      System.out.println(\"num is positive.\");\n    } else if (num < 0) {\n      System.out.println(\"num is negative\");\n    } else {\n      System.out.println(\"num is ZERO (0)\");\n    }\n  }\n}"
  },
  {
    "title": "lesson-4b",
    "code": "public class Main{\n public static void main(String args[]){ \n int num = 25;\n \n \n if (num >5){\n   System.out.println(\"num is greater than 5\");\n   if(num>10){\n      System.out.println(\"num is larger than 10\");\n      if(num>20){\n        System.out.println(\"num is larger than 20\");       \n      }\n   }\n  }else if(num<0){  \n    System.out.print (\"num is negative\");\n    \n  }else{\n    System.out.print (\"num is ZERO (0)\");\n  }\n }\n}"
  },
  {
    "title": "lesson-4c",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int signal = 1; // try 1, 2, 3, or 9\n    if (signal == 1) {\n      System.out.println(\"Stop your vehicle\");\n    } else if (signal == 2) {\n      System.out.println(\"Slow down and bring the vehicle to a stop\");\n    } else if (signal == 3) {\n      System.out.println(\"Keep driving\");\n    } else {\n      System.out.println(\"Invalid signal\");\n    }\n  }\n}"
  },
  {
    "title": "lesson-4c",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int signal = 1; // try 1, 2, 3, or 9\n    if (signal == 1) {\n      // TODO: print Stop your vehicle\n    } else if (signal == 2) {\n      // TODO: print Slow down and bring the vehicle to a stop\n    } else if (signal == 3) {\n      // TODO: print Keep driving\n    } else {\n      // TODO: print Invalid signal\n    }\n  }\n}"
  },
  {
    "title": "lesson-4c",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int temp = 95; // try 75, 60, ...\n    int daysSinceRain = 1; // try 0, 1, 2, 3\n    if (temp > 90 && daysSinceRain >= 1) {\n      System.out.println(\"Water the yard\");\n    } else if (temp >= 70 && temp <= 90 && daysSinceRain >= 2) {\n      System.out.println(\"Water the yard\");\n    } else if (temp < 70 && daysSinceRain >= 3) {\n      System.out.println(\"Water the yard\");\n    } else {\n      System.out.println(\"Skip watering\");\n    }\n  }\n}"
  },
  {
    "title": "lesson-4c",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int temp = 95;\n    int daysSinceRain = 1;\n    if (temp > 90 && daysSinceRain >= 1) {\n      // TODO: print Water the yard\n    } else if (temp >= 70 && temp <= 90 && daysSinceRain >= 2) {\n      // TODO: print Water the yard\n    } else if (temp < 70 && daysSinceRain >= 3) {\n      // TODO: print Water the yard\n    } else {\n      // TODO: print Skip watering\n    }\n  }\n}"
  },
  {
    "title": "lesson-4d",
    "code": "public class Main {\n  public static void main(String[] args) {\n    String  hello1 = \"Hello\";\n    String  hello2 = \"Hello\";\n    System.out.print(hello1.equals(hello2));\n  }\n}"
  },
  {
    "title": "lesson-4d",
    "code": "public class Main {\n  public static void main(String[] args) {\n    String  word1 = \"test\"\n    String  word2 = \"Test\"\n    System.out.print(word1.equals(word2)); \n    System.out.println(word1.equalsIgnoreCase(word2));\n  }\n}"
  },
  {
    "title": "lesson-4d",
    "code": "public class Main {\n  public static void main(String[] args) {\n    String s1 = \"hello\";\n    String s2 = \"hello\";\n    String s3 = \"apple\";\n    String s4 = \"nation\";\n    System.out.println(s1.compareTo(s2)); //0 because both are equal \n    System.out.println(s1.compareTo(s3)); //7 because \"h\" is 7 times greater than \"a\" \n    System.out.println(s1.compareTo(s4)); //-6 because \"h\" is 6 times lower than \"n\" \n  }\n}"
  },
  {
    "title": "lesson-4d",
    "code": "public class Main {\n  public static void main(String[] args) {\n    String a = \"banana\";\n    String b = \"apple\";\n    System.out.println(a.equals(b));\n    System.out.println(a.equalsIgnoreCase(\"BANANA\"));\n    System.out.println(a.compareTo(b) > 0);\n  }\n}"
  },
  {
    "title": "lesson-4d",
    "code": "import java.util.Scanner;\n\nclass Main{\npublic static void main (String args[]){\n   Scanner scan=new Scanner(System.in);\n   System.out.print(\"\\n Enter the first word : \");\n   String word1=scan.nextLine();\n   System.out.print(\"\\n Enter the second word : \");\n   String word2=scan.nextLine();\n   \n   if(true){\n      System.out.println(word1 + \" and \" + word2 + \" are lexicographically same\");\n   }else if(true){\n      System.out.println(word1 + \" ,\" + word2);\n   }else{\n      System.out.println(word2 + \", \" + word1);\n   }\n }\n}"
  },
  {
    "title": "lesson-5a",
    "code": "import java.util.Random;\nclass Main {\n   public static void main(String args[]) {\n       \n       Random rand = new Random(); //creates object of class Random which is used to generate random number\n       int randomNum = rand.nextInt(4); //generates random numbers\n       System.out.println(randomNum);\n   }\n}"
  },
  {
    "title": "lesson-5a",
    "code": "import java.util.Scanner;\nimport java.util.Random;\nclass Main {\n   public static void main(String args[]) {\n       Scanner scan = new Scanner(System.in);\n       Random rand = new Random(); //creates object of class Random which is used to generate random number\n       System.out.println(\"This is a simulation of a coin toss.\");\n       System.out.println(\"Tossing coin now...\\n\");\n       int randomNum = rand.nextInt(2); //generates random numbers 0 & 1\n       if (randomNum == 0) {\n           System.out.println(\"HEADS...\\n\");\n       } else {\n           System.out.println(\"TAILS...\\n\");\n       }\n   }\n}"
  },
  {
    "title": "lesson-5a",
    "code": "import java.math.RoundingMode; \nimport java.text.DecimalFormat;\nclass Main {\n public static void main(String[] args) {\n   for(int count = 0; count< 5; count++){\n     System.out.println(Math.random());\n   }\n  }\n}"
  },
  {
    "title": "lesson-5a",
    "code": "import java.math.RoundingMode;\nimport java.text.DecimalFormat;\nclass Main {\npublic static void main(String[] args) {\n    DecimalFormat df = new DecimalFormat(\"0.00\");\n    for(int count = 0; count< 5; count++){\n    double d=Math.random();\n    System.out.println(df.format(d)); \n  }\n }\n}"
  },
  {
    "title": "lesson-6a",
    "code": "import java.util.*;\nclass Main {\n  public static void main(String[] args) {\n    int number = 0;\n    while (number<5)\n    {\n        System.out.println(\"Hello\");\n        number++;\n    }\n    \n  }\n}"
  },
  {
    "title": "lesson-6a",
    "code": "import java.util.Random;\nclass Main {\n   public static void main(String args[]) {\n       \n       int count = 10;\n        while (count >= 1)\n        {\n            System.out.println(\"Hello World\");\n            System.out.println(count);\n            count--;\n        }\n   }\n}"
  },
  {
    "title": "lesson-6a",
    "code": "import java.util.*;\nclass Main {\n  public static void main(String[] args) {\n   int number = 1;\n    while (number <= 5)\n    {\n       System.out.println(\"Hello\");\n    }\n    \n  }\n}"
  },
  {
    "title": "lesson-6a",
    "code": "import java.util.*;\nclass Main {\n  public static void main(String[] args) {\n  int number;\n\n  // Create a Scanner object for keyboard input.\n  Scanner keyboard = new Scanner(System.in);\n  \n  // Get a number from the user.\n  System.out.print(\"Enter a number in the range of 1 through 100: \");\n  number = keyboard.nextInt();\n  \n  // Validate the input.\n  while (number < 1 || number > 100)\n  {\n     System.out.print(\"Invalid input. Enter a number in the range \" +\n                      \"of 1 through 100: \");\n     number = keyboard.nextInt();\n  }\n    \n  }\n}"
  },
  {
    "title": "lesson-6a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int attempts = 0;\n    int number = -5; // pretend this came from user input\n    while (number < 1 || number > 100) {\n      attempts++;\n      number = 42; // pretend the \"next\" input is valid\n    }\n    System.out.println(\"Valid after \" + attempts + \" retry/retries\");\n  }\n}"
  },
  {
    "title": "lesson-6b",
    "code": "import java.util.*;\nclass Main {\n  public static void main(String[] args) {\n    for(int i = 1; i<3; i++){\n      System.out.println(i);\n    }\n    \n  }\n}"
  },
  {
    "title": "lesson-6b",
    "code": "public class Main {\n  public static void main(String[] args) {\n    for (int i = 1; i <= 5; i++) {\n      System.out.println(\"Count: \" + i);\n    }\n  }\n}"
  },
  {
    "title": "lesson-7a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    for (int row = 1; row <= 3; row++) {\n      for (int col = 1; col <= 3; col++) {\n        System.out.print(\"* \");\n      }\n      System.out.println();\n    }\n  }\n}"
  },
  {
    "title": "lesson-7a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int n = 5;\n    for (int row = 1; row <= n; row++) {\n      for (int col = 1; col <= row; col++) {\n        System.out.print(\"*\");\n      }\n      System.out.println();\n    }\n  }\n}"
  },
  {
    "title": "lesson-8a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int[] scores = {90, 85, 77, 100};\n    System.out.println(scores[0]);\n    System.out.println(scores[3]);\n    System.out.println(scores.length);\n  }\n}"
  },
  {
    "title": "lesson-8a",
    "code": "public class Main {\n  public static void main(String[] args) {\n    int[] scores = {90, 85, 77, 100};\n    for (int i = 0; i < scores.length; i++) {\n      System.out.println(\"Index \" + i + \" = \" + scores[i]);\n    }\n    for (int s : scores) {\n      System.out.println(\"Score: \" + s);\n    }\n  }\n}"
  },
  {
    "title": "lesson-9a",
    "code": "public class Main {\n  public static int square(int n) {\n    return n * n;\n  }\n\n  public static void main(String[] args) {\n    System.out.println(square(4));\n    System.out.println(square(7));\n    int x = square(3);\n    System.out.println(x);\n  }\n}"
  },
  {
    "title": "lesson-9a",
    "code": "public class Main {\n  public static boolean isEven(int n) {\n    return n % 2 == 0;\n  }\n\n  public static String describe(int n) {\n    if (isEven(n)) {\n      return n + \" is even\";\n    } else {\n      return n + \" is odd\";\n    }\n  }\n\n  public static void main(String[] args) {\n    System.out.println(describe(4));\n    System.out.println(describe(7));\n  }\n}"
  },
  {
    "title": "project-2d",
    "code": "class Main {\n public static void main(String[] args) {\n  String message = \"Hello World\";\n  int offset=3;\n  \n  StringBuilder result = new StringBuilder();\n  for (char character : message.toCharArray()) {\n      if (character != ' ') {\n          int originalAlphabetPosition = character - 'a';\n          int newAlphabetPosition = (originalAlphabetPosition + offset) % 26;\n          char newCharacter = (char) ('a' + newAlphabetPosition);\n          result.append(newCharacter);\n      } else {\n          result.append(character);\n      }\n  }\n  System.out.println(result);\n\n }\n}"
  },
  {
    "title": "project-2d",
    "code": "class Main {\n public static void main(String[] args) {\n  char character = 'a';\n  int offset=4;\n  \n  int originalAlphabetPosition = character - 'a';\n  int newAlphabetPosition = (originalAlphabetPosition + offset);\n  char newCharacter = (char) ('a' + newAlphabetPosition);\n  System.out.println(newCharacter);\n\n }\n}"
  },
  {
    "title": "project-2d",
    "code": "class Main {\n public static void main(String[] args) {\n  char character = 'h';\n  int offset=4;\n  \n  int originalAlphabetPosition = character - 'a';\n  int newAlphabetPosition = (originalAlphabetPosition + offset) % 26;\n  char newCharacter = (char) ('a' + newAlphabetPosition);\n  System.out.println(newCharacter);\n\n }\n}"
  },
  {
    "title": "project-2d",
    "code": "import java.util.*;\n\nclass Main {\n public static void main(String[] args) {\n   \n  System.out.print(\"Enter a Character : \");  \n  Scanner sc = new Scanner(System.in);\n  char character = sc.nextLine().charAt(0);\n  int offset=4;\n  \n  int originalAlphabetPosition = character - 'a';\n  int newAlphabetPosition = (originalAlphabetPosition + offset) % 26;\n  char newCharacter = (char) ('a' + newAlphabetPosition);\n  System.out.println(newCharacter);\n\n }\n}"
  },
  {
    "title": "pool-arraylist",
    "code": "import java.util.ArrayList;\n\nclass Main {\n    public static void main(String[] args) {\n        ArrayList<String> names = new ArrayList<>();\n        names.add(\"Ada\");\n        names.add(\"Lin\");\n        System.out.println(names.size());\n        System.out.println(names.get(0));\n        names.remove(\"Lin\");\n        System.out.println(names.contains(\"Ada\"));\n    }\n}"
  },
  {
    "title": "pool-hashmap",
    "code": "import java.util.HashMap;\n\nclass Main {\n    public static void main(String[] args) {\n        HashMap<String, Integer> age = new HashMap<>();\n        age.put(\"Ada\", 36);\n        age.put(\"Lin\", 19);\n        System.out.println(age.get(\"Ada\"));\n        System.out.println(age.getOrDefault(\"nope\", 0));\n        System.out.println(age.containsKey(\"Lin\"));\n        for (String key : age.keySet()) {\n            System.out.println(key);\n        }\n    }\n}"
  },
  {
    "title": "pool-hashset",
    "code": "import java.util.HashSet;\n\nclass Main {\n    public static void main(String[] args) {\n        HashSet<Integer> seen = new HashSet<>();\n        seen.add(3);\n        seen.add(3);\n        seen.add(1);\n        System.out.println(seen.size());\n        System.out.println(seen.contains(1));\n    }\n}"
  },
  {
    "title": "pool-math",
    "code": "class Main {\n    public static void main(String[] args) {\n        System.out.println(Math.abs(-4));\n        System.out.println(Math.sqrt(9));\n        System.out.println(Math.pow(2, 3));\n        System.out.println(Math.max(3, 7));\n        System.out.println(Math.min(3, 7));\n    }\n}"
  },
  {
    "title": "pool-string",
    "code": "class Main {\n    public static void main(String[] args) {\n        String s = \"Hello\";\n        System.out.println(s.length());\n        System.out.println(s.charAt(0));\n        System.out.println(s.substring(1, 4));\n        System.out.println(s.toLowerCase());\n        System.out.println(s.indexOf(\"ll\"));\n        System.out.println(s.startsWith(\"He\"));\n    }\n}"
  },
  {
    "title": "pool-integer",
    "code": "class Main {\n    public static void main(String[] args) {\n        int n = Integer.parseInt(\"42\");\n        String text = Integer.toString(n);\n        System.out.println(n);\n        System.out.println(text);\n    }\n}"
  },
  {
    "title": "pool-collections",
    "code": "import java.util.ArrayList;\nimport java.util.Collections;\n\nclass Main {\n    public static void main(String[] args) {\n        ArrayList<Integer> xs = new ArrayList<>();\n        xs.add(3);\n        xs.add(1);\n        xs.add(2);\n        Collections.sort(xs);\n        Collections.reverse(xs);\n        System.out.println(xs.get(0));\n    }\n}"
  },
  {
    "title": "pool-stringbuilder",
    "code": "class Main {\n    public static void main(String[] args) {\n        StringBuilder sb = new StringBuilder();\n        sb.append(\"a\");\n        sb.append(1);\n        System.out.println(sb.toString());\n        System.out.println(sb.length());\n    }\n}"
  },
  {
    "title": "pool-scanner",
    "code": "import java.util.Scanner;\n\nclass Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(\"7 hello\");\n        int n = sc.nextInt();\n        String word = sc.next();\n        System.out.println(n);\n        System.out.println(word);\n    }\n}"
  },
  {
    "title": "pool-arrays",
    "code": "import java.util.Arrays;\nimport java.util.List;\n\nclass Main {\n    public static void main(String[] args) {\n        int[] xs = {3, 1, 2};\n        Arrays.sort(xs);\n        System.out.println(Arrays.toString(xs));\n        List<String> names = Arrays.asList(\"a\", \"b\");\n        System.out.println(names.size());\n    }\n}"
  },

  {
    "title": "pool-queue",
    "code": "import java.util.ArrayDeque;\nimport java.util.Queue;\n\nclass Main {\n    public static void main(String[] args) {\n        Queue<String> q = new ArrayDeque<>();\n        q.offer(\"a\");\n        q.offer(\"b\");\n        System.out.println(q.peek());\n        System.out.println(q.poll());\n        System.out.println(q.peek());\n    }\n}"
  },
  {
    "title": "pool-priority",
    "code": "import java.util.PriorityQueue;\n\nclass Main {\n    public static void main(String[] args) {\n        PriorityQueue<Integer> heap = new PriorityQueue<>();\n        heap.offer(3);\n        heap.offer(1);\n        heap.offer(9);\n        System.out.println(heap.peek());\n        System.out.println(heap.poll());\n        System.out.println(heap.peek());\n    }\n}"
  },
  {
    "title": "pool-treemap",
    "code": "import java.util.Map;\nimport java.util.TreeMap;\n\nclass Main {\n    public static void main(String[] args) {\n        TreeMap<String, Integer> age = new TreeMap<>();\n        age.put(\"lin\", 19);\n        age.put(\"ada\", 36);\n        for (Map.Entry<String, Integer> e : age.entrySet()) {\n            System.out.println(e.getKey());\n            System.out.println(e.getValue());\n        }\n    }\n}"
  },
  {
    "title": "pool-treeset",
    "code": "import java.util.TreeSet;\n\nclass Main {\n    public static void main(String[] args) {\n        TreeSet<Integer> xs = new TreeSet<>();\n        xs.add(3);\n        xs.add(1);\n        xs.add(3);\n        System.out.println(xs.size());\n        System.out.println(xs.first());\n        System.out.println(xs.last());\n    }\n}"
  },
  {
    "title": "pool-optional",
    "code": "import java.util.Optional;\n\nclass Main {\n    public static void main(String[] args) {\n        Optional<String> name = Optional.of(\"Ada\");\n        Optional<String> missing = Optional.ofNullable(null);\n        System.out.println(name.isPresent());\n        System.out.println(name.orElse(\"none\"));\n        System.out.println(missing.orElse(\"none\"));\n    }\n}"
  },
  {
    "title": "pool-string-more",
    "code": "class Main {\n    public static void main(String[] args) {\n        String s = \"  Hello  \";\n        String t = s.trim();\n        System.out.println(t.replace(\"l\", \"L\"));\n        System.out.println(t.toLowerCase());\n        String[] parts = \"a,b,c\".split(\",\");\n        System.out.println(parts.length);\n        System.out.println(t.endsWith(\"lo\"));\n    }\n}"
  },
  {
    "title": "pool-bigdecimal",
    "code": "import java.math.BigDecimal;\nimport java.math.RoundingMode;\n\nclass Main {\n    public static void main(String[] args) {\n        BigDecimal price = new BigDecimal(\"1.239\");\n        BigDecimal rounded = price.setScale(2, RoundingMode.HALF_UP);\n        System.out.println(rounded);\n    }\n}"
  },
  {
    "title": "pool-random",
    "code": "import java.util.Random;\n\nclass Main {\n    public static void main(String[] args) {\n        Random rng = new Random(1);\n        int n = rng.nextInt(10);\n        System.out.println(n);\n        System.out.println(Math.abs(-3));\n    }\n}"
  },
  {
    "title": "pool-arrays-more",
    "code": "import java.util.Arrays;\n\nclass Main {\n    public static void main(String[] args) {\n        int[] xs = {1, 3, 5, 7};\n        int i = Arrays.binarySearch(xs, 5);\n        int[] copy = Arrays.copyOf(xs, 6);\n        Arrays.fill(copy, 4, 6, 0);\n        System.out.println(i);\n        System.out.println(Arrays.toString(copy));\n    }\n}"
  }
];
