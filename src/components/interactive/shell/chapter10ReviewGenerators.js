import { randInt, pickOne } from './mathRandom';

function m(expr) {
  return `$${expr}$`;
}

function dm(expr) {
  return `$$${expr}$$`;
}

function fmtSystem(eq1, eq2) {
  return `$\\displaystyle\\begin{cases} ${eq1} \\\\ ${eq2} \\end{cases}$`;
}

function fmtSystem3(eq1, eq2, eq3) {
  return `$\\displaystyle\\begin{cases} ${eq1} \\\\ ${eq2} \\\\ ${eq3} \\end{cases}$`;
}

function nonzero(min, max) {
  let n = 0;
  while (n === 0) n = randInt(min, max);
  return n;
}

/** 复习题 1：代入法。结构与书题相同：已解出一个未知数，或先解出一个再代入。 */
export function genCh10SubReview() {
  const kind = pickOne(['equal', 'given', 'isolate', 'cross']);
  if (kind === 'equal') return genEqualUnknown();
  if (kind === 'given') return genGivenUnknown();
  if (kind === 'isolate') return genIsolateThenSub();
  return genCrossSub();
}

function plusConst(n) {
  if (n === 0) return '';
  return n > 0 ? ` + ${n}` : ` - ${-n}`;
}

function genEqualUnknown() {
  const b = randInt(-6, 6);
  const p = randInt(2, 4);
  const q = nonzero(-5, 6);
  const r = p + randInt(1, 3);
  const a = p * b + q;
  const s = a - r * b;
  const nameA = pickOne(['a', 'x']);
  const nameB = nameA === 'a' ? 'b' : 'y';
  return {
    prompt: fmtSystem(`${nameA} = ${p}${nameB}${plusConst(q)}`, `${nameA} = ${r}${nameB}${plusConst(s)}`),
    steps: [
      `两式右边都等于 ${m(nameA)}，所以右边相等：`,
      dm(`${p}${nameB} ${q < 0 ? '-' : '+'} ${Math.abs(q)} = ${r}${nameB} ${s < 0 ? '-' : '+'} ${Math.abs(s)}`),
      `移项：${m(`${p - r}${nameB} = ${s - q}`)}，解得 ${m(`${nameB} = ${b}`)}。`,
      `代回第一式，得 ${m(`${nameA} = ${a}`)}。`,
    ],
    answer: `${m(`${nameA} = ${a}`)}，${m(`${nameB} = ${b}`)}`,
  };
}

function genGivenUnknown() {
  const y = randInt(-5, 6);
  const k = randInt(2, 6);
  const c = randInt(-8, 8);
  const x = k * y + c;
  const diff = x - y;
  return {
    prompt: fmtSystem('x - y = ' + diff, `x = ${k}y ${c < 0 ? '-' : '+'} ${Math.abs(c)}`),
    steps: [
      `② 已解出 ${m('x')}，代入 ①：`,
      dm(`${k}y ${c < 0 ? '-' : '+'} ${Math.abs(c)} - y = ${diff}`),
      dm(`${k - 1}y = ${diff - c}`),
      `解得 ${m(`y = ${y}`)}，再代回 ② 得 ${m(`x = ${x}`)}。`,
    ],
    answer: `${m(`x = ${x}`)}，${m(`y = ${y}`)}`,
  };
}

function genIsolateThenSub() {
  const y = randInt(-6, 6);
  const x = y + randInt(1, 5);
  const a2 = randInt(2, 5);
  const b2 = randInt(1, 4);
  const c2 = a2 * x + b2 * y;
  return {
    prompt: fmtSystem(`x - y = ${x - y}`, `${a2}x + ${b2}y = ${c2}`),
    steps: [
      `由 ① 得 ${m(`x = y + ${x - y}`)}，代入 ②：`,
      dm(`${a2}(y + ${x - y}) + ${b2}y = ${c2}`),
      `合并后解出 ${m('y')}，再代回求 ${m('x')}。`,
      `解得 ${m(`x = ${x}`)}，${m(`y = ${y}`)}。`,
    ],
    answer: `${m(`x = ${x}`)}，${m(`y = ${y}`)}`,
  };
}

function genCrossSub() {
  const x = randInt(2, 12);
  const y = randInt(2, 12);
  const a = randInt(2, 6);
  const c1 = a * x - y;
  const b = randInt(2, 6);
  const c2 = b * y - x;
  return {
    prompt: fmtSystem(`${a}x - y = ${c1}`, `${b}y - x = ${c2}`),
    steps: [
      `由 ① 解出 ${m(`y = ${a}x - ${c1}`)}，代入 ②：`,
      dm(`${b}(${a}x - ${c1}) - x = ${c2}`),
      `解得 ${m(`x = ${x}`)}，再代回得 ${m(`y = ${y}`)}。`,
    ],
    answer: `${m(`x = ${x}`)}，${m(`y = ${y}`)}`,
  };
}

/** 复习题 2：加减消元。 */
export function genCh10AddSubReview() {
  const kind = pickOne(['opp', 'same', 'swap']);
  if (kind === 'opp') return genOppCoeff();
  if (kind === 'same') return genSameCoeff();
  return genRearrangeAdd();
}

function genOppCoeff() {
  const x = randInt(-6, 6);
  const y = randInt(-8, 8);
  const a1 = nonzero(-5, 5);
  const a2 = nonzero(-5, 5);
  const b = nonzero(1, 4);
  const c1 = a1 * x + b * y;
  const c2 = a2 * x - b * y;
  return {
    prompt: fmtSystem(`${a1}x + ${b}y = ${c1}`, `${a2}x - ${b}y = ${c2}`),
    steps: [
      `${m('y')} 的系数互为相反数，两式相加消去 ${m('y')}：`,
      dm(`${a1 + a2}x = ${c1 + c2}`),
      `解得 ${m(`x = ${x}`)}，代入 ① 得 ${m(`y = ${y}`)}。`,
    ],
    answer: `${m(`x = ${x}`)}，${m(`y = ${y}`)}`,
  };
}

function genSameCoeff() {
  const x = randInt(-8, 8);
  const y = randInt(-6, 6);
  const a1 = nonzero(1, 5);
  const a2 = nonzero(1, 5);
  if (a1 === a2) return genOppCoeff();
  const b = nonzero(1, 4);
  const c1 = a1 * x + b * y;
  const c2 = a2 * x + b * y;
  return {
    prompt: fmtSystem(`${a1}x + ${b}y = ${c1}`, `${a2}x + ${b}y = ${c2}`),
    steps: [
      `${m('y')} 的系数相同，两式相减消去 ${m('y')}：`,
      dm(`${a1 - a2}x = ${c1 - c2}`),
      `解得 ${m(`x = ${x}`)}，代入 ① 得 ${m(`y = ${y}`)}。`,
    ],
    answer: `${m(`x = ${x}`)}，${m(`y = ${y}`)}`,
  };
}

function genRearrangeAdd() {
  const f = randInt(-5, 6);
  const g = nonzero(-5, 6);
  const a = nonzero(2, 5);
  const k = randInt(2, 4);
  const c1 = a * f + g;
  const c2 = k * g - a * f;
  return {
    prompt: fmtSystem(`${a}f + g = ${c1}`, `${k}g - ${a}f = ${c2}`),
    steps: [
      `第二式已写成 ${m(`${k}g - ${a}f = ${c2}`)}，与 ① 相加可以消去 ${m('f')}：`,
      dm(`${k + 1}g = ${c1 + c2}`),
      `解得 ${m(`g = ${g}`)}，代入 ① 得 ${m(`f = ${f}`)}。`,
    ],
    answer: `${m(`f = ${f}`)}，${m(`g = ${g}`)}`,
  };
}

/** 复习题 3：先去括号、去分母，再消元。 */
export function genCh10ClearReview() {
  const x = randInt(-4, 6);
  const y = randInt(-4, 6);
  const p = randInt(2, 4);
  const q = randInt(1, 3);
  const k = p * (x - y) - q * (x + y);
  return {
    prompt: fmtSystem(`${p}(x - y) = ${q}(x + y)${plusConst(k)}`, `x + y = ${x + y}`),
    steps: [
      `先去括号：`,
      dm(`${p}x - ${p}y = ${q}x + ${q}y${plusConst(k)}`),
      `移项合并后，与 ${m(`x + y = ${x + y}`)} 联立。`,
      `解得 ${m(`x = ${x}`)}，${m(`y = ${y}`)}。`,
    ],
    answer: `${m(`x = ${x}`)}，${m(`y = ${y}`)}`,
  };
}

/** 复习题 4：三元，先消一个未知数，化成二元。 */
export function genCh10ThreeReview() {
  const x = randInt(-4, 6);
  const y = randInt(-4, 6);
  const z = randInt(-4, 6);
  const a1 = nonzero(-4, 4);
  const b1 = nonzero(-3, 3);
  const c1 = nonzero(-3, 3);
  const a2 = nonzero(-4, 4);
  const b2 = -b1;
  const c2 = nonzero(-3, 3);
  const a3 = nonzero(-3, 4);
  const b3 = nonzero(-3, 3);
  const c3 = nonzero(-3, 3);
  const d1 = a1 * x + b1 * y + c1 * z;
  const d2 = a2 * x + b2 * y + c2 * z;
  const d3 = a3 * x + b3 * y + c3 * z;
  return {
    prompt: fmtSystem3(
      `${term(a1, 'x')}${term(b1, 'y', false)}${term(c1, 'z', false)} = ${d1}`,
      `${term(a2, 'x')}${term(b2, 'y', false)}${term(c2, 'z', false)} = ${d2}`,
      `${term(a3, 'x')}${term(b3, 'y', false)}${term(c3, 'z', false)} = ${d3}`,
    ),
    steps: [
      `①、② 中 ${m('y')} 的系数互为相反数，相加消去 ${m('y')}，得到关于 ${m('x')}、${m('z')} 的方程。`,
      `再与 ③ 联立，化成二元一次方程组，求出 ${m('x')}、${m('z')} 后再回代求 ${m('y')}。`,
      `解得 ${m(`x = ${x}`)}，${m(`y = ${y}`)}，${m(`z = ${z}`)}。`,
    ],
    answer: `${m(`x = ${x}`)}，${m(`y = ${y}`)}，${m(`z = ${z}`)}`,
  };
}

function term(coeff, name, leading = true) {
  if (coeff === 0) return '';
  const abs = Math.abs(coeff);
  const core = abs === 1 ? name : `${abs}${name}`;
  if (leading) return coeff < 0 ? `-${core}` : core;
  return coeff < 0 ? ` - ${core}` : ` + ${core}`;
}

