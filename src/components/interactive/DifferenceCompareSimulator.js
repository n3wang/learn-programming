import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookPlan() {
  return { a1: 4, b1: 8, a2: 3, b2: 9 };
}

function generate() {
  const a2 = randInt(2, 6);
  const extra = randInt(1, 3);
  const b1 = randInt(4, 8);
  return { a1: a2 + extra, b1, a2, b2: b1 + extra };
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function DifferenceCompareSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookPlan);
  const [picked, setPicked] = useState(null);
  const da = p.a1 - p.a2;
  const db = p.b1 - p.b2;
  const scheme1Larger = da > 0 && db < 0;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="差" badgeClass={stepStyles.badgeSet}>
        方案一减方案二：({p.a1}x + {p.b1}y) − ({p.a2}x + {p.b2}y) = {da}x + ({db})y = {da}(x − y)。
        已知 x &gt; y，所以 x − y &gt; 0，差是正数，方案一用料更多。
      </SolutionStep>
      <SolutionStep badge="选" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>从省料考虑，应选方案二。</div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="阅读与思考：用求差法比较用料"
      subtitle="先作差，再看差的正负"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookPlan());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        A 型钢板面积 x 比 B 型钢板面积 y 大。方案一用 {p.a1} 块 A、{p.b1} 块 B；方案二用 {p.a2} 块 A、{p.b2} 块 B。哪一种更省料？
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['方案一', '方案二', '一样多'].map((choice) => (
          <button key={choice} type="button" style={chip} onClick={() => setPicked(choice)}>
            {choice}
          </button>
        ))}
      </div>
      {picked ? (
        <p>{picked === '方案二' && scheme1Larger ? '对。差是正数，说明方案一更大。' : '先算方案一减方案二，再判断差是正还是负。'}</p>
      ) : null}
    </ProblemShell>
  );
}
