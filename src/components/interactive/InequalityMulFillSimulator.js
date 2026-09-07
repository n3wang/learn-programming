import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { left: 6, right: 2, sign: '>', factors: [5, -5] };
}

function generate() {
  const left = randInt(-8, 8);
  let right = randInt(-6, 8);
  while (right === left) right = randInt(-6, 8);
  return {
    left,
    right,
    sign: left > right ? '>' : '<',
    factors: [randInt(2, 6), randInt(-6, -2)],
  };
}

function flip(sign) {
  return sign === '>' ? '<' : '>';
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function InequalityMulFillSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [marks, setMarks] = useState({});

  function cycle(id) {
    setMarks((prev) => ({ ...prev, [id]: prev[id] === '>' ? '<' : '>' }));
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="填" badgeClass={stepStyles.badgeSet}>
        {p.factors.map((n) => {
          const next = n > 0 ? p.sign : flip(p.sign);
          return (
            <div key={n}>
              {p.left} × ({n}) = {p.left * n}，{p.right} × ({n}) = {p.right * n}，应填 {next}。
            </div>
          );
        })}
      </SolutionStep>
      <SolutionStep badge="规律" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          两边乘同一个正数，不等号方向不变。两边乘同一个负数，不等号方向改变。除以一个不为 0 的数，相当于乘它的倒数，符号规则相同。两边都乘 0，结果都变成 0，不再保持原来的不等关系。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="探究：两边乘同一个数"
      subtitle="正数不变向，负数要变向"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setMarks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setMarks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        已知 {p.left} {p.sign} {p.right}。点选每一行的不等号。
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {p.factors.map((n) => (
          <div key={n}>
            {p.left} × ({n}){' '}
            <button type="button" onClick={() => cycle(n)} style={chip}>
              {marks[n] || '□'}
            </button>{' '}
            {p.right} × ({n})
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
