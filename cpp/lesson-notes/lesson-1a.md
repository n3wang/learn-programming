---
sidebar_position: 2
title: Chapter 1a - Variables & Printing
---

## Your First C++ Program

Every C++ program needs two things: the `iostream` header (for input/output) and a `main()` function.

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
```

| Part | What it does |
|---|---|
| `#include <iostream>` | Loads the input/output library |
| `using namespace std;` | Lets you write `cout` instead of `std::cout` |
| `int main()` | Entry point — where the program starts |
| `cout <<` | Prints to the screen |
| `endl` | Ends the line (like pressing Enter) |
| `return 0;` | Tells the OS the program finished successfully |

<details>
<summary>🧪 Try it yourself</summary>

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    cout << "My name is C++!" << endl;
    return 0;
}
```

**Challenge:** Change the messages to print your own name and a fun fact about yourself.

</details>

---

## Variables and Data Types

A variable stores a value in memory. In C++ you must declare the **type** of data before using a variable.

```cpp
int age = 17;
double price = 9.99;
string name = "Alice";
bool isStudent = true;
char grade = 'A';
```

<!-- IMAGE PLACEHOLDER: Table or visual showing each C++ data type (int, double, string, bool, char) with an example value and a description of what kind of data it holds -->

### Common Data Types

| Type | What it stores | Example |
|---|---|---|
| `int` | Whole numbers | `42`, `-5`, `0` |
| `double` | Decimal numbers | `3.14`, `-0.5` |
| `string` | Text (requires `<string>` or `<iostream>`) | `"Hello"` |
| `bool` | True or false | `true`, `false` |
| `char` | A single character | `'A'`, `'9'` |

<details>
<summary>🧪 Variables in action</summary>

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    int age = 17;
    double gpa = 3.85;
    string name = "Alice";
    bool isStudent = true;

    cout << "Name: " << name << endl;
    cout << "Age: " << age << endl;
    cout << "GPA: " << gpa << endl;
    cout << "Student: " << isStudent << endl;

    return 0;
}
```

</details>

---

## Printing with `cout`

Use `<<` to chain multiple values in one `cout` statement.

```cpp
string name = "Alice";
int age = 17;

cout << "My name is " << name << " and I am " << age << " years old." << endl;
```

```
My name is Alice and I am 17 years old.
```

You can also use `"\n"` instead of `endl` — it is faster for large outputs.

```cpp
cout << "Line 1\n";
cout << "Line 2\n";
```

---

## Arithmetic Operators

```cpp
int a = 10;
int b = 3;

cout << a + b << endl;   // 13  — addition
cout << a - b << endl;   // 7   — subtraction
cout << a * b << endl;   // 30  — multiplication
cout << a / b << endl;   // 3   — integer division (truncates)
cout << a % b << endl;   // 1   — modulo (remainder)
```

:::note Integer Division
`10 / 3` in C++ gives `3`, not `3.33...` because both operands are `int`. Use `double` if you need decimals:
```cpp
double result = 10.0 / 3;   // 3.333...
```
:::

<details>
<summary>🧪 Arithmetic practice</summary>

```cpp
#include <iostream>
using namespace std;

int main() {
    int apples = 24;
    int friends = 5;

    int each = apples / friends;
    int leftover = apples % friends;

    cout << "Each friend gets " << each << " apples." << endl;
    cout << "There are " << leftover << " apples left over." << endl;

    return 0;
}
```

</details>

---

## User Input with `cin`

`cin >>` reads input from the keyboard and stores it in a variable.

```cpp
#include <iostream>
using namespace std;

int main() {
    int age;
    cout << "Enter your age: ";
    cin >> age;
    cout << "You are " << age << " years old." << endl;
    return 0;
}
```

:::note Reading strings with spaces
`cin >>` stops at a space. Use `getline(cin, variable)` to read a full line:
```cpp
string fullName;
cout << "Enter your full name: ";
getline(cin, fullName);
cout << "Hello, " << fullName << "!" << endl;
```
:::

<details>
<summary>🧪 Input example</summary>

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int birthYear;
    int currentYear = 2025;

    cout << "What is your name? ";
    getline(cin, name);

    cout << "What year were you born? ";
    cin >> birthYear;

    int age = currentYear - birthYear;
    cout << "Hello, " << name << "! You are approximately " << age << " years old." << endl;

    return 0;
}
```

</details>

---

## Exercises

:::tip Activity: Temperature Converter
Write a C++ program that asks the user for a temperature in Celsius and prints the Fahrenheit equivalent.

Formula: `F = (C × 9/5) + 32`

Expected output:
```
Enter temperature in Celsius: 100
100 Celsius = 212 Fahrenheit
```

<details>
<summary>💡 Hint</summary>

Use `double` for the temperature variables so you get decimal precision. Read the Celsius value with `cin`, compute the formula, then print with `cout`.

</details>

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
using namespace std;

int main() {
    double celsius;
    cout << "Enter temperature in Celsius: ";
    cin >> celsius;

    double fahrenheit = (celsius * 9.0 / 5.0) + 32;
    cout << celsius << " Celsius = " << fahrenheit << " Fahrenheit" << endl;

    return 0;
}
```

</details>
:::

:::tip Activity: Area Calculator
Write a program that reads the length and width of a rectangle from the user and prints the area and perimeter.

Expected output:
```
Enter length: 5
Enter width: 3
Area: 15
Perimeter: 16
```

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
using namespace std;

int main() {
    double length, width;

    cout << "Enter length: ";
    cin >> length;

    cout << "Enter width: ";
    cin >> width;

    cout << "Area: " << length * width << endl;
    cout << "Perimeter: " << 2 * (length + width) << endl;

    return 0;
}
```

</details>
:::
