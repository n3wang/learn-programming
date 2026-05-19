---
sidebar_position: 9
title: Chapter 6a - Templates & the STL
---

## Why Templates?

Without templates, you'd need a separate `max` function for every type:

```cpp
int    maxInt(int a,    int b)    { return a > b ? a : b; }
double maxDouble(double a, double b) { return a > b ? a : b; }
string maxString(string a, string b) { return a > b ? a : b; }
```

**Templates** let you write the logic once and let the compiler generate the right version for any type.

---

## Function Templates

```cpp
template <typename T>
T maxOf(T a, T b) {
    return a > b ? a : b;
}

int main() {
    cout << maxOf(3, 7)           << endl;  // 7      (int)
    cout << maxOf(3.14, 2.71)     << endl;  // 3.14   (double)
    cout << maxOf('z', 'a')       << endl;  // z      (char)
    cout << maxOf(string("cat"), string("dog")) << endl;  // dog
}
```

The compiler generates a separate `maxOf<int>`, `maxOf<double>`, etc. at compile time — zero runtime overhead.

### Multiple Type Parameters

```cpp
template <typename T, typename U>
void printPair(T first, U second) {
    cout << "(" << first << ", " << second << ")" << endl;
}

int main() {
    printPair(1, "hello");      // (1, hello)
    printPair(3.14, true);      // (3.14, 1)
}
```

<!-- IMAGE PLACEHOLDER: Diagram showing one function template source box on the left, with three arrows pointing right to three generated concrete functions: maxOf<int>, maxOf<double>, maxOf<string>. Label the arrows "compiler instantiation" -->

---

## Class Templates

You can template entire classes. This is how `std::vector<T>`, `std::stack<T>`, and `std::pair<T,U>` work internally.

```cpp
template <typename T>
class Box {
private:
    T value;
public:
    Box(T v) : value(v) {}

    T get() const         { return value; }
    void set(T v)         { value = v; }

    void print() const {
        cout << "Box contains: " << value << endl;
    }
};

int main() {
    Box<int>    intBox(42);
    Box<string> strBox("hello");
    Box<double> dblBox(3.14);

    intBox.print();
    strBox.print();
    dblBox.print();

    intBox.set(100);
    cout << intBox.get() << endl;
}
```

### Template Stack (Generic)

```cpp
template <typename T>
class Stack {
    vector<T> data;
public:
    void push(T val)    { data.push_back(val); }
    void pop()          { data.pop_back(); }
    T    top()  const   { return data.back(); }
    bool empty() const  { return data.empty(); }
    int  size()  const  { return data.size(); }
};

int main() {
    Stack<int>    si;
    Stack<string> ss;

    si.push(1); si.push(2); si.push(3);
    while (!si.empty()) { cout << si.top() << " "; si.pop(); }
    cout << endl;  // 3 2 1

    ss.push("a"); ss.push("b"); ss.push("c");
    while (!ss.empty()) { cout << ss.top() << " "; ss.pop(); }
    cout << endl;  // c b a
}
```

<details>
<summary>🧪 Template Pair</summary>

```cpp
#include <iostream>
#include <string>
using namespace std;

template <typename A, typename B>
class Pair {
public:
    A first;
    B second;
    Pair(A a, B b) : first(a), second(b) {}

    void swap() {
        // only works if both types are the same — see static_assert for constraints
        A tmp = first;
        // This would fail if A != B; shown for illustration
    }

    void print() {
        cout << "(" << first << ", " << second << ")" << endl;
    }
};

int main() {
    Pair<string, int> p("Alice", 95);
    p.print();  // (Alice, 95)

    Pair<double, double> coords(48.8566, 2.3522);
    coords.print();  // (48.8566, 2.3522)
}
```

</details>

---

## Template Specialization

You can provide a custom implementation for a specific type while keeping the generic version for everything else.

```cpp
template <typename T>
void describe(T val) {
    cout << "Value: " << val << endl;
}

// Specialization for bool
template <>
void describe<bool>(bool val) {
    cout << "Boolean: " << (val ? "true" : "false") << endl;
}

int main() {
    describe(42);        // Value: 42
    describe(3.14);      // Value: 3.14
    describe(true);      // Boolean: true
}
```

---

## The Standard Template Library (STL)

The STL provides ready-made containers, algorithms, and iterators. Everything works generically through templates.

### STL Containers Overview

| Container | Header | Ordered? | Unique keys? | Access |
|---|---|---|---|---|
| `vector<T>` | `<vector>` | Insertion order | — | O(1) index |
| `list<T>` | `<list>` | Insertion order | — | O(1) insert |
| `deque<T>` | `<deque>` | Insertion order | — | O(1) front+back |
| `stack<T>` | `<stack>` | LIFO | — | O(1) top |
| `queue<T>` | `<queue>` | FIFO | — | O(1) front |
| `priority_queue<T>` | `<queue>` | Max-heap | — | O(log n) |
| `set<T>` | `<set>` | Sorted | Yes | O(log n) |
| `unordered_set<T>` | `<unordered_set>` | No | Yes | O(1) avg |
| `map<K,V>` | `<map>` | Sorted by key | Yes | O(log n) |
| `unordered_map<K,V>` | `<unordered_map>` | No | Yes | O(1) avg |

---

## Iterators

An **iterator** is a generalization of a pointer — it points to an element in a container and can be advanced.

```cpp
vector<int> v = {10, 20, 30, 40, 50};

// begin() points to first, end() points one past last
for (auto it = v.begin(); it != v.end(); ++it) {
    cout << *it << " ";
}

// Reverse iterators
for (auto it = v.rbegin(); it != v.rend(); ++it) {
    cout << *it << " ";
}
// Output: 50 40 30 20 10
```

Iterators unify the interface across all containers — the same algorithm works on `vector`, `list`, `set`, etc.

<!-- IMAGE PLACEHOLDER: A vector of 5 elements with iterator arrows: begin() pointing to element 0, end() pointing one position after element 4. A cursor arrow moves right through each element step by step -->

---

## STL Algorithms (`<algorithm>`)

STL algorithms work on any container through iterators.

```cpp
#include <algorithm>
#include <vector>
#include <numeric>
using namespace std;

vector<int> v = {5, 3, 8, 1, 9, 2, 7};

sort(v.begin(), v.end());                   // sort ascending
sort(v.begin(), v.end(), greater<int>());   // sort descending

reverse(v.begin(), v.end());

int s = accumulate(v.begin(), v.end(), 0);  // sum all elements

auto pos = find(v.begin(), v.end(), 8);     // linear search
bool found = binary_search(v.begin(), v.end(), 8);  // requires sorted

int cnt = count(v.begin(), v.end(), 5);     // count occurrences

auto it = max_element(v.begin(), v.end());  // iterator to max
auto it2 = min_element(v.begin(), v.end());

fill(v.begin(), v.end(), 0);               // set all to 0
```

### Lambda Functions with Algorithms

A **lambda** is an anonymous function written inline. Commonly used with STL algorithms.

```cpp
vector<int> v = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// count even numbers
int evens = count_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
cout << evens << endl;  // 5

// sort by absolute distance from 5
sort(v.begin(), v.end(), [](int a, int b) {
    return abs(a - 5) < abs(b - 5);
});

// print only elements > 6
for_each(v.begin(), v.end(), [](int x) {
    if (x > 6) cout << x << " ";
});
```

Lambda syntax: `[capture](parameters) { body }`

| Capture | Meaning |
|---|---|
| `[]` | No captures |
| `[x]` | Capture `x` by value |
| `[&x]` | Capture `x` by reference |
| `[=]` | Capture all locals by value |
| `[&]` | Capture all locals by reference |

<details>
<summary>🧪 Full algorithm example</summary>

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    vector<int> grades = {72, 88, 95, 60, 79, 91, 84, 55};

    double avg = accumulate(grades.begin(), grades.end(), 0.0) / grades.size();
    cout << "Average: " << avg << endl;

    int passing = count_if(grades.begin(), grades.end(),
                           [](int g) { return g >= 70; });
    cout << "Passing: " << passing << "/" << grades.size() << endl;

    sort(grades.begin(), grades.end(), greater<int>());
    cout << "Top grade: " << grades.front() << endl;
    cout << "Low grade: " << grades.back()  << endl;

    return 0;
}
```

</details>

---

## `priority_queue` — Heap

A `priority_queue` always gives you the largest (or smallest) element in O(log n).

```cpp
#include <queue>

priority_queue<int> maxHeap;
maxHeap.push(3);
maxHeap.push(1);
maxHeap.push(9);
maxHeap.push(5);

while (!maxHeap.empty()) {
    cout << maxHeap.top() << " ";  // 9 5 3 1
    maxHeap.pop();
}

// Min-heap: negate values, or use:
priority_queue<int, vector<int>, greater<int>> minHeap;
minHeap.push(3); minHeap.push(1); minHeap.push(9);
cout << minHeap.top() << endl;  // 1
```

### Application: Top K Elements

```cpp
vector<int> data = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};
int k = 3;

priority_queue<int, vector<int>, greater<int>> minHeap;
for (int x : data) {
    minHeap.push(x);
    if (minHeap.size() > k) minHeap.pop();
}

cout << "Top " << k << " elements: ";
while (!minHeap.empty()) {
    cout << minHeap.top() << " ";
    minHeap.pop();
}
// Output: Top 3 elements: 5 6 9
```

---

## Exercises

:::tip Activity: Generic `min` and `clamp`
Write a template function `myMin(a, b)` and `clamp(val, lo, hi)` that works for any comparable type. Test with `int`, `double`, and `char`.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
using namespace std;

template <typename T>
T myMin(T a, T b) {
    return a < b ? a : b;
}

template <typename T>
T clamp(T val, T lo, T hi) {
    if (val < lo) return lo;
    if (val > hi) return hi;
    return val;
}

int main() {
    cout << myMin(3, 7)         << endl;  // 3
    cout << myMin(3.14, 2.71)   << endl;  // 2.71
    cout << myMin('z', 'a')     << endl;  // a

    cout << clamp(15, 0, 10)    << endl;  // 10
    cout << clamp(-5, 0, 10)    << endl;  // 0
    cout << clamp(5, 0, 10)     << endl;  // 5
}
```

</details>
:::

:::tip Activity: Word Frequency with `map`
Read a sentence from the user, count word frequencies using `map<string, int>` (sorted), and print the results sorted alphabetically.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
#include <map>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string line;
    cout << "Enter a sentence: ";
    getline(cin, line);

    map<string, int> freq;
    istringstream ss(line);
    string word;
    while (ss >> word) {
        // simple lowercase normalization
        for (char& c : word) c = tolower(c);
        freq[word]++;
    }

    for (auto& p : freq) {
        cout << p.first << ": " << p.second << endl;
    }
}
```

</details>
:::

:::tip Activity: Sort Students by GPA
Use `sort` with a lambda to sort a vector of `Student` objects (from Ch.4a) by GPA descending, then print the ranked list.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

struct Student {
    string name;
    double gpa;
};

int main() {
    vector<Student> students = {
        {"Alice", 3.8},
        {"Bob",   3.2},
        {"Carol", 3.9},
        {"Dave",  3.5},
    };

    sort(students.begin(), students.end(),
         [](const Student& a, const Student& b) {
             return a.gpa > b.gpa;   // descending
         });

    int rank = 1;
    for (auto& s : students) {
        cout << rank++ << ". " << s.name << " — " << s.gpa << endl;
    }
}
```

</details>
:::
