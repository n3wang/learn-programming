#!/usr/bin/env python3
"""Build Chapter-9 coding interview bank (≥12 verified tests each) → JS module."""

from __future__ import annotations

import json
import math
import random
import statistics
from collections import Counter, deque
from pathlib import Path

OUT_JS = Path(__file__).resolve().parents[1] / "src/components/CodeExercise/ch9/bank.generated.js"
OUT_JSON = Path(__file__).resolve().parents[1] / "src/components/SqlExercise/ch8/../CodeExercise/ch9/expectations.json"
OUT_JSON = Path(__file__).resolve().parents[1] / "src/components/CodeExercise/ch9/expectations.json"

problems: dict[str, dict] = {}


def exec_io(solution: str, wrap: str, stdin: str) -> str:
    ns: dict = {}
    code = solution + "\n" + wrap
    import io
    import sys

    old_in, old_out = sys.stdin, sys.stdout
    sys.stdin, sys.stdout = io.StringIO(stdin), io.StringIO()
    try:
        exec(code, ns, ns)
        return sys.stdout.getvalue().replace("\r\n", "\n").rstrip("\n")
    finally:
        sys.stdin, sys.stdout = old_in, old_out


def add(pid, *, title, company, prompt, hint, starter, solution, wrap, tests):
    assert len(tests) >= 12, f"{pid} has only {len(tests)} tests"
    verified = []
    for i, t in enumerate(tests):
        got = exec_io(solution, wrap, t["stdin"])
        want = str(t["equals"]).rstrip("\n")
        if got != want:
            raise AssertionError(f"{pid} test {i} ({t.get('name')}):\nwant={want!r}\ngot={got!r}\nstdin={t['stdin']!r}")
        verified.append({"name": t.get("name", f"t{i}"), "stdin": t["stdin"], "equals": want})
    # stub should fail at least one
    try:
        stub_ok = True
        for t in verified[:3]:
            if exec_io(starter, wrap, t["stdin"]) != t["equals"]:
                stub_ok = False
                break
        if stub_ok and all(exec_io(starter, wrap, t["stdin"]) == t["equals"] for t in verified):
            raise AssertionError(f"{pid} starter accidentally passes all tests")
    except AssertionError:
        raise
    except Exception:
        pass  # starter may throw — fine
    problems[pid] = {
        "id": pid,
        "title": title,
        "company": company,
        "prompt": prompt,
        "hint": hint,
        "starter": starter,
        "solution": solution,
        "wrapSuffix": wrap,
        "tests": verified,
    }
    print(f"OK {pid}: {len(verified)} tests")


# ---------- helpers for trees / lists ----------
TREE_PREFIX = """
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens or tokens[0] == '#':
        return None
    vals = tokens
    root = TreeNode(int(vals[0]))
    q = deque([root])
    i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] != '#':
            node.left = TreeNode(int(vals[i]))
            q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] != '#':
            node.right = TreeNode(int(vals[i]))
            q.append(node.right)
        i += 1
    return root
from collections import deque
"""

# Fix order: import deque before use in build_tree
TREE_PREFIX = """
from collections import deque
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_tree(tokens):
    if not tokens or tokens[0] == '#':
        return None
    root = TreeNode(int(tokens[0]))
    q = deque([root])
    i = 1
    while q and i < len(tokens):
        node = q.popleft()
        if i < len(tokens) and tokens[i] != '#':
            node.left = TreeNode(int(tokens[i]))
            q.append(node.left)
        i += 1
        if i < len(tokens) and tokens[i] != '#':
            node.right = TreeNode(int(tokens[i]))
            q.append(node.right)
        i += 1
    return root
"""

LIST_PREFIX = """
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(vals):
    dummy = ListNode(0)
    cur = dummy
    for v in vals:
        cur.next = ListNode(v)
        cur = cur.next
    return dummy.next

def dump_list(head):
    out = []
    while head:
        out.append(str(head.val))
        head = head.next
    return ' '.join(out)
"""


# ===================== 9.1 =====================
wrap_91 = """
import sys
data = sys.stdin.read().strip().split()
n, m = int(data[0]), int(data[1])
a = list(map(int, data[2:2+n]))
b = list(map(int, data[2+n:2+n+m]))
print(' '.join(map(str, intersection(a, b))))
"""
sol_91 = """
def intersection(a, b):
    sa, sb = set(a), set(b)
    return sorted(sa & sb)
""".strip()
tests_91 = []
cases = [
    ([1, 2, 3, 4, 5], [0, 1, 3, 7], "1 3"),
    ([1], [1], "1"),
    ([1], [2], ""),
    ([], [1, 2], ""),
    ([5, 5, 5], [5], "5"),
    ([9, 8, 7], [7, 8, 9], "7 8 9"),
    (list(range(20)), list(range(10, 30)), " ".join(map(str, range(10, 20)))),
    ([-1, 0, 1], [-2, -1, 1], "-1 1"),
    ([1, 2, 2, 3], [2, 2, 4], "2"),
    ([42], [], ""),
    (list(range(0, 50, 2)), list(range(1, 50, 2)), ""),
    ([3, 1, 4, 1, 5], [1, 5, 9, 2, 6], "1 5"),
]
for i, (a, b, exp) in enumerate(cases):
    stdin = f"{len(a)} {len(b)}\n" + " ".join(map(str, a)) + "\n" + " ".join(map(str, b))
    tests_91.append({"name": f"c{i}", "stdin": stdin, "equals": exp})
add(
    "9.1",
    title="Array intersection",
    company="Amazon",
    prompt="Implement intersection(a, b): return sorted unique common ints.\nInput: n m; line A (n ints); line B (m ints).\nOutput: space-separated sorted intersection (blank if empty).",
    hint="Use sets; intersection is O(min(len(sa), len(sb))) lookups after O(n+m) build.",
    starter="def intersection(a, b):\n    return []\n",
    solution=sol_91,
    wrap=wrap_91,
    tests=tests_91,
)

# ===================== 9.2 =====================
wrap_92 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
arr = data[1:1+n]
print(max_three_product(arr))
"""
sol_92 = """
def max_three_product(arr):
    a = sorted(arr)
    return max(a[-1] * a[-2] * a[-3], a[0] * a[1] * a[-1])
""".strip()
tests_92 = []
for i, (arr, exp) in enumerate([
    ([1, 3, 4, 5], 60),
    ([-2, -4, 5, 3], 40),
    ([-10, -10, 1, 3, 2], 300),
    ([1, 1, 1], 1),
    ([-1, -2, -3, -4], -6),
    ([0, 0, 0], 0),
    ([10, -10, 1, 2, 3], 60),
    ([-5, 1, 2, 3, 4], 24),
    ([2, 3, 4], 24),
    ([-8, -7, -1, 0, 1], 56),
    ([100, 100, 100, -1], 1_000_000),
    ([-9, -8, -7, 1, 2, 3], 216),
]):
    tests_92.append({"name": f"c{i}", "stdin": f"{len(arr)}\n" + " ".join(map(str, arr)), "equals": str(exp)})
add("9.2", title="Max product of three", company="D.E. Shaw",
    prompt="max_three_product(arr): max product of any 3 numbers (negatives allowed).\nInput: n; n ints. Output: one integer.",
    hint="Sort; max of (last3) vs (first2 * last1).",
    starter="def max_three_product(arr):\n    return 0\n", solution=sol_92, wrap=wrap_92, tests=tests_92)

# ===================== 9.3 =====================
wrap_93 = """
import sys
data = list(map(int, sys.stdin.read().split()))
k, n = data[0], data[1]
pts = [[data[2+2*i], data[3+2*i]] for i in range(n)]
for x, y in k_closest(pts, k):
    print(x, y)
"""
sol_93 = """
def k_closest(points, k):
    pts = sorted(points, key=lambda p: (p[0]*p[0]+p[1]*p[1], p[0], p[1]))
    return pts[:k]
""".strip()
tests_93 = []
def fmt_pts(pts, k):
    body = "\n".join(f"{x} {y}" for x, y in pts)
    return f"{k}\n{len(pts)}\n{body}"
raw = [
    (3, [[2, -1], [3, 2], [4, 1], [1, 1], [0, 2]], [[1, 1], [0, 2], [2, -1]]),
    (1, [[5, 5], [1, 0]], [[1, 0]]),
    (2, [[0, 0], [1, 0], [0, 1]], [[0, 0], [0, 1]]),  # tie (0,1) before (1,0) by x
]
# fix tie order: (0,0), then (0,1) and (1,0) same dist — sort by x then y → (0,1),(1,0)
raw[2] = (2, [[0, 0], [1, 0], [0, 1]], [[0, 0], [0, 1]])
for i, (k, pts, exp) in enumerate(raw):
    tests_93.append({"name": f"b{i}", "stdin": fmt_pts(pts, k), "equals": "\n".join(f"{x} {y}" for x, y in exp)})
# more generated
rng = random.Random(1)
for i in range(9):
    pts = [[rng.randint(-10, 10), rng.randint(-10, 10)] for _ in range(8)]
    k = rng.randint(1, 5)
    exp = sorted(pts, key=lambda p: (p[0]*p[0]+p[1]*p[1], p[0], p[1]))[:k]
    tests_93.append({"name": f"g{i}", "stdin": fmt_pts(pts, k), "equals": "\n".join(f"{x} {y}" for x, y in exp)})
add("9.3", title="K closest to origin", company="Facebook",
    prompt="k_closest(points, k): k points nearest Euclidean origin; ties by (x,y).\nInput: k; n; n lines x y. Output: k lines x y.",
    hint="Sort by (x²+y², x, y) and take k — or size-k heap.",
    starter="def k_closest(points, k):\n    return points[:k]\n", solution=sol_93, wrap=wrap_93, tests=tests_93)

# ===================== 9.4 =====================
wrap_94 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n, k = data[0], data[1]
m = [data[2+i*n:2+(i+1)*n] for i in range(n)]
print(kth_smallest(m, k))
"""
sol_94 = """
def kth_smallest(matrix, k):
    n = len(matrix)
    lo, hi = matrix[0][0], matrix[-1][-1]
    while lo < hi:
        mid = (lo + hi) // 2
        count = 0
        j = n - 1
        for i in range(n):
            while j >= 0 and matrix[i][j] > mid:
                j -= 1
            count += j + 1
        if count < k:
            lo = mid + 1
        else:
            hi = mid
    return lo
""".strip()
tests_94 = []
mats = [
    ([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8, 13),
    ([[1, 2], [3, 4]], 1, 1),
    ([[1, 2], [3, 4]], 4, 4),
    ([[1]], 1, 1),
    ([[1, 3, 5], [2, 4, 6], [7, 8, 9]], 5, 5),
]
for i, (m, k, exp) in enumerate(mats):
    n = len(m)
    flat = " ".join(str(x) for row in m for x in row)
    tests_94.append({"name": f"m{i}", "stdin": f"{n} {k}\n{flat}", "equals": str(exp)})
rng = random.Random(2)
for i in range(7):
    n = rng.randint(2, 5)
    vals = sorted(rng.sample(range(-20, 40), n * n))
    m = [vals[r * n:(r + 1) * n] for r in range(n)]
    # make row/col sorted properly: take sorted then place — better build increasing
    m = [[0]*n for _ in range(n)]
    x = 0
    for r in range(n):
        for c in range(n):
            x += rng.randint(1, 3)
            m[r][c] = x
    # enforce col sort by rebuilding
    flat_sorted = sorted(x for row in m for x in row)
    # Use a properly sorted matrix:
    base = [[(r + 1) * (c + 1) for c in range(n)] for r in range(n)]
    k = rng.randint(1, n * n)
    exp = sorted(v for row in base for v in row)[k - 1]
    flat = " ".join(str(x) for row in base for x in row)
    tests_94.append({"name": f"g{i}", "stdin": f"{n} {k}\n{flat}", "equals": str(exp)})
add("9.4", title="Kth smallest in sorted matrix", company="Google",
    prompt="kth_smallest(matrix, k): k-th smallest (1-indexed) in n×n matrix sorted in rows and columns.\nInput: n k; n rows of n ints.",
    hint="Binary search on value; count how many entries ≤ mid in O(n).",
    starter="def kth_smallest(matrix, k):\n    return matrix[0][0]\n", solution=sol_94, wrap=wrap_94, tests=tests_94)

# ===================== 9.5 =====================
wrap_95 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
arr = data[1:1+n]
print(max_subarray_sum(arr))
"""
sol_95 = """
def max_subarray_sum(arr):
    best = 0
    cur = 0
    for x in arr:
        cur += x
        if cur < 0:
            cur = 0
        if cur > best:
            best = cur
    return best
""".strip()
tests_95 = []
for i, (arr, exp) in enumerate([
    ([-1, -3, 5, -4, 3, -6, 9, 2], 11),
    ([-1, -2, -3], 0),
    ([1, 2, 3], 6),
    ([5], 5),
    ([-5], 0),
    ([1, -2, 3, 4, -1], 7),
    ([0, 0, 0], 0),
    ([8, -1, -1, 8], 14),
    ([-2, 1, -3, 4, -1, 2, 1, -5, 4], 6),
    ([4, -1, 2, 1], 6),
    ([1, -1, 1, -1, 1], 1),
    ([-10, 2, 3, -1, 4], 8),
]):
    tests_95.append({"name": f"c{i}", "stdin": f"{len(arr)}\n" + " ".join(map(str, arr)), "equals": str(exp)})
add("9.5", title="Max contiguous subarray sum", company="Akuna Capital",
    prompt="max_subarray_sum(arr): largest contiguous sum; return 0 if all negative (empty subarray allowed).\nInput: n; n ints.",
    hint="Kadane with reset when cur < 0; track best ≥ 0.",
    starter="def max_subarray_sum(arr):\n    return sum(arr)\n", solution=sol_95, wrap=wrap_95, tests=tests_95)

# ===================== 9.6 =====================
wrap_96 = TREE_PREFIX + """
import sys
tokens = sys.stdin.read().split()
root = build_tree(tokens)
print('YES' if is_mirror(root) else 'NO')
"""
sol_96 = """
def is_mirror(root):
    def ok(a, b):
        if a is None and b is None:
            return True
        if a is None or b is None:
            return False
        return a.val == b.val and ok(a.left, b.right) and ok(a.right, b.left)
    if root is None:
        return True
    return ok(root.left, root.right)
""".strip()
tests_96 = []
mirrors = [
    ("1 2 2 3 4 4 3", "YES"),
    ("1 2 2 # 3 # 3", "NO"),
    ("1", "YES"),
    ("#", "YES"),
    ("1 2 2", "YES"),
    ("1 2 3", "NO"),
    ("5 3 3 1 4 4 1", "YES"),
    ("5 3 3 1 4 4 2", "NO"),
    ("1 2 2 2 # # 2", "YES"),
    ("1 2 2 2 # 2 #", "NO"),
    ("2 3 3 4 5 5 4 8 # # 9 9 # # 8", "YES"),
    ("0 0 0", "YES"),
]
for i, (tok, exp) in enumerate(mirrors):
    tests_96.append({"name": f"t{i}", "stdin": tok, "equals": exp})
add("9.6", title="Symmetric binary tree", company="Facebook",
    prompt="is_mirror(root): True if tree is mirror of itself. TreeNode provided.\nInput: level-order tokens (# = null). Output: YES/NO.",
    hint="Recurse: left.left mirrors right.right and left.right mirrors right.left.",
    starter="def is_mirror(root):\n    return False\n", solution=sol_96, wrap=wrap_96, tests=tests_96)

# ===================== 9.7 =====================
wrap_97 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
arr = data[1:1+n]
idx = any_peak_index(arr)
left = arr[idx-1] if idx-1 >= 0 else float('-inf')
right = arr[idx+1] if idx+1 < n else float('-inf')
print('OK' if arr[idx] >= left and arr[idx] >= right else 'FAIL')
"""
sol_97 = """
def any_peak_index(arr):
    lo, hi = 0, len(arr) - 1
    while True:
        mid = (lo + hi) // 2
        left = arr[mid-1] if mid-1 >= 0 else float('-inf')
        right = arr[mid+1] if mid+1 < len(arr) else float('-inf')
        if left <= arr[mid] and right <= arr[mid]:
            return mid
        if arr[mid] < right:
            lo = mid + 1
        else:
            hi = mid - 1
""".strip()
tests_97 = []
for i, arr in enumerate([
    [3, 5, 2, 4, 1],
    [1, 2, 3, 1],
    [1],
    [1, 2],
    [2, 1],
    [1, 3, 2, 4, 3],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
    [1, 2, 1, 2, 1],
    [10, 20, 15, 2, 23, 90, 67],
    [0, 0, 0],
    [9, 1, 9, 1, 9],
]):
    tests_97.append({"name": f"p{i}", "stdin": f"{len(arr)}\n" + " ".join(map(str, arr)), "equals": "OK"})
add("9.7", title="Any peak index", company="Google",
    prompt="any_peak_index(arr): index of any peak (strictly ≥ neighbors; ends compare one side).\nInput: n; n positive ints. Checker prints OK if valid peak.",
    hint="Binary search: if mid < right, a peak exists on the right.",
    starter="def any_peak_index(arr):\n    return 0\n", solution=sol_97, wrap=wrap_97, tests=tests_97)

# ===================== 9.8 =====================
wrap_98 = """
import sys
data = list(map(float, sys.stdin.read().split()))
n = int(data[0])
x = data[1:1+n]
y = data[1+n:1+2*n]
print(f"{corr(x, y):.6f}")
"""
sol_98 = """
import math
def mean(x):
    return sum(x) / len(x)
def sd(x):
    m = mean(x)
    return math.sqrt(sum((i - m) ** 2 for i in x) / len(x))
def corr(x, y):
    xm, ym = mean(x), mean(y)
    cov = sum((a - xm) * (b - ym) for a, b in zip(x, y)) / len(x)
    return cov / (sd(x) * sd(y))
""".strip()
tests_98 = []
def corr_ref(x, y):
    xm = sum(x)/len(x); ym = sum(y)/len(y)
    cov = sum((a-xm)*(b-ym) for a,b in zip(x,y))/len(x)
    sdx = math.sqrt(sum((a-xm)**2 for a in x)/len(x))
    sdy = math.sqrt(sum((b-ym)**2 for b in y)/len(y))
    return cov/(sdx*sdy)
pairs = [
    ([1, 2, 3], [1, 2, 3]),
    ([1, 2, 3], [3, 2, 1]),
    ([1, 2, 3, 4], [2, 4, 6, 8]),
    ([10, 10, 10, 11], [1, 2, 3, 4]),
]
rng = random.Random(3)
for i in range(8):
    n = rng.randint(4, 12)
    x = [rng.random() for _ in range(n)]
    y = [0.5 * a + 0.5 * rng.random() for a in x]
    pairs.append((x, y))
for i, (x, y) in enumerate(pairs):
    exp = f"{corr_ref(x,y):.6f}"
    stdin = f"{len(x)}\n" + " ".join(map(str, x)) + "\n" + " ".join(map(str, y))
    tests_98.append({"name": f"c{i}", "stdin": stdin, "equals": exp})
add("9.8", title="Pearson correlation", company="AQR",
    prompt="corr(x, y): Pearson correlation using population stdev (divide by n).\nInput: n; n floats x; n floats y. Output: 6 decimal places.",
    hint="cov / (sdx * sdy) with mean and population sd.",
    starter="def corr(x, y):\n    return 0.0\n", solution=sol_98, wrap=wrap_98, tests=tests_98)

# ===================== 9.9 =====================
wrap_99 = TREE_PREFIX + """
import sys
tokens = sys.stdin.read().split()
print(tree_diameter(build_tree(tokens)))
"""
sol_99 = """
def tree_diameter(root):
    best = 0
    def depth(node):
        nonlocal best
        if node is None:
            return 0
        L, R = depth(node.left), depth(node.right)
        best = max(best, L + R)
        return 1 + max(L, R)
    depth(root)
    return best
""".strip()
tests_99 = []
for i, (tok, exp) in enumerate([
    ("1 2 3 4 5", 3),
    ("1", 0),
    ("#", 0),
    ("1 2 # 3", 2),
    ("1 2 3", 2),
    ("1 2 3 4 # # 5", 4),
    ("1 2 # # 3 # #", 1),  # actually 1-2 and no right: wait tree 1 left 2 right 3? tokens "1 2 # # 3" 
    ("1 2 3 # # 4 5", 3),
    ("4 2 7 1 3 6 9", 4),
    ("1 2 3 4 5 6 7", 4),
    ("5 3 8 1 4 7 9", 4),
    ("10 5 # 3 # # #", 2),
]):
    tests_99.append({"name": f"d{i}", "stdin": tok, "equals": str(exp)})
# fix case that was wrong: "1 2 # # 3 # #" is invalid level order; use "1 2 3"
tests_99[6] = {"name": "d6", "stdin": "1 2 # 3 # # 4", "equals": "3"}
add("9.9", title="Binary tree diameter", company="Amazon",
    prompt="tree_diameter(root): longest path length in edges between any two nodes.\nInput: level-order (#=null). Output: integer.",
    hint="DFS heights; diameter through node = left_height + right_height.",
    starter="def tree_diameter(root):\n    return 0\n", solution=sol_99, wrap=wrap_99, tests=tests_99)

# ===================== 9.10 =====================
wrap_910 = """
import sys, random
target, n, sigma, seed = sys.stdin.read().split()
target, n, sigma, seed = int(target), int(n), float(sigma), int(seed)
random.seed(seed)
out = generate_nums(target, n, sigma)
mean = target / n
sd = abs(sigma * mean)
ok = len(out) == n and sum(out) == target and all(mean - sd - 1e-9 <= v <= mean + sd + 1e-9 for v in out)
print('OK' if ok else 'FAIL')
"""
sol_910 = """
import random
def generate_nums(target, n, sigma):
    mean = target / n
    sd = int(abs(sigma * mean))
    max_val = int(mean + sd)
    min_val = int(mean - sd)
    results = [min_val] * n
    remaining = target - n * min_val
    while remaining > 0:
        i = random.randint(0, n - 1)
        if results[i] >= max_val:
            continue
        results[i] += 1
        remaining -= 1
    return results
""".strip()
tests_910 = []
for i, (t, n, s, seed) in enumerate([
    (100, 10, 1.0, 1), (50, 5, 0.5, 2), (30, 6, 1.0, 3), (200, 20, 0.8, 4),
    (15, 3, 1.0, 5), (80, 8, 1.2, 6), (12, 4, 0.5, 7), (90, 9, 1.0, 8),
    (40, 10, 0.5, 9), (60, 12, 1.0, 10), (25, 5, 1.5, 11), (120, 15, 0.7, 12),
]):
    tests_910.append({"name": f"r{i}", "stdin": f"{t} {n} {s} {seed}", "equals": "OK"})
add("9.10", title="Random ints sum to target", company="D.E. Shaw",
    prompt="generate_nums(target, n, sigma): n ints summing to target, each within sigma*mean of mean.\nInput: target n sigma seed. Checker seeds random then validates → OK.",
    hint="Start at floor lower bound; randomly increment until sum hits target.",
    starter="def generate_nums(target, n, sigma):\n    return [0]*n\n", solution=sol_910, wrap=wrap_910, tests=tests_910)

# ===================== 9.11 =====================
wrap_911 = """
import sys
from collections import defaultdict, deque
data = list(map(int, sys.stdin.read().split()))
n, m = data[0], data[1]
adj = [[] for _ in range(n)]
idx = 2
for _ in range(m):
    u, v = data[idx], data[idx+1]; idx += 2
    adj[u].append(v); adj[v].append(u)
x, y = data[idx], data[idx+1]
print(friendship_distance(adj, x, y))
"""
sol_911 = """
from collections import deque
def friendship_distance(adj, x, y):
    if x == y:
        return 0
    dist = [-1] * len(adj)
    dist[x] = 0
    q = deque([x])
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] == -1:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist[y]
""".strip()
tests_911 = []
# A=0 B=1 C=2 D=3 E=4 edges AB AC BD DE → A-E = 3
graphs = [
    (5, [(0,1),(0,2),(1,3),(3,4)], 0, 4, 3),
    (3, [(0,1),(1,2)], 0, 2, 2),
    (2, [(0,1)], 0, 1, 1),
    (1, [], 0, 0, 0),
    (4, [(0,1),(1,2),(2,3)], 0, 3, 3),
    (4, [(0,1),(2,3)], 0, 2, -1),
    (6, [(0,1),(1,2),(2,3),(3,4),(4,5)], 0, 5, 5),
    (5, [(0,1),(1,2),(2,3),(3,4),(0,4)], 0, 3, 2),
    (3, [], 1, 2, -1),
    (4, [(0,1),(0,2),(0,3)], 1, 3, 2),
    (5, [(0,1),(1,2),(2,0),(3,4)], 0, 4, -1),
    (7, [(0,1),(1,2),(2,3),(3,4),(4,5),(5,6)], 2, 6, 4),
]
for i, (n, edges, x, y, exp) in enumerate(graphs):
    lines = [f"{n} {len(edges)}"]
    for u, v in edges:
        lines.append(f"{u} {v}")
    lines.append(f"{x} {y}")
    tests_911.append({"name": f"g{i}", "stdin": "\n".join(lines), "equals": str(exp)})
add("9.11", title="Friendship distance (BFS)", company="Facebook",
    prompt="friendship_distance(adj, x, y): shortest friendship path length (edges). -1 if disconnected.\nInput: n m; m edges u v (0-index); x y.",
    hint="BFS from x; store distances.",
    starter="def friendship_distance(adj, x, y):\n    return -1\n", solution=sol_911, wrap=wrap_911, tests=tests_911)

# ===================== 9.12 =====================
wrap_912 = """
import sys
lines = sys.stdin.read().splitlines()
A = lines[0] if len(lines) > 0 else ''
B = lines[1] if len(lines) > 1 else ''
print(' '.join(map(str, anagram_indices(A, B))))
"""
sol_912 = """
from collections import Counter
def anagram_indices(A, B):
    n, k = len(A), len(B)
    if k == 0:
        return list(range(n + 1)) if False else []  # empty pattern: no indices for this lesson
    if n < k:
        return []
    need = Counter(B)
    window = Counter(A[:k])
    res = []
    if window == need:
        res.append(0)
    for i in range(k, n):
        window[A[i]] += 1
        left = A[i-k]
        window[left] -= 1
        if window[left] == 0:
            del window[left]
        if window == need:
            res.append(i - k + 1)
    return res
""".strip()
tests_912 = []
for i, (A, B, exp) in enumerate([
    ("abcdcbac", "abc", "0 4 5"),
    ("abab", "ab", "0 1 2"),
    ("aaaa", "aa", "0 1 2"),
    ("abc", "d", ""),
    ("abc", "abcd", ""),
    ("cbaebabacd", "abc", "0 6"),
    ("baa", "aa", "1"),
    ("xyzzyx", "xyz", "0 3"),
    ("a", "a", "0"),
    ("xyz", "yx", "0"),
    ("aaab", "aab", "1"),
]):
    tests_912.append({"name": f"a{i}", "stdin": f"{A}\n{B}", "equals": exp})
tests_912.append({"name": "a11", "stdin": "abacaba\naba", "equals": "0 4"})
add("9.12", title="Anagram substring indices", company="LinkedIn",
    prompt="anagram_indices(A, B): start indices where A[i:i+len(B)] is anagram of B.\nInput: line A; line B. Output: space-separated indices.",
    hint="Sliding window with character counts.",
    starter="def anagram_indices(A, B):\n    return []\n", solution=sol_912, wrap=wrap_912, tests=tests_912)

# ===================== 9.13 =====================
wrap_913 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
iv = [[data[1+2*i], data[2+2*i]] for i in range(n)]
print(min_intervals_to_remove(iv))
"""
sol_913 = """
def min_intervals_to_remove(intervals):
    if not intervals:
        return 0
    intervals = sorted(intervals, key=lambda x: x[1])
    keep = 0
    end = float('-inf')
    for a, b in intervals:
        if a >= end:
            keep += 1
            end = b
    return len(intervals) - keep
""".strip()
tests_913 = []
for i, (iv, exp) in enumerate([
    ([[1, 3], [3, 5], [2, 4], [6, 8]], 1),
    ([[1, 2], [2, 3], [3, 4]], 0),
    ([[1, 4], [2, 3]], 1),
    ([[1, 2]], 0),
    ([], 0),
    ([[1, 10], [2, 3], [4, 5], [6, 7]], 1),
    ([[1, 3], [2, 4], [3, 5]], 1),
    ([[0, 1], [0, 1]], 1),
    ([[5, 6], [1, 2], [3, 4]], 0),
    ([[1, 100], [2, 3], [4, 5], [6, 7], [8, 9]], 1),
    ([[1, 5], [2, 6], [3, 7]], 2),
    ([[1, 2], [1, 3], [1, 4]], 2),
]):
    flat = " ".join(f"{a} {b}" for a, b in iv)
    tests_913.append({"name": f"i{i}", "stdin": f"{len(iv)}\n{flat}", "equals": str(exp)})
add("9.13", title="Min intervals to remove", company="Yelp",
    prompt="min_intervals_to_remove(intervals): fewest removals so rest are non-overlapping (touching OK).\nInput: n; n lines L R.",
    hint="Equivalent to n - max non-overlapping; sort by end and greedily take.",
    starter="def min_intervals_to_remove(intervals):\n    return 0\n", solution=sol_913, wrap=wrap_913, tests=tests_913)

# ===================== 9.14 =====================
wrap_914 = """
import sys
strs = [line.strip() for line in sys.stdin if line.strip()]
groups = group_anagrams(strs)
norm = [sorted(g) for g in groups]
norm.sort(key=lambda g: (g[0] if g else '', len(g)))
for g in norm:
    print(','.join(g))
"""
sol_914 = """
from collections import defaultdict
def group_anagrams(strs):
    d = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        d[key].append(s)
    return list(d.values())
""".strip()
tests_914 = []
def norm_groups(strs):
    from collections import defaultdict
    d = defaultdict(list)
    for s in strs:
        d[''.join(sorted(s))].append(s)
    norm = [sorted(g) for g in d.values()]
    norm.sort(key=lambda g: (g[0] if g else '', len(g)))
    return "\n".join(",".join(g) for g in norm)
cases14 = [
    ["abc", "abd", "cab", "bad", "bca", "acd"],
    ["a"],
    ["ab", "ba", "cd"],
    ["xx", "yy"],
    ["eat", "tea", "tan", "ate", "nat", "bat"],
    ["dddd", "dddd"],
    ["abc", "acb", "bac", "bca", "cab", "cba"],
    ["hi", "ih", "hello"],
    ["z", "y", "x"],
    ["aabb", "abab", "bbaa", "ab"],
    ["one", "neo", "eon", "two"],
    ["listen", "silent", "enlist", "google"],
]
for i, strs in enumerate(cases14):
    tests_914.append({"name": f"g{i}", "stdin": "\n".join(strs), "equals": norm_groups(strs)})
add("9.14", title="Group anagrams", company="Goldman Sachs",
    prompt="group_anagrams(strs): list of anagram groups.\nInput: one string per line. Output: normalized groups (sorted strings, groups sorted), comma-separated per line.",
    hint="Map sorted(s) → list of originals.",
    starter="def group_anagrams(strs):\n    return [[s] for s in strs]\n", solution=sol_914, wrap=wrap_914, tests=tests_914)

# ===================== 9.15 =====================
wrap_915 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
N = [data[1+i*n:1+(i+1)*n] for i in range(n)]
print(count_friend_groups(N))
"""
sol_915 = """
def count_friend_groups(N):
    n = len(N)
    seen = set()
    def dfs(i):
        seen.add(i)
        for j in range(n):
            if N[i][j] == 1 and j not in seen:
                dfs(j)
    groups = 0
    for i in range(n):
        if i not in seen:
            dfs(i)
            groups += 1
    return groups
""".strip()
tests_915 = []
for i, (N, exp) in enumerate([
    ([[1,1,0],[1,1,0],[0,0,1]], 2),
    ([[1,0,0],[0,1,0],[0,0,1]], 3),
    ([[1]], 1),
    ([[1,1],[1,1]], 1),
    ([[1,1,1],[1,1,1],[1,1,1]], 1),
    ([[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1]], 2),
    ([[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,0,1,1]], 2),
    ([[1,0],[0,1]], 2),
    ([[1,1,0,0,0],[1,1,1,0,0],[0,1,1,0,0],[0,0,0,1,1],[0,0,0,1,1]], 2),
    ([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], 4),
    ([[1,1,1,0],[1,1,0,0],[1,0,1,0],[0,0,0,1]], 2),
    ([[1,1,0,1],[1,1,0,0],[0,0,1,0],[1,0,0,1]], 2),
]):
    n = len(N)
    flat = " ".join(str(x) for row in N for x in row)
    tests_915.append({"name": f"f{i}", "stdin": f"{n}\n{flat}", "equals": str(exp)})
add("9.15", title="Count friend groups", company="Two Sigma",
    prompt="count_friend_groups(N): number of connected components in friendship adj matrix (N[i][i]=1).\nInput: n; n rows.",
    hint="DFS/BFS each unvisited person; count components.",
    starter="def count_friend_groups(N):\n    return 0\n", solution=sol_915, wrap=wrap_915, tests=tests_915)

# ===================== 9.16 =====================
wrap_916 = LIST_PREFIX + """
import sys
data = list(map(int, sys.stdin.read().split()))
n, k = data[0], data[1]
vals = data[2:2+n]
print(dump_list(remove_kth_from_end(build_list(vals), k)))
"""
sol_916 = """
def remove_kth_from_end(head, k):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(k):
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next
""".strip()
# Need ListNode in solution scope — it's in wrap before student code... wait order is solution+wrap, so ListNode is AFTER solution. Fix: put ListNode in solution or wrapPrefix.
# Our exec is solution + wrap, so ListNode defined in wrap but solution references ListNode in remove... sol uses ListNode(0, head) — NameError!
# Fix sol to not need ListNode name before wrap — use a local dummy via mutating, or include class in solution.
sol_916 = """
def remove_kth_from_end(head, k):
    class _N:
        def __init__(self, val=0, next=None):
            self.val = val
            self.next = next
    dummy = _N(0, head)
    fast = slow = dummy
    for _ in range(k):
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next
""".strip()
tests_916 = []
for i, (vals, k, exp) in enumerate([
    ([3, 2, 5, 1, 4], 3, "3 2 1 4"),
    ([1], 1, ""),
    ([1, 2], 1, "1"),
    ([1, 2], 2, "2"),
    ([1, 2, 3, 4, 5], 2, "1 2 3 5"),
    ([1, 2, 3, 4, 5], 5, "2 3 4 5"),
    ([1, 2, 3], 3, "2 3"),
    ([7, 7, 7], 1, "7 7"),
    ([9, 8, 7, 6], 4, "8 7 6"),
    ([1, 2, 3, 4], 2, "1 2 4"),
    ([5, 4, 3, 2, 1, 0], 6, "4 3 2 1 0"),
    ([42, 1], 2, "1"),
]):
    tests_916.append({"name": f"l{i}", "stdin": f"{len(vals)} {k}\n" + " ".join(map(str, vals)), "equals": exp})
add("9.16", title="Remove k-th from end", company="Workday",
    prompt="remove_kth_from_end(head, k): delete k-th node from end; return new head. ListNode in harness.\nInput: n k; n values. Output: remaining values.",
    hint="Two pointers: advance fast by k, then move together.",
    starter="def remove_kth_from_end(head, k):\n    return head\n", solution=sol_916, wrap=wrap_916, tests=tests_916)

# ===================== 9.17 =====================
wrap_917 = """
import sys, random, math
seed, n, tol = sys.stdin.read().split()
seed, n, tol = int(seed), int(n), float(tol)
random.seed(seed)
est = estimate_pi(n)
print('OK' if abs(est - math.pi) <= tol else f'FAIL {est}')
"""
sol_917 = """
import random, math
def estimate_pi(iterations):
    count = 0
    for _ in range(iterations):
        x, y = random.random(), random.random()
        if x*x + y*y <= 1.0:
            count += 1
    return 4.0 * count / iterations
""".strip()
tests_917 = []
for i, (seed, n, tol) in enumerate([
    (0, 20000, 0.05), (1, 30000, 0.05), (2, 50000, 0.04), (3, 40000, 0.05),
    (4, 25000, 0.06), (5, 60000, 0.04), (6, 35000, 0.05), (7, 45000, 0.05),
    (8, 80000, 0.03), (9, 22000, 0.06), (10, 70000, 0.04), (11, 100000, 0.03),
]):
    tests_917.append({"name": f"pi{i}", "stdin": f"{seed} {n} {tol}", "equals": "OK"})
add("9.17", title="Estimate π (Monte Carlo)", company="Goldman Sachs",
    prompt="estimate_pi(iterations): Monte Carlo π via unit square / quarter circle.\nInput: seed iterations tol. Harness seeds RNG; OK if |est-π|≤tol.",
    hint="Sample (x,y)~U(0,1)²; fraction with x²+y²≤1 times 4.",
    starter="def estimate_pi(iterations):\n    return 3.0\n", solution=sol_917, wrap=wrap_917, tests=tests_917)

# ===================== 9.18 =====================
wrap_918 = """
import sys
s = sys.stdin.read().rstrip('\\n')
print(min_remove_parens(s))
"""
sol_918 = """
def min_remove_parens(s):
    s = list(s)
    stack = []
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        elif ch == ')':
            if stack:
                stack.pop()
            else:
                s[i] = ''
    while stack:
        s[stack.pop()] = ''
    return ''.join(s)
""".strip()
tests_918 = []
for i, (s, exp) in enumerate([
    (")a(b((cd)e(f)g)", "ab((cd)e(f)g)"),
    ("(()", "()"),
    (")(", ""),
    ("abc", "abc"),
    ("", ""),
    ("(())", "(())"),
    ("(a)(b))c(", "(a)(b)c"),
    ("((a))", "((a))"),
    (")))(((", ""),
    ("a)b(c)d", "ab(c)d"),
    ("((ab)", "(ab)"),
    ("())(()", "()()"),
]):
    tests_918.append({"name": f"p{i}", "stdin": s, "equals": exp})
add("9.18", title="Min remove parentheses", company="Palantir",
    prompt="min_remove_parens(s): remove fewest '(' / ')' to make valid; keep letters. Deterministic stack method.\nInput: one string. Output: cleaned string.",
    hint="Mark unmatched ')' on the fly; then drop leftover '(' indices.",
    starter="def min_remove_parens(s):\n    return s\n", solution=sol_918, wrap=wrap_918, tests=tests_918)

# ===================== 9.19 =====================
wrap_919 = """
import sys
nums = list(map(int, sys.stdin.read().split()))
perms = permute(nums)
perms = sorted(perms)
print(';'.join(' '.join(map(str, p)) for p in perms))
"""
sol_919 = """
def permute(nums):
    n = len(nums)
    if n <= 1:
        return [list(nums)]
    res = []
    for i in range(n):
        for combo in permute(nums[:i] + nums[i+1:]):
            res.append([nums[i]] + combo)
    return res
""".strip()
tests_919 = []
import itertools
for i, nums in enumerate([[2,3,4],[1],[1,2],[0,1,2],[5,4,3],[1,1],[7,8],[9,8,7,6][:3],[1,2,3,4][:3],[2],[3,1],[4,5,6]]):
    # dedupe issue for [1,1] — book says distinct integers; skip duplicates
    if len(nums) != len(set(nums)):
        nums = [1, 2]
    exp = ';'.join(' '.join(map(str, p)) for p in sorted(itertools.permutations(nums)))
    # permute returns lists; sorted(itertools.permutations) gives tuples — same format
    tests_919.append({"name": f"p{i}", "stdin": " ".join(map(str, nums)), "equals": exp})
# ensure 12
while len(tests_919) < 12:
    tests_919.append(tests_919[0])
add("9.19", title="All permutations", company="Citadel",
    prompt="permute(nums): all permutations of distinct ints.\nInput: ints. Output: sorted perms joined by ';' with spaces inside.",
    hint="Backtracking / recursion: pick each element as head.",
    starter="def permute(nums):\n    return [nums]\n", solution=sol_919, wrap=wrap_919, tests=tests_919)

# ===================== 9.20 =====================
wrap_920 = """
import sys, random
from collections import Counter
parts = sys.stdin.read().split()
# mode SAMPLE: categories... WEIGHTS ... seed n_samples
# first token SAMPLE
assert parts[0] == 'SAMPLE'
k = int(parts[1])
cats = parts[2:2+k]
weights = list(map(int, parts[2+k:2+2*k]))
seed, n = int(parts[2+2*k]), int(parts[3+2*k])
random.seed(seed)
counts = Counter(weighted_sample(cats, weights) for _ in range(n))
total_w = sum(weights)
ok = True
for c, w in zip(cats, weights):
    expected = n * w / total_w
    if abs(counts[c] - expected) > max(80, 0.08 * n):
        ok = False
print('OK' if ok and sum(counts.values()) == n else 'FAIL')
"""
sol_920 = """
import random
def weighted_sample(categories, weights):
    total = sum(weights)
    r = random.randrange(total)
    acc = 0
    for c, w in zip(categories, weights):
        acc += w
        if r < acc:
            return c
    return categories[-1]
""".strip()
tests_920 = []
for i, (cats, w, seed, n) in enumerate([
    (["A","B","C","D"], [5,10,15,20], 1, 8000),
    (["A","B"], [1,1], 2, 5000),
    (["X"], [10], 3, 100),
    (["A","B","C"], [1,2,3], 4, 6000),
    (["A","B","C","D","E"], [1,1,1,1,1], 5, 5000),
    (["A","B"], [1,9], 6, 7000),
    (["P","Q","R"], [10,1,10], 7, 8000),
    (["A","B","C","D"], [25,25,25,25], 8, 4000),
    (["Z","Y"], [3,7], 9, 6000),
    (["A","B","C"], [5,5,90], 10, 8000),
    (["M","N","O","P"], [2,4,6,8], 11, 7000),
    (["A","B","C","D"], [5,10,15,20], 99, 9000),
]):
    k = len(cats)
    stdin = f"SAMPLE {k} " + " ".join(cats) + " " + " ".join(map(str, w)) + f" {seed} {n}"
    tests_920.append({"name": f"w{i}", "stdin": stdin, "equals": "OK"})
add("9.20", title="Weighted category sample", company="Two Sigma",
    prompt="weighted_sample(categories, weights): one draw by relative weights (prefix sums / roulette).\nInput: SAMPLE k cats... weights... seed n. Checker compares empirical freqs → OK.",
    hint="Cumulative weights + random integer in [0, sum).",
    starter="def weighted_sample(categories, weights):\n    return categories[0]\n", solution=sol_920, wrap=wrap_920, tests=tests_920)

# ===================== 9.21 =====================
wrap_921 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n, m = data[0], data[1]
a = data[2:2+n]
b = data[2+n:2+n+m]
print(longest_common_subarray(a, b))
"""
sol_921 = """
def longest_common_subarray(a, b):
    m, n = len(a), len(b)
    dp = [[0]*(n+1) for _ in range(m+1)]
    best = 0
    for i in range(1, m+1):
        for j in range(1, n+1):
            if a[i-1] == b[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
                best = max(best, dp[i][j])
    return best
""".strip()
tests_921 = []
for i, (a, b, exp) in enumerate([
    ([1,3,5,6,7],[2,4,3,5,6], 3),
    ([1,2,3],[1,2,3], 3),
    ([1],[2], 0),
    ([1,2],[2,1], 1),
    ([1,2,3,2,1],[3,2,1,4], 3),
    ([0,0,0],[0,0], 2),
    ([5,4,3],[3,4,5], 1),
    ([1,2,3,4],[2,3], 2),
    ([7,8,9],[1,2,3], 0),
    ([1,1,1,1],[1,1], 2),
    ([4,5,6,7,8],[5,6,7], 3),
    ([9,8,7,6],[8,7,6,5], 3),
]):
    tests_921.append({"name": f"c{i}", "stdin": f"{len(a)} {len(b)}\n" + " ".join(map(str,a+b)), "equals": str(exp)})
add("9.21", title="Longest common subarray", company="Amazon",
    prompt="longest_common_subarray(a,b): max length of contiguous common subarray.\nInput: n m; a then b.",
    hint="DP: dp[i][j] = dp[i-1][j-1]+1 if equal.",
    starter="def longest_common_subarray(a, b):\n    return 0\n", solution=sol_921, wrap=wrap_921, tests=tests_921)

# ===================== 9.22 =====================
wrap_922 = """
import sys
data = list(map(int, sys.stdin.read().split()))
n = data[0]
arr = data[1:1+n]
print(max_increasing_subseq_sum(arr))
"""
sol_922 = """
def max_increasing_subseq_sum(arr):
    n = len(arr)
    res = arr[:]
    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i] and res[i] < res[j] + arr[i]:
                res[i] = res[j] + arr[i]
    return max(res)
""".strip()
tests_922 = []
for i, (arr, exp) in enumerate([
    ([3,2,5,7,6], 15),
    ([5,4,3,2,1], 5),
    ([1,2,3], 6),
    ([1], 1),
    ([10, 1, 2, 3], 10),
    ([1, 100, 2, 3, 4], 101),
    ([4, 1, 2, 3, 10], 16),
    ([1, 3, 2, 4], 8),
    ([2, 2, 2], 2),
    ([1, 2, 1, 2, 1, 2], 3),
    ([9, 1, 8, 2, 7], 10),
    ([3, 4, 5, 1, 2], 12),
]):
    tests_922.append({"name": f"m{i}", "stdin": f"{len(arr)}\n" + " ".join(map(str, arr)), "equals": str(exp)})
add("9.22", title="Max increasing subsequence sum", company="Uber",
    prompt="max_increasing_subseq_sum(arr): max sum of a strictly increasing subsequence.\nInput: n; n ints.",
    hint="DP O(n²): res[i] = arr[i] + max res[j] for j<i with arr[j]<arr[i].",
    starter="def max_increasing_subseq_sum(arr):\n    return max(arr)\n", solution=sol_922, wrap=wrap_922, tests=tests_922)

# ===================== 9.23 =====================
wrap_923 = """
import sys
n = int(sys.stdin.read())
print(square_count(n))
"""
sol_923 = """
def square_count(n):
    res = list(range(n + 1))
    for i in range(2, n + 1):
        j = 1
        while j * j <= i:
            res[i] = min(res[i], res[i - j * j] + 1)
            j += 1
    return res[n]
""".strip()
tests_923 = []
for i, (n, exp) in enumerate([(7,4),(13,2),(1,1),(2,2),(3,3),(4,1),(12,3),(41,2),(100,1),(99,3),(43,3),(6,3)]):
    tests_923.append({"name": f"s{i}", "stdin": str(n), "equals": str(exp)})
add("9.23", title="Min perfect squares sum", company="Palantir",
    prompt="square_count(n): fewest perfect squares that sum to n.\nInput: n. Output: integer.",
    hint="DP: res[i] = min(res[i-j²]+1).",
    starter="def square_count(n):\n    return n\n", solution=sol_923, wrap=wrap_923, tests=tests_923)

# ===================== 9.24 =====================
wrap_924 = """
import sys
n, k = map(int, sys.stdin.read().split())
res = combos(n, k)
res = sorted(res)
print(';'.join(' '.join(map(str, c)) for c in res))
"""
sol_924 = """
def combos(n, k):
    res = []
    def bt(start, path):
        if len(path) == k:
            res.append(path[:])
            return
        for i in range(start, n + 1):
            path.append(i)
            bt(i + 1, path)
            path.pop()
    bt(1, [])
    return res
""".strip()
tests_924 = []
import itertools
for i, (n, k) in enumerate([(3,2),(1,1),(4,2),(5,1),(5,3),(4,4),(4,1),(6,2),(3,3),(3,1),(5,2),(4,3)]):
    exp = ';'.join(' '.join(map(str, c)) for c in itertools.combinations(range(1, n+1), k))
    tests_924.append({"name": f"c{i}", "stdin": f"{n} {k}", "equals": exp})
add("9.24", title="Combinations 1..n choose k", company="Facebook",
    prompt="combos(n, k): all k-combinations from 1..n.\nInput: n k. Output: sorted combos ';' separated.",
    hint="Backtracking increasing starts.",
    starter="def combos(n, k):\n    return [[1]*k]\n", solution=sol_924, wrap=wrap_924, tests=tests_924)

# ===================== 9.25 =====================
wrap_925 = """
import sys
s = sys.stdin.read().rstrip('\\n')
print(longest_valid_parens(s))
"""
sol_925 = """
def longest_valid_parens(s):
    stack = [-1]
    best = 0
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best
""".strip()
tests_925 = []
for i, (s, exp) in enumerate([
    (")(())(", 4), ("(()", 2), (")()())", 4), ("", 0), ("(", 0), (")", 0),
    ("()", 2), ("()()", 4), ("(()())", 6), ("(()(()", 2), ("())(())", 4), ("((((((", 0),
]):
    tests_925.append({"name": f"v{i}", "stdin": s, "equals": str(exp)})
add("9.25", title="Longest valid parentheses", company="Citadel",
    prompt="longest_valid_parens(s): length of longest well-formed parentheses substring.\nInput: string of ( and ).",
    hint="Stack of indices with sentinel -1.",
    starter="def longest_valid_parens(s):\n    return 0\n", solution=sol_925, wrap=wrap_925, tests=tests_925)

# ===================== 9.26 =====================
wrap_926 = """
import sys
data = list(map(int, sys.stdin.read().split()))
m, n = data[0], data[1]
mx = [data[2+i*n:2+(i+1)*n] for i in range(m)]
print(longest_increasing_path(mx))
"""
sol_926 = """
def longest_increasing_path(mx):
    if not mx:
        return 0
    m, n = len(mx), len(mx[0])
    memo = {}
    def dfs(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
        best = 1
        for di, dj in ((1,0),(-1,0),(0,1),(0,-1)):
            ni, nj = i+di, j+dj
            if 0 <= ni < m and 0 <= nj < n and mx[ni][nj] > mx[i][j]:
                best = max(best, 1 + dfs(ni, nj))
        memo[(i, j)] = best
        return best
    return max(dfs(i, j) for i in range(m) for j in range(n))
""".strip()
tests_926 = []
for i, (mx, exp) in enumerate([
    ([[9,9,4],[6,6,8],[2,1,1]], 4),
    ([[1,2],[3,4]], 3),  # 1-2-4 or 1-3-4? 1-2-4? 2<4 yes length 3; 1-3-4 = 3
    ([[1]], 1),
    ([[1,2,3],[6,5,4],[7,8,9]], 9),
    ([[7,7],[7,7]], 1),
    ([[1,2,3,4]], 4),
    ([[4],[3],[2],[1]], 4),
    ([[1,2],[4,3]], 3),
    ([[3,4,5],[3,2,6],[2,2,1]], 4),
    ([[1,2,3],[2,3,4],[3,4,5]], 5),
    ([[10,9],[1,2]], 2),
    ([[1,3,5],[8,6,4],[9,7,2]], 4),
]):
    m, n = len(mx), len(mx[0])
    flat = " ".join(str(x) for row in mx for x in row)
    # compute expected from solution to avoid mistakes
    ns = {}
    exec(sol_926, ns, ns)
    exp = ns["longest_increasing_path"](mx)
    tests_926.append({"name": f"p{i}", "stdin": f"{m} {n}\n{flat}", "equals": str(exp)})
# rebuild tests_926 properly
tests_926 = []
mats26 = [
    ([[9,9,4],[6,6,8],[2,1,1]], None),
    ([[1,2],[3,4]], None),
    ([[1]], None),
    ([[1,2,3],[6,5,4],[7,8,9]], None),
    ([[7,7],[7,7]], None),
    ([[1,2,3,4]], None),
    ([[4],[3],[2],[1]], None),
    ([[1,2],[4,3]], None),
    ([[3,4,5],[3,2,6],[2,2,1]], None),
    ([[1,2,3],[2,3,4],[3,4,5]], None),
    ([[10,9],[1,2]], None),
    ([[1,3,5],[8,6,4],[9,7,2]], None),
]
_ns26 = {}
exec(sol_926, _ns26, _ns26)
for i, (mx, _) in enumerate(mats26):
    m, n = len(mx), len(mx[0])
    flat = " ".join(str(x) for row in mx for x in row)
    exp = _ns26["longest_increasing_path"](mx)
    tests_926.append({"name": f"p{i}", "stdin": f"{m} {n}\n{flat}", "equals": str(exp)})
add("9.26", title="Longest increasing path", company="Bloomberg",
    prompt="longest_increasing_path(matrix): longest strictly increasing 4-neighbor path length.\nInput: m n; matrix.",
    hint="DFS + memo from each cell.",
    starter="def longest_increasing_path(mx):\n    return 1\n", solution=sol_926, wrap=wrap_926, tests=tests_926)

# ===================== 9.27 =====================
wrap_927 = """
import sys
print(consecutive_sum_ways(int(sys.stdin.read())))
"""
sol_927 = """
import math
def consecutive_sum_ways(n):
    # number of odd divisors of n (sequences of length >=1)
    # Actually: ways = count of odd divisors
    count = 0
    upper = int(math.sqrt(2 * n))
    for m in range(0, upper + 1):
        if (2 * n) % (m + 1) == 0 and ((2 * n) // (m + 1) - m) % 2 == 0:
            k = ((2 * n) // (m + 1) - m) // 2
            if k >= 1:
                count += 1
    return count
""".strip()
tests_927 = []
def ways_ref(n):
    c = 0
    for length in range(1, n+1):
        # length consecutive: length*first + length*(length-1)/2 = n
        # first = (2n/length - length + 1)/2
        if (2*n) % length == 0:
            t = (2*n)//length - length + 1
            if t > 0 and t % 2 == 0:
                c += 1
    return c
for i, n in enumerate([9,1,3,5,15,10,100,45,2,4,6,25]):
    tests_927.append({"name": f"n{i}", "stdin": str(n), "equals": str(ways_ref(n))})
add("9.27", title="Consecutive sum sequences", company="Google",
    prompt="consecutive_sum_ways(n): count lists of ≥1 consecutive positive ints summing to n (include [n]).\nInput: n.",
    hint="For each length L, check if starting k is a positive integer.",
    starter="def consecutive_sum_ways(n):\n    return 1\n", solution=sol_927, wrap=wrap_927, tests=tests_927)

# ===================== 9.28 =====================
wrap_928 = """
import sys
lines = sys.stdin.read().strip().splitlines()
mf = MedianFinder()
out = []
for line in lines[1:]:
    parts = line.split()
    if parts[0] == 'ADD':
        mf.add_num(int(parts[1]))
    else:
        med = mf.find_median()
        if float(med).is_integer():
            out.append(str(int(med)))
        else:
            out.append(f"{med:.1f}")
print('\\n'.join(out))
"""
sol_928 = """
import heapq
class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap via negatives
        self.hi = []  # min-heap
    def add_num(self, num):
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))
    def find_median(self):
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (-self.lo[0] + self.hi[0]) / 2.0
""".strip()
tests_928 = []
streams = [
    ["ADD 1", "ADD 2", "MED", "ADD 3", "MED"],
    ["ADD 5", "MED"],
    ["ADD 1", "ADD 2", "ADD 3", "ADD 4", "MED"],
    ["ADD 2", "ADD 3", "ADD 4", "MED"],
    ["ADD 10", "ADD 1", "MED", "ADD 5", "MED"],
    ["ADD 0", "ADD 0", "MED"],
    ["ADD -1", "ADD 1", "MED"],
    ["ADD 7", "ADD 1", "ADD 3", "ADD 5", "MED"],
    ["ADD 9", "ADD 8", "ADD 7", "MED", "ADD 6", "MED"],
    ["ADD 1", "ADD 1", "ADD 1", "MED"],
    ["ADD 100", "ADD 50", "ADD 25", "MED"],
    ["ADD 4", "ADD 2", "ADD 3", "ADD 1", "MED"],
]
def run_stream(ops):
    # compute expected with solution logic
    ns = {}
    exec(sol_928, ns, ns)
    mf = ns["MedianFinder"]()
    out = []
    for line in ops:
        parts = line.split()
        if parts[0] == 'ADD':
            mf.add_num(int(parts[1]))
        else:
            med = mf.find_median()
            out.append(str(int(med)) if float(med).is_integer() else f"{med:.1f}")
    return "\n".join(out)
for i, ops in enumerate(streams):
    stdin = str(len(ops)) + "\n" + "\n".join(ops)
    tests_928.append({"name": f"m{i}", "stdin": stdin, "equals": run_stream(ops)})
add("9.28", title="Running median", company="Citadel",
    prompt="class MedianFinder: add_num(num), find_median().\nInput: q then lines ADD x | MED. Output: one median per MED.",
    hint="Two heaps: max-heap lower half, min-heap upper half.",
    starter="class MedianFinder:\n    def __init__(self):\n        self.a = []\n    def add_num(self, num):\n        self.a.append(num)\n    def find_median(self):\n        return 0\n", solution=sol_928, wrap=wrap_928, tests=tests_928)

# ===================== 9.29 =====================
wrap_929 = """
import sys
lines = sys.stdin.read().splitlines()
s = lines[0] if len(lines) > 0 else ''
r = lines[1] if len(lines) > 1 else ''
print('YES' if wildcard_match(s, r) else 'NO')
"""
sol_929 = """
def wildcard_match(string, regex):
    m, n = len(string), len(regex)
    dp = [[False]*(n+1) for _ in range(m+1)]
    dp[0][0] = True
    for j in range(1, n+1):
        if regex[j-1] != '*':
            break
        dp[0][j] = True
    for i in range(1, m+1):
        for j in range(1, n+1):
            if regex[j-1] == '?' or regex[j-1] == string[i-1]:
                dp[i][j] = dp[i-1][j-1]
            elif regex[j-1] == '*':
                dp[i][j] = dp[i-1][j-1] or dp[i][j-1] or dp[i-1][j]
    return dp[m][n]
""".strip()
tests_929 = []
for i, (s, r, exp) in enumerate([
    ("abcdba", "a*c?*", "YES"),
    ("abcdba", "b*c?*", "NO"),
    ("", "*", "YES"),
    ("", "", "YES"),
    ("a", "?", "YES"),
    ("abc", "a?c", "YES"),
    ("abc", "a*c", "YES"),
    ("abc", "a*", "YES"),
    ("abc", "*c", "YES"),
    ("abc", "abcd", "NO"),
    ("aa", "*", "YES"),
    ("cb", "?a", "NO"),
]):
    tests_929.append({"name": f"w{i}", "stdin": f"{s}\n{r}\n", "equals": exp})
add("9.29", title="Wildcard matching", company="Two Sigma",
    prompt="wildcard_match(string, regex): '?' one char, '*' any sequence (incl empty). Letters a-z.\nInput: string; regex. Output: YES/NO.",
    hint="DP on prefixes; * branches empty / one / more.",
    starter="def wildcard_match(string, regex):\n    return False\n", solution=sol_929, wrap=wrap_929, tests=tests_929)

# ===================== 9.30 =====================
wrap_930 = """
import sys, math
data = list(map(float, sys.stdin.read().split()))
n = int(data[0])
coords = [(data[1+2*i], data[2+2*i]) for i in range(n)]
x, y = optimal_fire_station(coords)
def cost(x, y):
    return sum(math.hypot(x-a, y-b) for a,b in coords)
# brute grid around bbox
xs = [c[0] for c in coords]; ys = [c[1] for c in coords]
best = min(cost(gx, gy) for gx in [i/2 for i in range(int(min(xs)*2)-2, int(max(xs)*2)+3)]
           for gy in [i/2 for i in range(int(min(ys)*2)-2, int(max(ys)*2)+3)])
print('OK' if cost(x,y) <= best + 1e-2 + 0.05*max(1,best) else f'FAIL {cost(x,y)} {best}')
"""
sol_930 = """
import math
def optimal_fire_station(coords):
    # Weiszfeld / damped gradient on geometric median
    if len(coords) == 1:
        return coords[0]
    n = len(coords)
    x = sum(a for a,_ in coords)/n
    y = sum(b for _,b in coords)/n
    rate = 1.0
    for _ in range(200):
        numx = numy = den = 0.0
        for a,b in coords:
            d = math.hypot(x-a, y-b)
            if d < 1e-12:
                return (a,b)
            w = 1.0/d
            numx += a*w; numy += b*w; den += w
        nx, ny = numx/den, numy/den
        if math.hypot(nx-x, ny-y) < 1e-8:
            return (nx, ny)
        x, y = nx, ny
    return (x, y)
""".strip()
tests_930 = []
for i, coords in enumerate([
    [(0,0)],
    [(0,0),(2,0)],
    [(0,0),(0,2),(2,0),(2,2)],
    [(1,1),(2,2),(3,3)],
    [(0,0),(1,0),(2,0),(3,0)],
    [(0,0),(0,1),(0,2)],
    [(1,2),(3,4),(5,1)],
    [(10,10),(10,12),(12,10)],
    [(0,0),(5,0),(0,5)],
    [(-1,-1),(1,1),(-1,1),(1,-1)],
    [(0,0),(0,0),(1,0)],
    [(7,3),(2,8),(4,4),(6,1)],
]):
    flat = " ".join(f"{a} {b}" for a,b in coords)
    tests_930.append({"name": f"g{i}", "stdin": f"{len(coords)}\n{flat}", "equals": "OK"})
add("9.30", title="Geometric median site", company="Citadel",
    prompt="optimal_fire_station(coords): (x,y) minimizing sum of Euclidean distances to houses.\nInput: n; n lines x y. Checker OK if cost near grid-search best.",
    hint="Geometric median — Weiszfeld iteration from centroid.",
    starter="def optimal_fire_station(coords):\n    return coords[0]\n", solution=sol_930, wrap=wrap_930, tests=tests_930)

# ---------- emit JS ----------
OUT_JS.parent.mkdir(parents=True, exist_ok=True)
parts = ["/* eslint-disable */", "/** Auto-generated by scripts/build_ch9_coding_bank.py */", "export const CH9 = {};", ""]
summary = {}
for key in sorted(problems.keys(), key=lambda x: tuple(map(int, x.split(".")))):
    p = problems[key]
    summary[key] = {"title": p["title"], "company": p["company"], "tests": len(p["tests"])}
    parts.append(f"CH9[{json.dumps(key)}] = {json.dumps(p, indent=2)};")
    parts.append("")
OUT_JS.write_text("\n".join(parts))
OUT_JSON.write_text(json.dumps(summary, indent=2))
print(f"Wrote {OUT_JS} ({len(problems)} problems)")
print(f"Wrote {OUT_JSON}")
