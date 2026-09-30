/**
 * Build a Piston Python program: broker + tick loop + student on_tick + summary prints.
 */

function pyRepr(value) {
  return JSON.stringify(value);
}

/**
 * @param {{
 *   companies: Array<{ticker: string, company_name: string, industry: string, market_cap: number, description: string, dividend_per_tick?: number}>,
 *   pricesByTick: Array<Record<string, number>>,
 *   startingCash: number,
 *   listedEtfs?: Record<string, Record<string, number>>,
 *   studentCode: string,
 * }} opts
 */
export function buildTradingRunner({
  companies,
  pricesByTick,
  startingCash = 10000,
  listedEtfs = {},
  studentCode,
}) {
  const companyLit = companies.map((c) => ({
    ticker: c.ticker,
    company_name: c.company_name,
    industry: c.industry,
    market_cap: c.market_cap,
    dividend_per_tick: c.dividend_per_tick ?? 0,
    description: c.description,
  }));

  const prefix = `#!/usr/bin/env python3
# Trading sim runner — framework owns the clock; student implements on_tick.
COMPANIES = ${pyRepr(companyLit)}
PRICES_BY_TICK = ${pyRepr(pricesByTick)}
STARTING_CASH = ${pyRepr(startingCash)}
LISTED_ETFS = ${pyRepr(listedEtfs || {})}

class _Row(dict):
    __getattr__ = dict.get

class DataFrame:
    """Minimal DataFrame shim (pandas-compatible enough for these drills)."""
    def __init__(self, rows):
        self._rows = [_Row(r) for r in rows]
        self.columns = list(rows[0].keys()) if rows else []
    def __len__(self):
        return len(self._rows)
    def __getitem__(self, key):
        if isinstance(key, str):
            return [r[key] for r in self._rows]
        raise TypeError("column name required")
    def iterrows(self):
        for i, r in enumerate(self._rows):
            yield i, r
    def records(self):
        return list(self._rows)

try:
    import pandas as pd  # noqa: F401
    def _as_frame(rows):
        return pd.DataFrame(rows)
except Exception:
    def _as_frame(rows):
        return DataFrame(rows)

class Market:
    def __init__(self, starting_cash):
        self.tick = 0
        self.cash = float(starting_cash)
        self.positions = {}
        self.history = []
        self.trade_count = 0
        self.dividends_received = 0.0
        self._prices = {}
        self._known = {c["ticker"] for c in COMPANIES}
        self._dividends = {c["ticker"]: float(c.get("dividend_per_tick") or 0) for c in COMPANIES}
        self._etfs = {k: dict(v) for k, v in LISTED_ETFS.items()}
        for etf in self._etfs:
            self._known.add(etf)

    def _qty(self, qty):
        q = int(qty)
        if q < 1:
            raise ValueError("qty must be a positive integer")
        return q

    def _refresh_etf_prices(self):
        for etf, weights in self._etfs.items():
            total = 0.0
            ok = True
            for t, w in weights.items():
                if t not in self._prices:
                    ok = False
                    break
                total += float(w) * float(self._prices[t])
            if ok:
                self._prices[etf] = round(total, 4)

    def _price(self, ticker):
        if ticker not in self._prices:
            return None
        return float(self._prices[ticker])

    def position(self, ticker):
        return int(self.positions.get(ticker, 0))

    def stock_value(self):
        """Mark-to-market value of all holdings (not including cash)."""
        total = 0.0
        for t, q in self.positions.items():
            p = self._price(t)
            if p is not None:
                total += q * p
        return total

    def total_equity(self):
        """Cash + stock value (total wealth at this tick's prices)."""
        return self.cash + self.stock_value()

    def equity(self):
        return self.total_equity()

    def can_buy(self, ticker, qty=1):
        q = self._qty(qty)
        if ticker not in self._known:
            return False
        p = self._price(ticker)
        if p is None:
            return False
        return self.cash + 1e-9 >= q * p

    def can_sell(self, ticker, qty=1):
        q = self._qty(qty)
        if ticker not in self._known:
            return False
        return self.position(ticker) >= q

    def buy(self, ticker, qty=1):
        q = self._qty(qty)
        if not self.can_buy(ticker, q):
            print("WARN: cannot buy %s x%s" % (ticker, q))
            return False
        p = self._price(ticker)
        cost = q * p
        self.cash -= cost
        self.positions[ticker] = self.position(ticker) + q
        self.trade_count += 1
        self.history.append({
            "tick": self.tick,
            "side": "buy",
            "ticker": ticker,
            "qty": q,
            "price": p,
            "cash": self.cash,
        })
        return True

    def sell(self, ticker, qty=1):
        q = self._qty(qty)
        if not self.can_sell(ticker, q):
            print("WARN: cannot sell %s x%s" % (ticker, q))
            return False
        p = self._price(ticker)
        self.cash += q * p
        left = self.position(ticker) - q
        if left:
            self.positions[ticker] = left
        else:
            self.positions.pop(ticker, None)
        self.trade_count += 1
        self.history.append({
            "tick": self.tick,
            "side": "sell",
            "ticker": ticker,
            "qty": q,
            "price": p,
            "cash": self.cash,
        })
        return True

    def define_etf(self, ticker, weights):
        """Create (or replace) an ETF whose price is a weighted mix of listed tickers."""
        name = str(ticker).strip().upper()
        if not name:
            print("WARN: define_etf needs a ticker name")
            return False
        if not isinstance(weights, dict) or not weights:
            print("WARN: define_etf weights must be a non-empty dict like {'GOLD': 0.5, 'CORN': 0.5}")
            return False
        cleaned = {}
        total_w = 0.0
        for t, w in weights.items():
            key = str(t).strip().upper()
            ww = float(w)
            if ww <= 0:
                print("WARN: weight for %s must be positive" % key)
                return False
            if key not in self._prices and key not in {c["ticker"] for c in COMPANIES}:
                # allow if it will appear in price path / companies
                pass
            cleaned[key] = ww
            total_w += ww
        if abs(total_w - 1.0) > 1e-6:
            print("WARN: ETF weights should sum to 1.0 (got %.4f) — normalizing" % total_w)
            cleaned = {k: v / total_w for k, v in cleaned.items()}
        self._etfs[name] = cleaned
        self._known.add(name)
        self._dividends[name] = 0.0
        self._refresh_etf_prices()
        self.history.append({
            "tick": self.tick,
            "side": "define_etf",
            "ticker": name,
            "weights": dict(cleaned),
            "cash": self.cash,
        })
        return True

    def pay_dividends(self):
        """Credit cash for every share held (updates market.cash / user_data['cash'])."""
        paid = 0.0
        for t, q in list(self.positions.items()):
            div = float(self._dividends.get(t, 0) or 0)
            if q > 0 and div > 0:
                cash_in = q * div
                self.cash += cash_in
                paid += cash_in
                self.history.append({
                    "tick": self.tick,
                    "side": "dividend",
                    "ticker": t,
                    "qty": q,
                    "price": div,
                    "cash": self.cash,
                })
        self.dividends_received += paid
        return paid

    def snapshot_user_data(self):
        return {
            "cash": self.cash,
            "positions": dict(self.positions),
            "equity": self.total_equity(),
            "stock_value": self.stock_value(),
            "history": list(self.history),
            "tick": self.tick,
            "dividends_received": self.dividends_received,
            "etfs": {k: dict(v) for k, v in self._etfs.items()},
        }

    def user_data(self):
        return self.snapshot_user_data()

    def market_data(self):
        rows = []
        seen = set()
        for c in COMPANIES:
            t = c["ticker"]
            seen.add(t)
            if t not in self._prices:
                continue
            rows.append({
                "company_name": c["company_name"],
                "industry": c["industry"],
                "market_cap": c["market_cap"],
                "ticker_price": float(self._prices[t]),
                "ticker": t,
                "dividend_per_tick": float(c.get("dividend_per_tick") or 0),
                "description": c["description"],
            })
        for etf, weights in self._etfs.items():
            if etf in seen or etf not in self._prices:
                continue
            rows.append({
                "company_name": etf + " (custom ETF)",
                "industry": "ETF",
                "market_cap": 0,
                "ticker_price": float(self._prices[etf]),
                "ticker": etf,
                "dividend_per_tick": 0.0,
                "description": "Custom ETF weights: " + str(weights),
            })
        return _as_frame(rows)

class LiveUserData:
    """Dict-like view: user_data['cash'] always reads live market.cash (incl. dividends)."""
    def __init__(self, m):
        self._m = m
    def __getitem__(self, key):
        snap = self._m.snapshot_user_data()
        if key not in snap:
            raise KeyError(key)
        return snap[key]
    def get(self, key, default=None):
        snap = self._m.snapshot_user_data()
        return snap.get(key, default)
    def keys(self):
        return self._m.snapshot_user_data().keys()
    def __contains__(self, key):
        return key in self._m.snapshot_user_data()
    def __repr__(self):
        return repr(self._m.snapshot_user_data())

market = Market(STARTING_CASH)

# --- student code ---
`;

  const suffix = `
# --- end student code ---

if "on_tick" not in globals() or not callable(globals().get("on_tick")):
    raise SystemExit("Define on_tick(market_data, user_data) before the sim runs.")

for tick_i, px in enumerate(PRICES_BY_TICK):
    market.tick = tick_i
    market._prices = {k: float(v) for k, v in px.items()}
    market._refresh_etf_prices()
    md = market.market_data()
    ud = LiveUserData(market)
    on_tick(md, ud)
    # Dividends credit cash immediately — next tick's user_data['cash'] / market.cash include them
    market.pay_dividends()

print("FINAL_CASH=%.4f" % market.cash)
print("FINAL_EQUITY=%.4f" % market.total_equity())
print("TRADES=%d" % market.trade_count)
print("DIVIDENDS=%.4f" % market.dividends_received)
`;

  return prefix + String(studentCode || '').replace(/\s+$/, '') + suffix;
}
