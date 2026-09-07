import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 60, b: 30 };
}

function generate() {
  const b = randInt(10, 40);
  const a = randInt(b + 10, 80);
  return { a, b };
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function AngleTrueFalseSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [marks, setMarks] = useState({});

  const items = useMemo(() => ([
    {
      id: '1',
      text: '两条射线组成的图形叫作角。',
      ok: false,
      why: '错。角是由两条有公共端点的射线组成的。没有公共端点，就不能叫角。',
    },
    {
      id: '2',
      text: '平角是一条直线。',
      ok: false,
      why: '错。平角是一个 180° 的角，它的两条边在同一条直线上，但平角本身不是直线。',
    },
    {
      id: '3',
      text: '互补且相等的两个角都是直角。',
      ok: true,
      why: '对。设每个角是 x°，则 x + x = 180，x = 90。',
    },
    {
      id: '4',
      text: '一个锐角的补角比这个角的余角大 90°。',
      ok: true,
      why: '对。补角减余角 = (180° − α) − (90° − α) = 90°。',
    },
    {
      id: '5',
      text: `在同一平面内，角 AOB = ${p.a}°，角 COB = ${p.b}°，则角 AOC = ${p.a + p.b}°。`,
      ok: false,
      why: `错。射线 OC 的位置没有说清。它在角 AOB 内部时，角 AOC = ${p.a}° − ${p.b}° = ${p.a - p.b}°；在角 AOB 外部、OB 的另一侧时，才是 ${p.a}° + ${p.b}° = ${p.a + p.b}°。`,
    },
  ]), [p]);

  function mark(id, ok) {
    setMarks((prev) => ({ ...prev, [id]: ok }));
  }

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((item) => (
        <SolutionStep key={item.id} badge={item.id} badgeClass={item.ok ? stepStyles.badgeSet : stepStyles.badgeAnswer}>
          {item.why}
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="第 2 题：判断"
      subtitle="先看定义，再看位置是不是唯一"
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
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ flex: '1 1 220px' }}>({item.id}) {item.text}</span>
            <button type="button" onClick={() => mark(item.id, true)} style={{ ...chip, background: marks[item.id] === true ? 'rgba(21,101,192,0.12)' : 'transparent' }}>对</button>
            <button type="button" onClick={() => mark(item.id, false)} style={{ ...chip, background: marks[item.id] === false ? 'rgba(21,101,192,0.12)' : 'transparent' }}>错</button>
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
