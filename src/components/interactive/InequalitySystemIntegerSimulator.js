import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';
import InequalitySystemNumberLine from '@site/src/components/interactive/shell/InequalitySystemNumberLine';

function bookProblem() {
  return {
    text: '5x + 2 > 3(x − 1) 与 (1/2)x − 1 ≤ 7 − (3/2)x 都成立',
    lo: -2.5,
    loOpen: true,
    hi: 4,
    hiOpen: false,
    a: { at: -2.5, dir: 'right', closed: false, label: '−5/2' },
    b: { at: 4, dir: 'left', closed: true },
    pool: [-3, -2, -1, 0, 1, 2, 3, 4, 5],
    set: '−5/2 < x ≤ 4',
  };
}

function randomProblem() {
  const kinds = ['ex2', 'practice', 'compound'];
  const kind = kinds[randInt(0, kinds.length - 1)];
  if (kind === 'practice') {
    return {
      text: 'x + 3 > 6 与 2x − 1 < 10 都成立',
      lo: 3,
      loOpen: true,
      hi: 5.5,
      hiOpen: true,
      a: { at: 3, dir: 'right', closed: false },
      b: { at: 5.5, dir: 'left', closed: false, label: '11/2' },
      pool: [1, 2, 3, 4, 5, 6, 7],
      set: '3 < x < 11/2',
    };
  }
  if (kind === 'compound') {
    return {
      text: '2 ≤ 3x − 7 < 8',
      lo: 3,
      loOpen: false,
      hi: 5,
      hiOpen: true,
      a: { at: 3, dir: 'right', closed: true },
      b: { at: 5, dir: 'left', closed: false },
      pool: [1, 2, 3, 4, 5, 6],
      set: '3 ≤ x < 5',
    };
  }
  return bookProblem();
}

function integersIn(p) {
  return p.pool.filter((n) => {
    const left = p.loOpen ? n > p.lo : n >= p.lo;
    const right = p.hiOpen ? n < p.hi : n <= p.hi;
    return left && right;
  });
}

export default function InequalitySystemIntegerSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [picked, setPicked] = useState(() => new Set());
  const [checked, setChecked] = useState(false);

  const want = useMemo(() => new Set(integersIn(p)), [p]);
  const allCorrect =
    checked &&
    want.size === picked.size &&
    [...want].every((n) => picked.has(n));

  function load(next) {
    setP(next);
    setPicked(new Set());
    setChecked(false);
    setKey((k) => k + 1);
  }

  function toggle(n) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
    setChecked(false);
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="组" badgeClass={stepStyles.badgeSet}>
        先解成 {p.set}，再取出里面的整数。
      </SolutionStep>
      <SolutionStep badge="整" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>x = {[...want].join('，')}。</div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="不等式组的整数解"
      subtitle="先求公共解集，再从数轴上圈出落在里面的整数"
      problemKey={key}
      onRandomize={() => load(randomProblem())}
      onBook={() => load(bookProblem())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>点选所有使下面关系都成立的整数 x。</p>
      <p>{p.text}</p>
      <InequalitySystemNumberLine a={p.a} b={p.b} extraMarks={[0]} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {p.pool.map((n) => {
          const on = picked.has(n);
          const should = want.has(n);
          const border = !checked
            ? 'var(--ifm-color-emphasis-300)'
            : should && on
              ? '#2e7d32'
              : should || on
                ? '#c62828'
                : 'var(--ifm-color-emphasis-300)';
          return (
            <button
              key={n}
              type="button"
              onClick={() => toggle(n)}
              style={{
                minWidth: 40,
                padding: '6px 10px',
                borderRadius: 8,
                border: `2px solid ${border}`,
                background: on ? 'rgba(21,101,192,0.12)' : 'transparent',
                cursor: 'pointer',
                font: 'inherit',
                fontWeight: 700,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        <button
          type="button"
          onClick={() => setChecked(true)}
          style={{
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderRadius: 8,
            background: 'transparent',
            padding: '6px 12px',
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          检查
        </button>
        {allCorrect ? <span>这些整数都在 {p.set} 里。</span> : null}
        {checked && !allCorrect ? <span>端点是否取到，要看原来有没有等号。</span> : null}
      </div>
    </ProblemShell>
  );
}
