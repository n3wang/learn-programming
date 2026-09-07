import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const BASES = [
  { id: '北偏西', from: '北', toward: '西', x: -1, y: -1 },
  { id: '北偏东', from: '北', toward: '东', x: 1, y: -1 },
  { id: '南偏东', from: '南', toward: '东', x: 1, y: 1 },
  { id: '南偏西', from: '南', toward: '西', x: -1, y: 1 },
];

function bookProblem() {
  return [
    { name: '北偏西', deg: 30 },
    { name: '南偏东', deg: 75 },
    { name: '北偏东', deg: 40 },
    { name: '南偏西', deg: 45, alias: '西南' },
  ];
}

function generate() {
  return BASES.map((item) => ({ name: item.id, deg: randInt(3, 15) * 5 }));
}

function endPoint(item, r) {
  const spec = BASES.find((row) => row.id === item.name);
  const rad = (item.deg * Math.PI) / 180;
  return {
    x: 140 + spec.x * Math.sin(rad) * r,
    y: 110 + spec.y * Math.cos(rad) * r,
  };
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function CompassRayDrawSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookProblem);
  const [shown, setShown] = useState([]);

  function toggle(name) {
    setShown((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="法" badgeClass={stepStyles.badgeSet}>
        先画十字：上北、下南、左西、右东。偏某方向的度数，是从所说的那一方，向偏的那一方转过的角。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {items.map((item) => `${item.alias ? `${item.alias}，即` : ''}${item.name} ${item.deg}°`).join('；')}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 5 题：画出方向射线"
      subtitle="上北下南，左西右东；从一方偏向另一方"
      problemKey={key}
      onRandomize={() => {
        setItems(generate());
        setShown([]);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setItems(bookProblem());
        setShown([]);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>点选要画的方向。西南就是南偏西 45°。</p>
      <svg viewBox="0 0 280 220" width="100%" height="200">
        <line x1="140" y1="24" x2="140" y2="196" stroke="#90a4ae" strokeWidth="1" />
        <line x1="40" y1="110" x2="240" y2="110" stroke="#90a4ae" strokeWidth="1" />
        <text x="132" y="18" fontSize="13">北</text>
        <text x="132" y="212" fontSize="13">南</text>
        <text x="16" y="114" fontSize="13">西</text>
        <text x="246" y="114" fontSize="13">东</text>
        {items.filter((item) => shown.includes(item.name)).map((item) => {
          const end = endPoint(item, 78);
          return (
            <g key={item.name}>
              <line x1="140" y1="110" x2={end.x} y2={end.y} stroke="#e91e63" strokeWidth="1.8" />
              <text x={end.x + 4} y={end.y} fontSize="12">{item.alias || item.name}{item.deg}°</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {items.map((item) => (
          <button key={item.name} type="button" onClick={() => toggle(item.name)} style={{ ...chip, background: shown.includes(item.name) ? 'rgba(233,30,99,0.12)' : 'transparent' }}>
            {item.alias ? `${item.alias}（${item.name} ${item.deg}°）` : `${item.name} ${item.deg}°`}
          </button>
        ))}
      </div>
    </ProblemShell>
  );
}
