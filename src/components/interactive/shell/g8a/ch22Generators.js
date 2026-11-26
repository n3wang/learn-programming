import { randInt, pickOne } from '../mathRandom';
import { m, nonzero, gcd, fracTex, par } from '../examKit';
import { mono, linP, add, sub, mul, scale, tex, plain } from '../poly';
import { exprField } from './ch21Generators';

/** 第二十二章 分式 — randomized items for MixedPractice. */

const fr = (n, d) => `\\dfrac{${n}}{${d}}`;
const pp = (p) => `(${plain(p)})`;
const VARS = ['x', 'a', 'm', 'y'];

/* ---------------- 22.1 分式 ---------------- */

/** 分式有意义的条件 */
export function genFractionDefined() {
  const x = pickOne(VARS);
  const a = nonzero(-5, 5);
  const b = nonzero(-9, 9);
  const num = linP(1, x, nonzero(-6, 6));
  const den = linP(a, x, b);
  const bad = -b / a;
  return {
    prompt: `当 ${m(x)} 满足什么条件时，分式 ${m(fr(tex(num), tex(den)))} 有意义？`,
    steps: [
      '分式有意义 ⇔ 分母不等于 0（分子是多少都可以）。',
      `${m(`${tex(den)} \\ne 0`)}，所以 ${m(`${x} \\ne ${fracTex(-b, a)}`)}。`,
    ],
    answer: m(`${x} \\ne ${fracTex(-b, a)}`),
    fields: [{ name: 'v', label: '有意义的条件', display: `${x} \\ne`, value: bad }],
  };
}

/** 分式的值为 0 的条件：(x² − a²)/(x + a) */
export function genFractionZero() {
  const x = pickOne(VARS);
  const a = randInt(1, 9);
  const s = pickOne([1, -1]);
  const num = sub(mono(1, { [x]: 2 }), mono(a * a));
  const den = linP(1, x, s * a);
  const good = s * a; // den = x + s·a vanishes at −s·a, so the other root of the numerator is kept
  return {
    prompt: `当 ${m(x)} 为何值时，分式 ${m(fr(tex(num), tex(den)))} 的值为 0？`,
    steps: [
      '分式的值为 0：分子 = 0，并且分母 ≠ 0（两个条件同时要）。',
      `分子 ${m(`${tex(num)} = 0`)}，得 ${m(`${x} = ${a}`)} 或 ${m(`${x} = ${-a}`)}。`,
      `但 ${m(`${x} = ${-s * a}`)} 时分母 ${m(`${tex(den)} = 0`)}，分式无意义，舍去。`,
      `所以 ${m(`${x} = ${good}`)}。`,
    ],
    answer: m(`${x} = ${good}`),
    fields: [{ name: x, value: good }],
  };
}

/** 约分 */
export function genReduce() {
  const x = pickOne(['x', 'a', 'm']);
  const p = nonzero(-6, 6);
  let q;
  do q = nonzero(-6, 6);
  while (q === p);
  const k1 = randInt(1, 4);
  const k2 = randInt(1, 4) * (Math.random() < 0.3 ? -1 : 1);
  if (Math.random() < 0.4) {
    // monomial over monomial
    const y = x === 'x' ? 'y' : x === 'a' ? 'b' : 'n';
    const g = mono(randInt(2, 6), { [x]: randInt(1, 2), [y]: 1 });
    const n1 = mono(randInt(1, 5), { [x]: randInt(0, 2) });
    const d1 = mono(randInt(1, 5) * pickOne([1, -1]), { [y]: randInt(1, 2) });
    const cg = gcd(Object.values(n1)[0], Object.values(d1)[0]);
    const n2 = scale(n1, 1 / cg);
    const d2 = scale(d1, 1 / cg);
    const N = mul(g, n1);
    const D = mul(g, d1);
    return {
      prompt: `约分：${m(fr(tex(N), tex(D)))}`,
      steps: [
        '约分：约去分子与分母的公因式（系数的最大公约数、相同字母的最低次幂）。',
        `公因式是 ${m(tex(mul(g, mono(cg))))}。`,
        `${m(`${fr(tex(N), tex(D))} = ${fr(tex(n2), tex(d2))}`)}`,
      ],
      answer: m(fr(tex(n2), tex(d2))),
      fields: [exprField(`${pp(n2)}/${pp(d2)}`, { form: 'reduced', finiteAt: [{ [x]: 0, [y]: 1.7 }], placeholder: '如 3x/(2y)' })],
    };
  }
  let r;
  do r = nonzero(-6, 6);
  while (r === p || r === q);
  const common = linP(1, x, p);
  const N = mul(mono(k1), common, linP(1, x, q));
  const D = mul(mono(k2), common, linP(1, x, r));
  const g = gcd(k1, k2);
  const n2 = scale(linP(1, x, q), k1 / g);
  const d2 = scale(linP(1, x, r), k2 / g);
  const kTex = (k) => (k === 1 ? '' : k === -1 ? '-' : `${k}`);
  return {
    prompt: `约分：${m(fr(tex(N), tex(D)))}`,
    steps: [
      '先把分子、分母分解因式，再约去公因式。',
      `${m(`${fr(tex(N), tex(D))} = ${fr(`${kTex(k1)}(${tex(common)})(${tex(linP(1, x, q))})`, `${kTex(k2)}(${tex(common)})(${tex(linP(1, x, r))})`)}`)}`,
      `约去 ${m(`${g === 1 ? '' : g}(${tex(common)})`)}：${m(fr(tex(n2), tex(d2)))}`,
    ],
    answer: m(fr(tex(n2), tex(d2))),
    fields: [exprField(`${pp(n2)}/${pp(d2)}`, { form: 'reduced', finiteAt: [{ [x]: -p }], placeholder: '如 (x+2)/(x-3)' })],
  };
}

/** 通分：求最简公分母 */
export function genLcd() {
  if (Math.random() < 0.5) {
    const [x, y] = ['x', 'y'];
    const a = randInt(2, 6);
    let b;
    do b = randInt(2, 6);
    while (b === a);
    const e1 = [randInt(1, 3), randInt(1, 3)];
    const e2 = [randInt(1, 3), randInt(1, 3)];
    const L = (a * b) / gcd(a, b);
    const lcd = mono(L, { [x]: Math.max(e1[0], e2[0]), [y]: Math.max(e1[1], e2[1]) });
    const d1 = mono(a, { [x]: e1[0], [y]: e1[1] });
    const d2 = mono(b, { [x]: e2[0], [y]: e2[1] });
    return {
      prompt: `分式 ${m(fr(1, tex(d1)))} 与 ${m(fr(1, tex(d2)))} 的最简公分母是什么？`,
      steps: [
        '最简公分母：系数取最小公倍数，每个字母取最高次幂。',
        `系数 ${a}、${b} 的最小公倍数是 ${L}；${m(x)} 取 ${Math.max(e1[0], e2[0])} 次，${m(y)} 取 ${Math.max(e1[1], e2[1])} 次。`,
        `最简公分母：${m(tex(lcd))}`,
      ],
      answer: m(tex(lcd)),
      fields: [exprField(plain(lcd), { form: 'monomial' })],
    };
  }
  const x = pickOne(['x', 'a']);
  const b = randInt(1, 6);
  return {
    prompt: `分式 ${m(fr(`${x}`, `${x}^2 - ${b * b}`))} 与 ${m(fr(1, `${x} + ${b}`))} 的最简公分母是什么？`,
    steps: [
      `先把分母分解因式：${m(`${x}^2 - ${b * b} = (${x}+${b})(${x}-${b})`)}。`,
      `两个分母都含 ${m(`(${x}+${b})`)}，只取一次；最简公分母是 ${m(`(${x}+${b})(${x}-${b})`)}，也可写成 ${m(`${x}^2-${b * b}`)}。`,
    ],
    answer: m(`(${x}+${b})(${x}-${b})`),
    fields: [exprField(`(${x}+${b})*(${x}-${b})`, { placeholder: '如 (x+2)(x-2)' })],
  };
}

/* ---------------- 22.2 分式的运算 ---------------- */

/** 分式乘除（单项式型） */
export function genMulDivMono() {
  const [x, y] = pickOne([['a', 'b'], ['x', 'y'], ['m', 'n']]);
  const A = mono(randInt(1, 6), { [x]: randInt(1, 3) });
  const B = mono(randInt(1, 6), { [y]: randInt(1, 3) });
  const C = mono(randInt(1, 6), { [y]: randInt(1, 3) });
  const D = mono(randInt(1, 6), { [x]: randInt(1, 3) });
  const div = Math.random() < 0.5;
  // A/B · C/D   or   A/B ÷ D/C
  const N = mul(A, C);
  const Dn = mul(B, D);
  const expr = div ? `${fr(tex(A), tex(B))}\\div ${fr(tex(D), tex(C))}` : `${fr(tex(A), tex(B))}\\cdot ${fr(tex(C), tex(D))}`;
  return {
    prompt: `计算：${m(expr)}`,
    steps: [
      div ? '除以一个分式，等于乘它的倒数：$\\dfrac{a}{b}\\div\\dfrac{c}{d} = \\dfrac{a}{b}\\cdot\\dfrac{d}{c}$。' : '分式乘分式：分子乘分子，分母乘分母。',
      `${m(`= ${fr(`${tex(A)}\\cdot ${tex(C)}`, `${tex(B)}\\cdot ${tex(D)}`)} = ${fr(tex(N), tex(Dn))}`)}`,
      '再约分到最简（系数约去公约数，相同字母约去低次幂）。',
    ],
    answer: '把结果约成最简分式',
    fields: [exprField(`${pp(N)}/${pp(Dn)}`, { placeholder: '如 3a/(2b^2)' })],
  };
}

/** 分式乘除（多项式型，需要先分解因式） */
export function genMulDivPoly() {
  const x = pickOne(['x', 'a', 'm']);
  const a = randInt(1, 6);
  let b;
  do b = nonzero(-6, 6);
  while (Math.abs(b) === a);
  // (x²−a²)/(x+b) ÷ (x−a)/(x+b)² = (x+a)(x+b)
  const N1 = sub(mono(1, { [x]: 2 }), mono(a * a));
  const D1 = linP(1, x, b);
  const N2 = linP(1, x, -a);
  const D2 = mul(D1, D1);
  const res = mul(linP(1, x, a), D1);
  return {
    prompt: `计算：${m(`${fr(tex(N1), tex(D1))}\\div ${fr(tex(N2), tex(D2))}`)}`,
    steps: [
      '变除为乘，再把分子分母分解因式。',
      `${m(`= ${fr(`(${x}+${a})(${x}-${a})`, `${tex(D1)}`)}\\cdot ${fr(`(${tex(D1)})^2`, `${x}-${a}`)}`)}`,
      `约去 ${m(`(${x}-${a})`)} 和 ${m(`(${tex(D1)})`)}：${m(`(${x}+${a})(${tex(D1)})`)}`,
    ],
    answer: m(`(${x}+${a})(${tex(D1)})`),
    fields: [exprField(plain(res), { finiteAt: [{ [x]: a }, { [x]: -b }], placeholder: '可以写成因式乘积或多项式' })],
  };
}

/** 分式加减 */
export function genAddSub() {
  const x = pickOne(['x', 'a', 'm']);
  const kind = randInt(0, 2);
  if (kind === 0) {
    // 同分母
    const d = linP(1, x, nonzero(-6, 6));
    const n1 = linP(randInt(1, 5), x, nonzero(-6, 6));
    const n2 = linP(randInt(1, 5), x, nonzero(-6, 6));
    const plus = Math.random() < 0.5;
    const n = plus ? add(n1, n2) : sub(n1, n2);
    return {
      prompt: `计算：${m(`${fr(tex(n1), tex(d))} ${plus ? '+' : '-'} ${fr(tex(n2), tex(d))}`)}`,
      steps: [
        '同分母分式相加减，分母不变，分子相加减。',
        plus ? `分子：${m(`(${tex(n1)}) + (${tex(n2)}) = ${tex(n)}`)}` : `分子：${m(`(${tex(n1)}) - (${tex(n2)}) = ${tex(n)}`)}（减号后面的分子要整体加括号）`,
        `结果：${m(fr(tex(n), tex(d)))}`,
      ],
      answer: m(fr(tex(n), tex(d))),
      fields: [exprField(`${pp(n)}/${pp(d)}`)],
    };
  }
  if (kind === 1) {
    const a = randInt(1, 6);
    const plus = Math.random() < 0.5;
    // 1/(x−a) ± 1/(x+a)
    const n = plus ? mono(2, { [x]: 1 }) : mono(2 * a);
    const d = sub(mono(1, { [x]: 2 }), mono(a * a));
    return {
      prompt: `计算：${m(`${fr(1, `${x}-${a}`)} ${plus ? '+' : '-'} ${fr(1, `${x}+${a}`)}`)}`,
      steps: [
        `异分母：先通分，最简公分母是 ${m(`(${x}-${a})(${x}+${a})`)}。`,
        `${m(`= ${fr(`(${x}+${a}) ${plus ? '+' : '-'} (${x}-${a})`, `(${x}-${a})(${x}+${a})`)} = ${fr(tex(n), tex(d))}`)}`,
      ],
      answer: m(fr(tex(n), tex(d))),
      fields: [exprField(`${pp(n)}/${pp(d)}`)],
    };
  }
  // a/(b) − c/(d) with monomial denominators
  const [p, q] = [randInt(2, 6), randInt(2, 6)];
  const y = x === 'x' ? 'y' : 'b';
  return {
    prompt: `计算：${m(`${fr(p, `${x}`)} - ${fr(q, `${x}${y}`)}`)}`,
    steps: [`最简公分母是 ${m(`${x}${y}`)}。`, `${m(`${fr(`${p}${y}`, `${x}${y}`)} - ${fr(q, `${x}${y}`)} = ${fr(`${p}${y} - ${q}`, `${x}${y}`)}`)}`],
    answer: m(fr(`${p}${y} - ${q}`, `${x}${y}`)),
    fields: [exprField(`(${p}*${y}-${q})/(${x}*${y})`)],
  };
}

/** 负整数指数幂 */
export function genNegativeExponent() {
  if (Math.random() < 0.5) {
    const b = pickOne([2, 3, 4, 5, 10, -2, -3]);
    const n = b === 10 ? randInt(1, 4) : randInt(1, 3);
    const val = 1 / b ** n;
    return {
      prompt: `计算：${m(`${par(b)}^{-${n}}`)}`,
      steps: [`${m(`a^{-n} = \\dfrac{1}{a^n}`)}（${m('a \\ne 0')}）。`, `${m(`${par(b)}^{-${n}} = \\dfrac{1}{${par(b)}^{${n}}} = ${fracTex(1, b ** n)}`)}`],
      answer: m(fracTex(1, b ** n)),
      fields: [{ name: 'v', label: '结果（可写分数）', display: '\\square', value: val }],
    };
  }
  const [x, y] = ['a', 'b'];
  const p = randInt(1, 3);
  const n = randInt(2, 3);
  return {
    prompt: `计算，并把结果化为只含有正整数指数幂的形式：${m(`(${x}^{-${p}}${y})^{${n}}`)}`,
    steps: [
      `积的乘方、幂的乘方对负整数指数同样成立：${m(`(${x}^{-${p}}${y})^{${n}} = ${x}^{-${p * n}}${y}^{${n}}`)}`,
      `化成正整数指数：${m(fr(`${y}^{${n}}`, `${x}^{${p * n}}`))}`,
    ],
    answer: m(fr(`${y}^{${n}}`, `${x}^{${p * n}}`)),
    fields: [exprField(`${y}^${n}/${x}^${p * n}`, { placeholder: '如 b^3/a^6' })],
  };
}

/** 用科学记数法表示较小的数 */
export function genSciSmall() {
  const digits = randInt(2, 3);
  const mant = randInt(10 ** (digits - 1) + 1, 10 ** digits - 1);
  const n = randInt(3, 9);
  const a = mant / 10 ** (digits - 1);
  const value = a * 10 ** -n;
  const str = value.toFixed(n + digits - 1);
  return {
    prompt: `用科学记数法表示：${m(str.replace(/(\d{3})(?=\d)/g, '$1\\,'))}，写成 ${m('a\\times 10^{n}')}（${m('1\\le |a| < 10')}）。`,
    steps: [
      '绝对值小于 1 的数：小数点向右移动到第一个非 0 数字后面。',
      `移动了 ${n} 位，所以 ${m(`n = -${n}`)}：${m(`${str} = ${a}\\times 10^{-${n}}`)}`,
    ],
    answer: m(`${a}\\times 10^{-${n}}`),
    fields: [
      { name: 'a', label: '系数', display: 'a', value: a },
      { name: 'n', label: '指数', display: 'n', value: -n },
    ],
  };
}

/* ---------------- 22.3 分式方程 ---------------- */

/** 解分式方程 p/(x + a) = q/(x + b)，有解 */
export function genFracEquation() {
  const x = pickOne(['x', 'y']);
  let p;
  let q;
  let a;
  let b;
  let sol;
  for (;;) {
    p = randInt(1, 6);
    q = randInt(1, 6);
    a = nonzero(-6, 6);
    b = nonzero(-6, 6);
    if (p === q || a === b) continue;
    // p(x + b) = q(x + a) → (p − q)x = qa − pb
    const num = q * a - p * b;
    if (num % (p - q) !== 0) continue;
    sol = num / (p - q);
    if (sol + a !== 0 && sol + b !== 0) break;
  }
  return {
    prompt: `解方程：${m(`${fr(p, tex(linP(1, x, a)))} = ${fr(q, tex(linP(1, x, b)))}`)}`,
    steps: [
      `去分母：方程两边乘最简公分母 ${m(`(${tex(linP(1, x, a))})(${tex(linP(1, x, b))})`)}，得 ${m(`${p}(${tex(linP(1, x, b))}) = ${q}(${tex(linP(1, x, a))})`)}。`,
      `解这个整式方程：${m(`${p - q}${x} = ${q * a - p * b}`)}，${m(`${x} = ${sol}`)}。`,
      `检验：${m(`${x} = ${sol}`)} 时最简公分母 ${m('\\ne 0')}，所以 ${m(`${x} = ${sol}`)} 是原分式方程的解。`,
    ],
    answer: m(`${x} = ${sol}`),
    fields: [{ name: x, value: sol }],
  };
}

/** x/(x − 1) − 1 = k/((x − 1)(x + 2)) 型（例 2）：可能有增根 */
export function genFracEquationRoot() {
  const x = 'x';
  const a = randInt(1, 4); // x/(x − a) − 1 = k/((x − a)(x + c))
  const c = randInt(1, 5);
  const hasRoot = Math.random() < 0.45;
  // 去分母: x(x + c) − (x − a)(x + c) = k  →  a(x + c) = k  → x = k/a − c
  let k;
  let sol;
  if (hasRoot) {
    sol = a; // 增根 x = a
    k = a * (a + c);
  } else {
    do {
      sol = nonzero(-6, 8);
    } while (sol === a || sol === -c);
    k = a * (sol + c);
  }
  return {
    prompt: `解方程：${m(`${fr(x, `${x}-${a}`)} - 1 = ${fr(k, `(${x}-${a})(${x}+${c})`)}`)}`,
    steps: [
      `两边乘最简公分母 ${m(`(${x}-${a})(${x}+${c})`)}：${m(`${x}(${x}+${c}) - (${x}-${a})(${x}+${c}) = ${k}`)}。`,
      `整理：${m(`${a}(${x}+${c}) = ${k}`)}，${m(`${x} = ${sol}`)}。`,
      hasRoot
        ? `检验：${m(`${x} = ${a}`)} 时 ${m(`(${x}-${a})(${x}+${c}) = 0`)}，它是增根，原分式方程无解。`
        : `检验：${m(`${x} = ${sol}`)} 时公分母不为 0，所以原方程的解是 ${m(`${x} = ${sol}`)}。`,
    ],
    answer: hasRoot ? '原方程无解（x = ' + a + ' 是增根）' : m(`${x} = ${sol}`),
    fields: [
      { name: 'has', label: '原方程', type: 'choice', options: ['有解', '无解'], value: hasRoot ? '无解' : '有解' },
      { name: 'r', label: '去分母后整式方程的根', display: 'x', value: sol },
    ],
  };
}

/** 分式方程应用：工效 / 行程「用时相同」 */
export function genFracWord() {
  if (Math.random() < 0.5) {
    // 甲每小时比乙多做 d 个，甲做 P 个与乙做 Q 个所用时间相等
    let d;
    let v;
    let t;
    for (;;) {
      v = randInt(4, 30); // 乙每小时
      d = randInt(2, 15);
      t = randInt(3, 12);
      if ((v + d) * t <= 600) break;
    }
    const P = (v + d) * t;
    const Q = v * t;
    return {
      prompt: `甲每小时比乙多做 ${d} 个零件，甲做 ${P} 个零件与乙做 ${Q} 个零件所用的时间相等。乙每小时做多少个零件？`,
      steps: [
        `设乙每小时做 ${m('x')} 个，则甲每小时做 ${m(`(x+${d})`)} 个。`,
        `时间相等：${m(`${fr(P, `x+${d}`)} = ${fr(Q, 'x')}`)}。`,
        `两边乘 ${m(`x(x+${d})`)}：${m(`${P}x = ${Q}(x+${d})`)}，${m(`${P - Q}x = ${Q * d}`)}，${m(`x = ${v}`)}。`,
        `检验：${m(`x = ${v}`)} 是原方程的解，且符合题意。`,
      ],
      answer: `乙每小时做 ${v} 个`,
      fields: [{ name: 'x', label: '乙每小时（个）', value: v }],
    };
  }
  // 提速：提速 v km/h 后，相同时间多行驶 50 km → 例4 用数字
  let s;
  let v0;
  let dv;
  for (;;) {
    v0 = 10 * randInt(6, 20);
    dv = 10 * randInt(1, 5);
    const t = pickOne([2, 2.5, 3, 4, 5]);
    s = v0 * t;
    if (Number.isInteger(s)) break;
  }
  const extra = (s / v0) * dv;
  return {
    prompt: `某次列车平均提速 ${dv} km/h。用相同的时间，列车提速前行驶 ${s} km，提速后比提速前多行驶 ${extra} km。提速前列车的平均速度是多少？`,
    steps: [
      `设提速前速度为 ${m('x')} km/h，提速后为 ${m(`(x+${dv})`)} km/h。`,
      `时间相同：${m(`${fr(s, 'x')} = ${fr(s + extra, `x+${dv}`)}`)}。`,
      `去分母：${m(`${s}(x+${dv}) = ${s + extra}x`)}，${m(`${extra}x = ${s * dv}`)}，${m(`x = ${v0}`)}。`,
      '检验：是原方程的解，也符合题意。',
    ],
    answer: `${v0} km/h`,
    fields: [{ name: 'x', label: '提速前速度（km/h）', value: v0 }],
  };
}

