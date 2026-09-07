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

/** 书题 4：甲 7.5 h，乙 5 h；先一起 1 h，再乙单独完成。 */
function bookProblem() {
  return { hoursA: 7.5, hoursB: 5, together: 1 };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const hoursA = pickOne([6, 7.5, 8, 10, 12]);
    const hoursB = pickOne([4, 5, 6, 8]);
    if (hoursB >= hoursA) continue;
    const together = pickOne([1, 1.5, 2]);
    const done = together * (1 / hoursA + 1 / hoursB);
    if (done >= 1) continue;
    const remain = 1 - done;
    const aloneB = remain * hoursB;
    // Prefer answers that are multiples of 0.5
    if (Math.abs(aloneB * 2 - Math.round(aloneB * 2)) > 1e-9) continue;
    const total = together + aloneB;
    if (total > 20) continue;
    return { hoursA, hoursB, together };
  }
  return bookProblem();
}

function derive(p) {
  const rateSum = 1 / p.hoursA + 1 / p.hoursB;
  const done = p.together * rateSum;
  const remain = 1 - done;
  const aloneB = remain * p.hoursB;
  const total = p.together + aloneB;
  return {
    done,
    remain,
    aloneB,
    total,
    doneStr: fmtNum(done, 4),
    remainStr: fmtNum(remain, 4),
    aloneStr: fmtNum(aloneB, 4),
    totalStr: fmtNum(total, 4),
  };
}

export default function TwoPersonWorkRemainderSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="效" badgeClass={stepStyles.badgeSet}>
        把总工作量看作 1。甲每小时完成 <MathText text={tex(`\\dfrac{{1}}{${p.hoursA}}`)} />，乙每小时完成{' '}
        <MathText text={tex(`\\dfrac{{1}}{${p.hoursB}}`)} />。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        两人一起工作 <b>{p.together}</b> h 完成：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `${p.together}\\left(\\dfrac{{1}}{${p.hoursA}}+\\dfrac{{1}}{${p.hoursB}}\\right) = ${d.doneStr}`,
            )}
          />
        </div>
        剩余 <MathText text={tex(`${d.remainStr}`)} />，由乙单独完成需{' '}
        <MathText text={tex(`${d.remainStr}\\div \\dfrac{{1}}{${p.hoursB}} = ${d.aloneStr}`)} /> h。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          一共需要 <AnimatedNumber value={Number(d.totalStr)} /> h（
          {p.together} + {d.aloneStr}）。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="工程问题：先合做再单做"
      subtitle="先算合做完成的分量，剩余用乙的效率去除"
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
        某项工作由甲、乙两人单独做分别需要 <b>{p.hoursA}</b> h 和 <b>{p.hoursB}</b> h。如果让甲、乙两人一起工作{' '}
        <b>{p.together}</b> h，再由乙单独完成剩余部分，一共需要多长时间？
      </Typography>
    </ProblemShell>
  );
}
