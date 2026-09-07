import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const A = { x: 36, y: 78 };
const B = { x: 280, y: 78 };

function len(points) {
  let s = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    s += Math.hypot(dx, dy);
  }
  return s;
}

function path(id, points, color) {
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return <path key={id} d={d} fill="none" stroke={color} strokeWidth="2" />;
}

export default function ShortestPathSimulator() {
  const [key, setKey] = useState(0);
  const [bend, setBend] = useState(36);

  const roads = useMemo(() => {
    const straight = [A, B];
    const high = [A, { x: 120, y: 78 - bend }, { x: 200, y: 78 - bend * 0.4 }, B];
    const low = [A, { x: 100, y: 78 + bend * 0.7 }, { x: 190, y: 78 + bend }, B];
    const wavy = [A, { x: 90, y: 78 - bend * 0.8 }, { x: 160, y: 78 + bend * 0.5 }, { x: 230, y: 78 - bend * 0.6 }, B];
    return [
      { id: 'curve', name: '弯路', color: '#8e24aa', points: wavy },
      { id: 'high', name: '绕上路', color: '#ef6c00', points: high },
      { id: 'low', name: '绕下路', color: '#00897b', points: low },
      { id: 'ab', name: '线段 AB', color: '#1565c0', points: straight },
    ].map((item) => ({ ...item, length: len(item.points) }));
  }, [bend]);

  const shortest = roads.reduce((best, item) => (item.length < best.length ? item : best), roads[0]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="展直" badgeClass={stepStyles.badgeSet}>
        把各条道路看成软线拉直。弯路、绕路都比连接 A、B 的线段长。
      </SolutionStep>
      <SolutionStep badge="事实" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          两点的所有连线中，线段最短。简单说成：两点之间，线段最短。连接两点的线段的长度，叫作这两点间的距离。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="怎样走最近？"
      subtitle="从 A 地到 B 地，最短的是线段 AB"
      problemKey={key}
      onRandomize={() => {
        setBend(28 + Math.floor(Math.random() * 28));
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setBend(36);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        除了下面这些道路，还能再修一条从 A 到 B 的最短道路吗？当前最短的是「{shortest.name}」。
      </p>
      <svg viewBox="0 0 320 150" width="100%" height="150">
        {roads.map((item) => path(item.id, item.points, item.color))}
        <circle cx={A.x} cy={A.y} r="4" fill="#c62828" />
        <circle cx={B.x} cy={B.y} r="4" fill="#c62828" />
        <text x="24" y="96" fontSize="13">A</text>
        <text x="286" y="96" fontSize="13">B</text>
      </svg>
      <div style={{ fontSize: 13, color: 'var(--ifm-color-emphasis-700)' }}>
        {roads.map((item) => (
          <span key={item.id} style={{ marginRight: 12, color: item.color }}>
            {item.name}
          </span>
        ))}
      </div>
    </ProblemShell>
  );
}
