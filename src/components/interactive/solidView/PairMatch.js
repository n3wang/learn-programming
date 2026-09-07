import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const card = {
  border: '1px solid var(--ifm-color-emphasis-200)',
  borderRadius: 8,
  padding: '8px 8px 6px',
  background: 'transparent',
};

export default function PairMatch({
  title,
  subtitle,
  prompt,
  left,
  right,
  solutionLines,
  bookOrderRight,
}) {
  const [key, setKey] = useState(0);
  const [order, setOrder] = useState(() => bookOrderRight || right.map((item) => item.id));
  const [picks, setPicks] = useState({});

  const rightById = useMemo(() => Object.fromEntries(right.map((item) => [item.id, item])), [right]);
  const orderedRight = order.map((id) => rightById[id]).filter(Boolean);

  const correct = Object.fromEntries(left.map((item) => [item.id, item.match]));
  const allChosen = left.every((item) => picks[item.id]);
  const score = left.filter((item) => picks[item.id] === item.match).length;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="连线" badgeClass={stepStyles.badgeSet}>
        {solutionLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </SolutionStep>
      <SolutionStep badge="核对" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {allChosen
            ? `你连对了 ${score} / ${left.length}。`
            : '先自己连完，再对照上面的对应关系。'}
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title={title}
      subtitle={subtitle}
      problemKey={key}
      onRandomize={() => {
        setOrder(shuffle(right.map((item) => item.id)));
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setOrder(bookOrderRight || right.map((item) => item.id));
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>{prompt}</p>
      <div style={{ display: 'grid', gap: 10 }}>
        {left.map((item, index) => {
          const chosen = picks[item.id] || '';
          return (
            <div key={item.id} style={{ ...card, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-600)', marginBottom: 4 }}>{index + 1}</div>
                {item.node}
              </div>
              <span style={{ color: 'var(--ifm-color-emphasis-500)' }}>→</span>
              <label style={{ display: 'grid', gap: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-600)' }}>连到</span>
                <select
                  value={chosen}
                  onChange={(e) => setPicks((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  style={{ fontSize: 14, padding: '4px 6px' }}
                >
                  <option value="">请选择</option>
                  {orderedRight.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
      </div>
    </ProblemShell>
  );
}
