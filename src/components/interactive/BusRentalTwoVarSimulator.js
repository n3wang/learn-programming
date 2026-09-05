import React from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
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
        <Box>
          <Typography sx={{ mb: 1 }}>
            设大巴车租了 <b>x</b> 辆，小巴车租了 <b>y</b> 辆。根据总人数和总租金列方程组：
          </Typography>
          <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
            {`{ ${p.capA}x + ${p.capB}y = ${p.people}`}
            <br />
            {`  ${p.priceA}x + ${p.priceB}y = ${p.cost} }`}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            也可用总辆数 <b>{p.total}</b> 与其中一个方程联立。用加减消元法（或代入法）解得 x ={' '}
            <AnimatedNumber value={s.x} />，y = <AnimatedNumber value={s.y} />。
          </Typography>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            答：大巴车 <AnimatedNumber value={s.x} /> 辆，小巴车 <AnimatedNumber value={s.y} /> 辆。
          </Typography>
          <Typography variant="caption" color="text.secondary">
            验算：辆数 {s.x} + {s.y} = {p.total}；人数 {p.capA}×{s.x} + {p.capB}×{s.y} ={' '}
            {p.people}；租金 {p.priceA}×{s.x} + {p.priceB}×{s.y} = {p.cost} ✓
          </Typography>
        </Box>
      )}
    />
  );
}
