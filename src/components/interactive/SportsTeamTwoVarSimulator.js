import React from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 稍难：篮球队 / 排球队 — 没有「总支数」方程，只用报名费与运动员人数。
 * 书题目：600x+800y=8800, 12x+18y=186 → x=8, y=5
 * （原草稿运动员总数 198 会迫使 x=0，已改为与 8800 相容的 186。）
 */
function bookProblem() {
  const perA = 12;
  const perB = 18;
  const feeA = 600;
  const feeB = 800;
  const x = 8;
  const y = 5;
  return {
    perA,
    perB,
    feeA,
    feeB,
    x,
    y,
    athletes: perA * x + perB * y,
    fees: feeA * x + feeB * y,
  };
}

function generate() {
  const perA = randInt(8, 14);
  const perB = randInt(12, 20);
  const feeA = randInt(4, 8) * 100;
  const feeB = randInt(6, 12) * 100;
  // keep coefficients independent
  if (perA * feeB === perB * feeA) {
    return generate();
  }
  const x = randInt(3, 10);
  const y = randInt(3, 10);
  return {
    perA,
    perB,
    feeA,
    feeB,
    x,
    y,
    athletes: perA * x + perB * y,
    fees: feeA * x + feeB * y,
  };
}

export default function SportsTeamTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="运动会报名：篮球队与排球队"
      subtitle="稍难：题目不给「一共几支队」，两个加权方程直接联立"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <Typography>
          学校举办运动会，邀请了篮球队和排球队参加。每支篮球队有 <b>{p.perA}</b>{' '}
          名运动员，报名费为 <b>{p.feeA}</b> 元；每支排球队有 <b>{p.perB}</b> 名运动员，报名费为{' '}
          <b>{p.feeB}</b> 元。一共收到了 <b>{p.fees.toLocaleString('zh-CN')}</b> 元报名费，共有{' '}
          <b>{p.athletes}</b> 名运动员参加。
          <br />
          篮球队和排球队各有多少支？
        </Typography>
      )}
      renderSolution={(p, s) => (
        <Box>
          <Typography sx={{ mb: 1 }}>
            题目没有直接给出总支数，所以不能写 x + y = …。设篮球队 <b>x</b> 支，排球队{' '}
            <b>y</b> 支，根据报名费和运动员人数列方程组：
          </Typography>
          <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
            {`{ ${p.feeA}x + ${p.feeB}y = ${p.fees}`}
            <br />
            {`  ${p.perA}x + ${p.perB}y = ${p.athletes} }`}
          </Typography>
          <Typography sx={{ mb: 1 }}>
            可先两边约分化简，再用加减消元法。解得 x = <AnimatedNumber value={s.x} />，y ={' '}
            <AnimatedNumber value={s.y} />。
          </Typography>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            答：篮球队 <AnimatedNumber value={s.x} /> 支，排球队 <AnimatedNumber value={s.y} /> 支。
          </Typography>
          <Typography variant="caption" color="text.secondary">
            验算：报名费 {p.feeA}×{s.x} + {p.feeB}×{s.y} = {p.fees}；运动员 {p.perA}×{s.x} +{' '}
            {p.perB}×{s.y} = {p.athletes} ✓
          </Typography>
        </Box>
      )}
    />
  );
}
