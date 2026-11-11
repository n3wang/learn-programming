import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { choiceField } from '@site/src/components/interactive/shell/practiceFields';
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
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer(p.factors.map((n) => choiceField(`r${n}`, `${p.left} × (${n})　□　${p.right} × (${n})`, [">", "<"], n > 0 ? p.sign : flip(p.sign))));
  const [marks, setMarks] = useState({});

  function cycle(id) {
    setMarks((prev) => ({ ...prev, [id]: prev[id] === '>' ? '<' : '>' }));
  }

  const solution = (
    <Solution legend={[[BLUE, '乘的数'], [GREEN, '方向不变'], [RED, '方向改变']]}>
      <Step b="知" kind="set">
        已知 <M t={`${p.left} ${p.sign} ${p.right}`} />。两边都乘同一个数，算出来再比大小。
      </Step>
      <Step b="算" kind="list">
        <EqBox
          lines={p.factors.map((n) => {
            const next = n > 0 ? p.sign : flip(p.sign);
            return `${p.left} \\times (${c(BLUE, n)}) = ${p.left * n},\\quad ${p.right} \\times (${c(BLUE, n)}) = ${p.right * n} \\;\\Rightarrow\\; ${p.left * n} ${c(n > 0 ? GREEN : RED, next)} ${p.right * n}`;
          })}
        />
      </Step>
      <Step b="规律" kind="solve">
        <b>性质 2</b>：两边乘（或除以）同一个<b>正数</b>，方向<b>不变</b>。
        <br />
        <b>性质 3</b>：两边乘（或除以）同一个<b>负数</b>，方向<b style={{ color: RED }}>改变</b>——乘负数后，原来大的那边变成更小的负数。
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {p.factors.map((n) => `乘 ${n} 填「${n > 0 ? p.sign : flip(p.sign)}」`).join('；')}。
        </Answer>
      </Step>
    </Solution>
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
        已知 {p.left} {p.sign} {p.right}。{practice ? '在下面填出每一行的不等号。' : '点选每一行的不等号。'}
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {p.factors.map((n) => (
          <div key={n}>
            {p.left} × ({n}){' '}
            {practice ? (
              '□'
            ) : (
              <button type="button" onClick={() => cycle(n)} style={chip}>
                {marks[n] || '□'}
              </button>
            )}{' '}
            {p.right} × ({n})
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
