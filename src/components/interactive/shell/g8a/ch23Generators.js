import { randInt, pickOne } from '../mathRandom';
import { m, nonzero, fracTex, gcd } from '../examKit';
import { exprField } from './ch21Generators';

/** 第二十三章 二次根式 — randomized items for MixedPractice. */

const SQFREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];

/** √n = k√r with r square-free. */
export function simplifyRoot(n) {
  let k = 1;
  let r = n;
  for (let d = 2; d * d <= r; d++) {
    while (r % (d * d) === 0) {
      r /= d * d;
      k *= d;
    }
  }
  return [k, r];
}
const rootTex = (k, r) => (r === 1 ? `${k}` : `${k === 1 ? '' : k === -1 ? '-' : k}\\sqrt{${r}}`);
const rootPlain = (k, r) => (r === 1 ? `${k}` : `${k}*√${r}`);
const radField = (k, r, opts = {}) => exprField(rootPlain(k, r), { form: 'radical', placeholder: '如 3√2（√ 可写 sqrt）', ...opts });

/* ---------------- 23.1 二次根式 ---------------- */

/** √(ax + b) 有意义 */
export function genRootDefined() {
  const x = pickOne(['x', 'a', 'm']);
  const a = nonzero(-5, 5);
  const b = nonzero(-12, 12);
  const inDen = Math.random() < 0.35;
  // ax + b ≥ 0  (or > 0 when in a denominator)
  const bound = -b / a;
  const strict = inDen;
  const op = a > 0 ? (strict ? '>' : '≥') : strict ? '<' : '≤';
  const opTex = { '>': '>', '≥': '\\ge', '<': '<', '≤': '\\le' }[op];
  const inner = `${a === 1 ? '' : a === -1 ? '-' : a}${x} ${b < 0 ? '-' : '+'} ${Math.abs(b)}`;
  const shown = inDen ? `\\dfrac{1}{\\sqrt{${inner}}}` : `\\sqrt{${inner}}`;
  return {
    prompt: `当 ${m(x)} 是怎样的实数时，${m(shown)} 在实数范围内有意义？`,
    steps: [
      inDen ? '被开方数必须 ≥ 0；它又在分母里，分母不能为 0，所以被开方数 > 0。' : '二次根式有意义 ⇔ 被开方数 ≥ 0。',
      `${m(`${inner} ${inDen ? '>' : '\\ge'} 0`)}${a < 0 ? '，两边除以负数要变号' : ''}，得 ${m(`${x} ${opTex} ${fracTex(-b, a)}`)}。`,
    ],
    answer: m(`${x} ${opTex} ${fracTex(-b, a)}`),
    fields: [{ name: 'x', label: '取值范围', type: 'ineq', display: x, value: { op, bound } }],
  };
}

/** (√a)² = a，√(a²) = |a| */
export function genRootSquare() {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const k = randInt(2, 6);
    const n = pickOne(SQFREE);
    const val = k * k * n;
    return {
      prompt: `计算：${m(`(${k}\\sqrt{${n}})^2`)}`,
      steps: [`积的乘方：${m(`(${k}\\sqrt{${n}})^2 = ${k}^2\\times(\\sqrt{${n}})^2`)}`, `${m(`(\\sqrt{a})^2 = a`)}，所以 ${m(`= ${k * k}\\times ${n} = ${val}`)}`],
      answer: m(`${val}`),
      fields: [{ name: 'v', label: '结果', display: '\\square', value: val }],
    };
  }
  if (kind === 1) {
    const a = randInt(2, 15);
    return {
      prompt: `计算：${m(`\\sqrt{(-${a})^2}`)}`,
      steps: [`${m('\\sqrt{a^2} = |a|')}。`, `${m(`\\sqrt{(-${a})^2} = |-${a}| = ${a}`)}（结果一定是非负数）`],
      answer: m(`${a}`),
      fields: [{ name: 'v', label: '结果', display: '\\square', value: a }],
    };
  }
  const p = randInt(1, 9);
  const q = randInt(1, 9);
  return {
    prompt: `计算：${m(`\\left(-\\sqrt{\\dfrac{${p}}{${q + p}}}\\right)^2`)}`,
    steps: [`${m(`(-\\sqrt{a})^2 = (\\sqrt{a})^2 = a`)}。`, `结果是 ${m(fracTex(p, q + p))}。`],
    answer: m(fracTex(p, q + p)),
    fields: [{ name: 'v', label: '结果（可写分数）', display: '\\square', value: p / (q + p) }],
  };
}

/* ---------------- 23.2 二次根式的乘除 ---------------- */

/** 化简 √n */
export function genSimplifyRoot() {
  const k = randInt(2, 7);
  const r = pickOne(SQFREE);
  const n = k * k * r;
  return {
    prompt: `化简：${m(`\\sqrt{${n}}`)}`,
    steps: [
      `把被开方数分解出最大的完全平方因数：${m(`${n} = ${k * k}\\times ${r}`)}。`,
      `${m(`\\sqrt{${n}} = \\sqrt{${k * k}}\\times\\sqrt{${r}} = ${rootTex(k, r)}`)}`,
    ],
    answer: m(rootTex(k, r)),
    fields: [radField(k, r)],
  };
}

/** √a · √b */
export function genRootMul() {
  let a;
  let b;
  let k;
  let r;
  do {
    a = randInt(2, 30);
    b = randInt(2, 30);
    [k, r] = simplifyRoot(a * b);
  } while (k === 1 || a === b);
  const c1 = Math.random() < 0.4 ? randInt(2, 5) : 1;
  const c2 = Math.random() < 0.4 ? randInt(2, 4) : 1;
  const coef = c1 * c2 * k;
  const t = (c, n) => `${c === 1 ? '' : c}\\sqrt{${n}}`;
  return {
    prompt: `计算：${m(`${t(c1, a)}\\times ${t(c2, b)}`)}`,
    steps: [
      `${m('\\sqrt{a}\\cdot\\sqrt{b} = \\sqrt{ab}')}（${m('a\\ge 0, b\\ge 0')}），系数与系数相乘。`,
      `${m(`= ${c1 * c2 === 1 ? '' : c1 * c2}\\sqrt{${a * b}} = ${rootTex(coef, r)}`)}（化成最简二次根式）`,
    ],
    answer: m(rootTex(coef, r)),
    fields: [radField(coef, r)],
  };
}

/** √a ÷ √b 与分母有理化 */
export function genRootDiv() {
  if (Math.random() < 0.5) {
    const r = pickOne(SQFREE);
    const a = randInt(1, 12);
    const g = gcd(a, r);
    const kNum = a / g;
    const den = r / g;
    return {
      prompt: `化简（分母有理化）：${m(`\\dfrac{${a}}{\\sqrt{${r}}}`)}`,
      steps: [
        `分子、分母同乘 ${m(`\\sqrt{${r}}`)}：${m(`\\dfrac{${a}\\sqrt{${r}}}{${r}}`)}。`,
        den === 1 ? `约分得 ${m(rootTex(kNum, r))}` : g > 1 ? `约分得 ${m(`\\dfrac{${kNum === 1 ? '' : kNum}\\sqrt{${r}}}{${den}}`)}` : '分母里已经没有根号了。',
      ],
      answer: den === 1 ? m(rootTex(kNum, r)) : m(`\\dfrac{${kNum === 1 ? '' : kNum}\\sqrt{${r}}}{${den}}`),
      fields: [exprField(den === 1 ? rootPlain(kNum, r) : `${kNum}*√${r}/${den}`, { form: 'radical', placeholder: '如 2√3/3' })],
    };
  }
  let a;
  let b;
  let k;
  let r;
  do {
    b = randInt(2, 8);
    const kk = randInt(1, 5);
    const rr = pickOne(SQFREE);
    a = b * kk * kk * rr;
    [k, r] = simplifyRoot(a / b);
  } while (a > 400);
  return {
    prompt: `计算：${m(`\\sqrt{${a}}\\div\\sqrt{${b}}`)}`,
    steps: [`${m('\\dfrac{\\sqrt{a}}{\\sqrt{b}} = \\sqrt{\\dfrac{a}{b}}')}（${m('a\\ge 0, b>0')}）。`, `${m(`= \\sqrt{${a / b}} = ${rootTex(k, r)}`)}`],
    answer: m(rootTex(k, r)),
    fields: [radField(k, r)],
  };
}

/* ---------------- 23.3 二次根式的加减 ---------------- */

/** √12 + √27 − √3 等：化简后合并同类二次根式 */
export function genRootAddSub() {
  const r = pickOne([2, 3, 5, 6]);
  const n = randInt(2, 3);
  const ks = Array.from({ length: n }, () => randInt(1, 5));
  const signs = ks.map((_, i) => (i === 0 ? 1 : pickOne([1, -1])));
  const cs = ks.map(() => (Math.random() < 0.3 ? randInt(2, 3) : 1));
  const total = ks.reduce((s, k, i) => s + signs[i] * cs[i] * k, 0);
  const terms = ks.map((k, i) => `${i === 0 ? '' : signs[i] > 0 ? ' + ' : ' - '}${cs[i] === 1 ? '' : cs[i]}\\sqrt{${k * k * r}}`).join('');
  const simp = ks.map((k, i) => `${i === 0 ? '' : signs[i] > 0 ? ' + ' : ' - '}${rootTex(cs[i] * k, r)}`).join('');
  if (total === 0) return genRootAddSub();
  return {
    prompt: `计算：${m(terms)}`,
    steps: [
      '先把每个二次根式化成最简二次根式，再合并被开方数相同的（同类二次根式）。',
      `${m(`= ${simp}`)}`,
      `合并：${m(rootTex(total, r))}`,
    ],
    answer: m(rootTex(total, r)),
    fields: [radField(total, r)],
  };
}

/** 混合运算：(√a + √b)(√a − √b)，(√a + b)² */
export function genRootMixed() {
  if (Math.random() < 0.5) {
    const a = randInt(2, 15);
    let b;
    do b = randInt(1, 15);
    while (b === a);
    return {
      prompt: `计算：${m(`(\\sqrt{${a}} + \\sqrt{${b}})(\\sqrt{${a}} - \\sqrt{${b}})`)}`,
      steps: ['用平方差公式：$(a+b)(a-b) = a^2 - b^2$。', `${m(`= (\\sqrt{${a}})^2 - (\\sqrt{${b}})^2 = ${a} - ${b} = ${a - b}`)}`],
      answer: m(`${a - b}`),
      fields: [{ name: 'v', label: '结果', display: '\\square', value: a - b }],
    };
  }
  const r = pickOne([2, 3, 5, 6, 7]);
  const b = nonzero(-4, 4);
  // (√r + b)² = r + b² + 2b√r
  const c = r + b * b;
  const k = 2 * b;
  return {
    prompt: `计算：${m(`(\\sqrt{${r}} ${b < 0 ? '-' : '+'} ${Math.abs(b)})^2`)}`,
    steps: [
      '用完全平方公式：$(a\\pm b)^2 = a^2 \\pm 2ab + b^2$。',
      `${m(`= (\\sqrt{${r}})^2 ${b < 0 ? '-' : '+'} 2\\times ${Math.abs(b)}\\sqrt{${r}} + ${b * b} = ${c} ${k < 0 ? '-' : '+'} ${Math.abs(k)}\\sqrt{${r}}`)}`,
    ],
    answer: m(`${c} ${k < 0 ? '-' : '+'} ${Math.abs(k)}\\sqrt{${r}}`),
    fields: [exprField(`${c} + ${k}*√${r}`, { form: 'radical', placeholder: '如 7+4√3' })],
  };
}

/** 海伦—秦九韶公式 */
const HERON = [
  [3, 4, 5],
  [5, 5, 6],
  [5, 5, 8],
  [13, 14, 15],
  [5, 12, 13],
  [10, 13, 13],
  [6, 8, 10],
  [7, 15, 20],
  [9, 10, 17],
  [13, 20, 21],
];
export function genHeron() {
  const [a, b, c] = pickOne(HERON);
  const p = (a + b + c) / 2;
  const S = Math.sqrt(p * (p - a) * (p - b) * (p - c));
  return {
    prompt: `一个三角形的三边长分别为 ${a}、${b}、${c}。用海伦—秦九韶公式 ${m('S = \\sqrt{p(p-a)(p-b)(p-c)}')}（${m('p = \\dfrac{a+b+c}{2}')}）求它的面积。`,
    steps: [`${m(`p = \\dfrac{${a}+${b}+${c}}{2} = ${p}`)}`, `${m(`S = \\sqrt{${p}\\times ${p - a}\\times ${p - b}\\times ${p - c}} = \\sqrt{${p * (p - a) * (p - b) * (p - c)}} = ${S}`)}`],
    answer: m(`S = ${S}`),
    fields: [{ name: 'S', value: S }],
  };
}

/** 长方形面积 S，一边 b，求另一边（例 7） */
export function genRectRoot() {
  let r1;
  let r2;
  do {
    r1 = pickOne([2, 3, 5, 6, 7]);
    r2 = pickOne([2, 3, 5, 6, 7]);
  } while (r1 === r2);
  const k1 = randInt(1, 3);
  const k2 = randInt(1, 3);
  const [ks, rs] = simplifyRoot(r1 * r2);
  const S = [k1 * k2 * ks, rs];
  return {
    prompt: `设长方形的面积为 ${m('S')}，相邻两边长分别为 ${m('a')}、${m('b')}。已知 ${m(`S = ${rootTex(S[0], S[1])}`)}，${m(`b = ${rootTex(k2, r2)}`)}，求 ${m('a')}。`,
    steps: [
      `${m('a = \dfrac{S}{b}')} ${m(`= \dfrac{${rootTex(S[0], S[1])}}{${rootTex(k2, r2)}}`)}。`,
      `${m(`= \dfrac{${S[0]}}{${k2}}\sqrt{\dfrac{${S[1]}}{${r2}}}`)}，化简得 ${m(rootTex(k1, r1))}（可以用 ${m(`${rootTex(k1, r1)}\times ${rootTex(k2, r2)} = ${rootTex(S[0], S[1])}`)} 检验）。`,
    ],
    answer: m(`a = ${rootTex(k1, r1)}`),
    fields: [radField(k1, r1, { name: 'a', display: 'a', label: '另一边' })],
  };
}
