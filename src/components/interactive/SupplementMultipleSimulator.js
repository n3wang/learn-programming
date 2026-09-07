import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { n: 3, kind: '补' };
}

function generate() {
  return { n: pickOne([2, 3, 4, 5]), kind: pickOne(['补', '余']) };
}

export default function SupplementMultipleSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const ans = useMemo(() => {
    const whole = p.kind === '余' ? 90 : 180;
    return { whole, deg: whole / (p.n + 1) };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设这个角是 x°。它的{p.kind}角是 {ans.whole}° − x，又等于 {p.n}x。
        所以 x + {p.n}x = {ans.whole}，({p.n + 1})x = {ans.whole}。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          x = {ans.whole}° ÷ {p.n + 1} = {ans.deg}°。
          检验：{p.kind}角是 {ans.whole - ans.deg}°，正好是 {ans.deg}° 的 {p.n} 倍。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 3：补角是它的几倍"
      subtitle="这个角和它的几倍正好拼成 180° 或 90°"
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
      <p style={{ marginTop: 0 }}>
        一个角的{p.kind}角是它的 {p.n} 倍，这个角是多少度？
      </p>
    </ProblemShell>
  );
}
