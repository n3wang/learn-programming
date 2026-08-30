---
sidebar_position: 1
title: Algorithms
---

# Algorithms

Algorithm design is about choosing the right strategy — not just getting a correct answer, but getting it *efficiently* at scale. This section covers the core analysis tools, design patterns, and data structures that appear everywhere from interview questions to production systems.

## Planned Topics

### Analysis
- Big-O, Θ, Ω notation — what they actually mean
- Amortized analysis (dynamic arrays, union-find)
- Recurrence relations and the Master Theorem

### Sorting & Searching
- Comparison sorts: Merge sort, Quicksort, Heapsort — interactive visualizer
- Linear-time sorts: Counting sort, Radix sort
- [Binary Search](./binary-search) — sorted arrays, bounds, predicates, search on the answer

### Data Structures
- Hash tables: open addressing vs. chaining, load factor, probing
- Trees: BST, AVL, Red-Black, B-tree (interactive balance visualizer)
- Heaps and priority queues
- Graphs: adjacency list vs. matrix, BFS/DFS traversal
- [MEX](./mex) — minimal excluded, bool mark, map+set updates
- [Sparse Table](./sparse-table) — static RMQ O(1), range folds O(log n)
- [Sqrt Tree](./sqrt-tree) — associative range folds O(1), O(n log log n) build
- [Floyd Cycle Finding](./floyd-cycle) — tortoise & hare, detect cycle + find entry O(1) mem

### Graph Algorithms
- Shortest path: [0-1 BFS](./bfs), Dijkstra, Bellman-Ford, A*
- [Centroid Decomposition](./centroid-decomposition) — divide-and-conquer on trees, path queries
- [Maximum Flow (MPM)](./maximum-flow-mpm) — layered potentials, reference node, O(V³)
- Minimum spanning tree: Kruskal, Prim; [Second Best MST](./second-best-mst) — one edge swap, LCA path max
- [Strong Orientation](./strong-orientation) — Robbins, DFS orient, min SCCs = comps + bridges
- Topological sort and cycle detection

### Geometry
- [Basic Geometry](./basic-geometry) — points, dot/cross, orientation, line & plane intersection
- [Convex Hull Trick](./convex-hull-trick) — DP lines, CHT, Li Chao tree
- [Half-plane Intersection](./halfplane-intersection) — Sort-and-Incremental, kernels, 2D LP
- [Lattice Points (non-lattice)](./lattice-points) — edge floor-sums, O(log n) reciprocity
- [Manhattan Distance](./manhattan-distance) — farthest pair, Chebyshev map, Manhattan MST
- [Minimum Enclosing Circle](./minimum-enclosing-circle) — Welzl, expected O(n), complex predicates
- [Minkowski Sum](./minkowski-sum) — convex P+Q in O(|P|+|Q|), polygon distance
- [Point Location](./point-location) — sweep line, O(log n) offline face queries

### Bit Manipulation
- [Bit Manipulation](./bit-manipulation) — operators, tricks, popcount, subsets as masks

### Number Theory
- [Continued Fractions](./continued-fractions) — Euclid expansion, convergents, Stern–Brocot, best approximations
- [Factoring Exponentiation](./factoring-exponentiation) — `a·xʸ mod 2ᵈ` via discrete log on odd units
- [Integer Factorization](./integer-factorization) — trial/wheel, Fermat, Pollard p−1 & ρ
- [Primality Tests](./primality-tests) — trial, Fermat, Miller–Rabin (deterministic 64-bit)
- [Montgomery Multiplication](./montgomery-multiplication) — REDC, r=2ᵐ, fast modmul
- [Divisor Functions](./divisor-functions) — d(n), σ(n) from prime factorization

### Linear Algebra
- [Determinant (Kraut / LU)](./determinant-kraut) — unit-L factorization, Π diag(U), O(N³)

### Algebra
- [Polynomials & Series](./polynomials-series) — convolution, FPS inverse, Newton, eval/interp

### Combinatorics
- [Stars and Bars](./stars-and-bars) — identical objects, non-neg / positive / lower-bound sums

### Design Patterns
- Divide and conquer
- Dynamic programming (memoization vs. tabulation)
- [Intro to Dynamic Programming](./intro-dynamic-programming) — Fibonacci, top-down memo, bottom-up
- [Knapsack](./knapsack) — 0-1, complete, multiple, binary grouping
- [Divide and Conquer DP](./divide-and-conquer-dp) — monotone opt, QI, O(mn log n) layered DP
- [Knuth's Optimization](./knuth-optimization) — range DP, opt sandwich, O(n³)→O(n²)
- [Simulated Annealing](./simulated-annealing) — randomized search, Gibbs accept, TSP template
- Greedy algorithms and when they fail
- Backtracking

---

*More pages coming soon — check back or contribute using the lesson template.*
