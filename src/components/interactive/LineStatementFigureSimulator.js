import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const LINE = '#1565c0';
const DOT = '#c62828';

function bookFigures() {
  return [
    {
      text: '直线 EF 经过点 C。',
      why: '先定 E、F，再画过这两点的直线，点 C 落在这条直线上。',
      node: (
        <svg viewBox="0 0 220 90" width="100%" height="90">
          <line x1="16" y1="58" x2="200" y2="28" stroke={LINE} strokeWidth="1.6" />
          <circle cx="52" cy="50" r="3.5" fill={DOT} />
          <circle cx="168" cy="36" r="3.5" fill={DOT} />
          <circle cx="110" cy="43" r="3.5" fill={DOT} />
          <text x="44" y="68" fontSize="13">E</text>
          <text x="162" y="28" fontSize="13">F</text>
          <text x="114" y="38" fontSize="13">C</text>
        </svg>
      ),
    },
    {
      text: '点 A 在直线 l 外。',
      why: '直线 l 不经过点 A，所以点 A 在直线 l 外。',
      node: (
        <svg viewBox="0 0 220 90" width="100%" height="90">
          <line x1="20" y1="62" x2="200" y2="62" stroke={LINE} strokeWidth="1.6" />
          <text x="188" y="54" fontSize="13">l</text>
          <circle cx="108" cy="28" r="3.5" fill={DOT} />
          <text x="114" y="26" fontSize="13">A</text>
        </svg>
      ),
    },
    {
      text: '经过点 O 的三条线段 a，b，c。',
      why: '三条线段都经过同一个点 O，端点可以不在一条直线上。',
      node: (
        <svg viewBox="0 0 220 110" width="100%" height="100">
          <line x1="24" y1="72" x2="196" y2="72" stroke={LINE} strokeWidth="1.6" />
          <line x1="40" y1="20" x2="180" y2="124" stroke={LINE} strokeWidth="1.6" />
          <line x1="36" y1="112" x2="184" y2="30" stroke={LINE} strokeWidth="1.6" />
          <circle cx="110" cy="72" r="3.6" fill={DOT} />
          <text x="116" y="68" fontSize="13">O</text>
          <text x="18" y="76" fontSize="12">a</text>
          <text x="40" y="20" fontSize="12">b</text>
          <text x="168" y="22" fontSize="12">c</text>
        </svg>
      ),
    },
    {
      text: '线段 AB，CD 相交于点 B，连接 AD。',
      why: 'AB 与 CD 的公共点是 B，所以 B 是 CD 的一个端点。再画线段 AD。',
      node: (
        <svg viewBox="0 0 220 110" width="100%" height="100">
          <line x1="28" y1="78" x2="137" y2="78" stroke={LINE} strokeWidth="1.6" />
          <line x1="78" y1="22" x2="168" y2="108" stroke={LINE} strokeWidth="1.6" />
          <line x1="28" y1="78" x2="168" y2="108" stroke={LINE} strokeWidth="1.6" strokeDasharray="4 3" />
          <circle cx="28" cy="78" r="3.5" fill={DOT} />
          <circle cx="137" cy="78" r="3.5" fill={DOT} />
          <circle cx="168" cy="108" r="3.5" fill={DOT} />
          <circle cx="96" cy="42" r="3.2" fill={DOT} />
          <text x="16" y="74" fontSize="13">A</text>
          <text x="140" y="74" fontSize="13">B</text>
          <text x="172" y="104" fontSize="13">D</text>
          <text x="70" y="20" fontSize="13">C</text>
        </svg>
      ),
    },
  ];
}

function generate() {
  const items = bookFigures();
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export default function LineStatementFigureSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookFigures);

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((item, i) => (
        <SolutionStep key={item.text} badge={String(i + 1)} badgeClass={stepStyles.badgeSet}>
          <div>{item.why}</div>
          {item.node}
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="练习 2：按语句画图"
      subtitle="先自己画，再打开解答对照"
      problemKey={key}
      onRandomize={() => {
        setItems(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setItems(bookFigures());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>按下列语句画出图形。</p>
      <ol>
        {items.map((item) => (
          <li key={item.text}>{item.text}</li>
        ))}
      </ol>
    </ProblemShell>
  );
}
