import { randInt, pickOne } from '../mathRandom';
import { m, nonzero, fracTex, gcd, num } from '../examKit';
import { simplifyRoot } from '../g8a/ch23Generators';

/** 第二十七章 一元二次方程 — randomized items for MixedPractice. */

const quad = (a, b, c, v = 'x') => {
  const terms = [
    [a, 2],
    [b, 1],
    [c, 0],
  ].filter(([co]) => co !== 0);
  if (!terms.length) return '0';
  return terms
    .map(([co, pw], i) => {
      const abs = Math.abs(co);
      const body = pw === 2 ? `${abs === 1 ? '' : abs}${v}^2` : pw === 1 ? `${abs === 1 ? '' : abs}${v}` : `${abs}`;
      if (i === 0) return co < 0 ? `-${body}` : body;
      return co < 0 ? ` - ${body}` : ` + ${body}`;
    })
    .join('');
};
/** Root (−b ± √Δ)/(2a) as TeX and plain strings, simplified. */
function rootPair(a, b, c) {
  const D = b * b - 4 * a * c;
  const [k, r] = simplifyRoot(D);
  if (r === 1) {
    const x1 = (-b + k) / (2 * a);
    const x2 = (-b - k) / (2 * a);
    const tx = (v) => fracTex(Math.round(v * 2 * a), 2 * a);
    return { D, rational: true, tex: [tx(x1), tx(x2)], plain: [String(x1), String(x2)], vals: [x1, x2] };
  }
  // (−b ± k√r)/(2a): reduce by g = gcd(b, k, 2a)
  let p = -b;
  let q = k;
  let d = 2 * a;
  const g = gcd(gcd(Math.abs(p) || d, q), d);
  p /= g;
  q /= g;
  d /= g;
  if (d < 0) {
    p = -p;
    q = -q;
    d = -d;
  }
  const qa = Math.abs(q);
  const rad = `${qa === 1 ? '' : qa}\\sqrt{${r}}`;
  const radP = `${qa}*√${r}`;
  const texOne = (s) => {
    const numTex = p === 0 ? `${s < 0 ? '-' : ''}${rad}` : `${p} ${s < 0 ? '-' : '+'} ${rad}`;
    return d === 1 ? numTex : `\\dfrac{${numTex}}{${d}}`;
  };
  const plainOne = (s) => `(${p}${s < 0 ? '-' : '+'}${radP})/${d}`;
  return {
    D,
    rational: false,
    tex: [texOne(1), texOne(-1)],
    pm: d === 1 ? `${p === 0 ? '' : p} \\pm ${rad}` : `\\dfrac{${p === 0 ? '' : p} \\pm ${rad}}{${d}}`,
    plain: [plainOne(1), plainOne(-1)],
    vals: [(p + qa * Math.sqrt(r)) / d, (p - qa * Math.sqrt(r)) / d],
  };
}
const setField = (plains, opts = {}) => ({ name: 'x', label: '两个根', display: 'x_1,\\ x_2', type: 'set', value: plains, form: 'radical', ...opts });

/* ---------------- 27.1 ---------------- */

/** 化成一般形式，写出 a、b、c */
export function genGeneralForm() {
  const a = nonzero(-4, 5);
  const b = randInt(-8, 8);
  const c = randInt(-9, 9);
  // present as  a x² + p x = q x + r  with b = p − q, c = −r … pick p, r
  const qx = nonzero(-4, 4);
  const p = b + qx;
  const r = -c;
  const left = quad(a, p, 0);
  const right = quad(0, qx, r) || '0';
  const sign = a < 0 ? -1 : 1;
  const [A, B, Cc] = [a * sign, b * sign, c * sign];
  return {
    prompt: `把方程 ${m(`${left} = ${right}`)} 化成一元二次方程的一般形式 ${m('ax^2 + bx + c = 0')}（${m('a > 0')}），写出 ${m('a')}、${m('b')}、${m('c')}。`,
    steps: [`移项，使右边为 0：${m(`${quad(a, b, c)} = 0`)}。`, sign < 0 ? `两边乘 −1 使二次项系数为正：${m(`${quad(A, B, Cc)} = 0`)}。` : '二次项系数已经是正数。', `${m(`a = ${A},\\ b = ${B},\\ c = ${Cc}`)}（系数包括前面的符号）。`],
    answer: m(`${quad(A, B, Cc)} = 0`),
    fields: [
      { name: 'a', value: A },
      { name: 'b', value: B },
      { name: 'c', value: Cc },
    ],
  };
}

/** 已知一个根求参数 */
export function genRootParam() {
  const r = nonzero(-4, 4);
  const b = nonzero(-6, 6);
  const c = -(r * r + b * r);
  if (c === 0) return genRootParam();
  const askB = Math.random() < 0.5;
  return askB
    ? {
        prompt: `已知 ${m(`x = ${r}`)} 是方程 ${m(`x^2 + kx ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0`)} 的一个根，求 ${m('k')}。`,
        steps: [`把 ${m(`x = ${r}`)} 代入：${m(`${r * r} ${r < 0 ? '-' : '+'} ${Math.abs(r) === 1 ? '' : Math.abs(r)}k ${c < 0 ? '-' : '+'} ${Math.abs(c)} = 0`)}，${m(`k = ${b}`)}。`],
        answer: m(`k = ${b}`),
        fields: [{ name: 'k', value: b }],
      }
    : {
        prompt: `已知 ${m(`x = ${r}`)} 是方程 ${m(`x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}x + k = 0`)} 的一个根，求 ${m('k')}。`,
        steps: [`把 ${m(`x = ${r}`)} 代入：${m(`${r * r} ${b * r < 0 ? '-' : '+'} ${Math.abs(b * r)} + k = 0`)}，${m(`k = ${c}`)}。`],
        answer: m(`k = ${c}`),
        fields: [{ name: 'k', value: c }],
      };
}

/* ---------------- 27.2 解法 ---------------- */

/** 直接开平方：(x + p)² = q */
export function genSqrtMethod() {
  const p = randInt(-6, 6);
  const sq = Math.random() < 0.6;
  const q = sq ? randInt(1, 9) ** 2 : pickOne([2, 3, 5, 6, 7, 8, 12, 18, 20]);
  const k = pickOne([1, 1, 2, 3]);
  const [s, r] = simplifyRoot(q);
  const lhs = p === 0 ? 'x^2' : `(x ${p < 0 ? '-' : '+'} ${Math.abs(p)})^2`;
  const roots = r === 1 ? [String(-p + s), String(-p - s)] : [`${-p}+${s}*√${r}`, `${-p}-${s}*√${r}`];
  const rt = r === 1 ? `${-p + s},\\ x_2 = ${-p - s}` : `${-p} + ${s === 1 ? '' : s}\\sqrt{${r}},\\ x_2 = ${-p} - ${s === 1 ? '' : s}\\sqrt{${r}}`;
  return {
    prompt: `解方程：${m(`${k === 1 ? '' : k}${lhs} = ${k * q}`)}`,
    steps: [
      k > 1 ? `两边除以 ${k}：${m(`${lhs} = ${q}`)}。` : '方程已是「平方 = 非负数」的形式。',
      `直接开平方（降次）：${m(`${p === 0 ? 'x' : `x ${p < 0 ? '-' : '+'} ${Math.abs(p)}`} = \\pm ${r === 1 ? s : `${s === 1 ? '' : s}\\sqrt{${r}}`}`)}。`,
      `${m(`x_1 = ${rt}`)}`,
    ],
    answer: m(`x_1 = ${rt}`),
    fields: [setField(roots)],
  };
}

/** 配方：x² + bx + c = 0 化成 (x + p)² = q */
export function genCompleteSquare() {
  const p = nonzero(-6, 6);
  const q = pickOne([1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 16]);
  // x² + 2p x + (p² − q) = 0
  const b = 2 * p;
  const c = p * p - q;
  const [s, r] = simplifyRoot(q);
  const roots = r === 1 ? [String(-p + s), String(-p - s)] : [`${-p}+${s}*√${r}`, `${-p}-${s}*√${r}`];
  return {
    prompt: `用配方法解方程 ${m(`${quad(1, b, c)} = 0`)}：先配成 ${m('(x + p)^2 = q')} 的形式，再求根。`,
    steps: [
      `移项：${m(`${quad(1, b, 0)} = ${-c}`)}。`,
      `配方：两边加上一次项系数一半的平方 ${m(`(${b}\\div 2)^2 = ${p * p}`)}：${m(`${quad(1, b, p * p)} = ${-c} + ${p * p}`)}，即 ${m(`(x ${p < 0 ? '-' : '+'} ${Math.abs(p)})^2 = ${q}`)}。`,
      `开平方：${m(`x ${p < 0 ? '-' : '+'} ${Math.abs(p)} = \\pm ${r === 1 ? s : `${s === 1 ? '' : s}\\sqrt{${r}}`}`)}。`,
    ],
    answer: m(`(x ${p < 0 ? '-' : '+'} ${Math.abs(p)})^2 = ${q}`),
    fields: [
      { name: 'p', label: '配方 (x + p)² = q：', display: 'p', value: p },
      { name: 'q', display: 'q', value: q },
      setField(roots),
    ],
  };
}

/** 判别式：根的情况 */
export function genDiscriminant() {
  const a = nonzero(-3, 4);
  const kind = randInt(0, 2);
  let b;
  let c;
  if (kind === 1) {
    const r = nonzero(-4, 4);
    b = -2 * a * r;
    c = a * r * r;
  } else {
    do {
      b = randInt(-8, 8);
      c = randInt(-9, 9);
    } while ((b * b - 4 * a * c > 0) !== (kind === 0) || b * b - 4 * a * c === 0);
  }
  const D = b * b - 4 * a * c;
  const res = D > 0 ? '两个不相等的实数根' : D === 0 ? '两个相等的实数根' : '没有实数根';
  return {
    prompt: `不解方程，判断方程 ${m(`${quad(a, b, c)} = 0`)} 的根的情况。`,
    steps: [`${m(`a = ${a},\\ b = ${b},\\ c = ${c}`)}。`, `${m(`\\Delta = b^2 - 4ac = ${b * b} - 4\\times(${a})\\times(${c}) = ${D}`)}。`, `${m(`\\Delta ${D > 0 ? '> 0' : D === 0 ? '= 0' : '< 0'}`)}，方程有${res}。`],
    answer: res,
    fields: [
      { name: 'd', label: 'Δ', display: '\\Delta', value: D },
      { name: 'r', label: '根的情况', type: 'choice', options: ['两个不相等的实数根', '两个相等的实数根', '没有实数根'], value: res },
    ],
  };
}

/** 公式法 */
export function genFormula() {
  let a;
  let b;
  let c;
  let D;
  do {
    a = pickOne([1, 1, 2, 3]);
    b = randInt(-9, 9);
    c = randInt(-9, 9);
    D = b * b - 4 * a * c;
  } while (D <= 0 || c === 0);
  const rp = rootPair(a, b, c);
  return {
    prompt: `用公式法解方程：${m(`${quad(a, b, c)} = 0`)}`,
    steps: [
      `${m(`a = ${a},\\ b = ${b},\\ c = ${c}`)}，${m(`\\Delta = ${b * b} - 4\\times ${a}\\times(${c}) = ${D} > 0`)}。`,
      `${m(`x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} = \\dfrac{${-b === 0 ? '' : -b} \\pm \\sqrt{${D}}}{${2 * a}}`)}${rp.rational ? '' : `，化简得 ${m(`x = ${rp.pm}`)}`}。`,
      `${m(`x_1 = ${rp.tex[0]},\\ x_2 = ${rp.tex[1]}`)}`,
    ],
    answer: m(`x_1 = ${rp.tex[0]},\\ x_2 = ${rp.tex[1]}`),
    fields: [setField(rp.plain, { placeholder: '如 2+√11, 2-√11（或 2±√11）' })],
  };
}

/** 因式分解法 */
export function genFactorMethod() {
  const kind = randInt(0, 2);
  if (kind === 0) {
    // x(x − p) + k(x − p) = 0  → 例 3(1)
    const p = nonzero(-6, 6);
    const k = nonzero(-6, 6);
    if (k === -p) return genFactorMethod();
    return {
      prompt: `解方程：${m(`x(x ${p < 0 ? '+' : '-'} ${Math.abs(p)}) ${k < 0 ? '-' : '+'} ${Math.abs(k) === 1 ? '' : Math.abs(k)}(x ${p < 0 ? '+' : '-'} ${Math.abs(p)}) = 0`)}`,
      steps: [`提公因式 ${m(`(x ${p < 0 ? '+' : '-'} ${Math.abs(p)})`)}：${m(`(x ${p < 0 ? '+' : '-'} ${Math.abs(p)})(x ${k < 0 ? '-' : '+'} ${Math.abs(k)}) = 0`)}。`, `两个因式至少有一个为 0：${m(`x_1 = ${p},\\ x_2 = ${-k}`)}。`],
      answer: m(`x_1 = ${p},\\ x_2 = ${-k}`),
      fields: [setField([String(p), String(-k)])],
    };
  }
  if (kind === 1) {
    const a = randInt(1, 5);
    const b = randInt(1, 9);
    const g = gcd(a, b);
    return {
      prompt: `解方程：${m(`${a * a === 1 ? '' : a * a}x^2 - ${b * b} = 0`)}`,
      steps: [`平方差公式：${m(`(${a === 1 ? '' : a}x + ${b})(${a === 1 ? '' : a}x - ${b}) = 0`)}。`, `${m(`x_1 = ${fracTex(b, a)},\\ x_2 = ${fracTex(-b, a)}`)}`],
      answer: m(`x_1 = ${fracTex(b, a)},\\ x_2 = ${fracTex(-b, a)}`),
      fields: [setField([`${b / g}/${a / g}`, `-${b / g}/${a / g}`])],
    };
  }
  let p;
  let q;
  do {
    p = nonzero(-8, 8);
    q = nonzero(-8, 8);
  } while (p === q);
  const shared = Math.random() < 0.4;
  return {
    prompt: `解方程：${m(`${quad(1, -(p + q), p * q)} = 0`)}`,
    steps: [`找两个数：积是 ${p * q}、和是 ${-(p + q)}，是 ${-p} 和 ${-q}：${m(`(x ${p < 0 ? '+' : '-'} ${Math.abs(p)})(x ${q < 0 ? '+' : '-'} ${Math.abs(q)}) = 0`)}。`, `${m(`x_1 = ${p},\\ x_2 = ${q}`)}`, shared ? '也可以用公式法检验：两种方法结果相同。' : ''].filter(Boolean),
    answer: m(`x_1 = ${p},\\ x_2 = ${q}`),
    fields: [setField([String(p), String(q)])],
  };
}

/** 根与系数的关系 */
export function genVieta() {
  let a;
  let b;
  let c;
  do {
    a = pickOne([1, 1, 2, 3, 4]);
    b = randInt(-9, 9);
    c = nonzero(-9, 9);
  } while (b * b - 4 * a * c < 0);
  const s = -b / a;
  const pr = c / a;
  const kind = randInt(0, 2);
  const target = kind === 0 ? s * s - 2 * pr : kind === 1 ? s / pr : s * s - 4 * pr;
  // exact value: denominators are a² (kinds 0, 2) or c (kind 1)
  const targetTex = kind === 1 ? fracTex(-b, c) : fracTex(Math.round(target * a * a), a * a);
  const tTex = kind === 0 ? 'x_1^2 + x_2^2' : kind === 1 ? '\\dfrac{1}{x_1} + \\dfrac{1}{x_2}' : '(x_1 - x_2)^2';
  const how = kind === 0 ? '(x_1 + x_2)^2 - 2x_1x_2' : kind === 1 ? '\\dfrac{x_1 + x_2}{x_1x_2}' : '(x_1 + x_2)^2 - 4x_1x_2';
  return {
    prompt: `设 ${m('x_1')}、${m('x_2')} 是方程 ${m(`${quad(a, b, c)} = 0`)} 的两个根。不解方程，求 ${m('x_1 + x_2')}、${m('x_1x_2')} 和 ${m(tTex)}。`,
    steps: [
      `根与系数的关系：${m('x_1 + x_2 = -\\dfrac{b}{a}')}，${m('x_1x_2 = \\dfrac{c}{a}')}。`,
      `${m(`x_1 + x_2 = ${fracTex(-b, a)}`)}，${m(`x_1x_2 = ${fracTex(c, a)}`)}。`,
      `${m(`${tTex} = ${how} = ${targetTex}`)}`,
    ],
    answer: `和 ${m(fracTex(-b, a))}，积 ${m(fracTex(c, a))}，${m(`${tTex} = ${targetTex}`)}`,
    fields: [
      { name: 's', label: '两根之和', display: 'x_1 + x_2', value: s },
      { name: 'p', label: '两根之积', display: 'x_1x_2', value: pr },
      { name: 't', label: '（可写分数）', display: tTex.replace(/\\dfrac/g, '\\frac'), value: target },
    ],
  };
}

/* ---------------- 27.3 实际问题 ---------------- */

/** 平均增长率 / 下降率：a(1 ± x)² = b */
export function genGrowthRate() {
  const down = Math.random() < 0.5;
  const x = pickOne([0.1, 0.2, 0.25, 0.3, 0.5]);
  const a = pickOne([100, 200, 400, 500, 800, 1000, 5000, 6000]);
  const b = a * (1 + (down ? -x : x)) ** 2;
  if (!Number.isInteger(Math.round(b * 100) / 100)) return genGrowthRate();
  return {
    prompt: down
      ? `两年前生产 1 t 某药品的成本是 ${a} 元，现在是 ${num(b)} 元。成本的年平均下降率是多少？`
      : `某厂去年产值 ${a} 万元，两年后产值为 ${num(b)} 万元。这两年的年平均增长率是多少？`,
    steps: [
      `设年平均${down ? '下降' : '增长'}率为 ${m('x')}：一年后 ${m(`${a}(1 ${down ? '-' : '+'} x)`)}，两年后 ${m(`${a}(1 ${down ? '-' : '+'} x)^2`)}。`,
      `${m(`${a}(1 ${down ? '-' : '+'} x)^2 = ${num(b)}`)}，${m(`(1 ${down ? '-' : '+'} x)^2 = ${num(b / a, 4)}`)}，${m(`1 ${down ? '-' : '+'} x = \\pm ${num(Math.sqrt(b / a), 4)}`)}。`,
      `${m(`x_1 = ${num(x)}`)}，另一个根 ${m(`x_2 = ${num(down ? 1 + Math.sqrt(b / a) : -1 - Math.sqrt(b / a))}`)} 不合题意（${down ? '下降率不能超过 100%' : '增长率不能为负'}），舍去。答：${num(x * 100)}%。`,
    ],
    answer: `${num(x * 100)}%`,
    fields: [{ name: 'x', label: '年平均率（填小数或百分数的数字，如 0.2）', display: 'x', value: x }],
  };
}

/** 传播 / 循环比赛 / 握手 */
export function genSpread() {
  const kind = randInt(0, 1);
  if (kind === 0) {
    const n = randInt(6, 16);
    const games = (n * (n - 1)) / 2;
    return {
      prompt: `参加一次足球联赛的每两队之间都进行一场比赛，共要比赛 ${games} 场。共有多少个队参加比赛？`,
      steps: [`设有 ${m('x')} 个队。每队要和另外 ${m('x - 1')} 队比赛，每场被算了两次：${m(`\\dfrac{x(x-1)}{2} = ${games}`)}。`, `${m(`x^2 - x - ${2 * games} = 0`)}，${m(`(x - ${n})(x + ${n - 1}) = 0`)}，${m(`x = ${n}`)}（负根舍去）。`],
      answer: `${n} 个队`,
      fields: [{ name: 'x', label: '队数', value: n }],
    };
  }
  const k = randInt(5, 14);
  const total = (1 + k) ** 2;
  return {
    prompt: `有一人患了流感，经过两轮传染后共有 ${total} 人患了流感。每轮传染中平均一个人传染了几个人？`,
    steps: [`设每轮一人传染 ${m('x')} 人。第一轮后共 ${m('1 + x')} 人；第二轮这些人每人又传染 ${m('x')} 人，共 ${m('(1 + x) + x(1 + x) = (1 + x)^2')} 人。`, `${m(`(1 + x)^2 = ${total}`)}，${m(`1 + x = \\pm ${1 + k}`)}，${m(`x = ${k}`)}（${m(`x = ${-2 - k}`)} 舍去）。`],
    answer: `${k} 人`,
    fields: [{ name: 'x', label: '人数', value: k }],
  };
}

/** 面积问题：长方形空地四周 / 中间修宽度相同的路 */
export function genAreaProblem() {
  for (;;) {
    const L = pickOne([20, 24, 30, 32, 40, 50]);
    const W = pickOne([12, 15, 16, 20, 24, 30]);
    if (W >= L) continue;
    const x = randInt(1, 4);
    const kind = randInt(0, 1);
    if (kind === 0) {
      // 两条互相垂直的路（一横一竖），剩余面积
      const rest = (L - x) * (W - x);
      return {
        prompt: `一块长 ${L} m、宽 ${W} m 的长方形土地上，要修两条互相垂直、宽度相同的道路（一横一竖），其余部分种草，草坪面积为 ${rest} m²。道路宽多少米？`,
        steps: [`把道路平移到边上，草坪拼成一个长 ${m(`(${L} - x)`)}、宽 ${m(`(${W} - x)`)} 的长方形。`, `${m(`(${L} - x)(${W} - x) = ${rest}`)}，${m(`x^2 - ${L + W}x + ${L * W - rest} = 0`)}，${m(`x_1 = ${x}`)}，${m(`x_2 = ${L + W - x}`)}（大于宽，舍去）。`],
        answer: `${x} m`,
        fields: [{ name: 'x', label: '道路宽（m）', value: x }],
      };
    }
    const inner = (L - 2 * x) * (W - 2 * x);
    return {
      prompt: `一本书的封面长 ${L} cm、宽 ${W} cm，正中央是一个长方形，四周的彩色边衬宽度相同，中央长方形面积为 ${inner} cm²。边衬宽多少厘米？`,
      steps: [`设边衬宽 ${m('x')} cm，中央长方形长 ${m(`(${L} - 2x)`)}、宽 ${m(`(${W} - 2x)`)}。`, `${m(`(${L} - 2x)(${W} - 2x) = ${inner}`)}，化简后解得 ${m(`x = ${x}`)}（另一个根使宽为负，舍去）。`],
      answer: `${x} cm`,
      fields: [{ name: 'x', label: '边衬宽（cm）', value: x }],
    };
  }
}
