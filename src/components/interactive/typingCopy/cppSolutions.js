/** Lesson snippets used as the CPP_SOLUTIONS typing corpus. */
export const CPP_SOLUTIONS = [
  {
    "title": "lesson-1a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    cout << \"My name is C++!\" << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-1a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int age = 17;\n    double gpa = 3.85;\n    string name = \"Alice\";\n    bool isStudent = true;\n\n    cout << \"Name: \" << name << endl;\n    cout << \"Age: \" << age << endl;\n    cout << \"GPA: \" << gpa << endl;\n    cout << \"Student: \" << isStudent << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-1a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int apples = 24;\n    int friends = 5;\n\n    int each = apples / friends;\n    int leftover = apples % friends;\n\n    cout << \"Each friend gets \" << each << \" apples.\" << endl;\n    cout << \"There are \" << leftover << \" apples left over.\" << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-1a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int age;\n    cout << \"Enter your age: \" << flush;\n    cin >> age;\n    cout << \"You are \" << age << \" years old.\" << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-1a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string name;\n    int birthYear;\n    int currentYear = 2025;\n\n    cout << \"What is your name? \" << flush;\n    getline(cin, name);\n\n    cout << \"What year were you born? \" << flush;\n    cin >> birthYear;\n\n    int age = currentYear - birthYear;\n    cout << \"Hello, \" << name << \"! You are approximately \" << age << \" years old.\" << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-1a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    double celsius;\n    cout << \"Enter temperature in Celsius: \" << flush;\n    cin >> celsius;\n\n    double fahrenheit = (celsius * 9.0 / 5.0) + 32;\n    cout << celsius << \" Celsius = \" << fahrenheit << \" Fahrenheit\" << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-1a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    double length, width;\n\n    cout << \"Enter length: \" << flush;\n    cin >> length;\n\n    cout << \"Enter width: \" << flush;\n    cin >> width;\n\n    cout << \"Area: \" << length * width << endl;\n    cout << \"Perimeter: \" << 2 * (length + width) << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int num;\n    cout << \"Enter a number: \" << flush;\n    cin >> num;\n\n    if (num > 0) {\n        cout << num << \" is positive.\" << endl;\n    } else if (num < 0) {\n        cout << num << \" is negative.\" << endl;\n    } else {\n        cout << \"The number is zero.\" << endl;\n    }\n\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int day;\n    cout << \"Enter a day number (1-7): \" << flush;\n    cin >> day;\n\n    switch (day) {\n        case 1: cout << \"Monday\" << endl; break;\n        case 2: cout << \"Tuesday\" << endl; break;\n        case 3: cout << \"Wednesday\" << endl; break;\n        case 4: cout << \"Thursday\" << endl; break;\n        case 5: cout << \"Friday\" << endl; break;\n        case 6: cout << \"Saturday\" << endl; break;\n        case 7: cout << \"Sunday\" << endl; break;\n        default: cout << \"Another day\" << endl; break;\n    }\n\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Print even numbers from 2 to 10\n    for (int i = 2; i <= 10; i += 2) {\n        cout << i << \" \";\n    }\n    cout << endl;\n\n    // Count down\n    for (int i = 5; i >= 1; i--) {\n        cout << i << \"... \";\n    }\n    cout << \"Blast off!\" << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int row = 1; row <= 3; row++) {\n        for (int col = 1; col <= 3; col++) {\n            cout << row << \"x\" << col << \"=\" << row * col << \"  \";\n        }\n        cout << endl;\n    }\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int guess = -1;\n    int secret = 42;\n\n    while (guess != secret) {\n        cout << \"Guess the number: \" << flush;\n        cin >> guess;\n\n        if (guess < secret) {\n            cout << \"Too low!\" << endl;\n        } else if (guess > secret) {\n            cout << \"Too high!\" << endl;\n        }\n    }\n\n    cout << \"Correct! The number was \" << secret << \".\" << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    do {\n        cout << \"Enter a positive number: \" << flush;\n        cin >> n;\n    } while (n <= 0);\n\n    cout << \"You entered: \" << n << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 15; i++) {\n        if (i == 10) break;\n        if (i % 3 == 0) continue;\n        cout << i << \" \";\n    }\n    cout << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 100; i++) {\n        if (i % 3 == 0 && i % 5 == 0) {\n            cout << \"FizzBuzz\" << endl;\n        } else if (i % 3 == 0) {\n            cout << \"Fizz\" << endl;\n        } else if (i % 5 == 0) {\n            cout << \"Buzz\" << endl;\n        } else {\n            cout << i << endl;\n        }\n    }\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cout << \"Enter a number: \" << flush;\n    cin >> n;\n\n    for (int i = 1; i <= 10; i++) {\n        cout << n << \" x \" << i << \" = \" << n * i << endl;\n    }\n\n    return 0;\n}"
  },
  {
    "title": "lesson-2a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int num;\n    cout << \"Enter a positive integer: \" << flush;\n    cin >> num;\n\n    int sum = 0;\n    while (num > 0) {\n        sum += num % 10;\n        num /= 10;\n    }\n\n    cout << \"Sum of digits: \" << sum << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nvoid printBox(string message) {\n    int len = message.length() + 4;\n    for (int i = 0; i < len; i++) cout << \"*\";\n    cout << endl;\n    cout << \"* \" << message << \" *\" << endl;\n    for (int i = 0; i < len; i++) cout << \"*\";\n    cout << endl;\n}\n\nint main() {\n    printBox(\"C++ is great\");\n    printBox(\"Hello\");\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\nusing namespace std;\n\nint max(int a, int b) {\n    if (a > b) return a;\n    return b;\n}\n\ndouble average(double a, double b, double c) {\n    return (a + b + c) / 3.0;\n}\n\nint main() {\n    cout << \"Max of 4 and 9: \" << max(4, 9) << endl;\n    cout << \"Average of 80, 90, 95: \" << average(80, 90, 95) << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nvoid printGreeting(string name, string greeting = \"Hello\") {\n    cout << greeting << \", \" << name << \"!\" << endl;\n}\n\nint main() {\n    printGreeting(\"Alice\");\n    printGreeting(\"Bob\", \"Hey\");\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\nusing namespace std;\n\nint add(int a, int b) {\n    return a + b;\n}\n\ndouble add(double a, double b) {\n    return a + b;\n}\n\nint add(int a, int b, int c) {\n    return a + b + c;\n}\n\nint main() {\n    cout << add(1, 2) << endl;\n    cout << add(1.5, 2.5) << endl;\n    cout << add(1, 2, 3) << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        cout << fibonacci(i) << \" \";\n    }\n    cout << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\nusing namespace std;\n\nint square(int n);\n\nint main() {\n    cout << square(5) << endl;\n    return 0;\n}\n\nint square(int n) {\n    return n * n;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nstring classify(int n) {\n    if (n > 0) return \"positive\";\n    if (n < 0) return \"negative\";\n    return \"zero\";\n}\n\nint main() {\n    cout << classify(10) << endl;\n    cout << classify(-5) << endl;\n    cout << classify(0) << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\nusing namespace std;\n\ndouble power(double base, int exp) {\n    double result = 1.0;\n    for (int i = 0; i < exp; i++) {\n        result *= base;\n    }\n    return result;\n}\n\nint main() {\n    cout << power(2, 10) << endl;\n    cout << power(3, 4) << endl;\n    cout << power(1.5, 3) << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-3a",
    "code": "#include <iostream>\nusing namespace std;\n\nbool isPrime(int n) {\n    if (n < 2) return false;\n    for (int i = 2; i < n; i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    cout << \"Primes from 2 to 50: \";\n    for (int i = 2; i <= 50; i++) {\n        if (isPrime(i)) {\n            cout << i << \" \";\n        }\n    }\n    cout << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-4a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Car {\npublic:\n    string make;\n    string model;\n    int year;\n    double speed;\n\n    void accelerate(double amount) {\n        speed += amount;\n        cout << model << \" accelerates to \" << speed << \" mph.\" << endl;\n    }\n\n    void brake(double amount) {\n        speed -= amount;\n        if (speed < 0) speed = 0;\n        cout << model << \" slows to \" << speed << \" mph.\" << endl;\n    }\n};\n\nint main() {\n    Car myCar;\n    myCar.make  = \"Toyota\";\n    myCar.model = \"Supra\";\n    myCar.year  = 2024;\n    myCar.speed = 0;\n\n    myCar.accelerate(30);\n    myCar.accelerate(20);\n    myCar.brake(15);\n    return 0;\n}"
  },
  {
    "title": "lesson-4a",
    "code": "#include <iostream>\nusing namespace std;\n\nclass BankAccount {\nprivate:\n    double balance;\n\npublic:\n    BankAccount() : balance(0) {}\n\n    double getBalance() {\n        return balance;\n    }\n\n    void deposit(double amount) {\n        if (amount > 0) {\n            balance += amount;\n        }\n    }\n\n    void withdraw(double amount) {\n        if (amount > 0 && amount <= balance) {\n            balance -= amount;\n        } else {\n            cout << \"Invalid withdrawal.\" << endl;\n        }\n    }\n};\n\nint main() {\n    BankAccount account;\n    account.deposit(100);\n    account.withdraw(30);\n    account.withdraw(1000);\n    cout << \"Balance: \" << account.getBalance() << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-4a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Rectangle {\nprivate:\n    double width;\n    double height;\n\npublic:\n    Rectangle(double w, double h) : width(w), height(h) {}\n\n    double area() {\n        return width * height;\n    }\n\n    double perimeter() {\n        return 2 * (width + height);\n    }\n\n    void describe() {\n        cout << \"Rectangle \" << width << \"x\" << height\n             << \" | Area: \" << area()\n             << \" | Perimeter: \" << perimeter() << endl;\n    }\n};\n\nint main() {\n    Rectangle r1(5.0, 3.0);\n    Rectangle r2(10.0, 2.5);\n\n    r1.describe();\n    r2.describe();\n    return 0;\n}"
  },
  {
    "title": "lesson-4a",
    "code": "#include <iostream>\nusing namespace std;\n\nclass MyClass {\npublic:\n    MyClass()  { cout << \"Object created.\"  << endl; }\n    ~MyClass() { cout << \"Object destroyed.\" << endl; }\n};\n\nint main() {\n    MyClass obj;\n    cout << \"Inside main.\" << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-4a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Student {\nprivate:\n    string name;\n    int grade;\n    int id;\n\npublic:\n    Student(string n, int g, int i) : name(n), grade(g), id(i) {}\n\n    string letterGrade() {\n        if (grade >= 90) return \"A\";\n        if (grade >= 80) return \"B\";\n        if (grade >= 70) return \"C\";\n        if (grade >= 60) return \"D\";\n        return \"F\";\n    }\n\n    void describe() {\n        cout << \"[ID \" << id << \"] \" << name\n             << \" — \" << grade << \"/100 (\" << letterGrade() << \")\" << endl;\n    }\n};\n\nint main() {\n    Student s1(\"Alice\", 93, 1001);\n    Student s2(\"Bob\",   74, 1002);\n    Student s3(\"Carol\", 58, 1003);\n\n    s1.describe();\n    s2.describe();\n    s3.describe();\n    return 0;\n}"
  },
  {
    "title": "lesson-4a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass ObjectTracker {\n    static int count;\n    string label;\npublic:\n    ObjectTracker(string l) : label(l) {\n        count++;\n        cout << label << \" created. Total: \" << count << endl;\n    }\n    ~ObjectTracker() {\n        count--;\n        cout << label << \" destroyed. Total: \" << count << endl;\n    }\n    static int getCount() { return count; }\n};\n\nint ObjectTracker::count = 0;\n\nint main() {\n    ObjectTracker a(\"A\");\n    {\n        ObjectTracker b(\"B\");\n        ObjectTracker c(\"C\");\n        cout << \"Inside block: \" << ObjectTracker::getCount() << endl;\n    }\n    cout << \"After block: \" << ObjectTracker::getCount() << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-4b",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nclass Animal {\npublic:\n    string name;\n    int age;\n\n    Animal(string n, int a) : name(n), age(a) {}\n\n    void eat() {\n        cout << name << \" is eating.\" << endl;\n    }\n\n    void sleep() {\n        cout << name << \" is sleeping.\" << endl;\n    }\n};\n\nclass Dog : public Animal {\npublic:\n    string breed;\n\n    Dog(string n, int a, string b) : Animal(n, a), breed(b) {}\n\n    void bark() {\n        cout << name << \" says: Woof!\" << endl;\n    }\n};\n\nint main() {\n    Dog rex(\"Rex\", 3, \"Labrador\");\n    rex.eat();\n    rex.sleep();\n    rex.bark();\n    return 0;\n}"
  },
  {
    "title": "lesson-4b",
    "code": "#include <iostream>\nusing namespace std;\n\nclass Flyable {\npublic:\n    virtual void fly() { cout << \"Flying!\" << endl; }\n};\n\nclass Swimmable {\npublic:\n    virtual void swim() { cout << \"Swimming!\" << endl; }\n};\n\nclass Duck : public Flyable, public Swimmable {\npublic:\n    void quack() { cout << \"Quack!\" << endl; }\n};\n\nint main() {\n    Duck d;\n    d.fly();\n    d.swim();\n    d.quack();\n    return 0;\n}"
  },
  {
    "title": "lesson-5a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 42;\n    int* ptr = &x;\n\n    cout << \"value x:    \" << x << endl;\n    cout << \"address &x: \" << &x << endl;\n    cout << \"ptr:        \" << ptr << endl;\n    cout << \"deref *ptr: \" << *ptr << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5a",
    "code": "#include <iostream>\nusing namespace std;\n\nvoid doubleIt(int* p) {\n    *p = *p * 2;\n}\n\nvoid tripleIt(int& r) {\n    r = r * 3;\n}\n\nint main() {\n    int x = 5;\n    doubleIt(&x);\n    cout << x << endl;\n\n    tripleIt(x);\n    cout << x << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int* p = arr;\n\n    cout << *p     << endl;\n    cout << *(p+1) << endl;\n    cout << *(p+4) << endl;\n\n    p++;\n    cout << *p << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5a",
    "code": "#include <iostream>\n#include <memory>\nusing namespace std;\n\nint main() {\n    unique_ptr<int> p = make_unique<int>(42);\n    cout << *p << endl;\n    *p = 100;\n    cout << *p << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5a",
    "code": "#include <iostream>\nusing namespace std;\n\nvoid swapPtr(int* a, int* b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nvoid swapRef(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\n\nint main() {\n    int x = 5, y = 10;\n    cout << x << \" \" << y << endl;\n\n    swapPtr(&x, &y);\n    cout << x << \" \" << y << endl;\n\n    swapRef(x, y);\n    cout << x << \" \" << y << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5a",
    "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cout << \"Size: \" << flush;\n    cin >> n;\n\n    int* arr = new int[n];\n\n    for (int i = 0; i < n; i++) {\n        arr[i] = i * i;\n    }\n\n    for (int i = 0; i < n; i++) {\n        cout << arr[i] << \" \";\n    }\n    cout << endl;\n\n    delete[] arr;\n    arr = nullptr;\n    return 0;\n}"
  },
  {
    "title": "lesson-5a",
    "code": "#include <iostream>\n#include <memory>\n#include <vector>\nusing namespace std;\n\nclass Rectangle {\n    double w, h;\npublic:\n    Rectangle(double w, double h) : w(w), h(h) {}\n    double area() { return w * h; }\n    void print() { cout << w << \"x\" << h << \" area=\" << area() << endl; }\n};\n\nint main() {\n    vector<unique_ptr<Rectangle>> rects;\n    rects.push_back(make_unique<Rectangle>(3, 4));\n    rects.push_back(make_unique<Rectangle>(10, 2));\n    rects.push_back(make_unique<Rectangle>(5, 5));\n\n    double maxArea = 0;\n    for (auto& r : rects) {\n        r->print();\n        if (r->area() > maxArea) maxArea = r->area();\n    }\n    cout << \"Largest area: \" << maxArea << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5b",
    "code": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    vector<int> v = {5, 2, 8, 1, 9, 3};\n\n    sort(v.begin(), v.end());\n    reverse(v.begin(), v.end());\n\n    auto it = find(v.begin(), v.end(), 8);\n    if (it != v.end()) {\n        cout << \"Found 8 at index \" << (it - v.begin()) << endl;\n    }\n\n    cout << \"Max: \" << *max_element(v.begin(), v.end()) << endl;\n    cout << \"Min: \" << *min_element(v.begin(), v.end()) << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-5b",
    "code": "#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nbool isBalanced(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') {\n            st.push(c);\n        } else if (c == ')' || c == ']' || c == '}') {\n            if (st.empty()) return false;\n            char top = st.top(); st.pop();\n            if ((c == ')' && top != '(') ||\n                (c == ']' && top != '[') ||\n                (c == '}' && top != '{')) return false;\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    cout << isBalanced(\"({[]})\") << endl;\n    cout << isBalanced(\"([)]\")   << endl;\n    cout << isBalanced(\"{\")      << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5b",
    "code": "#include <iostream>\n#include <queue>\n#include <string>\nusing namespace std;\n\nint main() {\n    queue<string> printQueue;\n    printQueue.push(\"report.pdf\");\n    printQueue.push(\"photo.jpg\");\n    printQueue.push(\"notes.txt\");\n\n    int jobNum = 1;\n    while (!printQueue.empty()) {\n        cout << \"Printing job \" << jobNum++ << \": \" << printQueue.front() << endl;\n        printQueue.pop();\n    }\n    return 0;\n}"
  },
  {
    "title": "lesson-5b",
    "code": "#include <iostream>\n#include <unordered_map>\n#include <sstream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string text = \"the cat sat on the mat the cat\";\n    unordered_map<string, int> freq;\n\n    istringstream ss(text);\n    string word;\n    while (ss >> word) {\n        freq[word]++;\n    }\n\n    for (auto& p : freq) {\n        cout << p.first << \": \" << p.second << endl;\n    }\n    return 0;\n}"
  },
  {
    "title": "lesson-5b",
    "code": "#include <iostream>\n#include <set>\nusing namespace std;\n\nint main() {\n    set<int> s = {3, 1, 4, 1, 5, 9, 2, 6, 5};\n    for (int x : s) cout << x << \" \";\n    cout << endl;\n\n    s.insert(7);\n    s.erase(3);\n    cout << \"count 5: \" << s.count(5) << endl;\n    cout << \"count 3: \" << s.count(3) << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-5b",
    "code": "#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvoid twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n        int complement = target - nums[i];\n        if (seen.count(complement)) {\n            cout << nums[seen[complement]] << \" + \" << nums[i]\n                 << \" = \" << target << endl;\n        }\n        seen[nums[i]] = i;\n    }\n}\n\nint main() {\n    vector<int> v = {2, 7, 11, 15, 1, 8};\n    twoSum(v, 9);\n    return 0;\n}"
  },
  {
    "title": "lesson-5b",
    "code": "#include <iostream>\n#include <queue>\n#include <string>\nusing namespace std;\n\nint main() {\n    queue<string> line;\n    line.push(\"Alice\"); line.push(\"Bob\");   line.push(\"Carol\");\n    line.push(\"Dave\");  line.push(\"Eve\");   line.push(\"Frank\");\n    line.push(\"Grace\");\n\n    int windows = 3;\n    int w = 1;\n\n    while (!line.empty()) {\n        cout << \"Window \" << w << \" serves \" << line.front() << endl;\n        line.pop();\n        w = (w % windows) + 1;\n    }\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\ntemplate <typename T>\nT maxOf(T a, T b) {\n    return a > b ? a : b;\n}\n\nint main() {\n    cout << maxOf(3, 7) << endl;\n    cout << maxOf(3.14, 2.71) << endl;\n    cout << maxOf('z', 'a') << endl;\n    cout << maxOf(string(\"cat\"), string(\"dog\")) << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\ntemplate <typename A, typename B>\nclass Pair {\npublic:\n    A first;\n    B second;\n    Pair(A a, B b) : first(a), second(b) {}\n\n    void print() {\n        cout << \"(\" << first << \", \" << second << \")\" << endl;\n    }\n};\n\nint main() {\n    Pair<string, int> p(\"Alice\", 95);\n    p.print();\n\n    Pair<double, double> coords(48.8566, 2.3522);\n    coords.print();\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\nusing namespace std;\n\ntemplate <typename T>\nvoid describe(T val) {\n    cout << \"Value: \" << val << endl;\n}\n\ntemplate <>\nvoid describe<bool>(bool val) {\n    cout << \"Boolean: \" << (val ? \"true\" : \"false\") << endl;\n}\n\nint main() {\n    describe(42);\n    describe(3.14);\n    describe(true);\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\nusing namespace std;\n\nint main() {\n    vector<int> grades = {72, 88, 95, 60, 79, 91, 84, 55};\n\n    double avg = accumulate(grades.begin(), grades.end(), 0.0) / grades.size();\n    cout << \"Average: \" << avg << endl;\n\n    int passing = count_if(grades.begin(), grades.end(),\n                           [](int g) { return g >= 70; });\n    cout << \"Passing: \" << passing << \"/\" << grades.size() << endl;\n\n    sort(grades.begin(), grades.end(), greater<int>());\n    cout << \"Top grade: \" << grades.front() << endl;\n    cout << \"Low grade: \" << grades.back()  << endl;\n\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\n#include <queue>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> data = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};\n    int k = 3;\n\n    priority_queue<int, vector<int>, greater<int>> minHeap;\n    for (int x : data) {\n        minHeap.push(x);\n        if (minHeap.size() > k) minHeap.pop();\n    }\n\n    cout << \"Top \" << k << \" elements: \";\n    while (!minHeap.empty()) {\n        cout << minHeap.top() << \" \";\n        minHeap.pop();\n    }\n    cout << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\nusing namespace std;\n\ntemplate <typename T>\nT myMin(T a, T b) {\n    return a < b ? a : b;\n}\n\ntemplate <typename T>\nT clamp(T val, T lo, T hi) {\n    if (val < lo) return lo;\n    if (val > hi) return hi;\n    return val;\n}\n\nint main() {\n    cout << myMin(3, 7)         << endl;\n    cout << myMin(3.14, 2.71)   << endl;\n    cout << myMin('z', 'a')     << endl;\n\n    cout << clamp(15, 0, 10)    << endl;\n    cout << clamp(-5, 0, 10)    << endl;\n    cout << clamp(5, 0, 10)     << endl;\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\n#include <map>\n#include <sstream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string line;\n    cout << \"Enter a sentence: \" << flush;\n    getline(cin, line);\n\n    map<string, int> freq;\n    istringstream ss(line);\n    string word;\n    while (ss >> word) {\n        for (char& c : word) c = tolower(c);\n        freq[word]++;\n    }\n\n    for (auto& p : freq) {\n        cout << p.first << \": \" << p.second << endl;\n    }\n    return 0;\n}"
  },
  {
    "title": "lesson-6a",
    "code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <string>\nusing namespace std;\n\nstruct Student {\n    string name;\n    double gpa;\n};\n\nint main() {\n    vector<Student> students = {\n        {\"Alice\", 3.8},\n        {\"Bob\",   3.2},\n        {\"Carol\", 3.9},\n        {\"Dave\",  3.5},\n    };\n\n    sort(students.begin(), students.end(),\n         [](const Student& a, const Student& b) {\n             return a.gpa > b.gpa;\n         });\n\n    int rank = 1;\n    for (auto& s : students) {\n        cout << rank++ << \". \" << s.name << \" — \" << s.gpa << endl;\n    }\n    return 0;\n}"
  },

  {
    "title": "pool-vector",
    "code": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> xs;\n    xs.push_back(3);\n    xs.push_back(1);\n    xs.push_back(4);\n    cout << xs.size() << endl;\n    cout << xs.back() << endl;\n    xs.pop_back();\n    cout << xs.empty() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-queue",
    "code": "#include <iostream>\n#include <queue>\nusing namespace std;\n\nint main() {\n    queue<string> q;\n    q.push(\"a\");\n    q.push(\"b\");\n    cout << q.front() << endl;\n    q.pop();\n    cout << q.front() << endl;\n    cout << q.empty() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-stack",
    "code": "#include <iostream>\n#include <stack>\nusing namespace std;\n\nint main() {\n    stack<int> st;\n    st.push(2);\n    st.push(5);\n    cout << st.top() << endl;\n    st.pop();\n    cout << st.top() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-algorithm",
    "code": "#include <algorithm>\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> xs = {4, 1, 4, 2};\n    sort(xs.begin(), xs.end());\n    xs.erase(unique(xs.begin(), xs.end()), xs.end());\n    auto it = find(xs.begin(), xs.end(), 2);\n    cout << (it != xs.end()) << endl;\n    cout << *max_element(xs.begin(), xs.end()) << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-map",
    "code": "#include <iostream>\n#include <map>\n#include <string>\nusing namespace std;\n\nint main() {\n    map<string, int> age;\n    age[\"ada\"] = 36;\n    age.insert({\"lin\", 19});\n    cout << age[\"ada\"] << endl;\n    cout << age.count(\"lin\") << endl;\n    for (auto& p : age) {\n        cout << p.first << \" \" << p.second << endl;\n    }\n    return 0;\n}"
  },
  {
    "title": "pool-unordered",
    "code": "#include <iostream>\n#include <string>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    unordered_map<string, int> score;\n    score[\"a\"] = 10;\n    score[\"b\"] = 7;\n    if (score.find(\"a\") != score.end()) {\n        cout << score[\"a\"] << endl;\n    }\n    score.erase(\"b\");\n    cout << score.size() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-string",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s = \"hello\";\n    s += \"!\";\n    cout << s.length() << endl;\n    cout << s.substr(0, 2) << endl;\n    cout << s.find(\"ll\") << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-numeric",
    "code": "#include <iostream>\n#include <numeric>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> xs = {1, 2, 3, 4};\n    int total = accumulate(xs.begin(), xs.end(), 0);\n    cout << total << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-pair",
    "code": "#include <iostream>\n#include <utility>\nusing namespace std;\n\nint main() {\n    pair<int, string> p = {3, \"ok\"};\n    cout << p.first << endl;\n    cout << p.second << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-cmath",
    "code": "#include <cmath>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << abs(-4) << endl;\n    cout << sqrt(9) << endl;\n    cout << pow(2, 3) << endl;\n    return 0;\n}"
  },

  {
    "title": "pool-set",
    "code": "#include <iostream>\n#include <set>\nusing namespace std;\n\nint main() {\n    set<int> xs;\n    xs.insert(3);\n    xs.insert(1);\n    xs.insert(3);\n    cout << xs.size() << endl;\n    cout << xs.count(1) << endl;\n    xs.erase(1);\n    cout << xs.empty() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-priority",
    "code": "#include <iostream>\n#include <queue>\nusing namespace std;\n\nint main() {\n    priority_queue<int> heap;\n    heap.push(3);\n    heap.push(9);\n    heap.push(1);\n    cout << heap.top() << endl;\n    heap.pop();\n    cout << heap.top() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-deque",
    "code": "#include <deque>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    deque<int> xs;\n    xs.push_back(2);\n    xs.push_front(1);\n    cout << xs.front() << endl;\n    cout << xs.back() << endl;\n    xs.pop_front();\n    cout << xs.front() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-string-parse",
    "code": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s = \"42\";\n    int n = stoi(s);\n    double x = stod(\"3.5\");\n    string text = to_string(n);\n    s.replace(0, 1, \"9\");\n    cout << n << endl;\n    cout << text << endl;\n    cout << s << endl;\n    cout << x << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-optional",
    "code": "#include <iostream>\n#include <optional>\n#include <string>\nusing namespace std;\n\nint main() {\n    optional<string> name = \"Ada\";\n    optional<string> missing;\n    cout << name.has_value() << endl;\n    cout << name.value_or(\"none\") << endl;\n    cout << missing.value_or(\"none\") << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-unordered-set",
    "code": "#include <iostream>\n#include <string>\n#include <unordered_set>\nusing namespace std;\n\nint main() {\n    unordered_set<string> seen;\n    seen.insert(\"a\");\n    seen.insert(\"a\");\n    seen.insert(\"b\");\n    cout << seen.size() << endl;\n    cout << seen.count(\"b\") << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-algorithm-more",
    "code": "#include <algorithm>\n#include <iostream>\n#include <numeric>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> xs(4);\n    iota(xs.begin(), xs.end(), 1);\n    reverse(xs.begin(), xs.end());\n    int big = *max_element(xs.begin(), xs.end());\n    cout << big << endl;\n    cout << xs.front() << endl;\n    return 0;\n}"
  },
  {
    "title": "pool-unique-ptr",
    "code": "#include <iostream>\n#include <memory>\nusing namespace std;\n\nint main() {\n    auto ptr = make_unique<int>(7);\n    cout << *ptr << endl;\n    return 0;\n}"
  }
];
