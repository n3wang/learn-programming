import React from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
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
        <Box>
          <Typography sx={{ mb: 1 }}>
            设 VIP 包厢有 <b>x</b> 个，普通包厢有 <b>y</b> 个。列方程组：
          </Typography>
          <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
            {`{ ${p.capA}x + ${p.capB}y = ${p.people}`}
            <br />
            {`  ${p.priceA}x + ${p.priceB}y = ${p.cost} }`}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            解得 x = <AnimatedNumber value={s.x} />，y = <AnimatedNumber value={s.y} />
            （可用 x + y = {p.total} 检验）。
          </Typography>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            答：VIP 包厢 <AnimatedNumber value={s.x} /> 个，普通包厢 <AnimatedNumber value={s.y} />{' '}
            个。
          </Typography>
          <Typography variant="caption" color="text.secondary">
            验算：{s.x} + {s.y} = {p.total}；人数 {p.people}；收入 {p.cost} ✓
          </Typography>
        </Box>
      )}
    />
  );
}
