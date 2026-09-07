import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { left: 32, right: 52 };
}

function generate() {
  return { left: randInt(20, 55), right: randInt(20, 70) };
}

function sign(a, b) {
  if (a === b) return '=';
  return a < b ? '<' : '>';
}

export default function AngleCompareOverlapSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [moved, setMoved] = useState(false);
  const rel = useMemo(() => sign(p.left, p.right), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="叠" badgeClass={stepStyles.badgeSet}>
        把两个角的顶点重合，一条边叠在一起。看另一条边落在哪里。
      </SolutionStep>
      <SolutionStep badge="比" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          角 AOB {rel} 角 A′O′B′。
          {rel === '<' ? '另一条边落在第二个角的内部。' : rel === '>' ? '另一条边落在第二个角的外部。' : '两条边重合。'}
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="比较两个角的大小"
      subtitle="一条边叠在一起，再看另一条边"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setMoved(false);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setMoved(false);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>比较角 AOB 与角 A′O′B′。也可以先用量角器量度数。</p>
      <button
        type="button"
        onClick={() => setMoved((v) => !v)}
        style={{
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 5,
          padding: '2px 10px',
          background: moved ? 'rgba(21,101,192,0.12)' : 'transparent',
          cursor: 'pointer',
          marginBottom: 8,
        }}
      >
        {moved ? '分开看' : '一边重合后比较'}
      </button>
      <svg viewBox="0 0 280 120" width="100%" height="110">
        <line x1="40" y1="96" x2="150" y2="96" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="40" y1="96" x2={40 + 90 * Math.cos((p.left * Math.PI) / 180)} y2={96 - 90 * Math.sin((p.left * Math.PI) / 180)} stroke="#1565c0" strokeWidth="1.6" />
        <line x1={moved ? 40 : 150} y1="96" x2={moved ? 150 : 260} y2="96" stroke="#e91e63" strokeWidth="1.6" />
        <line
          x1={moved ? 40 : 150}
          y1="96"
          x2={(moved ? 40 : 150) + 90 * Math.cos((p.right * Math.PI) / 180)}
          y2={96 - 90 * Math.sin((p.right * Math.PI) / 180)}
          stroke="#e91e63"
          strokeWidth="1.6"
        />
        <text x="28" y="112" fontSize="12">{moved ? 'O(O′)' : 'O'}</text>
        {!moved ? <text x="154" y="112" fontSize="12">O′</text> : null}
      </svg>
    </ProblemShell>
  );
}
