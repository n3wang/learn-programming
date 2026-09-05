import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 稍难：篮球队 / 排球队 — 没有「总支数」方程，只用报名费与运动员人数。
 * 书题目：600x+800y=8800, 12x+18y=186 → x=8, y=5
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

function simplifyHint(feeA, feeB, fees, perA, perB, athletes) {
  // Show a reduced form when both equations share a common factor (book: 600/800/8800 → 3/4/44)
  const g1 = gcd3(feeA, feeB, fees);
  const g2 = gcd3(perA, perB, athletes);
  if (g1 <= 1 && g2 <= 1) {
    return (
      <>
        题目没有「一共几支队」，所以不能写 <MathText text={texEq('x + y = \\cdots')} />
        。两个方程都是加权和，适合用加减消元法。
      </>
    );
  }
  const parts = [];
  if (g1 > 1) {
    parts.push(
      <MathText
        key="f"
        text={texEq(
          `${feeA / g1}x + ${feeB / g1}y = ${fees / g1}`,
        )}
      />,
    );
  }
  if (g2 > 1) {
    parts.push(
      <MathText
        key="a"
        text={texEq(
          `${perA / g2}x + ${perB / g2}y = ${athletes / g2}`,
        )}
      />,
    );
  }
  return (
    <>
      题目没有「一共几支队」，所以不能写 <MathText text={texEq('x + y = \\cdots')} />
      。可先两边约分
      {g1 > 1 ? <>（报名费方程 ÷ {g1}）</> : null}
      {g2 > 1 ? <>（人数方程 ÷ {g2}）</> : null}
      得 {parts.reduce((acc, el, i) => (i === 0 ? [el] : [...acc, '，', el]), [])}，再用加减消元法。
    </>
  );
}

function gcd3(a, b, c) {
  return gcd(gcd(a, b), c);
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
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
        <TwoVarSolution
          legendX="篮球队支数"
          legendY="排球队支数"
          setText={
            <>
              设篮球队 <MathText text={texX()} /> 支，排球队 <MathText text={texY()} /> 支。
            </>
          }
          eq1={`${p.feeA}x + ${p.feeB}y = ${p.fees}`}
          eq2={`${p.perA}x + ${p.perB}y = ${p.athletes}`}
          solveText={simplifyHint(p.feeA, p.feeB, p.fees, p.perA, p.perB, p.athletes)}
          x={s.x}
          y={s.y}
          answer={
            <>
              篮球队 <AnimatedNumber value={s.x} /> 支，排球队 <AnimatedNumber value={s.y} /> 支。
            </>
          }
          check={
            <MathText
              text={`验算：报名费 ${texEq(
                `${p.feeA}\\times ${s.x}+${p.feeB}\\times ${s.y}=${p.fees}`,
              )}；运动员 ${texEq(
                `${p.perA}\\times ${s.x}+${p.perB}\\times ${s.y}=${p.athletes}`,
              )} ✓`}
            />
          }
        />
      )}
    />
  );
}
