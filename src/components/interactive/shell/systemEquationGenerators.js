import { randInt, pickOne } from './mathRandom';

function fmtLin(a, b, xName = 'x', yName = 'y') {
  const parts = [];
  if (a !== 0) {
    if (a === 1) parts.push(xName);
    else if (a === -1) parts.push(`−${xName}`);
    else parts.push(`${a}${xName}`);
  }
  if (b !== 0) {
    const abs = Math.abs(b);
    const core = abs === 1 ? yName : `${abs}${yName}`;
    if (parts.length === 0) parts.push(b < 0 ? `−${core}` : core);
    else parts.push(b < 0 ? `− ${core}` : `+ ${core}`);
  }
  return parts.length === 0 ? '0' : parts.join(' ');
}

function fmtEq(a, b, c) {
  return `${fmtLin(a, b)} = ${c}`;
}

/** y = mx + k */
function fmtSolvedForY(m, k) {
  if (m === 0) return `y = ${k}`;
  const mx = m === 1 ? 'x' : m === -1 ? '−x' : `${m}x`;
  if (k > 0) return `y = ${mx} + ${k}`;
  if (k < 0) return `y = ${mx} − ${-k}`;
  return `y = ${mx}`;
}

function fmtMxPlusK(m, k) {
  if (m === 0) return `${k}`;
  const mx = m === 1 ? 'x' : m === -1 ? '−x' : `${m}x`;
  if (k === 0) return mx;
  if (k > 0) return `${mx} + ${k}`;
  return `${mx} − ${-k}`;
}

function evalMxPlusKDisplay(m, k, xVal) {
  if (m === 0) return `${k}`;
  const prod = m * xVal;
  if (k === 0) return `${m}×(${xVal}) = ${prod}`;
  if (k > 0) return `${m}×(${xVal}) + ${k} = ${prod + k}`;
  return `${m}×(${xVal}) − ${-k} = ${prod + k}`;
}

function fmtCoeff(n) {
  if (n === 1) return '';
  if (n === -1) return '−';
  return `${n}`;
}

function fmtSystem(eq1, eq2) {
  return `{ ${eq1}\n  ${eq2} }`;
}

function fmtAnswer(x, y) {
  return `x = ${x}，y = ${y}`;
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
  const ax = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? '−x' : `${a}x`;
  if (!ax) return `${bExpr} = ${c}`;
  if (bExpr.startsWith('−')) return `${ax} ${bExpr} = ${c}`;
  return `${ax} + ${bExpr} = ${c}`;
}

function expandAfterSub(a, b, m, k, c) {
  const coeffX = a + b * m;
  const constTerm = b * k;
  if (constTerm === 0) return `${fmtCoeff(coeffX)}x = ${c}`;
  if (constTerm > 0) return `${fmtCoeff(coeffX)}x + ${constTerm} = ${c}`;
  return `${fmtCoeff(coeffX)}x − ${-constTerm} = ${c}`;
}

/**
 * 代入法：① 已解出 y，直接代入 ②。
 * 书题原型：{ y = 2x − 3 ; 3x + 2y = 8 } → (2, 1)
 */
export function genSubstitutionReady() {
  for (let t = 0; t < 40; t++) {
    const x = nonzeroInt(-6, 6);
    const m = nonzeroInt(-4, 4);
    const k = randInt(-8, 8);
    const y = m * x + k;
    const a = nonzeroInt(-5, 5);
    const b = nonzeroInt(-4, 4);
    const c = a * x + b * y;
    if (a + b * m === 0) continue;

    const inner = fmtMxPlusK(m, k);
    const bExpr =
      b === 1 ? `(${inner})` : b === -1 ? `−(${inner})` : `${b}(${inner})`;

    return {
      prompt: fmtSystem(fmtSolvedForY(m, k), fmtEq(a, b, c)),
      steps: [
        '① 式已经解出 y，直接代入 ② 式：',
        joinAxBy(a, bExpr, c),
        `去括号、合并同类项：${expandAfterSub(a, b, m, k, c)}`,
        `解得 x = ${x}`,
        `把 x = ${x} 代入 ① 式：y = ${evalMxPlusKDisplay(m, k, x)}`,
      ],
      answer: fmtAnswer(x, y),
    };
  }
  return {
    prompt: fmtSystem('y = 2x − 3', '3x + 2y = 8'),
    steps: [
      '① 式已经解出 y，直接代入 ② 式：',
      '3x + 2(2x − 3) = 8',
      '3x + 4x − 6 = 8',
      '7x = 14',
      'x = 2',
      '把 x = 2 代入 ① 式：y = 2×2 − 3 = 1',
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
    const m = -b1 * a1;
    const k = b1 * c1;
    if (a2 + b2 * m === 0) continue;

    const solved = fmtSolvedForY(m, k);
    const inner = fmtMxPlusK(m, k);
    const bExpr =
      b2 === 1 ? `(${inner})` : b2 === -1 ? `−(${inner})` : `${b2}(${inner})`;

    return {
      prompt: fmtSystem(fmtEq(a1, b1, c1), fmtEq(a2, b2, c2)),
      steps: [
        `由 ① 式解出 y：${solved}`,
        `代入 ② 式：${joinAxBy(a2, bExpr, c2)}`,
        `去括号、合并：${expandAfterSub(a2, b2, m, k, c2)}`,
        `解得 x = ${x}`,
        `把 x = ${x} 代入 ${solved}，得 y = ${y}`,
      ],
      answer: fmtAnswer(x, y),
    };
  }
  return {
    prompt: fmtSystem('2x − y = 5', '3x + 4y = 2'),
    steps: [
      '由 ① 式解出 y：y = 2x − 5',
      '代入 ② 式：3x + 4(2x − 5) = 2',
      '3x + 8x − 20 = 2',
      '11x = 22',
      'x = 2',
      '把 x = 2 代入 y = 2x − 5，得 y = −1',
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
    const m = Math.abs(b2) / gY;
    const n = Math.abs(b1) / gY;
    const y1 = m * b1;
    const y2 = n * b2;
    const sameSign = y1 === y2;
    const opVerb = sameSign ? '相减' : '相加';

    const newA1 = m * a1;
    const newC1 = m * c1;
    const newA2 = n * a2;
    const newC2 = n * c2;
    const finalA = sameSign ? newA1 - newA2 : newA1 + newA2;
    const finalC = sameSign ? newC1 - newC2 : newC1 + newC2;
    if (finalA === 0) continue;

    const steps = [];
    if (m === 1 && n === 1) {
      steps.push(`①、② 中 y 的系数已经${sameSign ? '相等' : '互为相反数'}，两式直接${opVerb}：`);
    } else {
      const parts = [];
      if (m !== 1) parts.push(`① × ${m}`);
      if (n !== 1) parts.push(`② × ${n}`);
      steps.push(`为消去 y，先把 y 的系数化为绝对值相同：${parts.join('，')}，得：`);
      steps.push(`①′  ${fmtEq(newA1, y1, newC1)}`);
      steps.push(`②′  ${fmtEq(newA2, y2, newC2)}`);
      steps.push(`两式${opVerb}，消去 y：`);
    }
    steps.push(`${fmtCoeff(finalA)}x = ${finalC}`);
    steps.push(`解得 x = ${x}`);
    steps.push(`把 x = ${x} 代入 ① 式 ${fmtEq(a1, b1, c1)}，解得 y = ${y}`);

    return {
      prompt: fmtSystem(fmtEq(a1, b1, c1), fmtEq(a2, b2, c2)),
      steps,
      answer: fmtAnswer(x, y),
    };
  }
  return {
    prompt: fmtSystem('2x − y = 5', '3x + 4y = 2'),
    steps: [
      '为消去 y，① × 4：8x − 4y = 20',
      '与 ② 式相加：11x = 22',
      'x = 2',
      '把 x = 2 代入 ① 式：2×2 − y = 5，得 y = −1',
    ],
    answer: fmtAnswer(2, -1),
  };
}

export const SYSTEM_EQUATION_GENERATORS = [
  { id: 'sub-ready', title: '代入法：直接代入', generator: genSubstitutionReady },
  { id: 'sub-isolate', title: '代入法：先解出一个未知数', generator: genSubstitutionIsolate },
  { id: 'elimination', title: '加减消元法', generator: genEliminationSystem },
];
