import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { rangeField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookDay() {
  return { low: 19, high: 28 };
}

function generate() {
  const low = randInt(8, 22);
  return { low, high: low + randInt(6, 14) };
}

function choices(low, high) {
  return [
    `${low} ≤ t ≤ ${high}`,
    `${low} < t < ${high}`,
    `t ≥ ${low}`,
    `t ≤ ${high}`,
  ];
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function TemperatureRangeSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookDay()));
  usePracticeAnswer([rangeField("t", "气温范围", `${p.low} ≤ t ≤ ${p.high}`)]);
  const [picked, setPicked] = useState(null);
  const answer = `${p.low} ≤ t ≤ ${p.high}`;

  const solution = (
    <Solution legend={[[BLUE, '最低 / 最高'], [GREEN, '范围']]}>
      <Step b="知" kind="set">
        气温在最低和最高之间变化，而且<b>最低、最高都取得到</b>，所以两端都用「≤」。
      </Step>
      <Step b="列" kind="list">
        <EqBox
          lines={[
            `\\text{最低} ${c(BLUE, p.low)}^\\circ\\text{C}:\\quad t \\ge ${p.low}`,
            `\\text{最高} ${c(BLUE, p.high)}^\\circ\\text{C}:\\quad t \\le ${p.high}`,
          ]}
        />
      </Step>
      <Step b="合" kind="solve">
        两个条件同时成立，合起来写成连写的形式：
        <EqBox lines={[c(GREEN, `${p.low} \\le t \\le ${p.high}`)]} />
      </Step>
      <Step b="答" kind="answer">
        <Answer>{answer}。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 3 用不等式表示气温范围"
      subtitle="最低、最高都取到，两端用 ≤"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookDay());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        某日最低气温是 {p.low} °C，最高气温是 {p.high} °C。用不等式表示这天的气温 t（单位：°C）的变化范围。
      </p>
      {!practice ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {choices(p.low, p.high).map((choice) => (
            <button key={choice} type="button" style={chip} onClick={() => setPicked(choice)}>
              {choice}
            </button>
          ))}
        </div>
      ) : null}
      {picked ? (
        <p>
          {picked === answer
            ? '对。最低和最高都取到，所以写成两边都带等号。'
            : '最低、最高都是达到的温度，不能只写一边，也不能把端点排除。'}
        </p>
      ) : null}
    </ProblemShell>
  );
}
