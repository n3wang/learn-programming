/** Shared Reddit-style schema + seed for SQL lessons (SQLite). ≥15 rows per table. */

export const REDDIT_SCHEMA = `
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  country TEXT NOT NULL,
  active_status INTEGER NOT NULL,
  join_time TEXT NOT NULL
);

CREATE TABLE posts (
  post_id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  subreddit_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  active_status INTEGER NOT NULL,
  post_time TEXT NOT NULL
);
`.trim();

/** Preview metadata for the Data tab (first 15 rows shown in UI). */
export const REDDIT_TABLES = [
  {
    name: 'users',
    columns: ['user_id', 'country', 'active_status', 'join_time'],
    rows: [
      [1, 'US', 1, '2023-01-05'],
      [2, 'US', 1, '2023-01-12'],
      [3, 'CA', 1, '2023-02-01'],
      [4, 'UK', 0, '2023-02-10'],
      [5, 'US', 1, '2023-02-18'],
      [6, 'IN', 1, '2023-03-01'],
      [7, 'DE', 1, '2023-03-08'],
      [8, 'US', 0, '2023-03-15'],
      [9, 'BR', 1, '2023-03-22'],
      [10, 'US', 1, '2023-04-01'],
      [11, 'FR', 1, '2023-04-09'],
      [12, 'US', 1, '2023-04-16'],
      [13, 'JP', 0, '2023-04-24'],
      [14, 'CA', 1, '2023-05-02'],
      [15, 'US', 1, '2023-05-10'],
      [16, 'AU', 1, '2023-05-18'],
      [17, 'US', 0, '2023-05-26'],
      [18, 'MX', 1, '2023-06-03'],
      [19, 'UK', 1, '2023-06-11'],
      [20, 'US', 1, '2023-06-20'],
    ],
  },
  {
    name: 'posts',
    columns: [
      'post_id',
      'user_id',
      'subreddit_id',
      'title',
      'body',
      'active_status',
      'post_time',
    ],
    rows: [
      [1, 1, 10, 'hello', 'hi there friends', 1, '2023-06-01 10:00:00'],
      [2, 1, 10, 'tips', 'here are some longer tips about sql joins and filters', 1, '2023-06-02 11:00:00'],
      [3, 2, 11, 'news', 'breaking news today', 1, '2023-06-02 12:00:00'],
      [4, 2, 10, 'q', 'quick question', 1, '2023-06-03 09:00:00'],
      [5, 3, 12, 'canada', 'hello from canada with a medium length body', 1, '2023-06-03 15:00:00'],
      [6, 5, 10, 'help', 'need help', 1, '2023-06-04 08:00:00'],
      [7, 5, 11, 'update', 'small update post body text here for ranking', 1, '2023-06-04 18:00:00'],
      [8, 6, 13, 'india', 'greetings', 1, '2023-06-05 07:00:00'],
      [9, 6, 10, 'sql', 'learning window functions today which is exciting and useful', 1, '2023-06-05 19:00:00'],
      [10, 7, 14, 'de', 'guten tag', 0, '2023-06-06 10:00:00'],
      [11, 9, 10, 'br', 'ola amigos this post is inactive later', 1, '2023-06-06 14:00:00'],
      [12, 10, 11, 'a', 'short', 1, '2023-06-07 09:00:00'],
      [13, 10, 11, 'b', 'another short one', 1, '2023-06-07 10:00:00'],
      [14, 10, 12, 'c', 'third post same day for lag practice', 1, '2023-06-07 16:00:00'],
      [15, 12, 10, 'long', 'this body is intentionally long so rank by length puts it first among peers maybe', 1, '2023-06-08 11:00:00'],
      [16, 12, 10, 'tiny', 'x', 1, '2023-06-08 12:00:00'],
      [17, 14, 15, 'ca2', 'canadian post two', 1, '2023-06-09 08:00:00'],
      [18, 15, 10, 'us1', 'active us user post', 1, '2023-06-09 13:00:00'],
      [19, 15, 10, 'us2', 'second post same subreddit for lag', 1, '2023-06-09 17:00:00'],
      [20, 16, 16, 'au', 'g day mate medium body content here', 1, '2023-06-10 06:00:00'],
      [21, 18, 10, 'mx', 'hola', 1, '2023-06-10 20:00:00'],
      [22, 19, 11, 'uk', 'cheerio longer body for the british user post sample', 1, '2023-06-11 09:00:00'],
      [23, 20, 10, 'finale', 'last active us poster with decent length body text', 1, '2023-06-11 21:00:00'],
      [24, 4, 10, 'old', 'inactive user leftover post', 0, '2023-05-01 10:00:00'],
      [25, 8, 11, 'gone', 'also inactive user', 0, '2023-05-02 10:00:00'],
      [26, 1, 11, 'more', 'user 1 second subreddit post', 1, '2023-06-12 10:00:00'],
      [27, 3, 10, 'more2', 'user 3 second post', 1, '2023-06-12 11:00:00'],
      [28, 20, 11, 'more3', 'user 20 cross post', 1, '2023-06-12 12:00:00'],
      [29, 11, 10, 'fr', 'bonjour from france with enough characters', 1, '2023-06-12 13:00:00'],
      [30, 9, 12, 'br2', 'second brazilian post', 1, '2023-06-12 14:00:00'],
    ],
  },
];

function sqlQuote(v) {
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

function insertRows(table, columns, rows) {
  return rows
    .map(
      (row) =>
        `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${row.map(sqlQuote).join(', ')});`,
    )
    .join('\n');
}

/** Seed SQL only (CREATE + INSERT). Safe for sqlite3 CLI or Python sqlite3. */
export function buildRedditSeedSql() {
  const parts = [REDDIT_SCHEMA];
  for (const t of REDDIT_TABLES) {
    parts.push(insertRows(t.name, t.columns, t.rows));
  }
  return parts.join('\n');
}

export const REDDIT_SEED = buildRedditSeedSql();

/**
 * Build a Python program that loads seed SQL, runs the student query, prints
 * rows as col|col (headerless). Uses the already-installed Piston Python runtime.
 */
export function buildPythonSqlRunner(seedSql, studentSql) {
  const seed = String(seedSql || '');
  const query = String(studentSql || '').trim();
  return `import sqlite3

SEED = ${JSON.stringify(seed)}
QUERY = ${JSON.stringify(query)}

conn = sqlite3.connect(":memory:")
conn.executescript(SEED)
cur = conn.cursor()
sql = QUERY.strip().rstrip(";")
if not sql:
    raise SystemExit("Empty query")
cur.execute(sql)
if cur.description is None:
    print(conn.total_changes)
else:
    for row in cur.fetchall():
        print("|".join("" if v is None else str(v) for v in row))
`;
}