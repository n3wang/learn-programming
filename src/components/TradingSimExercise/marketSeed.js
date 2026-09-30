/** Shared company universe + price path builders for trading sim levels. */

export const MARKET_COLUMNS = [
  'company_name',
  'industry',
  'market_cap',
  'ticker_price',
  'ticker',
  'dividend_per_tick',
  'description',
];

/** Default listed companies (commodities-themed equities). */
export const DEFAULT_COMPANIES = [
  {
    ticker: 'GOLD',
    company_name: '极光黄金',
    industry: 'Metals',
    market_cap: 48_000_000_000,
    dividend_per_tick: 0,
    description: '生产并对冲实物黄金；价格跟踪金价。',
  },
  {
    ticker: 'CORN',
    company_name: '心田谷物',
    industry: 'Agriculture',
    market_cap: 12_000_000_000,
    dividend_per_tick: 0,
    description: '玉米仓储与期货相关农业企业。',
  },
  {
    ticker: 'WTI',
    company_name: '海湾原油',
    industry: 'Energy',
    market_cap: 95_000_000_000,
    dividend_per_tick: 0,
    description: '以上游原油生产为主，对标 WTI。',
  },
];

/** Beginner dividend + ETF universe (finance-first drills). */
export const DIVIDEND_ETF_COMPANIES = [
  {
    ticker: 'DIVY',
    company_name: '稳健收益公司',
    industry: 'Income',
    market_cap: 8_000_000_000,
    dividend_per_tick: 2,
    description: '玩具股息股：每 tick 每股派发现金 $2（故意不现实）。',
  },
  {
    ticker: 'GOLD',
    company_name: '极光黄金',
    industry: 'Metals',
    market_cap: 48_000_000_000,
    dividend_per_tick: 0,
    description: '无股息；用于 CMDY ETF 成分。',
  },
  {
    ticker: 'CORN',
    company_name: '心田谷物',
    industry: 'Agriculture',
    market_cap: 12_000_000_000,
    dividend_per_tick: 0,
    description: '无股息；用于 CMDY ETF 成分。',
  },
  {
    ticker: 'CMDY',
    company_name: '商品混合 ETF',
    industry: 'ETF',
    market_cap: 3_000_000_000,
    dividend_per_tick: 0,
    description: '已上市 ETF：每 tick 价格 = 0.5×GOLD + 0.5×CORN。',
  },
];

/** Pre-listed ETF recipes (ticker → weight map). */
export const LISTED_ETFS = {
  CMDY: {GOLD: 0.5, CORN: 0.5},
};

/**
 * Deterministic GOLD dip-then-rally path (ticks 0..15).
 * Buy at tick 5 (80), sell at tick 12 (120) → +40 equity with cash 10000.
 */
export const LEVEL1_PRICES = [
  {GOLD: 100, CORN: 42, WTI: 71},
  {GOLD: 98, CORN: 41, WTI: 70},
  {GOLD: 95, CORN: 41, WTI: 69},
  {GOLD: 90, CORN: 40, WTI: 68},
  {GOLD: 85, CORN: 40, WTI: 67},
  {GOLD: 80, CORN: 39, WTI: 66}, // buy GOLD
  {GOLD: 82, CORN: 39, WTI: 65},
  {GOLD: 88, CORN: 40, WTI: 64},
  {GOLD: 95, CORN: 41, WTI: 63},
  {GOLD: 100, CORN: 42, WTI: 62},
  {GOLD: 110, CORN: 43, WTI: 61},
  {GOLD: 115, CORN: 43, WTI: 60},
  {GOLD: 120, CORN: 44, WTI: 59}, // sell GOLD
  {GOLD: 118, CORN: 44, WTI: 58},
  {GOLD: 115, CORN: 45, WTI: 57},
  {GOLD: 112, CORN: 45, WTI: 56},
];

/** Flat DIVY + gentle GOLD/CORN path; CMDY filled by applyListedEtfs. */
export const DIVIDEND_ETF_UNDERLYING_PRICES = [
  {DIVY: 100, GOLD: 100, CORN: 40},
  {DIVY: 100, GOLD: 102, CORN: 41},
  {DIVY: 100, GOLD: 104, CORN: 42},
  {DIVY: 100, GOLD: 103, CORN: 41},
  {DIVY: 100, GOLD: 106, CORN: 43},
  {DIVY: 100, GOLD: 108, CORN: 44},
  {DIVY: 100, GOLD: 110, CORN: 45},
  {DIVY: 100, GOLD: 112, CORN: 46},
  {DIVY: 100, GOLD: 115, CORN: 48},
  {DIVY: 100, GOLD: 118, CORN: 50},
];

/** Mulberry32 — same seed ⇒ same walk (JS + documented for parity). */
export function mulberry32(seed) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Build a random-walk price path for each ticker.
 * @param {{tickers: string[], start: Record<string, number>, ticks: number, seed: number, drift?: number, vol?: number}} opts
 * @returns {Record<string, number>[]}
 */
export function buildRandomWalkPrices({
  tickers,
  start,
  ticks,
  seed,
  drift = 0,
  vol = 0.03,
}) {
  const rand = mulberry32(seed);
  const path = [];
  const px = {...start};
  for (let i = 0; i < ticks; i++) {
    path.push({...px});
    for (const t of tickers) {
      const shock = (rand() - 0.5) * 2 * vol;
      px[t] = Math.max(1, Math.round((px[t] * (1 + drift + shock)) * 100) / 100);
    }
  }
  return path;
}

/** Attach listed-ETF prices from underlying weights (mutates copies). */
export function applyListedEtfs(pricesByTick, listedEtfs = LISTED_ETFS) {
  return pricesByTick.map((row) => {
    const next = {...row};
    for (const [etf, weights] of Object.entries(listedEtfs)) {
      let px = 0;
      for (const [t, w] of Object.entries(weights)) {
        px += Number(w) * Number(next[t] ?? 0);
      }
      next[etf] = Math.round(px * 100) / 100;
    }
    return next;
  });
}

/**
 * Snapshot rows for one tick (DataFrame-shaped list of objects).
 */
export function snapshotRows(companies, pricesAtTick) {
  return companies.map((c) => ({
    company_name: c.company_name,
    industry: c.industry,
    market_cap: c.market_cap,
    ticker_price: pricesAtTick[c.ticker],
    ticker: c.ticker,
    dividend_per_tick: c.dividend_per_tick ?? 0,
    description: c.description,
  }));
}

/**
 * Build Data-tab tables: companies (tick 0 snapshot) + full timeline.
 */
export function buildPreviewTables(companies, pricesByTick) {
  const tick0 = snapshotRows(companies, pricesByTick[0] || {});
  const companyRows = tick0.map((r) =>
    MARKET_COLUMNS.map((col) => r[col]),
  );
  const timelineRows = [];
  for (let tick = 0; tick < pricesByTick.length; tick++) {
    const px = pricesByTick[tick];
    for (const c of companies) {
      timelineRows.push([
        tick,
        c.ticker,
        px[c.ticker],
        c.dividend_per_tick ?? 0,
        c.industry,
        c.company_name,
      ]);
    }
  }
  return [
    {
      name: 'companies',
      columns: MARKET_COLUMNS,
      rows: companyRows,
    },
    {
      name: 'timeline',
      columns: [
        'tick',
        'ticker',
        'ticker_price',
        'dividend_per_tick',
        'industry',
        'company_name',
      ],
      rows: timelineRows,
    },
  ];
}
