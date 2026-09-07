import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { priceX: 5, priceY: 3, total: 19, x: 2, y: 3 };
}

function generate() {
  for (let i = 0; i < 40; i += 1) {
    const priceX = randInt(4, 8);
    const priceY = randInt(2, 5);
    if (priceX === priceY) continue;
    const x = randInt(1, 5);
    const y = randInt(1, 6);
    const total = priceX * x + priceY * y;
    let ways = 0;
    for (let a = 0; a * priceX <= total; a += 1) {
      if ((total - a * priceX) % priceY === 0) ways += 1;
    }
    if (ways !== 1) continue;
    return { priceX, priceY, total, x, y };
  }
  return bookProblem();
}

export default function MarkerPenBuySimulator() {
  return (
    <TwoVarWordProblemBase
      title="综合运用 6：记号笔和中性笔"
      subtitle="只有一个金额方程，还要支数是非负整数"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          花 <b>{p.total}</b> 元买了若干支记号笔和中性笔。记号笔 <b>{p.priceX}</b> 元/支，中性笔{' '}
          <b>{p.priceY}</b> 元/支。各买了多少支？
        </Typography>
      )}
      renderSolution={(p) => (
        <TwoVarSolution
          legendX="记号笔（支）"
          legendY="中性笔（支）"
          setText={
            <>
              设记号笔 <MathText text={texX()} /> 支，中性笔 <MathText text={texY()} /> 支。
              题目只给出金额，没有再给总支数，所以还要求 <MathText text={texX()} />、
              <MathText text={texY()} /> 是非负整数。
            </>
          }
          eq1={`${p.priceX}x + ${p.priceY}y = ${p.total}`}
          eq2="x, y 为非负整数"
          solveText={
            <>
              {p.priceX}x 不超过 {p.total}，所以 x 只能取 0 到 {Math.floor(p.total / p.priceX)}。
              逐个试，只有 {p.x} 支记号笔时，剩下 {p.total - p.priceX * p.x} 元正好是 {p.priceY} 的倍数。
            </>
          }
          x={p.x}
          y={p.y}
          answer={
            <>
              记号笔 {p.x} 支，中性笔 {p.y} 支。
            </>
          }
          check={
            <>
              {p.priceX} × {p.x} + {p.priceY} × {p.y} = {p.priceX * p.x + p.priceY * p.y} 元，与所花金额相同。
            </>
          }
        />
      )}
    />
  );
}
