/**
 * Minimal exact polynomial algebra for the 整式 / 分式 generators.
 * A polynomial is { [monomialKey]: coef } with integer (or rational-as-number) coefs;
 * monomialKey is like "a2b1" over sorted variable letters ("" = constant).
 * Display order follows `order` (default alphabetical), highest total degree first.
 */

function keyOf(exps) {
  return Object.keys(exps)
    .filter((v) => exps[v] !== 0)
    .sort()
    .map((v) => `${v}${exps[v]}`)
    .join('');
}

function expsOf(key) {
  const out = {};
  const re = /([a-z])(\d+)/g;
  let mt;
  while ((mt = re.exec(key))) out[mt[1]] = Number(mt[2]);
  return out;
}

const clean = (p) => {
  const q = {};
  Object.entries(p).forEach(([k, c]) => {
    if (Math.abs(c) > 1e-12) q[k] = c;
  });
  return q;
};

/** Monomial c · x^ex · y^ey …  e.g. mono(3, { a: 2, b: 1 }) = 3a²b */
export const mono = (c, exps = {}) => clean({ [keyOf(exps)]: c });

/** Linear a·v + b. */
export const linP = (a, v, b) => add(mono(a, { [v]: 1 }), mono(b));

export function add(...ps) {
  const out = {};
  ps.forEach((p) => Object.entries(p).forEach(([k, c]) => (out[k] = (out[k] || 0) + c)));
  return clean(out);
}

export const scale = (p, s) => clean(Object.fromEntries(Object.entries(p).map(([k, c]) => [k, c * s])));
export const sub = (p, q) => add(p, scale(q, -1));

export function mul(...ps) {
  return ps.reduce((acc, p) => {
    const out = {};
    Object.entries(acc).forEach(([k1, c1]) =>
      Object.entries(p).forEach(([k2, c2]) => {
        const e = expsOf(k1);
        Object.entries(expsOf(k2)).forEach(([v, n]) => (e[v] = (e[v] || 0) + n));
        const k = keyOf(e);
        out[k] = (out[k] || 0) + c1 * c2;
      }),
    );
    return clean(out);
  }, { '': 1 });
}

export const pow = (p, n) => mul(...Array.from({ length: n }, () => p));

const deg = (k) => Object.values(expsOf(k)).reduce((s, n) => s + n, 0);

function sortedTerms(p, order) {
  const rank = (k) => {
    const e = expsOf(k);
    return order.map((v) => e[v] || 0);
  };
  return Object.entries(p).sort(([a], [b]) => {
    const d = deg(b) - deg(a);
    if (d) return d;
    const ra = rank(a);
    const rb = rank(b);
    for (let i = 0; i < ra.length; i++) if (ra[i] !== rb[i]) return rb[i] - ra[i];
    return 0;
  });
}

function varsIn(p) {
  const s = new Set();
  Object.keys(p).forEach((k) => Object.keys(expsOf(k)).forEach((v) => s.add(v)));
  return [...s].sort();
}

function monoBody(k, order, texMode) {
  const e = expsOf(k);
  return order
    .filter((v) => e[v])
    .map((v) => (e[v] === 1 ? v : texMode ? `${v}^{${e[v]}}` : `${v}^${e[v]}`))
    .join(texMode ? '' : '*');
}

function coefStr(c, texMode) {
  const r = Math.round(c * 1e9) / 1e9;
  if (Number.isInteger(r)) return String(Math.abs(r));
  // simple fractions with small denominators
  for (let d = 2; d <= 12; d++) {
    const n = Math.round(Math.abs(r) * d);
    if (Math.abs(n / d - Math.abs(r)) < 1e-9) return texMode ? `\\dfrac{${n}}{${d}}` : `${n}/${d}`;
  }
  return String(Math.abs(r));
}

function render(p, order, texMode) {
  const ord = order || varsIn(p);
  const terms = sortedTerms(p, ord);
  if (!terms.length) return '0';
  return terms
    .map(([k, c], i) => {
      const body = monoBody(k, ord, texMode);
      const abs = Math.abs(c);
      let core;
      if (!body) core = coefStr(c, texMode);
      else if (Math.abs(abs - 1) < 1e-12) core = body;
      else core = texMode ? `${coefStr(c, true)}${body}` : `${coefStr(c, false)}*${body}`;
      const sign = c < 0 ? '-' : '+';
      if (i === 0) return c < 0 ? `-${core}` : core;
      return ` ${sign} ${core}`;
    })
    .join('');
}

/** TeX, e.g. 3a^{2}b - 2ab + 1 */
export const tex = (p, order) => render(p, order, true);
/** Plain string for exprCheck, e.g. 3*a^2*b - 2*a*b + 1 */
export const plain = (p, order) => render(p, order, false);

export const isZero = (p) => Object.keys(p).length === 0;
export const termCount = (p) => Object.keys(p).length;

/** Wrap a polynomial in parentheses when it has more than one term (or a leading minus). */
export const texParen = (p, order) => (termCount(p) > 1 || Object.values(p)[0] < 0 ? `(${tex(p, order)})` : tex(p, order));
export const plainParen = (p, order) => `(${plain(p, order)})`;
