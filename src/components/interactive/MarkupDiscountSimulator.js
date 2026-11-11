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
import { numberField, choiceField } from '@site/src/components/interactive/shell/practiceFields';
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
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([
    choiceField("pl", "盈利还是亏损？", ["盈利", "亏损", "不盈不亏"], p.sell > p.cost ? "盈利" : p.sell < p.cost ? "亏损" : "不盈不亏"),
    numberField("amt", "盈亏的钱数（元）", Math.abs(p.sell - p.cost), "\\text{金额}"),
  ]);

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

  const k = ((100 + p.markup) * p.fold) / 1000;
  const solution = (
    <Solution legend={[[BLUE, '已知'], [ORANGE, '成本'], [diff >= 0 ? GREEN : RED, diff >= 0 ? '盈利' : '亏损']]}>
      <Step b="知" kind="set">
        要判断盈亏，得先知道<b>成本</b>：
        <EqBox
          lines={[
            '\\text{标价} = \\text{成本} \\times (1 + \\text{加价率})',
            '\\text{售价} = \\text{标价} \\times \\text{折扣}\\quad(\\text{打八折就是} \\times 0.8)',
          ]}
        />
      </Step>
      <Step b="设" kind="set">
        设成本为 <M t="x" /> 元，则标价 <M t={`x(1 + ${c(BLUE, `${p.markup}\\%`)}) = ${(100 + p.markup) / 100}x`} />，打{p.foldName}后售价{' '}
        <M t={`${(100 + p.markup) / 100}x \\times ${c(BLUE, p.fold / 10)} = ${k}x`} />。
      </Step>
      <Step b="列" kind="list">
        <EqBox lines={[`${k}x = ${c(BLUE, p.sell)}`]} />
      </Step>
      <Step b="解" kind="solve">
        <EqBox
          lines={[
            `x = ${p.sell} \\div ${k} = ${c(ORANGE, p.cost)}`,
            `\\text{售价} - \\text{成本} = ${p.sell} - ${p.cost} = ${c(diff >= 0 ? GREEN : RED, diff)}`,
          ]}
        />
        {diff > 0 ? '差是正数，盈利。' : diff < 0 ? '差是负数，亏损——先加价再打折，不一定赚钱。' : '差为 0，不盈不亏。'}
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {diff > 0 ? `盈利 ${diff} 元。` : diff < 0 ? `亏损 ${-diff} 元。` : '不盈不亏。'}（成本 {p.cost} 元，标价 {marked} 元，售价 {p.sell} 元）
        </Answer>
      </Step>
    </Solution>
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
