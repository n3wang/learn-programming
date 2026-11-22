import React from 'react';
import { randInt, pickOne } from './mathRandom';
import {
  m,
  nonzero,
  gcd,
  fracTex,
  par,
  lead,
  signed,
  lin,
  num,
  choice,
  Parts,
  ExamTable,
  blank,
  CIRCLED,
  cellField,
  yesNoField,
  NumberLine,
  Fig,
} from './examKit';

/**
 * 2026 年下半学期初二数学期末考试 — one generator per question on the paper.
 * gen({ original: true }) returns the printed question with its own numbers;
 * otherwise new numbers (and for 选择题 the true answer moves to a random letter).
 */

const C = CIRCLED;
const FLIP = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' }; // multiply by a negative
const INCL = { '<': '≤', '≤': '<', '>': '≥', '≥': '>' }; // toggle 含/不含端点
const OPP = { '<': '≥', '≥': '<', '>': '≤', '≤': '>' }; // the complement
const TEX = { '<': '<', '>': '>', '≤': '\\le', '≥': '\\ge' };
const t = (op) => TEX[op];
const isStrict = (op) => op === '<' || op === '>';
const isRight = (op) => op === '>' || op === '≥';
const ineqTex = (lhs, op, rhs) => `${lhs} ${t(op)} ${rhs}`;
const ineqField = (op, bound, label) => ({ name: 'x', label, type: 'ineq', value: { op, bound } });

function ray(x, op, level = 1) {
  return isRight(op)
    ? { from: x, to: Infinity, fromOpen: isStrict(op), level }
    : { from: -Infinity, to: x, toOpen: isStrict(op), level };
}

/* ---------------- 一、选择题 ---------------- */

/** 1. 数轴：−16 处空心点向右。 */
export function genG8Q1({ original } = {}) {
  let p = -16;
  let op = '>';
  let k = 1;
  if (!original) {
    p = nonzero(-20, 20);
    op = pickOne(['<', '>', '≤', '≥']);
    k = randInt(1, 6);
  }
  const opts = [
    m(ineqTex('x', op, p + 1)),
    m(ineqTex('x', INCL[op], p)),
    m(ineqTex(`x + ${k}`, op, p + k)),
    m(ineqTex('x', FLIP[op], p)),
  ];
  const c = choice(opts, 2, original);
  return {
    prompt: '下列不等式中，最符合数轴所表示的解集的是（ ）。',
    figure: (
      <Fig>
        <NumberLine ticks={[{ x: p }]} rays={[ray(p, op)]} />
        {c.figure}
      </Fig>
    ),
    steps: [
      `读数轴：端点 ${m(`${p}`)}，${isStrict(op) ? '空心（不含端点）' : '实心（含端点）'}，向${isRight(op) ? '右' : '左'}，所以解集是 ${m(ineqTex('x', op, p))}。`,
      `逐个化简选项：${m(ineqTex(`x + ${k}`, op, p + k))} 两边同减 ${k}，得 ${m(ineqTex('x', op, p))} ✓。`,
      `${m(ineqTex('x', op, p + 1))} 端点不对；${m(ineqTex('x', INCL[op], p))} 空心 / 实心不对；${m(ineqTex('x', FLIP[op], p))} 方向反了。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/** 2. 数轴：5/4 处实心点向左。 */
export function genG8Q2({ original } = {}) {
  let a = 5;
  let b = 4;
  let s = 1;
  let op = '≤';
  if (!original) {
    do {
      a = randInt(1, 9);
      b = randInt(2, 9);
    } while (a === b || gcd(a, b) !== 1);
    s = pickOne([1, -1]);
    op = pickOne(['<', '>', '≤', '≥']);
  }
  const v = fracTex(s * a, b);
  const inv = fracTex(-s * b, a);
  const neg = fracTex(-s * a, b);
  const opts = [
    m(ineqTex('x', FLIP[op], inv)),
    m(ineqTex('x', op, neg)),
    m(ineqTex('x', INCL[op], v)),
    m(ineqTex('x', op, v)),
  ];
  const c = choice(opts, 3, original);
  return {
    prompt: '下列不等式中，最符合数轴所表示的解集的是（ ）。',
    figure: (
      <Fig>
        <NumberLine ticks={[{ x: 0, label: `${s < 0 ? '−' : ''}${a}/${b}` }]} rays={[ray(0, op)]} />
        {c.figure}
      </Fig>
    ),
    steps: [
      `端点是 ${m(v)}，${isStrict(op) ? '空心：不含端点，用 < 或 >' : '实心：含端点，用 ≤ 或 ≥'}；向${isRight(op) ? '右是「大于」' : '左是「小于」'}。`,
      `所以解集是 ${m(ineqTex('x', op, v))}。其他选项端点的符号、倒数或空心实心不对。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/** 3. 解不等式 −7x ≥ −7。 */
export function genG8Q3({ original } = {}) {
  let a = 7;
  let c0 = 1;
  let op = '≥';
  if (!original) {
    a = randInt(2, 9);
    c0 = nonzero(-9, 9);
    op = pickOne(['<', '>', '≤', '≥']);
  }
  const rhs = -a * c0;
  const f = FLIP[op];
  const opts = [
    m(ineqTex('x', op, -c0)),
    m(ineqTex('x', op, c0)),
    m(ineqTex('x', f, -c0)),
    m(ineqTex('x', f, c0)),
  ];
  const c = choice(opts, 3, original);
  return {
    prompt: `解不等式 ${m(ineqTex(`-${a}x`, op, rhs))}，下一步怎样？`,
    figure: c.figure,
    steps: [
      `两边同除以 ${m(`-${a}`)}。除以负数，不等号方向要改变：${m(`${t(op)} \\to ${t(f)}`)}。`,
      `${m(`${rhs}\\div(-${a}) = ${c0}`)}，所以 ${m(ineqTex('x', f, c0))}。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/** 4. 数轴：40、50 两个空心点，中间一段。 */
export function genG8Q4({ original } = {}) {
  let lo = 40;
  let hi = 50;
  let li = false;
  let hiI = false;
  if (!original) {
    lo = nonzero(-30, 40);
    hi = lo + randInt(2, 20);
    if (hi === 0) hi += 1;
    li = Math.random() < 0.5;
    hiI = Math.random() < 0.5;
  }
  const o1 = li ? '≤' : '<';
  const o2 = hiI ? '≤' : '<';
  const opts = [
    m(`${lo} < ${hi} \\le x`),
    m(`${lo} ${t(INCL[o1])} x ${t(INCL[o2])} ${hi}`),
    m(`${lo} ${t(o1)} 2x ${t(o2)} ${hi}`),
    m(`${lo} ${t(o1)} x ${t(o2)} ${hi}`),
  ];
  const c = choice(opts, 3, original);
  const ticks = [{ x: lo }, { x: hi }];
  if (lo > 0 || hi < 0) ticks.push({ x: 0 });
  return {
    prompt: '下列不等式中，最符合数轴所表示的解集的是（ ）。',
    figure: (
      <Fig>
        <NumberLine
          ticks={ticks}
          rays={[
            { from: lo, to: Infinity, fromOpen: !li, level: 2, color: '#8a9bb0' },
            { from: -Infinity, to: hi, toOpen: !hiI, level: 3, color: '#8a9bb0' },
            { from: lo, to: hi, fromOpen: !li, toOpen: !hiI, level: 1 },
          ]}
        />
        {c.figure}
      </Fig>
    ),
    steps: [
      `两条灰色射线重叠的部分（红色）就是解集：在 ${lo} 和 ${hi} 之间。`,
      `${lo} 处${li ? '实心，含' : '空心，不含'}；${hi} 处${hiI ? '实心，含' : '空心，不含'}。所以是 ${m(`${lo} ${t(o1)} x ${t(o2)} ${hi}`)}。`,
      `${m(`${lo} ${t(o1)} 2x ${t(o2)} ${hi}`)} 化简后是 ${m(`${num(lo / 2)} ${t(o1)} x ${t(o2)} ${num(hi / 2)}`)}，不对。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/** 5. 数轴：x > 2 与 x > 3 同向，取 x > 3。 */
export function genG8Q5({ original } = {}) {
  let a = 2;
  let b = 3;
  let right = true;
  let opA = '>';
  let opB = '>';
  if (!original) {
    a = nonzero(-8, 8);
    b = a + randInt(1, 6);
    if (b === 0) b += 1;
    right = Math.random() < 0.6;
    opA = right ? pickOne(['>', '≥']) : pickOne(['<', '≤']);
    opB = right ? pickOne(['>', '≥']) : pickOne(['<', '≤']);
  }
  const [bound, op] = right ? [b, opB] : [a, opA];
  const opts = [
    m(`${a} \\le x \\le ${b}`),
    m(`${a} > x < ${b + 3}`),
    m(ineqTex('x', OPP[op], bound)),
    m(ineqTex('x', op, bound)),
  ];
  const c = choice(opts, 3, original);
  const ticks = [{ x: a }, { x: b }];
  if (a > 0 || b < 0) ticks.push({ x: 0 });
  return {
    prompt: '下列不等式中，哪一个最符合下图所表示的解集？（ ）',
    figure: (
      <Fig>
        <NumberLine ticks={ticks} rays={[ray(a, opA, 2), ray(b, opB, 1)]} />
        {c.figure}
      </Fig>
    ),
    steps: [
      `图上两条射线是 ${m(ineqTex('x', opA, a))} 和 ${m(ineqTex('x', opB, b))}，方向相同（都向${right ? '右' : '左'}）。`,
      `同${right ? '大取大' : '小取小'}：两个都要满足，取 ${m(ineqTex('x', op, bound))}。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/* ---------------- 二、应用题 ---------------- */

/** 6. 知识竞赛 20 题，对 +5，错 / 不答 −2。 */
export function genG8Q6({ original } = {}) {
  let [N, cc, w, k1, k2, w3, k4, S] = [20, 5, 2, 10, 12, 5, 15, 50];
  if (!original) {
    for (;;) {
      N = pickOne([20, 25, 30]);
      cc = randInt(3, 6);
      w = randInt(1, 3);
      k1 = randInt(Math.floor(N * 0.3), Math.floor(N * 0.5));
      k2 = k1 + randInt(1, 3);
      w3 = randInt(2, Math.floor(N * 0.3));
      k4 = randInt(Math.ceil(N * 0.6), N - 1);
      S = 10 * randInt(Math.ceil((cc * N * 0.35) / 10), Math.floor((cc * N * 0.75) / 10));
      if (N - w3 !== k4 && ((S + w * N) % (cc + w) !== 0 || Math.random() < 0.3)) break;
    }
  }
  const score = (k) => cc * k - w * (N - k);
  const need = Math.floor((S + w * N) / (cc + w)) + 1;
  return {
    prompt: `七年级举行了一场知识竞赛，共有 ${N} 道题。答对一题得 ${cc} 分，答错或不答一题扣 ${w} 分。`,
    figure: (
      <Fig>
        <Parts items={[['a', '填空格']]} />
        <ExamTable
          head={['项目', '答对题数', '答错或不答题数', '答对所得分数', '最终成绩']}
          rows={[
            [`答对 ${k1} 道题`, `${k1}`, `${N - k1}`, `${cc * k1}`, `${score(k1)}`],
            [`答对 ${k2} 道题`, `${k2}`, blank(C[0]), `${cc * k2}`, blank(C[1])],
            [`答错或不答 ${w3} 道题`, blank(C[2]), `${w3}`, blank(C[3]), `${score(N - w3)}`],
            [`答对 ${k4} 道题`, `${k4}`, blank(C[4]), blank(C[5]), blank(C[6])],
          ]}
        />
        <Parts items={[['b', `若规定竞赛成绩超过 ${S} 分才能晋级，至少要答对多少道题才能晋级？`]]} />
      </Fig>
    ),
    steps: [
      `答对 ${m('k')} 题时，答错或不答 ${m(`${N} - k`)} 题，成绩 ${m(`${cc}k - ${w}(${N} - k)`)}。`,
      `① ${m(`${N} - ${k2} = ${N - k2}`)}，② ${m(`${cc * k2} - ${w}\\times ${N - k2} = ${score(k2)}`)}。`,
      `③ ${m(`${N} - ${w3} = ${N - w3}`)}，④ ${m(`${cc}\\times ${N - w3} = ${cc * (N - w3)}`)}。`,
      `⑤ ${m(`${N - k4}`)}，⑥ ${m(`${cc * k4}`)}，⑦ ${m(`${cc * k4} - ${w * (N - k4)} = ${score(k4)}`)}。`,
      `b. 设答对 ${m('x')} 题：${m(`${cc}x - ${w}(${N} - x) > ${S}`)}，${m(`${cc + w}x > ${S + w * N}`)}，${m(`x > ${fracTex(S + w * N, cc + w)}`)}。`,
      `${m('x')} 是整数且要「超过」，所以至少答对 ${need} 题（检验：${need} 题得 ${score(need)} 分，${need - 1} 题得 ${score(need - 1)} 分）。`,
    ],
    answer: `① ${N - k2} ② ${score(k2)} ③ ${N - w3} ④ ${cc * (N - w3)} ⑤ ${N - k4} ⑥ ${cc * k4} ⑦ ${score(k4)}；b. 至少 ${need} 道`,
    fields: [
      cellField(0, '答错或不答题数', N - k2),
      cellField(1, '最终成绩', score(k2)),
      cellField(2, '答对题数', N - w3),
      cellField(3, '答对所得分数', cc * (N - w3)),
      cellField(4, '答错或不答题数', N - k4),
      cellField(5, '答对所得分数', cc * k4),
      cellField(6, '最终成绩', score(k4)),
      { name: 'b', label: 'b. 至少答对', display: 'x', value: need },
    ],
  };
}

/** 7. 两天徒步 12 小时 84 km，第二天比第一天多 36 km；第一天 4 h，第二天 8 h。 */
export function genG8Q7({ original } = {}) {
  let [h1, h2, v1, v2, h3, h4] = [4, 8, 6, 7.5, 2, 4];
  if (!original) {
    for (;;) {
      h1 = randInt(2, 6);
      h2 = randInt(3, 9);
      v1 = randInt(3, 8);
      v2 = v1 + 0.5 * randInt(1, 6);
      h3 = randInt(1, 4);
      h4 = randInt(1, 5);
      if (Number.isInteger(v2 * h2) && v2 * h2 > v1 * h1 && Number.isInteger(v2 * h4)) break;
    }
  }
  const x = v1 * h1;
  const y = v2 * h2;
  const T = x + y;
  const d = y - x;
  const D3 = v1 * h3;
  const D4 = v2 * h4;
  return {
    prompt: `某户外俱乐部组织了一次为期两天的徒步活动，共用时 ${h1 + h2} 小时，行走了 ${T} km。已知第二天比第一天多走 ${d} km。第一天徒步 ${h1} 小时，第二天徒步 ${h2} 小时。求两天各自的平均速度。`,
    figure: (
      <Fig>
        <Parts
          items={[
            ['7.a', `设第一天走了 ${m('x')} km，第二天走了 ${m('y')} km。`],
            ['7.b', '根据题意列出二元一次方程组。'],
            ['7.c', '求两天各自的平均速度。'],
            ['7.d', '假设第三天按照第一天的平均速度徒步，第四天按照第二天的平均速度徒步。完成下表。'],
          ]}
        />
        <ExamTable
          head={['天', '时间', '走了', '共时间', '共走了']}
          rows={[
            ['第一天', `${h1} 小时`, blank('x'), `${h1} 小时`, blank('x')],
            ['第二天', `${h2} 小时`, blank('y'), `${h1 + h2} 小时`, `${T} km`],
            ['第三天', blank(C[0]), `${D3} km`, blank(C[1]), blank(C[2])],
            ['第四天', blank(C[3]), blank(C[4]), blank(C[5]), `${T + D3 + D4} km`],
          ]}
        />
      </Fig>
    ),
    steps: [
      `7.b ${m(`\\begin{cases} x + y = ${T} \\\\ y - x = ${d} \\end{cases}`)}`,
      `两式相加：${m(`2y = ${T + d}`)}，${m(`y = ${y}`)}；${m(`x = ${T} - ${y} = ${x}`)}。`,
      `7.c 第一天 ${m(`${x}\\div ${h1} = ${num(v1)}`)} km/h，第二天 ${m(`${y}\\div ${h2} = ${num(v2)}`)} km/h。`,
      `① ${m(`${D3}\\div ${num(v1)} = ${h3}`)} 小时，② ${m(`${h1 + h2} + ${h3} = ${h1 + h2 + h3}`)} 小时，③ ${m(`${T} + ${D3} = ${T + D3}`)} km。`,
      `⑤ 第四天走了 ${m(`${T + D3 + D4} - ${T + D3} = ${D4}`)} km，④ ${m(`${D4}\\div ${num(v2)} = ${h4}`)} 小时，⑥ ${m(`${h1 + h2 + h3} + ${h4} = ${h1 + h2 + h3 + h4}`)} 小时。`,
    ],
    answer: `${m(`x = ${x},\\ y = ${y}`)}；速度 ${num(v1)}、${num(v2)} km/h；① ${h3} ② ${h1 + h2 + h3} ③ ${T + D3} ④ ${h4} ⑤ ${D4} ⑥ ${h1 + h2 + h3 + h4}`,
    fields: [
      { name: 'x', label: '第一天走了（km）', value: x },
      { name: 'y', label: '第二天走了（km）', value: y },
      { name: 'v1', label: '第一天速度（km/h）', display: 'v_1', value: v1 },
      { name: 'v2', label: '第二天速度（km/h）', display: 'v_2', value: v2 },
      cellField(0, '第三天时间（小时）', h3),
      cellField(1, '共时间', h1 + h2 + h3),
      cellField(2, '共走了（km）', T + D3),
      cellField(3, '第四天时间（小时）', h4),
      cellField(4, '第四天走了（km）', D4),
      cellField(5, '共时间', h1 + h2 + h3 + h4),
    ],
  };
}

/** 8. VIP 套餐 300 / 180，普通 200 / 150；利润 ≥ 1500，总数 ≤ 25。 */
export function genG8Q8({ original } = {}) {
  let [sv, cv, sn, cn, P, M] = [300, 180, 200, 150, 1500, 25];
  const minNormal = (v, pv, pn) => Math.max(0, Math.ceil((P - pv * v) / pn));
  const minVip = (pv, pn) => {
    for (let v = 0; v <= M; v++) if (v + minNormal(v, pv, pn) <= M) return v;
    return null;
  };
  if (!original) {
    for (;;) {
      cv = 10 * randInt(10, 25);
      sv = cv + 10 * randInt(6, 15);
      cn = 10 * randInt(6, 16);
      sn = cn + 10 * randInt(2, 6);
      M = randInt(18, 30);
      P = 100 * randInt(8, 25);
      const pv = sv - cv;
      const pn = sn - cn;
      const mv = minVip(pv, pn);
      if (pn < pv && mv != null && mv >= 2 && mv <= 5 && P - pv * 5 > 0) break;
    }
  }
  const pv = sv - cv;
  const pn = sn - cn;
  const rows = [1, 3, 5];
  const tot = (v) => pv * v + pn * (M - v);
  const mv = minVip(pv, pn);
  const need = (v) => minNormal(v, pv, pn);
  const ok = (v) => v + need(v) <= M;
  const fields = [];
  let i = 0;
  const tableRows = rows.map((v, r) => {
    const cells = [`${v}`];
    if (r === 0) {
      cells.push(`${M - v}`, `${pv * v}`);
    } else {
      cells.push(blank(C[i]), blank(C[i + 1]));
      fields.push(cellField(i, `VIP ${v}：普通最多`, M - v), cellField(i + 1, `VIP ${v}：VIP 利润`, pv * v));
      i += 2;
    }
    cells.push(blank(C[i]), blank(C[i + 1]));
    fields.push(cellField(i, `VIP ${v}：普通套餐利润`, pn * (M - v)), yesNoField(i + 1, `VIP ${v}：总利润 ≥ ${P}？`, tot(v) >= P));
    i += 2;
    return cells;
  });
  const caseRows = rows.map((v, r) =>
    r === 0
      ? ['A', `${v}`, `${need(v)}`, ok(v) ? '是' : '否']
      : [String.fromCharCode(65 + r), `${v}`, blank(C[i + (r - 1) * 2]), blank(C[i + (r - 1) * 2 + 1])],
  );
  rows.slice(1).forEach((v, r) => {
    fields.push(cellField(i + r * 2, `情况 ${String.fromCharCode(66 + r)}：普通至少`, need(v)));
    fields.push(yesNoField(i + r * 2 + 1, `情况 ${String.fromCharCode(66 + r)}：符合要求？`, ok(v)));
  });
  fields.push(
    { name: 'mv', label: '(4) VIP 至少', display: 'x', value: mv },
    { name: 'mn', label: '(4) 此时普通', display: 'y', value: need(mv) },
  );
  return {
    prompt: `某服装店推出了两种服装套餐：VIP 套餐每份售价 ${sv} 元、成本 ${cv} 元；普通套餐每份售价 ${sn} 元、成本 ${cn} 元。店主要求：总利润至少达到 ${P} 元；两种套餐的总销售数量不超过 ${M} 份。`,
    figure: (
      <Fig>
        <Parts items={[['(1)', '根据题意，完成下表。']]} />
        <ExamTable
          head={['VIP 套餐数量', '普通套餐最多数量', '利润 VIP', '最多普通套餐利润', `总利润 ≥ ${P}?`]}
          rows={tableRows}
        />
        <Parts
          items={[
            ['(2)', `设 VIP 套餐销售 ${m('x')} 份，普通套餐销售 ${m('y')} 份。列出二元一次不等式组。`],
            ['(3)', `在下列情况下，判断能否达到至少 ${P} 元利润，同时总数量不超过 ${M} 份。求普通套餐至少需要销售多少份。`],
          ]}
        />
        <ExamTable head={['情况', 'VIP 套餐数量', '普通套餐至少需要销售', '是否符合要求?']} rows={caseRows} />
        <Parts items={[['(4)', '在满足店主所有经营条件的情况下，VIP 套餐至少需要销售多少份？此时，普通套餐需要销售多少份？']]} />
      </Fig>
    ),
    steps: [
      `每份利润：VIP ${m(`${sv} - ${cv} = ${pv}`)} 元，普通 ${m(`${sn} - ${cn} = ${pn}`)} 元。`,
      `(1) 普通最多 ${m(`${M} - x`)} 份，总利润 ${m(`${pv}x + ${pn}(${M} - x)`)}：${rows.map((v) => `${v} 份时 ${m(`${pv * v} + ${pn * (M - v)} = ${tot(v)}`)}`).join('；')}。`,
      `(2) ${m(`\\begin{cases} ${pv}x + ${pn}y \\ge ${P} \\\\ x + y \\le ${M} \\end{cases}`)}（${m('x, y')} 为非负整数）`,
      `(3) 普通至少 ${m(`y \\ge \\dfrac{${P} - ${pv}x}{${pn}}`)} 再向上取整：${rows.map((v) => `${v} 份 → ${need(v)} 份，合计 ${v + need(v)}${ok(v) ? ` ≤ ${M} 是` : ` > ${M} 否`}`).join('；')}。`,
      `(4) 把 ${m(`y = ${M} - x`)} 代入：${m(`${pv}x + ${pn}(${M} - x) \\ge ${P}`)}，${m(`${pv - pn}x \\ge ${P - pn * M}`)}，${m(`x \\ge ${fracTex(P - pn * M, pv - pn)}`)}，取整得 ${m(`x = ${mv}`)}。`,
      `此时 ${m(`y \\ge (${P} - ${pv * mv})\\div ${pn}`)}，取 ${need(mv)} 份（合计 ${mv + need(mv)} ≤ ${M}）。`,
    ],
    answer: `(4) VIP 至少 ${mv} 份，普通 ${need(mv)} 份`,
    fields,
  };
}

/* ---------------- 三、解方程组 ---------------- */

const xy = (x, y) => ({
  answer: m(`x = ${x},\\ y = ${y}`),
  fields: [
    { name: 'x', value: x },
    { name: 'y', value: y },
  ],
});
const sys = (a, b) => `\\begin{cases} ${a} \\\\ ${b} \\end{cases}`;

/** a / b. y = p·x + q；r·x + s·y = t （代入法）。 */
function genSubst(orig, original) {
  let [p, q, r, s, tt, x, y] = orig;
  if (!original) {
    for (;;) {
      x = nonzero(-9, 9);
      y = nonzero(-12, 12);
      p = nonzero(-5, 5);
      q = y - p * x;
      r = nonzero(-5, 5);
      s = nonzero(-5, 5);
      tt = r * x + s * y;
      if (r + s * p !== 0 && q !== 0) break;
    }
  }
  const k = r + s * p;
  return {
    prompt: `解方程组：${m(sys(`y = ${lin(p, q, 'x')}`, `${lead(r, 'x')}${signed(s, 'y')} = ${tt}`))}`,
    steps: [
      `把 ① 代入 ②：${m(`${lead(r, 'x')} ${s < 0 ? '-' : '+'} ${Math.abs(s)}(${lin(p, q, 'x')}) = ${tt}`)}`,
      `去括号、合并：${m(`${lead(k, 'x')}${signed(s * q)} = ${tt}`)}，${m(`${lead(k, 'x')} = ${tt - s * q}`)}，${m(`x = ${x}`)}`,
      `代回 ①：${m(`y = ${p}\\times ${par(x)}${signed(q)} = ${y}`)}`,
    ],
    ...xy(x, y),
  };
}
export const genG8SysA = ({ original } = {}) => genSubst([-4, -1, -1, -4, 64, 4, -17], original);
export const genG8SysB = ({ original } = {}) => genSubst([2, -4, 2, -2, 18, -5, -14], original);

/** c. a·x + y = c1；d·x + e·y = c2 */
export function genG8SysC({ original } = {}) {
  let [a, c1, d, e, c2, x, y] = [2, -15, -5, 4, 18, -6, -3];
  if (!original) {
    for (;;) {
      x = nonzero(-9, 9);
      y = nonzero(-9, 9);
      a = nonzero(-5, 5);
      d = nonzero(-6, 6);
      e = nonzero(-6, 6);
      c1 = a * x + y;
      c2 = d * x + e * y;
      if (a * e - d !== 0) break;
    }
  }
  const k = d - e * a;
  return {
    prompt: `解方程组：${m(sys(`${lead(a, 'x')} + y = ${c1}`, `${lead(d, 'x')}${signed(e, 'y')} = ${c2}`))}`,
    steps: [
      `由 ①：${m(`y = ${lin(-a, c1, 'x')}`)} ③`,
      `代入 ②：${m(`${lead(d, 'x')} ${e < 0 ? '-' : '+'} ${Math.abs(e)}(${lin(-a, c1, 'x')}) = ${c2}`)}，${m(`${lead(k, 'x')} = ${c2 - e * c1}`)}，${m(`x = ${x}`)}`,
      `代回 ③：${m(`y = ${c1}${signed(-a)}\\times ${par(x)} = ${y}`)}`,
    ],
    ...xy(x, y),
  };
}

/** d. x − y = c1；a·x + b·y = c2 */
export function genG8SysD({ original } = {}) {
  let [c1, a, b, c2, x, y] = [12, 3, -4, 42, 6, -6];
  if (!original) {
    for (;;) {
      x = nonzero(-9, 12);
      y = nonzero(-9, 9);
      a = nonzero(-6, 6);
      b = nonzero(-6, 6);
      c1 = x - y;
      c2 = a * x + b * y;
      if (a + b !== 0 && c1 !== 0) break;
    }
  }
  return {
    prompt: `解方程组：${m(sys(`x - y = ${c1}`, `${lead(a, 'x')}${signed(b, 'y')} = ${c2}`))}`,
    steps: [
      `由 ①：${m(`x = y${signed(c1)}`)} ③`,
      `代入 ②：${m(`${a}(y${signed(c1)})${signed(b, 'y')} = ${c2}`)}，${m(`${lead(a + b, 'y')} = ${c2 - a * c1}`)}，${m(`y = ${y}`)}`,
      `代回 ③：${m(`x = ${y}${signed(c1)} = ${x}`)}`,
    ],
    ...xy(x, y),
  };
}

/* ---------------- 四、解不等式 ---------------- */

/** Solve k·x op r, returning steps and the field. */
function finish(k, op, r, lhsTex) {
  const f = k < 0 ? FLIP[op] : op;
  return {
    steps: [
      `移项、合并：${m(ineqTex(lead(k, 'x'), op, r))}${lhsTex || ''}`,
      k < 0
        ? `两边同除以 ${m(`${k}`)}（负数），不等号方向改变：${m(ineqTex('x', f, fracTex(r, k)))}`
        : `两边同除以 ${m(`${k}`)}：${m(ineqTex('x', f, fracTex(r, k)))}`,
    ],
    answer: m(ineqTex('x', f, fracTex(r, k))),
    fields: [ineqField(f, r / k, '解集')],
  };
}

/** a. p(x − q) < x − r */
export function genG8IneqA({ original } = {}) {
  let [p, q, r, op] = [3, 1, 2, '<'];
  if (!original) {
    p = pickOne([-4, -3, -2, 2, 3, 4, 5, 6]);
    q = nonzero(-6, 6);
    r = nonzero(-9, 9);
    op = pickOne(['<', '>', '≤', '≥']);
  }
  const res = finish(p - 1, op, p * q - r);
  return {
    prompt: `解不等式：${m(ineqTex(`${p}(x${signed(-q)})`, op, `x${signed(-r)}`))}`,
    steps: [`去括号：${m(ineqTex(lin(p, -p * q, 'x'), op, `x${signed(-r)}`))}`, ...res.steps],
    answer: res.answer,
    fields: res.fields,
  };
}

/** b. a(x + b) ≤ c(x − d) */
export function genG8IneqB({ original } = {}) {
  let [a, b, c, d, op] = [2, 5, 3, 5, '≤'];
  if (!original) {
    do {
      a = randInt(2, 7);
      c = randInt(2, 7);
    } while (a === c);
    b = randInt(1, 9);
    d = randInt(1, 9);
    op = pickOne(['<', '>', '≤', '≥']);
  }
  const res = finish(a - c, op, -c * d - a * b);
  return {
    prompt: `解不等式：${m(ineqTex(`${a}(x + ${b})`, op, `${c}(x - ${d})`))}`,
    steps: [`去括号：${m(ineqTex(`${a}x + ${a * b}`, op, `${c}x - ${c * d}`))}`, ...res.steps],
    answer: res.answer,
    fields: res.fields,
  };
}

/** c. (x − a)/p + b ≥ (c·x + d)/q */
export function genG8IneqC({ original } = {}) {
  let [a, p, b, c, d, q, op] = [5, 4, 2, 5, 1, 6, '≥'];
  if (!original) {
    for (;;) {
      p = pickOne([2, 3, 4, 6]);
      q = pickOne([2, 3, 4, 5, 6]);
      if (p === q) continue;
      a = nonzero(-9, 9);
      b = randInt(1, 4);
      c = randInt(1, 6);
      d = nonzero(-9, 9);
      op = pickOne(['<', '>', '≤', '≥']);
      const L = (p * q) / gcd(p, q);
      if (L / p - (L / q) * c !== 0) break;
    }
  }
  const L = (p * q) / gcd(p, q);
  const A = L / p;
  const B = L / q;
  const k = A - B * c;
  const r = B * d + A * a - b * L;
  const res = finish(k, op, r);
  return {
    prompt: `解不等式：${m(ineqTex(`\\dfrac{x${signed(-a)}}{${p}} + ${b}`, op, `\\dfrac{${lin(c, d, 'x')}}{${q}}`))}`,
    steps: [
      `去分母：两边同乘 ${L}（正数，不等号不变）：${m(ineqTex(`${A === 1 ? '' : A}(x${signed(-a)}) + ${b * L}`, op, `${B === 1 ? '' : B}(${lin(c, d, 'x')})`))}`,
      `去括号：${m(ineqTex(`${lin(A, -A * a + b * L, 'x')}`, op, lin(B * c, B * d, 'x')))}`,
      ...res.steps,
    ],
    answer: res.answer,
    fields: res.fields,
  };
}

/* ---------------- 五、解不等式组 ---------------- */

/** One inequality a1·x + b1 op c1·x + d1 whose solution is x fop s. */
function makeOne(s, fop) {
  for (;;) {
    const a1 = randInt(1, 5);
    const c1 = randInt(0, 5);
    const k = a1 - c1;
    if (k === 0) continue;
    const b1 = nonzero(-9, 9);
    const d1 = b1 + k * s;
    const op = k < 0 ? FLIP[fop] : fop;
    return { a1, b1, c1, d1, op };
  }
}

function solveOne({ a1, b1, c1, d1, op }) {
  const k = a1 - c1;
  const r = d1 - b1;
  const f = k < 0 ? FLIP[op] : op;
  return { k, r, f, s: r / k, tex: ineqTex('x', f, fracTex(r, k)) };
}

function combine(sols) {
  let lo = null;
  let loIncl = false;
  let hi = null;
  let hiIncl = false;
  sols.forEach(({ f, s }) => {
    const incl = !isStrict(f);
    if (isRight(f)) {
      if (lo == null || s > lo) [lo, loIncl] = [s, incl];
      else if (s === lo) loIncl = loIncl && incl;
    } else if (hi == null || s < hi) [hi, hiIncl] = [s, incl];
    else if (s === hi) hiIncl = hiIncl && incl;
  });
  if (lo != null && hi != null && (lo > hi || (lo === hi && !(loIncl && hiIncl)))) return 'none';
  return { lo, loIncl, hi, hiIncl };
}

function rangeTex(v) {
  if (v === 'none') return '\\text{无解}';
  const lo = v.lo == null ? null : fracTex(Math.round(v.lo * 1e6), 1e6);
  const hi = v.hi == null ? null : fracTex(Math.round(v.hi * 1e6), 1e6);
  if (lo != null && hi != null) return `${lo} ${v.loIncl ? '\\le' : '<'} x ${v.hiIncl ? '\\le' : '<'} ${hi}`;
  if (lo != null) return `x ${v.loIncl ? '\\ge' : '>'} ${lo}`;
  return `x ${v.hiIncl ? '\\le' : '<'} ${hi}`;
}

function genSystem(orig, original) {
  let parts = orig;
  if (!original) {
    const s1 = randInt(-6, 6);
    const s2 = s1 + pickOne([-4, -3, -2, 2, 3, 4, 5]);
    parts = [makeOne(s1, pickOne(['<', '>', '≤', '≥'])), makeOne(s2, pickOne(['<', '>', '≤', '≥']))];
  }
  const sols = parts.map(solveOne);
  const val = combine(sols);
  const show = ({ a1, b1, c1, d1, op }) => ineqTex(lin(a1, b1, 'x'), op, lin(c1, d1, 'x'));
  return {
    prompt: `解不等式组：${m(sys(show(parts[0]), show(parts[1])))}`,
    steps: [
      ...sols.map((so, i) => `解第 ${i + 1} 个：${m(ineqTex(lead(so.k, 'x'), parts[i].op, so.r))}，${so.k < 0 ? '除以负数变号，' : ''}得 ${m(so.tex)}`),
      val === 'none'
        ? '两个解集没有公共部分（大大小小找不到），不等式组无解。'
        : `在数轴上取公共部分：${m(rangeTex(val))}`,
    ],
    answer: m(rangeTex(val)),
    fields: [{ name: 'r', type: 'range', label: '解集', value: val }],
  };
}
export const genG8IsysA = ({ original } = {}) =>
  genSystem(
    [
      { a1: 2, b1: -1, c1: 1, d1: 1, op: '>' },
      { a1: 1, b1: 8, c1: 4, d1: -1, op: '<' },
    ],
    original,
  );
export const genG8IsysB = ({ original } = {}) =>
  genSystem(
    [
      { a1: 2, b1: -6, c1: 1, d1: -4, op: '≥' },
      { a1: 2, b1: -3, c1: 0, d1: 9, op: '<' },
    ],
    original,
  );

/* ---------------- 附加题 ---------------- */

/** 9. 1 大 + 4 小 = 41 t，1 大 + 7 小 = 53 t，1 大 + 5 小 = ? */
export function genG8Q9({ original } = {}) {
  let [B, S, a, b, c] = [25, 4, 4, 7, 5];
  if (!original) {
    B = randInt(8, 40);
    S = randInt(2, 9);
    a = randInt(1, 5);
    b = a + randInt(1, 4);
    do c = randInt(1, 9);
    while (c === a || c === b);
  }
  const T1 = B + a * S;
  const T2 = B + b * S;
  return {
    prompt: `某运输公司有大小两种型号的货车。1 辆大货车与 ${a} 辆小货车一次可以运货 ${T1} t，1 辆大货车与 ${b} 辆小货车一次可以运货 ${T2} t。1 辆大货车与 ${c} 辆小货车一次可以运货多少吨？`,
    steps: [
      `设大货车每辆运 ${m('x')} t，小货车每辆运 ${m('y')} t：${m(sys(`x + ${a}y = ${T1}`, `x + ${b}y = ${T2}`))}`,
      `② − ①：${m(`${b - a}y = ${T2 - T1}`)}，${m(`y = ${S}`)}；${m(`x = ${T1} - ${a}\\times ${S} = ${B}`)}。`,
      `${m(`x + ${c}y = ${B} + ${c}\\times ${S} = ${B + c * S}`)}（t）。`,
    ],
    answer: `${B + c * S} t`,
    fields: [{ name: 'w', label: '运货（t）', display: 'x + ' + c + 'y', value: B + c * S }],
  };
}

/** 10. x = 2, y = −1 是 −4x + ky = −4 的解，求 k。 */
export function genG8Q10({ original } = {}) {
  let [x, y, a, k] = [2, -1, -4, -4];
  if (!original) {
    x = nonzero(-6, 6);
    y = nonzero(-6, 6);
    a = nonzero(-6, 6);
    k = nonzero(-6, 6);
  }
  const rhs = a * x + k * y;
  return {
    prompt: `已知 ${m(`x = ${x},\\ y = ${y}`)} 是方程 ${m(`${lead(a, 'x')} + ky = ${rhs}`)} 的一个解，求 ${m('k')} 的值。`,
    steps: [
      '「是方程的解」：代入后左右两边相等。',
      `${m(`${a}\\times ${par(x)} + ${par(y)}k = ${rhs}`)}，即 ${m(`${lead(y, 'k')}${signed(a * x)} = ${rhs}`)}。`,
      `${m(`${lead(y, 'k')} = ${rhs - a * x}`)}，所以 ${m(`k = ${k}`)}。`,
    ],
    answer: m(`k = ${k}`),
    fields: [{ name: 'k', value: k }],
  };
}

/** 11. y = p·x + q；a·x + b·y + c·z = d；e·x + f·z = g */
function genThree(orig, original) {
  let [p, q, a, b, c, d, e, f, g] = orig;
  if (!original) {
    for (;;) {
      const x = nonzero(-5, 5);
      const y = nonzero(-6, 6);
      const z = nonzero(-5, 5);
      p = nonzero(-4, 4);
      q = y - p * x;
      a = nonzero(-6, 6);
      b = nonzero(-4, 4);
      c = nonzero(-4, 4);
      d = a * x + b * y + c * z;
      e = nonzero(-5, 5);
      f = nonzero(-5, 5);
      g = e * x + f * z;
      if ((a + b * p) * f - c * e !== 0 && q !== 0) break;
    }
  }
  const A = a + b * p;
  const D = d - b * q;
  const det = A * f - c * e;
  const xNum = D * f - c * g;
  const x = xNum / det;
  const zNum = A * g - e * D; // z = zNum / det
  const z = zNum / det;
  const y = p * x + q;
  const yTex = fracTex(p * xNum + q * det, det);
  return {
    prompt: `解方程组：${m(`\\begin{cases} y = ${lin(p, q, 'x')} \\\\ ${lead(a, 'x')}${signed(b, 'y')}${signed(c, 'z')} = ${d} \\\\ ${lead(e, 'x')}${signed(f, 'z')} = ${g} \\end{cases}`)}`,
    steps: [
      `把 ① 代入 ②：${m(`${lead(a, 'x')} ${b < 0 ? '-' : '+'} ${Math.abs(b)}(${lin(p, q, 'x')})${signed(c, 'z')} = ${d}`)}，整理得 ${m(`${lead(A, 'x')}${signed(c, 'z')} = ${D}`)} ④`,
      `④ 与 ③ 组成二元一次方程组：${m(sys(`${lead(A, 'x')}${signed(c, 'z')} = ${D}`, `${lead(e, 'x')}${signed(f, 'z')} = ${g}`))}`,
      `消去 ${m('z')}：④ × ${par(f)} − ③ × ${par(c)}，得 ${m(`${lead(det, 'x')} = ${xNum}`)}，${m(`x = ${fracTex(xNum, det)}`)}`,
      `代回 ③ 求 ${m('z')}：${m(`z = ${fracTex(zNum, det)}`)}；代回 ① 求 ${m('y')}：${m(`y = ${yTex}`)}`,
    ],
    answer: m(`x = ${fracTex(xNum, det)},\\ y = ${yTex},\\ z = ${fracTex(zNum, det)}`),
    fields: [
      { name: 'x', value: x },
      { name: 'y', value: y },
      { name: 'z', value: z },
    ],
  };
}
export const genG8ThreeA = ({ original } = {}) => genThree([2, -7, 5, 3, 2, 2, 3, -4, 4], original);
export const genG8ThreeB = ({ original } = {}) => genThree([3, -2, 3, 2, 2, -3, 2, -5, -27], original);
