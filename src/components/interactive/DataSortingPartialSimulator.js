import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 5：1 人 80 h；先 x 人 2 h，再增 5 人 8 h，完成 3/4。 */
function bookProblem() {
  return { H: 80, t1: 2, extra: 5, t2: 8, numer: 3, denom: 4 };
}

function generate() {
  for (let i = 0; i < 50; i++) {
    const x = randInt(2, 8);
    const extra = randInt(3, 8);
    const t1 = pickOne([2, 3, 4]);
    const t2 = pickOne([6, 8, 10]);
    const numer = pickOne([2, 3]);
    const denom = pickOne([3, 4]);
    if (numer >= denom) continue;
    // t1*x + t2*(x+extra) = (numer/denom)*H
    // H = denom * (t1*x + t2*(x+extra)) / numer
    const workPeopleHours = t1 * x + t2 * (x + extra);
    if ((denom * workPeopleHours) % numer !== 0) continue;
    const H = (denom * workPeopleHours) / numer;
    if (H < 40 || H > 200 || !Number.isInteger(H)) continue;
    return { H, t1, extra, t2, numer, denom };
  }
  return bookProblem();
}

function derive(p) {
  // t1 x + t2 (x + extra) = (numer/denom) H
  const right = (p.numer * p.H) / p.denom;
  const x = (right - p.t2 * p.extra) / (p.t1 + p.t2);
  return { x, right };
}

export default function DataSortingPartialSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const fracLabel =
    p.numer === 1 && p.denom === 1 ? '全部' : `${p.numer}/${p.denom}`;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        把总工作量看作 1，一人一小时完成 <MathText text={tex(`\\dfrac{{1}}{${p.H}}`)} />。设先安排{' '}
        <MathText text={tex('x')} /> 人。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        两段工作量之和等于总工作量的 <MathText text={tex(`\\dfrac{${p.numer}}{${p.denom}}`)} />：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\dfrac{${p.t1}x}{${p.H}} + \\dfrac{${p.t2}(x+${p.extra})}{${p.H}} = \\dfrac{${p.numer}}{${p.denom}}`,
            )}
          />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        两边乘 <MathText text={tex(`${p.H}`)} /> 得{' '}
        <MathText text={tex(`${p.t1}x + ${p.t2}(x+${p.extra}) = ${d.right}`)} />，解得{' '}
        <MathText text={tex(`x = ${d.x}`)} />。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          先安排 <AnimatedNumber value={d.x} /> 人整理 {p.t1} h，再增加 {p.extra} 人（共{' '}
          <AnimatedNumber value={d.x + p.extra} /> 人）整理 {p.t2} h。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="工程问题：分段加人完成部分工作"
      subtitle="总工作量看作 1；两段人·时之和等于指定分数"
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
        整理一批数据，由 1 人整理需 <b>{p.H}</b> h 完成。现在计划先由一些人整理 <b>{p.t1}</b> h，再增加{' '}
        <b>{p.extra}</b> 人整理 <b>{p.t2}</b> h，完成这项工作的 <b>{fracLabel}</b>
        。怎样安排参与整理数据的具体人数？
      </Typography>
    </ProblemShell>
  );
}
