import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题：3A+2B=450，A=B+25 → A=100，B=75。 */
function bookProblem() {
  return { nA: 3, nB: 2, total: 450, more: 25, x: 100, y: 75 };
}

function generate() {
  const more = randInt(2, 6) * 5;
  const y = randInt(4, 12) * 5;
  const x = y + more;
  const nA = randInt(2, 5);
  const nB = randInt(2, 5);
  return {
    nA,
    nB,
    total: nA * x + nB * y,
    more,
    x,
    y,
  };
}

export default function RobotHaulTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="A / B 型机器人搬运量"
      subtitle="台数加权和 +「每台 A 比 B 多」——代入法很顺手"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          港口用 A、B 两种机器人搬运货物。在 24 h 内，<b>{p.nA}</b> 台 A 型和 <b>{p.nB}</b> 台 B
          型共搬运 <b>{p.total}</b> t，且每台 A 型比每台 B 型多搬运 <b>{p.more}</b> t。每台 A 型和每台 B
          型 24 h 的搬运量分别是多少？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <TwoVarSolution
          legendX="每台 A 搬运量（t）"
          legendY="每台 B 搬运量（t）"
          setText={
            <>
              设每台 A 搬运 <MathText text={texX()} /> t，每台 B 搬运 <MathText text={texY()} /> t。
            </>
          }
          eq1={`${p.nA}x + ${p.nB}y = ${p.total}`}
          eq2={`x = y + ${p.more}`}
          solveText={
            <>
              把 <MathText text={texEq(`x=y+${p.more}`)} /> 代入第一个方程即可。
            </>
          }
          x={s.x}
          y={s.y}
          answer={
            <>
              每台 A <AnimatedNumber value={s.x} /> t，每台 B <AnimatedNumber value={s.y} /> t。
            </>
          }
          check={
            <MathText
              text={`验算：${texEq(
                `${p.nA}\\times ${s.x}+${p.nB}\\times ${s.y}=${p.total}`,
              )}；${texEq(`${s.x}-${s.y}=${p.more}`)} ✓`}
            />
          }
        />
      )}
    />
  );
}
