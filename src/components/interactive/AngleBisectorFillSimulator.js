import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { parts: 7, whole: 360 };
}

function generate() {
  return { parts: randInt(5, 9), whole: 360 };
}

export default function AngleBisectorFillSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const each = useMemo(() => {
    const deg = Math.floor(p.whole / p.parts);
    const rem = p.whole - deg * p.parts;
    const minutes = Math.round((rem * 60) / p.parts);
    return { deg, minutes };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="平分" badgeClass={stepStyles.badgeSet}>
        若角 AOB = 角 BOC，射线 OB 是角 AOC 的平分线。角 AOC = 2 角 AOB，角 AOB = 角 BOC = 角 AOC 的一半。
      </SolutionStep>
      <SolutionStep badge="等分" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {p.whole}° ÷ {p.parts} = {each.deg}° + {p.whole - each.deg * p.parts}° ÷ {p.parts}。
          剩下的度数化成分再除，每份约 {each.deg}°{each.minutes}′。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="角的平分线与等分"
      subtitle="从顶点出发，把角分成相等的部分"
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
        如果角 AOB = 角 BOC，那么射线 OB 把角 AOC 分成两个相等的角。
        角 AOC = 2 角 AOB = 角 AOC，角 AOB = 角 BOC = 角 AOC 的一半。
      </p>
      <p>
        把一个 {p.whole}° 的角 {p.parts} 等分，每份大约是多少度的角？精确到分。书题目是周角 7 等分。
      </p>
    </ProblemShell>
  );
}
