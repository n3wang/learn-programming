import React from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 旅行社租车：大巴 / 小巴。
 * 书题目：40x+20y=520, 1500x+900y=21600 → x=6, y=14（共 20 辆）。
 */
function bookProblem() {
  const capA = 40;
  const capB = 20;
  const priceA = 1500;
  const priceB = 900;
  const x = 6;
  const y = 14;
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
  const capA = randInt(6, 10) * 5;
  const capB = randInt(3, 5) * 5;
  const priceA = randInt(10, 18) * 100;
  const priceB = randInt(6, 12) * 100;
  const x = randInt(4, 10);
  const y = randInt(6, 16);
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

export default function TourBusTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="旅行社租车：大巴与小巴"
      subtitle="人数方程 + 收费方程；总辆数作检验"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          旅行社组织旅游，一共安排了 <b>{p.total}</b> 辆大巴车和小巴车。大巴车每辆可以乘坐{' '}
          <b>{p.capA}</b> 人，每辆收费 <b>{p.priceA.toLocaleString('zh-CN')}</b> 元；小巴车每辆可以乘坐{' '}
          <b>{p.capB}</b> 人，每辆收费 <b>{p.priceB}</b> 元。所有车辆一共乘坐了 <b>{p.people}</b>{' '}
          人，旅行社一共收取了 <b>{p.cost.toLocaleString('zh-CN')}</b> 元。
          <br />
          大巴车和小巴车各有多少辆？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <Box>
          <Typography sx={{ mb: 1 }}>
            设大巴车 <b>x</b> 辆，小巴车 <b>y</b> 辆：
          </Typography>
          <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
            {`{ ${p.capA}x + ${p.capB}y = ${p.people}`}
            <br />
            {`  ${p.priceA}x + ${p.priceB}y = ${p.cost} }`}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            解得 x = <AnimatedNumber value={s.x} />，y = <AnimatedNumber value={s.y} />。
          </Typography>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            答：大巴车 <AnimatedNumber value={s.x} /> 辆，小巴车 <AnimatedNumber value={s.y} /> 辆。
          </Typography>
          <Typography variant="caption" color="text.secondary">
            验算：{s.x} + {s.y} = {p.total}；人数 {p.people}；收费 {p.cost} ✓
          </Typography>
        </Box>
      )}
    />
  );
}
