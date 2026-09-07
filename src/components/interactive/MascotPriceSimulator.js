import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a1: 100, b1: 40, s1: 12320, a2: 160, b2: 60, s2: 19360, x: 88, y: 88 };
}

function generate() {
  for (let i = 0; i < 40; i += 1) {
    const x = randInt(6, 16) * 5;
    const y = randInt(6, 16) * 5;
    const a1 = randInt(4, 10) * 10;
    const b1 = randInt(2, 6) * 10;
    const a2 = a1 + randInt(2, 6) * 10;
    const b2 = b1 + randInt(1, 4) * 10;
    if (a1 * b2 === a2 * b1) continue;
    return {
      a1,
      b1,
      s1: a1 * x + b1 * y,
      a2,
      b2,
      s2: a2 * x + b2 * y,
      x,
      y,
    };
  }
  return bookProblem();
}

export default function MascotPriceSimulator() {
  return (
    <TwoVarWordProblemBase
      title="综合运用 8：两种摆件的零售价"
      subtitle="两个月的销量各列一个金额方程"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          第 1 个月售出甲摆件 <b>{p.a1}</b> 件、乙摆件 <b>{p.b1}</b> 件，销售额 <b>{p.s1}</b> 元。
          第 2 个月售出甲 <b>{p.a2}</b> 件、乙 <b>{p.b2}</b> 件，销售额 <b>{p.s2}</b> 元。甲、乙的零售价各是多少？
        </Typography>
      )}
      renderSolution={(p) => (
        <TwoVarSolution
          legendX="甲的零售价（元）"
          legendY="乙的零售价（元）"
          setText={
            <>
              设甲的零售价 <MathText text={texX()} /> 元，乙的零售价 <MathText text={texY()} /> 元。
            </>
          }
          eq1={`${p.a1}x + ${p.b1}y = ${p.s1}`}
          eq2={`${p.a2}x + ${p.b2}y = ${p.s2}`}
          solveText="两个月的销量不成比例，可以先化简，再用加减消元法消去一个未知数。"
          x={p.x}
          y={p.y}
          answer={
            <>
              甲 {p.x} 元/件，乙 {p.y} 元/件。
            </>
          }
          check={
            <>
              {p.a1} × {p.x} + {p.b1} × {p.y} = {p.s1}；{p.a2} × {p.x} + {p.b2} × {p.y} = {p.s2}。
            </>
          }
        />
      )}
    />
  );
}
