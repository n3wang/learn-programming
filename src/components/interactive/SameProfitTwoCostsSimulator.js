import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
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
  const [p, setP] = useState(bookProblem);

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
    <Box>
      <Typography sx={{ mb: 1 }}>
        设{p.items.big}进价为 <b>x</b> 元，则{p.items.small}进价为 x − {p.diff} 元。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        利润额相同：{p.smallRate}% · (x − {p.diff}) = {p.bigRate}% · x，即
      </Typography>
      <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
        {p.smallRate}(x − {p.diff}) = {p.bigRate}x
      </Typography>
      <Typography sx={{ mb: 1.5 }}>
        解得 x = <AnimatedNumber value={p.bigCost} />，故{p.items.small}进价 ={' '}
        <AnimatedNumber value={p.smallCost} /> 元。
      </Typography>

      <Table size="small" sx={{ mb: 1.5, maxWidth: 420 }}>
        <TableHead>
          <TableRow>
            <TableCell>商品</TableCell>
            <TableCell align="right">进价 / 元</TableCell>
            <TableCell align="right">利润率</TableCell>
            <TableCell align="right">利润额 / 元</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>{p.items.big}</TableCell>
            <TableCell align="right">{p.bigCost}</TableCell>
            <TableCell align="right">{p.bigRate}%</TableCell>
            <TableCell align="right">{profit}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{p.items.small}</TableCell>
            <TableCell align="right">{p.smallCost}</TableCell>
            <TableCell align="right">{p.smallRate}%</TableCell>
            <TableCell align="right">{profit}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Typography sx={{ fontWeight: 700 }}>
        答：{p.items.big}进价 <AnimatedNumber value={p.bigCost} /> 元，
        {p.items.small}进价 <AnimatedNumber value={p.smallCost} /> 元。
      </Typography>
    </Box>
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
