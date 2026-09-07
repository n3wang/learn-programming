import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

export default function CylinderAntPathSimulator() {
  const [key, setKey] = useState(0);
  const [laps, setLaps] = useState(0);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        B 在 A 的正上方。沿侧面走，最短是顺着这条母线竖直向上。把侧面展开成长方形后，A 与 B 在同一条竖边上，连线就是高。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          要爬一圈再到 B，把侧面展开，宽度是一圈的周长，B 落在右边一格的上方。展开图上的线段最短，回到圆柱上就是一条斜着绕上去的曲线。爬两圈时，展开图的宽度是两圈周长，同样连展开图上的线段。圈数越多，这条斜线越长。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="习题 9：蚂蚁沿圆柱爬行"
      subtitle="把侧面展成平面，最短路线变成线段"
      problemKey={key}
      onRandomize={() => {
        setLaps((n) => (n === 1 ? 2 : 1));
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setLaps(0);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        蚂蚁从点 A 沿圆柱表面爬到正上方的点 B。先看不绕圈，再看绕一圈或两圈。
      </p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[
          [0, '正上方'],
          [1, '绕一圈'],
          [2, '绕两圈'],
        ].map(([n, label]) => (
          <button
            key={n}
            type="button"
            onClick={() => setLaps(n)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: laps === n ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 280 120" width="100%" height="110">
        <rect x="24" y="20" width={80 * (laps === 0 ? 1 : laps)} height="70" fill="none" stroke="#1565c0" />
        {laps > 1 ? <line x1="104" y1="20" x2="104" y2="90" stroke="#90caf9" strokeDasharray="3 3" /> : null}
        <circle cx="24" cy="90" r="3.4" fill="#c62828" />
        <circle cx={24 + (laps === 0 ? 0 : 80 * laps)} cy="20" r="3.4" fill="#c62828" />
        <text x="12" y="106" fontSize="13">A</text>
        <text x={28 + (laps === 0 ? 0 : 80 * laps)} y="16" fontSize="13">B</text>
        <line
          x1="24"
          y1="90"
          x2={24 + (laps === 0 ? 0 : 80 * laps)}
          y2="20"
          stroke="#e91e63"
          strokeWidth="1.8"
        />
      </svg>
      <p style={{ fontSize: 13, color: 'var(--ifm-color-emphasis-700)' }}>
        {laps === 0
          ? '展开后 A、B 在同一条竖边上，最短是这段高。'
          : `展开后要再向右走 ${laps} 个周长，连 A 与这个 B 的线段最短。`}
      </p>
    </ProblemShell>
  );
}
