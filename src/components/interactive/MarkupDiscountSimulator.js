import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Markup then discount: cost raised by markup%, then sold at fold/10 of
 * marked price. Sell price is given; decide profit vs loss.
 * Cost and sell are always integers.
 */
const PRODUCTS = ['一件商品', '一件衣服', '一台家电', '一双运动鞋', '一本书籍'];

const WORDINGS = [
  (ctx) =>
    `${ctx.product}按成本价提高 ${ctx.markup}% 后标价，再打${ctx.foldName}销售，售价为 ${ctx.sell} 元。售出这件商品是盈利还是亏损？盈亏多少元？`,
  (ctx) =>
    `${ctx.product}先加价 ${ctx.markup}% 作为标价，然后按${ctx.foldName}卖出，实际卖了 ${ctx.sell} 元。这笔买卖赚了还是亏了？差多少？`,
  (ctx) =>
    `某店把${ctx.product}的成本提高 ${ctx.markup}% 后标价，又打${ctx.foldName}出售，售价 ${ctx.sell} 元。判断盈亏并求出金额。`,
];

const FOLDS = [
  { fold: 7, name: '七折' },
  { fold: 8, name: '八折' },
  { fold: 9, name: '九折' },
];

function generate() {
  // sell = cost * (100+markup) * fold / 1000 must be integer
  const markup = pickOne([10, 20, 25, 50]);
  const { fold, name: foldName } = pickOne(FOLDS);
  // pick cost as multiple of 1000/gcd(1000, (100+markup)*fold) so sell is integer
  const factor = (100 + markup) * fold;
  const g = gcd(1000, factor);
  const step = 1000 / g;
  const cost = randInt(2, 12) * step;
  const sell = (cost * factor) / 1000;
  const product = pickOne(PRODUCTS);
  const text = pickOne(WORDINGS)({ product, markup, foldName, sell });
  return { cost, sell, markup, fold, foldName, product, text };
}

function gcd(a, b) {
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

function bookProblem() {
  const markup = 20;
  const fold = 8;
  const foldName = '八折';
  const cost = 150;
  const sell = 144;
  const product = '一件商品';
  const text = WORDINGS[0]({ product, markup, foldName, sell });
  return { cost, sell, markup, fold, foldName, product, text };
}

export default function MarkupDiscountSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const { marked, diff, isLoss } = useMemo(() => {
    const markedPrice = (p.cost * (100 + p.markup)) / 100;
    const d = p.sell - p.cost;
    return { marked: markedPrice, diff: d, isLoss: d < 0 };
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
        设成本价为 <b>x</b> 元。标价 = x · (1 + {p.markup}%) = {p.markup === 0 ? 'x' : `${(100 + p.markup) / 100}x`}；
        打{p.foldName}后售价 = 标价 × {p.fold / 10} = {((100 + p.markup) * p.fold) / 1000}x。
      </Typography>
      <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
        {((100 + p.markup) * p.fold) / 1000}x = {p.sell}
      </Typography>
      <Typography sx={{ mb: 1.5 }}>
        解得 x = <AnimatedNumber value={p.cost} /> 元。
      </Typography>

      <Table size="small" sx={{ mb: 1.5, maxWidth: 360 }}>
        <TableHead>
          <TableRow>
            <TableCell>环节</TableCell>
            <TableCell align="right">金额 / 元</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>成本</TableCell>
            <TableCell align="right">{p.cost}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>标价（+{p.markup}%）</TableCell>
            <TableCell align="right">{marked}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>售价（{p.foldName}）</TableCell>
            <TableCell align="right">{p.sell}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>售价 − 成本</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {diff}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Typography sx={{ fontWeight: 700 }}>
        售价 {p.sell} 元与成本 {p.cost} 元相比，
        {isLoss ? '亏损' : diff > 0 ? '盈利' : '不盈不亏'}{' '}
        <AnimatedNumber value={Math.abs(diff)} /> 元。
      </Typography>
    </Box>
  );

  return (
    <ProblemShell
      title="先加价再打折：判断盈亏"
      subtitle="商品、加价百分比、折扣与售价随机生成；成本与售价均为整数"
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={solution}
    >
      <Typography>{p.text}</Typography>
    </ProblemShell>
  );
}
