import { randInt, pickOne } from './mathRandom';

/** Wrap inline LaTeX. */
function m(expr) {
  return `$${expr}$`;
}

/** Wrap display LaTeX (standalone equation lines in solutions). */
function dm(expr) {
  return `$$${expr}$$`;
}

function fmtLin(a, b, xName = 'x', yName = 'y') {
  const parts = [];
  if (a !== 0) {
    if (a === 1) parts.push(xName);
    else if (a === -1) parts.push(`-${xName}`);
    else parts.push(`${a}${xName}`);
  }
  if (b !== 0) {
    const abs = Math.abs(b);
    const core = abs === 1 ? yName : `${abs}${yName}`;
    if (parts.length === 0) parts.push(b < 0 ? `-${core}` : core);
    else parts.push(b < 0 ? `- ${core}` : `+ ${core}`);
  }
  return parts.length === 0 ? '0' : parts.join(' ');
}

function fmtEq(a, b, c) {
  return `${fmtLin(a, b)} = ${c}`;
}

/** y = mx + k */
function fmtSolvedForY(mSlope, k) {
  if (mSlope === 0) return `y = ${k}`;
  const mx = mSlope === 1 ? 'x' : mSlope === -1 ? '-x' : `${mSlope}x`;
  if (k > 0) return `y = ${mx} + ${k}`;
  if (k < 0) return `y = ${mx} - ${-k}`;
  return `y = ${mx}`;
}

function fmtMxPlusK(mSlope, k) {
  if (mSlope === 0) return `${k}`;
  const mx = mSlope === 1 ? 'x' : mSlope === -1 ? '-x' : `${mSlope}x`;
  if (k === 0) return mx;
  if (k > 0) return `${mx} + ${k}`;
  return `${mx} - ${-k}`;
}

function evalMxPlusKDisplay(mSlope, k, xVal) {
  if (mSlope === 0) return `${k}`;
  const prod = mSlope * xVal;
  if (k === 0) return `${mSlope}\\times(${xVal}) = ${prod}`;
  if (k > 0) return `${mSlope}\\times(${xVal}) + ${k} = ${prod + k}`;
  return `${mSlope}\\times(${xVal}) - ${-k} = ${prod + k}`;
}

function fmtCoeff(n) {
  if (n === 1) return '';
  if (n === -1) return '-';
  return `${n}`;
}

function fmtSystem(eq1, eq2) {
  return `$\\displaystyle\\begin{cases} ${eq1} \\\\ ${eq2} \\end{cases}$`;
}

function fmtAnswer(x, y) {
  return `${m(`x = ${x}`)}，${m(`y = ${y}`)}`;
}

function nonzeroInt(min, max) {
  let n;
  do {
    n = randInt(min, max);
  } while (n === 0);
  return n;
}

function gcdInt(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function joinAxBy(a, bExpr, c) {
  const ax = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
  if (!ax) return `${bExpr} = ${c}`;
  if (bExpr.startsWith('-')) return `${ax} ${bExpr} = ${c}`;
  return `${ax} + ${bExpr} = ${c}`;
}

function expandAfterSub(a, b, mSlope, k, c) {
  const coeffX = a + b * mSlope;
  const constTerm = b * k;
  if (constTerm === 0) return `${fmtCoeff(coeffX)}x = ${c}`;
  if (constTerm > 0) return `${fmtCoeff(coeffX)}x + ${constTerm} = ${c}`;
  return `${fmtCoeff(coeffX)}x - ${-constTerm} = ${c}`;
}

/**
 * 代入法：① 已解出 y，直接代入 ②。
 * 书题原型：{ y = 2x − 3 ; 3x + 2y = 8 } → (2, 1)
 */
export function genSubstitutionReady() {
  for (let t = 0; t < 40; t++) {
    const x = nonzeroInt(-6, 6);
    const mSlope = nonzeroInt(-4, 4);
    const k = randInt(-8, 8);
    const y = mSlope * x + k;
    const a = nonzeroInt(-5, 5);
    const b = nonzeroInt(-4, 4);
    const c = a * x + b * y;
    if (a + b * mSlope === 0) continue;

    const inner = fmtMxPlusK(mSlope, k);
    const bExpr =
      b === 1 ? `(${inner})` : b === -1 ? `-(${inner})` : `${b}(${inner})`;

    return {
      prompt: fmtSystem(fmtSolvedForY(mSlope, k), fmtEq(a, b, c)),
      steps: [
        `① 式已经解出 ${m('y')}，直接代入 ② 式：`,
        dm(joinAxBy(a, bExpr, c)),
        `去括号、合并同类项：`,
        dm(expandAfterSub(a, b, mSlope, k, c)),
        `解得 ${m(`x = ${x}`)}`,
        `把 ${m(`x = ${x}`)} 代入 ① 式：`,
        dm(`y = ${evalMxPlusKDisplay(mSlope, k, x)}`),
      ],
      answer: fmtAnswer(x, y),
    };
  }
  return {
    prompt: fmtSystem('y = 2x - 3', '3x + 2y = 8'),
    steps: [
      `① 式已经解出 ${m('y')}，直接代入 ② 式：`,
      dm('3x + 2(2x - 3) = 8'),
      dm('3x + 4x - 6 = 8'),
      dm('7x = 14'),
      m('x = 2'),
      `把 ${m('x = 2')} 代入 ① 式：`,
      dm('y = 2\\times 2 - 3 = 1'),
    ],
    answer: fmtAnswer(2, 1),
  };
}

/**
 * 代入法：先从 ① 解出 y，再代入 ②。
 * 书题原型：{ 2x − y = 5 ; 3x + 4y = 2 } → (2, −1)
 */
export function genSubstitutionIsolate() {
  for (let t = 0; t < 40; t++) {
    const x = nonzeroInt(-6, 6);
    const y = randInt(-6, 6);
    const a1 = nonzeroInt(-5, 5);
    const b1 = pickOne([-1, 1]);
    const c1 = a1 * x + b1 * y;
    const a2 = nonzeroInt(-5, 5);
    const b2 = nonzeroInt(-5, 5);
    const c2 = a2 * x + b2 * y;
    if (a1 * b2 === a2 * b1) continue;

    // a1 x + b1 y = c1  →  y = −b1 a1 x + b1 c1  (since b1 = ±1)
    const mSlope = -b1 * a1;
    const k = b1 * c1;
    if (a2 + b2 * mSlope === 0) continue;

    const solved = fmtSolvedForY(mSlope, k);
    const inner = fmtMxPlusK(mSlope, k);
    const bExpr =
      b2 === 1 ? `(${inner})` : b2 === -1 ? `-(${inner})` : `${b2}(${inner})`;

    return {
      prompt: fmtSystem(fmtEq(a1, b1, c1), fmtEq(a2, b2, c2)),
      steps: [
        `由 ① 式解出 ${m('y')}：`,
        dm(solved),
        `代入 ② 式：`,
        dm(joinAxBy(a2, bExpr, c2)),
        `去括号、合并：`,
        dm(expandAfterSub(a2, b2, mSlope, k, c2)),
        `解得 ${m(`x = ${x}`)}`,
        `把 ${m(`x = ${x}`)} 代入 ${m(solved)}，得 ${m(`y = ${y}`)}`,
      ],
      answer: fmtAnswer(x, y),
    };
  }
  return {
    prompt: fmtSystem('2x - y = 5', '3x + 4y = 2'),
    steps: [
      `由 ① 式解出 ${m('y')}：`,
      dm('y = 2x - 5'),
      `代入 ② 式：`,
      dm('3x + 4(2x - 5) = 2'),
      dm('3x + 8x - 20 = 2'),
      dm('11x = 22'),
      m('x = 2'),
      `把 ${m('x = 2')} 代入 ${m('y = 2x - 5')}，得 ${m('y = -1')}`,
    ],
    answer: fmtAnswer(2, -1),
  };
}

/** 代入法综合（直接代入或先解出）。 */
export function genSubstitutionSystem() {
  return Math.random() < 0.45 ? genSubstitutionReady() : genSubstitutionIsolate();
}

/**
 * 加减消元法：必要时先乘倍数，使某一未知数系数互为相反数（或相等），再相加/相减。
 */
export function genEliminationSystem() {
  for (let t = 0; t < 50; t++) {
    const x = nonzeroInt(-6, 6);
    const y = randInt(-6, 6);

    const a1 = nonzeroInt(-4, 4);
    const b1 = nonzeroInt(-4, 4);
    const a2 = nonzeroInt(-4, 4);
    const b2 = nonzeroInt(-4, 4);
    if (a1 * b2 === a2 * b1) continue;

    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;

    const gY = Math.abs(gcdInt(b1, b2));
    const mul1 = Math.abs(b2) / gY;
    const mul2 = Math.abs(b1) / gY;
    const y1 = mul1 * b1;
    const y2 = mul2 * b2;
    const sameSign = y1 === y2;
    const opVerb = sameSign ? '相减' : '相加';

    const newA1 = mul1 * a1;
    const newC1 = mul1 * c1;
    const newA2 = mul2 * a2;
    const newC2 = mul2 * c2;
    const finalA = sameSign ? newA1 - newA2 : newA1 + newA2;
    const finalC = sameSign ? newC1 - newC2 : newC1 + newC2;
    if (finalA === 0) continue;

    const steps = [];
    if (mul1 === 1 && mul2 === 1) {
      steps.push(
        `①、② 中 ${m('y')} 的系数已经${sameSign ? '相等' : '互为相反数'}，两式直接${opVerb}：`,
      );
    } else {
      const parts = [];
      if (mul1 !== 1) parts.push(`① $\\times ${mul1}$`);
      if (mul2 !== 1) parts.push(`② $\\times ${mul2}$`);
      steps.push(`为消去 ${m('y')}，先把 ${m('y')} 的系数化为绝对值相同：${parts.join('，')}，得：`);
      steps.push(dm(fmtEq(newA1, y1, newC1)));
      steps.push(dm(fmtEq(newA2, y2, newC2)));
      steps.push(`两式${opVerb}，消去 ${m('y')}：`);
    }
    steps.push(dm(`${fmtCoeff(finalA)}x = ${finalC}`));
    steps.push(`解得 ${m(`x = ${x}`)}`);
    steps.push(
      `把 ${m(`x = ${x}`)} 代入 ① 式 ${m(fmtEq(a1, b1, c1))}，解得 ${m(`y = ${y}`)}`,
    );

    return {
      prompt: fmtSystem(fmtEq(a1, b1, c1), fmtEq(a2, b2, c2)),
      steps,
      answer: fmtAnswer(x, y),
    };
  }
  return {
    prompt: fmtSystem('2x - y = 5', '3x + 4y = 2'),
    steps: [
      `为消去 ${m('y')}，① $\\times 4$：`,
      dm('8x - 4y = 20'),
      `与 ② 式相加：`,
      dm('11x = 22'),
      m('x = 2'),
      `把 ${m('x = 2')} 代入 ① 式：`,
      dm('2\\times 2 - y = 5'),
      `得 ${m('y = -1')}`,
    ],
    answer: fmtAnswer(2, -1),
  };
}

export const SYSTEM_EQUATION_GENERATORS = [
  { id: 'sub-ready', title: '代入法：直接代入', generator: genSubstitutionReady },
  { id: 'sub-isolate', title: '代入法：先解出一个未知数', generator: genSubstitutionIsolate },
  { id: 'elimination', title: '加减消元法', generator: genEliminationSystem },
];
