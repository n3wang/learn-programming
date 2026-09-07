import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return {
    total: 450,
    out1: 60,
    out2: 40,
    extra: 30,
    x: 240,
    y: 210,
  };
}

function generate() {
  for (let i = 0; i < 40; i += 1) {
    const out1 = pickOne([40, 50, 60]);
    const out2 = pickOne([30, 40, 50]);
    if (out1 === out2) continue;
    const x = randInt(8, 28) * 10;
    const y = randInt(8, 28) * 10;
    const remain1 = ((100 - out1) / 100) * x;
    const remain2 = ((100 - out2) / 100) * y;
    const extra = remain2 - remain1;
    if (extra <= 0 || !Number.isInteger(extra)) continue;
    return { total: x + y, out1, out2, extra, x, y };
  }
  return bookProblem();
}

export default function GrainWarehouseSimulator() {
  return (
    <TwoVarWordProblemBase
      title="复习题 5：两座仓库存粮"
      subtitle="总量一个方程，运出后的剩余差再列一个方程"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          1 号仓库与 2 号仓库共存粮 <b>{p.total}</b> t。现从 1 号仓库运出存粮的 <b>{p.out1}%</b>，从 2 号仓库运出存粮的{' '}
          <b>{p.out2}%</b>，结果 2 号仓库剩余粮食比 1 号仓库剩余粮食多 <b>{p.extra}</b> t。原来各存粮多少吨？
        </Typography>
      )}
      renderSolution={(p) => {
        const r1 = (100 - p.out1) / 100;
        const r2 = (100 - p.out2) / 100;
        return (
          <TwoVarSolution
            legendX="1 号原来存粮（t）"
            legendY="2 号原来存粮（t）"
            setText={
              <>
                设 1 号原来存粮 <MathText text={texX()} /> t，2 号原来存粮 <MathText text={texY()} /> t。
                运出后，1 号剩 <MathText text={`$${r1}x$`} /> t，2 号剩 <MathText text={`$${r2}y$`} /> t。
              </>
            }
            eq1={`x + y = ${p.total}`}
            eq2={`${r2}y - ${r1}x = ${p.extra}`}
            solveText={
              <>
                用代入法：由总量得 <MathText text={texX(` = ${p.total} - y`)} />，代入剩余差的方程，解出{' '}
                <MathText text={texY()} />，再代回求 <MathText text={texX()} />。
              </>
            }
            x={p.x}
            y={p.y}
            answer={
              <>
                1 号原来存粮 {p.x} t，2 号原来存粮 {p.y} t。
              </>
            }
            check={
              <>
                剩余：1 号 {r1} × {p.x} = {r1 * p.x} t，2 号 {r2} × {p.y} = {r2 * p.y} t，差{' '}
                {r2 * p.y - r1 * p.x} t，与题意相符。总量 {p.x} + {p.y} = {p.total} t。
              </>
            }
          />
        );
      }}
    />
  );
}
