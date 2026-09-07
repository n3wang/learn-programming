import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { fmtNum, pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 9：24 min 相遇，李明多行 4.8 km；再 6 min 李明到 B。 */
function bookProblem() {
  return { meetMin: 24, extraKm: 4.8, afterMin: 6 };
}

function generate() {
  for (let i = 0; i < 50; i++) {
    const v2 = pickOne([3, 4, 5, 6]);
    const ratio = pickOne([3, 4, 5]); // v1 = ratio * v2
    const v1 = v2 * ratio;
    const meetMin = pickOne([20, 24, 30, 36]);
    const meetH = meetMin / 60;
    const extraKm = (v1 - v2) * meetH;
    // after meeting: Li covers Liu's distance so far in afterMin
    // v1 * afterH = v2 * meetH → afterH = (v2/v1)*meetH
    const afterH = (v2 / v1) * meetH;
    const afterMin = afterH * 60;
    if (Math.abs(afterMin - Math.round(afterMin)) > 1e-9) continue;
    if (extraKm <= 0) continue;
    // keep one decimal for km
    const extraRounded = Math.round(extraKm * 10) / 10;
    if (Math.abs(extraKm - extraRounded) > 1e-9) continue;
    return { meetMin, extraKm: extraRounded, afterMin: Math.round(afterMin) };
  }
  return bookProblem();
}

function derive(p) {
  const meetH = p.meetMin / 60;
  const afterH = p.afterMin / 60;
  // v1 - v2 = extraKm / meetH
  // v1 * afterH = v2 * meetH  → v1 = v2 * meetH / afterH
  // v2 * meetH/afterH - v2 = extraKm/meetH
  // v2 (meetH/afterH - 1) = extraKm/meetH
  const v2 = p.extraKm / meetH / (p.meetMin / p.afterMin - 1);
  const v1 = v2 * (p.meetMin / p.afterMin);
  const distLi = v1 * meetH;
  const timeLiuAfterH = distLi / v2;
  return {
    v1,
    v2,
    distLi,
    timeLiuAfterH,
    v1Str: fmtNum(v1, 4),
    v2Str: fmtNum(v2, 4),
    afterStr: fmtNum(timeLiuAfterH, 4),
    afterMinStr: fmtNum(timeLiuAfterH * 60, 2),
  };
}

export default function MeetingTravelSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设李明速度为 <MathText text={tex('x')} /> km/h，刘伟速度为{' '}
        <MathText text={tex('y')} /> km/h。相遇时间{' '}
        <MathText text={tex(`${p.meetMin}\\div 60 = ${fmtNum(p.meetMin / 60, 4)}`)} /> h。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        相遇时李明比刘伟多行 <b>{p.extraKm}</b> km：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `${fmtNum(p.meetMin / 60, 4)}(x-y) = ${p.extraKm} \\Rightarrow x-y = ${fmtNum(
                p.extraKm / (p.meetMin / 60),
                4,
              )}`,
            )}
          />
        </div>
        相遇后再过 <b>{p.afterMin}</b> min 李明到达 B 地，这段路程等于刘伟已走的路程：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `${fmtNum(p.afterMin / 60, 4)}x = ${fmtNum(p.meetMin / 60, 4)}y \\Rightarrow x = ${
                p.meetMin / p.afterMin
              }y`,
            )}
          />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        联立得 <MathText text={tex(`y = ${d.v2Str}`)} />，{' '}
        <MathText text={tex(`x = ${d.v1Str}`)} />。相遇后刘伟还需走李明已行的{' '}
        <MathText text={tex(`${fmtNum(d.distLi, 4)}`)} /> km，用时{' '}
        <MathText text={tex(`${d.afterStr}`)} /> h（即 {d.afterMinStr} min）。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          李明 <AnimatedNumber value={Number(d.v1Str)} /> km/h，刘伟{' '}
          <AnimatedNumber value={Number(d.v2Str)} /> km/h；相遇后再过{' '}
          <AnimatedNumber value={Number(d.afterMinStr)} /> min 刘伟到达 A 地。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="行程问题：相向相遇"
      subtitle="多行路程差 + 「相遇后再走完对方已走路程」"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <Typography>
        李明和刘伟分别从 A、B 两地同时出发，李明骑自行车，刘伟步行，沿同一条道路相向匀速而行，出发{' '}
        <b>{p.meetMin}</b> min 后两人相遇。相遇时李明比刘伟多行进 <b>{p.extraKm}</b> km，相遇后{' '}
        <b>{p.afterMin}</b> min 李明到达 B 地。两人每小时分别行进多少千米？相遇后经过多长时间刘伟到达 A
        地？
      </Typography>
    </ProblemShell>
  );
}
