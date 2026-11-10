import { randInt, pickOne } from './mathRandom';

/**
 * 10.1 二元一次方程组的概念 — small randomized checks:
 *  - 判断一对值是不是方程组的解（代入两式检验）；
 *  - 已知一对值是方程的解，求方程里的系数。
 * Each returns { prompt, steps: string[], answer } like the other shell generators.
 */

function m(expr) {
  return `$${expr}$`;
}

function nonzero(min, max) {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
}

/** a·x + b·y as TeX, e.g. "2x - y". */
function lhs(a, b) {
  const term = (c, v, lead) => {
    const abs = Math.abs(c);
    const core = abs === 1 ? v : `${abs}${v}`;
    if (lead) return c < 0 ? `-${core}` : core;
    return c < 0 ? ` - ${core}` : ` + ${core}`;
  };
  return `${term(a, 'x', true)}${term(b, 'y', false)}`;
}

/** a·x0 + b·y0 written out with substituted values, e.g. "2\times 3 - (-1)". */
function subst(a, b, x0, y0) {
  const val = (v) => (v < 0 ? `(${v})` : `${v}`);
  const part = (c, v, lead) => {
    const abs = Math.abs(c);
    const core = abs === 1 ? val(v) : `${abs}\\times ${val(v)}`;
    if (lead) return c < 0 ? `-${core}` : core;
    return c < 0 ? ` - ${core}` : ` + ${core}`;
  };
  return `${part(a, x0, true)}${part(b, y0, false)}`;
}

function system(eq1, eq2) {
  return `$\\displaystyle\\begin{cases} ${eq1} \\\\ ${eq2} \\end{cases}$`;
}

/** 判断 (x0, y0) 是否是方程组的解。约一半是真解，一半只满足其中一个方程。 */
export function genIsSolutionCheck() {
  const x = randInt(-5, 6);
  const y = randInt(-5, 6);
  const a1 = nonzero(-4, 5);
  const b1 = nonzero(-4, 5);
  let a2 = nonzero(-4, 5);
  let b2 = nonzero(-4, 5);
  if (a1 * b2 === a2 * b1) {
    a2 += 1;
    if (a2 === 0) a2 = 2;
  }
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;

  const isSolution = Math.random() < 0.5;
  let cx = x;
  let cy = y;
  if (!isSolution) {
    // Shift the candidate along equation ① so it still satisfies ① but not ②.
    for (let t = 1; t < 6; t++) {
      const k = pickOne([-1, 1]) * t;
      const nx = x + b1 * k;
      const ny = y - a1 * k;
      if (Math.abs(nx) <= 12 && Math.abs(ny) <= 12) {
        cx = nx;
        cy = ny;
        break;
      }
    }
    if (cx === x && cy === y) cx = x + 1;
  }

  const v1 = a1 * cx + b1 * cy;
  const v2 = a2 * cx + b2 * cy;
  const ok1 = v1 === c1;
  const ok2 = v2 === c2;
  const isSol = ok1 && ok2;

  return {
    prompt: `判断 ${m(`x = ${cx}`)}，${m(`y = ${cy}`)} 是不是方程组 ${system(
      `${lhs(a1, b1)} = ${c1}`,
      `${lhs(a2, b2)} = ${c2}`,
    )} 的解？`,
    steps: [
      `代入 ①：${m(`${subst(a1, b1, cx, cy)} = ${v1}`)}，${ok1 ? `等于 ${c1}，成立` : `不等于 ${c1}，不成立`}。`,
      `代入 ②：${m(`${subst(a2, b2, cx, cy)} = ${v2}`)}，${ok2 ? `等于 ${c2}，成立` : `不等于 ${c2}，不成立`}。`,
      isSol
        ? '两个方程都成立，所以是方程组的解。'
        : '方程组的解必须同时满足两个方程，只满足一个不算。',
    ],
    answer: isSol ? '是方程组的解。' : '不是方程组的解。',
    fields: [
      {
        name: 'judge',
        label: '是不是方程组的解？',
        type: 'choice',
        options: ['是', '不是'],
        value: isSol ? '是' : '不是',
      },
    ],
  };
}

/** 已知 (x0, y0) 是 kx + by = c（或 ax + ky = c）的解，求 k。 */
export function genFindCoefficient() {
  const x = nonzero(-5, 6);
  const y = nonzero(-5, 6);
  const a = nonzero(-5, 6);
  const b = nonzero(-5, 6);
  const c = a * x + b * y;
  const unknownX = Math.random() < 0.5;
  const v = (n) => (n < 0 ? `(${n})` : `${n}`);
  const coefTerm = (n, name) => (n === 1 ? name : n === -1 ? `-${name}` : `${n}${name}`);
  const signed = (n) => (n < 0 ? ` - ${-n}` : ` + ${n}`);

  // Known part after substitution, and the coefficient that multiplies k.
  const known = unknownX ? b * y : a * x;
  const coef = unknownX ? x : y;
  const k = unknownX ? a : b;
  const eqText = unknownX
    ? `kx${b < 0 ? ' - ' : ' + '}${Math.abs(b) === 1 ? '' : Math.abs(b)}y = ${c}`
    : `${coefTerm(a, 'x')} + ky = ${c}`;
  const substText = unknownX
    ? `${v(x)}k ${b < 0 ? '-' : '+'} ${Math.abs(b)}\\times ${v(y)} = ${c}`
    : `${a}\\times ${v(x)} + ${v(y)}k = ${c}`;

  return {
    prompt: `已知 ${m(`x = ${x}`)}，${m(`y = ${y}`)} 是方程 ${m(eqText)} 的一个解，求 ${m('k')} 的值。`,
    steps: [
      '「是方程的解」就是说：把这对值代入，方程左右两边相等。',
      `代入：${m(substText)}，即 ${m(`${coefTerm(coef, 'k')}${signed(known)} = ${c}`)}。`,
      `${m(`${coefTerm(coef, 'k')} = ${c - known}`)}，所以 ${m(`k = ${k}`)}。`,
    ],
    answer: m(`k = ${k}`),
    fields: [{ name: 'k', value: k }],
  };
}
