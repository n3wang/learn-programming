#!/usr/bin/env python3
"""Build Chapter-8 SQL interview seeds, verify solutions, emit JS module + expectations."""

from __future__ import annotations

import json
import sqlite3
from datetime import date, datetime, timedelta
from pathlib import Path

OUT_JS = Path(__file__).resolve().parents[1] / "src/components/SqlExercise/ch8/seeds.generated.js"
OUT_JSON = Path(__file__).resolve().parents[1] / "src/components/SqlExercise/ch8/expectations.json"


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return str(v)
    s = str(v).replace("'", "''")
    return f"'{s}'"


def inserts(table, cols, rows):
    lines = []
    for row in rows:
        lines.append(
            f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join(q(x) for x in row)});"
        )
    return "\n".join(lines)


def run(seed: str, sql: str) -> str:
    conn = sqlite3.connect(":memory:")
    conn.executescript(seed)
    cur = conn.cursor()
    cur.execute(sql.strip().rstrip(";"))
    if cur.description is None:
        return str(conn.total_changes)
    lines = []
    for row in cur.fetchall():
        lines.append("|".join("" if v is None else str(v) for v in row))
    return "\n".join(lines)


def preview_tables(schema_and_data: str, names: list[str]):
    conn = sqlite3.connect(":memory:")
    conn.executescript(schema_and_data)
    tables = []
    for name in names:
        cur = conn.execute(f"PRAGMA table_info({name})")
        cols = [r[1] for r in cur.fetchall()]
        rows = [list(r) for r in conn.execute(f"SELECT * FROM {name}")]
        tables.append({"name": name, "columns": cols, "rows": rows})
    return tables


problems = {}

# ---------- 8.1 events CTR ----------
events_rows = []
eid = 1
# app 1: 20 impressions, 5 clicks in 2019; app 2: 16 imp, 4 clicks; app 3: 10 imp 0 clicks
# plus some 2018/2020 noise
for app, imps, clicks in [(1, 20, 5), (2, 16, 4), (3, 10, 0)]:
    for i in range(imps):
        events_rows.append((app, eid, "impression", f"2019-03-{(i % 28) + 1:02d} 10:00:00"))
        eid += 1
    for i in range(clicks):
        events_rows.append((app, eid, "click", f"2019-06-{(i % 28) + 1:02d} 11:00:00"))
        eid += 1
for i in range(5):
    events_rows.append((1, eid, "impression", f"2018-01-{i+1:02d} 10:00:00"))
    eid += 1
    events_rows.append((2, eid, "click", f"2020-02-{i+1:02d} 10:00:00"))
    eid += 1

seed_81 = (
    "CREATE TABLE events (app_id INTEGER, event_id INTEGER, event_type TEXT, timestamp TEXT);\n"
    + inserts("events", ["app_id", "event_id", "event_type", "timestamp"], events_rows)
)
# Note: book uses event_id for type string; we use event_type column for clarity + keep event_id as id
# Actually book schema: event_id is the type string ("impression","click"). Confusing naming.
# Re-read: app_id, event_id string ("impression","click"), timestamp
# So event_id IS the event type. I'll match book: event_id TEXT as type.

events_rows2 = []
eid = 1
for app, imps, clicks in [(1, 20, 5), (2, 16, 4), (3, 10, 0)]:
    for i in range(imps):
        events_rows2.append((app, "impression", f"2019-03-{(i % 28) + 1:02d} 10:00:00"))
    for i in range(clicks):
        events_rows2.append((app, "click", f"2019-06-{(i % 28) + 1:02d} 11:00:00"))
for i in range(5):
    events_rows2.append((1, "impression", f"2018-01-{i+1:02d} 10:00:00"))
    events_rows2.append((2, "click", f"2020-02-{i+1:02d} 10:00:00"))

seed_81 = (
    "CREATE TABLE events (app_id INTEGER, event_id TEXT, timestamp TEXT);\n"
    + inserts("events", ["app_id", "event_id", "timestamp"], events_rows2)
)
sol_81 = """
SELECT
  app_id,
  ROUND(
    1.0 * SUM(CASE WHEN event_id = 'click' THEN 1 ELSE 0 END)
      / SUM(CASE WHEN event_id = 'impression' THEN 1 ELSE 0 END),
    4
  ) AS ctr
FROM events
WHERE timestamp >= '2019-01-01' AND timestamp < '2020-01-01'
GROUP BY app_id
ORDER BY app_id
""".strip()
problems["8.1"] = {"seed": seed_81, "tables": ["events"], "solution": sol_81, "title": "CTR by app (2019)"}

# ---------- 8.2 trades + users ----------
users = []
cities = ["NYC", "SF", "LA", "CHI", "SEA", "BOS", "AUS", "DEN"]
for i in range(1, 25):
    users.append((i, cities[(i - 1) % len(cities)], f"u{i}@ex.com", "2020-01-01"))
# completed orders: NYC 8, SF 5, LA 4, CHI 3, others 1-2
trades = []
oid = 1
city_counts = {"NYC": 8, "SF": 5, "LA": 4, "CHI": 3, "SEA": 2, "BOS": 2, "AUS": 1, "DEN": 1}
user_by_city = {c: [u[0] for u in users if u[1] == c] for c in cities}
for city, n in city_counts.items():
    for k in range(n):
        uid = user_by_city[city][k % len(user_by_city[city])]
        trades.append((oid, uid, 10.0, 1, "complete", f"2021-01-{(k % 28)+1:02d}"))
        oid += 1
# cancelled noise
for k in range(10):
    trades.append((oid, users[k][0], 5.0, 1, "cancelled", f"2021-02-{k+1:02d}"))
    oid += 1

seed_82 = (
    "CREATE TABLE users (user_id INTEGER, city TEXT, email TEXT, signup_date TEXT);\n"
    "CREATE TABLE trades (order_id INTEGER, user_id INTEGER, price REAL, quantity INTEGER, status TEXT, timestamp TEXT);\n"
    + inserts("users", ["user_id", "city", "email", "signup_date"], users)
    + "\n"
    + inserts("trades", ["order_id", "user_id", "price", "quantity", "status", "timestamp"], trades)
)
sol_82 = """
SELECT u.city, COUNT(DISTINCT t.order_id) AS num_orders
FROM trades t
JOIN users u ON t.user_id = u.user_id
WHERE t.status = 'complete'
GROUP BY u.city
ORDER BY num_orders DESC, u.city
LIMIT 3
""".strip()
problems["8.2"] = {"seed": seed_82, "tables": ["trades", "users"], "solution": sol_82, "title": "Top cities by completed orders"}

# ---------- 8.3 viewership ----------
view_rows = []
vid = 1
# 12 laptop, 8 phone, 7 tablet
for device, n in [("laptop", 12), ("phone", 8), ("tablet", 7)]:
    for i in range(n):
        view_rows.append((vid, device, f"2021-05-{(i % 28)+1:02d} 12:00:00"))
        vid += 1
seed_83 = (
    "CREATE TABLE viewership (user_id INTEGER, device_type TEXT, view_time TEXT);\n"
    + inserts("viewership", ["user_id", "device_type", "view_time"], view_rows)
)
sol_83 = """
SELECT
  SUM(CASE WHEN device_type = 'laptop' THEN 1 ELSE 0 END) AS laptop_views,
  SUM(CASE WHEN device_type IN ('phone', 'tablet') THEN 1 ELSE 0 END) AS mobile_views
FROM viewership
""".strip()
problems["8.3"] = {"seed": seed_83, "tables": ["viewership"], "solution": sol_83, "title": "Laptop vs mobile views"}

# ---------- 8.4 cumulative spend ----------
# product A dates Jan1-5, product B Jan1-4
tt = []
tid = 1
for d, spends in [
    ("2021-01-01", [("A", 10), ("B", 5)]),
    ("2021-01-02", [("A", 20), ("B", 15)]),
    ("2021-01-03", [("A", 5), ("B", 25)]),
    ("2021-01-04", [("A", 30), ("B", 10)]),
    ("2021-01-05", [("A", 10)]),
]:
    for pid, spend in spends:
        for _ in range(1):
            tt.append((tid, 1, pid, spend, d))
            tid += 1
# extra rows for size
for i in range(10):
    tt.append((tid, 2, "C", 3.0 + i, f"2021-02-{(i % 28)+1:02d}"))
    tid += 1

seed_84 = (
    "CREATE TABLE total_trans (order_id INTEGER, user_id INTEGER, product_id TEXT, spend REAL, trans_date TEXT);\n"
    + inserts("total_trans", ["order_id", "user_id", "product_id", "spend", "trans_date"], tt)
)
sol_84 = """
SELECT
  trans_date,
  product_id,
  SUM(spend) OVER (
    PARTITION BY product_id
    ORDER BY trans_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS cum_spend
FROM total_trans
ORDER BY product_id, trans_date
""".strip()
problems["8.4"] = {"seed": seed_84, "tables": ["total_trans"], "solution": sol_84, "title": "Cumulative spend by product"}

# ---------- 8.5 top customers by product count with spend>=1000 ----------
ut = []
tid = 1
# users 1-3 qualify: spend high, many products; user 4 spend high few products; user 5 low spend many
specs = [
    # (user, n_products, spend_each)
    (1, 12, 100),  # 1200
    (2, 11, 100),
    (3, 10, 100),
    (4, 9, 120),
    (5, 8, 130),
    (6, 7, 150),
    (7, 6, 200),
    (8, 5, 250),
    (9, 15, 50),  # 750 - exclude
    (10, 14, 40),  # exclude
]
for uid, nprod, each in specs:
    for p in range(nprod):
        ut.append((tid, uid, f"P{p}", each, f"2021-03-{(p % 28)+1:02d}"))
        tid += 1
seed_85 = (
    "CREATE TABLE user_transactions (order_id INTEGER, user_id INTEGER, product_id TEXT, spend REAL, trans_date TEXT);\n"
    + inserts("user_transactions", ["order_id", "user_id", "product_id", "spend", "trans_date"], ut)
)
sol_85 = """
SELECT user_id, COUNT(product_id) AS num_products
FROM user_transactions
GROUP BY user_id
HAVING SUM(spend) >= 1000
ORDER BY num_products DESC, user_id
LIMIT 10
""".strip()
problems["8.5"] = {"seed": seed_85, "tables": ["user_transactions"], "solution": sol_85, "title": "Top spenders by product count"}

# ---------- 8.6 tweet histogram 2020 ----------
tweets = []
tw = 1
# users tweet counts in 2020: two users with 1, three with 2, one with 5, plus 2019 noise
for uid, n in [(1, 1), (2, 1), (3, 2), (4, 2), (5, 2), (6, 5), (7, 3), (8, 4)]:
    for i in range(n):
        tweets.append((tw, uid, f"msg{tw}", f"2020-{(i % 12)+1:02d}-15 10:00:00"))
        tw += 1
for i in range(6):
    tweets.append((tw, 9, "old", f"2019-01-{i+1:02d} 10:00:00"))
    tw += 1
seed_86 = (
    "CREATE TABLE tweets (tweet_id INTEGER, user_id INTEGER, msg TEXT, tweet_date TEXT);\n"
    + inserts("tweets", ["tweet_id", "user_id", "msg", "tweet_date"], tweets)
)
sol_86 = """
SELECT num_tweets AS tweet_bucket, COUNT(*) AS num_users
FROM (
  SELECT user_id, COUNT(*) AS num_tweets
  FROM tweets
  WHERE tweet_date >= '2020-01-01' AND tweet_date < '2021-01-01'
  GROUP BY user_id
) t
GROUP BY num_tweets
ORDER BY num_tweets
""".strip()
problems["8.6"] = {"seed": seed_86, "tables": ["tweets"], "solution": sol_86, "title": "Tweet-count histogram (2020)"}

# ---------- 8.7 same product multiple days ----------
purchases = []
pid = 1
# users who qualify: 1 (product A on 2 days), 2 (B on 3 days), 3 (C twice same day - NO), 4 no
for day in ["2021-01-01", "2021-01-02"]:
    purchases.append((pid, 1, 100, 1, 10.0, f"{day} 10:00:00"))
    pid += 1
for day in ["2021-01-01", "2021-01-03", "2021-01-05"]:
    purchases.append((pid, 2, 200, 1, 10.0, f"{day} 11:00:00"))
    pid += 1
purchases.append((pid, 3, 300, 1, 10.0, "2021-01-01 09:00:00")); pid += 1
purchases.append((pid, 3, 300, 1, 10.0, "2021-01-01 18:00:00")); pid += 1
purchases.append((pid, 4, 400, 1, 10.0, "2021-01-01 10:00:00")); pid += 1
# filler
for i in range(12):
    purchases.append((pid, 10 + i, 500 + i, 1, 5.0, f"2021-02-{(i % 28)+1:02d} 10:00:00"))
    pid += 1
seed_87 = (
    "CREATE TABLE purchases (purchase_id INTEGER, user_id INTEGER, product_id INTEGER, quantity INTEGER, price REAL, purchase_time TEXT);\n"
    + inserts(
        "purchases",
        ["purchase_id", "user_id", "product_id", "quantity", "price", "purchase_time"],
        purchases,
    )
)
sol_87 = """
SELECT COUNT(DISTINCT user_id) AS num_users
FROM (
  SELECT
    user_id,
    RANK() OVER (
      PARTITION BY user_id, product_id
      ORDER BY DATE(purchase_time)
    ) AS purchase_no
  FROM purchases
) t
WHERE purchase_no = 2
""".strip()
problems["8.7"] = {"seed": seed_87, "tables": ["purchases"], "solution": sol_87, "title": "Repeat product on multiple days"}

# ---------- 8.8 duplicate job listings ----------
jobs = []
jid = 1
# company 1 has duplicate title+desc; company 2 unique; company 3 duplicate; company 4 unique
jobs.append((jid, 1, "Eng", "Build stuff", "2021-01-01")); jid += 1
jobs.append((jid, 1, "Eng", "Build stuff", "2021-01-02")); jid += 1
jobs.append((jid, 2, "PM", "Manage", "2021-01-01")); jid += 1
jobs.append((jid, 3, "DS", "Model", "2021-01-01")); jid += 1
jobs.append((jid, 3, "DS", "Model", "2021-02-01")); jid += 1
jobs.append((jid, 4, "Design", "UI", "2021-01-01")); jid += 1
for i in range(12):
    jobs.append((jid, 10 + i, f"Role{i}", f"Desc{i}", f"2021-03-{(i % 28)+1:02d}"))
    jid += 1
seed_88 = (
    "CREATE TABLE job_listings (job_id INTEGER, company_id INTEGER, title TEXT, description TEXT, post_date TEXT);\n"
    + inserts("job_listings", ["job_id", "company_id", "title", "description", "post_date"], jobs)
)
sol_88 = """
WITH ranked AS (
  SELECT
    company_id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, title, description
      ORDER BY post_date
    ) AS rn
  FROM job_listings
)
SELECT COUNT(DISTINCT company_id) AS num_companies
FROM ranked
WHERE rn > 1
""".strip()
problems["8.8"] = {"seed": seed_88, "tables": ["job_listings"], "solution": sol_88, "title": "Companies with duplicate jobs"}

# ---------- 8.9 first transaction >= 50 ----------
ut9 = []
tid = 1
# user 1 first 60 qualify; 2 first 40 no; 3 first 50 qualify; 4 first 100 then smaller
for uid, first, rest in [(1, 60, [10, 10]), (2, 40, [80]), (3, 50, [20]), (4, 100, [5, 5]), (5, 55, [])]:
    day = 1
    ut9.append((tid, 1, uid, first, f"2021-04-{day:02d}"))
    tid += 1
    day += 1
    for s in rest:
        ut9.append((tid, 1, uid, s, f"2021-04-{day:02d}"))
        tid += 1
        day += 1
for i in range(10):
    ut9.append((tid, 2, 20 + i, 30, f"2021-05-{(i % 28)+1:02d}"))
    tid += 1
seed_89 = (
    "CREATE TABLE user_transactions (transaction_id INTEGER, product_id INTEGER, user_id INTEGER, spend REAL, transaction_date TEXT);\n"
    + inserts(
        "user_transactions",
        ["transaction_id", "product_id", "user_id", "spend", "transaction_date"],
        ut9,
    )
)
sol_89 = """
WITH purchase_num AS (
  SELECT
    user_id,
    spend,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY transaction_date ASC) AS rownum
  FROM user_transactions
)
SELECT user_id
FROM purchase_num
WHERE rownum = 1 AND spend >= 50
ORDER BY user_id
""".strip()
problems["8.9"] = {"seed": seed_89, "tables": ["user_transactions"], "solution": sol_89, "title": "First purchase ≥ $50"}

# ---------- 8.10 7-day rolling average ----------
tw10 = []
tid = 1
# user 1: tweets on consecutive days Jan 1-10 (1 per day)
for d in range(1, 11):
    tw10.append((tid, 1, f"m{d}", f"2021-01-{d:02d} 10:00:00"))
    tid += 1
# user 2: fewer days
for d in [1, 2, 3, 8, 9]:
    tw10.append((tid, 2, f"n{d}", f"2021-01-{d:02d} 12:00:00"))
    tid += 1
for i in range(8):
    tw10.append((tid, 3, "x", f"2021-02-{(i % 28)+1:02d} 09:00:00"))
    tid += 1
seed_810 = (
    "CREATE TABLE tweets (tweet_id INTEGER, user_id INTEGER, msg TEXT, tweet_date TEXT);\n"
    + inserts("tweets", ["tweet_id", "user_id", "msg", "tweet_date"], tw10)
)
sol_810 = """
WITH tweet_counts AS (
  SELECT
    user_id,
    DATE(tweet_date) AS tweet_date,
    COUNT(*) AS num_tweets
  FROM tweets
  GROUP BY user_id, DATE(tweet_date)
)
SELECT
  user_id,
  tweet_date,
  ROUND(AVG(num_tweets) OVER (
    PARTITION BY user_id
    ORDER BY tweet_date
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ), 2) AS rolling_avg_7d
FROM tweet_counts
ORDER BY user_id, tweet_date
""".strip()
problems["8.10"] = {"seed": seed_810, "tables": ["tweets"], "solution": sol_810, "title": "7-day rolling tweet average"}

# ---------- 8.11 third transaction ----------
tx = []
# each of users 1-5 have 4+ transactions; user 6 has 2 only
for uid in range(1, 6):
    for d in range(1, 5):
        tx.append((uid, 10.0 * d, f"2021-06-{d:02d}"))
for d in range(1, 3):
    tx.append((6, 5.0, f"2021-06-{d:02d}"))
for uid in range(7, 12):
    for d in range(1, 4):
        tx.append((uid, 1.0, f"2021-07-{d:02d}"))
seed_811 = (
    "CREATE TABLE transactions (user_id INTEGER, spend REAL, transaction_date TEXT);\n"
    + inserts("transactions", ["user_id", "spend", "transaction_date"], tx)
)
sol_811 = """
WITH nums AS (
  SELECT
    user_id,
    spend,
    transaction_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY transaction_date) AS trans_num
  FROM transactions
)
SELECT user_id, spend, transaction_date
FROM nums
WHERE trans_num = 3
ORDER BY user_id
""".strip()
problems["8.11"] = {"seed": seed_811, "tables": ["transactions"], "solution": sol_811, "title": "Third transaction per user"}

# ---------- 8.12 top 3 products per category 2020 ----------
ps = []
tid = 1
# cat 1: products spends 100,90,80,70 -> top 1,2,3
# cat 2: 50,40,30,20
for cat, spends in [(1, [100, 90, 80, 70]), (2, [50, 40, 30, 20])]:
    for i, s in enumerate(spends, start=1):
        ps.append((tid, cat, i, 1, s, "2020-05-01"))
        tid += 1
# 2021 noise
ps.append((tid, 1, 99, 1, 999, "2021-01-01")); tid += 1
for i in range(10):
    ps.append((tid, 3, i + 1, 1, 5.0 + i, "2020-08-01"))
    tid += 1
seed_812 = (
    "CREATE TABLE product_spend (transaction_id INTEGER, category_id INTEGER, product_id INTEGER, user_id INTEGER, spend REAL, transaction_date TEXT);\n"
    + inserts(
        "product_spend",
        ["transaction_id", "category_id", "product_id", "user_id", "spend", "transaction_date"],
        ps,
    )
)
sol_812 = """
WITH product_category_spend AS (
  SELECT
    product_id,
    category_id,
    SUM(spend) AS total_product_spend
  FROM product_spend
  WHERE transaction_date >= '2020-01-01' AND transaction_date < '2021-01-01'
  GROUP BY product_id, category_id
),
top_spend AS (
  SELECT
    p.*,
    RANK() OVER (
      PARTITION BY category_id
      ORDER BY total_product_spend DESC
    ) AS rnk
  FROM product_category_spend p
)
SELECT product_id, category_id, total_product_spend, rnk
FROM top_spend
WHERE rnk <= 3
ORDER BY category_id, rnk, product_id
""".strip()
problems["8.12"] = {"seed": seed_812, "tables": ["product_spend"], "solution": sol_812, "title": "Top 3 products per category (2020)"}

# ---------- 8.13 latest transaction date buckets ----------
ut13 = []
tid = 1
# users with latest dates: on 2021-01-10: users 1,2 each buy 2 products that day as latest
# on 2021-01-09: user 3 buys 1
# user 1 also has older
for uid, dates in [
    (1, ["2021-01-01", "2021-01-10", "2021-01-10"]),
    (2, ["2021-01-05", "2021-01-10"]),
    (3, ["2021-01-09"]),
    (4, ["2021-01-08", "2021-01-08", "2021-01-08"]),
]:
    for i, d in enumerate(dates):
        ut13.append((tid, 100 + uid * 10 + i, uid, 5.0, d))
        tid += 1
for i in range(8):
    ut13.append((tid, 200 + i, 20 + i, 1.0, f"2021-02-{(i % 28)+1:02d}"))
    tid += 1
seed_813 = (
    "CREATE TABLE user_transactions (transaction_id INTEGER, product_id INTEGER, user_id INTEGER, spend REAL, transaction_date TEXT);\n"
    + inserts(
        "user_transactions",
        ["transaction_id", "product_id", "user_id", "spend", "transaction_date"],
        ut13,
    )
)
sol_813 = """
WITH latest AS (
  SELECT
    transaction_date,
    user_id,
    product_id,
    RANK() OVER (
      PARTITION BY user_id
      ORDER BY DATE(transaction_date) DESC
    ) AS days_rank
  FROM user_transactions
)
SELECT
  transaction_date,
  COUNT(DISTINCT user_id) AS num_users,
  COUNT(product_id) AS total_products
FROM latest
WHERE days_rank = 1
GROUP BY transaction_date
ORDER BY transaction_date DESC
""".strip()
problems["8.13"] = {"seed": seed_813, "tables": ["user_transactions"], "solution": sol_813, "title": "Users/products by latest purchase date"}

# ===================== MEDIUM =====================

# ---------- 8.22 topics not in top 100 ----------
# Simplify: top topics ranking <= 3 as "popular" for small seed, but match problem with rank<=100
# With few topics, rank 1-3 are "top"; users who only follow non-top
topics = [(i, i, "2021-01-01") for i in range(1, 21)]  # topic_id, ranking
# users followed before/on 2021-01-01
follows = []
# user 1 follows only topic 15 (rank 15) - not in top 3 if we use rank<=3 for test... 
# For real problem rank<=100, all 20 are in top 100. Need more topics.
topics = [(i, i, "2021-01-01") for i in range(1, 120)]  # 119 topics
# top 100: rankings 1..100
# user 1 follows topic 110 only -> qualifies
# user 2 follows topic 5 -> does not
# user 3 follows topic 105 and existed
# user 4 followed after date - exclude from universe? "existing users on 2021-01-01" = follow_date <= 
follows = [
    (1, 110, "2020-12-01"),
    (2, 5, "2020-06-01"),
    (3, 105, "2020-01-01"),
    (3, 106, "2020-02-01"),
    (4, 110, "2021-06-01"),  # after - not in existing set for MINUS left side if we filter follow_date<=
]
# add filler follows
for u in range(5, 20):
    follows.append((u, (u % 50) + 1, "2020-03-01"))

seed_822 = (
    "CREATE TABLE topic_rankings (topic_id INTEGER, ranking INTEGER, ranking_date TEXT);\n"
    "CREATE TABLE user_topics (user_id INTEGER, topic_id INTEGER, follow_date TEXT);\n"
    + inserts("topic_rankings", ["topic_id", "ranking", "ranking_date"], topics)
    + "\n"
    + inserts("user_topics", ["user_id", "topic_id", "follow_date"], follows)
)
sol_822 = """
WITH top_topics AS (
  SELECT topic_id
  FROM topic_rankings
  WHERE ranking_date = '2021-01-01' AND ranking <= 100
)
SELECT DISTINCT user_id
FROM user_topics
WHERE follow_date <= '2021-01-01'
EXCEPT
SELECT DISTINCT u.user_id
FROM user_topics u
JOIN top_topics t ON u.topic_id = t.topic_id
WHERE u.follow_date <= '2021-01-01'
ORDER BY user_id
""".strip()
problems["8.22"] = {"seed": seed_822, "tables": ["user_topics", "topic_rankings"], "solution": sol_822, "title": "Users avoiding top topics"}

# ---------- 8.23 MAU retention month over month ----------
# Actions across months so we can compute MAU who also existed previous month
actions = []
# Jan: users 1,2,3; Feb: 2,3,4 (retention of 2,3 from Jan); Mar: 3,5
for uid, month, day in [
    (1, 1, 5), (2, 1, 6), (3, 1, 7),
    (2, 2, 5), (3, 2, 8), (4, 2, 9),
    (3, 3, 1), (5, 3, 2),
]:
    actions.append((uid, "like", f"2021-{month:02d}-{day:02d} 10:00:00"))
for i in range(12):
    actions.append((10 + i, "sign-in", f"2021-04-{(i % 28)+1:02d} 09:00:00"))

seed_823 = (
    "CREATE TABLE user_actions (user_id INTEGER, event_id TEXT, timestamp TEXT);\n"
    + inserts("user_actions", ["user_id", "event_id", "timestamp"], actions)
)
# Retention definition in book: active this month AND existed last month (EXISTS previous month action)
# Output month + mau count of users active this month who were also active previous month
sol_823 = """
WITH months AS (
  SELECT DISTINCT
    user_id,
    strftime('%Y-%m', timestamp) AS month
  FROM user_actions
)
SELECT
  c.month,
  COUNT(DISTINCT c.user_id) AS mau
FROM months c
WHERE EXISTS (
  SELECT 1
  FROM months p
  WHERE p.user_id = c.user_id
    AND p.month = strftime('%Y-%m', date(c.month || '-01', '-1 month'))
)
GROUP BY c.month
ORDER BY c.month
""".strip()
problems["8.23"] = {"seed": seed_823, "tables": ["user_actions"], "solution": sol_823, "title": "Active user retention by month"}

# ---------- 8.24 session duration ranks ----------
sessions = []
sid = 1
# stream: user1 100, user2 80, user3 50; chat: user2 200, user1 30
for user, stype, dur, day in [
    (1, "stream", 100, 5),
    (2, "stream", 80, 6),
    (3, "stream", 50, 7),
    (2, "chat", 200, 8),
    (1, "chat", 30, 9),
    (3, "chat", 90, 10),
]:
    sessions.append((sid, user, stype, dur, f"2021-01-{day:02d} 10:00:00"))
    sid += 1
# outside window
sessions.append((sid, 1, "stream", 999, "2021-03-01 10:00:00")); sid += 1
for i in range(10):
    sessions.append((sid, 4 + i, "other", 10, f"2021-01-{(10 + i % 15):02d} 11:00:00"))
    sid += 1

seed_824 = (
    "CREATE TABLE sessions (session_id INTEGER, user_id INTEGER, session_type TEXT, duration INTEGER, start_time TEXT);\n"
    + inserts("sessions", ["session_id", "user_id", "session_type", "duration", "start_time"], sessions)
)
sol_824 = """
WITH user_duration AS (
  SELECT
    user_id,
    session_type,
    SUM(duration) AS duration
  FROM sessions
  WHERE start_time >= '2021-01-01' AND start_time < '2021-02-01'
  GROUP BY user_id, session_type
)
SELECT
  user_id,
  session_type,
  duration,
  RANK() OVER (
    PARTITION BY session_type
    ORDER BY duration DESC
  ) AS rank
FROM user_duration
ORDER BY session_type, rank, user_id
""".strip()
problems["8.24"] = {"seed": seed_824, "tables": ["sessions"], "solution": sol_824, "title": "Rank users by session duration"}

# ---------- 8.25 snap send vs open by age ----------
ages = [(1, "18-24"), (2, "18-24"), (3, "25-34"), (4, "25-34"), (5, "35+")]
acts = []
aid = 1
# 18-24: send 30, open 70; 25-34: send 40 open 60; 35+: send 10 open 10
for uid, sends, opens in [(1, 20, 30), (2, 10, 40), (3, 25, 35), (4, 15, 25), (5, 10, 10)]:
    acts.append((aid, uid, "send", float(sends), "2021-01-01")); aid += 1
    acts.append((aid, uid, "open", float(opens), "2021-01-01")); aid += 1
for i in range(10):
    ages.append((10 + i, "18-24"))
    acts.append((aid, 10 + i, "send", 1.0, "2021-01-02")); aid += 1

seed_825 = (
    "CREATE TABLE age_breakdown (user_id INTEGER, age_bucket TEXT);\n"
    "CREATE TABLE activities (activity_id INTEGER, user_id INTEGER, type TEXT, time_spent REAL, activity_date TEXT);\n"
    + inserts("age_breakdown", ["user_id", "age_bucket"], ages)
    + "\n"
    + inserts("activities", ["activity_id", "user_id", "type", "time_spent", "activity_date"], acts)
)
sol_825 = """
WITH time_stats AS (
  SELECT
    a.age_bucket,
    SUM(CASE WHEN act.type = 'send' THEN act.time_spent ELSE 0 END) AS send_timespent,
    SUM(CASE WHEN act.type = 'open' THEN act.time_spent ELSE 0 END) AS open_timespent,
    SUM(act.time_spent) AS total_timespent
  FROM age_breakdown a
  JOIN activities act ON a.user_id = act.user_id
  WHERE act.type IN ('send', 'open')
  GROUP BY a.age_bucket
)
SELECT
  age_bucket,
  ROUND(send_timespent / total_timespent, 4) AS pct_send,
  ROUND(open_timespent / total_timespent, 4) AS pct_open
FROM time_stats
ORDER BY age_bucket
""".strip()
problems["8.25"] = {"seed": seed_825, "tables": ["activities", "age_breakdown"], "solution": sol_825, "title": "Send vs open time by age"}

# ---------- 8.26 most concurrent session ----------
# Session A 10:00-12:00 overlaps B 10:30-11:00, C 11:00-11:30, D 09:00-09:30 (no)
# A should win with 2 concurrent (B and C start during A)
sess = [
    (1, "2021-01-01 10:00:00", "2021-01-01 12:00:00"),
    (2, "2021-01-01 10:30:00", "2021-01-01 11:00:00"),
    (3, "2021-01-01 11:00:00", "2021-01-01 11:30:00"),
    (4, "2021-01-01 09:00:00", "2021-01-01 09:30:00"),
    (5, "2021-01-01 10:15:00", "2021-01-01 10:45:00"),
]
for i in range(10):
    sess.append((10 + i, f"2021-01-02 {10+i%5}:00:00", f"2021-01-02 {11+i%5}:00:00"))
seed_826 = (
    "CREATE TABLE sessions (session_id INTEGER, start_time TEXT, end_time TEXT);\n"
    + inserts("sessions", ["session_id", "start_time", "end_time"], sess)
)
sol_826 = """
SELECT
  s1.session_id,
  COUNT(s2.session_id) AS concurrents
FROM sessions s1
JOIN sessions s2
  ON s1.session_id != s2.session_id
 AND s2.start_time BETWEEN s1.start_time AND s1.end_time
GROUP BY s1.session_id
ORDER BY concurrents DESC, s1.session_id
LIMIT 1
""".strip()
problems["8.26"] = {"seed": seed_826, "tables": ["sessions"], "solution": sol_826, "title": "Most concurrent session"}

# ---------- 8.27 top-rated businesses ----------
reviews = []
rid = 1
# biz 1: all 4-5 top; biz 2: has 3 not top; biz 3: all 5 top; biz 4: 4,4 top
for biz, stars in [(1, [4, 5, 5]), (2, [5, 3, 4]), (3, [5, 5]), (4, [4, 4])]:
    for s in stars:
        reviews.append((biz, 1, "ok", s, "2021-01-01"))
        rid += 1
for i in range(10):
    reviews.append((10 + i, 1, "x", 5 if i % 2 == 0 else 2, "2021-02-01"))
seed_827 = (
    "CREATE TABLE reviews (business_id INTEGER, user_id INTEGER, review_text TEXT, review_stars INTEGER, review_date TEXT);\n"
    + inserts("reviews", ["business_id", "user_id", "review_text", "review_stars", "review_date"], reviews)
)
sol_827 = """
WITH min_review AS (
  SELECT business_id, MIN(review_stars) AS min_stars
  FROM reviews
  GROUP BY business_id
)
SELECT ROUND(100.0 * SUM(CASE WHEN min_stars >= 4 THEN 1 ELSE 0 END) / COUNT(*), 2) AS top_places_pct
FROM min_review
""".strip()
problems["8.27"] = {"seed": seed_827, "tables": ["reviews"], "solution": sol_827, "title": "Top-rated business percentage"}

# ---------- 8.28 odd/even measurements ----------
meas = []
mid = 1
# day1: values 1,2,3,4 -> odd sum 1+3=4, even 2+4=6
# day2: 10,20,30 -> odd 10+30=40, even 20
for day, vals in [("2021-01-01", [1, 2, 3, 4]), ("2021-01-02", [10, 20, 30])]:
    for i, v in enumerate(vals):
        meas.append((mid, float(v), f"{day} {10+i}:00:00"))
        mid += 1
for i in range(10):
    meas.append((mid, float(i), f"2021-01-03 {10+i}:00:00"))
    mid += 1
seed_828 = (
    "CREATE TABLE measurements (measurement_id INTEGER, measurement_value REAL, measurement_time TEXT);\n"
    + inserts("measurements", ["measurement_id", "measurement_value", "measurement_time"], meas)
)
sol_828 = """
WITH numbered AS (
  SELECT
    DATE(measurement_time) AS measurement_day,
    measurement_value,
    ROW_NUMBER() OVER (
      PARTITION BY DATE(measurement_time)
      ORDER BY measurement_time
    ) AS measurement_count
  FROM measurements
)
SELECT
  measurement_day,
  SUM(CASE WHEN measurement_count % 2 != 0 THEN measurement_value ELSE 0 END) AS odd_sum,
  SUM(CASE WHEN measurement_count % 2 = 0 THEN measurement_value ELSE 0 END) AS even_sum
FROM numbered
GROUP BY measurement_day
ORDER BY measurement_day
""".strip()
problems["8.28"] = {"seed": seed_828, "tables": ["measurements"], "solution": sol_828, "title": "Odd/even measurement sums"}

# ---------- 8.29 signups last week purchase pct ----------
# As-of fixed: 2024-06-15; week = after 2024-06-08
signups = []
purch = []
for uid, day, bought in [
    (1, "2024-06-10", True),
    (2, "2024-06-12", True),
    (3, "2024-06-14", False),
    (4, "2024-06-09", True),
    (5, "2024-06-01", True),  # outside week
    (6, "2024-06-13", False),
]:
    signups.append((uid, day))
    if bought:
        purch.append((uid, 1, 10.0, day))
for i in range(10):
    signups.append((20 + i, "2024-05-01"))
for i in range(12):
    purch.append((30 + i, 2, 5.0, f"2024-05-{(i % 28)+1:02d}"))
seed_829 = (
    "CREATE TABLE signups (user_id INTEGER, signup_date TEXT);\n"
    "CREATE TABLE user_purchases (user_id INTEGER, product_id INTEGER, purchase_amount REAL, purchase_date TEXT);\n"
    + inserts("signups", ["user_id", "signup_date"], signups)
    + "\n"
    + inserts("user_purchases", ["user_id", "product_id", "purchase_amount", "purchase_date"], purch)
)
# Use as-of date 2024-06-15 instead of NOW()
sol_829 = """
SELECT ROUND(
  100.0 * COUNT(DISTINCT p.user_id) / COUNT(DISTINCT s.user_id),
  2
) AS last_week_pct
FROM signups s
LEFT JOIN user_purchases p ON p.user_id = s.user_id
WHERE s.signup_date > date('2024-06-15', '-7 days')
  AND s.signup_date <= '2024-06-15'
""".strip()
problems["8.29"] = {"seed": seed_829, "tables": ["signups", "user_purchases"], "solution": sol_829, "title": "New-user purchase percentage"}

# ---------- 8.30 frequently bought together ----------
products = [(1, "A", 1.0), (2, "B", 2.0), (3, "C", 3.0), (4, "D", 4.0)]
for i in range(5, 16):
    products.append((i, f"P{i}", float(i)))
txp = []
# transaction 1: A,B ; 2: A,B ; 3: A,C ; 4: B,C ; 5: A,B,C
pairs_tx = [
    (1, [1, 2]),
    (2, [1, 2]),
    (3, [1, 3]),
    (4, [2, 3]),
    (5, [1, 2, 3]),
]
for tid, pids in pairs_tx:
    for p in pids:
        txp.append((tid, p, 1, 1, "2021-01-01"))
for tid in range(6, 16):
    txp.append((tid, 4, 1, 1, "2021-01-02"))
    txp.append((tid, 5, 1, 1, "2021-01-02"))

seed_830 = (
    "CREATE TABLE products (product_id INTEGER, product_name TEXT, price REAL);\n"
    "CREATE TABLE transactions (transaction_id INTEGER, product_id INTEGER, user_id INTEGER, quantity INTEGER, transaction_time TEXT);\n"
    + inserts("products", ["product_id", "product_name", "price"], products)
    + "\n"
    + inserts(
        "transactions",
        ["transaction_id", "product_id", "user_id", "quantity", "transaction_time"],
        txp,
    )
)
sol_830 = """
WITH purchase_info AS (
  SELECT t.transaction_id, t.product_id, p.product_name
  FROM transactions t
  JOIN products p ON t.product_id = p.product_id
)
SELECT
  p1.product_name AS product1,
  p2.product_name AS product2,
  COUNT(*) AS count
FROM purchase_info p1
JOIN purchase_info p2
  ON p1.transaction_id = p2.transaction_id
 AND p1.product_id < p2.product_id
GROUP BY p1.product_name, p2.product_name
ORDER BY count DESC, product1, product2
LIMIT 10
""".strip()
problems["8.30"] = {"seed": seed_830, "tables": ["transactions", "products"], "solution": sol_830, "title": "Products bought together"}

# ---------- 8.31 reactivated users ----------
logins = []
# For Feb 2021: user 1 logged Jan+Feb (not reactivated); user 2 only Feb (reactivated if no Jan);
# Book: didn't log in previous month, then logged in current month
# Jan: 1,3; Feb: 1,2,4 -> reactivated in Feb: 2,4
for uid, days in [(1, ["2021-01-05", "2021-02-05"]), (2, ["2021-02-06"]), (3, ["2021-01-10"]), (4, ["2021-02-07"])]:
    for d in days:
        logins.append((uid, d))
for i in range(12):
    logins.append((10 + i, f"2021-03-{(i % 28)+1:02d}"))

seed_831 = (
    "CREATE TABLE user_logins (user_id INTEGER, login_date TEXT);\n"
    + inserts("user_logins", ["user_id", "login_date"], logins)
)
sol_831 = """
SELECT
  strftime('%Y-%m', c.login_date) AS current_month,
  COUNT(DISTINCT c.user_id) AS num_reactivated_users
FROM user_logins c
WHERE NOT EXISTS (
  SELECT 1
  FROM user_logins p
  WHERE p.user_id = c.user_id
    AND strftime('%Y-%m', p.login_date) = strftime('%Y-%m', date(c.login_date, 'start of month', '-1 month'))
)
GROUP BY strftime('%Y-%m', c.login_date)
ORDER BY current_month
""".strip()
problems["8.31"] = {"seed": seed_831, "tables": ["user_logins"], "solution": sol_831, "title": "Reactivated users by month"}

# ---------- 8.32 YoY weekly spend growth ----------
# Generate 60 weeks for products 1 and 2
ut32 = []
tid = 1
start = date(2020, 1, 6)  # a Monday
for w in range(60):
    d = start + timedelta(weeks=w)
    for pid, base in [(1, 100), (2, 50)]:
        spend = base + w  # steadily increasing
        ut32.append((tid, pid, 1, float(spend), d.isoformat()))
        tid += 1

seed_832 = (
    "CREATE TABLE user_transactions (transaction_id INTEGER, product_id INTEGER, user_id INTEGER, spend REAL, transaction_date TEXT);\n"
    + inserts(
        "user_transactions",
        ["transaction_id", "product_id", "user_id", "spend", "transaction_date"],
        ut32,
    )
)
sol_832 = """
WITH weekly_spend AS (
  SELECT
    date(transaction_date, 'weekday 0', '-6 days') AS week,
    product_id,
    SUM(spend) AS total_spend
  FROM user_transactions
  GROUP BY week, product_id
),
total_weekly_spend AS (
  SELECT
    week,
    product_id,
    total_spend,
    LAG(total_spend, 52) OVER (
      PARTITION BY product_id
      ORDER BY week
    ) AS prev_total_spend
  FROM weekly_spend
)
SELECT
  product_id,
  week,
  total_spend,
  prev_total_spend,
  ROUND(total_spend / prev_total_spend, 4) AS spend_yoy
FROM total_weekly_spend
WHERE prev_total_spend IS NOT NULL
ORDER BY product_id, week
LIMIT 10
""".strip()
# Note: test will use includes or limit for stability - verify first
problems["8.32"] = {"seed": seed_832, "tables": ["user_transactions"], "solution": sol_832, "title": "YoY weekly spend growth"}

# ---------- 8.33 rolling 7-day earnings ----------
ut33 = []
tid = 1
# daily amounts Jan 1-15: amount = day number
for d in range(1, 16):
    ut33.append((tid, 1, float(d), f"2021-01-{d:02d}"))
    tid += 1
for i in range(5):
    ut33.append((tid, 2, 1.0, f"2021-02-{i+1:02d}"))
    tid += 1

seed_833 = (
    "CREATE TABLE user_transactions (transaction_id INTEGER, user_id INTEGER, amount REAL, transaction_date TEXT);\n"
    + inserts(
        "user_transactions",
        ["transaction_id", "user_id", "amount", "transaction_date"],
        ut33,
    )
)
sol_833 = """
WITH daily AS (
  SELECT DATE(transaction_date) AS transaction_date, SUM(amount) AS total_amount
  FROM user_transactions
  GROUP BY DATE(transaction_date)
)
SELECT
  d2.transaction_date,
  SUM(d1.total_amount) AS weekly_rolling_total
FROM daily d1
JOIN daily d2
  ON d1.transaction_date > date(d2.transaction_date, '-7 days')
 AND d1.transaction_date <= d2.transaction_date
GROUP BY d2.transaction_date
ORDER BY d2.transaction_date
""".strip()
problems["8.33"] = {"seed": seed_833, "tables": ["user_transactions"], "solution": sol_833, "title": "Rolling 7-day earnings"}


def main():
    expectations = {}
    js_parts = [
        "/* eslint-disable */",
        "/** Auto-generated by scripts/build_ch8_sql_seeds.py — do not edit by hand. */",
        "",
        "function sqlQuote(v) {",
        "  if (v === null || v === undefined) return 'NULL';",
        "  if (typeof v === 'number') return String(v);",
        "  return \"'\" + String(v).replace(/'/g, \"''\") + \"'\";",
        "}",
        "",
        "export const CH8 = {};",
        "",
    ]

    for key, meta in problems.items():
        seed = meta["seed"]
        sol = meta["solution"]
        try:
            out = run(seed, sol)
        except Exception as e:
            raise SystemExit(f"FAIL {key}: {e}\nSQL:\n{sol}") from e
        tables = preview_tables(seed, meta["tables"])
        # ensure >= 15 rows where possible
        for t in tables:
            if len(t["rows"]) < 5:
                print(f"WARN {key} table {t['name']} only {len(t['rows'])} rows")
        expectations[key] = {
            "title": meta["title"],
            "output": out,
            "normalized": " ".join(out.lower().split()),
        }
        # emit JS entry
        slug = key.replace(".", "_")
        js_parts.append(f"CH8[{json.dumps(key)}] = {{")
        js_parts.append(f"  id: {json.dumps(key)},")
        js_parts.append(f"  title: {json.dumps(meta['title'])},")
        js_parts.append(f"  seed: {json.dumps(seed)},")
        js_parts.append(f"  solution: {json.dumps(sol)},")
        js_parts.append(f"  expected: {json.dumps(out)},")
        js_parts.append(f"  tables: {json.dumps(tables)},")
        js_parts.append("};")
        js_parts.append("")
        print(f"OK {key}: {out[:80]!r}...")

    OUT_JS.write_text("\n".join(js_parts))
    OUT_JSON.write_text(json.dumps(expectations, indent=2))
    print(f"Wrote {OUT_JS}")
    print(f"Wrote {OUT_JSON}")


if __name__ == "__main__":
    main()
