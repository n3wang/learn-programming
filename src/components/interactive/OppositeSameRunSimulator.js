import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texX, texY } from '@site/src/components/interactive/shell/texMath';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { opp: 2, same: 6, x: 3, y: 6 };
}

function generate() {
  const pairs = [
    [3, 6],
    [4, 12],
    [4, 6],
    [5, 20],
    [6, 12],
    [6, 10],
  ];
  const [x, y] = pickOne(pairs);
  const opp = (x * y) / (x + y);
  const same = (x * y) / (y - x);
  return { opp, same, x, y };
}

export default function OppositeSameRunSimulator() {
  return (
    <TwoVarWordProblemBase
      title="综合运用 9：环形路反向与同向"
      subtitle="速度用「每分钟跑几圈」来设，相加、相减各列一式"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          甲、乙以不变的速度在环形路上跑。同时同地出发，反向每隔 <b>{p.opp}</b> min 相遇一次；同向每隔{' '}
          <b>{p.same}</b> min 相遇一次。甲比乙快。两人跑一圈各要多少分钟？
        </Typography>
      )}
      renderSolution={(p) => (
        <TwoVarSolution
          legendX="甲跑一圈的时间（min）"
          legendY="乙跑一圈的时间（min）"
          setText={
            <>
              设甲跑一圈要 <MathText text={texX()} /> min，乙要 <MathText text={texY()} /> min。
              那么甲每分钟跑 1/x 圈，乙每分钟跑 1/y 圈。
            </>
          }
          eq1={`\\dfrac{1}{x} + \\dfrac{1}{y} = \\dfrac{1}{${p.opp}}`}
          eq2={`\\dfrac{1}{x} - \\dfrac{1}{y} = \\dfrac{1}{${p.same}}`}
          solveText={
            <>
              两式相加得甲的速度，相减得乙的速度。反向是速度相加，同向是速度相减。
            </>
          }
          x={p.x}
          y={p.y}
          answer={
            <>
              甲跑一圈要 {p.x} min，乙跑一圈要 {p.y} min。
            </>
          }
          check={
            <>
              反向相对速度 1/{p.x} + 1/{p.y} = 1/{p.opp} 圈/min，所以每隔 {p.opp} min 相遇。
              同向 1/{p.x} − 1/{p.y} = 1/{p.same} 圈/min，所以每隔 {p.same} min 相遇。
            </>
          }
        />
      )}
    />
  );
}
