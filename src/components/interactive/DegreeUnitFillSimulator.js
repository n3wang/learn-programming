import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const BOOK = [
  { id: 'full', prompt: '1 周角 = ____ °', answer: '360' },
  { id: 'straight', prompt: '1 平角 = ____ °', answer: '180' },
  { id: 'deg', prompt: '1° = ____ ′', answer: '60' },
  { id: 'min', prompt: '1′ = ____ ″', answer: '60' },
];

export default function DegreeUnitFillSimulator() {
  const [key, setKey] = useState(0);
  const [picks, setPicks] = useState({});

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="填" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          1 周角 = 360°，1 平角 = 180°，1° = 60′，1′ = 60″。
          例如 48 度 56 分 37 秒记作 48°56′37″。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="度、分、秒"
      subtitle="一周角 360 等分是 1°，再用六十进制分成、秒"
      problemKey={key}
      onRandomize={() => {
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>把一个周角 360 等分，每一份是 1°。再按 60 等分得到分和秒。</p>
      {BOOK.map((item) => (
        <label key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span>{item.prompt}</span>
          <input
            value={picks[item.id] || ''}
            onChange={(e) => setPicks((prev) => ({ ...prev, [item.id]: e.target.value }))}
            style={{ width: 72, font: 'inherit', padding: '4px 8px', borderRadius: 5, border: '1px solid var(--ifm-color-emphasis-300)' }}
          />
        </label>
      ))}
    </ProblemShell>
  );
}
