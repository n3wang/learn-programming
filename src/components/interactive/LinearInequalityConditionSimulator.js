import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookItems() {
  return [
    {
      id: '1',
      prompt: '2(x + 1) 大于或等于 1',
      setup: '2(x + 1) ≥ 1',
      steps: ['2x + 2 ≥ 1', '2x ≥ −1', 'x ≥ −1/2'],
      result: 'x ≥ −1/2',
    },
    {
      id: '2',
      prompt: '4x 与 7 的和不小于 6',
      setup: '4x + 7 ≥ 6',
      steps: ['4x ≥ −1', 'x ≥ −1/4'],
      result: 'x ≥ −1/4',
    },
    {
      id: '3',
      prompt: 'y 与 1 的差不大于 2y 与 3 的差',
      setup: 'y − 1 ≤ 2y − 3',
      steps: ['y − 2y ≤ −3 + 1', '−y ≤ −2', '两边除以 −1，方向改变：y ≥ 2'],
      result: 'y ≥ 2',
    },
    {
      id: '4',
      prompt: '3y 与 7 的和的 1/4 小于 −2',
      setup: '(3y + 7)/4 < −2',
      steps: ['3y + 7 < −8', '3y < −15', 'y < −5'],
      result: 'y < −5',
    },
  ];
}

function randomItems() {
  const n = randInt(2, 6);
  return [
    {
      id: '1',
      prompt: `${n}(x + 1) 大于或等于 ${n}`,
      setup: `${n}(x + 1) ≥ ${n}`,
      steps: [`${n}x + ${n} ≥ ${n}`, `${n}x ≥ 0`, 'x ≥ 0'],
      result: 'x ≥ 0',
    },
    {
      id: '2',
      prompt: `${n}x 与 3 的和不小于 3`,
      setup: `${n}x + 3 ≥ 3`,
      steps: [`${n}x ≥ 0`, 'x ≥ 0'],
      result: 'x ≥ 0',
    },
    {
      id: '3',
      prompt: 'y 与 2 的差不大于 3y 与 6 的差',
      setup: 'y − 2 ≤ 3y − 6',
      steps: ['y − 3y ≤ −6 + 2', '−2y ≤ −4', '两边除以 −2，方向改变：y ≥ 2'],
      result: 'y ≥ 2',
    },
    {
      id: '4',
      prompt: '2y 与 1 的和的 1/2 小于 −1',
      setup: '(2y + 1)/2 < −1',
      steps: ['2y + 1 < −2', '2y < −3', 'y < −3/2'],
      result: 'y < −3/2',
    },
  ];
}

function choices(item) {
  const letter = item.result[0];
  const at = item.result.replace(/^[xy]\s*[<>≤≥]\s*/, '');
  return [`${letter} < ${at}`, `${letter} ≤ ${at}`, `${letter} > ${at}`, `${letter} ≥ ${at}`];
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function LinearInequalityConditionSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookItems);
  const [picks, setPicks] = useState({});

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((item) => (
        <SolutionStep key={item.id} badge={item.id} badgeClass={stepStyles.badgeSet}>
          {item.prompt}，先写成 {item.setup}。
          {item.steps.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>条件是 {item.result}。</div>
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="练习 2 什么条件下关系成立？"
      subtitle="不小于写成 ≥，不大于写成 ≤"
      problemKey={key}
      onRandomize={() => {
        setItems(randomItems());
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setItems(bookItems());
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      {items.map((item) => {
        const picked = picks[item.id];
        const ok = picked === item.result;
        return (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <div>（{item.id}）{item.prompt}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {choices(item).map((choice) => (
                <button key={choice} type="button" style={chip} onClick={() => setPicks((prev) => ({ ...prev, [item.id]: choice }))}>
                  {choice}
                </button>
              ))}
            </div>
            {picked ? <div>{ok ? '对。' : '先把话写成不等式，再解。'}</div> : null}
          </div>
        );
      })}
    </ProblemShell>
  );
}
