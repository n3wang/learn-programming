import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 包厢问题：VIP / 普通 — 容纳人数与售价。
 * 书题目：8x+5y=130, 1200x+600y=18000, x+y=20 → x=10, y=10。
 */
function bookProblem() {
  const capA = 8;
  const capB = 5;
  const priceA = 1200;
  const priceB = 600;
  const x = 10;
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
  const capA = randInt(6, 10);
  const capB = randInt(3, 6);
  const priceA = randInt(8, 15) * 100;
  const priceB = randInt(4, 8) * 100;
  const x = randInt(4, 12);
  const y = randInt(4, 12);
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

export default function VipBoxTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="包厢问题：VIP 与普通"
      subtitle="「总人数」和「总收入」各给出一个方程；总包厢数可检验"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          一个体育场举办比赛，一共售出了 <b>{p.total}</b> 个 VIP 包厢和普通包厢。VIP 包厢每个可以容纳{' '}
          <b>{p.capA}</b> 人，售价为 <b>{p.priceA.toLocaleString('zh-CN')}</b> 元；普通包厢每个可以容纳{' '}
          <b>{p.capB}</b> 人，售价为 <b>{p.priceB}</b> 元。所有包厢一共容纳了 <b>{p.people}</b>{' '}
          人，总收入为 <b>{p.cost.toLocaleString('zh-CN')}</b> 元。
          <br />
          VIP 包厢和普通包厢各有多少个？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <TwoVarSolution
          legendX="VIP 包厢个数"
          legendY="普通包厢个数"
          setText={
            <>
              设 VIP 包厢有 <MathText text={texX()} /> 个，普通包厢有 <MathText text={texY()} /> 个。
            </>
          }
          eq1={`${p.capA}x + ${p.capB}y = ${p.people}`}
          eq2={`${p.priceA}x + ${p.priceB}y = ${p.cost}`}
          solveText={
            <>
              「总人数」和「总收入」各给出一个方程。解完后可用{' '}
              <MathText text={texEq(`x + y = ${p.total}`)} /> 检验。
            </>
          }
          x={s.x}
          y={s.y}
          answer={
            <>
              VIP 包厢 <AnimatedNumber value={s.x} /> 个，普通包厢 <AnimatedNumber value={s.y} /> 个。
            </>
          }
          check={
            <MathText
              text={`验算：${texEq(`${s.x}+${s.y}=${p.total}`)}；人数 ${texEq(
                String(p.people),
              )}；收入 ${texEq(String(p.cost))} ✓`}
            />
          }
        />
      )}
    />
  );
}
