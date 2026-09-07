import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const BOOK = {
  prices: [
    { name: 'A', price: 6000 },
    { name: 'B', price: 4000 },
    { name: 'C', price: 2500 },
  ],
  count: 36,
  budget: 100500,
};

function plansOf(p) {
  const out = [];
  const items = p.prices;
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const left = items[i];
      const right = items[j];
      for (let n = 1; n < p.count; n += 1) {
        const cost = left.price * n + right.price * (p.count - n);
        if (cost === p.budget) out.push({ left: left.name, n, right: right.name, m: p.count - n });
      }
    }
  }
  return out;
}

function generate() {
  const prices = [
    { name: 'A', price: randInt(8, 12) * 500 },
    { name: 'B', price: randInt(5, 8) * 500 },
    { name: 'C', price: randInt(3, 6) * 500 },
  ];
  const count = randInt(20, 30);
  const seed = plansOf({
    prices,
    count,
    budget: prices[0].price * 2 + prices[2].price * (count - 2),
  });
  if (seed.length === 0) return BOOK;
  return { prices, count, budget: prices[0].price * 2 + prices[2].price * (count - 2) };
}

export default function ComputerPurchasePlanSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(BOOK);
  const plans = useMemo(() => plansOf(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="想" badgeClass={stepStyles.badgeSet}>
        只买两种型号，共 {p.count} 台，且正好花完 {p.budget} 元。设其中一种买 n 台，另一种就是 {p.count} − n 台，n 从 1 试到 {p.count - 1}。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {plans.length === 0
            ? '没有正好花完的两种型号方案。'
            : `可行方案：${plans.map((plan) => `${plan.left} 型 ${plan.n} 台，${plan.right} 型 ${plan.m} 台`).join('；')}。`}
          其余两种型号的搭配，台数从 1 到 {p.count - 1} 都凑不出这个总价。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="拓广探索 12：两种型号的电脑"
      subtitle="先定买哪两种，再看台数是否正好花完"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(BOOK);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        {p.prices.map((item) => `${item.name} 型每台 ${item.price} 元`).join('，')}。
        现有资金 {p.budget} 元，计划全部用于购进 {p.count} 台两种型号的电脑。可以怎样买？
      </p>
    </ProblemShell>
  );
}
