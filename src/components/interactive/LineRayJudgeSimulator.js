import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

const LETTERS = 'ABCDEFGHKLMNPQRST';

function pair() {
  const a = LETTERS[randInt(0, LETTERS.length - 1)];
  let b = LETTERS[randInt(0, LETTERS.length - 1)];
  while (b === a) b = LETTERS[randInt(0, LETTERS.length - 1)];
  return [a, b];
}

const BOOK = [
  {
    text: '线段 AB 和射线 AB 都是直线 AB 的一部分。',
    ok: true,
    why: '线段是直线上两点及中间的部分，射线是直线上一点及一侧的部分，都含在直线 AB 里。',
  },
  {
    text: '直线 AB 和直线 BA 是同一条直线。',
    ok: true,
    why: '直线没有方向。用 A、B 或 B、A 表示，指的是同一条直线。',
  },
  {
    text: '射线 AB 和射线 BA 是同一条射线。',
    ok: false,
    why: '射线有端点和方向。射线 AB 从 A 出发经过 B，射线 BA 从 B 出发经过 A，方向相反。',
  },
  {
    text: '向一个方向延长线段可得到射线，向两个方向延长线段可得到直线。',
    ok: true,
    why: '从一个端点向外延长，得到以另一个端点为端点的射线；向两端都延长，就得到直线。',
  },
];

function generate() {
  const [a, b] = pair();
  const pool = [
    {
      text: `线段 ${a}${b} 和射线 ${a}${b} 都是直线 ${a}${b} 的一部分。`,
      ok: true,
      why: '线段和射线都是直线的一部分。',
    },
    {
      text: `直线 ${a}${b} 和直线 ${b}${a} 是同一条直线。`,
      ok: true,
      why: '直线没有方向，两种写法表示同一条直线。',
    },
    {
      text: `射线 ${a}${b} 和射线 ${b}${a} 是同一条射线。`,
      ok: false,
      why: '端点不同，延伸方向也相反，不是同一条射线。',
    },
    {
      text: `线段 ${a}${b} 和线段 ${b}${a} 是同一条线段。`,
      ok: true,
      why: '线段由两个端点决定，没有方向，两种写法是同一条。',
    },
    {
      text: `射线 ${a}${b} 有两个端点。`,
      ok: false,
      why: `射线 ${a}${b} 只有一个端点 ${a}，另一头无限延伸。`,
    },
    {
      text: '向一个方向延长线段可得到射线，向两个方向延长线段可得到直线。',
      ok: true,
      why: '延长一个方向得到射线，两个方向都延长得到直线。',
    },
  ];
  const picked = [];
  const used = new Set();
  while (picked.length < 4) {
    const item = pickOne(pool);
    if (used.has(item.text)) continue;
    used.add(item.text);
    picked.push(item);
  }
  return picked;
}

export default function LineRayJudgeSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(BOOK);
  const [picks, setPicks] = useState({});

  const done = items.every((_, i) => picks[i] === true || picks[i] === false);
  const score = items.filter((item, i) => picks[i] === item.ok).length;

  const solution = useMemo(() => (
    <div className={stepStyles.solution}>
      {items.map((item, i) => (
        <SolutionStep key={item.text} badge={item.ok ? '对' : '错'} badgeClass={item.ok ? stepStyles.badgeAnswer : stepStyles.badgeSet}>
          （{i + 1}）{item.ok ? '正确' : '不正确'}。{item.why}
        </SolutionStep>
      ))}
      <SolutionStep badge="核对" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {done ? `你判对了 ${score} / ${items.length}。` : '先自己判断对错，再对照上面的理由。'}
        </div>
      </SolutionStep>
    </div>
  ), [items, done, score]);

  return (
    <ProblemShell
      title="练习 1：判断"
      subtitle="直线没有方向；射线有端点和方向；线段由两个端点决定"
      problemKey={key}
      onRandomize={() => {
        setItems(generate());
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setItems(BOOK);
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>判断下列说法是否正确。</p>
      {items.map((item, i) => (
        <div key={item.text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ minWidth: 28 }}>({i + 1})</span>
          <span style={{ flex: 1 }}>{item.text}</span>
          <span style={{ display: 'flex', gap: 4 }}>
            {[true, false].map((v) => (
              <button
                key={String(v)}
                type="button"
                onClick={() => setPicks((prev) => ({ ...prev, [i]: v }))}
                style={{
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: 5,
                  padding: '1px 8px',
                  background: picks[i] === v ? 'rgba(21,101,192,0.12)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {v ? '对' : '错'}
              </button>
            ))}
          </span>
        </div>
      ))}
    </ProblemShell>
  );
}
