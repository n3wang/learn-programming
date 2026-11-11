import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
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
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookPractice()));
  const [marks, setMarks] = useState({});

  function cycle(id) {
    setMarks((prev) => ({ ...prev, [id]: prev[id] === '>' ? '<' : '>' }));
  }

  const bound = p.bound == null ? 3 : p.bound;
  usePracticeAnswer([
    { name: "r1", type: "ineq", display: "m + 5", value: { op: ">", bound: bound + 5 } },
    { name: "r2", type: "ineq", display: "\\dfrac{m}{6}", value: { op: ">", bound: bound / 6 } },
    { name: "r3", type: "ineq", display: "-2m", value: { op: "<", bound: -2 * bound } },
    { name: "r4", type: "ineq", display: "3m - 4", value: { op: ">", bound: 3 * bound - 4 } },
  ]);
  const ranges = [
    { id: 'r1', text: `m + 5 > ${bound + 5}`, why: '性质 1：两边加 5。' },
    { id: 'r2', text: `m/6 > ${bound}/6`, why: '性质 2：两边除以正数 6。' },
    { id: 'r3', text: `−2m < ${-2 * bound}`, why: '性质 3：两边乘 −2，方向改变。' },
    { id: 'r4', text: `3m − 4 > ${3 * bound - 4}`, why: '先乘正数 3，再减 4，方向不变。' },
  ];

  const solution =
    p.mode === 'compare' ? (
      <Solution legend={[[GREEN, '方向不变'], [RED, '方向改变']]}>
        <InequalityRules />
        <Step b="例" kind="list">
          已知 <M t="a > b" />：
          <EqBox
            lines={[
              `a + 3 ${c(GREEN, '>')} b + 3\\quad(\\text{性质 1：两边加 3})`,
              `-2a ${c(RED, '<')} -2b\\quad(\\text{性质 3：两边乘 } -2)`,
            ]}
          />
        </Step>
        <Step b="练" kind="solve">
          已知 <M t="p > q" />：
          <EqBox lines={ROWS.map((row) => `${plainToTex(row.left)} ${c(row.sign === '>' ? GREEN : RED, row.sign)} ${plainToTex(row.right)}\\quad(\\text{${row.why.replace(/[。]/g, '')}})`)} />
        </Step>
        <Step b="答" kind="answer">
          <Answer>{ROWS.map((row) => `${row.left} ${row.sign} ${row.right}`).join('；')}。</Answer>
        </Step>
      </Solution>
    ) : (
      <Solution legend={[[BLUE, '已知'], [GREEN, '范围'], [RED, '方向改变']]}>
        <InequalityRules />
        <Step b="变" kind="list">
          从 <M t={c(BLUE, `m > ${bound}`)} /> 出发，对两边做同样的运算：
          <EqBox
            lines={[
              `m + 5 > ${bound} + 5 \\;\\Rightarrow\\; ${c(GREEN, `m + 5 > ${bound + 5}`)}\\quad(\\text{性质 1})`,
              `\\dfrac{m}{6} > \\dfrac{${bound}}{6} \\;\\Rightarrow\\; ${c(GREEN, `\\dfrac{m}{6} > \\dfrac{${bound}}{6}`)}\\quad(\\text{性质 2：除以正数})`,
              `-2m \\;${c(RED, '<')}\\; -2\\times ${bound} \\;\\Rightarrow\\; ${c(GREEN, `-2m < ${-2 * bound}`)}\\quad(\\text{性质 3：乘负数，变号})`,
              `3m > ${3 * bound} \\;\\Rightarrow\\; 3m - 4 > ${3 * bound} - 4 \\;\\Rightarrow\\; ${c(GREEN, `3m - 4 > ${3 * bound - 4}`)}`,
            ]}
          />
        </Step>
        <Step b="答" kind="answer">
          <Answer>{ranges.map((row) => row.text).join('；')}。</Answer>
        </Step>
      </Solution>
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
