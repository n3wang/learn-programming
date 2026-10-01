export const INVENTORY_POLICY_SEED = `
CREATE TABLE inventory_simulation (
  policy TEXT NOT NULL,
  period INTEGER NOT NULL,
  cycle_id INTEGER NOT NULL,
  demand INTEGER NOT NULL,
  fulfilled INTEGER NOT NULL
);

CREATE TABLE policy_settings (
  policy TEXT PRIMARY KEY,
  mean_demand REAL NOT NULL,
  lead_time INTEGER NOT NULL,
  review_period INTEGER NOT NULL,
  safety_stock REAL NOT NULL,
  order_qty INTEGER,
  current_on_hand INTEGER NOT NULL
);

INSERT INTO inventory_simulation VALUES
  ('continuous', 1, 1, 10, 10),
  ('continuous', 2, 1, 12, 10),
  ('continuous', 3, 2, 8, 8),
  ('continuous', 4, 2, 15, 12),
  ('periodic', 1, 1, 10, 10),
  ('periodic', 2, 1, 12, 12),
  ('periodic', 3, 2, 8, 8),
  ('periodic', 4, 2, 15, 15);

INSERT INTO policy_settings VALUES
  ('continuous', 40, 4, 1, 44.7, 40, 30),
  ('periodic', 40, 4, 1, 50, NULL, 65);
`;

export const INVENTORY_POLICY_TABLES = [
  {
    name: 'inventory_simulation',
    columns: [
      'policy',
      'period',
      'cycle_id',
      'demand',
      'fulfilled',
    ],
    rows: [
      ['continuous', 1, 1, 10, 10],
      ['continuous', 2, 1, 12, 10],
      ['continuous', 3, 2, 8, 8],
      ['continuous', 4, 2, 15, 12],
      ['periodic', 1, 1, 10, 10],
      ['periodic', 2, 1, 12, 12],
      ['periodic', 3, 2, 8, 8],
      ['periodic', 4, 2, 15, 15],
    ],
  },
  {
    name: 'policy_settings',
    columns: [
      'policy',
      'mean_demand',
      'lead_time',
      'review_period',
      'safety_stock',
      'order_qty',
      'current_on_hand',
    ],
    rows: [
      ['continuous', 40, 4, 1, 44.7, 40, 30],
      ['periodic', 40, 4, 1, 50, null, 65],
    ],
  },
];
