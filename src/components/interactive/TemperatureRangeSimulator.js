import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
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
  const [p, setP] = useState(bookDay);
  const [picked, setPicked] = useState(null);
  const answer = `${p.low} ≤ t ≤ ${p.high}`;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="范" badgeClass={stepStyles.badgeSet}>
        最低 {p.low} °C 表示 t 不小于 {p.low}，最高 {p.high} °C 表示 t 不大于 {p.high}。最低、最高都取到，所以两端都包含。
      </SolutionStep>
      <SolutionStep badge="式" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>{answer}。也可以写成 {p.low} ≤ t 且 t ≤ {p.high}。</div>
      </SolutionStep>
    </div>
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
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {choices(p.low, p.high).map((choice) => (
          <button key={choice} type="button" style={chip} onClick={() => setPicked(choice)}>
            {choice}
          </button>
        ))}
      </div>
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
