import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { choiceField } from '@site/src/components/interactive/shell/practiceFields';
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
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer(p.adds.map((n) => choiceField(`r${n}`, `${p.left} + (${n})　□　${p.right} + (${n})`, [">", "<"], p.sign)));
  const [marks, setMarks] = useState({});

  function cycle(id) {
    setMarks((prev) => ({ ...prev, [id]: prev[id] === '>' ? '<' : '>' }));
  }

  const solution = (
    <Solution legend={[[BLUE, '加的数'], [GREEN, '不等号']]}>
      <Step b="知" kind="set">
        已知 <M t={`${p.left} ${p.sign} ${p.right}`} />。两边都加上同一个数，算出来再比大小。
      </Step>
      <Step b="算" kind="list">
        <EqBox
          lines={p.adds.map(
            (n) =>
              `${p.left} + (${c(BLUE, n)}) = ${p.left + n},\\quad ${p.right} + (${c(BLUE, n)}) = ${p.right + n} \\;\\Rightarrow\\; ${p.left + n} ${c(GREEN, p.sign)} ${p.right + n}`,
          )}
        />
        不管加的是正数、0 还是负数，大的那边仍然大。
      </Step>
      <Step b="规律" kind="solve">
        <b>性质 1</b>：不等式两边加（或减）同一个数（或式子），不等号的方向<b>不变</b>。减去一个数，就是加上它的相反数。
      </Step>
      <Step b="答" kind="answer">
        <Answer>三行都填「{p.sign}」。</Answer>
      </Step>
    </Solution>
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
        已知 {p.left} {p.sign} {p.right}。{practice ? '在下面填出每一行的不等号。' : '点选每一行的不等号。'}
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {p.adds.map((n) => (
          <div key={n}>
            {p.left} + ({n}){' '}
            {practice ? (
              '□'
            ) : (
              <button type="button" onClick={() => cycle(n)} style={chip}>
                {marks[n] || '□'}
              </button>
            )}{' '}
            {p.right} + ({n})
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
