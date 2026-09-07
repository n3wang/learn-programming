import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 15, sum: 27, half: 3, area: 1333, times: 18 };
}

function generate() {
  return {
    a: randInt(8, 20),
    sum: randInt(21, 40),
    half: randInt(2, 8),
    area: randInt(800, 1800),
    times: randInt(8, 20),
  };
}

export default function InequalityPhraseSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        「和大于」写成 a + {p.a} &gt; {p.sum}。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeSet}>
        「一半与 {p.half} 的差是负数」写成 b/2 − {p.half} &lt; 0。
      </SolutionStep>
      <SolutionStep badge="3" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          设原有面积为 x hm²。超过原有的 {p.times} 倍，写成 {p.area} &gt; {p.times}x。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="例 1：用不等式表示不等关系"
      subtitle="先找谁和谁比，再选大于号或小于号"
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
      <p style={{ marginTop: 0 }}>(1) a 与 {p.a} 的和大于 {p.sum}。</p>
      <p>(2) b 的一半与 {p.half} 的差是负数。</p>
      <p>
        (3) 共种植 {p.area} hm²，种植面积超过原有面积的 {p.times} 倍。
      </p>
    </ProblemShell>
  );
}
