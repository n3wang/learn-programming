import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function End({ cx, cy, closed }) {
  return closed ? (
    <circle cx={cx} cy={cy} r="5" fill="#e91e63" />
  ) : (
    <circle cx={cx} cy={cy} r="5" fill="#fff" stroke="#e91e63" strokeWidth="1.8" />
  );
}

function NumberRay({ boundLabel, dir, closed }) {
  const cx = dir === 'right' ? 108 : 188;
  const axisY = 40;
  const rayY = 26;
  return (
    <svg viewBox="0 0 300 74" width="100%" height="80">
      <line x1="16" y1={axisY} x2="276" y2={axisY} stroke="#455a64" strokeWidth="1.4" />
      <polygon points="276,40 266,35 266,45" fill="#455a64" />
      {dir === 'right' ? (
        <>
          <path d={`M ${cx} ${axisY} L ${cx} ${rayY} L 250 ${rayY}`} fill="none" stroke="#e91e63" strokeWidth="2.2" />
          <polygon points="250,26 240,21 240,31" fill="#e91e63" />
        </>
      ) : (
        <>
          <path d={`M 36 ${rayY} L ${cx} ${rayY} L ${cx} ${axisY}`} fill="none" stroke="#e91e63" strokeWidth="2.2" />
          <polygon points="36,26 46,21 46,31" fill="#e91e63" />
        </>
      )}
      <End cx={cx} cy={axisY} closed={closed} />
      <text x={cx} y="62" textAnchor="middle" fontSize="13">{boundLabel}</text>
    </svg>
  );
}

function bookItems() {
  return [
    {
      id: '1',
      text: '3(x − 1) < x − 2',
      steps: [
        '去括号：3x − 3 < x − 2',
        '移项：3x − x < −2 + 3',
        '合并同类项：2x < 1',
        '系数化为 1：两边除以 2，方向不变，x < 1/2',
      ],
      result: 'x < 1/2',
      boundLabel: '1/2',
      dir: 'left',
      closed: false,
    },
    {
      id: '2',
      text: '(x − 5)/4 + 2 ≥ (5x + 1)/6',
      steps: [
        '去分母，两边乘 12：3(x − 5) + 24 ≥ 2(5x + 1)',
        '去括号：3x − 15 + 24 ≥ 10x + 2',
        '移项：3x − 10x ≥ 2 + 15 − 24',
        '合并同类项：−7x ≥ −7',
        '系数化为 1：两边除以 −7，方向改变，x ≤ 1',
      ],
      result: 'x ≤ 1',
      boundLabel: '1',
      dir: 'left',
      closed: true,
    },
  ];
}

function randomItems() {
  const a = randInt(2, 5);
  const b = randInt(1, 4);
  const left = a + 1;
  const boundNum = b + a;
  return [
    {
      id: '1',
      text: `${left}(x − 1) < x − ${b}`,
      steps: [
        `去括号：${left}x − ${left} < x − ${b}`,
        `移项：${left}x − x < −${b} + ${left}`,
        `合并同类项：${a}x < ${boundNum}`,
        `系数化为 1：x < ${boundNum}/${a}`,
      ],
      result: `x < ${boundNum}/${a}`,
      boundLabel: `${boundNum}/${a}`,
      dir: 'left',
      closed: false,
    },
    {
      id: '2',
      text: '2(x + 1) ≥ 3x − 1',
      steps: [
        '去括号：2x + 2 ≥ 3x − 1',
        '移项：2x − 3x ≥ −1 − 2',
        '合并同类项：−x ≥ −3',
        '系数化为 1：两边除以 −1，方向改变，x ≤ 3',
      ],
      result: 'x ≤ 3',
      boundLabel: '3',
      dir: 'left',
      closed: true,
    },
  ];
}

function choices(item) {
  const at = item.boundLabel;
  return [`x < ${at}`, `x ≤ ${at}`, `x > ${at}`, `x ≥ ${at}`];
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function LinearInequalityExampleSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookItems);
  const [picks, setPicks] = useState({});

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((item) => (
        <SolutionStep key={item.id} badge={item.id} badgeClass={stepStyles.badgeSet}>
          {item.text}。
          {item.steps.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>
            解集 {item.result}。{item.closed ? '实心' : '空心'}圆圈在 {item.boundLabel}，射线向{item.dir === 'right' ? '右' : '左'}。
          </div>
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="例 1 解一元一次不等式并画解集"
      subtitle="去分母、去括号、移项、合并同类项，再把系数化为 1"
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
      <p style={{ marginTop: 0 }}>选出解集。系数是负数时，不等号要变向。</p>
      {items.map((item) => {
        const picked = picks[item.id];
        const ok = picked === item.result;
        return (
          <div key={item.id} style={{ marginBottom: 12 }}>
            <div>（{item.id}）{item.text}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
              {choices(item).map((choice) => (
                <button key={choice} type="button" style={chip} onClick={() => setPicks((prev) => ({ ...prev, [item.id]: choice }))}>
                  {choice}
                </button>
              ))}
            </div>
            {picked ? <div>{ok ? '对。' : '再检查最后一步有没有除以负数。'}</div> : null}
            {ok ? <NumberRay boundLabel={item.boundLabel} dir={item.dir} closed={item.closed} /> : null}
          </div>
        );
      })}
    </ProblemShell>
  );
}
