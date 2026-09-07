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
  return (
    <svg viewBox="0 0 300 74" width="100%" height="80">
      <line x1="16" y1="40" x2="276" y2="40" stroke="#455a64" strokeWidth="1.4" />
      <polygon points="276,40 266,35 266,45" fill="#455a64" />
      {dir === 'right' ? (
        <>
          <path d={`M ${cx} 40 L ${cx} 26 L 250 26`} fill="none" stroke="#e91e63" strokeWidth="2.2" />
          <polygon points="250,26 240,21 240,31" fill="#e91e63" />
        </>
      ) : (
        <>
          <path d={`M 36 26 L ${cx} 26 L ${cx} 40`} fill="none" stroke="#e91e63" strokeWidth="2.2" />
          <polygon points="36,26 46,21 46,31" fill="#e91e63" />
        </>
      )}
      <End cx={cx} cy="40" closed={closed} />
      <text x={cx} y="62" textAnchor="middle" fontSize="13">{boundLabel}</text>
    </svg>
  );
}

function bookItems() {
  return [
    {
      id: '1',
      text: '5x + 15 > 4x − 1',
      steps: ['移项：5x − 4x > −1 − 15', '合并同类项：x > −16'],
      result: 'x > −16',
      boundLabel: '−16',
      dir: 'right',
      closed: false,
    },
    {
      id: '2',
      text: '2(x + 5) ≤ 3(x − 5)',
      steps: ['去括号：2x + 10 ≤ 3x − 15', '移项：2x − 3x ≤ −15 − 10', '合并同类项：−x ≤ −25', '两边除以 −1，方向改变：x ≥ 25'],
      result: 'x ≥ 25',
      boundLabel: '25',
      dir: 'right',
      closed: true,
    },
    {
      id: '3',
      text: '(x − 1)/7 > (2x + 5)/3',
      steps: ['去分母，两边乘 21：3(x − 1) > 7(2x + 5)', '去括号：3x − 3 > 14x + 35', '移项：3x − 14x > 35 + 3', '合并同类项：−11x > 38', '两边除以 −11，方向改变：x < −38/11'],
      result: 'x < −38/11',
      boundLabel: '−38/11',
      dir: 'left',
      closed: false,
    },
    {
      id: '4',
      text: '(x + 1)/6 ≥ (2x − 5)/4 + 1',
      steps: ['去分母，两边乘 12：2(x + 1) ≥ 3(2x − 5) + 12', '去括号：2x + 2 ≥ 6x − 15 + 12', '合并：2x + 2 ≥ 6x − 3', '移项：2x − 6x ≥ −3 − 2', '合并同类项：−4x ≥ −5', '两边除以 −4，方向改变：x ≤ 5/4'],
      result: 'x ≤ 5/4',
      boundLabel: '5/4',
      dir: 'left',
      closed: true,
    },
  ];
}

function randomItems() {
  const a = randInt(3, 8);
  const k = randInt(2, 6);
  return [
    {
      id: '1',
      text: `${a + 1}x + ${a} > ${a}x − 2`,
      steps: [`移项：${a + 1}x − ${a}x > −2 − ${a}`, `合并同类项：x > −${a + 2}`],
      result: `x > −${a + 2}`,
      boundLabel: `−${a + 2}`,
      dir: 'right',
      closed: false,
    },
    {
      id: '2',
      text: `2(x + ${k}) ≤ 3(x − ${k})`,
      steps: [`去括号：2x + ${2 * k} ≤ 3x − ${3 * k}`, `移项：2x − 3x ≤ −${3 * k} − ${2 * k}`, `−x ≤ −${5 * k}`, `两边除以 −1，方向改变：x ≥ ${5 * k}`],
      result: `x ≥ ${5 * k}`,
      boundLabel: String(5 * k),
      dir: 'right',
      closed: true,
    },
    {
      id: '3',
      text: '(x − 1)/5 > (x + 3)/2',
      steps: ['去分母，两边乘 10：2(x − 1) > 5(x + 3)', '2x − 2 > 5x + 15', '2x − 5x > 15 + 2', '−3x > 17', '两边除以 −3，方向改变：x < −17/3'],
      result: 'x < −17/3',
      boundLabel: '−17/3',
      dir: 'left',
      closed: false,
    },
    {
      id: '4',
      text: '(x + 1)/2 ≥ (x − 1)/3 + 1',
      steps: ['去分母，两边乘 6：3(x + 1) ≥ 2(x − 1) + 6', '3x + 3 ≥ 2x − 2 + 6', '3x − 2x ≥ 4 − 3', 'x ≥ 1'],
      result: 'x ≥ 1',
      boundLabel: '1',
      dir: 'right',
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

export default function LinearInequalityDrillSimulator() {
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
          <div>解集 {item.result}。</div>
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="练习 1 解不等式并在数轴上表示"
      subtitle="带等号用实心圆圈；除以负数要变向"
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
          <div key={item.id} style={{ marginBottom: 12 }}>
            <div>（{item.id}）{item.text}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
              {choices(item).map((choice) => (
                <button key={choice} type="button" style={chip} onClick={() => setPicks((prev) => ({ ...prev, [item.id]: choice }))}>
                  {choice}
                </button>
              ))}
            </div>
            {picked ? <div>{ok ? '对。' : '先移项合并，再看系数的符号。'}</div> : null}
            {ok ? <NumberRay boundLabel={item.boundLabel} dir={item.dir} closed={item.closed} /> : null}
          </div>
        );
      })}
    </ProblemShell>
  );
}
