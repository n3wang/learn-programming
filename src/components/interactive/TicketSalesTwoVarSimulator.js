import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 影院包场：成人票 / 学生票 — 总张数 + 总收入。
 * 书题目：x+y=30, 50x+30y=1140 → x=12, y=18。
 */
function bookProblem() {
  const priceA = 50;
  const priceB = 30;
  const x = 12;
  const y = 18;
  return {
    priceA,
    priceB,
    x,
    y,
    total: x + y,
    cost: priceA * x + priceB * y,
  };
}

function generate() {
  const priceA = randInt(4, 8) * 10;
  const priceB = randInt(2, 5) * 10;
  const x = randInt(8, 25);
  const y = randInt(8, 25);
  return {
    priceA,
    priceB,
    x,
    y,
    total: x + y,
    cost: priceA * x + priceB * y,
  };
}

export default function TicketSalesTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="影院包场：成人票与学生票"
      subtitle="「总张数」和「总收入」——最常见的二元一次应用题骨架"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          电影院为学校包场，一共售出了 <b>{p.total}</b> 张成人票和学生票。每张成人票{' '}
          <b>{p.priceA}</b> 元，每张学生票 <b>{p.priceB}</b> 元。总收入为{' '}
          <b>{p.cost.toLocaleString('zh-CN')}</b> 元。
          <br />
          成人票和学生票各售出了多少张？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <TwoVarSolution
          legendX="成人票张数"
          legendY="学生票张数"
          setText={
            <>
              设成人票售出 <MathText text={texX()} /> 张，学生票售出 <MathText text={texY()} /> 张。
            </>
          }
          eq1={`x + y = ${p.total}`}
          eq2={`${p.priceA}x + ${p.priceB}y = ${p.cost}`}
          solveText={
            <>
              由第一个方程得 <MathText text={texEq(`y = ${p.total} - x`)} />，代入第二个方程：
              <div style={{ marginTop: '0.35rem' }}>
                <MathText text={texEq(`${p.priceA}x + ${p.priceB}(${p.total} - x) = ${p.cost}`)} />
              </div>
              这是典型的「总数 + 金额」骨架，代入法很顺手。
            </>
          }
          x={s.x}
          y={s.y}
          answer={
            <>
              成人票 <AnimatedNumber value={s.x} /> 张，学生票 <AnimatedNumber value={s.y} /> 张。
            </>
          }
          check={
            <MathText
              text={`验算：${texEq(`${s.x}+${s.y}=${p.total}`)}；收入 ${texEq(
                `${p.priceA}\\times ${s.x}+${p.priceB}\\times ${s.y}=${p.cost}`,
              )} ✓`}
            />
          }
        />
      )}
    />
  );
}
