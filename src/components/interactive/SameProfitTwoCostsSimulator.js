import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Two products: small costs `diff` less than big; same profit amount;
 * smallRate% vs bigRate%. Answers (costs) are always positive integers.
 *
 * bigCost = (smallRate / gcd) * m
 * diff    = m * (smallRate - bigRate) / gcd
 */
function gcd(a, b) {
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

const ITEM_PAIRS = [
  { plural: '两种书包', small: '小书包', big: '大书包' },
  { plural: '两种文具盒', small: '小文具盒', big: '大文具盒' },
  { plural: '两种台灯', small: '小台灯', big: '大台灯' },
  { plural: '两种水杯', small: '小水杯', big: '大水杯' },
  { plural: '两种背包', small: '小背包', big: '大背包' },
];

const WORDINGS = [
  (ctx) =>
    `某商店有${ctx.plural}．每个${ctx.small}比${ctx.big}的进价少 ${ctx.diff} 元，而它们的售后利润额相同，其中，每个${ctx.small}的利润率为 ${ctx.smallRate}%，每个${ctx.big}的利润率为 ${ctx.bigRate}%．试求两种${ctx.kind}的进价．`,
  (ctx) =>
    `商店出售${ctx.plural}。${ctx.small}的进价比${ctx.big}少 ${ctx.diff} 元，两种${ctx.kind}卖出后利润额一样。已知${ctx.small}利润率 ${ctx.smallRate}%，${ctx.big}利润率 ${ctx.bigRate}%。两种${ctx.kind}的进价各是多少？`,
  (ctx) =>
    `${ctx.plural}进货：${ctx.small}比${ctx.big}便宜 ${ctx.diff} 元。按售价算，两者利润金额相同——${ctx.small}利润率 ${ctx.smallRate}%，${ctx.big}利润率 ${ctx.bigRate}%。求各自的进价。`,
];

function generate() {
  const smallRate = pickOne([25, 30, 40, 50]);
  const bigRate = pickOne([10, 15, 20].filter((r) => r < smallRate));
  const g = gcd(smallRate, smallRate - bigRate);
  const m = randInt(2, 8) * 5;
  const bigCost = (smallRate / g) * m;
  const diff = (m * (smallRate - bigRate)) / g;
  const smallCost = bigCost - diff;
  const items = pickOne(ITEM_PAIRS);
  const kind = items.plural.replace(/^两种/, '');
  const wording = pickOne(WORDINGS);
  const text = wording({
    ...items,
    kind,
    diff,
    smallRate,
    bigRate,
  });
  return { smallRate, bigRate, diff, bigCost, smallCost, items, text };
}

function bookProblem() {
  const items = ITEM_PAIRS[0]; // 两种书包
  const kind = '书包';
  const smallRate = 30;
  const bigRate = 20;
  const diff = 10;
  const bigCost = 30;
  const smallCost = 20;
  const text = WORDINGS[0]({
    ...items,
    kind,
    diff,
    smallRate,
    bigRate,
  });
  return { smallRate, bigRate, diff, bigCost, smallCost, items, text };
}

export default function SameProfitTwoCostsSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([numberField("big", `${p.items.big}进价（元）`, p.bigCost, "x"), numberField("small", `${p.items.small}进价（元）`, p.smallCost, "y")]);

  const profit = useMemo(() => (p.bigCost * p.bigRate) / 100, [p]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const loadBook = () => {
    setP(bookProblem());
    setKey((k) => k + 1);
  };

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '进价']]}>
      <Step b="知" kind="set">
        <EqBox lines={['\\text{利润} = \\text{进价} \\times \\text{利润率}']} />
        两种商品利润<b>一样多</b>，这就是相等关系。
      </Step>
      <Step b="设" kind="set">
        设{p.items.big}进价为 <M t="x" /> 元，则{p.items.small}进价为 <M t={`x - ${c(BLUE, p.diff)}`} /> 元。
      </Step>
      <Step b="列" kind="list">
        <EqBox lines={[`${c(BLUE, `${p.smallRate}\\%`)}(x - ${p.diff}) = ${c(BLUE, `${p.bigRate}\\%`)}x`]} />
      </Step>
      <Step b="解" kind="solve">
        两边乘 100 去掉百分号：
        <EqBox
          lines={[
            `${p.smallRate}(x - ${p.diff}) = ${p.bigRate}x`,
            `${p.smallRate}x - ${p.smallRate * p.diff} = ${p.bigRate}x`,
            `${p.smallRate - p.bigRate}x = ${p.smallRate * p.diff}`,
            `x = ${c(GREEN, p.bigCost)}, \\qquad x - ${p.diff} = ${c(GREEN, p.smallCost)}`,
          ]}
        />
      </Step>
      <Step b="验" kind="check">
        {p.items.big}利润 <M t={`${p.bigCost}\\times ${p.bigRate}\\% = ${profit}`} /> 元，{p.items.small}利润{' '}
        <M t={`${p.smallCost}\\times ${p.smallRate}\\% = ${profit}`} /> 元，相等 ✓
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {p.items.big}进价 {p.bigCost} 元，{p.items.small}进价 {p.smallCost} 元。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="利润率相同利润额：求进价"
      subtitle="商品种类、差价、利润率都会随机变化；答案始终为整数元"
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={solution}
    >
      <Typography>{p.text}</Typography>
    </ProblemShell>
  );
}
