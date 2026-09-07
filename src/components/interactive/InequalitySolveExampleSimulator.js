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

const BOOK = [
  {
    id: '1',
    text: 'x − 7 > 26',
    property: '性质 1',
    move: '两边加 7，不等号方向不变',
    steps: ['x − 7 + 7 > 26 + 7', 'x > 33'],
    result: 'x > 33',
    bound: 33,
    boundLabel: '33',
    dir: 'right',
    drawnInBook: true,
  },
  {
    id: '2',
    text: '3x < 2x + 1',
    property: '性质 1',
    move: '两边减 2x，不等号方向不变',
    steps: ['3x − 2x < 2x + 1 − 2x', 'x < 1'],
    result: 'x < 1',
    bound: 1,
    boundLabel: '1',
    dir: 'left',
    drawnInBook: true,
  },
  {
    id: '3',
    text: '(2/3)x > 50',
    property: '性质 2',
    move: '两边乘 3/2，不等号方向不变',
    steps: ['(3/2) × (2/3)x > (3/2) × 50', 'x > 75'],
    result: 'x > 75',
    bound: 75,
    boundLabel: '75',
    dir: 'right',
    drawnInBook: false,
  },
  {
    id: '4',
    text: '−4x > 3',
    property: '性质 3',
    move: '两边除以 −4，不等号方向改变',
    steps: ['(−4x)/(−4) < 3/(−4)', 'x < −3/4'],
    result: 'x < −3/4',
    bound: -0.75,
    boundLabel: '−3/4',
    dir: 'left',
    drawnInBook: false,
  },
];

function randomProblem() {
  const kind = randInt(1, 4);
  if (kind === 1) {
    const a = randInt(3, 12);
    const b = randInt(8, 30);
    const bound = a + b;
    return {
      id: 'r',
      text: `x − ${a} > ${b}`,
      property: '性质 1',
      move: `两边加 ${a}，不等号方向不变`,
      steps: [`x − ${a} + ${a} > ${b} + ${a}`, `x > ${bound}`],
      result: `x > ${bound}`,
      bound,
      boundLabel: String(bound),
      dir: 'right',
      drawnInBook: false,
    };
  }
  if (kind === 2) {
    const a = randInt(2, 6);
    const c = randInt(2, 9);
    return {
      id: 'r',
      text: `${a + 1}x < ${a}x + ${c}`,
      property: '性质 1',
      move: `两边减 ${a}x，不等号方向不变`,
      steps: [`${a + 1}x − ${a}x < ${a}x + ${c} − ${a}x`, `x < ${c}`],
      result: `x < ${c}`,
      bound: c,
      boundLabel: String(c),
      dir: 'left',
      drawnInBook: false,
    };
  }
  if (kind === 3) {
    const k = randInt(8, 24);
    const bound = 3 * k;
    return {
      id: 'r',
      text: `(2/3)x > ${2 * k}`,
      property: '性质 2',
      move: '两边乘 3/2，不等号方向不变',
      steps: [`(3/2) × (2/3)x > (3/2) × ${2 * k}`, `x > ${bound}`],
      result: `x > ${bound}`,
      bound,
      boundLabel: String(bound),
      dir: 'right',
      drawnInBook: false,
    };
  }
  const coef = randInt(2, 6);
  const num = randInt(1, 9);
  return {
    id: 'r',
    text: `−${coef}x > ${num}`,
    property: '性质 3',
    move: `两边除以 −${coef}，不等号方向改变`,
    steps: [`(−${coef}x)/(−${coef}) < ${num}/(−${coef})`, `x < −${formatBound(num, coef)}`],
    result: `x < −${formatBound(num, coef)}`,
    bound: -num / coef,
    boundLabel: `−${formatBound(num, coef)}`,
    dir: 'left',
    drawnInBook: false,
  };
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 10px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function InequalitySolveExampleSimulator() {
  const [key, setKey] = useState(0);
  const [mode, setMode] = useState('book');
  const [problem, setProblem] = useState(null);
  const [picks, setPicks] = useState({});

  const items = mode === 'book' ? BOOK : [problem];

  function setDir(id, dir) {
    setPicks((prev) => ({ ...prev, [id]: dir }));
  }

  const solution = (
    <div className={stepStyles.solution}>
      {items.filter(Boolean).map((item) => (
        <SolutionStep key={item.id} badge={item.id === 'r' ? '解' : item.id} badgeClass={stepStyles.badgeSet}>
          {item.text}。根据{item.property}，{item.move}。
          {item.steps.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>解集 {item.result}。数轴上在 {item.boundLabel} 处画空心圆圈，向{item.dir === 'right' ? '右' : '左'}画射线。</div>
          <SolutionSetNumberLine label={item.boundLabel} dir={item.dir} />
        </SolutionStep>
      ))}
      <SolutionStep badge="集" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {mode === 'book'
            ? '（1）x > 33；（2）x < 1；（3）x > 75；（4）x < −3/4。空心圆圈表示不包含端点。'
            : `${problem.result}。空心圆圈表示不包含 ${problem.boundLabel}。`}
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="例 3 解不等式，并在数轴上表示解集"
      subtitle="用性质化成 x > m 或 x < m，空心圆圈不包含端点"
      problemKey={key}
      onRandomize={() => {
        setMode('random');
        setProblem(randomProblem());
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setMode('book');
        setProblem(null);
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        {mode === 'book'
          ? '（1）（2）课本已经画在数轴上。（3）（4）请你选射线方向。'
          : '随机一题，步骤和书上例 3 相同。选出解集在数轴上的方向。'}
      </p>
      {items.filter(Boolean).map((item) => {
        const chosen = picks[item.id];
        const ok = chosen && chosen === item.dir;
        const showRay = item.drawnInBook || ok;
        return (
          <div key={item.id} style={{ marginBottom: 12 }}>
            <div>
              {item.id === 'r' ? '不等式' : `（${item.id}）`} {item.text}
              {item.drawnInBook ? `，解集 ${item.result}` : null}
            </div>
            {!item.drawnInBook ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '6px 0' }}>
                <button type="button" style={chip} onClick={() => setDir(item.id, 'right')}>
                  向右（大于）
                </button>
                <button type="button" style={chip} onClick={() => setDir(item.id, 'left')}>
                  向左（小于）
                </button>
                {chosen ? (
                  <span>
                    {ok
                      ? `对，解集 ${item.result}`
                      : item.property === '性质 3'
                        ? '再想一想：乘或除以负数时要变向。'
                        : '再想一想：这一步不等号方向不变。'}
                  </span>
                ) : null}
              </div>
            ) : null}
            {showRay ? (
              <SolutionSetNumberLine label={item.boundLabel} dir={item.drawnInBook ? item.dir : chosen} />
            ) : null}
          </div>
        );
      })}
    </ProblemShell>
  );
}
