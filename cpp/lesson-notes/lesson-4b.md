---
sidebar_position: 6
title: Chapter 4b - Inheritance & Polymorphism
---

## Inheritance

Inheritance lets a **derived class** (child) reuse and extend the behavior of a **base class** (parent). The child gets all public and protected members of the parent automatically.

```cpp
// Base class
class Animal {
public:
    string name;
    int age;

    Animal(string n, int a) : name(n), age(a) {}

    void eat() {
        cout << name << " is eating." << endl;
    }

    void sleep() {
        cout << name << " is sleeping." << endl;
    }
};

// Derived class
class Dog : public Animal {
public:
    string breed;

    Dog(string n, int a, string b) : Animal(n, a), breed(b) {}

    void bark() {
        cout << name << " says: Woof!" << endl;
    }
};
```

```cpp
int main() {
    Dog rex("Rex", 3, "Labrador");
    rex.eat();    // inherited from Animal
    rex.sleep();  // inherited from Animal
    rex.bark();   // defined in Dog
}
```

<!-- IMAGE PLACEHOLDER: UML class diagram showing Animal at the top with name/age attributes and eat()/sleep() methods. An arrow labeled "inherits" points down to Dog with breed attribute and bark() method -->

### Access in Inheritance

| Member in Base | `public` inheritance | `protected` inheritance | `private` inheritance |
|---|---|---|---|
| `public` | public in child | protected in child | private in child |
| `protected` | protected in child | protected in child | private in child |
| `private` | **not accessible** | **not accessible** | **not accessible** |

Use `public` inheritance almost always. The others are rare.

---

## Calling the Parent Constructor

The derived class constructor must forward arguments to the base class constructor using the **initializer list**.

```cpp
class Cat : public Animal {
public:
    bool isIndoor;

    Cat(string n, int a, bool indoor)
        : Animal(n, a),        // call base constructor first
          isIndoor(indoor)
    {}

    void describe() {
        cout << name << " (age " << age << ") — "
             << (isIndoor ? "indoor" : "outdoor") << " cat." << endl;
    }
};
```

---

## Method Overriding

A derived class can **override** a base class method by redefining it with the same signature.

```cpp
class Animal {
public:
    string name;
    Animal(string n) : name(n) {}

    void speak() {
        cout << name << " makes a sound." << endl;
    }
};

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}

    void speak() {      // overrides Animal::speak
        cout << name << " says: Woof!" << endl;
    }
};

class Cat : public Animal {
public:
    Cat(string n) : Animal(n) {}

    void speak() {
        cout << name << " says: Meow!" << endl;
    }
};
```

---

## Virtual Functions & Polymorphism

Without `virtual`, C++ decides which method to call based on the **pointer type** (static dispatch). With `virtual`, it decides based on the **actual object type** at runtime (dynamic dispatch).

```cpp
class Animal {
public:
    string name;
    Animal(string n) : name(n) {}

    virtual void speak() {             // <-- virtual keyword
        cout << name << " makes a sound." << endl;
    }
};

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    void speak() override {            // <-- override keyword (C++11)
        cout << name << " says: Woof!" << endl;
    }
};

class Cat : public Animal {
public:
    Cat(string n) : Animal(n) {}
    void speak() override {
        cout << name << " says: Meow!" << endl;
    }
};

int main() {
    Animal* animals[3];
    animals[0] = new Dog("Rex");
    animals[1] = new Cat("Whiskers");
    animals[2] = new Dog("Buddy");

    for (int i = 0; i < 3; i++) {
        animals[i]->speak();   // calls the right version for each object
    }

    for (int i = 0; i < 3; i++) delete animals[i];
}
```

```
Rex says: Woof!
Whiskers says: Meow!
Buddy says: Woof!
```

<!-- IMAGE PLACEHOLDER: Diagram showing an Animal* pointer array. Each pointer points to a different object (Dog, Cat, Dog) in memory. Arrows from each object point to their own speak() implementation, illustrating runtime dispatch -->

:::note `override` keyword
`override` (C++11) tells the compiler "this method must override a virtual method in the base." If you mistype the name, the compiler will catch it. Always use `override`.
:::

---

## Virtual Destructors

If you ever `delete` a derived object through a base pointer, the base class destructor **must** be `virtual`, otherwise only the base destructor runs and the derived part leaks.

```cpp
class Base {
public:
    virtual ~Base() { cout << "Base destroyed." << endl; }
};

class Derived : public Base {
public:
    ~Derived() override { cout << "Derived destroyed." << endl; }
};

int main() {
    Base* obj = new Derived();
    delete obj;   // Derived destroyed. then Base destroyed. (correct order)
}
```

:::important Rule of thumb
If a class has **any** virtual function, give it a `virtual ~Destructor()`.
:::

---

## Abstract Classes & Pure Virtual Functions

A **pure virtual function** has no implementation in the base class and **forces** derived classes to provide one. A class with at least one pure virtual function is **abstract** — you cannot instantiate it directly.

```cpp
class Shape {
public:
    string color;
    Shape(string c) : color(c) {}

    virtual double area() = 0;       // pure virtual
    virtual double perimeter() = 0;  // pure virtual

    void describe() {
        cout << color << " shape | area=" << area()
             << " perimeter=" << perimeter() << endl;
    }
};

class Circle : public Shape {
    double radius;
public:
    Circle(string c, double r) : Shape(c), radius(r) {}
    double area() override      { return 3.14159 * radius * radius; }
    double perimeter() override { return 2 * 3.14159 * radius; }
};

class Rectangle : public Shape {
    double w, h;
public:
    Rectangle(string c, double w, double h) : Shape(c), w(w), h(h) {}
    double area() override      { return w * h; }
    double perimeter() override { return 2 * (w + h); }
};

int main() {
    Shape* shapes[] = {
        new Circle("red", 5),
        new Rectangle("blue", 4, 6)
    };
    for (auto s : shapes) {
        s->describe();
        delete s;
    }
}
```

```
red shape | area=78.5397 perimeter=31.4159
blue shape | area=24 perimeter=20
```

<!-- IMAGE PLACEHOLDER: UML diagram with Shape as abstract class (italicized or with <<abstract>> label) containing pure virtual area() and perimeter(). Arrows point down to Circle and Rectangle, both providing concrete implementations -->

---

## The Inheritance Hierarchy

```
         Shape  (abstract)
        /      \
   Circle    Rectangle
                 |
              Square   (Rectangle with w == h)
```

```cpp
class Square : public Rectangle {
public:
    Square(string c, double side) : Rectangle(c, side, side) {}
};
```

---

## Multiple Inheritance

C++ allows a class to inherit from **more than one base class**. Use carefully — it can lead to the "diamond problem."

```cpp
class Flyable {
public:
    virtual void fly() { cout << "Flying!" << endl; }
};

class Swimmable {
public:
    virtual void swim() { cout << "Swimming!" << endl; }
};

class Duck : public Flyable, public Swimmable {
public:
    void quack() { cout << "Quack!" << endl; }
};

int main() {
    Duck d;
    d.fly();
    d.swim();
    d.quack();
}
```

---

## Exercises

:::tip Activity: Shape Hierarchy
Extend the `Shape` hierarchy with a `Triangle` class. Add a method `isLarger(Shape* other)` to the base class that compares areas.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
#include <cmath>
#include <string>
using namespace std;

class Shape {
public:
    string color;
    Shape(string c) : color(c) {}
    virtual double area() = 0;
    virtual double perimeter() = 0;
    virtual ~Shape() {}

    bool isLarger(Shape* other) {
        return area() > other->area();
    }
};

class Triangle : public Shape {
    double a, b, c;
public:
    Triangle(string col, double a, double b, double c)
        : Shape(col), a(a), b(b), c(c) {}

    double perimeter() override { return a + b + c; }

    double area() override {
        double s = perimeter() / 2;
        return sqrt(s * (s-a) * (s-b) * (s-c));  // Heron's formula
    }
};

class Circle : public Shape {
    double r;
public:
    Circle(string col, double r) : Shape(col), r(r) {}
    double area() override      { return 3.14159 * r * r; }
    double perimeter() override { return 2 * 3.14159 * r; }
};

int main() {
    Triangle t("green", 3, 4, 5);
    Circle   c("red", 3);

    cout << "Triangle area: " << t.area() << endl;
    cout << "Circle area: "   << c.area() << endl;
    cout << "Triangle larger? " << (t.isLarger(&c) ? "yes" : "no") << endl;
}
```

</details>
:::

:::tip Activity: Employee System
Create a base class `Employee` with `name` and `baseSalary`. Derive `Manager` (adds a `bonus`) and `Intern` (salary capped at a lower amount). Override a `monthlyPay()` virtual method in each.

<details>
<summary>📒 Solution</summary>

```cpp
#include <iostream>
#include <string>
using namespace std;

class Employee {
protected:
    string name;
    double baseSalary;
public:
    Employee(string n, double s) : name(n), baseSalary(s) {}
    virtual double monthlyPay() { return baseSalary; }
    virtual void describe() {
        cout << name << " earns $" << monthlyPay() << "/mo" << endl;
    }
    virtual ~Employee() {}
};

class Manager : public Employee {
    double bonus;
public:
    Manager(string n, double s, double b) : Employee(n, s), bonus(b) {}
    double monthlyPay() override { return baseSalary + bonus; }
};

class Intern : public Employee {
    static const double CAP;
public:
    Intern(string n, double s) : Employee(n, s) {}
    double monthlyPay() override { return min(baseSalary, CAP); }
};

const double Intern::CAP = 2000.0;

int main() {
    Employee* staff[] = {
        new Manager("Alice", 8000, 2000),
        new Intern("Bob",    3000),
        new Employee("Carol", 5000)
    };
    for (auto e : staff) {
        e->describe();
        delete e;
    }
}
```

</details>
:::
