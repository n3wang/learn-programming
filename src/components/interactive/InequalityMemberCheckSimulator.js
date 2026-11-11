import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { choiceField } from '@site/src/components/interactive/shell/practiceFields';
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
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  const [marks, setMarks] = useState({});

  function holds(n) {
    return p.coef * n + p.add > p.bound;
  }

  const yes = p.values.filter(holds);
  const no = p.values.filter((n) => !holds(n));
  const cut = (p.bound - p.add) / p.coef;
  usePracticeAnswer(p.values.map((n, i) => choiceField(`v${i}`, `x = ${n} 是解吗？`, ["是", "不是"], holds(n) ? "是" : "不是")));

  const solution = (
    <Solution legend={[[ORANGE, '分界点'], [GREEN, '是解'], [RED, '不是解']]}>
      <Step b="化" kind="set">
        先把不等式化简成 <M t="x > a" />：
        <EqBox
          lines={[
            `${p.coef}x + ${p.add} > ${p.bound}`,
            `${p.coef}x > ${p.bound} - ${p.add} = ${p.bound - p.add}\\quad(\\text{性质 1})`,
            `x > ${c(ORANGE, cut)}\\quad(\\text{性质 2：除以正数 } ${p.coef})`,
          ]}
        />
      </Step>
      <Step b="判" kind="solve">
        比 {cut} 大的是解；等于或小于 {cut} 的都不是解：
        <EqBox
          lines={[
            `${c(GREEN, '\\text{是解：}')}\\ ${yes.join(',\\ ') || '\\text{无}'}`,
            `${c(RED, '\\text{不是解：}')}\\ ${no.join(',\\ ') || '\\text{无}'}`,
          ]}
        />
        特别注意 <M t={`x = ${cut}`} />：代入得 <M t={`${p.coef}\\times ${cut} + ${p.add} = ${p.bound}`} />，等于 {p.bound}，不满足「&gt;」。
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          是解：{yes.join('，') || '无'}；不是解：{no.join('，') || '无'}。
        </Answer>
      </Step>
    </Solution>
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
        不等式 {p.coef}x + {p.add} &gt; {p.bound}。{practice ? '下面每个数是不是它的解？' : '点每个数，标成「是」或「不是」。'}
      </p>
      {!practice ? (
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
      ) : null}
    </ProblemShell>
  );
}
