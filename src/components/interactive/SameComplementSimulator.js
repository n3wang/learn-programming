import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 35 };
}

function generate() {
  return { a: randInt(20, 60) };
}

export default function SameComplementSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const rest90 = 90 - p.a;
  const rest180 = 180 - p.a;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="余" badgeClass={stepStyles.badgeSet}>
        角 2 = 90° − 角 1 = {rest90}°，角 3 = 90° − 角 1 = {rest90}°，所以角 2 = 角 3。
        同角（或等角）的余角相等。
      </SolutionStep>
      <SolutionStep badge="补" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          若两个角都是 {p.a}° 的补角，则都等于 180° − {p.a}° = {rest180}°。同角（或等角）的补角相等。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="思考：同角的余角相等吗？"
      subtitle="都等于 90° 减去同一个角，所以相等"
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
        角 1 = {p.a}°。角 2、角 3 都是角 1 的余角。角 2 与角 3 的大小有什么关系？
      </p>
      <p>与同一个角互补的两个角呢？</p>
    </ProblemShell>
  );
}
