import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { cod: 35 };
}

function generate() {
  return { cod: randInt(4, 12) * 5 };
}

export default function NestedBisectorFindSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const ans = useMemo(() => ({ aoc: p.cod * 2, aob: p.cod * 4 }), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="半" badgeClass={stepStyles.badgeSet}>
        OD 平分角 AOC，所以角 AOC = 2 × 角 COD = 2 × {p.cod}° = {ans.aoc}°。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          OC 平分角 AOB，所以角 AOB = 2 × 角 AOC = 2 × {ans.aoc}° = {ans.aob}°。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 8 题：两次平分"
      subtitle="每平分一次，外面的角就是里面的 2 倍"
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
        角 COD = {p.cod}°。OC 平分角 AOB，OD 平分角 AOC。求角 AOB 的度数。
      </p>
      <svg viewBox="0 0 260 130" width="100%" height="120">
        <line x1="28" y1="36" x2="150" y2="100" stroke="#263238" strokeWidth="1.8" />
        <line x1="150" y1="100" x2="248" y2="100" stroke="#263238" strokeWidth="1.8" />
        <line x1="150" y1="100" x2="210" y2="28" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="150" y1="100" x2="168" y2="22" stroke="#e91e63" strokeWidth="1.6" />
        <text x="16" y="30" fontSize="13">A</text>
        <text x="142" y="116" fontSize="13">O</text>
        <text x="248" y="114" fontSize="13">B</text>
        <text x="212" y="24" fontSize="13">C</text>
        <text x="158" y="18" fontSize="13">D</text>
      </svg>
    </ProblemShell>
  );
}
