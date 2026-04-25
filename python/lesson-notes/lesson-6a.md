---
title: Chapter 6a - For Loops
---

## For Loops


```python
for i in range(10):
  print(i)
```

<iframe src="https://trinket.io/embed/python/8d0d21f9ad" width="100%" height="300" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

:::tip Lab
- Try chan-+ging from `10` to `15`
:::



### More about Range


range(start, stop, steps)

```python
for i in range(2,12,3):
  print("Number "+ str(i))
```

<iframe src="https://trinket.io/embed/python/c988a97c6c" width="100%" height="300" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>


## Exercise: Hello...

:::tip Exercise

- Create a program that prints the following using for loops:
- The program prints Hello \{n\} and the iteration number in \{n\}
- It itarates 5 times
- Note how it starts from 1 instead of `0`


<iframe src="https://trinket.io/embed/python/9f5e513395?outputOnly=true" width="100%" height="300" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

***

Please solve it here:

<iframe src="https://trinket.io/embed/python/25f70a73bb" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

:::


## Placing Napkins

- The following program asks the amount of tables to setup.
- The for each table it:
  - places the plate.
  - the napkin.
  - Tells the the number of the table set.


For example for the first table it would print.
```
Plate placed
Napkin placed
Table has been set for 1
```

<iframe src="https://trinket.io/embed/python/d197c51695" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

:::tip

Modify the program so that It also adds:
- Silverware preparations
- Glass of water preparations
for each table.

So instead of just doing the following for the first table:

```
Plate placed
Napkin placed
Table has been set for 1
```

It should be doing this:

```
Plate placed
Silverware placed
Napkin placed
Glass of water placed
Table has been set for 1
```

***
<iframe src="https://trinket.io/embed/python/03601bf3a2" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>
***
🙋‍♀️ Expected Output

<iframe src="https://trinket.io/embed/python/bc9804cd1f?outputOnly=true" width="100%" height="300" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>

:::

## Example: Spiral 

<iframe src="https://trinket.io/embed/python/175748d924" width="100%" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>



