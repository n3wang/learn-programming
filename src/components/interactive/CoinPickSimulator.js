import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { stock: 10, take: 15, yuan: 7, a: 5, b: 7, c: 3 };
}

function solutions(p) {
  const found = [];
  for (let c = 0; c <= p.stock; c += 1) {
    for (let b = 0; b <= p.stock; b += 1) {
      const a = p.take - b - c;
      if (a < 0 || a > p.stock) continue;
      const value = a * 0.1 + b * 0.5 + c;
      if (Math.abs(value - p.yuan) < 1e-8) found.push({ a, b, c });
    }
  }
  return found;
}

function generate() {
  for (let i = 0; i < 40; i += 1) {
    const stock = 10;
    const a = randInt(1, 8);
    const b = randInt(2, 8);
    const c = randInt(1, 6);
    const take = a + b + c;
    if (take < 8 || take > 20) continue;
    const yuan = Number((a * 0.1 + b * 0.5 + c).toFixed(1));
    const p = { stock, take, yuan, a, b, c };
    if (solutions(p).length !== 1) continue;
    return p;
  }
  return bookProblem();
}

export default function CoinPickSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const found = useMemo(() => solutions(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设取出 1 角 a 枚、5 角 b 枚、1 元 c 枚。则 a + b + c = {p.take}，0.1a + 0.5b + c = {p.yuan}，且 0 ≤ a, b, c ≤ {p.stock}。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          金额方程乘 10：a + 5b + 10c = {p.yuan * 10}。用 a = {p.take} − b − c 代入，得到 4b + 9c 为定值。
          在不超过 {p.stock} 枚的范围内试 c，只有一组整数解：1 角 {p.a} 枚，5 角 {p.b} 枚，1 元 {p.c} 枚。
          共找到 {found.length} 组。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="拓广探索 11：取出硬币"
      subtitle="两个方程，再加每种不超过库存，求非负整数解"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        现有 1 角、5 角、1 元硬币各 {p.stock} 枚。从中取出 {p.take} 枚，共值 {p.yuan} 元。三种硬币各取出多少枚？
      </p>
    </ProblemShell>
  );
}
