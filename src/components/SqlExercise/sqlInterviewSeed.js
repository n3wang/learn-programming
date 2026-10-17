/** Interview-style schema for the SQL cheat-sheet lesson (SQLite). */

export const SQL_INTERVIEW_SCHEMA = `
CREATE TABLE departments (
  department_id INTEGER PRIMARY KEY,
  department_name TEXT NOT NULL
);

CREATE TABLE employees (
  employee_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER NOT NULL
);

CREATE TABLE customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  amount REAL NOT NULL
);

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);
`.trim();

export const SQL_INTERVIEW_TABLES = [
  {
    name: 'departments',
    columns: ['department_id', 'department_name'],
    rows: [
      [1, 'Engineering'],
      [2, 'Sales'],
      [3, 'Finance'],
      [4, 'HR'],
      [5, 'Marketing'],
    ],
  },
  {
    name: 'employees',
    columns: ['employee_id', 'name', 'department_id', 'salary'],
    rows: [
      [1, 'Ada', 1, 120000],
      [2, 'Bob', 1, 95000],
      [3, 'Cara', 1, 95000],
      [4, 'Dan', 1, 80000],
      [5, 'Eve', 1, 70000],
      [6, 'Frank', 2, 110000],
      [7, 'Gina', 2, 88000],
      [8, 'Hank', 2, 72000],
      [9, 'Ivy', 2, 65000],
      [10, 'Jon', 3, 105000],
      [11, 'Kim', 3, 90000],
      [12, 'Leo', 3, 90000],
      [13, 'Mia', 3, 55000],
      [14, 'Ned', 4, 62000],
      [15, 'Ora', 4, 58000],
      [16, 'Pat', null, 75000],
      [17, 'Quinn', 1, 60000],
      [18, 'Rae', 2, 54000],
    ],
  },
  {
    name: 'customers',
    columns: ['customer_id', 'name', 'country', 'phone'],
    rows: [
      [1, 'Acme', 'US', '555-0101'],
      [2, 'Beta', 'US', null],
      [3, 'Cedar', 'CA', '555-0103'],
      [4, 'Delta', 'UK', null],
      [5, 'Echo', 'US', '555-0105'],
      [6, 'Fox', 'DE', '555-0106'],
      [7, 'Gulf', 'FR', null],
      [8, 'Hill', 'US', '555-0108'],
      [9, 'Iris', 'CA', '555-0109'],
      [10, 'Jade', 'MX', null],
      [11, 'Kite', 'US', '555-0111'],
      [12, 'Lake', 'UK', '555-0112'],
      [13, 'Moss', 'IN', null],
      [14, 'Nova', 'US', '555-0114'],
      [15, 'Oak', 'BR', '555-0115'],
      [16, 'Pine', 'AU', null],
    ],
  },
  {
    name: 'orders',
    columns: ['order_id', 'customer_id', 'order_date', 'amount'],
    rows: [
      [1, 1, '2026-01-05', 100],
      [2, 1, '2026-01-20', 40],
      [3, 1, '2026-02-02', 80],
      [4, 2, '2026-01-10', 50],
      [5, 2, '2026-01-15', 60],
      [6, 3, '2026-01-08', 120],
      [7, 3, '2026-02-01', 30],
      [8, 3, '2026-02-14', 90],
      [9, 5, '2026-01-22', 200],
      [10, 5, '2026-01-22', 25],
      [11, 5, '2026-02-10', 75],
      [12, 6, '2026-01-03', 45],
      [13, 8, '2026-01-18', 110],
      [14, 8, '2026-02-05', 95],
      [15, 9, '2026-01-12', 70],
      [16, 11, '2026-01-28', 55],
      [17, 11, '2026-02-08', 65],
      [18, 12, '2026-01-30', 85],
      [19, 14, '2026-02-12', 150],
      [20, 15, '2026-01-07', 35],
    ],
  },
  {
    name: 'users',
    columns: ['user_id', 'email'],
    rows: [
      [1, 'a@ex.com'],
      [2, 'b@ex.com'],
      [3, 'a@ex.com'],
      [4, 'c@ex.com'],
      [5, 'd@ex.com'],
      [6, 'b@ex.com'],
      [7, 'e@ex.com'],
      [8, 'f@ex.com'],
      [9, 'g@ex.com'],
      [10, 'c@ex.com'],
      [11, 'h@ex.com'],
      [12, 'i@ex.com'],
      [13, 'j@ex.com'],
      [14, 'k@ex.com'],
      [15, 'l@ex.com'],
      [16, 'm@ex.com'],
    ],
  },
];

function sqlQuote(v) {
  if (v === null || v === undefined) return 'NULL';
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

export function buildSqlInterviewSeedSql() {
  const parts = [SQL_INTERVIEW_SCHEMA];
  for (const t of SQL_INTERVIEW_TABLES) {
    parts.push(insertRows(t.name, t.columns, t.rows));
  }
  return parts.join('\n');
}

export const SQL_INTERVIEW_SEED = buildSqlInterviewSeedSql();
