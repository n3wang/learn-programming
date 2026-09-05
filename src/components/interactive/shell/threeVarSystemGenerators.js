import { randInt, pickOne } from './mathRandom';

/** Wrap inline LaTeX. */
function m(expr) {
  return `$${expr}$`;
}

/** Wrap display LaTeX. */
function dm(expr) {
  return `$$${expr}$$`;
}

function nonzeroInt(min, max) {
  let n;
  do {
    n = randInt(min, max);
  } while (n === 0);
  return n;
}

function fmtTerm(coeff, name, leading) {
  if (coeff === 0) return '';
  const abs = Math.abs(coeff);
  const core = abs === 1 ? name : `${abs}${name}`;
  if (leading) return coeff < 0 ? `-${core}` : core;
  return coeff < 0 ? ` - ${core}` : ` + ${core}`;
}

/** Format ax+by+cz = d (omit zero terms). */
function fmtLin3(a, b, c, d) {
  const parts = [];
  if (a !== 0) parts.push(fmtTerm(a, 'x', parts.length === 0));
  if (b !== 0) parts.push(fmtTerm(b, 'y', parts.length === 0));
  if (c !== 0) parts.push(fmtTerm(c, 'z', parts.length === 0));
  const left = parts.length === 0 ? '0' : parts.join('');
  return `${left} = ${d}`;
}

function fmtSystem3(eq1, eq2, eq3) {
  return `$\\displaystyle\\begin{cases} ${eq1} \\\\ ${eq2} \\\\ ${eq3} \\end{cases}$`;
}

function fmtAnswer3(x, y, z) {
  return `${m(`x = ${x}`)}，${m(`y = ${y}`)}，${m(`z = ${z}`)}`;
}

function fmtNum(n) {
  if (Number.isInteger(n)) return `${n}`;
  // halves
  const twice = n * 2;
  if (Number.isInteger(twice)) {
    const g = Math.abs(twice) === 1 ? 1 : 1;
    if (twice % 2 === 0) return `${twice / 2}`;
    const sign = twice < 0 ? '-' : '';
    return `${sign}\\dfrac{${Math.abs(twice)}}{2}`;
  }
  // thirds
  const thrice = n * 3;
  if (Math.abs(thrice - Math.round(thrice)) < 1e-9) {
    const t = Math.round(thrice);
    const sign = t < 0 ? '-' : '';
    const abs = Math.abs(t);
    if (abs % 3 === 0) return `${t / 3}`;
    return `${sign}\\dfrac{${abs}}{3}`;
  }
  return `${Number(n.toFixed(4))}`;
}

/**
 * 书题 (1) 风格：链式代入。
 * x − a y = c1,  y − z = k,  b z + x = c3
 */
export function genChainThreeVar() {
  for (let t = 0; t < 50; t++) {
    const useHalf = Math.random() < 0.35;
    const z = useHalf ? randInt(3, 12) + 0.5 : randInt(2, 12);
    const k = nonzeroInt(1, 5);
    const y = z + k;
    const a = pickOne([1, 2, 3]);
    const b = pickOne([1, 2, 3]);
    const x = randInt(4, 24);
    const c1 = x - a * y;
    const c3 = b * z + x;
    if (!Number.isInteger(c1 * 2) || !Number.isInteger(c3 * 2)) continue;

    const eq1 = fmtLin3(1, -a, 0, c1);
    const eq2 = fmtLin3(0, 1, -1, k);
    const eq3 = fmtLin3(1, 0, b, c3);

    return {
      prompt: fmtSystem3(eq1, eq2, eq3),
      steps: [
        `由 ② 得 ${m(`y = z + ${k}`)}。`,
        `由 ③ 得 ${m(`x = ${c3} - ${b}z`)}。`,
        `代入 ① ${m(eq1)}：`,
        dm(`(${c3} - ${b}z) - ${a}(z + ${k}) = ${c1}`),
        dm(`${c3} - ${b}z - ${a}z - ${a * k} = ${c1}`),
        dm(`${c3 - a * k} - ${a + b}z = ${c1}`),
        dm(`${a + b}z = ${c3 - a * k - c1}`),
        `解得 ${m(`z = ${fmtNum(z)}`)}，再得 ${m(`y = ${fmtNum(y)}`)}，${m(`x = ${fmtNum(x)}`)}。`,
        `检验：把三值分别代入 ①②③，左右两边应相等。`,
      ],
      answer: fmtAnswer3(fmtNum(x), fmtNum(y), fmtNum(z)),
    };
  }
  // 书题目 fallback
  return {
    prompt: fmtSystem3('x - 2y = -9', 'y - z = 3', 'x + 2z = 47'),
    steps: [
      `由 ② 得 ${m('y = z + 3')}。`,
      `由 ③ 得 ${m('x = 47 - 2z')}。`,
      `代入 ①：`,
      dm('(47 - 2z) - 2(z + 3) = -9'),
      dm('47 - 2z - 2z - 6 = -9'),
      dm('41 - 4z = -9'),
      dm('4z = 50'),
      m('z = \\dfrac{25}{2}'),
      `得 ${m('y = \\dfrac{31}{2}')}，${m('x = 22')}。`,
    ],
    answer: fmtAnswer3('22', '\\dfrac{31}{2}', '\\dfrac{25}{2}'),
  };
}

/**
 * 书题 (3) 风格：两两之和。三式相加得 2(x+y+z)。
 */
export function genCyclicThreeVar() {
  for (let t = 0; t < 40; t++) {
    const x = nonzeroInt(1, 9);
    const y = nonzeroInt(1, 9);
    const z = nonzeroInt(1, 9);
    const a = x + y;
    const b = y + z;
    const c = z + x;
    return {
      prompt: fmtSystem3(`x + y = ${a}`, `y + z = ${b}`, `z + x = ${c}`),
      steps: [
        '三式相加：左边每个未知数出现两次。',
        dm(`2(x + y + z) = ${a + b + c}`),
        m(`x + y + z = ${(a + b + c) / 2}`),
        `用总和分别减去各式：`,
        dm(`z = (x+y+z) - (x+y) = ${(a + b + c) / 2} - ${a} = ${z}`),
        dm(`x = (x+y+z) - (y+z) = ${(a + b + c) / 2} - ${b} = ${x}`),
        dm(`y = (x+y+z) - (z+x) = ${(a + b + c) / 2} - ${c} = ${y}`),
      ],
      answer: fmtAnswer3(x, y, z),
    };
  }
  return {
    prompt: fmtSystem3('x + y = 3', 'y + z = 4', 'z + x = 5'),
    steps: [
      dm('2(x + y + z) = 12'),
      m('x + y + z = 6'),
      m('z = 6 - 3 = 3'),
      m('x = 6 - 4 = 2'),
      m('y = 6 - 5 = 1'),
    ],
    answer: fmtAnswer3(2, 1, 3),
  };
}

/**
 * 书题 (4) 风格：一般三元，先加减消去一个未知数，化为二元。
 */
export function genGeneralThreeVar() {
  for (let t = 0; t < 60; t++) {
    const x = nonzeroInt(-4, 8);
    const y = nonzeroInt(-4, 8);
    const z = nonzeroInt(-4, 8);
    // Build three independent-ish equations with small coeffs
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const a = nonzeroInt(-3, 4);
      const b = nonzeroInt(-3, 4);
      const c = nonzeroInt(-3, 4);
      rows.push([a, b, c, a * x + b * y + c * z]);
    }
    // Check non-singular roughly via determinant
    const [[a1, b1, c1], [a2, b2, c2], [a3, b3, c3]] = rows;
    const det =
      a1 * (b2 * c3 - b3 * c2) - b1 * (a2 * c3 - a3 * c2) + c1 * (a2 * b3 - a3 * b2);
    if (det === 0) continue;

    // Prefer systems where adding/subtracting first two kills z (like book)
    // Accept any; write elimination steps generically toward z first if possible
    const eq1 = fmtLin3(...rows[0]);
    const eq2 = fmtLin3(...rows[1]);
    const eq3 = fmtLin3(...rows[2]);

    // Try eliminate z between ① and ②
    const cz1 = rows[0][2];
    const cz2 = rows[1][2];
    let mul1 = Math.abs(cz2);
    let mul2 = Math.abs(cz1);
    const g = gcd(mul1, mul2) || 1;
    mul1 /= g;
    mul2 /= g;
    if (cz1 === 0 && cz2 === 0) continue;

    const signSame = Math.sign(cz1) === Math.sign(cz2);
    // After mul: coeff z become ±|cz1*cz2|/g — if same sign, subtract; else add
    const A4 = mul1 * rows[0][0] - (signSame ? 1 : -1) * mul2 * rows[1][0];
    // Wait: if same sign, we want mul1*eq1 - mul2*eq2 to cancel z
    // If opposite signs, mul1*eq1 + mul2*eq2
    const op = signSame ? -1 : 1;
    const na = mul1 * rows[0][0] + op * mul2 * rows[1][0];
    const nb = mul1 * rows[0][1] + op * mul2 * rows[1][1];
    const nc = mul1 * rows[0][2] + op * mul2 * rows[1][2];
    const nd = mul1 * rows[0][3] + op * mul2 * rows[1][3];
    if (Math.abs(nc) > 1e-9) continue; // failed cancel — skip rare float issues
    if (na === 0 && nb === 0) continue;

    // Eliminate z between ① and ③ similarly
    const cz3 = rows[2][2];
    let m1 = Math.abs(cz3);
    let m3 = Math.abs(cz1);
    const g2 = gcd(m1, m3) || 1;
    m1 /= g2;
    m3 /= g2;
    const op2 = Math.sign(cz1) === Math.sign(cz3) ? -1 : 1;
    const pa = m1 * rows[0][0] + op2 * m3 * rows[2][0];
    const pb = m1 * rows[0][1] + op2 * m3 * rows[2][1];
    const pc = m1 * rows[0][2] + op2 * m3 * rows[2][2];
    const pd = m1 * rows[0][3] + op2 * m3 * rows[2][3];
    if (Math.abs(pc) > 1e-9) continue;
    if (pa === 0 && pb === 0) continue;
    // Binary system: na x + nb y = nd ; pa x + pb y = pd
    if (na * pb === pa * nb) continue;

    const verb1 = op === -1 ? '相减' : '相加';
    const verb2 = op2 === -1 ? '相减' : '相加';

    return {
      prompt: fmtSystem3(eq1, eq2, eq3),
      steps: [
        `先消去 ${m('z')}：① $\\times ${mul1}$ 与 ② $\\times ${mul2}$ ${verb1}，得`,
        dm(fmtLin3(na, nb, 0, nd)),
        `① $\\times ${m1}$ 与 ③ $\\times ${m3}$ ${verb2}，得`,
        dm(fmtLin3(pa, pb, 0, pd)),
        `得到关于 ${m('x')}、${m('y')} 的二元一次方程组，解得`,
        m(`x = ${x}`),
        m(`y = ${y}`),
        `再代回 ③（或任一式）得 ${m(`z = ${z}`)}。`,
        '三值代回原方程组检验。',
      ],
      answer: fmtAnswer3(x, y, z),
    };
  }
  return bookGeneral();
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function bookGeneral() {
  return {
    prompt: fmtSystem3('3x - y + z = 4', '2x + 3y - z = 12', 'x + y + z = 6'),
    steps: [
      '① + ② 消去 z：',
      dm('5x + 2y = 16'),
      '② + ③：注意 ② 中 −z 与 ③ 中 +z，相加得',
      dm('3x + 4y = 18'),
      '由二元组解出 x、y，再代回 ③：',
      m('x = 2'),
      m('y = 3'),
      m('z = 1'),
    ],
    answer: fmtAnswer3(2, 3, 1),
  };
}

/**
 * 书题 (2) 风格：某一式缺 y，先用含 y 的两式消去 y，再与缺 y 的式联立。
 */
export function genMissingVarThreeVar() {
  for (let t = 0; t < 50; t++) {
    const x = nonzeroInt(1, 8);
    const y = nonzeroInt(-6, 6);
    const zNum = nonzeroInt(-4, 4);
    const zDen = pickOne([1, 3]);
    const z = zNum / zDen;
    // eq1: a x + c z = d1  (no y)
    const a1 = nonzeroInt(1, 5);
    const c1 = nonzeroInt(-9, -1);
    const d1 = a1 * x + c1 * z;
    if (!Number.isInteger(d1 * 3)) continue;
    // eq2, eq3 with y
    const a2 = nonzeroInt(1, 4);
    const b2 = 1;
    const c2 = nonzeroInt(3, 18);
    const d2 = a2 * x + b2 * y + c2 * z;
    if (!Number.isInteger(d2 * 3)) continue;
    const a3 = 1;
    const b3 = nonzeroInt(1, 3);
    const c3 = nonzeroInt(1, 5);
    const d3 = a3 * x + b3 * y + c3 * z;
    if (!Number.isInteger(d3 * 3)) continue;

    const eq1 = fmtLin3(a1, 0, c1, d1);
    const eq2 = fmtLin3(a2, b2, c2, d2);
    const eq3 = fmtLin3(a3, b3, c3, d3);

    return {
      prompt: fmtSystem3(eq1, eq2, eq3),
      steps: [
        `① 中没有 ${m('y')}。先用 ②、③ 消去 ${m('y')}：② $\\times ${b3}$ 与 ③ ${b3 === 1 ? '' : `$\\times ${b2}$ `}相减（使 y 系数相同）。`,
        `得到只含 ${m('x')}、${m('z')} 的方程，再与 ① 联立。`,
        `解出 ${m(`x = ${fmtNum(x)}`)}，${m(`z = ${fmtNum(z)}`)}，再代回 ③ 得 ${m(`y = ${fmtNum(y)}`)}。`,
        '三值代回原方程组检验。',
      ],
      answer: fmtAnswer3(fmtNum(x), fmtNum(y), fmtNum(z)),
    };
  }
  return {
    prompt: fmtSystem3('4x - 9z = 17', '3x + y + 15z = 18', 'x + 2y + 3z = 2'),
    steps: [
      `① 缺 ${m('y')}。② × 2 − ③ 消去 y：`,
      dm('(6x + 2y + 30z) - (x + 2y + 3z) = 36 - 2'),
      dm('5x + 27z = 34'),
      `与 ① ${m('4x - 9z = 17')} 联立，解得`,
      m('x = 5'),
      m('z = \\dfrac{1}{3}'),
      `代回 ③：${m('5 + 2y + 1 = 2')} → ${m('y = -2')}。`,
    ],
    answer: fmtAnswer3(5, -2, '\\dfrac{1}{3}'),
  };
}

/** Mix of the four book styles (for a combined worksheet). */
export function genTextbookThreeVar() {
  return pickOne([genChainThreeVar, genMissingVarThreeVar, genCyclicThreeVar, genGeneralThreeVar])();
}

/**
 * 复习巩固 1(1)：y 已解出 + 缺 y 的式 + 含 z。
 * 书题：y=2x−7，5x+3y+2z=2，3x−4z=4 → (2,−3,1/2)
 */
export function genReviewSubReadyThreeVar() {
  for (let t = 0; t < 40; t++) {
    const slope = pickOne([2, 3, -1, -2]);
    const k = nonzeroInt(-8, 8);
    const x = nonzeroInt(-4, 6);
    const y = slope * x + k;
    const zNum = nonzeroInt(-4, 6);
    const zDen = pickOne([1, 2]);
    const z = zNum / zDen;
    const a2 = nonzeroInt(2, 6);
    const b2 = nonzeroInt(1, 4);
    const c2 = nonzeroInt(1, 3);
    const d2 = a2 * x + b2 * y + c2 * z;
    const a3 = nonzeroInt(1, 4);
    const c3 = nonzeroInt(-5, -1);
    const d3 = a3 * x + c3 * z;
    if (!Number.isInteger(d2 * 2) || !Number.isInteger(d3 * 2)) continue;

    const yEq =
      k === 0
        ? `y = ${slope === 1 ? 'x' : slope === -1 ? '-x' : `${slope}x`}`
        : `y = ${slope === 1 ? 'x' : slope === -1 ? '-x' : `${slope}x`} ${k > 0 ? '+' : '-'} ${Math.abs(k)}`;

    return {
      prompt: fmtSystem3(yEq, fmtLin3(a2, b2, c2, d2), fmtLin3(a3, 0, c3, d3)),
      steps: [
        `① 已解出 ${m('y')}，代入 ②，得到只含 ${m('x')}、${m('z')} 的方程。`,
        `再与 ③（本就无 ${m('y')}）联立，求出 ${m('x')}、${m('z')}，回代 ① 得 ${m('y')}。`,
        `解得 ${m(`x = ${fmtNum(x)}`)}，${m(`y = ${fmtNum(y)}`)}，${m(`z = ${fmtNum(z)}`)}。`,
      ],
      answer: fmtAnswer3(fmtNum(x), fmtNum(y), fmtNum(z)),
    };
  }
  return {
    prompt: fmtSystem3('y = 2x - 7', '5x + 3y + 2z = 2', '3x - 4z = 4'),
    steps: [
      `把 ${m('y = 2x - 7')} 代入 ②：`,
      dm('5x + 3(2x - 7) + 2z = 2'),
      dm('11x + 2z = 23'),
      `与 ③ ${m('3x - 4z = 4')} 联立，解得 ${m('x = 2')}，${m('z = \\dfrac{1}{2}')}，再得 ${m('y = -3')}。`,
    ],
    answer: fmtAnswer3(2, -3, '\\dfrac{1}{2}'),
  };
}

/**
 * 复习巩固 1(2)：三式各缺一个未知数（循环缺元）。
 * 书题：4x+9y=12，3y−2z=1，7x+5z=19/4 → (−3/4, 5/3, 2)
 */
export function genReviewCycleMissingThreeVar() {
  for (let t = 0; t < 40; t++) {
    const x = nonzeroInt(-3, 4) / pickOne([1, 2, 4]);
    const y = nonzeroInt(-3, 5) / pickOne([1, 3]);
    const z = nonzeroInt(1, 5);
    const a1 = nonzeroInt(2, 5);
    const b1 = nonzeroInt(3, 9);
    const d1 = a1 * x + b1 * y;
    const b2 = nonzeroInt(2, 5);
    const c2 = nonzeroInt(-4, -1);
    const d2 = b2 * y + c2 * z;
    const a3 = nonzeroInt(3, 8);
    const c3 = nonzeroInt(2, 6);
    const d3 = a3 * x + c3 * z;
    if (![d1, d2, d3].every((v) => Number.isInteger(v * 4))) continue;

    return {
      prompt: fmtSystem3(fmtLin3(a1, b1, 0, d1), fmtLin3(0, b2, c2, d2), fmtLin3(a3, 0, c3, d3)),
      steps: [
        `三式分别缺 ${m('z')}、${m('x')}、${m('y')}。可先由 ①、② 消去 ${m('y')}（或用代入），再与 ③ 联立。`,
        `解得 ${m(`x = ${fmtNum(x)}`)}，${m(`y = ${fmtNum(y)}`)}，${m(`z = ${fmtNum(z)}`)}。`,
      ],
      answer: fmtAnswer3(fmtNum(x), fmtNum(y), fmtNum(z)),
    };
  }
  return {
    prompt: fmtSystem3('4x + 9y = 12', '3y - 2z = 1', '7x + 5z = \\dfrac{19}{4}'),
    steps: [
      `由 ①、② 消去 ${m('y')}，再与 ③ 联立（注意右边分数，可先通分）。`,
      m('x = -\\dfrac{3}{4}'),
      m('y = \\dfrac{5}{3}'),
      m('z = 2'),
    ],
    answer: fmtAnswer3('-\\dfrac{3}{4}', '\\dfrac{5}{3}', 2),
  };
}

/**
 * 复习巩固 2(1)：比例 x/2 = y/3 = z/4 = k。
 */
export function genReviewProportionThreeVar() {
  for (let t = 0; t < 30; t++) {
    const p = pickOne([2, 3]);
    const q = p + 1;
    const r = q + 1;
    const k = nonzeroInt(2, 6);
    const x = p * k;
    const y = q * k;
    const z = r * k;
    const a = nonzeroInt(1, 3);
    const b = nonzeroInt(-2, 2) || -1;
    const c = nonzeroInt(1, 3);
    const d = a * x + b * y + c * z;
    return {
      prompt: `$\\displaystyle\\begin{cases} \\dfrac{x}{${p}} = \\dfrac{y}{${q}} = \\dfrac{z}{${r}} \\\\ ${fmtLin3(a, b, c, d)} \\end{cases}$`,
      steps: [
        `设 ${m(`\\dfrac{x}{${p}} = \\dfrac{y}{${q}} = \\dfrac{z}{${r}} = k`)}，则 ${m(`x=${p}k`)}，${m(`y=${q}k`)}，${m(`z=${r}k`)}。`,
        `代入线性方程得 ${m(`k = ${k}`)}，从而 ${m(`x = ${x}`)}，${m(`y = ${y}`)}，${m(`z = ${z}`)}。`,
      ],
      answer: fmtAnswer3(x, y, z),
    };
  }
  return {
    prompt: `$\\displaystyle\\begin{cases} \\dfrac{x}{2} = \\dfrac{y}{3} = \\dfrac{z}{4} \\\\ 2x - y + 2z = 27 \\end{cases}$`,
    steps: [
      `设公比为 ${m('k')}，则 ${m('x=2k')}，${m('y=3k')}，${m('z=4k')}。`,
      dm('2(2k) - 3k + 2(4k) = 27'),
      dm('9k = 27'),
      m('k = 3'),
      `得 ${m('x=6')}，${m('y=9')}，${m('z=12')}。`,
    ],
    answer: fmtAnswer3(6, 9, 12),
  };
}

/**
 * 复习巩固 2(2)：一般三元（书题整数解偏「丑」：-1, 1/2, 3）。
 */
export function genReviewGeneralPractice() {
  // Prefer book-like half solutions
  if (Math.random() < 0.45) {
    return {
      prompt: fmtSystem3('2x + 4y + 3z = 9', '3x - 2y + 5z = 11', '5x - 6y + 7z = 13'),
      steps: [
        '用加减消元法消去一个未知数（如先消 y），化为二元一次方程组。',
        m('x = -1'),
        m('y = \\dfrac{1}{2}'),
        m('z = 3'),
      ],
      answer: fmtAnswer3(-1, '\\dfrac{1}{2}', 3),
    };
  }
  return genGeneralThreeVar();
}

export function genReviewConsolidateThreeVar() {
  return pickOne([
    genReviewSubReadyThreeVar,
    genReviewCycleMissingThreeVar,
    genReviewProportionThreeVar,
    genReviewGeneralPractice,
  ])();
}
