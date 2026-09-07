import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { dc: 2 };
}

function generate() {
  return { dc: randInt(1, 4) * 2 };
}

export default function ExtendMidpointChoiceSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [pick, setPick] = useState(null);
  const ab = useMemo(() => (3 * p.dc) / 2, [p]);
  const choices = useMemo(() => {
    const set = new Set([ab, ab + 1, Math.max(1, ab - 1), p.dc]);
    return [...set].sort((a, b) => a - b);
  }, [ab, p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="设" badgeClass={stepStyles.badgeSet}>
        设 AB = 3k，则 BC = (1/3) AB = k，AC = AB + BC = 4k。D 是 AC 的中点，所以 DC = 2k。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          DC = {p.dc}，所以 2k = {p.dc}，k = {p.dc / 2}，AB = 3k = {ab}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="习题 5：延长后再取中点"
      subtitle="BC 是 AB 的三分之一，D 是 AC 的中点"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setPick(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setPick(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        已知线段 AB，延长 AB 至点 C，使 BC = (1/3) AB。D 是线段 AC 的中点。如果 DC = {p.dc}，那么 AB 的长为（ ）。
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {choices.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPick(value)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: pick === value ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {value}
          </button>
        ))}
      </div>
    </ProblemShell>
  );
}
