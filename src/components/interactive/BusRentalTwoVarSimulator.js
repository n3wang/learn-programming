import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 租车问题：大巴 / 小巴 — 人数与租金两个方程（书题目另给总辆数作检验）。
 * 书题目：45x+25y=430, 800x+500y=8200 → x=4, y=10（共 14 辆）。
 */
function bookProblem() {
  const capA = 45;
  const capB = 25;
  const priceA = 800;
  const priceB = 500;
  const x = 4;
  const y = 10;
  return {
    capA,
    capB,
    priceA,
    priceB,
    x,
    y,
    total: x + y,
    people: capA * x + capB * y,
    cost: priceA * x + priceB * y,
  };
}

function generate() {
  const capA = randInt(8, 12) * 5;
  const capB = randInt(4, 7) * 5;
  const priceA = randInt(6, 12) * 100;
  const priceB = randInt(3, 7) * 100;
  const x = randInt(3, 10);
  const y = randInt(3, 12);
  return {
    capA,
    capB,
    priceA,
    priceB,
    x,
    y,
    total: x + y,
    people: capA * x + capB * y,
    cost: priceA * x + priceB * y,
  };
}

export default function BusRentalTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="租车问题：大巴与小巴"
      subtitle="用「总人数」和「总租金」列二元一次方程组；总辆数可用来检验"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          学校举行一次校外活动，一共租用了 <b>{p.total}</b> 辆大巴车和小巴车。大巴车每辆可以乘坐{' '}
          <b>{p.capA}</b> 人，租金为 <b>{p.priceA}</b> 元；小巴车每辆可以乘坐 <b>{p.capB}</b>{' '}
          人，租金为 <b>{p.priceB}</b> 元。所有车辆一共乘坐了 <b>{p.people}</b> 名学生，租车费用一共是{' '}
          <b>{p.cost.toLocaleString('zh-CN')}</b> 元。
          <br />
          大巴车和小巴车各租了多少辆？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <TwoVarSolution
          legendX="大巴辆数"
          legendY="小巴辆数"
          setText={
            <>
              设大巴车租了 <MathText text={texX()} /> 辆，小巴车租了 <MathText text={texY()} /> 辆。
            </>
          }
          eq1={`${p.capA}x + ${p.capB}y = ${p.people}`}
          eq2={`${p.priceA}x + ${p.priceB}y = ${p.cost}`}
          solveText={
            <>
              第一个方程来自「总人数」，第二个来自「总租金」。也可用总辆数 <b>{p.total}</b>
              （即 <MathText text={texEq(`x + y = ${p.total}`)} />）与其中一个方程联立。用加减消元法或代入法求解。
            </>
          }
          x={s.x}
          y={s.y}
          answer={
            <>
              大巴车 <AnimatedNumber value={s.x} /> 辆，小巴车 <AnimatedNumber value={s.y} /> 辆。
            </>
          }
          check={
            <MathText
              text={`验算：辆数 ${texEq(`${s.x}+${s.y}=${p.total}`)}；人数 ${texEq(
                `${p.capA}\\times ${s.x}+${p.capB}\\times ${s.y}=${p.people}`,
              )}；租金 ${texEq(
                `${p.priceA}\\times ${s.x}+${p.priceB}\\times ${s.y}=${p.cost}`,
              )} ✓`}
            />
          }
        />
      )}
    />
  );
}
