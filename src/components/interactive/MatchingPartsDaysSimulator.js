import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 3：甲 500/天，乙 250/天，共 30 天，1 甲 + 1 乙成套。 */
function bookProblem() {
  return { rateA: 500, rateB: 250, days: 30 };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const rateB = pickOne([100, 200, 250, 300]);
    const rateA = rateB * pickOne([2, 3, 4]);
    const days = pickOne([20, 24, 30, 36]);
    // daysA = rateB * days / (rateA + rateB)
    const den = rateA + rateB;
    if ((rateB * days) % den !== 0) continue;
    const daysA = (rateB * days) / den;
    if (!Number.isInteger(daysA) || daysA <= 0 || daysA >= days) continue;
    return { rateA, rateB, days };
  }
  return bookProblem();
}

function derive(p) {
  const daysA = (p.rateB * p.days) / (p.rateA + p.rateB);
  const daysB = p.days - daysA;
  const sets = p.rateA * daysA;
  return { daysA, daysB, sets };
}

export default function MatchingPartsDaysSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设制作甲种零件 <MathText text={tex('x')} /> 天，则制作乙种零件{' '}
        <MathText text={tex(`${p.days} - x`)} /> 天。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        成套最多时甲、乙零件个数相等：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${p.rateA}x = ${p.rateB}(${p.days} - x)`)} />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        解得 <MathText text={tex(`x = ${d.daysA}`)} />，乙种零件做{' '}
        <MathText text={tex(`${d.daysB}`)} /> 天。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          甲种零件做 <AnimatedNumber value={d.daysA} /> 天，乙种零件做{' '}
          <AnimatedNumber value={d.daysB} /> 天，可成套{' '}
          <AnimatedNumber value={d.sets} /> 套。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="配套生产：甲乙零件天数"
      subtitle="同一天只能做一种；天数之和固定，件数要相等"
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
        某车间每天能制作 <b>{p.rateA}</b> 个甲种零件，或 <b>{p.rateB}</b> 个乙种零件（同一天内不能同时制作这两种零件）。甲、乙两种零件各 1 个配成 1
        套产品。现要用 <b>{p.days}</b> 天制作最多的成套产品，甲、乙两种零件各应制作多少天？
      </Typography>
    </ProblemShell>
  );
}
