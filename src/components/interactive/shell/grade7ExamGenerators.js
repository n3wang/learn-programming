import React from 'react';
import { randInt, pickOne } from './mathRandom';
import {
  m,
  nonzero,
  gcd,
  fracTex,
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
  RayFan,
  Fig,
} from './examKit';

/**
 * 2026 年下半学期初一数学期末考试 — one generator per question on the paper.
 * gen({ original: true }) returns the printed question with its own numbers;
 * otherwise the same question with new numbers (and, for 选择题, the true answer
 * moved to a random letter). Shapes: { prompt, figure?, steps, answer, fields }.
 */

const deg = (n) => `${n}^\\circ`;
const dm = (d, mm) => `${d}^\\circ${mm}'`;
const C = CIRCLED;

/* ---------------- 一、选择题 ---------------- */

/** 1. 一个角是 35°，余角、补角分别是？ */
export function genG7Q1({ original } = {}) {
  const a = original ? 35 : pickOne([12, 18, 22, 25, 28, 32, 35, 38, 42, 48, 52, 55, 58, 62, 65, 68, 72, 75]);
  const co = 90 - a;
  const sup = 180 - a;
  const opts = [
    `${m(deg(co))} 和 ${m(deg(sup))}`,
    `${m(deg(co + 10))} 和 ${m(deg(sup))}`,
    `${m(deg(sup))} 和 ${m(deg(co))}`,
    `${m(deg(co))} 和 ${m(deg(sup + 10))}`,
  ];
  const c = choice(opts, 0, original);
  return {
    prompt: `一个角是 ${m(deg(a))}。它的余角、补角分别是多少？（顺序：余角 和 补角）`,
    figure: c.figure,
    steps: [
      `余角：两角和为 ${m(deg(90))}，所以余角 ${m(`= 90^\\circ - ${a}^\\circ = ${co}^\\circ`)}。`,
      `补角：两角和为 ${m(deg(180))}，所以补角 ${m(`= 180^\\circ - ${a}^\\circ = ${sup}^\\circ`)}。`,
      '注意题目要求的顺序是「余角 和 补角」，把顺序倒过来的选项是错的。',
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/** 2. A、O、B 共线，OD 平分 ∠AOC，∠AOC = 110°，求 ∠AOD。 */
export function genG7Q2({ original } = {}) {
  const aoc = original ? 110 : 2 * randInt(30, 78);
  const h = aoc / 2;
  const opts = [m(deg(h)), m(deg(h - 10)), m(deg(h - 15)), m(deg(h - 20))];
  const c = choice(opts, 0, original);
  const cDeg = 180 - aoc;
  return {
    prompt: `点 A、O、B 在同一直线上，射线 OD 平分 ${m('\\angle AOC')}。若 ${m(`\\angle AOC = ${aoc}^\\circ`)}，求 ${m('\\angle AOD')} 的度数。`,
    figure: (
      <Fig>
        <RayFan
          rays={[
            { deg: 180, label: 'A', color: '#4a90d9' },
            { deg: 0, label: 'B', color: '#4a90d9' },
            { deg: cDeg, label: 'C', color: '#e0245e' },
            { deg: 180 - h, label: 'D', color: '#3b6ea5' },
            { deg: cDeg / 2, label: 'E', color: '#2a9d8f' },
          ]}
        />
        {c.figure}
      </Fig>
    ),
    steps: [
      `OD 平分 ${m('\\angle AOC')}，所以 ${m('\\angle AOD = \\dfrac{1}{2}\\angle AOC')}。`,
      `${m(`\\angle AOD = \\dfrac{1}{2}\\times ${aoc}^\\circ = ${h}^\\circ`)}。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

function pickCostPct() {
  for (;;) {
    const cost = pickOne([40, 50, 60, 80, 120, 150, 160, 200, 240, 300]);
    const pct = pickOne([10, 15, 20, 25, 30, 40, 50]);
    const p = (cost * pct) / 100;
    if (Number.isInteger(p) && p !== pct && p < cost) return { cost, pct, p };
  }
}

/** 3. 进价 80 元，盈利 25%，利润和售价？ */
export function genG7Q3({ original } = {}) {
  const { cost, pct, p } = original ? { cost: 80, pct: 25, p: 20 } : pickCostPct();
  const opts = [
    `利润 ${p} 元，售价 ${cost - p} 元`,
    `利润 ${pct} 元，售价 ${cost + pct} 元`,
    `利润 ${p} 元，售价 ${cost + p} 元`,
    `利润 ${pct} 元，售价 ${cost} 元`,
  ];
  const c = choice(opts, 2, original);
  return {
    prompt: `一件商品进价 ${cost} 元，盈利 ${pct}%。利润和售价分别是？`,
    figure: c.figure,
    steps: [
      `利润 = 进价 × 利润率 = ${m(`${cost}\\times ${pct}\\% = ${p}`)}（元）。`,
      `售价 = 进价 + 利润 = ${m(`${cost} + ${p} = ${cost + p}`)}（元）。`,
      `「利润 ${pct} 元」是把百分数当成了钱数；「售价 ${cost - p} 元」是把盈利当成了亏损。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/** 4. 进价 80 元，亏损 10%，哪一项正确？ */
export function genG7Q4({ original } = {}) {
  const { cost, pct, p } = original ? { cost: 80, pct: 10, p: 8 } : pickCostPct();
  const opts = [
    `亏损 ${pct} 元，售价 ${cost - pct} 元`,
    `亏损 ${p} 元，售价 ${cost - p} 元`,
    `利润 ${p} 元，售价 ${cost + p} 元`,
    `亏损 ${p} 元，售价 ${cost + p} 元`,
  ];
  const c = choice(opts, 1, original);
  return {
    prompt: `一件商品进价 ${cost} 元，亏损 ${pct}%。下列哪一项正确？`,
    figure: c.figure,
    steps: [
      `亏损额 = 进价 × 亏损率 = ${m(`${cost}\\times ${pct}\\% = ${p}`)}（元）。`,
      `亏损时售价比进价低：售价 = ${m(`${cost} - ${p} = ${cost - p}`)}（元）。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/** 5. 180° − 53°17′ = ? */
export function genG7Q5({ original } = {}) {
  let d = 53;
  let mm = 17;
  if (!original) {
    d = randInt(21, 88);
    do mm = randInt(3, 57);
    while (mm === 30);
  }
  const opts = [
    m(dm(180 - d, 60 - mm)),
    m(dm(180 - d, mm)),
    m(dm(179 - d, 60 - mm)),
    m(dm(179 - d, 100 - mm)),
  ];
  const c = choice(opts, 2, original);
  return {
    prompt: `${m(`180^\\circ - ${d}^\\circ${mm}'`)} 等于多少？`,
    figure: c.figure,
    steps: [
      `分不够减，先借 ${m('1^\\circ = 60\'')}：${m(`180^\\circ = 179^\\circ 60'`)}。`,
      `度减度、分减分：${m(`179^\\circ 60' - ${d}^\\circ${mm}' = ${179 - d}^\\circ${60 - mm}'`)}。`,
      `${m(dm(180 - d, 60 - mm))} 忘了借位；${m(dm(179 - d, 100 - mm))} 把 1° 当成了 100′。`,
    ],
    answer: `选 ${c.letter}：${c.text}`,
    fields: [c.field],
  };
}

/* ---------------- 二、应用题 ---------------- */

const lcm = (a, b) => (a / gcd(a, b)) * b;
const DIV360 = [3, 4, 5, 6, 8, 9, 10, 12];

/** 6. 蛋糕平均分成 10 份：每份的角、12° 时分几份、填表。 */
export function genG7Q6({ original } = {}) {
  let n1 = 10;
  let p2 = 30; // pieces when each angle is angle2
  let V1 = 2400;
  let n3 = 5;
  let V3 = 4800;
  let n4 = 6;
  let k4 = 300;
  if (!original) {
    n1 = pickOne([6, 8, 9, 10, 12]);
    p2 = pickOne([15, 18, 20, 24, 30, 36, 40].filter((x) => x !== n1));
    const L = lcm(n1, p2);
    const cand = [];
    for (let t = 1; L * t <= 7200; t++) if (L * t >= 1200 && (L * t) % 10 === 0) cand.push(L * t);
    V1 = cand.length ? pickOne(cand) : L * 10;
    n3 = pickOne(DIV360.filter((x) => x !== n1));
    V3 = n3 * 10 * randInt(10, 120);
    n4 = pickOne(DIV360.filter((x) => x !== n3));
    k4 = 10 * randInt(10, 90);
  }
  const a1 = 360 / n1;
  const ang2 = 360 / p2;
  const ang3 = 360 / n3;
  const ang4 = 360 / n4;
  const cm3 = (v) => `${v}\\ \\text{cm}^3`;
  return {
    prompt: `将一个蛋糕平均分成 ${n1} 份。`,
    figure: (
      <Fig>
        <Parts
          items={[
            ['a', '每份中的角是多少度？'],
            ['b', `若要使每份对应的圆心角为 ${m(deg(ang2))}，这个蛋糕应平均分成多少份？`],
            ['c', '填空格：'],
          ]}
        />
        <ExamTable
          head={['蛋糕的总体积', '每份中的角', '份', '每份蛋糕的体积']}
          rows={[
            [m(cm3(V1)), blank(C[0]), `${n1}`, m(cm3(V1 / n1))],
            [m(cm3(V1)), m(deg(ang2)), blank(C[1]), blank(C[2])],
            [m(cm3(V3)), blank(C[3]), `${n3}`, blank(C[4])],
            [blank(C[5]), blank(C[6]), `${n4}`, m(cm3(k4))],
          ]}
        />
      </Fig>
    ),
    steps: [
      `整个蛋糕是一个圆，圆心角共 ${m(deg(360))}。`,
      `a. 每份的角 ${m(`= 360^\\circ \\div ${n1} = ${a1}^\\circ`)}。`,
      `b. 份数 ${m(`= 360^\\circ \\div ${ang2}^\\circ = ${p2}`)}（份）。`,
      `① 同 a：${m(deg(a1))}。`,
      `②③ 份数 ${m(`= 360 \\div ${ang2} = ${p2}`)}，每份体积 ${m(`= ${V1}\\div ${p2} = ${V1 / p2}`)}。`,
      `④⑤ 每份角 ${m(`= 360^\\circ\\div ${n3} = ${ang3}^\\circ`)}，每份体积 ${m(`= ${V3}\\div ${n3} = ${V3 / n3}`)}。`,
      `⑥⑦ 总体积 ${m(`= ${k4}\\times ${n4} = ${k4 * n4}`)}，每份角 ${m(`= 360^\\circ\\div ${n4} = ${ang4}^\\circ`)}。`,
    ],
    answer: `a. ${m(deg(a1))}；b. ${p2} 份；① ${m(deg(a1))} ② ${p2} ③ ${m(cm3(V1 / p2))} ④ ${m(deg(ang3))} ⑤ ${m(cm3(V3 / n3))} ⑥ ${m(cm3(k4 * n4))} ⑦ ${m(deg(ang4))}`,
    fields: [
      { name: 'a', label: 'a. 每份的角（度）', display: '\\text{a}', value: a1 },
      { name: 'b', label: 'b. 份数', display: '\\text{b}', value: p2 },
      cellField(0, '每份中的角（度）', a1),
      cellField(1, '份', p2),
      cellField(2, '每份体积', V1 / p2),
      cellField(3, '每份中的角（度）', ang3),
      cellField(4, '每份体积', V3 / n3),
      cellField(5, '总体积', k4 * n4),
      cellField(6, '每份中的角（度）', ang4),
    ],
  };
}

/** 7. 甲：不超过 50 件每件 20 元，超过部分每件 16 元；乙：每件 18 元。 */
export function genG7Q7({ original } = {}) {
  let T = 50;
  let P1 = 20;
  let P2 = 16;
  let F = 18;
  let a = 20;
  let b = 60;
  let c = 80;
  if (!original) {
    for (;;) {
      T = pickOne([20, 30, 40, 50, 60]);
      P2 = randInt(8, 20);
      const d1 = randInt(1, 4);
      const d2 = randInt(1, 6);
      F = P2 + d1;
      P1 = F + d2;
      const nEq = (T * (d1 + d2)) / d1;
      if (!Number.isInteger(nEq) || nEq > 260 || nEq - T < 15) continue;
      a = 5 * randInt(1, T / 5 - 1);
      const mids = [];
      for (let k = T + 5; k < nEq; k += 5) mids.push(k);
      if (mids.length < 2) continue;
      [b, c] = mids.length > 2 ? [pickOne(mids.slice(0, -1)), null] : mids;
      if (c == null) c = pickOne(mids.filter((x) => x > b));
      break;
    }
  }
  const nEq = (T * (P1 - P2)) / (F - P2);
  const jia = (n) => (n <= T ? P1 * n : P1 * T + P2 * (n - T));
  return {
    prompt: `某服装批发商提供两种批发方案：甲方案：不超过 ${T} 件，每件 ${P1} 元；超过 ${T} 件的部分，每件 ${P2} 元。乙方案：不论购买多少件，每件都是 ${F} 元。`,
    figure: (
      <Fig>
        <Parts
          items={[
            ['A', '购买多少件衣服时，两种方案的总费用相同？'],
            ['B', '填空格：'],
          ]}
        />
        <ExamTable
          head={['购买数量（件）', '甲方案总价（元）', '乙方案总价（元）']}
          rows={[
            [`${a}`, `${jia(a)}`, `${F * a}`],
            [`${T}`, blank(C[0]), blank(C[1])],
            [blank(C[2]), blank(C[3]), `${F * b}`],
            [blank(C[4]), `${jia(c)}`, `${F * c}`],
          ]}
        />
      </Fig>
    ),
    steps: [
      `设购买 ${m('x')} 件（${m(`x > ${T}`)}，不超过 ${T} 件时甲每件更贵，不可能相同）。`,
      `甲：${m(`${P1}\\times ${T} + ${P2}(x - ${T}) = ${P2}x + ${P1 * T - P2 * T}`)}；乙：${m(`${F}x`)}。`,
      `${m(`${P2}x + ${(P1 - P2) * T} = ${F}x`)}，${m(`${F - P2}x = ${(P1 - P2) * T}`)}，${m(`x = ${nEq}`)}。`,
      `① ${m(`${P1}\\times ${T} = ${P1 * T}`)}；② ${m(`${F}\\times ${T} = ${F * T}`)}。`,
      `③ ${m(`${F * b}\\div ${F} = ${b}`)} 件；④ ${m(`${P1 * T} + ${P2}\\times(${b} - ${T}) = ${jia(b)}`)}。`,
      `⑤ 由乙：${m(`${F * c}\\div ${F} = ${c}`)} 件（用甲检验：${m(`${P1 * T} + ${P2}\\times ${c - T} = ${jia(c)}`)} ✓）。`,
    ],
    answer: `A. ${nEq} 件；① ${P1 * T} ② ${F * T} ③ ${b} ④ ${jia(b)} ⑤ ${c}`,
    fields: [
      { name: 'A', label: 'A. 购买件数', display: 'x', value: nEq },
      cellField(0, '甲方案总价', P1 * T),
      cellField(1, '乙方案总价', F * T),
      cellField(2, '购买数量', b),
      cellField(3, '甲方案总价', jia(b)),
      cellField(4, '购买数量', c),
    ],
  };
}

/** 8. 卡车与自行车相向而行，36 km，0.6 / 0.2 km/分。 */
export function genG7Q8({ original } = {}) {
  // speeds in tenths of km/min
  let v1 = 6;
  let v2 = 2;
  let t = 45;
  let ta = 60;
  let tb = 45;
  let v3 = 10;
  let tc = 5;
  let td = 15;
  if (!original) {
    for (;;) {
      v1 = randInt(3, 12);
      v2 = randInt(1, 4);
      t = 5 * randInt(4, 18);
      if (v1 !== v2 && ((v1 + v2) * t) % 10 === 0) break;
    }
    ta = pickOne([10, 20, 30, 40, 50, 60, 80, 90].filter((x) => (v1 * x) % 10 === 0)) || 10;
    tb = 5 * randInt(2, 18);
    v3 = randInt(5, 15);
    tc = randInt(2, 10);
    td = 5 * randInt(1, 12);
    if (td === tb) td += 5;
  }
  const s = (n) => num(n / 10, 2);
  const D = ((v1 + v2) * t) / 10;
  const d1 = (v1 * t) / 10;
  const d2 = (v2 * t) / 10;
  const km = (x) => `${num(x)}\\ \\text{km}`;
  return {
    prompt: `一辆卡车和一辆自行车分别从 A、B 两地同时出发，沿同一条道路相向匀速而行。经过 X 分钟，两者相遇。已知两地之间的距离为 ${num(D)} km。卡车速度 ${s(v1)} km/分钟，自行车速度 ${s(v2)} km/分钟。`,
    figure: (
      <Fig>
        <Parts
          items={[
            ['a', '过了多少分钟后才相遇？'],
            ['b', '卡车和自行车相遇时，各自行驶了多少千米？'],
            ['c', '两地之间的距离是多少千米？'],
            ['d', '填空格：'],
          ]}
        />
        <ExamTable
          head={['交通工具', '速度', '达距离', '达分钟']}
          rows={[
            ['卡车', `${s(v1)} km/分钟`, m(km((v1 * ta) / 10)), blank(C[0])],
            ['自行车', `${s(v2)} km/分钟`, blank(C[1]), `${tb} 分钟`],
            ['飞机', `${v3} km/分钟`, m(km(v3 * tc)), blank(C[2])],
            ['自行车', `${s(v2)} km/分钟`, blank(C[3]), `${td} 分钟`],
          ]}
        />
      </Fig>
    ),
    steps: [
      `相向而行，每分钟两车一共靠近 ${m(`${s(v1)} + ${s(v2)} = ${s(v1 + v2)}`)} km。`,
      `a. ${m(`(${s(v1)} + ${s(v2)})X = ${num(D)}`)}，${m(`X = ${num(D)}\\div ${s(v1 + v2)} = ${t}`)}（分钟）。`,
      `b. 卡车 ${m(`${s(v1)}\\times ${t} = ${num(d1)}`)} km，自行车 ${m(`${s(v2)}\\times ${t} = ${num(d2)}`)} km。`,
      `c. 两段相加就是全程：${m(`${num(d1)} + ${num(d2)} = ${num(D)}`)} km。`,
      `d. 时间 = 距离 ÷ 速度，距离 = 速度 × 时间：① ${m(`${num((v1 * ta) / 10)}\\div ${s(v1)} = ${ta}`)}；② ${m(`${s(v2)}\\times ${tb} = ${num((v2 * tb) / 10)}`)}；③ ${m(`${v3 * tc}\\div ${v3} = ${tc}`)}；④ ${m(`${s(v2)}\\times ${td} = ${num((v2 * td) / 10)}`)}。`,
    ],
    answer: `a. ${t} 分钟；b. 卡车 ${num(d1)} km，自行车 ${num(d2)} km；c. ${num(D)} km；① ${ta} 分钟 ② ${num((v2 * tb) / 10)} km ③ ${tc} 分钟 ④ ${num((v2 * td) / 10)} km`,
    fields: [
      { name: 'a', label: 'a. 相遇时间（分钟）', display: 'X', value: t },
      { name: 'b1', label: 'b. 卡车（km）', display: '\\text{b}_1', value: d1 },
      { name: 'b2', label: 'b. 自行车（km）', display: '\\text{b}_2', value: d2 },
      { name: 'cD', label: 'c. 两地距离（km）', display: '\\text{c}', value: D },
      cellField(0, '卡车 达分钟', ta),
      cellField(1, '自行车 达距离（km）', (v2 * tb) / 10),
      cellField(2, '飞机 达分钟', tc),
      cellField(3, '自行车 达距离（km）', (v2 * td) / 10),
    ],
  };
}

/** 9. 每天 900 个甲或 300 个乙，20 天，配套。 */
export function genG7Q9({ original } = {}) {
  let A = 900;
  let B = 300;
  let N = 20;
  let a1 = 3;
  let a2 = 10;
  let b3 = 5;
  if (!original) {
    B = pickOne([100, 120, 150, 200, 250, 300, 400]);
    const k = randInt(2, 5);
    A = k * B;
    const sOpt = [2, 3, 4, 5, 6].filter((x) => (k + 1) * x <= 30);
    N = (k + 1) * pickOne(sOpt);
    a1 = randInt(1, Math.max(1, Math.floor(N / 3)));
    a2 = randInt(a1 + 1, N - 2);
    b3 = randInt(2, N - 2);
  }
  const x = (B * N) / (A + B);
  return {
    prompt: `某车间每天可以生产 ${A} 个甲种零件或 ${B} 个乙种零件，每天只能生产其中一种零件。甲、乙两种零件各 1 个可以配成 1 套产品。`,
    figure: (
      <Fig>
        <Parts items={[['a', '填空格：']]} />
        <ExamTable
          head={['可制作天', '甲生产天', '甲数量', '乙生产天', '乙数量']}
          rows={[
            [`${N} 天`, `${a1} 天`, `${A * a1} 个`, `${N - a1} 天`, blank(C[0])],
            [`${N} 天`, `${a2} 天`, `${A * a2} 个`, blank(C[1]), blank(C[2])],
            [`${N} 天`, blank(C[3]), blank(C[4]), `${b3} 天`, blank(C[5])],
          ]}
        />
        <Parts items={[['b', `若要在 ${N} 天内生产尽可能多的成套产品，甲、乙两种零件分别应该生产多少天？`]]} />
      </Fig>
    ),
    steps: [
      `a. 数量 = 每天产量 × 天数，甲天 + 乙天 = ${N}。`,
      `① ${m(`${B}\\times ${N - a1} = ${B * (N - a1)}`)}；② ${m(`${N} - ${a2} = ${N - a2}`)}，③ ${m(`${B}\\times ${N - a2} = ${B * (N - a2)}`)}。`,
      `④ ${m(`${N} - ${b3} = ${N - b3}`)}，⑤ ${m(`${A}\\times ${N - b3} = ${A * (N - b3)}`)}，⑥ ${m(`${B}\\times ${b3} = ${B * b3}`)}。`,
      `b. 成套最多时，甲、乙零件个数正好相等。设甲生产 ${m('x')} 天，乙生产 ${m(`(${N} - x)`)} 天。`,
      `${m(`${A}x = ${B}(${N} - x)`)}，${m(`${A + B}x = ${B * N}`)}，${m(`x = ${x}`)}；乙 ${m(`${N} - ${x} = ${N - x}`)} 天。`,
      `检验：甲 ${m(`${A}\\times ${x} = ${A * x}`)} 个，乙 ${m(`${B}\\times ${N - x} = ${B * (N - x)}`)} 个，正好配成 ${A * x} 套。`,
    ],
    answer: `① ${B * (N - a1)} ② ${N - a2} ③ ${B * (N - a2)} ④ ${N - b3} ⑤ ${A * (N - b3)} ⑥ ${B * b3}；b. 甲 ${x} 天，乙 ${N - x} 天`,
    fields: [
      cellField(0, '乙数量', B * (N - a1)),
      cellField(1, '乙生产天', N - a2),
      cellField(2, '乙数量', B * (N - a2)),
      cellField(3, '甲生产天', N - b3),
      cellField(4, '甲数量', A * (N - b3)),
      cellField(5, '乙数量', B * b3),
      { name: 'bx', label: 'b. 甲生产天', display: '\\text{甲}', value: x },
      { name: 'by', label: 'b. 乙生产天', display: '\\text{乙}', value: N - x },
    ],
  };
}

/* ---------------- 三、解方程 ---------------- */

const VARS = ['x', 'y', 'n', 'm', 'a', 'z'];

function solved(v, p, q) {
  return { answer: m(`${v} = ${fracTex(p, q)}`), fields: [{ name: v, value: p / q }] };
}

/** a + b·v = c·v + d  （a. −2 − 3n = −8n + 13；b. −11 − 7n = −6n + 3） */
function genMoveTerms(orig, original) {
  let [v, a, b, c, d] = orig;
  if (!original) {
    v = pickOne(VARS);
    const sol = nonzero(-12, 12);
    for (;;) {
      a = nonzero(-15, 15);
      b = nonzero(-9, 9);
      c = nonzero(-9, 9);
      d = a + (b - c) * sol;
      if (b !== c && d !== 0 && Math.abs(d) <= 60) break;
    }
  }
  const k = b - c;
  const r = d - a;
  return {
    prompt: `解方程：${m(`${a}${signed(b, v)} = ${lead(c, v)}${signed(d)}`)}`,
    steps: [
      `移项（含 ${m(v)} 的项移到左边，常数移到右边，移项要变号）：${m(`${lead(b, v)}${signed(-c, v)} = ${d}${signed(-a)}`)}`,
      `合并同类项：${m(`${lead(k, v)} = ${r}`)}`,
      `系数化为 1：${m(`${v} = ${fracTex(r, k)}`)}`,
    ],
    ...solved(v, r, k),
  };
}
export const genG7EqA = ({ original } = {}) => genMoveTerms(['n', -2, -3, -8, 13], original);
export const genG7EqB = ({ original } = {}) => genMoveTerms(['n', -11, -7, -6, 3], original);

/** c. p·v − q(r + s·v) = t */
export function genG7EqC({ original } = {}) {
  let [v, p, q, r, s, t] = ['y', 2, 2, 5, 2, -28];
  if (!original) {
    v = pickOne(VARS);
    const sol = nonzero(-10, 10);
    for (;;) {
      p = randInt(2, 9);
      q = randInt(2, 6);
      r = randInt(1, 9);
      s = randInt(1, 5);
      if (p - q * s !== 0) break;
    }
    t = (p - q * s) * sol - q * r;
  }
  const k = p - q * s;
  return {
    prompt: `解方程：${m(`${lead(p, v)} - ${q}(${r}${signed(s, v)}) = ${t}`)}`,
    steps: [
      `去括号（括号前是「−${q}」，里面每一项都乘 −${q}）：${m(`${lead(p, v)} - ${q * r}${signed(-q * s, v)} = ${t}`)}`,
      `移项：${m(`${lead(p, v)}${signed(-q * s, v)} = ${t} + ${q * r}`)}`,
      `合并：${m(`${lead(k, v)} = ${t + q * r}`)}，所以 ${m(`${v} = ${fracTex(t + q * r, k)}`)}`,
    ],
    ...solved(v, t + q * r, k),
  };
}

/** d. p·v − (q·v + r) = t */
export function genG7EqD({ original } = {}) {
  let [v, p, q, r, t] = ['y', 3, 4, 8, 2];
  if (!original) {
    v = pickOne(VARS);
    const sol = nonzero(-12, 12);
    do {
      p = randInt(2, 9);
      q = randInt(2, 9);
    } while (p === q);
    r = randInt(1, 15);
    t = (p - q) * sol - r;
  }
  const k = p - q;
  return {
    prompt: `解方程：${m(`${lead(p, v)} - (${lead(q, v)} + ${r}) = ${t}`)}`,
    steps: [
      `去括号（前面是减号，括号里每项都变号）：${m(`${lead(p, v)} - ${lead(q, v)} - ${r} = ${t}`)}`,
      `移项、合并：${m(`${lead(k, v)} = ${t} + ${r} = ${t + r}`)}`,
      `系数化为 1：${m(`${v} = ${fracTex(t + r, k)}`)}`,
    ],
    ...solved(v, t + r, k),
  };
}

/** e. (a·v + b)/c = (d·v + e)/f */
export function genG7EqE({ original } = {}) {
  let [v, a, b, c, d, e, f] = ['a', 2, -5, 3, 3, 10, 2];
  if (!original) {
    v = pickOne(VARS);
    for (;;) {
      c = randInt(2, 6);
      f = randInt(2, 6);
      if (c === f) continue;
      a = randInt(1, 5);
      d = randInt(1, 5);
      if (f * a === c * d) continue;
      b = nonzero(-12, 12);
      const sol = nonzero(-10, 10);
      const num2 = (f * a - c * d) * sol + f * b;
      if (num2 % c !== 0) continue;
      e = num2 / c;
      if (e !== 0 && Math.abs(e) <= 30) break;
    }
  }
  const k = f * a - c * d;
  const r = c * e - f * b;
  return {
    prompt: `解方程：${m(`\\dfrac{${lin(a, b, v)}}{${c}} = \\dfrac{${lin(d, e, v)}}{${f}}`)}`,
    steps: [
      `去分母：两边同乘 ${c * f}（或最小公倍数），得 ${m(`${f}(${lin(a, b, v)}) = ${c}(${lin(d, e, v)})`)}`,
      `去括号：${m(`${lin(f * a, f * b, v)} = ${lin(c * d, c * e, v)}`)}`,
      `移项、合并：${m(`${lead(k, v)} = ${r}`)}，所以 ${m(`${v} = ${fracTex(r, k)}`)}`,
    ],
    ...solved(v, r, k),
  };
}

/** f. (a·v + b)/c = (d·v + e)/(−c) − g   （答案可以是分数） */
export function genG7EqF({ original } = {}) {
  let [v, a, b, c, d, e, g] = ['z', 4, -14, 5, 2, -3, 2];
  if (!original) {
    v = pickOne(VARS);
    for (;;) {
      a = randInt(2, 6);
      d = randInt(1, 5);
      c = randInt(2, 7);
      b = nonzero(-15, 15);
      e = nonzero(-9, 9);
      g = randInt(1, 4);
      const r = -e - g * c - b;
      if (r !== 0 && (a + d) !== 0) break;
    }
  }
  const k = a + d;
  const r = -e - g * c - b;
  return {
    prompt: `解方程：${m(`\\dfrac{${lin(a, b, v)}}{${c}} = \\dfrac{${lin(d, e, v)}}{-${c}} - ${g}`)}`,
    steps: [
      `分母是 ${c} 和 −${c}，两边同乘 ${c}：${m(`${lin(a, b, v)} = -(${lin(d, e, v)}) - ${g * c}`)}（注意 ${m(`-${g}`)} 也要乘 ${c}）`,
      `去括号：${m(`${lin(a, b, v)} = ${lin(-d, -e - g * c, v)}`)}`,
      `移项、合并：${m(`${lead(k, v)} = ${r}`)}，所以 ${m(`${v} = ${fracTex(r, k)}`)}`,
    ],
    ...solved(v, r, k),
  };
}

/** g. p·v − q(r − s·v) = t */
export function genG7EqG({ original } = {}) {
  let [v, p, q, r, s, t] = ['n', 6, 3, 5, 5, 27];
  if (!original) {
    v = pickOne(VARS);
    const sol = nonzero(-8, 8);
    p = randInt(2, 9);
    q = randInt(2, 6);
    r = randInt(1, 9);
    s = randInt(1, 6);
    t = (p + q * s) * sol - q * r;
  }
  const k = p + q * s;
  return {
    prompt: `解方程：${m(`${lead(p, v)} - ${q}(${r} - ${lead(s, v)}) = ${t}`)}`,
    steps: [
      `去括号：${m(`${lead(p, v)} - ${q * r} + ${lead(q * s, v)} = ${t}`)}（−${q} 乘 −${lead(s, v)} 得 +${lead(q * s, v)}）`,
      `移项、合并：${m(`${lead(k, v)} = ${t} + ${q * r} = ${t + q * r}`)}`,
      `系数化为 1：${m(`${v} = ${fracTex(t + q * r, k)}`)}`,
    ],
    ...solved(v, t + q * r, k),
  };
}

/** h. z 与 4 的积等于 z 与 9 的和 */
export function genG7EqH({ original } = {}) {
  let [v, a, b] = ['z', 4, 9];
  if (!original) {
    v = pickOne(VARS);
    a = randInt(2, 9);
    b = (a - 1) * randInt(2, 12);
  }
  return {
    prompt: `${m(v)} 与 ${a} 的积等于 ${m(v)} 与 ${b} 的和，求 ${m(v)}。`,
    steps: [
      `「积」是乘，「和」是加：${m(`${a}${v} = ${v} + ${b}`)}`,
      `移项、合并：${m(`${lead(a - 1, v)} = ${b}`)}，所以 ${m(`${v} = ${fracTex(b, a - 1)}`)}`,
    ],
    ...solved(v, b, a - 1),
  };
}

/* ---------------- 附加题 ---------------- */

/** 10. 圆柱形水桶内直径 10 cm，放入铁块水面上升 4 cm，求铁块体积。 */
export function genG7Q10({ original } = {}) {
  const d = original ? 10 : 2 * randInt(3, 12);
  const h = original ? 4 : randInt(1, 9);
  const r = d / 2;
  const base = r * r * h; // coefficient of π
  return {
    prompt: `一个圆柱形水桶的底面内直径为 ${d} cm，将一个铁块完全浸没在水中后，水面上升了 ${h} cm。求这个铁块的体积（${m('\\pi')} 取 3.14）。`,
    steps: [
      '铁块的体积 = 水面上升那一段「水柱」的体积（圆柱）。',
      `底面半径 ${m(`r = ${d}\\div 2 = ${r}`)} cm。`,
      `${m(`V = \\pi r^2 h = \\pi\\times ${r}^2\\times ${h} = ${base}\\pi \\approx ${num(3.14 * base)}`)}（${m('\\text{cm}^3')}）。`,
      `常见错误：直接用直径 ${d} 当半径，算成 ${m(`${d * d * h}\\pi`)}。`,
    ],
    answer: `${m(`V = ${base}\\pi \\approx ${num(3.14 * base)}\\ \\text{cm}^3`)}`,
    fields: [
      { name: 'V', label: '体积（cm³，π 取 3.14）', value: 3.14 * base, tol: base * 0.002 + 0.01 },
    ],
  };
}

/** 11. n 的 5 倍与 8 的和等于 n 的 2 倍与 19 的差。 */
export function genG7Q11({ original } = {}) {
  let [v, p, q, r, s] = ['n', 5, 8, 2, 19];
  if (!original) {
    v = pickOne(VARS);
    for (;;) {
      p = randInt(3, 9);
      r = randInt(2, p - 1);
      q = randInt(1, 20);
      const sol = randInt(-12, -2);
      s = (p - r) * -sol - q;
      if (s >= 1 && s <= 40) break;
    }
  }
  const k = p - r;
  const rhs = -s - q;
  return {
    prompt: `${m(v)} 的 ${p} 倍与 ${q} 的和等于 ${m(v)} 的 ${r} 倍与 ${s} 的差，求 ${m(v)}。`,
    steps: [
      `列方程：${m(`${p}${v} + ${q} = ${r}${v} - ${s}`)}`,
      `移项：${m(`${p}${v} - ${r}${v} = -${s} - ${q}`)}`,
      `合并：${m(`${lead(k, v)} = ${rhs}`)}，所以 ${m(`${v} = ${fracTex(rhs, k)}`)}`,
    ],
    ...solved(v, rhs, k),
  };
}

/** 12. ∠DOC = ∠BOC，∠AOC = 90°，∠BOC = 70°，求 ∠AOB、∠COD。 */
export function genG7Q12({ original } = {}) {
  const b = original ? 70 : randInt(15, 75);
  return {
    prompt: `${m('\\angle DOC = \\angle BOC')}，${m('\\angle AOC = 90^\\circ')}。如果 ${m(`\\angle BOC = ${b}^\\circ`)}，${m('\\angle AOB')} 和 ${m('\\angle COD')} 各是多少度？`,
    figure: (
      <RayFan
        right={0}
        rays={[
          { deg: 0, label: 'A', color: '#2a9d8f' },
          { deg: 90 - b, label: 'B', color: '#2a9d8f' },
          { deg: 90, label: 'C', color: '#3b6ea5' },
          { deg: 90 + b, label: 'D', color: '#2a9d8f' },
        ]}
      />
    ),
    steps: [
      `${m('\\angle AOB = \\angle AOC - \\angle BOC')} ${m(`= 90^\\circ - ${b}^\\circ = ${90 - b}^\\circ`)}。`,
      `${m('\\angle COD = \\angle BOC')} ${m(`= ${b}^\\circ`)}（已知两角相等）。`,
    ],
    answer: `${m(`\\angle AOB = ${90 - b}^\\circ`)}，${m(`\\angle COD = ${b}^\\circ`)}`,
    fields: [
      { name: 'aob', label: '度数', display: '\\angle AOB', value: 90 - b },
      { name: 'cod', label: '度数', display: '\\angle COD', value: b },
    ],
  };
}

