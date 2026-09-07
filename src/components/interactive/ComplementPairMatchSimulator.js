import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function pairKey(a, b) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function bookProblem() {
  const angles = [10, 30, 60, 80, 100, 120, 150, 170];
  return {
    angles,
    complement: [[10, 80], [30, 60]],
    supplement: [[10, 170], [30, 150], [60, 120], [80, 100]],
  };
}

function generate() {
  let a = randInt(12, 32);
  let b = randInt(12, 32);
  while (b === a || a + b === 90) b = randInt(12, 32);
  const angles = [a, 90 - a, 90 + a, 180 - a, b, 90 - b, 90 + b, 180 - b].sort((x, y) => x - y);
  return {
    angles,
    complement: [[a, 90 - a], [b, 90 - b]],
    supplement: [[a, 180 - a], [90 - a, 90 + a], [b, 180 - b], [90 - b, 90 + b]],
  };
}

function label(pair) {
  const [a, b] = pair[0] < pair[1] ? pair : [pair[1], pair[0]];
  return `${a}° 与 ${b}°`;
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function ComplementPairMatchSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [marks, setMarks] = useState({});

  const rows = useMemo(() => {
    const correct = new Map();
    p.complement.forEach((pair) => correct.set(pairKey(pair[0], pair[1]), '余'));
    p.supplement.forEach((pair) => correct.set(pairKey(pair[0], pair[1]), '补'));
    const decoys = [];
    for (let i = 0; i < p.angles.length && decoys.length < 3; i += 1) {
      for (let j = i + 1; j < p.angles.length && decoys.length < 3; j += 1) {
        const id = pairKey(p.angles[i], p.angles[j]);
        if (!correct.has(id) && !decoys.includes(id)) decoys.push(id);
      }
    }
    const items = [
      ...p.complement.map((pair) => ({ id: pairKey(pair[0], pair[1]), text: label(pair), kind: '余' })),
      ...p.supplement.map((pair) => ({ id: pairKey(pair[0], pair[1]), text: label(pair), kind: '补' })),
      ...decoys.map((id) => {
        const [a, b] = id.split('-').map(Number);
        return { id, text: label([a, b]), kind: '不是' };
      }),
    ];
    return items;
  }, [p]);

  function cycle(id) {
    setMarks((prev) => {
      const order = ['', '余', '补', '不是'];
      const next = order[(order.indexOf(prev[id] || '') + 1) % order.length];
      return { ...prev, [id]: next };
    });
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="余" badgeClass={stepStyles.badgeSet}>
        和等于 90° 的是余角：{p.complement.map(label).join('，')}。
      </SolutionStep>
      <SolutionStep badge="补" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          和等于 180° 的是补角：{p.supplement.map(label).join('，')}。其余组合既不互余也不互补。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1：哪些互余，哪些互补？"
      subtitle="和为 90° 互余，和为 180° 互补"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setMarks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setMarks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        图中各角：{p.angles.map((deg) => `${deg}°`).join('、')}。点选每一对，标成互余、互补或都不是。
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {rows.map((row) => {
          const mark = marks[row.id] || '';
          return (
            <button key={row.id} type="button" onClick={() => cycle(row.id)} style={chip}>
              {row.text}
              {mark ? ` · ${mark}` : ' · 未标'}
            </button>
          );
        })}
      </div>
    </ProblemShell>
  );
}
