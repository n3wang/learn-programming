import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const CANDIDATES = [
  [2, 3, 6],
  [2, 3, 7],
  [2, 4, 4],
  [3, 3, 3],
  [2, 5, 5],
];

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

function sumText(a, b, c) {
  return `1/${a} + 1/${b} + 1/${c}`;
}

export default function UnitFractionTripleSimulator() {
  const [picked, setPicked] = useState(null);
  const answer = '2, 3, 6';

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="界" badgeClass={stepStyles.badgeSet}>
        a、b、c 是正整数，并且 a &lt; b &lt; c。a 不能是 1，否则倒数和已经大于 1。a 也不能大于等于 3，因为 1/3 + 1/4 + 1/5 &lt; 1。所以 a = 2。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          这时 1/b + 1/c = 1/2，且 2 &lt; b &lt; c。b = 3 时 c = 6，满足 2 &lt; 3 &lt; 6。b = 4 时 c = 4，不满足 b &lt; c。b ≥ 5 时两个倒数和小于 1/2。所以只有 a = 2，b = 3，c = 6。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 12 题 三个正整数的倒数和为 1"
      subtitle="先把 a 缩小到 2，再试 b"
      problemKey={0}
      onRandomize={() => setPicked(null)}
      onBook={() => setPicked(null)}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        已知 a、b、c 是正整数，a &lt; b &lt; c，并且 1/a + 1/b + 1/c = 1。哪一组满足？
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CANDIDATES.map(([a, b, c]) => {
          const label = `${a}, ${b}, ${c}`;
          return (
            <button key={label} type="button" style={chip} onClick={() => setPicked(label)}>
              {label}（{sumText(a, b, c)}）
            </button>
          );
        })}
      </div>
      {picked ? (
        <p>
          {picked === answer
            ? '对。1/2 + 1/3 + 1/6 = 1，而且 2 < 3 < 6。'
            : '要同时满足严格递增，以及三个倒数和正好是 1。'}
        </p>
      ) : null}
    </ProblemShell>
  );
}
