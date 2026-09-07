import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { coef: 2, bound: 210 };
}

function generate() {
  const coef = randInt(2, 5);
  const cut = randInt(8, 18) * 5;
  return { coef, bound: coef * cut };
}

function trials(cut) {
  return [cut - 15, cut - 5, cut, cut + 5, cut + 15];
}

export default function InequalitySolutionSetSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [picked, setPicked] = useState(110);
  const cut = useMemo(() => p.bound / p.coef, [p]);
  const values = useMemo(() => trials(cut), [cut]);
  const product = p.coef * picked;
  const holds = product > p.bound;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="试" badgeClass={stepStyles.badgeSet}>
        当 x = {cut - 15} 时，{p.coef}x = {p.coef * (cut - 15)}，不等式不成立。当 x = {cut + 5} 时，{p.coef}x = {p.coef * (cut + 5)}，不等式成立。
      </SolutionStep>
      <SolutionStep badge="集" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          任意大于 {cut} 的数都是解，这样的解有无数个。解集是 x &gt; {cut}。数轴上在 {cut} 处画空心圆圈，向右画射线，表示不包含这个点。
        </div>
      </SolutionStep>
    </div>
  );

  const min = cut - 40;
  const max = cut + 50;
  const xOf = (n) => 28 + ((n - min) / (max - min)) * 224;

  return (
    <ProblemShell
      title="探究：哪些数是不等式的解？"
      subtitle="代入几个数，再看解集在数轴上怎么画"
      problemKey={key}
      onRandomize={() => {
        const next = generate();
        setP(next);
        setPicked(next.bound / next.coef + 5);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setPicked(110);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        不等式 {p.coef}x &gt; {p.bound}。点一个数试一试：它是不是这个不等式的解？
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPicked(n)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: picked === n ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            x = {n}
          </button>
        ))}
      </div>
      <p>
        {p.coef} × {picked} = {product}。{holds ? `${product} > ${p.bound}，所以 ${picked} 是解。` : `${product} 不大于 ${p.bound}，所以 ${picked} 不是解。`}
      </p>
      <svg viewBox="0 0 280 72" width="100%" height="78">
        <line x1="20" y1="36" x2="258" y2="36" stroke="#455a64" strokeWidth="1.4" />
        <polygon points="258,36 248,31 248,41" fill="#455a64" />
        <line x1={xOf(cut)} y1="28" x2={xOf(cut) + 86} y2="36" stroke="#e91e63" strokeWidth="2.2" />
        <polygon points={`${xOf(cut) + 86},36 ${xOf(cut) + 76},31 ${xOf(cut) + 76},41`} fill="#e91e63" />
        <circle cx={xOf(cut)} cy="36" r="5" fill="none" stroke="#e91e63" strokeWidth="1.8" />
        <text x={xOf(cut) - 10} y="58" fontSize="12">{cut}</text>
        <text x="248" y="28" fontSize="12">x</text>
      </svg>
      <p>空心圆圈表示解集不包含 {cut}。</p>
    </ProblemShell>
  );
}
