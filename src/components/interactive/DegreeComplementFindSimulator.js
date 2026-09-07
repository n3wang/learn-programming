import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function format(total) {
  const abs = Math.abs(total);
  const d = Math.floor(abs / 60);
  const m = abs % 60;
  return `${d}°${m}′`;
}

function bookProblem() {
  return { d: 70, m: 39 };
}

function generate() {
  return { d: randInt(18, 78), m: randInt(1, 59) };
}

export default function DegreeComplementFindSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const ans = useMemo(() => {
    const given = p.d * 60 + p.m;
    return {
      complement: format(90 * 60 - given),
      supplement: format(180 * 60 - given),
    };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="余" badgeClass={stepStyles.badgeSet}>
        余角是 90° 减去这个角。先把 90° 写成 89°60′，再减：
        90° − {p.d}°{p.m}′ = {ans.complement}。
      </SolutionStep>
      <SolutionStep badge="补" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          补角是 180° 减去这个角。先把 180° 写成 179°60′，再减：
          180° − {p.d}°{p.m}′ = {ans.supplement}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 2：求余角和补角"
      subtitle="分不够减时，向度借 1° 当 60′"
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
        一个角是 {p.d}°{p.m}′，求它的余角和补角。
      </p>
    </ProblemShell>
  );
}
