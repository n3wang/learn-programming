import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { aob: 70, aoc: 32 };
}

function generate() {
  const aoc = randInt(4, 12) * 5;
  const aob = randInt(aoc / 5 + 2, 16) * 5;
  return { aob, aoc };
}

export default function DrawAngleTwoCasesSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const ans = useMemo(() => ({
    inside: p.aob - p.aoc,
    outside: p.aob + p.aoc,
  }), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="内" badgeClass={stepStyles.badgeSet}>
        射线 OC 可以画在角 AOB 的内部。这时角 BOC = 角 AOB − 角 AOC = {p.aob}° − {p.aoc}° = {ans.inside}°。
      </SolutionStep>
      <SolutionStep badge="外" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          射线 OC 也可以画在角 AOB 的外部，与 OB 分居 OA 的两侧。这时角 BOC = 角 AOB + 角 AOC = {p.aob}° + {p.aoc}° = {ans.outside}°。
          两种画法都符合“以 OA 为边”，所以有两个答案。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 9 题：两种画法"
      subtitle="没说 OC 画在哪一侧，就要分两种情况"
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
        已知角 AOB = {p.aob}°，以 OA 为边画角 AOC = {p.aoc}°。求角 BOC 的度数。
      </p>
    </ProblemShell>
  );
}
