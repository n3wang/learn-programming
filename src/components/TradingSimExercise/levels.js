import {
  DEFAULT_COMPANIES,
  DIVIDEND_ETF_COMPANIES,
  DIVIDEND_ETF_UNDERLYING_PRICES,
  LEVEL1_PRICES,
  LISTED_ETFS,
  applyListedEtfs,
  buildPreviewTables,
  buildRandomWalkPrices,
} from './marketSeed.js';

const STARTING_CASH = 10000;

const LEVEL1_STARTER = `def on_tick(market_data, user_data):
    # 几乎正确——找出并改正小错误。
    # 目标：在 tick 5 买入 GOLD，在 tick 12 卖出 GOLD。
    if market.tick == 5 and market.can_buy("CORN"):
        market.buy("CORN")
    if market.tick == 11 and market.can_sell("CORN"):
        market.sell("CORN")
`;

const LEVEL1_SOLUTION = `def on_tick(market_data, user_data):
    if market.tick == 5 and market.can_buy("GOLD"):
        market.buy("GOLD")
    if market.tick == 12 and market.can_sell("GOLD"):
        market.sell("GOLD")
`;

/** Level 1: buy @80 sell @120 → equity 10040 */
const LEVEL1_EQUITY = 10040;

const level2Tickers = DEFAULT_COMPANIES.map((c) => c.ticker);
const LEVEL2_PRICES = buildRandomWalkPrices({
  tickers: level2Tickers,
  start: {GOLD: 100, CORN: 42, WTI: 70},
  ticks: 24,
  seed: 20260926,
  drift: -0.002,
  vol: 0.045,
});

const LEVEL2_STARTER = `def on_tick(market_data, user_data):
    # 交易能源股（WTI）：价格 < 71 且能买就买；价格 >= 74 且能卖就卖。
    # 用 market_data.iterrows() 遍历；每行有 industry、ticker、ticker_price。
    pass
`;

const LEVEL2_SOLUTION = `def on_tick(market_data, user_data):
    for _, row in market_data.iterrows():
        if row["industry"] != "Energy":
            continue
        t = row["ticker"]
        px = float(row["ticker_price"])
        if px < 71 and market.can_buy(t):
            market.buy(t)
        elif px >= 74 and market.can_sell(t):
            market.sell(t)
`;

function simulateLevel2Equity() {
  let cash = STARTING_CASH;
  const positions = {};
  for (let tick = 0; tick < LEVEL2_PRICES.length; tick++) {
    const px = LEVEL2_PRICES[tick];
    for (const c of DEFAULT_COMPANIES) {
      if (c.industry !== 'Energy') continue;
      const t = c.ticker;
      const price = px[t];
      const held = positions[t] || 0;
      if (price < 71 && cash >= price) {
        cash -= price;
        positions[t] = held + 1;
      } else if (price >= 74 && held >= 1) {
        cash += price;
        positions[t] = held - 1;
        if (positions[t] === 0) delete positions[t];
      }
    }
  }
  let equity = cash;
  const last = LEVEL2_PRICES[LEVEL2_PRICES.length - 1];
  for (const [t, q] of Object.entries(positions)) {
    equity += q * last[t];
  }
  return Math.round(equity * 10000) / 10000;
}

const LEVEL2_EQUITY = simulateLevel2Equity();

const DIV_ETF_PRICES = applyListedEtfs(
  DIVIDEND_ETF_UNDERLYING_PRICES,
  LISTED_ETFS,
);

const LEVEL3_STARTER = `def on_tick(market_data, user_data):
    # 几乎正确——找出并改正小错误。
    # 目标：在 tick 0 买入 5 股 DIVY，然后一直持有（不要卖）。
    # DIVY 每 tick 每股自动派息 $2 到现金。
    if market.tick == 0 and market.can_buy("DIVY", 5):
        market.buy("GOLD", 5)
`;

const LEVEL3_SOLUTION = `def on_tick(market_data, user_data):
    if market.tick == 0 and market.can_buy("DIVY", 5):
        market.buy("DIVY", 5)
`;

const LEVEL3_EQUITY = 10100;
const LEVEL3_DIVIDENDS = 100;

const LEVEL4_STARTER = `def on_tick(market_data, user_data):
    # 几乎正确——找出并改正小错误。
    # 目标：tick 1 买入 1 股 CMDY，tick 8 卖出。
    # CMDY 价格 = 0.5*GOLD + 0.5*CORN。
    if market.tick == 1 and market.can_buy("CMDY"):
        market.buy("CMDY")
    if market.tick == 9 and market.can_sell("CMDY"):
        market.sell("CMDY")
`;

const LEVEL4_SOLUTION = `def on_tick(market_data, user_data):
    if market.tick == 1 and market.can_buy("CMDY"):
        market.buy("CMDY")
    if market.tick == 8 and market.can_sell("CMDY"):
        market.sell("CMDY")
`;

const LEVEL4_BUY_PX = DIV_ETF_PRICES[1].CMDY;
const LEVEL4_SELL_PX = DIV_ETF_PRICES[8].CMDY;
const LEVEL4_EQUITY = STARTING_CASH - LEVEL4_BUY_PX + LEVEL4_SELL_PX;

const LEVEL5_STARTER = `def on_tick(market_data, user_data):
    # 目标：自己设计 ETF，再像股票一样买卖。
    #
    # Tick 0 — 创建 60% GOLD + 40% CORN 的 MYETF：
    #     market.define_etf("MYETF", {"GOLD": 0.6, "CORN": 0.4})
    # Tick 1 — 买入 1 股 MYETF
    # Tick 9 — 卖出 1 股 MYETF
    #
    # 提示：先 define_etf，再 buy。
    pass
`;

const LEVEL5_SOLUTION = `def on_tick(market_data, user_data):
    if market.tick == 0:
        market.define_etf("MYETF", {"GOLD": 0.6, "CORN": 0.4})
    if market.tick == 1 and market.can_buy("MYETF"):
        market.buy("MYETF")
    if market.tick == 9 and market.can_sell("MYETF"):
        market.sell("MYETF")
`;

const LEVEL5_BUY_PX =
  Math.round((0.6 * DIV_ETF_PRICES[1].GOLD + 0.4 * DIV_ETF_PRICES[1].CORN) * 100) /
  100;
const LEVEL5_SELL_PX =
  Math.round((0.6 * DIV_ETF_PRICES[9].GOLD + 0.4 * DIV_ETF_PRICES[9].CORN) * 100) /
  100;
const LEVEL5_EQUITY = STARTING_CASH - LEVEL5_BUY_PX + LEVEL5_SELL_PX;

const LEVEL6_STARTER = `def on_tick(market_data, user_data):
    # Tick 0 买入 1 股 DIVY（每 tick 自动派息 $2 到现金）。
    # 每个 tick 都打印当前现金，例如：
    #     print("CASH=%.4f" % user_data["cash"])
    # user_data["cash"] 与 market.cash 同步（含分红）。
    pass
`;

const LEVEL6_SOLUTION = `def on_tick(market_data, user_data):
    if market.tick == 0 and market.can_buy("DIVY"):
        market.buy("DIVY")
    print("CASH=%.4f" % user_data["cash"])
`;

const LEVEL6_EQUITY = 10020;
const LEVEL6_DIVIDENDS = 20;

const LEVEL7_STARTER = `def on_tick(market_data, user_data):
    # Tick 0 买入 1 股 GOLD，然后持有。
    # 每个 tick 打印总权益：
    #     print("EQUITY=%.4f" % market.total_equity())
    # total_equity() = 现金 + 本 tick 股价下的持仓市值。
    # （与 user_data["equity"] 相同。）
    pass
`;

const LEVEL7_SOLUTION = `def on_tick(market_data, user_data):
    if market.tick == 0 and market.can_buy("GOLD"):
        market.buy("GOLD")
    print("EQUITY=%.4f" % market.total_equity())
`;

const LEVEL7_EQUITY =
  STARTING_CASH - DIV_ETF_PRICES[0].GOLD + DIV_ETF_PRICES[DIV_ETF_PRICES.length - 1].GOLD;

/** @type {Record<string, object>} */
export const LEVELS = {
  '1-manual-timing': {
    id: '1-manual-timing',
    title: '1 · 择时买卖（改错）',
    prompt:
      '改起始代码：应在 tick 5 买入 GOLD，在 tick 12 卖出 GOLD。打开 Data → timeline。代码里有错误（股票代码和/或卖出时刻）。改到 FINAL_EQUITY 正确为止。',
    starter: LEVEL1_STARTER,
    solution: LEVEL1_SOLUTION,
    hint: '买卖 GOLD（不是 CORN）。在 tick 12 卖出（不是 11）。',
    companies: DEFAULT_COMPANIES,
    pricesByTick: LEVEL1_PRICES,
    startingCash: STARTING_CASH,
    listedEtfs: {},
    tables: buildPreviewTables(DEFAULT_COMPANIES, LEVEL1_PRICES),
    sourceChecks: [
      {
        name: '定义了 on_tick',
        pattern: 'def\\s+on_tick\\s*\\(',
        hint: 'def on_tick(market_data, user_data)',
      },
      {
        name: '使用了 can_buy',
        pattern: 'can_buy\\s*\\(',
        hint: 'market.can_buy(...)',
      },
      {
        name: '调用了 buy',
        pattern: 'market\\.buy\\s*\\(',
        hint: 'market.buy("GOLD")',
      },
      {
        name: '调用了 sell',
        pattern: 'market\\.sell\\s*\\(',
        hint: 'market.sell("GOLD")',
      },
    ],
    tests: [
      {
        name: '最终权益',
        includes: [`FINAL_EQUITY=${LEVEL1_EQUITY.toFixed(4)}`],
      },
      {
        name: '成交次数',
        includes: ['TRADES=2'],
      },
    ],
  },
  '2-energy-rule': {
    id: '2-energy-rule',
    title: '2 · 能源价格规则',
    prompt:
      '每个 tick 扫描 market_data（用 .iterrows()）。对 industry == "Energy"：若 ticker_price < 71 且能买则买 1；若 >= 74 且能卖则卖 1。可读 user_data，但不要写死 tick 数字。种子路径固定，权益每次相同。',
    starter: LEVEL2_STARTER,
    solution: LEVEL2_SOLUTION,
    hint: 'for _, row in market_data.iterrows()。过滤 industry == "Energy"。比较价格 71 / 74，再 can_buy/buy 或 can_sell/sell。',
    companies: DEFAULT_COMPANIES,
    pricesByTick: LEVEL2_PRICES,
    startingCash: STARTING_CASH,
    listedEtfs: {},
    tables: buildPreviewTables(DEFAULT_COMPANIES, LEVEL2_PRICES),
    sourceChecks: [
      {
        name: '定义了 on_tick',
        pattern: 'def\\s+on_tick\\s*\\(',
        hint: 'def on_tick(market_data, user_data)',
      },
      {
        name: '读取 industry 或 Energy',
        pattern: 'industry|Energy',
        hint: '按 industry / "Energy" 过滤',
      },
      {
        name: '不要写死 tick',
        pattern: 'market\\.tick\\s*==',
        must: false,
        hint: '本关不要写 market.tick == N',
      },
    ],
    tests: [
      {
        name: '最终权益',
        includes: [`FINAL_EQUITY=${Number(LEVEL2_EQUITY).toFixed(4)}`],
      },
    ],
  },
  '3-dividend-hold': {
    id: '3-dividend-hold',
    title: '3 · 股息工资（改错）',
    prompt:
      '改起始代码：tick 0 应买入 5 股 DIVY 并持有（不要卖）。股息会自动进现金。起始代码对 DIVY 做了 can_buy，但可能买错了股票——改对。',
    starter: LEVEL3_STARTER,
    solution: LEVEL3_SOLUTION,
    hint: '把 market.buy("GOLD", 5) 改成 market.buy("DIVY", 5)。不要 sell。',
    companies: DIVIDEND_ETF_COMPANIES,
    pricesByTick: DIV_ETF_PRICES,
    startingCash: STARTING_CASH,
    listedEtfs: LISTED_ETFS,
    tables: buildPreviewTables(DIVIDEND_ETF_COMPANIES, DIV_ETF_PRICES),
    sourceChecks: [
      {
        name: '定义了 on_tick',
        pattern: 'def\\s+on_tick\\s*\\(',
        hint: 'def on_tick(market_data, user_data)',
      },
      {
        name: '买入 DIVY',
        pattern: 'buy\\s*\\(\\s*[\'"]DIVY[\'"]',
        hint: 'market.buy("DIVY", 5)',
      },
      {
        name: '不要卖出',
        pattern: 'market\\.sell\\s*\\(',
        must: false,
        hint: '持有——不要调用 market.sell',
      },
    ],
    tests: [
      {
        name: '最终权益',
        includes: [`FINAL_EQUITY=${LEVEL3_EQUITY.toFixed(4)}`],
      },
      {
        name: '已派股息',
        includes: [`DIVIDENDS=${LEVEL3_DIVIDENDS.toFixed(4)}`],
      },
      {
        name: '一次买入',
        includes: ['TRADES=1'],
      },
    ],
  },
  '4-buy-listed-etf': {
    id: '4-buy-listed-etf',
    title: '4 · 买入上市 ETF（改错）',
    prompt:
      '改起始代码：tick 1 买入 1 股 CMDY，tick 8 卖出。其中一个 tick 写错了——打开 Data → timeline 看 CMDY，改掉卖出时刻。',
    starter: LEVEL4_STARTER,
    solution: LEVEL4_SOLUTION,
    hint: '在 tick 8 卖出（不是 9）。买入仍在 tick 1，代码 CMDY。',
    companies: DIVIDEND_ETF_COMPANIES,
    pricesByTick: DIV_ETF_PRICES,
    startingCash: STARTING_CASH,
    listedEtfs: LISTED_ETFS,
    tables: buildPreviewTables(DIVIDEND_ETF_COMPANIES, DIV_ETF_PRICES),
    sourceChecks: [
      {
        name: '定义了 on_tick',
        pattern: 'def\\s+on_tick\\s*\\(',
        hint: 'def on_tick(market_data, user_data)',
      },
      {
        name: '交易 CMDY',
        pattern: '[\'"]CMDY[\'"]',
        hint: '使用代码 "CMDY"',
      },
    ],
    tests: [
      {
        name: '最终权益',
        includes: [`FINAL_EQUITY=${Number(LEVEL4_EQUITY).toFixed(4)}`],
      },
      {
        name: '一买一卖',
        includes: ['TRADES=2'],
      },
    ],
  },
  '5-design-etf': {
    id: '5-design-etf',
    title: '5 · 设计自己的 ETF',
    prompt:
      'Tick 0 调用 market.define_etf("MYETF", {"GOLD": 0.6, "CORN": 0.4})。Tick 1 买入 1 股 MYETF；tick 9 卖出。权重之和应为 1。定义后 MYETF 可像普通股票一样交易。',
    starter: LEVEL5_STARTER,
    solution: LEVEL5_SOLUTION,
    hint: 'Tick 0: define_etf。Tick 1: buy("MYETF")。Tick 9: sell("MYETF")。',
    companies: DIVIDEND_ETF_COMPANIES,
    pricesByTick: DIV_ETF_PRICES,
    startingCash: STARTING_CASH,
    listedEtfs: LISTED_ETFS,
    tables: buildPreviewTables(DIVIDEND_ETF_COMPANIES, DIV_ETF_PRICES),
    sourceChecks: [
      {
        name: '定义了 on_tick',
        pattern: 'def\\s+on_tick\\s*\\(',
        hint: 'def on_tick(market_data, user_data)',
      },
      {
        name: '调用了 define_etf',
        pattern: 'define_etf\\s*\\(',
        hint: 'market.define_etf("MYETF", {"GOLD": 0.6, "CORN": 0.4})',
      },
      {
        name: '买入 MYETF',
        pattern: 'buy\\s*\\(\\s*[\'"]MYETF[\'"]',
        hint: 'market.buy("MYETF")',
      },
    ],
    tests: [
      {
        name: '最终权益',
        includes: [`FINAL_EQUITY=${Number(LEVEL5_EQUITY).toFixed(4)}`],
      },
    ],
  },
  '6-print-cash': {
    id: '6-print-cash',
    title: '6 · 每步打印现金',
    prompt:
      'Tick 0 买入 1 股 DIVY 并持有。每个 tick 用 print("CASH=%.4f" % user_data["cash"])（或 market.cash）打印现金。分红会自动增加现金——买入后应看到 CASH= 行逐渐上升。',
    starter: LEVEL6_STARTER,
    solution: LEVEL6_SOLUTION,
    hint: 'Tick 0 买一次 DIVY，然后每个 tick：print("CASH=%.4f" % user_data["cash"])。不要卖。',
    companies: DIVIDEND_ETF_COMPANIES,
    pricesByTick: DIV_ETF_PRICES,
    startingCash: STARTING_CASH,
    listedEtfs: LISTED_ETFS,
    tables: buildPreviewTables(DIVIDEND_ETF_COMPANIES, DIV_ETF_PRICES),
    sourceChecks: [
      {
        name: '定义了 on_tick',
        pattern: 'def\\s+on_tick\\s*\\(',
        hint: 'def on_tick(market_data, user_data)',
      },
      {
        name: '打印了 CASH',
        pattern: 'print\\s*\\(.*CASH',
        hint: 'print("CASH=%.4f" % user_data["cash"])',
      },
      {
        name: '读取了 cash',
        pattern: 'user_data\\s*\\[\\s*[\'"]cash[\'"]\\s*\\]|market\\.cash',
        hint: 'user_data["cash"] 或 market.cash',
      },
    ],
    tests: [
      {
        name: '打印了现金行',
        includes: ['CASH=', `CASH=${(STARTING_CASH - 100).toFixed(4)}`],
      },
      {
        name: '最终权益',
        includes: [`FINAL_EQUITY=${LEVEL6_EQUITY.toFixed(4)}`],
      },
      {
        name: '股息',
        includes: [`DIVIDENDS=${LEVEL6_DIVIDENDS.toFixed(4)}`],
      },
    ],
  },
  '7-total-equity': {
    id: '7-total-equity',
    title: '7 · 计算总权益',
    prompt:
      'Tick 0 买入 1 股 GOLD 并持有。每个 tick 用 market.total_equity() 打印 EQUITY=%.4f —— 该方法 = 现金 + 本 tick 持仓市值。与 user_data["equity"] 相同。',
    starter: LEVEL7_STARTER,
    solution: LEVEL7_SOLUTION,
    hint: 'if market.tick == 0: 买 GOLD。然后每个 tick：print("EQUITY=%.4f" % market.total_equity())。',
    companies: DIVIDEND_ETF_COMPANIES,
    pricesByTick: DIV_ETF_PRICES,
    startingCash: STARTING_CASH,
    listedEtfs: LISTED_ETFS,
    tables: buildPreviewTables(DIVIDEND_ETF_COMPANIES, DIV_ETF_PRICES),
    sourceChecks: [
      {
        name: '定义了 on_tick',
        pattern: 'def\\s+on_tick\\s*\\(',
        hint: 'def on_tick(market_data, user_data)',
      },
      {
        name: '调用了 total_equity',
        pattern: 'total_equity\\s*\\(',
        hint: 'market.total_equity()',
      },
      {
        name: '打印了 EQUITY',
        pattern: 'print\\s*\\(.*EQUITY',
        hint: 'print("EQUITY=%.4f" % market.total_equity())',
      },
    ],
    tests: [
      {
        name: '打印了权益',
        includes: ['EQUITY=', `EQUITY=${LEVEL7_EQUITY.toFixed(4)}`],
      },
      {
        name: '最终权益',
        includes: [`FINAL_EQUITY=${LEVEL7_EQUITY.toFixed(4)}`],
      },
    ],
  },
};

export function getLevel(levelId) {
  return LEVELS[levelId] || null;
}
