/**
 * Math questions shared by the party games (Clocktower University homework,
 * the Secret Math Teacher's vote check). Pure: pass an rng, get a question.
 *
 * A question is {pool, lines, hint, a}: `lines` are shown one per row
 * (language-neutral maths), `hint` names a short instruction in HINTS
 * (or null), and `a` is the one accepted answer as typed on the pad:
 * a whole number ("12", "-7") or a fraction in simplest form ("3/4").
 * The `degrees` pool is grade-7 chapter 6 angle measure (习题 6.3 style).
 * The `inequalities` pool is grade-8 ch. 11: solve linear inequalities
 * (negative ×/÷ flips the sign) and systems of inequalities.
 */

export const POOLS = ['basic', 'chain', 'fractions', 'linear', 'systems', 'degrees', 'inequalities'];

export const POOL_LABEL = {
  basic: {en: 'Whole numbers (+ − ×)', zh: '整数（+ − ×）'},
  chain: {en: 'Whole numbers 2 (order of operations, negatives)', zh: '整数进阶（运算顺序、负数）'},
  fractions: {en: 'Fractions (× and simplify)', zh: '分数（乘法与约分）'},
  linear: {en: 'Solve for x', zh: '解方程求 x'},
  systems: {en: 'Systems of equations', zh: '二元一次方程组'},
  degrees: {en: 'Degrees (angles)', zh: '角度（度数）'},
  inequalities: {en: 'Inequalities', zh: '不等式'},
};

export const HINTS = {
  simplest: {en: 'Answer in simplest form.', zh: '答案写成最简形式。'},
  simplify: {en: 'Simplify the fraction.', zh: '把分数约到最简。'},
  ineq: {en: 'Type >3, ≤−2, 1<x≤4, or ∅.', zh: '输入 >3、≤−2、1<x≤4，或 ∅。'},
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

const FLIP = {'<': '>', '>': '<', '≤': '≥', '≥': '≤'};
const OPS = ['<', '>', '≤', '≥'];

function dash(n) {
  return n < 0 ? `−${-n}` : String(n);
}

function coefX(k) {
  if (k === 1) return 'x';
  if (k === -1) return '−x';
  return `${dash(k)}x`;
}

/** "3x − 2" / "−x + 5" / "x" from ax + b. */
function linearExpr(a, b) {
  let out = a === 0 ? '' : coefX(a);
  if (a === 0) return dash(b);
  if (b > 0) out += ` + ${b}`;
  else if (b < 0) out += ` − ${-b}`;
  return out;
}

function pickOp(r) {
  return OPS[r(0, 3)];
}

/** Canonical one-sided answer stored without a leading x: ">3", "≤−2". */
function oneSided(op, bound) {
  return `${op}${bound}`;
}

/** Normalize typed inequality answers for comparison. */
export function normalizeIneqAnswer(s) {
  let t = String(s == null ? '' : s)
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/无解/g, '∅')
    .replace(/none/gi, '∅')
    .replace(/empty/gi, '∅');
  // Allow "x>3" for a one-sided answer stored as ">3".
  if (/^x[<>≤≥]/.test(t)) t = t.slice(1);
  return t;
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

  // Grade-7 chapter 6 angle measure, core quick problems only: complement,
  // supplement, bisector, sum / difference, equal slices of 360°, clock at
  // a whole hour. Every answer is a short, round whole number.
  degrees(r) {
    const kind = r(0, 6);
    if (kind === 0) {
      // Complement of an acute angle.
      const a = r(1, 8) * 10;
      return {lines: [`∠A = ${a}°`, '90° − ∠A = ?°'], a: String(90 - a)};
    }
    if (kind === 1) {
      // Supplement.
      const a = r(1, 17) * 10;
      return {lines: [`∠A = ${a}°`, '180° − ∠A = ?°'], a: String(180 - a)};
    }
    if (kind === 2) {
      // Angle bisector: half of a round angle.
      const half = r(1, 8) * 10;
      return {lines: [`∠AOB = ${half * 2}°`, 'OC bisects ∠AOB', '∠AOC = ?°'], a: String(half)};
    }
    if (kind === 3) {
      // Sum or difference of two angles sharing a ray.
      const aoc = r(2, 6) * 10;
      const aob = aoc + r(1, 6) * 10;
      return r(0, 1) === 0
        ? {lines: [`${aob}° − ${aoc}° = ?°`], a: String(aob - aoc)}
        : {lines: [`${aob}° + ${aoc}° = ?°`], a: String(aob + aoc)};
    }
    if (kind === 4) {
      // Equal central angles: 360 ÷ n with a round result.
      const n = [3, 4, 6, 9, 12, 18, 36][r(0, 6)];
      return {lines: [`360° ÷ ${n} = ?°`], a: String(360 / n)};
    }
    if (kind === 5) {
      // Clock hands at a whole hour: 30° per hour.
      const h = r(1, 6);
      return {lines: [`${h}:00 → ?°`], a: String(h * 30)};
    }
    // One clock step: hour hand per hour, minute hand per minute.
    return r(0, 1) === 0
      ? {lines: ['360° ÷ 12 = ?°'], a: '30'}
      : {lines: ['360° ÷ 60 = ?°'], a: '6'};
  },

  // Grade-8 ch. 11, core quick problems: one- or two-step linear inequalities
  // (negative ×/÷ flips the sign) and simple systems. Bounds stay small
  // whole numbers. Answer forms: ">3", "≤−2", "1<x≤4", "∅".
  inequalities(r) {
    // ~80% single inequalities, ~20% very simple systems.
    const kind = r(0, 9);
    const op = pickOp(r);
    const bound = r(1, 6) * (r(0, 1) === 0 ? 1 : -1);
    const k = r(2, 5);
    if (kind <= 2) {
      // −kx ∘ −k·bound → divide by −k and flip.
      return {lines: [`${coefX(-k)} ${FLIP[op]} ${dash(-k * bound)}`, 'x ?'], hint: 'ineq', a: oneSided(op, bound)};
    }
    if (kind <= 4) {
      // kx ∘ k·bound → no flip.
      return {lines: [`${coefX(k)} ${op} ${dash(k * bound)}`, 'x ?'], hint: 'ineq', a: oneSided(op, bound)};
    }
    if (kind <= 7) {
      // Two steps: ±kx + p ∘ c (flip when the coefficient is negative).
      const neg = r(0, 1) === 0;
      const p = r(1, 9) * (r(0, 1) === 0 ? 1 : -1);
      const a = neg ? -k : k;
      const shown = neg ? FLIP[op] : op;
      return {lines: [`${linearExpr(a, p)} ${shown} ${dash(a * bound + p)}`, 'x ?'], hint: 'ineq', a: oneSided(op, bound)};
    }
    // —— simple systems: one half is already "x ∘ n", the other is x + p ∘ q ——
    const half = (dir, at, closed, plain) => {
      const rel = dir === 'right' ? (closed ? '≥' : '>') : closed ? '≤' : '<';
      if (plain) return `x ${rel} ${dash(at)}`;
      const p = r(1, 3);
      return `x + ${p} ${rel} ${dash(at + p)}`;
    };
    const lo = r(-3, 2);
    const hi = lo + r(2, 4);
    const plainFirst = r(0, 1) === 0;
    if (kind === 8 || r(0, 2) > 0) {
      const loClosed = r(0, 1) === 1;
      const hiClosed = r(0, 1) === 1;
      return {
        lines: [`{ ${half('right', lo, loClosed, plainFirst)}`, `{ ${half('left', hi, hiClosed, !plainFirst)}`, '?'],
        hint: 'ineq',
        a: `${lo}${loClosed ? '≤' : '<'}x${hiClosed ? '≤' : '<'}${hi}`,
      };
    }
    // No overlap: x ≥ hi and x < lo.
    return {lines: [`{ ${half('right', hi, true, plainFirst)}`, `{ ${half('left', lo, false, !plainFirst)}`, '?'], hint: 'ineq', a: '∅'};
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
  if (!question) return false;
  if (question.pool === 'inequalities') {
    return normalizeIneqAnswer(input) === normalizeIneqAnswer(question.a);
  }
  const typed = String(input == null ? '' : input).replace(/\s+/g, '').replace(/−/g, '-');
  return /^-?\d+(\/\d+)?$/.test(typed) && typed === question.a;
}
