import { frac, lcm } from './fraction';
import { randInt, pickOne } from './mathRandom';

const VARS = ['x', 'y', 'z', 'a', 'b', 'n'];

function randCoeff({ allowHalf = true, min = 1, max = 9 } = {}) {
  const n = randInt(min, max) * (Math.random() < 0.5 ? -1 : 1);
  if (allowHalf && Math.random() < 0.3) return frac(n, 2); // e.g. n=5 -> 2.5
  return frac(n);
}

function randConst({ min = 1, max = 20 } = {}) {
  return frac(randInt(min, max) * (Math.random() < 0.5 ? -1 : 1));
}

function makeTerm(kind, value) {
  return { kind, value };
}

/** Signed, standalone number (leading "-" already folded in for negatives). */
function fmtCoeffNumber(fr) {
  if (fr.den === 1) return `${fr.num}`;
  if (fr.den === 2) return (fr.num / 2).toFixed(1);
  return fr.toDisplayString();
}

function fmtTerm(coeff, varName, isFirst) {
  const neg = coeff.num < 0;
  const abs = neg ? coeff.neg() : coeff;
  const isOne = abs.den === 1 && abs.num === 1;
  const core = `${isOne ? '' : fmtCoeffNumber(abs)}${varName}`;
  if (isFirst) return neg ? `-${core}` : core;
  return neg ? `- ${core}` : `+ ${core}`;
}

function fmtConst(c, isFirst) {
  const neg = c.num < 0;
  const abs = neg ? c.neg() : c;
  const numStr = fmtCoeffNumber(abs);
  if (isFirst) return neg ? `-${numStr}` : numStr;
  return neg ? `- ${numStr}` : `+ ${numStr}`;
}

/** The coefficient that leads a freshly-combined equation side, e.g. "3", "-", "" (for ±1). */
function fmtLeadingCoeff(fr) {
  if (fr.den === 1 && Math.abs(fr.num) === 1) return fr.num < 0 ? '-' : '';
  return fmtCoeffNumber(fr);
}

function renderSide(side, varName) {
  if (side.length === 0) return '0';
  return side.map((t, i) => (t.kind === 'coeff' ? fmtTerm(t.value, varName, i === 0) : fmtConst(t.value, i === 0))).join(' ');
}

function sumKind(side, kind) {
  return side.filter((t) => t.kind === kind).reduce((acc, t) => acc.add(t.value), frac(0));
}

function solveSides(left, right) {
  const combinedCoeff = sumKind(left, 'coeff').sub(sumKind(right, 'coeff'));
  const combinedConst = sumKind(right, 'const').sub(sumKind(left, 'const'));
  return { combinedCoeff, combinedConst };
}

function isTerminatingDenominator(den) {
  let d = Math.abs(den);
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  return d === 1;
}

function fmtAnswer(fr) {
  if (fr.den === 1) return `${fr.num}`;
  const fracStr = fr.toDisplayString();
  if (isTerminatingDenominator(fr.den)) {
    const decimal = Number(fr.toNumber().toFixed(4)).toString();
    return `${fracStr}（即 ${decimal}）`;
  }
  return fracStr;
}

/** Combine `expandedLeft`/`expandedRight` (already-final term lists) into the
 * last two solving steps, or null if the equation has no unique solution. */
function finalize({ prompt, varName, expandedLeft, expandedRight, priorSteps = [] }) {
  const { combinedCoeff, combinedConst } = solveSides(expandedLeft, expandedRight);
  if (combinedCoeff.isZero()) return null;
  const answer = combinedConst.div(combinedCoeff);
  const steps = [
    ...priorSteps,
    `移项、合并同类项，得：${fmtLeadingCoeff(combinedCoeff)}${varName} = ${fmtCoeffNumber(combinedConst)}`,
    `系数化为 1，得：${varName} = ${fmtAnswer(answer)}`,
  ];
  return { prompt, steps, answer: `${varName} = ${fmtAnswer(answer)}` };
}

function attempt(fn, tries = 25) {
  for (let i = 0; i < tries; i++) {
    const result = fn();
    if (result) return result;
  }
  throw new Error('Failed to generate a solvable equation after many attempts');
}

/** 1. 解下列方程 — move terms, combine like terms (4 shapes mirroring the textbook set). */
export function genBasicLinearEquation() {
  return attempt(() => {
    const varName = pickOne(VARS);
    const shape = pickOne(['A', 'B', 'C', 'D']);
    let left;
    let right;

    if (shape === 'A') {
      left = [makeTerm('coeff', randCoeff({ allowHalf: false })), makeTerm('coeff', randCoeff({ allowHalf: false }))];
      right = [makeTerm('const', randConst({ min: 4, max: 30 }))];
    } else if (shape === 'B') {
      left = [
        makeTerm('coeff', randCoeff({ allowHalf: false, min: 8, max: 20 })),
        makeTerm('coeff', randCoeff({ allowHalf: true, min: 1, max: 9 }).neg()),
        makeTerm('coeff', randCoeff({ allowHalf: true, min: 1, max: 9 }).neg()),
      ];
      right = [makeTerm('const', randConst({ min: 1, max: 20 }))];
    } else if (shape === 'C') {
      left = [makeTerm('coeff', randCoeff({ allowHalf: false })), makeTerm('const', randConst({ min: 1, max: 15 }))];
      right = [makeTerm('coeff', randCoeff({ allowHalf: false })), makeTerm('const', randConst({ min: 1, max: 15 }))];
    } else {
      left = [makeTerm('const', randConst({ min: 1, max: 15 })), makeTerm('coeff', randCoeff({ allowHalf: false }).neg())];
      right = [makeTerm('coeff', randCoeff({ allowHalf: false })), makeTerm('const', randConst({ min: 1, max: 15 }))];
    }

    const prompt = `${renderSide(left, varName)} = ${renderSide(right, varName)}`;
    return finalize({ prompt, varName, expandedLeft: left, expandedRight: right });
  });
}

/** 2. 解下列方程（含括号）— distribute a signed multiplier into a parenthesized group first. */
export function genParenthesesEquation() {
  return attempt(() => {
    const varName = pickOne(VARS);
    const A = frac(randInt(2, 9));
    const kMag = pickOne([1, 1, 2, 3, 4]);
    const kSign = Math.random() < 0.5 ? 1 : -1;
    const k = frac(kSign * kMag);
    const B = frac(randInt(1, 9) * (Math.random() < 0.5 ? -1 : 1));
    const m = randConst({ min: 1, max: 9 });
    const constFirst = Math.random() < 0.5;
    const C = randConst({ min: 1, max: 30 });

    const innerTerms = constFirst ? [makeTerm('const', m), makeTerm('coeff', B)] : [makeTerm('coeff', B), makeTerm('const', m)];
    const kLabel = kMag === 1 ? (kSign < 0 ? '-' : '+') : kSign < 0 ? `- ${kMag}` : `+ ${kMag}`;
    const prompt = `${fmtTerm(A, varName, true)} ${kLabel}(${renderSide(innerTerms, varName)}) = ${fmtCoeffNumber(C)}`;

    const distributedConst = m.mul(k);
    const distributedCoeff = B.mul(k);
    const expandedLeft = constFirst
      ? [makeTerm('coeff', A), makeTerm('const', distributedConst), makeTerm('coeff', distributedCoeff)]
      : [makeTerm('coeff', A), makeTerm('coeff', distributedCoeff), makeTerm('const', distributedConst)];
    const expandedRight = [makeTerm('const', C)];

    const priorSteps = [`去括号，得：${renderSide(expandedLeft, varName)} = ${renderSide(expandedRight, varName)}`];
    return finalize({ prompt, varName, expandedLeft, expandedRight, priorSteps });
  });
}

/** 3. 解下列方程（含分母）— clear denominators by the LCM of the two denominators. */
export function genFractionEquation() {
  return attempt(() => {
    const varName = pickOne(VARS);
    const DENOMS = [2, 3, 4, 5, 6, 10, 12, 15, -5];
    const m = pickOne(DENOMS);
    let n = pickOne(DENOMS);
    while (n === m) n = pickOne(DENOMS);

    const a = randInt(1, 9);
    const b = randInt(1, 15) * (Math.random() < 0.5 ? -1 : 1);
    const c = randInt(1, 9);
    const d = randInt(1, 15) * (Math.random() < 0.5 ? -1 : 1);

    const hasExtraConst = Math.random() < 0.4;
    const extraOnLeft = Math.random() < 0.5;
    const extraSign = Math.random() < 0.5 ? 1 : -1;
    const k = hasExtraConst ? randInt(1, 5) * extraSign : 0;

    const numLeft = `${fmtTerm(frac(a), varName, true)} ${fmtConst(frac(b), false)}`;
    const numRight = `${fmtTerm(frac(c), varName, true)} ${fmtConst(frac(d), false)}`;
    let promptLeft = `(${numLeft})/${m}`;
    let promptRight = `(${numRight})/${n}`;
    if (hasExtraConst) {
      const extraStr = extraSign < 0 ? `- ${k}` : `+ ${k}`;
      if (extraOnLeft) promptLeft = `${promptLeft} ${extraStr}`;
      else promptRight = `${promptRight} ${extraStr}`;
    }
    const prompt = `${promptLeft} = ${promptRight}`;

    const L = lcm(Math.abs(m), Math.abs(n));
    const LFrac = frac(L);
    let clearedLeft = [makeTerm('coeff', frac(a, m).mul(LFrac)), makeTerm('const', frac(b, m).mul(LFrac))];
    let clearedRight = [makeTerm('coeff', frac(c, n).mul(LFrac)), makeTerm('const', frac(d, n).mul(LFrac))];
    if (hasExtraConst) {
      const extraTerm = makeTerm('const', frac(extraSign * k).mul(LFrac));
      if (extraOnLeft) clearedLeft = [...clearedLeft, extraTerm];
      else clearedRight = [...clearedRight, extraTerm];
    }

    const priorSteps = [`去分母（两边同乘 ${L}），得：${renderSide(clearedLeft, varName)} = ${renderSide(clearedRight, varName)}`];
    return finalize({ prompt, varName, expandedLeft: clearedLeft, expandedRight: clearedRight, priorSteps });
  });
}

/** 4. 用方程解答下列问题 — translate a Chinese sentence into an equation, then solve it. */
export function genWordTranslationEquation() {
  return attempt(() => {
    const varName = pickOne(VARS);
    const shape = pickOne(['A', 'B', 'C', 'D']);

    if (shape === 'A') {
      const p = randInt(2, 9);
      let r = randInt(2, 9);
      while (r === p) r = randInt(2, 9);
      const q = randInt(1, 20);
      const s = randInt(1, 20);
      const prompt = `${varName} 的 ${p} 倍与 ${q} 的和等于 ${varName} 的 ${r} 倍与 ${s} 的差，求 ${varName}。`;
      const expandedLeft = [makeTerm('coeff', frac(p)), makeTerm('const', frac(q))];
      const expandedRight = [makeTerm('coeff', frac(r)), makeTerm('const', frac(-s))];
      const priorSteps = [`列方程：${renderSide(expandedLeft, varName)} = ${renderSide(expandedRight, varName)}`];
      return finalize({ prompt, varName, expandedLeft, expandedRight, priorSteps });
    }

    if (shape === 'B') {
      const k = randInt(2, 9) * (Math.random() < 0.5 ? -1 : 1);
      const q = randInt(1, 20);
      const prompt = `${varName} 与 ${k} 的积等于 ${varName} 与 ${q} 的和，求 ${varName}。`;
      const expandedLeft = [makeTerm('coeff', frac(k))];
      const expandedRight = [makeTerm('coeff', frac(1)), makeTerm('const', frac(q))];
      const priorSteps = [`列方程：${renderSide(expandedLeft, varName)} = ${renderSide(expandedRight, varName)}`];
      return finalize({ prompt, varName, expandedLeft, expandedRight, priorSteps });
    }

    if (shape === 'C') {
      const p = pickOne([1.2, 1.5, 2, 2.5, 3, 3.6, 4]);
      const q = pickOne([1.2, 1.5, 2, 2.5, 3, 3.6, 4]);
      const a = randInt(1, 20);
      const b = randInt(1, 20);
      const prompt = `${varName} 与 ${a} 的和的 ${p} 倍等于 ${varName} 与 ${b} 的差的 ${q} 倍，求 ${varName}。`;
      const pF = Number.isInteger(p * 10) ? frac(p * 10, 10) : frac(p);
      const qF = Number.isInteger(q * 10) ? frac(q * 10, 10) : frac(q);
      const eqPrompt = `${p}(${varName} + ${a}) = ${q}(${varName} - ${b})`;
      const expandedLeft = [makeTerm('coeff', pF), makeTerm('const', pF.mul(frac(a)))];
      const expandedRight = [makeTerm('coeff', qF), makeTerm('const', qF.mul(frac(-b)))];
      const priorSteps = [
        `列方程：${eqPrompt}`,
        `去括号，得：${renderSide(expandedLeft, varName)} = ${renderSide(expandedRight, varName)}`,
      ];
      return finalize({ prompt, varName, expandedLeft, expandedRight, priorSteps });
    }

    // shape === 'D'
    const m = randInt(2, 5);
    const c = pickOne([0.5, 1, 1.5, 2, 2.5]);
    const [pn, pd] = pickOne([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5]]);
    const [qn, qd] = pickOne([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4], [1, 5]]);
    const d = randInt(1, 15);
    const prompt = `${varName} 的 ${m} 倍与 ${c} 的和的 ${pn}/${pd} 等于 ${varName} 与 ${d} 的差的 ${qn}/${qd}，求 ${varName}。`;
    const cF = Number.isInteger(c * 10) ? frac(c * 10, 10) : frac(c);
    const pF = frac(pn, pd);
    const qF = frac(qn, qd);
    const eqPrompt = `${pn}/${pd}(${m}${varName} + ${c}) = ${qn}/${qd}(${varName} - ${d})`;
    const expandedLeft = [makeTerm('coeff', pF.mul(frac(m))), makeTerm('const', pF.mul(cF))];
    const expandedRight = [makeTerm('coeff', qF), makeTerm('const', qF.mul(frac(-d)))];
    const priorSteps = [
      `列方程：${eqPrompt}`,
      `去括号，得：${renderSide(expandedLeft, varName)} = ${renderSide(expandedRight, varName)}`,
    ];
    return finalize({ prompt, varName, expandedLeft, expandedRight, priorSteps });
  });
}

export const EQUATION_GENERATORS = [
  { id: 'basic', title: '解方程：移项与合并同类项', generator: genBasicLinearEquation },
  { id: 'parens', title: '解方程：先去括号', generator: genParenthesesEquation },
  { id: 'fractions', title: '解方程：先去分母', generator: genFractionEquation },
  { id: 'word', title: '列方程解应用题', generator: genWordTranslationEquation },
];
