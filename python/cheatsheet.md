---
sidebar_position: 4
title: Cheatsheet
---

Hello Everyone for this class, I will focus in teaching the concepts, so you don't need to memorize anything| 

I will be creating a cheatlist with the commands and comment what they do below while we go through the course|

## Programming Terms

### Chapter 1

| Term                     | Definition                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Syntax                   | The spelling and grammar of a programming language (similar to the rules for using words, phrases, clauses and punctuation used to form sentences in English). Computers are inflexible machines that understand what you type only if you follow the rules that specify the correct combined sequence of symbols to form a correctly structured program that the computer expects. This expected form is called the syntax. |
| Comments and Readability | Line(s) of text or code that are NOT read by the computer, and rather read by you and other programmers. This improves the readability of the code. that is, it makes it easy to understand the use of the code when we get back to it at a later time.                                                                                                                                                                      |
| String                   | Text type data that is represented using single quotes or double quotes.                                                                                                                                                                                                                                                                                                                                                     |
| Number                   | Number type of data that can be understood by Python includes integers, floating point numbers.                                                                                                                                                                                                                                                                                                                              |
| IDE                      | Short for Integrated Development Environment. It is a software where all the required components needed to write and run code is available in one place.                                                                                                                                                                                                                                                                     |
| Execute                  | To run a program such that the instructions given by us are carried out to display the output.                                                                                                                                                                                                                                                                                                                               |
| Test & Debug             | Identify and remove errors from computer hardware or software.                                                                                                                                                                                                                                                                                                                                                               |
| Escape Character         | Backslash \ is a character which invokes an alternative interpretation of subsequent characters.                                                                                                                                                                                                                                                                                                                             |
| Escape Sequences         | A sequence of characters that doesn't represent itself when used inside a string. It is composed of two or more characters starting with backslash \                                                                                                                                                                                                                                                                         |
| Decompose                | Break down a problem in sequence.                                                                                                                                                                                                                                                                                                                                                                                            |
| Embed                    | To place (a piece of software) inside a virtual space. Embedded code can run by themselves, without a need for an external program.                                                                                                                                                                                                                                                                                          |

### Chapter 2

| Term             | Definition                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Variable         | A label that points to a varying quantity. We can manipulate the data referenced by the label using Python code.                                                                      |
| Statement        | A line of code that can be executed by Python.                                                                                                                                        |
| Operator         | A operator is represented by a symbol or short text and performs a specific function and provides a result. An operator requires operands, which are the values that it acts upon. Ex | In the expression 5 + 4, 5 and 4 are the operands and + is the operator. |
| Builtin function | Pre defined blocks of code that perform a specific function. Example - print(), min(), max().                                                                                         |
| Concatenation    | Joining two strings together.                                                                                                                                                         |
| Reusability      | Quality of the code that allows it to be reused.                                                                                                                                      |
| Sequencing       | Arranging instructions in a specific order so that the expected result is observed when the instructions are processed.                                                               |


### Chapter 3

[👀](https://learn2codelive.com/courses/4/pages/lesson-3-essential-vocabulary?module_item_id=690)

| Term                  | Definition                                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| User input            | A feature in programming languages that allows users to provide the inputs for a program.                                                |
| Prompt                | A symbol or some text from a program indicating that it is waiting for an input from the user.                                           |
| Example               | input(“Enter your name “) - In this line of code, “Enter your name” is the prompt.                                                       |
| Test                  | The process of finding how well your code works by providing different inputs to the program.                                            |
| Reusability           | Quality of the code that allows it to be reused.                                                                                         |
| Syntax error          | An error in a program that has been caused due to incorrect language or grammar rules.                                                   |
| Syntax Error example  | Print(“Good morning!”) - In this line of code, alphabet p in print() has been capitalized, resulting in a syntax error.                  |
| Logical error         | An error that causes the program to behave in a different manner as opposed to what was expected.                                        |
| Logical error example | print(“34 + 66”) would result in 34 + 66 being printed. If the intention is to print the sum of 34 and 66, we need to remove the quotes. |
| Builtin function      | Pre-defined blocks of code that perform a specific function. Example - input(), print(), min(), max().                                   |
| Docstring             | Lines that describe a part of the code or a program, which are enclosed using triple quotes (single or double).                          |


### Chapter 4
Boolean data type: Just like string and number, boolean is a permissible data type in Python. Boolean data type allows only two values - True or False.Ex: a = True. In this statement, the variable a is not a string data type, but a boolean data type. 
Boolean expression:  An expression is a series of values and operations that evaluate to something. Ex: 5 + 6 is an expression. So is 11/3+45. Boolean expressions compare data of any type as long as both data being compared are of the same data type. A boolean expression evaluates to a boolean value of True or False.
Complex Boolean expressions can be created by joining multiple Boolean expressions with the logical operators (and, or, not). Boolean expressions compare data of any type as long as both data being compared are of the same data type.

Comparison operator: Comparison operator compares two different values and returns whether the comparison is True or False. Ex: In the expression, 5 > 3, > (greater than) is the comparison operator that compares 5 and 3. This expression results in True.
The 6 comparison operators are:

== (equal to; example: x == 5)

!= (not equal to; example: x != 5)

> (greater than; example: y > 3)

< (less than; example: x <  5 )

>= (greater than or equal to; example: x >= y) 

&lt;= (less than or equal to; example: x &lt;= y)

Logical operator: Logical operators allow two or more expressions to be combined and evaluated to a single boolean value. There are three logical operators - and, or, not.
and operator returns True only if all the individual expressions combined by and are true. Ex: (5 > 3) and (5 > 4)

or operator returns True if any one of the individual expressions combined by or is true. Ex: (5 > 3) or (5 < 5)

not operator reverses the result of a boolean expression. Ex: not(5 > 3) is not(True) which returns False.

Conditional structure:This is a fundamental building block in coding. Based on whether a condition ( a boolean expression) is true or false, a specific branch of the program is executed, instead of all the statements in the program.
The syntax for a conditional structure is given in this manner:

If (Boolean condition1) Then

    (perform computation or action)

Else if (Boolean condition2) Then

    (perform another computation or action)

Else

    (perform a default computation or action)