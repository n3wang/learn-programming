import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const LINE = '#1565c0';
const DOT = '#c62828';

const ITEMS = [
  {
    text: '直线 l 经过 A、B、C 三点，并且点 C 在点 A 与点 B 之间。',
    why: 'A、C、B 在同一条直线上，顺序是 A、C、B。',
    node: (
      <svg viewBox="0 0 260 70" width="100%" height="70">
        <line x1="16" y1="36" x2="240" y2="36" stroke={LINE} strokeWidth="1.6" />
        <circle cx="48" cy="36" r="3.4" fill={DOT} />
        <circle cx="120" cy="36" r="3.4" fill={DOT} />
        <circle cx="200" cy="36" r="3.4" fill={DOT} />
        <text x="40" y="54" fontSize="13">A</text>
        <text x="112" y="54" fontSize="13">C</text>
        <text x="194" y="54" fontSize="13">B</text>
        <text x="220" y="28" fontSize="13">l</text>
      </svg>
    ),
  },
  {
    text: '两条线段 m 与 n 相交于点 P。',
    why: '两条线段有一个公共点 P，交点可以是端点，也可以在线段中间。',
    node: (
      <svg viewBox="0 0 220 90" width="100%" height="80">
        <line x1="24" y1="62" x2="190" y2="28" stroke={LINE} strokeWidth="1.6" />
        <line x1="36" y1="24" x2="170" y2="74" stroke={LINE} strokeWidth="1.6" />
        <circle cx="108" cy="46" r="3.4" fill={DOT} />
        <text x="112" y="42" fontSize="13">P</text>
        <text x="176" y="24" fontSize="12">m</text>
        <text x="156" y="78" fontSize="12">n</text>
      </svg>
    ),
  },
  {
    text: 'P 是直线 a 外一点，过点 P 有一条直线 b 与直线 a 相交于点 Q。',
    why: '点 P 不在直线 a 上。过 P 作直线 b，与 a 交于 Q。',
    node: (
      <svg viewBox="0 0 240 90" width="100%" height="80">
        <line x1="16" y1="62" x2="220" y2="62" stroke={LINE} strokeWidth="1.6" />
        <line x1="48" y1="18" x2="168" y2="78" stroke={LINE} strokeWidth="1.6" />
        <circle cx="78" cy="28" r="3.4" fill={DOT} />
        <circle cx="124" cy="52" r="3.4" fill={DOT} />
        <text x="68" y="22" fontSize="13">P</text>
        <text x="128" y="48" fontSize="13">Q</text>
        <text x="200" y="56" fontSize="13">a</text>
        <text x="150" y="78" fontSize="13">b</text>
      </svg>
    ),
  },
  {
    text: '直线 l、m、n 相交于点 Q。',
    why: '三条直线有同一个公共点 Q。过一个点可以有许多条直线。',
    node: (
      <svg viewBox="0 0 220 90" width="100%" height="80">
        <line x1="16" y1="48" x2="204" y2="48" stroke={LINE} strokeWidth="1.6" />
        <line x1="40" y1="16" x2="160" y2="78" stroke={LINE} strokeWidth="1.6" />
        <line x1="48" y1="76" x2="176" y2="18" stroke={LINE} strokeWidth="1.6" />
        <circle cx="112" cy="48" r="3.4" fill={DOT} />
        <text x="116" y="42" fontSize="13">Q</text>
        <text x="188" y="42" fontSize="12">l</text>
        <text x="150" y="78" fontSize="12">m</text>
        <text x="168" y="16" fontSize="12">n</text>
      </svg>
    ),
  },
];

export default function LineReadDrawSimulator() {
  const [key, setKey] = useState(0);
  const solution = (
    <div className={stepStyles.solution}>
      {ITEMS.map((item, i) => (
        <SolutionStep key={item.text} badge={String(i + 1)} badgeClass={stepStyles.badgeSet}>
          <div>{item.why}</div>
          {item.node}
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="习题 2：按语句画图"
      subtitle="先自己画，再打开解答对照"
      problemKey={key}
      onRandomize={() => setKey((k) => k + 1)}
      onBook={() => setKey((k) => k + 1)}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>读下列语句，并分别画出图形。</p>
      <ol>
        {ITEMS.map((item) => (
          <li key={item.text}>{item.text}</li>
        ))}
      </ol>
    </ProblemShell>
  );
}
