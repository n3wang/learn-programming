import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { parts: 8, each: 15 };
}

function generate() {
  const parts = [6, 8, 9, 10, 12][randInt(0, 4)];
  const each = [10, 12, 15, 18, 20][randInt(0, 4)];
  return { parts, each };
}

export default function CakeSliceAngleSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="8 份" badgeClass={stepStyles.badgeSet}>
        一周角是 360°。等分成 {p.parts} 份，每份是 360° ÷ {p.parts} = {360 / p.parts}°。
      </SolutionStep>
      <SolutionStep badge="15°" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          每份是 {p.each}° 时，份数是 360° ÷ {p.each}° = {360 / p.each}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1：蛋糕里的角"
      subtitle="整块蛋糕是一个周角"
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
        把一个蛋糕等分成 {p.parts} 份，每份中的角是多少度？要使每份中的角是 {p.each}°，这个蛋糕应等分成多少份？
      </p>
    </ProblemShell>
  );
}
