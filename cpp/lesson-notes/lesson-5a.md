---
sidebar_position: 7
title: Chapter 5a - Pointers & Memory
---

## What Is a Pointer?

A **pointer** is a variable that stores a **memory address** rather than a value directly. Every variable lives at some address in RAM; a pointer lets you hold and manipulate that address.

```cpp
int x = 42;
int* ptr = &x;   // ptr holds the address of x

cout << x    << endl;   // 42        (the value)
cout << &x   << endl;   // 0x7fff... (address of x)
cout << ptr  << endl;   // 0x7fff... (same address, stored in ptr)
cout << *ptr << endl;   // 42        (dereferencing: value at that address)
```

| Operator | Name | Meaning |
|---|---|---|
| `&var` | Address-of | Get the memory address of `var` |
| `*ptr` | Dereference | Get the value stored at the address in `ptr` |

<!-- IMAGE PLACEHOLDER: Memory diagram with two boxes side by side. Left box labeled "x" contains 42 at address 0x100. Right box labeled "ptr" contains "0x100" (the address of x). An arrow from ptr points to x's box -->

---

## Pointer Basics

```cpp
int a = 10;
int* p = &a;

*p = 20;          // change the value of a through the pointer
cout << a << endl; // 20
```

### Pointer Types Must Match

```cpp
int    x = 5;
double y = 3.14;

int*    px = &x;   // OK
double* py = &y;   // OK
// int* pz = &y;   // ERROR: type mismatch
```

### Null Pointer

A pointer that points to "nothing" is initialized to `nullptr` (C++11):

```cpp
int* p = nullptr;

if (p == nullptr) {
    cout << "Pointer is null — safe to check before using." << endl;
}

// *p = 5;  // undefined behavior — never dereference a null pointer!
```

---

## References vs Pointers

A **reference** is an alias for an existing variable. Unlike a pointer it cannot be null, cannot be reassigned, and uses no extra syntax to dereference.

```cpp
int x = 10;

int& ref = x;    // ref is another name for x
ref = 20;
cout << x << endl;  // 20

int* ptr = &x;   // ptr holds x's address
*ptr = 30;
cout << x << endl;  // 30
```

| | Reference | Pointer |
|---|---|---|
| Syntax to access | `ref` | `*ptr` |
| Can be null | No | Yes |
| Can be reassigned | No | Yes |
| Used for | Function parameters, aliases | Dynamic memory, arrays, optional values |

---

## Pointers and Functions

Passing a pointer to a function lets the function modify the original variable (pass-by-pointer). The same effect can be achieved with a reference (pass-by-reference).

```cpp
void doubleIt(int* p) {
    *p = *p * 2;
}

void tripleIt(int& r) {
    r = r * 3;
}

int main() {
    int x = 5;
    doubleIt(&x);
    cout << x << endl;  // 10

    tripleIt(x);
    cout << x << endl;  // 30
}
```

<!-- IMAGE PLACEHOLDER: Two function call diagrams. Left: doubleIt(&x) showing the address of x passed in, the pointer p pointing back to x's memory box, and the value changing. Right: tripleIt(x) showing r directly aliasing x -->

---

## Dynamic Memory — `new` and `delete`

Variables declared normally live on the **stack** and are automatically destroyed when they go out of scope. `new` allocates memory on the **heap** — memory that persists until you explicitly free it with `delete`.

```cpp
int* p = new int(42);   // allocate an int on the heap, initialize to 42
cout << *p << endl;     // 42

*p = 100;
cout << *p << endl;     // 100

delete p;               // free the heap memory
p = nullptr;            // good practice: avoid dangling pointer
```

### Allocating Arrays on the Heap

```cpp
int n = 5;
int* arr = new int[n];   // allocate array of 5 ints

for (int i = 0; i < n; i++) {
    arr[i] = i * i;
}

for (int i = 0; i < n; i++) {
    cout << arr[i] << " ";
}
cout << endl;

delete[] arr;   // use delete[] for arrays (not delete)
arr = nullptr;
```

:::important Memory Leaks
Failing to `delete` heap memory causes a **memory leak** — the program holds onto RAM it no longer needs. In long-running programs this can exhaust available memory.
:::

<!-- IMAGE PLACEHOLDER: Two regions labeled "Stack" and "Heap". Stack shows local variables with automatic lifetimes. Heap shows a box allocated by new with an arrow from a pointer on the stack. A red X appears on the heap box after delete -->

---

## Pointer Arithmetic

Pointers support arithmetic. Adding 1 moves to the next element of the pointed-to type.

```cpp
int arr[] = {10, 20, 30, 40, 50};
int* p = arr;           // points to arr[0]

cout << *p     << endl; // 10
cout << *(p+1) << endl; // 20
cout << *(p+4) << endl; // 50

p++;
cout << *p << endl;     // 20  (p now points to arr[1])
```

`arr[i]` is exactly equivalent to `*(arr + i)` — indexing is pointer arithmetic under the hood.

---

## Pointers to Objects

```cpp
class Point {
public:
    double x, y;
    Point(double x, double y) : x(x), y(y) {}
    void print() { cout << "(" << x << ", " << y << ")" << endl; }
};

int main() {
    Point  p1(1.0, 2.0);
    Point* p2 = new Point(3.0, 4.0);

    p1.print();    // dot operator for stack object
    p2->print();   // arrow operator for pointer-to-object

    delete p2;
}
```

`ptr->member` is shorthand for `(*ptr).member`.

---

## Smart Pointers (C++11)

Raw `new`/`delete` is error-prone. **Smart pointers** from `<memory>` manage heap memory automatically.

### `unique_ptr` — exclusive ownership

```cpp
#include <memory>

unique_ptr<int> p = make_unique<int>(42);
cout << *p << endl;    // 42
// no delete needed — freed automatically when p goes out of scope
```

```cpp
unique_ptr<Point> pt = make_unique<Point>(3.0, 4.0);
pt->print();
```

### `shared_ptr` — shared ownership

```cpp
shared_ptr<int> a = make_shared<int>(10);
shared_ptr<int> b = a;    // both share ownership

cout << *a << endl;   // 10
cout << *b << endl;   // 10
// freed when the last shared_ptr to it is destroyed
```

| Smart pointer | Ownership | Use case |
|---|---|---|
| `unique_ptr` | Single owner | Default choice for heap objects |
| `shared_ptr` | Shared (ref-counted) | Multiple owners needed |
| `weak_ptr` | Non-owning observer | Break circular references |

:::tip Prefer smart pointers
In modern C++, `unique_ptr` replaces almost all manual `new`/`delete`. Use raw pointers only when interfacing with C APIs or when you deliberately need no ownership semantics.
:::

---

## Common Pointer Mistakes

| Mistake | What happens |
|---|---|
| Dereferencing `nullptr` | Crash (segfault) |
| Dangling pointer — using after `delete` | Undefined behavior |
| Double `delete` | Undefined behavior / crash |
| Using `delete` on a stack variable | Undefined behavior |
| Using `delete` instead of `delete[]` on an array | Undefined behavior |

---

## Exercises

:::tip Activity: Swap via Pointers
Write a function `swap(int* a, int* b)` that swaps the values of two integers in-place using pointers. Then write the same with references.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
using namespace std;

void swapPtr(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void swapRef(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 5, y = 10;
    cout << x << " " << y << endl;  // 5 10

    swapPtr(&x, &y);
    cout << x << " " << y << endl;  // 10 5

    swapRef(x, y);
    cout << x << " " << y << endl;  // 5 10
}
```

</details>
:::

:::tip Activity: Dynamic Array
Ask the user for a size `n`, allocate an int array on the heap, fill it with squares (0², 1², …, (n-1)²), print it, then free it.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Size: ";
    cin >> n;

    int* arr = new int[n];

    for (int i = 0; i < n; i++) {
        arr[i] = i * i;
    }

    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;

    delete[] arr;
    arr = nullptr;
}
```

</details>
:::

:::tip Activity: Unique Pointer Class
Rewrite the `Rectangle` class from Ch.4a so that `main` manages instances with `unique_ptr`. Create a vector of `unique_ptr<Rectangle>` and print the largest area.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
#include <memory>
#include <vector>
using namespace std;

class Rectangle {
    double w, h;
public:
    Rectangle(double w, double h) : w(w), h(h) {}
    double area() { return w * h; }
    void print() { cout << w << "x" << h << " area=" << area() << endl; }
};

int main() {
    vector<unique_ptr<Rectangle>> rects;
    rects.push_back(make_unique<Rectangle>(3, 4));
    rects.push_back(make_unique<Rectangle>(10, 2));
    rects.push_back(make_unique<Rectangle>(5, 5));

    double maxArea = 0;
    for (auto& r : rects) {
        r->print();
        if (r->area() > maxArea) maxArea = r->area();
    }
    cout << "Largest area: " << maxArea << endl;
    // unique_ptrs freed automatically
}
```

</details>
:::
