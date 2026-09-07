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

/** 书题 9：共 20000 元，收益率 4.4% 与 3.6%，收益额相等 → A 9000，B 11000。 */
function bookProblem() {
  return { total: 20000, rateA: 4.4, rateB: 3.6 };
}

function generate() {
  const rateA = pickOne([4, 5, 6, 8]);
  const rateB = pickOne([3, 4, 6]);
  if (rateA === rateB) return bookProblem();
  const total = pickOne([10000, 16000, 20000, 24000]);
  const a = (rateB * total) / (rateA + rateB);
  if (!Number.isInteger(a)) return bookProblem();
  return { total, rateA, rateB };
}

function derive(p) {
  const a = (p.rateB * p.total) / (p.rateA + p.rateB);
  const b = p.total - a;
  const profit = Math.round(((p.rateA / 100) * a) * 100) / 100;
  return { a, b, profit };
}

export default function EqualYieldFundsSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设购买 A 基金 <MathText text={tex('x')} /> 元，则 B 基金 <MathText text={tex(`${p.total}-x`)} /> 元。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        实际收益额相等：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${p.rateA}\\%\\, x=${p.rateB}\\%\\,(${p.total}-x)`)} />
        </div>
        即 <MathText text={tex(`${p.rateA}x=${p.rateB}(${p.total}-x)`)} />。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        <MathText text={tex(`(${p.rateA}+${p.rateB})x=${p.rateB}\\times ${p.total}`)} />
        ，解得 <MathText text={tex(`x=${d.a}`)} />。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          A 基金 <AnimatedNumber value={d.a} /> 元，B 基金 <AnimatedNumber value={d.b} /> 元（收益额各{' '}
          <AnimatedNumber value={d.profit} /> 元）。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="9 两只基金收益额相等"
      subtitle="本金之和已知，收益率不同，但收益额相等"
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
        某人年初购买了 A、B 两只基金共 <b>{p.total}</b> 元，年底卖出后发现两只基金的实际收益恰好相等，且实际收益率分别为{' '}
        <b>{p.rateA}%</b> 和 <b>{p.rateB}%</b>。A、B 两只基金各购买了多少元？
      </Typography>
    </ProblemShell>
  );
}
