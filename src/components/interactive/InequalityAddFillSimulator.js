import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return {
    left: 5,
    right: 3,
    sign: '>',
    adds: [2, 0, -2],
  };
}

function generate() {
  const left = randInt(-6, 8);
  let right = randInt(-6, 8);
  while (right === left) right = randInt(-6, 8);
  return {
    left,
    right,
    sign: left > right ? '>' : '<',
    adds: [randInt(1, 6), 0, randInt(-8, -1)],
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

export default function InequalityAddFillSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [marks, setMarks] = useState({});

  function cycle(id) {
    setMarks((prev) => ({ ...prev, [id]: prev[id] === '>' ? '<' : '>' }));
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="填" badgeClass={stepStyles.badgeSet}>
        {p.adds.map((n) => (
          <div key={n}>
            {p.left} + ({n}) = {p.left + n}，{p.right} + ({n}) = {p.right + n}，所以仍是 {p.sign}。
          </div>
        ))}
      </SolutionStep>
      <SolutionStep badge="规律" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          不等式两边加同一个数，不等号的方向不变。减去同一个数也一样，因为减法可以看成加上相反数。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="探究：两边加同一个数"
      subtitle="先填 > 或 <，再看不等号变了没有"
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
        {p.adds.map((n) => (
          <div key={n}>
            {p.left} + ({n}){' '}
            <button type="button" onClick={() => cycle(n)} style={chip}>
              {marks[n] || '□'}
            </button>{' '}
            {p.right} + ({n})
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
