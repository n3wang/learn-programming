import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';
import SolutionSetNumberLine from '@site/src/components/interactive/shell/SolutionSetNumberLine';

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function formatBound(num, den = 1) {
  const g = gcd(num, den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return String(n).replace('-', '−');
  const sign = n < 0 ? '−' : '';
  return `${sign}${Math.abs(n)}/${d}`;
}

function bookItems() {
  return [
    {
      id: '1',
      text: 'x + 5 > −1',
      property: '性质 1',
      move: '两边减 5，不等号方向不变',
      steps: ['x + 5 − 5 > −1 − 5', 'x > −6'],
      result: 'x > −6',
      boundLabel: '−6',
      dir: 'right',
      closed: false,
    },
    {
      id: '2',
      text: '4x < 3x + 5',
      property: '性质 1',
      move: '两边减 3x，不等号方向不变',
      steps: ['4x − 3x < 3x + 5 − 3x', 'x < 5'],
      result: 'x < 5',
      boundLabel: '5',
      dir: 'left',
      closed: false,
    },
    {
      id: '3',
      text: '(1/7)x ≤ 6/7',
      property: '性质 2',
      move: '两边乘 7，不等号方向不变；原来是 ≤，端点仍包含',
      steps: ['7 × (1/7)x ≤ 7 × (6/7)', 'x ≤ 6'],
      result: 'x ≤ 6',
      boundLabel: '6',
      dir: 'left',
      closed: true,
    },
    {
      id: '4',
      text: '−8x > 10',
      property: '性质 3',
      move: '两边除以 −8，不等号方向改变',
      steps: ['(−8x)/(−8) < 10/(−8)', 'x < −5/4'],
      result: 'x < −5/4',
      boundLabel: '−5/4',
      dir: 'left',
      closed: false,
    },
  ];
}

function randomItems() {
  const a = randInt(2, 9);
  const b = randInt(1, 8);
  const c = randInt(2, 8);
  const k = randInt(2, 8);
  const n = randInt(1, 9);
  const coef = randInt(2, 6);
  const num = randInt(1, 9);
  return [
    {
      id: '1',
      text: `x + ${a} > −${b}`,
      property: '性质 1',
      move: `两边减 ${a}，不等号方向不变`,
      steps: [`x + ${a} − ${a} > −${b} − ${a}`, `x > −${a + b}`],
      result: `x > −${a + b}`,
      boundLabel: `−${a + b}`,
      dir: 'right',
      closed: false,
    },
    {
      id: '2',
      text: `${c + 1}x < ${c}x + ${k}`,
      property: '性质 1',
      move: `两边减 ${c}x，不等号方向不变`,
      steps: [`${c + 1}x − ${c}x < ${c}x + ${k} − ${c}x`, `x < ${k}`],
      result: `x < ${k}`,
      boundLabel: String(k),
      dir: 'left',
      closed: false,
    },
    {
      id: '3',
      text: `(1/${n + 1})x ≤ ${n}/${n + 1}`,
      property: '性质 2',
      move: `两边乘 ${n + 1}，方向不变；原来是 ≤，端点仍包含`,
      steps: [`${n + 1} × (1/${n + 1})x ≤ ${n + 1} × ${n}/${n + 1}`, `x ≤ ${n}`],
      result: `x ≤ ${n}`,
      boundLabel: String(n),
      dir: 'left',
      closed: true,
    },
    {
      id: '4',
      text: `−${coef}x > ${num}`,
      property: '性质 3',
      move: `两边除以 −${coef}，不等号方向改变`,
      steps: [`(−${coef}x)/(−${coef}) < ${num}/(−${coef})`, `x < −${formatBound(num, coef)}`],
      result: `x < −${formatBound(num, coef)}`,
      boundLabel: `−${formatBound(num, coef)}`,
      dir: 'left',
      closed: false,
    },
  ];
}

function choicesFor(item) {
  const at = item.boundLabel;
  return [`x > ${at}`, `x ≥ ${at}`, `x < ${at}`, `x ≤ ${at}`];
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function InequalitySolvePracticeSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookItems);
  const [picks, setPicks] = useState({});

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((item) => (
        <SolutionStep key={item.id} badge={item.id} badgeClass={stepStyles.badgeSet}>
          {item.text}。根据{item.property}，{item.move}。
          {item.steps.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>
            解集 {item.result}。{item.closed ? '实心圆圈，端点包含。' : '空心圆圈，端点不包含。'}
            射线向{item.dir === 'right' ? '右' : '左'}。
            <SolutionSetNumberLine label={item.boundLabel} dir={item.dir} closed={item.closed} />
          </div>
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="练习 2 解不等式并画解集"
      subtitle="≤ 用实心圆圈，> 和 < 用空心圆圈"
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
      <p style={{ marginTop: 0 }}>先选出解集，再看数轴画法。</p>
      {items.map((item) => {
        const picked = picks[item.id];
        const ok = picked === item.result;
        return (
          <div key={item.id} style={{ marginBottom: 12 }}>
            <div>（{item.id}） {item.text}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
              {choicesFor(item).map((choice) => (
                <button key={choice} type="button" style={chip} onClick={() => setPicks((prev) => ({ ...prev, [item.id]: choice }))}>
                  {choice}
                </button>
              ))}
            </div>
            {picked ? (
              <div>
                {ok
                  ? '对。'
                  : item.property === '性质 3'
                    ? '再想一想：除以负数要变向，原来是 >，端点不包含。'
                    : '再想一想：这一步方向不变，还要看原来是 > 还是 ≤。'}
              </div>
            ) : null}
            {ok ? (
              <SolutionSetNumberLine label={item.boundLabel} dir={item.dir} closed={item.closed} />
            ) : null}
          </div>
        );
      })}
    </ProblemShell>
  );
}
