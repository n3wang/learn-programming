#!/usr/bin/env python3
"""Balance MultipleChoice wrong-option lengths with claim-specific elaboration."""

from __future__ import annotations

import importlib.util
import pathlib
import re
import sys

spec = importlib.util.spec_from_file_location(
    "fq", pathlib.Path(__file__).parent / "fix-scalable-quiz-bias.py"
)
fq = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fq)

ROOT = (
    pathlib.Path(__file__).resolve().parents[1] / "fundamentals" / "scalable-systems"
)
DIRS = [
    "designing-data-intensive-applications",
    "derived-data",
    "distributed-data",
    "distributed-systems",
]
SKIP = {"02-hash-indexes-and-lsm-trees.mdx"}


def strip_boilerplate(s: str) -> str:
    return fq.normalize_claim(fq.unwrap_claim(s))


def word_count(s: str) -> int:
    return len(re.findall(r"\w+", s))


def expand_list_items(wrong: str, correct: str) -> str:
    m = re.match(r"^(.*),\s+and\s+(.*)$", wrong.strip())
    if not m:
        return wrong
    head, tail = m.group(1), m.group(2)
    items = [p.strip() for p in head.split(",")]
    items.append(tail.strip())
    if len(items) < 3:
        return wrong

    cm = re.match(r"^(.*),\s+and\s+(.*)$", correct.strip())
    if not cm:
        return wrong
    c_head, c_tail = cm.group(1), cm.group(2)
    c_items = [p.strip() for p in c_head.split(",")]
    c_items.append(c_tail.strip())
    if len(c_items) != len(items):
        return wrong

    out_items = []
    for w_i, c_i in zip(items, c_items):
        w_w = word_count(w_i)
        c_w = word_count(c_i)
        if w_w >= c_w - 1:
            out_items.append(w_i)
            continue
        # Only pad list items when the wrong line is already a parallel inventory.
        if "set of" in c_i.lower() and "set of" not in w_i.lower():
            extra = " in the graph record"
        elif "collection of" in c_i.lower():
            extra = " on the node"
        elif "unique identifier" in c_i.lower():
            extra = " for the entity"
        elif "primary key" in w_i.lower():
            extra = " in a normalized row"
        elif "foreign key" in w_i.lower():
            extra = " between relational tables"
        else:
            extra = ""
        out_items.append((w_i + extra).strip() if extra else w_i)

    return ", ".join(out_items[:-1]) + ", and " + out_items[-1]


def keyword_elaborations(wrong: str, idx: int) -> list[str]:
    w = wrong.strip().rstrip(".")
    low = w.lower()
    out: list[str] = []

    rules: list[tuple[str, list[str]]] = [
        (
            "row number",
            [
                "A row number, a table name, a primary key, and a foreign key — modeling a vertex as one relational row instead of an explicit graph node with adjacency",
                "A surrogate row id, a backing table name, a primary key column, and a foreign key column — the usual SQL encoding, not the four graph-native vertex parts",
            ],
        ),
        (
            "name, a type, a parent",
            [
                "A display name, a node type tag, a parent reference, and a byte size — as if vertices were files in a hierarchical catalog rather than graph entities",
            ],
        ),
        (
            "label, a source",
            [
                "An edge label, a source id, a destination id, and a numeric weight — describing a weighted edge while omitting incoming and outgoing edge sets on the vertex",
            ],
        ),
        (
            "prevent duplicate edges",
            [
                "To stop duplicate edges via a uniqueness rule on (tail, label, head), instead of indexing both endpoints so adjacency walks stay cheap in either direction",
                "To enforce at most one edge between the same pair, which is a constraint concern rather than the bidirectional traversal reason both vertex columns get indexes",
            ],
        ),
        (
            "smaller on disk",
            [
                "To shrink the edges table footprint by slimming columns, not to pay a second index so queries can walk outgoing tail links and incoming head links without scanning",
            ],
        ),
        (
            "foreign key column to be indexed",
            [
                "Because SQL style guides index every foreign key by default, even when the graph model indexes tail and head specifically for forward and backward edge traversal",
            ],
        ),
        (
            "separate database",
            [
                "Because each relationship type would live in its own database instance, instead of sharing one graph where edge labels keep types distinguishable",
            ],
        ),
        (
            "do not allow more than one relationship",
            [
                "Because property graphs permit only a single relationship label globally, which would forbid mixing married-to, born-in, and lives-in edges in one store",
            ],
        ),
        (
            "infer relationship types",
            [
                "Because vertex property values would imply edge semantics automatically, removing the need for explicit relationship labels on edges",
            ],
        ),
        (
            "sql table name and column",
            [
                "A SQL table identifier and a column identifier — treating Cypher names as relational catalog objects rather than bound graph vertices in a WITHIN edge",
            ],
        ),
        (
            "unrelated graphs",
            [
                "Two disconnected graph instances with no shared vertices — not the tail and head locations linked by one directed WITHIN relationship",
            ],
        ),
        (
            "two edges connecting a single vertex",
            [
                "A pair of distinct edges both incident on one vertex — not one WITHIN edge whose tail is Idaho and whose head is USA",
            ],
        ),
        (
            "recursive cte",
            [
                "Because recursive CTEs are mandatory whenever a query touches more than one table, even when join depth is fixed and known upfront",
            ],
        ),
        (
            "does not support the join",
            [
                "Because PostgreSQL omits JOIN syntax entirely, forcing every multi-table query to use nested subqueries instead of explicit joins",
            ],
        ),
        (
            "cannot represent graph",
            [
                "Because relational tables cannot store vertices and edges at all, so any graph-shaped question must use a non-SQL engine",
            ],
        ),
        (
            "deprecated and should never",
            [
                "That recursive CTEs are obsolete syntax teams must avoid, rather than a standard way to express variable-length traversals in SQL",
            ],
        ),
        (
            "functionally different from their sql",
            [
                "That Cypher and SQL answers diverge in result sets by default, instead of expressing the same predicate with different join depth",
            ],
        ),
        (
            "poorly designed language",
            [
                "That SQL is inherently badly designed, rather than optimized for fixed-depth joins instead of open-ended graph hops",
            ],
        ),
        (
            "identical kinds of facts",
            [
                "That (Lucy, bornIn, Idaho) and (Lucy, age, 33) encode the same kind of fact, ignoring vertex versus literal objects",
            ],
        ),
        (
            "never contain primitive",
            [
                "That triple objects must always be other vertices, so numeric literals like 33 could never appear as property values",
            ],
        ),
        (
            "both properties in both",
            [
                "That Idaho and 33 are both literal properties on Lucy, with no vertex node standing in for a geographic place",
            ],
        ),
        (
            "entirely unrelated concepts",
            [
                "That RDF documents and triple-store engines share no data model, despite both using subject-predicate-object tuples",
            ],
        ),
        (
            "anything other than publishing rdf",
            [
                "That triple-stores exist solely to publish RDF on the public web, not to back ordinary application databases",
            ],
        ),
        (
            "only works on the public internet",
            [
                "That SPARQL endpoints require a public internet deployment, blocking internal triple-store use behind a firewall",
            ],
        ),
        (
            "permanently deletes the matched",
            [
                "That a Datalog rule removes matching facts from storage, instead of deriving new facts when the right-hand side matches",
            ],
        ),
        (
            "sql join automatically",
            [
                "That the engine rewrites each Datalog rule into a fixed SQL join plan, rather than composing predicates through rule calls",
            ],
        ),
        (
            "halts the query with an error",
            [
                "That rule evaluation aborts on the first failed match, instead of continuing to derive facts from successful matches",
            ],
        ),
        (
            "does not support variables",
            [
                "That Datalog forbids logic variables entirely, so rules cannot bind names across clauses",
            ],
        ),
        (
            "exactly one predicate per query",
            [
                "That each Datalog program may reference only one predicate name, preventing rules from calling other rules",
            ],
        ),
        (
            "cannot be written declaratively",
            [
                "That Datalog queries must be written as imperative loops, not as declarative rule sets",
            ],
        ),
        (
            "no real performance benefit",
            [
                "That scheduling map tasks on HDFS block replicas saves no network or disk bandwidth compared with remote reads",
            ],
        ),
        (
            "entire dataset rather than just one partition",
            [
                "That every mapper re-reads the full input directory, instead of processing only the split block assigned to that task",
            ],
        ),
        (
            "exact machine storing the data",
            [
                "That HDFS mandates running compute only on the block's origin node with zero fallback, rather than preferring local replicas when possible",
            ],
        ),
        (
            "only applies to numeric keys",
            [
                "That shuffle partitioning and sorting apply only to numeric reducer keys, not to string URLs or other key types",
            ],
        ),
        (
            "no data movement actually occurs",
            [
                "That mappers keep all partition files local and reducers read them in place, with no copy over the network during shuffle",
            ],
        ),
        (
            "completely unrelated step",
            [
                "That the shuffle name refers to an unrelated scheduling phase, not to hash partition, sort, and copy to reducers",
            ],
        ),
        (
            "incapable of writing to a directory more than once",
            [
                "That MapReduce forbids multiple write passes to one output directory, rather than invalidating partial output after failures",
            ],
        ),
        (
            "prevent jobs from running in parallel",
            [
                "That workflow engines ban all parallel job execution, instead of waiting on dependencies while independent branches run concurrently",
            ],
        ),
        (
            "does not actually exist",
            [
                "That downstream jobs may consume output while upstream tasks are still running, without risk of reading failed partial results",
            ],
        ),
    ]

    for needle, variants in rules:
        if needle in low:
            out.extend(variants)

    base = w
    if base.startswith("Because "):
        tail = base[8:]
        out.append(because_followup(tail, idx))
    elif base.startswith("To "):
        out.append(to_followup(base, idx))
    elif base.startswith("That "):
        out.append(
            f"{base}, judging languages by syntax length instead of by how well the data model fits the query"
        )
    elif re.match(r"^(No|Yes)\b", base):
        out.append(
            f"{base}, folding together two ideas that stay separate when explaining how this model is used in apps"
        )
    if len(out) > 1:
        out = out[idx::] + out[:idx]
    return out


def because_followup(tail: str, idx: int) -> str:
    low = tail.lower()
    if "separate database" in low:
        return (
            f"Because {tail}, forcing each relationship label into its own database instead of coexisting labeled edges in one graph"
        )
    if "do not allow" in low or "not allow" in low:
        return (
            f"Because {tail}, which would forbid mixing multiple relationship labels inside a single property graph"
        )
    if "infer" in low:
        return (
            f"Because {tail}, as if edge semantics could be read off vertex fields without explicit relationship labels"
        )
    if "which does not explain the behavior" in tail:
        return f"Because {tail}"
    return f"Because {tail}, which does not explain the behavior the question is asking about"


def to_followup(base: str, idx: int) -> str:
    tails = [
        f"{base}, prioritizing that goal over the access pattern the design optimizes for",
        f"{base} — a reasonable ops concern, but not why the structure in the question exists",
        f"{base}, when the win comes from a different read or write path than this wording implies",
    ]
    return tails[idx % len(tails)]


def extract_topic(s: str) -> str:
    s = s.strip().rstrip(".")
    for prefix in ("Because ", "To ", "That ", "It ", "The ", "No, ", "Yes, ", "Yes "):
        if s.startswith(prefix):
            s = s[len(prefix) :]
            break
    chunk = s.split(",")[0].split("—")[0].strip()
    if len(chunk) > 72:
        chunk = chunk[:72].rsplit(" ", 1)[0]
    return chunk or s[:40]


def topic_detail(wrong: str, idx: int) -> str:
    topic = extract_topic(wrong)
    variants = [
        f"which stops after «{topic}» and never reaches the mechanism under discussion",
        f"which treats «{topic}» as sufficient without the coordinating step the question names",
        f"as if «{topic}» alone replaced the structure the design actually adds",
    ]
    return variants[idx % len(variants)]


def pick_best(candidates: list[str], target: int) -> str:
    lo, hi = int(target * 0.8), int(target * 1.2)
    seen: set[str] = set()
    uniq: list[str] = []
    for c in candidates:
        c = re.sub(r"\s+", " ", c).strip()
        if not c or c in seen:
            continue
        seen.add(c)
        uniq.append(c)

    in_band = [c for c in uniq if lo <= len(c) <= hi]
    if in_band:
        in_band.sort(key=lambda c: abs(len(c) - target))
        return in_band[0]

    if not uniq:
        return ""

    uniq.sort(key=lambda c: abs(len(c) - target))
    best = uniq[0]
    if len(best) > hi:
        best = best[:hi].rsplit(" ", 1)[0]
    return best


def balance_wrong(wrong: str, correct: str, idx: int) -> str:
    wrong = strip_boilerplate(wrong)
    target = len(correct)
    lo, hi = int(target * 0.8), int(target * 1.2)
    if lo <= len(wrong) <= hi:
        return wrong

    candidates = [wrong, expand_list_items(wrong, correct)]
    candidates.extend(keyword_elaborations(wrong, idx))
    if len(wrong) < int(target * 0.75):
        base = wrong.rstrip(".")
        candidates.append(f"{base} — {topic_detail(wrong, idx)}")
    best = pick_best(candidates, target)
    return best if best else wrong


def process_file(path: pathlib.Path) -> int:
    text = path.read_text(encoding="utf-8")
    if "choices:" not in text:
        return 0

    sites = []
    pos = 0
    while True:
        found = fq.find_choices_block(text, pos)
        if not found:
            break
        c_start, c_end, choices = found
        ans = fq.find_answer(text, c_end)
        if not ans or len(choices) < 2:
            pos = c_end
            continue
        _, a_end, answer = ans
        sites.append((c_start, c_end, choices, answer))
        pos = a_end

    if not sites:
        return 0

    new_text = text
    for c_start, c_end, choices, answer in reversed(sites):
        correct = choices[answer]
        new_choices = []
        wi = 0
        for i, c in enumerate(choices):
            if i == answer:
                new_choices.append(c)
            else:
                new_choices.append(balance_wrong(c, correct, wi))
                wi += 1

        choices_js = ",\n".join(f"        '{fq.js_escape(c)}'" for c in new_choices)
        choices_block = f"choices: [\n{choices_js},\n      ]"
        new_text = new_text[:c_start] + choices_block + new_text[c_end:]

    if new_text != text:
        path.write_text(new_text, encoding="utf-8", newline="\n")
    return len(sites)


def main() -> int:
    total = 0
    paths = []
    for d in DIRS:
        for path in sorted((ROOT / d).glob("*.mdx")):
            if d == "designing-data-intensive-applications" and path.name in SKIP:
                continue
            paths.append(path)
    for path in paths:
        total += process_file(path)
    print("---")
    print(f"question passes: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
