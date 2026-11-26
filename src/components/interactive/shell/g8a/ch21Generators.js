import { randInt, pickOne } from '../mathRandom';
import { m, nonzero, gcd, par } from '../examKit';
import { mono, linP, add, sub, mul, pow, scale, tex, plain, texParen, plainParen, termCount } from '../poly';

/**
 * 第二十一章 整式的乘法与因式分解 — randomized items for MixedPractice.
 * Each returns { prompt, steps, answer, fields }; answers are typed expressions
 * (type 'expr', graded by shell/exprCheck.js) or numbers.
 */

const LET = ['a', 'b', 'x', 'y', 'm', 'n'];
const pick2 = () => {
  const a = pickOne(LET);
  let b = pickOne(LET);
  while (b === a) b = pickOne(LET);
  return [a, b].sort();
};
export const exprField = (value, opts = {}) => ({
  name: opts.name || 'e',
  label: opts.label || '结果',
  display: opts.display || '\\square',
  type: 'expr',
  value,
  ...opts,
});
const pw = (v, n) => (n === 1 ? v : `${v}^{${n}}`);

/* ---------------- 21.1 幂的运算 ---------------- */

/** 同底数幂的乘法 a^m · a^n · a^p */
export function genSameBaseMul() {
  const v = pickOne(LET);
  const k = randInt(2, 3);
  const ex = Array.from({ length: k }, () => randInt(1, 7));
  const sum = ex.reduce((s, n) => s + n, 0);
  return {
    prompt: `计算：${m(ex.map((n) => pw(v, n)).join(' \\cdot '))}`,
    steps: [
      '同底数幂相乘，底数不变，指数相加：$a^m\\cdot a^n = a^{m+n}$。',
      `${m(`${ex.map((n) => pw(v, n)).join(' \\cdot ')} = ${v}^{${ex.join('+')}} = ${pw(v, sum)}`)}`,
      ex.includes(1) ? `注意：${m(v)} 本身的指数是 1，不要漏掉。` : '',
    ].filter(Boolean),
    answer: m(pw(v, sum)),
    fields: [exprField(`${v}^${sum}`, { form: 'monomial' })],
  };
}

/** 底数为负数 / 含负号：(−2)^m × (−2)^n，或 (−x)^m · x^n */
export function genSignedBaseMul() {
  if (Math.random() < 0.5) {
    const a = randInt(1, 4);
    const b = randInt(1, 4);
    const s = a + b;
    const val = (-2) ** s;
    const e2 = (n) => (n === 1 ? '(-2)' : `(-2)^{${n}}`);
    return {
      prompt: `计算：${m(`${e2(a)}\\times ${e2(b)}`)}`,
      steps: [
        `同底数幂相乘：${m(`${e2(a)}\\times ${e2(b)} = (-2)^{${a}+${b}} = (-2)^{${s}}`)}。`,
        `${s} 是${s % 2 ? '奇数，结果为负' : '偶数，结果为正'}：${m(`(-2)^{${s}} = ${val}`)}。`,
      ],
      answer: m(`${val}`),
      fields: [{ name: 'v', label: '结果', display: '\\square', value: val }],
    };
  }
  const v = pickOne(LET);
  const a = randInt(2, 5);
  const b = randInt(1, 5);
  const sign = a % 2 ? -1 : 1;
  return {
    prompt: `计算：${m(`(-${v})^{${a}}\\cdot ${pw(v, b)}`)}`,
    steps: [
      `${m(`(-${v})^{${a}} = ${sign < 0 ? '-' : ''}${pw(v, a)}`)}（负号的${a}次方，${a % 2 ? '奇数次为负' : '偶数次为正'}）。`,
      `所以原式 ${m(`= ${sign < 0 ? '-' : ''}${pw(v, a)}\\cdot ${pw(v, b)} = ${sign < 0 ? '-' : ''}${pw(v, a + b)}`)}。`,
    ],
    answer: m(`${sign < 0 ? '-' : ''}${pw(v, a + b)}`),
    fields: [exprField(`${sign < 0 ? '-' : ''}${v}^${a + b}`, { form: 'monomial' })],
  };
}

/** 幂的乘方 (a^m)^n，−(x^m)^n */
export function genPowerOfPower() {
  const v = pickOne(LET);
  const a = randInt(2, 6);
  const b = randInt(2, 5);
  const neg = Math.random() < 0.4;
  const s = neg ? '-' : '';
  return {
    prompt: `计算：${m(`${s}(${pw(v, a)})^{${b}}`)}`,
    steps: [
      '幂的乘方，底数不变，指数相乘：$(a^m)^n = a^{mn}$。',
      `${m(`${s}(${pw(v, a)})^{${b}} = ${s}${v}^{${a}\\times ${b}} = ${s}${pw(v, a * b)}`)}`,
      neg ? '前面的负号不在乘方里面，照抄。' : '常见错误：写成指数相加。',
    ],
    answer: m(`${s}${pw(v, a * b)}`),
    fields: [exprField(`${s}${v}^${a * b}`, { form: 'monomial' })],
  };
}

/** 积的乘方 (k a^p b^q)^n */
export function genPowerOfProduct() {
  const [x, y] = pick2();
  const k = pickOne([2, 3, -2, -3, -1, 5]);
  const p = randInt(1, 3);
  const q = randInt(1, 3);
  const n = k === 5 ? 2 : randInt(2, 3);
  const inner = mono(k, { [x]: p, [y]: q });
  const res = pow(inner, n);
  return {
    prompt: `计算：${m(`(${tex(inner)})^{${n}}`)}`,
    steps: [
      '积的乘方：把每一个因式分别乘方，再相乘：$(ab)^n = a^nb^n$。',
      `${m(`(${tex(inner)})^{${n}} = ${par(k)}^{${n}}\\cdot (${pw(x, p)})^{${n}}\\cdot (${pw(y, q)})^{${n}}`)}`,
      `${m(`= ${tex(res)}`)}（${m(`${par(k)}^{${n}} = ${k ** n}`)}）`,
    ],
    answer: m(tex(res)),
    fields: [exprField(plain(res), { form: 'monomial' })],
  };
}

/** 同底数幂的除法、零指数 */
export function genSameBaseDiv() {
  const v = pickOne(LET);
  if (Math.random() < 0.3) {
    const b = pickOne([3, 5, 7, -2, 10]);
    const a = randInt(2, 6);
    return {
      prompt: `计算：${m(`${par(b)}^{${a}}\\div ${par(b)}^{${a}}`)}`,
      steps: [
        `同底数幂相除，指数相减：${m(`${par(b)}^{${a}-${a}} = ${par(b)}^{0}`)}。`,
        `任何不等于 0 的数的 0 次幂都等于 1。`,
      ],
      answer: m('1'),
      fields: [{ name: 'v', label: '结果', display: '\\square', value: 1 }],
    };
  }
  const a = randInt(5, 12);
  const b = randInt(1, a - 1);
  return {
    prompt: `计算：${m(`${pw(v, a)}\\div ${pw(v, b)}`)}（${m(`${v}\\ne 0`)}）`,
    steps: ['同底数幂相除，底数不变，指数相减：$a^m\\div a^n = a^{m-n}$。', `${m(`${pw(v, a)}\\div ${pw(v, b)} = ${v}^{${a}-${b}} = ${pw(v, a - b)}`)}`],
    answer: m(pw(v, a - b)),
    fields: [exprField(`${v}^${a - b}`, { form: 'monomial' })],
  };
}

/* ---------------- 21.1 整式的乘法 / 除法 ---------------- */

function randMono([x, y]) {
  return mono(nonzero(-5, 5), { [x]: randInt(0, 3), [y]: randInt(0, 3) });
}
function nonConstMono(vars) {
  let p;
  do p = randMono(vars);
  while (Object.keys(p)[0] === '');
  return p;
}

/** 单项式乘单项式 */
export function genMonoTimesMono() {
  const vars = pick2();
  const p = nonConstMono(vars);
  const q = nonConstMono(vars);
  const r = mul(p, q);
  return {
    prompt: `计算：${m(`${texParen(p)}\\cdot ${texParen(q)}`)}`,
    steps: [
      '单项式相乘：系数相乘，同底数幂相乘，只在一个因式里出现的字母连同指数照写。',
      `系数：${m(`${Object.values(p)[0]}\\times ${par(Object.values(q)[0])} = ${Object.values(r)[0]}`)}；字母部分指数相加。`,
      `结果：${m(tex(r))}`,
    ],
    answer: m(tex(r)),
    fields: [exprField(plain(r), { form: 'monomial' })],
  };
}

/** 单项式乘多项式 */
export function genMonoTimesPoly() {
  const vars = pick2();
  const k = nonConstMono(vars);
  const [x] = vars;
  const p = add(mono(nonzero(-5, 5), { [x]: 2 }), mono(nonzero(-6, 6), { [x]: 1 }), mono(nonzero(-9, 9)));
  const r = mul(k, p);
  return {
    prompt: `计算：${m(`${tex(k)}(${tex(p)})`)}`,
    steps: [
      '用单项式去乘多项式的每一项，再把所得的积相加：$m(a+b+c) = ma+mb+mc$。',
      `${m(Object.entries(p).map(([key, c]) => tex(mul(k, { [key]: c }))).join(',\\quad '))}`,
      `合起来：${m(tex(r))}（注意每一项的符号）`,
    ],
    answer: m(tex(r)),
    fields: [exprField(plain(r), { form: 'poly' })],
  };
}

/** 多项式乘多项式 (ax + b)(cx + d) 或 (x + py)(x + qy) */
export function genPolyTimesPoly() {
  const x = pickOne(['x', 'a', 'm']);
  let p;
  let q;
  if (Math.random() < 0.6) {
    p = linP(randInt(1, 4), x, nonzero(-7, 7));
    q = linP(nonzero(-3, 4), x, nonzero(-7, 7));
  } else {
    const y = x === 'x' ? 'y' : x === 'a' ? 'b' : 'n';
    p = add(mono(1, { [x]: 1 }), mono(nonzero(-4, 4), { [y]: 1 }));
    q = add(mono(randInt(1, 3), { [x]: 1 }), mono(nonzero(-4, 4), { [y]: 1 }));
  }
  const r = mul(p, q);
  const cross = [];
  Object.entries(p).forEach(([k1, c1]) => Object.entries(q).forEach(([k2, c2]) => cross.push(tex(mul({ [k1]: c1 }, { [k2]: c2 })))));
  return {
    prompt: `计算：${m(`(${tex(p)})(${tex(q)})`)}`,
    steps: [
      '用一个多项式的每一项乘另一个多项式的每一项，再把所得的积相加。',
      `四个积：${m(cross.join(',\\ '))}`,
      `合并同类项：${m(tex(r))}`,
    ],
    answer: m(tex(r)),
    fields: [exprField(plain(r), { form: 'poly' })],
  };
}

/** 单项式除以单项式 / 多项式除以单项式 */
export function genDivideByMono() {
  const vars = pick2();
  const d = mono(nonzero(-4, 4), { [vars[0]]: randInt(1, 2), [vars[1]]: randInt(0, 2) });
  if (Math.random() < 0.5) {
    const q = mono(nonzero(-5, 5), { [vars[0]]: randInt(0, 3), [vars[1]]: randInt(1, 3) });
    const pr = mul(d, q);
    return {
      prompt: `计算：${m(`${tex(pr)}\\div ${texParen(d)}`)}`,
      steps: [
        '单项式相除：系数相除，同底数幂相除，只在被除式里出现的字母照写。',
        `${m(`${tex(pr)}\\div ${texParen(d)} = ${tex(q)}`)}`,
      ],
      answer: m(tex(q)),
      fields: [exprField(plain(q), { form: 'monomial' })],
    };
  }
  const q = add(mono(nonzero(-4, 4), { [vars[0]]: 2 }), mono(nonzero(-4, 4), { [vars[0]]: 1, [vars[1]]: 1 }), mono(nonzero(-5, 5)));
  const pr = mul(d, q);
  return {
    prompt: `计算：${m(`(${tex(pr)})\\div ${texParen(d)}`)}`,
    steps: [
      '多项式除以单项式：先用多项式的每一项除以这个单项式，再把所得的商相加。',
      `${m(Object.entries(pr).map(([k, c]) => `${tex({ [k]: c })}\\div ${texParen(d)}`).join(',\\ '))}`,
      `结果：${m(tex(q))}`,
    ],
    answer: m(tex(q)),
    fields: [exprField(plain(q), { form: 'poly' })],
  };
}

/* ---------------- 21.2 乘法公式 ---------------- */

function sqTerm() {
  const x = pickOne(['x', 'a', 'm']);
  const y = x === 'x' ? 'y' : x === 'a' ? 'b' : 'n';
  const A = mono(randInt(1, 4), { [x]: 1 });
  const B = Math.random() < 0.5 ? mono(randInt(1, 6)) : mono(randInt(1, 3), { [y]: 1 });
  return [A, B];
}

/** 平方差公式 (a + b)(a − b) = a² − b² */
export function genDiffSquares() {
  const [A, B] = sqTerm();
  const swap = Math.random() < 0.4; // (−b + a)(a + b) style
  const r = sub(mul(A, A), mul(B, B));
  const left = swap ? `(${tex(scale(B, -1))} + ${tex(A)})(${tex(B)} + ${tex(A)})` : `(${tex(A)} + ${tex(B)})(${tex(A)} - ${tex(B)})`;
  return {
    prompt: `运用平方差公式计算：${m(left)}`,
    steps: [
      '$(a+b)(a-b) = a^2 - b^2$：找出两个因式里「相同的项」当 $a$，「只差一个符号的项」当 $b$。',
      `这里 ${m(`a = ${tex(A)}`)}，${m(`b = ${tex(B)}`)}。`,
      `${m(`(${tex(A)})^2 - (${tex(B)})^2 = ${tex(r)}`)}`,
    ],
    answer: m(tex(r)),
    fields: [exprField(plain(r), { form: 'poly' })],
  };
}

/** 完全平方公式 (a ± b)² */
export function genPerfectSquare() {
  const [A, B0] = sqTerm();
  const s = pickOne([1, -1]);
  const B = scale(B0, s);
  const r = mul(add(A, B), add(A, B));
  const neg = Math.random() < 0.25; // (−a − b)^2
  const shown = neg ? `(${tex(scale(A, -1))}${s > 0 ? ' - ' : ' + '}${tex(B0)})^2` : `(${tex(A)}${s > 0 ? ' + ' : ' - '}${tex(B0)})^2`;
  return {
    prompt: `运用完全平方公式计算：${m(shown)}`,
    steps: [
      '$(a\\pm b)^2 = a^2 \\pm 2ab + b^2$：首平方，尾平方，首尾两倍在中央。',
      neg ? `先变形：${m(`${shown} = (${tex(A)}${s > 0 ? ' + ' : ' - '}${tex(B0)})^2`)}（${m('(-u)^2 = u^2')}）。` : `这里 ${m(`a = ${tex(A)}`)}，${m(`b = ${tex(B0)}`)}。`,
      `${m(`(${tex(A)})^2 ${s > 0 ? '+' : '-'} 2\\cdot ${texParen(A)}\\cdot ${texParen(B0)} + (${tex(B0)})^2 = ${tex(r)}`)}`,
      '常见错误：漏掉中间项 $2ab$，写成 $a^2+b^2$。',
    ],
    answer: m(tex(r)),
    fields: [exprField(plain(r), { form: 'poly' })],
  };
}

/** 用乘法公式简便计算：102×98，99²，2025² − 2024×2026 … */
export function genFormulaArithmetic() {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const base = pickOne([20, 30, 50, 60, 100, 200]);
    const d = randInt(1, 4);
    const val = base * base - d * d;
    return {
      prompt: `用乘法公式计算：${m(`${base + d}\\times ${base - d}`)}`,
      steps: [`${m(`${base + d}\\times ${base - d} = (${base} + ${d})(${base} - ${d})`)}`, `${m(`= ${base}^2 - ${d}^2 = ${base * base} - ${d * d} = ${val}`)}`],
      answer: m(`${val}`),
      fields: [{ name: 'v', label: '结果', display: '\\square', value: val }],
    };
  }
  if (kind === 1) {
    const base = pickOne([10, 20, 50, 100, 200]);
    const d = pickOne([-3, -2, -1, 1, 2, 3]);
    const n = base + d;
    return {
      prompt: `用乘法公式计算：${m(`${n}^2`)}`,
      steps: [
        `${m(`${n}^2 = (${base} ${d < 0 ? '-' : '+'} ${Math.abs(d)})^2`)}`,
        `${m(`= ${base}^2 ${d < 0 ? '-' : '+'} 2\\times ${base}\\times ${Math.abs(d)} + ${Math.abs(d)}^2 = ${n * n}`)}`,
      ],
      answer: m(`${n * n}`),
      fields: [{ name: 'v', label: '结果', display: '\\square', value: n * n }],
    };
  }
  const n = randInt(1001, 2099);
  return {
    prompt: `用乘法公式计算：${m(`${n}^2 - ${n - 1}\\times ${n + 1}`)}`,
    steps: [`${m(`${n - 1}\\times ${n + 1} = (${n} - 1)(${n} + 1) = ${n}^2 - 1`)}`, `所以原式 ${m(`= ${n}^2 - (${n}^2 - 1) = 1`)}`],
    answer: m('1'),
    fields: [{ name: 'v', label: '结果', display: '\\square', value: 1 }],
  };
}

/** 化简：(x + a)² − (x + b)(x − b) 之类 */
export function genFormulaSimplify() {
  const x = pickOne(['x', 'a', 'y']);
  const a = nonzero(-5, 5);
  const b = randInt(1, 5);
  const k = nonzero(-3, 3);
  const P = linP(1, x, a);
  const r = sub(mul(P, P), mul(linP(1, x, b), linP(1, x, -b)));
  const r2 = add(r, mul(mono(k, { [x]: 1 }), linP(1, x, 0)));
  const useK = Math.random() < 0.5;
  const res = useK ? r2 : r;
  return {
    prompt: `化简：${m(`(${tex(P)})^2 - (${x} + ${b})(${x} - ${b})${useK ? ` ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}${x}^2` : ''}`)}`,
    steps: [
      `完全平方：${m(`(${tex(P)})^2 = ${tex(mul(P, P))}`)}`,
      `平方差：${m(`(${x} + ${b})(${x} - ${b}) = ${x}^2 - ${b * b}`)}`,
      `相减${useK ? '再加上最后一项' : ''}（减去一个多项式要整体加括号变号）：${m(tex(res))}`,
    ],
    answer: m(tex(res)),
    fields: [exprField(plain(res), { form: 'poly' })],
  };
}

/* ---------------- 21.3 因式分解 ---------------- */

/** 提公因式法 */
export function genCommonFactor() {
  const vars = pick2();
  const [x, y] = vars;
  let inner;
  let cf;
  for (;;) {
    cf = mono(randInt(2, 6) * pickOne([1, 1, -1]), { [x]: randInt(1, 2), [y]: randInt(0, 2) });
    const c1 = nonzero(-6, 6);
    const c2 = nonzero(-6, 6);
    const c3 = Math.random() < 0.5 ? nonzero(-6, 6) : 0;
    inner = add(mono(c1, { [x]: randInt(0, 2) }), mono(c2, { [y]: randInt(1, 2) }), mono(c3));
    if (termCount(inner) < 2) continue;
    const cs = Object.values(inner).map(Math.abs);
    if (cs.reduce(gcd) !== 1) continue;
    // inner must have no common letter factor
    const keys = Object.keys(inner);
    const common = [x, y].some((v) => keys.every((k) => k.includes(v)));
    if (!common) break;
  }
  const full = mul(cf, inner);
  return {
    prompt: `把下列多项式分解因式：${m(tex(full))}`,
    steps: [
      '找公因式：各项系数的最大公约数，再取相同字母的最低次幂。',
      `公因式是 ${m(tex(cf))}。`,
      `用每一项除以公因式，写进括号：${m(`${tex(full)} = ${tex(cf)}(${tex(inner)})`)}`,
      '检验：把结果乘开应得原式；括号里不能再有公因式。',
    ],
    answer: m(`${tex(cf)}(${tex(inner)})`),
    fields: [exprField(`${plain(cf)}*${plainParen(inner)}`, { form: 'factored', placeholder: '如 3a(2a-b)' })],
  };
}

/** 提公因式：公因式是多项式 2a(b+c) − 3(b+c) */
export function genCommonBinomial() {
  const [x, y] = pick2();
  const B = add(mono(1, { [y]: 1 }), mono(nonzero(-5, 5)));
  const p = randInt(2, 5);
  const q = nonzero(-6, 6);
  const A = add(mono(p, { [x]: 1 }), mono(q));
  const shown = `${p}${x}(${tex(B)}) ${q < 0 ? '-' : '+'} ${Math.abs(q)}(${tex(B)})`;
  return {
    prompt: `分解因式：${m(shown)}`,
    steps: [`两项都含有因式 ${m(`(${tex(B)})`)}，把它整体提出来。`, `${m(`${shown} = (${tex(B)})(${tex(A)})`)}`],
    answer: m(`(${tex(B)})(${tex(A)})`),
    fields: [exprField(`${plainParen(B)}*${plainParen(A)}`, { form: 'factored' })],
  };
}

/** 平方差公式分解：a²x² − b²，可能先提公因式 */
export function genFactorDiffSquares() {
  const x = pickOne(['x', 'a', 'm', 'y']);
  const a = randInt(1, 5);
  const b = randInt(1, 9);
  const k = Math.random() < 0.4 ? randInt(2, 5) : 1;
  const full = scale(sub(mono(a * a, { [x]: 2 }), mono(b * b)), k);
  const f1 = linP(a, x, b);
  const f2 = linP(a, x, -b);
  const kp = k === 1 ? '' : `${k}`;
  return {
    prompt: `分解因式：${m(tex(full))}`,
    steps: [
      k > 1 ? `先提公因式：${m(`${tex(full)} = ${k}(${tex(sub(mono(a * a, { [x]: 2 }), mono(b * b)))})`)}。` : '两项、都能写成平方、中间是减号：用平方差公式。',
      `${m(`${a * a === 1 ? '' : a * a}${x}^2 - ${b * b} = (${tex(mono(a, { [x]: 1 }))})^2 - ${b}^2 = (${tex(f1)})(${tex(f2)})`)}`,
      k > 1 ? `所以原式 ${m(`= ${k}(${tex(f1)})(${tex(f2)})`)}（要分解到每个因式都不能再分解为止）。` : '',
    ].filter(Boolean),
    answer: m(`${kp}(${tex(f1)})(${tex(f2)})`),
    fields: [exprField(`${kp ? `${kp}*` : ''}${plainParen(f1)}*${plainParen(f2)}`, { form: 'factored', placeholder: '如 (2x+3)(2x-3)' })],
  };
}

/** 完全平方公式分解：a²x² ± 2abx + b²，可能先提公因式 */
export function genFactorPerfectSquare() {
  const x = pickOne(['x', 'a', 'm', 'y']);
  const a = randInt(1, 4);
  const b = nonzero(-7, 7);
  const k = Math.random() < 0.35 ? randInt(2, 4) : 1;
  const f = linP(a, x, b);
  const full = scale(mul(f, f), k);
  const kp = k === 1 ? '' : `${k}`;
  return {
    prompt: `分解因式：${m(tex(full))}`,
    steps: [
      k > 1 ? `先提公因式 ${k}：${m(`${k}(${tex(mul(f, f))})`)}。` : '三项，首尾两项是平方，中间项是首尾底数积的 2 倍：用完全平方公式。',
      `${m(`${tex(mul(f, f))} = (${tex(mono(a, { [x]: 1 }))})^2 ${b < 0 ? '-' : '+'} 2\\cdot ${tex(mono(a, { [x]: 1 }))}\\cdot ${Math.abs(b)} + ${Math.abs(b)}^2 = (${tex(f)})^2`)}`,
    ],
    answer: m(`${kp}(${tex(f)})^2`),
    fields: [exprField(`${kp ? `${kp}*` : ''}${plainParen(f)}^2`, { form: 'factored', placeholder: '如 (x-3)^2' })],
  };
}

/** x² + (p+q)x + pq 型（阅读与思考 / 十字相乘） */
export function genFactorQuadratic() {
  const x = pickOne(['x', 'a', 'y']);
  let p;
  let q;
  do {
    p = nonzero(-9, 9);
    q = nonzero(-9, 9);
  } while (p === -q || p === q);
  const full = mul(linP(1, x, p), linP(1, x, q));
  return {
    prompt: `分解因式：${m(tex(full))}`,
    steps: [
      `${m(`${x}^2 + (p+q)${x} + pq = (${x}+p)(${x}+q)`)}：找两个数，积是 ${m(`${p * q}`)}、和是 ${m(`${p + q}`)}。`,
      `这两个数是 ${m(`${p}`)} 和 ${m(`${q}`)}。`,
      `${m(`${tex(full)} = (${tex(linP(1, x, p))})(${tex(linP(1, x, q))})`)}`,
    ],
    answer: m(`(${tex(linP(1, x, p))})(${tex(linP(1, x, q))})`),
    fields: [exprField(`${plainParen(linP(1, x, p))}*${plainParen(linP(1, x, q))}`, { form: 'factored', placeholder: '如 (x+2)(x-5)' })],
  };
}

/** 先提公因式再用公式：ax³ − a·b²x 等 */
export function genFactorTwoStep() {
  const x = pickOne(['x', 'm']);
  const y = x === 'x' ? 'y' : 'n';
  const b = randInt(1, 5);
  const useSq = Math.random() < 0.5;
  const cf = mono(randInt(1, 3), { [x]: 1, [y]: randInt(0, 1) });
  let inner;
  let factored;
  let plainF;
  if (useSq) {
    const f = linP(1, x, -b);
    inner = mul(f, f);
    factored = `${tex(cf)}(${tex(f)})^2`;
    plainF = `${plain(cf)}*${plainParen(f)}^2`;
  } else {
    inner = sub(mono(1, { [x]: 2 }), mono(b * b));
    factored = `${tex(cf)}(${tex(linP(1, x, b))})(${tex(linP(1, x, -b))})`;
    plainF = `${plain(cf)}*${plainParen(linP(1, x, b))}*${plainParen(linP(1, x, -b))}`;
  }
  const full = mul(cf, inner);
  return {
    prompt: `分解因式：${m(tex(full))}`,
    steps: [
      `先提公因式 ${m(tex(cf))}：${m(`${tex(cf)}(${tex(inner)})`)}`,
      `括号里再用${useSq ? '完全平方' : '平方差'}公式：${m(factored)}`,
      '一般步骤：一提（公因式）、二套（公式）、三检查（是否分解彻底）。',
    ],
    answer: m(factored),
    fields: [exprField(plainF, { form: 'factored' })],
  };
}
