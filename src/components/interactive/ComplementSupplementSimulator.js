import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { deg: 30 };
}

function generate() {
  return { deg: randInt(15, 75) };
}

export default function ComplementSupplementSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const rest = useMemo(() => ({ c: 90 - p.deg, s: 180 - p.deg }), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="余" badgeClass={stepStyles.badgeSet}>
        两个角的和是 90°，就互为余角。{p.deg}° 的余角是 90° − {p.deg}° = {rest.c}°。
      </SolutionStep>
      <SolutionStep badge="补" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          两个角的和是 180°，就互为补角。{p.deg}° 的补角是 180° − {p.deg}° = {rest.s}°。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="余角和补角"
      subtitle="和为 90° 互余，和为 180° 互补"
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
        已知一个角是 {p.deg}°。它的余角是多少度？补角是多少度？
      </p>
      <p>三角尺上，30° 与 60° 互余，45° 与 45° 互余。</p>
    </ProblemShell>
  );
}
