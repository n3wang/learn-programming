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
 * Same sell price S for both items; one gains pct%, one loses pct%.
 * Built so cost1, cost2, and S are all integers.
 */
function generate() {
  const pct = pickOne([10, 20, 25]);
  let cost1;
  let S;
  let cost2;
  do {
    cost1 = randInt(4, 40) * 5;
    S = (cost1 * (100 + pct)) / 100;
    cost2 = (cost1 * (100 + pct)) / (100 - pct);
  } while (!Number.isInteger(S) || !Number.isInteger(cost2));
  return { S, pct, cost1, cost2 };
}

/** 人教版原题：每件 120 元，一件盈利 25%，一件亏损 25%。 */
function bookProblem() {
  const pct = 25;
  const S = 120;
  const cost1 = 96;
  const cost2 = 160;
  return { S, pct, cost1, cost2 };
}

export default function ProfitLossSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const { totalCost, totalSell, diff } = useMemo(() => {
    const tCost = p.cost1 + p.cost2;
    const tSell = 2 * p.S;
    return { totalCost: tCost, totalSell: tSell, diff: tSell - tCost };
  }, [p]);

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
        设盈利 {p.pct}% 的那件衣服进价为 <b>x</b> 元，则 x + {p.pct}%x = {p.S}，解得 x ={' '}
        <AnimatedNumber value={p.cost1} /> 元。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        设亏损 {p.pct}% 的那件衣服进价为 <b>y</b> 元，则 y − {p.pct}%y = {p.S}，解得 y ={' '}
        <AnimatedNumber value={p.cost2} /> 元。
      </Typography>

      <Table size="small" sx={{ mb: 2, maxWidth: 420 }}>
        <TableHead>
          <TableRow>
            <TableCell>衣服</TableCell>
            <TableCell align="right">进价 / 元</TableCell>
            <TableCell align="right">售价 / 元</TableCell>
            <TableCell align="right">盈亏 / 元</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>盈利 {p.pct}%</TableCell>
            <TableCell align="right">{p.cost1}</TableCell>
            <TableCell align="right">{p.S}</TableCell>
            <TableCell align="right">+{p.S - p.cost1}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>亏损 {p.pct}%</TableCell>
            <TableCell align="right">{p.cost2}</TableCell>
            <TableCell align="right">{p.S}</TableCell>
            <TableCell align="right">{p.S - p.cost2}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>合计</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {totalCost}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {totalSell}
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {diff}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Typography sx={{ fontWeight: 700 }}>
        总售价 − 总进价 = <AnimatedNumber value={diff} /> 元，所以卖这两件衣服共
        {diff < 0 ? '亏损' : diff > 0 ? '盈利' : '不盈不亏'}{' '}
        <AnimatedNumber value={Math.abs(diff)} /> 元。
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        可以证明：只要盈利率和亏损率大小相等（都是同一个百分数），总售价 − 总进价 = −2S·p²/(1−p²)
        恒小于 0 ——不管 S 和 p 取什么值，"一件加价 p%、一件降价 p%" 卖出，总是亏损。
      </Typography>
    </Box>
  );

  return (
    <ProblemShell
      title="销售中的盈亏"
      subtitle="两件衣服都按同一价格卖出，一件盈利、一件亏损，同样的百分比——总的是赚还是亏？"
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={solution}
    >
      <Typography>
        一商店以每件 <b>{p.S}</b> 元的价格卖出两件衣服，其中一件盈利 <b>{p.pct}%</b>，另一件
        亏损 <b>{p.pct}%</b>，卖这两件衣服总的是盈利还是亏损，或是不盈不亏？
      </Typography>
    </ProblemShell>
  );
}
