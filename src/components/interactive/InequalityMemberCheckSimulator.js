import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return {
    coef: 2,
    add: 3,
    bound: 9,
    values: [-4, -2, 0, 3, 3.01, 4, 6, 100],
  };
}

function generate() {
  const coef = randInt(2, 4);
  const cut = randInt(2, 6);
  const add = randInt(1, 5);
  const bound = coef * cut + add;
  const values = [cut - 4, cut - 1, 0, cut, cut + 0.01, cut + 1, cut + 3, cut + 10].filter(
    (n, i, arr) => arr.indexOf(n) === i,
  );
  return { coef, add, bound, values };
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function InequalityMemberCheckSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [marks, setMarks] = useState({});

  function holds(n) {
    return p.coef * n + p.add > p.bound;
  }

  const yes = p.values.filter(holds);
  const no = p.values.filter((n) => !holds(n));
  const cut = (p.bound - p.add) / p.coef;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="化" badgeClass={stepStyles.badgeSet}>
        {p.coef}x + {p.add} &gt; {p.bound}，两边减 {p.add} 再除以 {p.coef}，方向不变，解集是 x &gt; {cut}。
      </SolutionStep>
      <SolutionStep badge="判" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          是解：{yes.join('，')}。不是解：{no.join('，')}。等于 {cut} 时不等式不成立。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="复习巩固 1 哪些数是解？"
      subtitle="先化成 x > m，再逐个判断"
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
        不等式 {p.coef}x + {p.add} &gt; {p.bound}。点每个数，标成「是」或「不是」。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {p.values.map((n) => {
          const mark = marks[n];
          const ok = mark && ((mark === 'yes') === holds(n));
          return (
            <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ minWidth: 48 }}>{n}</span>
              <button type="button" style={chip} onClick={() => setMarks((prev) => ({ ...prev, [n]: 'yes' }))}>是</button>
              <button type="button" style={chip} onClick={() => setMarks((prev) => ({ ...prev, [n]: 'no' }))}>不是</button>
              {mark ? <span>{ok ? '对。' : '再代入算一次。'}</span> : null}
            </div>
          );
        })}
      </div>
    </ProblemShell>
  );
}
