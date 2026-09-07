import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 28, b: 22 };
}

function generate() {
  return { a: randInt(15, 40), b: randInt(12, 35) };
}

export default function AngleSumDiffSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="和" badgeClass={stepStyles.badgeSet}>
        角 AOC 是角 AOB 与角 BOC 的和，记作角 AOC = 角 AOB + 角 BOC = {p.a + p.b}°。
      </SolutionStep>
      <SolutionStep badge="差" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          角 AOB = 角 AOC − 角 BOC = {p.a}°。角 AOC − 角 AOB = 角 BOC。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="两个角的和与差"
      subtitle="类比线段：相邻的角可以相加，从一个角里截去一部分就是差"
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
        射线 OB 在角 AOC 的内部。角 AOB = {p.a}°，角 BOC = {p.b}°。
      </p>
      <svg viewBox="0 0 240 110" width="100%" height="100">
        <line x1="28" y1="92" x2="210" y2="92" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="28" y1="92" x2={28 + 100 * Math.cos((p.a * Math.PI) / 180)} y2={92 - 100 * Math.sin((p.a * Math.PI) / 180)} stroke="#00897b" strokeWidth="1.6" />
        <line x1="28" y1="92" x2={28 + 110 * Math.cos(((p.a + p.b) * Math.PI) / 180)} y2={92 - 110 * Math.sin(((p.a + p.b) * Math.PI) / 180)} stroke="#1565c0" strokeWidth="1.6" />
        <text x="16" y="106" fontSize="13">O</text>
        <text x="204" y="106" fontSize="13">A</text>
        <text x={36 + 100 * Math.cos((p.a * Math.PI) / 180)} y={88 - 100 * Math.sin((p.a * Math.PI) / 180)} fontSize="13">B</text>
        <text x={36 + 110 * Math.cos(((p.a + p.b) * Math.PI) / 180)} y={80 - 110 * Math.sin(((p.a + p.b) * Math.PI) / 180)} fontSize="13">C</text>
      </svg>
    </ProblemShell>
  );
}
