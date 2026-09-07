import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const LINE = '#1565c0';
const DOT = '#c62828';

function FigureOne() {
  return (
    <svg viewBox="0 0 240 110" width="100%" height="110" role="img" aria-label="点 P 在直线 l 外，点 A、B 在直线 l 上">
      <line x1="16" y1="78" x2="210" y2="42" stroke={LINE} strokeWidth="1.6" />
      <text x="198" y="36" fontSize="13">l</text>
      <circle cx="62" cy="68" r="3.6" fill={DOT} />
      <circle cx="128" cy="58" r="3.6" fill={DOT} />
      <circle cx="96" cy="24" r="3.6" fill={DOT} />
      <text x="50" y="86" fontSize="13">A</text>
      <text x="132" y="74" fontSize="13">B</text>
      <text x="102" y="20" fontSize="13">P</text>
    </svg>
  );
}

function FigureTwo() {
  return (
    <svg viewBox="0 0 260 120" width="100%" height="120" role="img" aria-label="直线 a、b、c 相交">
      <line x1="16" y1="78" x2="244" y2="78" stroke={LINE} strokeWidth="1.6" />
      <line x1="48" y1="18" x2="150" y2="108" stroke={LINE} strokeWidth="1.6" />
      <line x1="210" y1="16" x2="108" y2="108" stroke={LINE} strokeWidth="1.6" />
      <circle cx="78" cy="62" r="3.5" fill={DOT} />
      <circle cx="176" cy="62" r="3.5" fill={DOT} />
      <circle cx="128" cy="28" r="3.5" fill={DOT} />
      <text x="230" y="74" fontSize="13">a</text>
      <text x="40" y="16" fontSize="13">b</text>
      <text x="208" y="14" fontSize="13">c</text>
      <text x="66" y="56" fontSize="13">B</text>
      <text x="180" y="56" fontSize="13">C</text>
      <text x="132" y="24" fontSize="13">A</text>
    </svg>
  );
}

const BOOK = [
  {
    title: '图（1）',
    node: <FigureOne />,
    lines: [
      '点 A、点 B 在直线 l 上，也可以说直线 l 经过点 A、点 B。',
      '点 P 在直线 l 外，也可以说直线 l 不经过点 P。',
    ],
  },
  {
    title: '图（2）',
    node: <FigureTwo />,
    lines: [
      '直线 b 和直线 c 相交于点 A。',
      '直线 a 和直线 b 相交于点 B，直线 a 和直线 c 相交于点 C。',
      '点 B、点 C 在直线 a 上。',
    ],
  },
];

export default function PointLineRelationSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(BOOK);

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((item) => (
        <SolutionStep key={item.title} badge={item.title} badgeClass={stepStyles.badgeSet}>
          {item.lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="练习 3：点与直线的关系"
      subtitle="在直线上，或者说直线经过这个点；在直线外，或者说直线不经过这个点"
      problemKey={key}
      onRandomize={() => {
        setItems([...BOOK].reverse());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setItems(BOOK);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>用适当的语句表述图中点与直线的关系。</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {items.map((item) => (
          <div key={item.title}>
            <div style={{ fontSize: 13, marginBottom: 4 }}>{item.title}</div>
            {item.node}
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
