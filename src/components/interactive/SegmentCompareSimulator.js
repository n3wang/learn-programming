import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const LINE = '#1565c0';
const DOT = '#c62828';

function relation(ab, cd) {
  if (ab < cd) return { sign: '<', words: '小于' };
  if (ab > cd) return { sign: '>', words: '大于' };
  return { sign: '=', words: '等于' };
}

function bookProblem() {
  return { ab: 4, cd: 6 };
}

function generate() {
  const ab = randInt(3, 8);
  const cd = randInt(3, 8);
  return { ab, cd };
}

export default function SegmentCompareSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [moved, setMoved] = useState(false);
  const rel = useMemo(() => relation(p.ab, p.cd), [p]);
  const scale = 22;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="移" badgeClass={stepStyles.badgeSet}>
        把线段 AB 移到线段 CD 上，使端点 A 与端点 C 重合。
      </SolutionStep>
      <SolutionStep badge="比" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {p.ab < p.cd
            ? `点 B 落在 C、D 之间，所以 AB ${rel.sign} CD，即 AB ${rel.words} CD。`
            : p.ab > p.cd
              ? `点 D 落在 C、B 之间，所以 AB ${rel.sign} CD，即 AB ${rel.words} CD。`
              : '点 B 与点 D 重合，所以 AB = CD。'}
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="比较两条线段的长短"
      subtitle="把一条线段移到另一条上，通常使一个端点重合"
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
      <p style={{ marginTop: 0 }}>
        线段 AB 与线段 CD 哪条更长？先估计，再把 AB 移到 CD 上比较。
      </p>
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
        {moved ? '分开看' : '端点重合后比较'}
      </button>
      <svg viewBox="0 0 320 120" width="100%" height="120">
        <line x1="24" y1={moved ? 70 : 36} x2={24 + p.ab * scale} y2={moved ? 70 : 36} stroke={LINE} strokeWidth="2" />
        <line x1="24" y1="78" x2={24 + p.cd * scale} y2="78" stroke="#00897b" strokeWidth="2" />
        <circle cx="24" cy={moved ? 70 : 36} r="3.4" fill={DOT} />
        <circle cx={24 + p.ab * scale} cy={moved ? 70 : 36} r="3.4" fill={DOT} />
        <circle cx="24" cy="78" r="3.4" fill={DOT} />
        <circle cx={24 + p.cd * scale} cy="78" r="3.4" fill={DOT} />
        <text x="16" y={moved ? 64 : 28} fontSize="13">{moved ? 'C(A)' : 'A'}</text>
        <text x={28 + p.ab * scale} y={moved ? 64 : 28} fontSize="13">B</text>
        {!moved ? <text x="16" y="96" fontSize="13">C</text> : null}
        <text x={28 + p.cd * scale} y="96" fontSize="13">D</text>
      </svg>
    </ProblemShell>
  );
}
