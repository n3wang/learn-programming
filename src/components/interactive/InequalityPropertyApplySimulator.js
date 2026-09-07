import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookPractice() {
  return { mode: 'compare', bound: null };
}

function generate() {
  return { mode: 'range', bound: randInt(2, 8) };
}

const ROWS = [
  { id: 'add', left: 'p + 1/2', right: 'q + 1/2', sign: '>', why: '性质 1：两边加 1/2，方向不变。' },
  { id: 'sub', left: 'p − 2', right: 'q − 2', sign: '>', why: '性质 1：两边减 2，方向不变。' },
  { id: 'expr', left: 'p + 2m', right: 'q + 2m', sign: '>', why: '性质 1：两边加同一个式子 2m，方向不变。' },
  { id: 'neg', left: '−5p', right: '−5q', sign: '<', why: '性质 3：两边乘 −5，方向改变。' },
  { id: 'div', left: 'p/3', right: 'q/3', sign: '>', why: '性质 2：两边除以 3，方向不变。' },
  { id: 'mix', left: '4p + 1', right: '4q + 1', sign: '>', why: '先乘正数 4，再加 1，方向都不变。' },
];

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function InequalityPropertyApplySimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookPractice);
  const [marks, setMarks] = useState({});

  function cycle(id) {
    setMarks((prev) => ({ ...prev, [id]: prev[id] === '>' ? '<' : '>' }));
  }

  const bound = p.bound == null ? 3 : p.bound;
  const ranges = [
    { id: 'r1', text: `m + 5 > ${bound + 5}`, why: '性质 1：两边加 5。' },
    { id: 'r2', text: `m/6 > ${bound}/6`, why: '性质 2：两边除以正数 6。' },
    { id: 'r3', text: `−2m < ${-2 * bound}`, why: '性质 3：两边乘 −2，方向改变。' },
    { id: 'r4', text: `3m − 4 > ${3 * bound - 4}`, why: '先乘正数 3，再减 4，方向不变。' },
  ];

  const solution = p.mode === 'compare' ? (
    <div className={stepStyles.solution}>
      <SolutionStep badge="例" badgeClass={stepStyles.badgeSet}>
        已知 a &gt; b。a + 3 &gt; b + 3，依据性质 1。−2a &lt; −2b，依据性质 3。
      </SolutionStep>
      <SolutionStep badge="练" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {ROWS.map((row) => (
            <div key={row.id}>{row.left} {row.sign} {row.right}。{row.why}</div>
          ))}
        </div>
      </SolutionStep>
    </div>
  ) : (
    <div className={stepStyles.solution}>
      <SolutionStep badge="范围" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          已知 m &gt; {bound}。{ranges.map((row) => row.text).join('；')}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title={p.mode === 'compare' ? '例 2 与练习 1：比较大小' : '练习 2：写出取值范围'}
      subtitle="先看加的是不是同一个数，再看乘的是正数还是负数"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setMarks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookPractice());
        setMarks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      {p.mode === 'compare' ? (
        <>
          <p style={{ marginTop: 0 }}>已知 a &gt; b。a + 3 与 b + 3，−2a 与 −2b，哪一个更大？</p>
          <p>已知 p &gt; q。点选每一行的不等号。</p>
          <div style={{ display: 'grid', gap: 8 }}>
            {ROWS.map((row) => (
              <div key={row.id}>
                {row.left}{' '}
                <button type="button" onClick={() => cycle(row.id)} style={chip}>
                  {marks[row.id] || '□'}
                </button>{' '}
                {row.right}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p style={{ marginTop: 0 }}>
          已知 m &gt; {bound}。写出 m + 5、m/6、−2m、3m − 4 的取值范围。
        </p>
      )}
    </ProblemShell>
  );
}
