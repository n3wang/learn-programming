import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 5, b: 12, gap: -5, times: 4, least: 8, year: 2021, base: 224, extra: 60 };
}

function generate() {
  return {
    a: randInt(3, 9),
    b: randInt(8, 18),
    gap: -randInt(2, 8),
    times: randInt(2, 6),
    least: randInt(6, 16),
    year: 2022,
    base: randInt(180, 260),
    extra: randInt(40, 80),
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

export default function InequalityRelationReviewSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [picks, setPicks] = useState({});

  const rows = [
    { id: '1', prompt: `a 与 ${p.a} 的和是正数`, answer: `a + ${p.a} > 0` },
    { id: '2', prompt: `b 与 ${p.b} 的差大于 ${p.gap}`, answer: `b − ${p.b} > ${p.gap}` },
    { id: '3', prompt: `c 的 ${p.times} 倍大于或等于 ${p.least}`, answer: `${p.times}c ≥ ${p.least}` },
    {
      id: '4',
      prompt: `${p.year} 年优良天数比 ${p.base} 天多出的天数超过了 ${p.extra}`,
      answer: `x − ${p.base} > ${p.extra}`,
    },
  ];

  const options = (row) => {
    if (row.id === '1') return [`a + ${p.a} > 0`, `a + ${p.a} ≥ 0`, `a − ${p.a} > 0`];
    if (row.id === '2') return [`b − ${p.b} > ${p.gap}`, `b + ${p.b} > ${p.gap}`, `b − ${p.b} ≥ ${p.gap}`];
    if (row.id === '3') return [`${p.times}c ≥ ${p.least}`, `${p.times}c > ${p.least}`, `c + ${p.times} ≥ ${p.least}`];
    return [`x − ${p.base} > ${p.extra}`, `x − ${p.base} ≥ ${p.extra}`, `x + ${p.base} > ${p.extra}`];
  };

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        「和是正数」写成 a + {p.a} &gt; 0。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeSet}>
        「差大于 {p.gap}」写成 b − {p.b} &gt; {p.gap}。
      </SolutionStep>
      <SolutionStep badge="3" badgeClass={stepStyles.badgeSet}>
        「大于或等于」要带等号，写成 {p.times}c ≥ {p.least}。
      </SolutionStep>
      <SolutionStep badge="4" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          设 {p.year} 年优良天数为 x。多出的天数超过 {p.extra}，写成 x − {p.base} &gt; {p.extra}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="复习巩固 2 用不等式表示不等关系"
      subtitle="正数用 > 0，大于或等于要带 ≥"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      {rows.map((row) => (
        <div key={row.id} style={{ marginBottom: 10 }}>
          <div>（{row.id}）{row.prompt}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {options(row).map((choice) => (
              <button key={choice} type="button" style={chip} onClick={() => setPicks((prev) => ({ ...prev, [row.id]: choice }))}>
                {choice}
              </button>
            ))}
          </div>
          {picks[row.id] ? <div>{picks[row.id] === row.answer ? '对。' : '再看是「大于」还是「大于或等于」。'}</div> : null}
        </div>
      ))}
    </ProblemShell>
  );
}
