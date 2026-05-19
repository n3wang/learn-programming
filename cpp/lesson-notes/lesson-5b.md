---
sidebar_position: 8
title: Chapter 5b - Data Structures
---

## Why Data Structures?

A **data structure** is a way of organizing data in memory so that operations on it (insert, delete, search) are efficient. Choosing the right one is one of the most important decisions in software engineering.

| Structure | Access | Insert/Delete | Search | Use when |
|---|---|---|---|---|
| Array / `vector` | O(1) | O(n) (middle) | O(n) | Random access, cache-friendly |
| Linked List | O(n) | O(1) (at known node) | O(n) | Frequent insert/delete, unknown size |
| Stack | O(1) top | O(1) | — | LIFO: undo, call stack, DFS |
| Queue | O(1) front | O(1) | — | FIFO: task queue, BFS |
| Map (`unordered_map`) | O(1) avg | O(1) avg | O(1) avg | Key-value lookup |

---

## Arrays (Fixed Size)

C-style arrays have a fixed size set at compile time.

```cpp
int scores[5] = {90, 85, 78, 92, 88};

// Access
cout << scores[2] << endl;   // 78

// Iterate
for (int i = 0; i < 5; i++) {
    cout << scores[i] << " ";
}
```

Arrays decay to pointers when passed to functions — you must pass the size separately.

```cpp
void printArray(int* arr, int size) {
    for (int i = 0; i < size; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
}
```

---

## `vector` — Dynamic Array (STL)

`std::vector` is a resizable array. Prefer it over raw arrays almost always.

```cpp
#include <vector>
using namespace std;

vector<int> nums = {1, 2, 3};

nums.push_back(4);    // append
nums.push_back(5);

cout << nums.size() << endl;   // 5
cout << nums[2]     << endl;   // 3
cout << nums.front()<< endl;   // 1
cout << nums.back() << endl;   // 5

nums.pop_back();               // remove last
nums.erase(nums.begin() + 1);  // remove element at index 1
```

### Iterating a Vector

```cpp
// Index-based
for (int i = 0; i < nums.size(); i++) {
    cout << nums[i] << " ";
}

// Range-based for (prefer this)
for (int n : nums) {
    cout << n << " ";
}

// With iterator
for (auto it = nums.begin(); it != nums.end(); ++it) {
    cout << *it << " ";
}
```

<!-- IMAGE PLACEHOLDER: Memory diagram of a vector showing contiguous elements like an array, with a "size" and "capacity" label. An arrow shows push_back expanding the allocated memory when capacity is exceeded -->

<details>
<summary>🧪 Vector operations</summary>

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {5, 2, 8, 1, 9, 3};

    sort(v.begin(), v.end());            // sort ascending
    reverse(v.begin(), v.end());         // reverse (now descending)

    auto it = find(v.begin(), v.end(), 8);  // search
    if (it != v.end()) {
        cout << "Found 8 at index " << (it - v.begin()) << endl;
    }

    cout << "Max: " << *max_element(v.begin(), v.end()) << endl;
    cout << "Min: " << *min_element(v.begin(), v.end()) << endl;

    return 0;
}
```

</details>

---

## Linked List (Manual Implementation)

A **linked list** is a chain of nodes, each holding data and a pointer to the next node. Unlike arrays, nodes are scattered in memory — no random access, but inserting/deleting at a known position is O(1).

```cpp
struct Node {
    int data;
    Node* next;

    Node(int val) : data(val), next(nullptr) {}
};
```

<!-- IMAGE PLACEHOLDER: Diagram showing 4 linked list nodes in boxes with data values (10→20→30→40), each node's next pointer shown as an arrow to the next node. The last node's next points to "nullptr" -->

### Singly Linked List Class

```cpp
class LinkedList {
private:
    Node* head;

public:
    LinkedList() : head(nullptr) {}

    void pushFront(int val) {
        Node* newNode = new Node(val);
        newNode->next = head;
        head = newNode;
    }

    void pushBack(int val) {
        Node* newNode = new Node(val);
        if (!head) { head = newNode; return; }
        Node* curr = head;
        while (curr->next) curr = curr->next;
        curr->next = newNode;
    }

    void popFront() {
        if (!head) return;
        Node* temp = head;
        head = head->next;
        delete temp;
    }

    void print() {
        Node* curr = head;
        while (curr) {
            cout << curr->data;
            if (curr->next) cout << " -> ";
            curr = curr->next;
        }
        cout << endl;
    }

    ~LinkedList() {
        while (head) popFront();
    }
};

int main() {
    LinkedList list;
    list.pushBack(10);
    list.pushBack(20);
    list.pushBack(30);
    list.pushFront(5);
    list.print();      // 5 -> 10 -> 20 -> 30
    list.popFront();
    list.print();      // 10 -> 20 -> 30
}
```

---

## Stack

A **stack** is LIFO (Last In, First Out) — like a stack of plates. Use `std::stack` from `<stack>`.

```cpp
#include <stack>

stack<int> s;

s.push(1);
s.push(2);
s.push(3);

cout << s.top() << endl;   // 3 (peek without removing)
s.pop();
cout << s.top() << endl;   // 2

cout << s.size()  << endl; // 2
cout << s.empty() << endl; // 0 (false)
```

<!-- IMAGE PLACEHOLDER: Stack diagram showing elements stacked vertically. push() adds to the top, pop() removes from the top. An arrow on the top labeled "top()" shows where access happens -->

### Application: Balanced Parentheses

```cpp
#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isBalanced(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{')) return false;
        }
    }
    return st.empty();
}

int main() {
    cout << isBalanced("({[]})") << endl;  // 1 (true)
    cout << isBalanced("([)]")   << endl;  // 0 (false)
    cout << isBalanced("{")      << endl;  // 0 (false)
}
```

---

## Queue

A **queue** is FIFO (First In, First Out) — like a line of people. Use `std::queue` from `<queue>`.

```cpp
#include <queue>

queue<string> q;

q.push("Alice");
q.push("Bob");
q.push("Carol");

cout << q.front() << endl;  // Alice
q.pop();
cout << q.front() << endl;  // Bob

cout << q.size() << endl;   // 2
```

<!-- IMAGE PLACEHOLDER: Queue diagram showing elements in a horizontal line. push() adds to the back (right), pop() removes from the front (left). Labels "front" and "back" on each end -->

### Application: Print Queue Simulation

```cpp
#include <iostream>
#include <queue>
#include <string>
using namespace std;

int main() {
    queue<string> printQueue;
    printQueue.push("report.pdf");
    printQueue.push("photo.jpg");
    printQueue.push("notes.txt");

    int jobNum = 1;
    while (!printQueue.empty()) {
        cout << "Printing job " << jobNum++ << ": " << printQueue.front() << endl;
        printQueue.pop();
    }
}
```

---

## Map (Hash Map / Dictionary)

`std::unordered_map` stores key-value pairs with O(1) average access.

```cpp
#include <unordered_map>

unordered_map<string, int> ages;

// Insert
ages["Alice"] = 22;
ages["Bob"]   = 19;
ages["Carol"] = 25;

// Access
cout << ages["Alice"] << endl;  // 22

// Check existence
if (ages.count("Bob")) {
    cout << "Bob is " << ages["Bob"] << endl;
}

// Iterate
for (auto& pair : ages) {
    cout << pair.first << ": " << pair.second << endl;
}

// Erase
ages.erase("Bob");
cout << ages.size() << endl;  // 2
```

### Word Frequency Counter

```cpp
#include <iostream>
#include <unordered_map>
#include <sstream>
#include <string>
using namespace std;

int main() {
    string text = "the cat sat on the mat the cat";
    unordered_map<string, int> freq;

    istringstream ss(text);
    string word;
    while (ss >> word) {
        freq[word]++;
    }

    for (auto& p : freq) {
        cout << p.first << ": " << p.second << endl;
    }
}
```

---

## `set` — Unique Sorted Elements

```cpp
#include <set>

set<int> s = {3, 1, 4, 1, 5, 9, 2, 6, 5};
// Duplicates are ignored; elements are always sorted

for (int x : s) cout << x << " ";
// Output: 1 2 3 4 5 6 9

s.insert(7);
s.erase(3);
cout << s.count(5) << endl;  // 1 (exists)
cout << s.count(3) << endl;  // 0 (erased)
```

---

## Choosing a Container

```
Do you need key-value pairs?
  YES → unordered_map (fast) or map (sorted)
  NO  →
    Do you need unique elements?
      YES → unordered_set or set
      NO  →
        Do you need LIFO?  → stack
        Do you need FIFO?  → queue
        Otherwise          → vector (default choice)
```

---

## Exercises

:::tip Activity: Implement a Stack with a Linked List
Without using `std::stack`, implement a `Stack<int>` class backed by a linked list with `push`, `pop`, `top`, and `isEmpty` methods.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int v) : data(v), next(nullptr) {}
};

class Stack {
    Node* head;
public:
    Stack() : head(nullptr) {}

    void push(int v) {
        Node* n = new Node(v);
        n->next = head;
        head = n;
    }

    void pop() {
        if (!head) return;
        Node* tmp = head;
        head = head->next;
        delete tmp;
    }

    int top() { return head->data; }
    bool isEmpty() { return head == nullptr; }

    ~Stack() { while (!isEmpty()) pop(); }
};

int main() {
    Stack s;
    s.push(10); s.push(20); s.push(30);
    while (!s.isEmpty()) {
        cout << s.top() << endl;
        s.pop();
    }
}
```

</details>
:::

:::tip Activity: Two Sum (Map)
Given a vector of integers and a target sum, find and print all pairs that add up to the target. Use an `unordered_map` for O(n) time.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

void twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;  // value → index
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.count(complement)) {
            cout << nums[seen[complement]] << " + " << nums[i]
                 << " = " << target << endl;
        }
        seen[nums[i]] = i;
    }
}

int main() {
    vector<int> v = {2, 7, 11, 15, 1, 8};
    twoSum(v, 9);
    // Output: 2 + 7 = 9,  1 + 8 = 9
}
```

</details>
:::

:::tip Activity: Queue Simulation — Ticket Counter
Simulate a ticket counter with 3 service windows. People join a single queue; each window takes the next person when free. Print who is served by which window.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
#include <queue>
#include <string>
using namespace std;

int main() {
    queue<string> line;
    line.push("Alice"); line.push("Bob");   line.push("Carol");
    line.push("Dave");  line.push("Eve");   line.push("Frank");
    line.push("Grace");

    int windows = 3;
    int w = 1;

    while (!line.empty()) {
        cout << "Window " << w << " serves " << line.front() << endl;
        line.pop();
        w = (w % windows) + 1;
    }
}
```

</details>
:::
