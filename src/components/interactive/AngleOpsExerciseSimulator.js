import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

export default function AngleOpsExerciseSimulator() {
  const [key, setKey] = useState(0);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        相等可以传递：角 1 = 角 2，角 2 = 角 3，所以角 1 = 角 3。
        大于也可以传递：角 1 &gt; 角 2，角 2 &gt; 角 3，所以角 1 &gt; 角 3。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          角 AOB + 角 BOC = 角 AOC。角 AOC + 角 COD = 角 AOD。
          角 BOD − 角 COD = 角 BOC。角 AOD − 角 BOD = 角 AOB。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1、2：相等、大于，以及角的和差"
      subtitle="从下往上看，射线顺序是 OA、OB、OC、OD"
      problemKey={key}
      onRandomize={() => setKey((k) => k + 1)}
      onBook={() => setKey((k) => k + 1)}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>如果角 1 = 角 2，角 2 = 角 3，则角 1 ____ 角 3。如果角 1 大于角 2，角 2 大于角 3，则角 1 ____ 角 3。</p>
      <p>按图：角 AOB + 角 BOC = ____；角 AOC + 角 COD = ____；角 BOD − 角 COD = ____；角 AOD − ____ = 角 AOB。</p>
    </ProblemShell>
  );
}
