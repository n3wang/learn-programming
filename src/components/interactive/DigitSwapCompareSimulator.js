import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function compare(a, b) {
  if (a > b) return 'larger';
  if (a < b) return 'smaller';
  return 'equal';
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function DigitSwapCompareSimulator() {
  const [key, setKey] = useState(0);
  const [a, setA] = useState(2);
  const [b, setB] = useState(5);
  const [picked, setPicked] = useState(null);
  const original = 10 * b + a;
  const swapped = 10 * a + b;
  const kind = compare(a, b);
  const label = kind === 'larger' ? '变大' : kind === 'smaller' ? '变小' : '相等';

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="差" badgeClass={stepStyles.badgeSet}>
        原来的数是 10b + a，对调后是 10a + b。差是 (10a + b) − (10b + a) = 9(a − b)。
      </SolutionStep>
      <SolutionStep badge="判" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          a &gt; b 时对调后更大；a &lt; b 时对调后更小；a = b 时相等。当前 a = {a}，b = {b}，对调后{label}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 11 题 对调个位和十位"
      subtitle="差是 9(a − b)，看 a 与 b 谁大"
      problemKey={key}
      onRandomize={() => {
        setA(randInt(1, 9));
        setB(randInt(1, 9));
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setA(2);
        setB(5);
        setPicked(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        个位是 a = {a}，十位是 b = {b}。原来的两位数是 {original}，对调后是 {swapped}。
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['变大', '变小', '相等'].map((choice) => (
          <button key={choice} type="button" style={chip} onClick={() => setPicked(choice)}>
            {choice}
          </button>
        ))}
      </div>
      {picked ? <p>{picked === label ? '对。' : '先算 9(a − b) 的正负。'}</p> : null}
    </ProblemShell>
  );
}
