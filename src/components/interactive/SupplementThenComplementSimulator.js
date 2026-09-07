import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { supplement: 150 };
}

function generate() {
  return { supplement: randInt(19, 32) * 5 };
}

export default function SupplementThenComplementSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const ans = useMemo(() => {
    const self = 180 - p.supplement;
    return { self, complement: 90 - self };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="角" badgeClass={stepStyles.badgeSet}>
        这个角与它的补角互为补角，所以这个角是 180° − {p.supplement}° = {ans.self}°。
      </SolutionStep>
      <SolutionStep badge="余" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          余角是 90° − {ans.self}° = {ans.complement}°。也可以直接用补角减 90°：{p.supplement}° − 90° = {ans.complement}°。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 4 题：先求角，再求余角"
      subtitle="补角减 90°，就是这个角的余角"
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
        一个角的补角是 {p.supplement}°，这个角的余角是多少度？
      </p>
    </ProblemShell>
  );
}
