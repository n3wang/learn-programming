/**
 * Math questions shared by the party games (Clocktower University homework,
 * the Secret Math Teacher's vote check). Pure: pass an rng, get a question.
 *
 * A question is {pool, lines, hint, a}: `lines` are shown one per row
 * (language-neutral maths), `hint` names a short instruction in HINTS
 * (or null), and `a` is the one accepted answer as typed on the pad:
 * a whole number ("12", "-7") or a fraction in simplest form ("3/4").
 */

export const POOLS = ['basic', 'chain', 'fractions', 'linear', 'systems'];

export const POOL_LABEL = {
  basic: {en: 'Whole numbers (+ − ×)', zh: '整数（+ − ×）'},
  chain: {en: 'Whole numbers 2 (order of operations, negatives)', zh: '整数进阶（运算顺序、负数）'},
  fractions: {en: 'Fractions (× and simplify)', zh: '分数（乘法与约分）'},
  linear: {en: 'Solve for x', zh: '解方程求 x'},
  systems: {en: 'Systems of equations', zh: '二元一次方程组'},
};

export const HINTS = {
  simplest: {en: 'Answer in simplest form.', zh: '答案写成最简形式。'},
  simplify: {en: 'Simplify the fraction.', zh: '把分数约到最简。'},
};

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

/** n/d in simplest form; a whole number when it divides out. */
function frac(n, d) {
  const g = gcd(n, d);
  return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`;
}

/** The pools a setting asks for, in a stable order; ['basic'] when none are valid. */
export function normalizePools(pools) {
  const list = Array.isArray(pools) ? pools : [pools];
  const ok = POOLS.filter((k) => list.includes(k));
  return ok.length ? ok : ['basic'];
}

/** Value of nums joined by ops ('+', '−', '×'), multiplying before adding and subtracting. */
function evalChain(nums, ops) {
  const terms = [nums[0]];
  const signs = [1];
  ops.forEach((op, i) => {
    if (op === '×') terms[terms.length - 1] *= nums[i + 1];
    else {
      terms.push(nums[i + 1]);
      signs.push(op === '+' ? 1 : -1);
    }
  });
  return terms.reduce((sum, t, i) => sum + signs[i] * t, 0);
}

/** "3x − 2y = −4" from ax + by = c (a, b ≠ 0); flipped so it never starts with a minus. */
function eq(a, b, c) {
  if (a < 0) return eq(-a, -b, -c);
  const term = (n, v) => `${Math.abs(n) === 1 ? '' : Math.abs(n)}${v}`;
  return `${term(a, 'x')} ${b < 0 ? '−' : '+'} ${term(b, 'y')} = ${c < 0 ? `−${-c}` : c}`;
}

const GEN = {
  basic(r) {
    const kind = r(0, 2);
    if (kind === 0) {
      const a = r(12, 89);
      const b = r(11, Math.max(11, 99 - a));
      return {lines: [`${a} + ${b} = ?`], a: String(a + b)};
    }
    if (kind === 1) {
      const a = r(20, 99);
      const b = r(5, a);
      return {lines: [`${a} − ${b} = ?`], a: String(a - b)};
    }
    const a = r(2, 12);
    const b = r(2, 12);
    return {lines: [`${a} × ${b} = ?`], a: String(a * b)};
  },

  // 3–5 numbers mixing + − × (at least one × and one + or −, so the order
  // matters); half get brackets, always placed where they change the answer.
  // Answers may be negative and stay within ±150.
  chain(r) {
    for (let tries = 0; tries < 200; tries++) {
      const n = r(3, 5);
      const nums = Array.from({length: n}, () => r(1, 12));
      const ops = Array.from({length: n - 1}, () => ['+', '−', '×'][r(0, 2)]);
      const times = ops.filter((o) => o === '×').length;
      if (!times || times > 2 || times === ops.length) continue;
      let group = null;
      let value = evalChain(nums, ops);
      if (r(0, 1) === 0) {
        const i = r(0, n - 2);
        const j = r(i + 1, Math.min(n - 1, i + 2));
        if (i === 0 && j === n - 1) continue;
        const inner = evalChain(nums.slice(i, j + 1), ops.slice(i, j));
        const withGroup = evalChain([...nums.slice(0, i), inner, ...nums.slice(j + 1)], [...ops.slice(0, i), ...ops.slice(j)]);
        if (withGroup === value) continue;
        group = [i, j];
        value = withGroup;
      }
      if (Math.abs(value) > 150) continue;
      const text = nums
        .map((v, k) => `${group && k === group[0] ? '(' : ''}${v}${group && k === group[1] ? ')' : ''}${k < ops.length ? ` ${ops[k]} ` : ''}`)
        .join('');
      return {lines: [`${text} = ?`], a: String(value)};
    }
    return GEN.basic(r);
  },

  fractions(r) {
    if (r(0, 1) === 0) {
      // Simplify: a proper fraction scaled up by 2–6.
      const d = r(3, 9);
      const n = r(1, d - 1);
      const k = r(2, 6);
      return {lines: [`${n * k}/${d * k} = ?`], hint: 'simplify', a: frac(n, d)};
    }
    const b = r(2, 9);
    const d = r(2, 9);
    const a = r(1, b - 1);
    const c = r(1, d - 1);
    return {lines: [`${a}/${b} × ${c}/${d} = ?`], hint: 'simplest', a: frac(a * c, b * d)};
  },

  linear(r) {
    const x = r(1, 12);
    const k = r(2, 9);
    if (r(0, 1) === 0) {
      const b = r(1, 20);
      return {lines: [`${k}x + ${b} = ${k * x + b}`, 'x = ?'], a: String(x)};
    }
    const b = r(1, k * x);
    return {lines: [`${k}x − ${b} = ${k * x - b}`, 'x = ?'], a: String(x)};
  },

  // Two equations that fall apart by adding or subtracting them, at most
  // after multiplying one of them by 2 or 3 (e.g. 3x + 2y = 16, x + y = 6).
  systems(r) {
    const x = r(1, 9);
    const y = r(1, 9);
    const ask = r(0, 1) === 0 ? 'x' : 'y';
    // Second equation: small coefficients p·u + q·v. The first matches it on
    // one letter after a ×k (k = 1, 2 or 3) and differs on the other.
    const p = r(1, 3);
    const q = r(1, 3) * (r(0, 1) === 0 ? 1 : -1);
    const k = r(1, 3);
    let s;
    do s = r(1, 4) * (r(0, 1) === 0 ? 1 : -1);
    while (s === k * q);
    // Eliminate x or y: swap which letter carries the matching coefficient.
    const [ax1, by1, ax2, by2] = r(0, 1) === 0 ? [k * p, s, p, q] : [s, k * p, q, p];
    return {lines: [eq(ax1, by1, ax1 * x + by1 * y), eq(ax2, by2, ax2 * x + by2 * y), `${ask} = ?`], a: String(ask === 'x' ? x : y)};
  },
};

export function makeQuestion(pools, rng) {
  const r = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const list = normalizePools(pools);
  const pool = list[Math.floor(rng() * list.length)];
  return {pool, hint: null, ...GEN[pool](r)};
}

/** True when the typed answer is exactly the expected one (fractions must be in simplest form). */
export function checkAnswer(question, input) {
  const typed = String(input == null ? '' : input).replace(/\s+/g, '').replace(/−/g, '-');
  return Boolean(question) && /^-?\d+(\/\d+)?$/.test(typed) && typed === question.a;
}
