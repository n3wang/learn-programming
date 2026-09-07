import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/**
 * 书题 11：甲 4 人，总工作量 = 4×定额 + 20；乙 5 人，总 = 6×定额 − 20。
 * (1) 人均实际相等 → 定额 45
 * (2) 甲人均比乙多 2 → 35
 * (3) 甲人均比乙少 2 → 55
 */
function bookProblem() {
  return {
    nA: 4,
    nB: 5,
    multA: 4,
    multB: 6,
    extraA: 20,
    extraB: 20,
    // extraA is "+ extraA", extraB is "− extraB"
    diff: 2,
  };
}

function generate() {
  for (let i = 0; i < 50; i++) {
    const nA = pickOne([3, 4, 5]);
    const nB = pickOne([4, 5, 6]);
    if (nA === nB) continue;
    const multA = nA;
    const multB = nB + pickOne([1, 2]);
    const extra = pickOne([10, 20, 30]);
    const diff = pickOne([2, 3, 4]);
    // (1) (multA*q + extra)/nA = (multB*q - extra)/nB
    // nB(multA q + extra) = nA(multB q - extra)
    // nB*multA*q - nA*multB*q = -nA*extra - nB*extra
    // q*(nB*multA - nA*multB) = -extra(nA+nB)
    const coef1 = nB * multA - nA * multB;
    if (coef1 === 0) continue;
    const q1 = (-extra * (nA + nB)) / coef1;
    if (!Number.isInteger(q1) || q1 <= 0) continue;

    // (2) A avg = B avg + diff
    // nB(multA q + extra) = nA(multB q - extra) + nA*nB*diff
    const right2 = -extra * (nA + nB) + nA * nB * diff;
    // Wait: nB(multA q + extra) - nA(multB q - extra) = nA nB diff
    // q*coef1 + extra*nB + extra*nA = nA nB diff
    // q*coef1 = nA nB diff - extra(nA+nB)
    const q2 = (nA * nB * diff - extra * (nA + nB)) / coef1;
    if (!Number.isInteger(q2) || q2 <= 0) continue;

    // (3) A avg = B avg - diff
    // q*coef1 = -nA nB diff - extra(nA+nB)
    const q3 = (-nA * nB * diff - extra * (nA + nB)) / coef1;
    if (!Number.isInteger(q3) || q3 <= 0) continue;

    const avgA1 = (multA * q1 + extra) / nA;
    const avgB1 = (multB * q1 - extra) / nB;
    const avgA2 = (multA * q2 + extra) / nA;
    const avgB2 = (multB * q2 - extra) / nB;
    const avgA3 = (multA * q3 + extra) / nA;
    const avgB3 = (multB * q3 - extra) / nB;
    if ([avgA1, avgB1, avgA2, avgB2, avgA3, avgB3].some((v) => v <= 0)) continue;

    return {
      nA,
      nB,
      multA,
      multB,
      extraA: extra,
      extraB: extra,
      diff,
    };
  }
  return bookProblem();
}

function solveQuota(p, mode) {
  // mode: 0 equal, +1 A more by diff, -1 A less by diff
  const { nA, nB, multA, multB, extraA, extraB, diff } = p;
  const coef = nB * multA - nA * multB;
  // nB(multA q + extraA) - nA(multB q - extraB) = nA nB * (mode * diff)
  // q*coef + nB*extraA + nA*extraB = nA nB * mode * diff
  const q =
    (nA * nB * mode * diff - nB * extraA - nA * extraB) / coef;
  const avgA = (multA * q + extraA) / nA;
  const avgB = (multB * q - extraB) / nB;
  return { q, avgA, avgB };
}

function derive(p) {
  return {
    eq: solveQuota(p, 0),
    more: solveQuota(p, 1),
    less: solveQuota(p, -1),
  };
}

export default function WorkerQuotaCompareSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设此月人均定额为 <MathText text={tex('x')} /> 件。则甲组总工作量{' '}
        <MathText text={tex(`${p.multA}x + ${p.extraA}`)} />，乙组总工作量{' '}
        <MathText text={tex(`${p.multB}x - ${p.extraB}`)} />。
        甲组人均实际 <MathText text={tex(`\\dfrac{${p.multA}x + ${p.extraA}}{${p.nA}}`)} />，
        乙组人均实际 <MathText text={tex(`\\dfrac{${p.multB}x - ${p.extraB}}{${p.nB}}`)} />。
      </SolutionStep>
      <SolutionStep badge="(1)" badgeClass={stepStyles.badgeList}>
        人均实际相等：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\dfrac{${p.multA}x + ${p.extraA}}{${p.nA}} = \\dfrac{${p.multB}x - ${p.extraB}}{${p.nB}}`,
            )}
          />
        </div>
        解得 <MathText text={tex(`x = ${d.eq.q}`)} />。
      </SolutionStep>
      <SolutionStep badge="(2)" badgeClass={stepStyles.badgeSolve}>
        甲组人均比乙组多 {p.diff} 件：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\dfrac{${p.multA}x + ${p.extraA}}{${p.nA}} = \\dfrac{${p.multB}x - ${p.extraB}}{${p.nB}} + ${p.diff}`,
            )}
          />
        </div>
        解得 <MathText text={tex(`x = ${d.more.q}`)} />。
      </SolutionStep>
      <SolutionStep badge="(3)" badgeClass={stepStyles.badgeAnswer}>
        甲组人均比乙组少 {p.diff} 件：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\dfrac{${p.multA}x + ${p.extraA}}{${p.nA}} = \\dfrac{${p.multB}x - ${p.extraB}}{${p.nB}} - ${p.diff}`,
            )}
          />
        </div>
        解得 <MathText text={tex(`x = ${d.less.q}`)} />。
        <div className={stepStyles.answer} style={{ marginTop: 8 }}>
          （1）<AnimatedNumber value={d.eq.q} /> 件； （2）
          <AnimatedNumber value={d.more.q} /> 件； （3）
          <AnimatedNumber value={d.less.q} /> 件。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="人均定额：甲乙两组比较"
      subtitle="总工作量用「定额的倍数 ± 常数」表示，再比较人均实际"
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
        甲组的 <b>{p.nA}</b> 名工人某月完成的总工作量比此月人均定额的 <b>{p.multA}</b> 倍多{' '}
        <b>{p.extraA}</b> 件，乙组的 <b>{p.nB}</b> 名工人同月完成的总工作量比此月人均定额的{' '}
        <b>{p.multB}</b> 倍少 <b>{p.extraB}</b> 件。
        <br />
        （1）如果两组工人此月人均实际完成的工作量相等，那么此月人均定额是多少件？
        <br />
        （2）如果甲组工人此月人均实际完成的工作量比乙组的多 <b>{p.diff}</b> 件，那么此月人均定额是多少件？
        <br />
        （3）如果甲组工人此月人均实际完成的工作量比乙组的少 <b>{p.diff}</b> 件，那么此月人均定额是多少件？
      </Typography>
    </ProblemShell>
  );
}
