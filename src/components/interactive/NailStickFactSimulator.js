import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const BLANKS = [
  {
    id: 'one',
    label: '钉一个钉子，木条能转动，这说明',
    answer: '经过一个点可以画无数条直线',
  },
  {
    id: 'two',
    label: '再钉一个钉子，木条就被固定，这说明',
    answer: '经过两点有一条直线，并且只有一条直线',
  },
];

export default function NailStickFactSimulator() {
  const [key, setKey] = useState(0);
  const [picks, setPicks] = useState({});

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        一个钉子是一个点。木条绕它转动，就像经过这个点可以画出无数条直线。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          两个钉子确定两个点。木条被固定，说明经过两点有一条直线，并且只有一条直线。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="习题 3：钉子与木条"
      subtitle="一个点对应无数条直线，两个点确定一条直线"
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
      <p style={{ marginTop: 0 }}>
        用一个钉子把一根细木条钉在木板上，用手拨木条，木条能转动；再钉一个钉子，木条就被固定。分别说明了什么？
      </p>
      {BLANKS.map((item) => (
        <label key={item.id} style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
          <span>{item.label}</span>
          <input
            value={picks[item.id] || ''}
            onChange={(e) => setPicks((prev) => ({ ...prev, [item.id]: e.target.value }))}
            style={{ font: 'inherit', padding: '4px 8px', borderRadius: 5, border: '1px solid var(--ifm-color-emphasis-300)' }}
          />
        </label>
      ))}
    </ProblemShell>
  );
}
