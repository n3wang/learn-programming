import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { d: 21, m: 17, n: 5, div: 11, whole: 180 };
}

function generate() {
  return {
    d: randInt(10, 30),
    m: randInt(5, 40),
    n: randInt(3, 6),
    div: [7, 9, 11, 13][randInt(0, 3)],
    whole: 180,
  };
}

function formatMul(d, m, n) {
  const total = (d * 60 + m) * n;
  return { d: Math.floor(total / 60), m: total % 60 };
}

function formatDiv(whole, div) {
  const minutes = Math.round((whole * 60) / div);
  return { d: Math.floor(minutes / 60), m: minutes % 60 };
}

export default function DegreeMulDivSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const mul = useMemo(() => formatMul(p.d, p.m, p.n), [p]);
  const quot = useMemo(() => formatDiv(p.whole, p.div), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="乘" badgeClass={stepStyles.badgeSet}>
        度、分分别乘。分满 60 进 1°。
        {p.d}°{p.m}′ × {p.n} = {mul.d}°{mul.m}′。
      </SolutionStep>
      <SolutionStep badge="除" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {p.whole}° ÷ {p.div} 先分成、再四舍五入到分，约 {quot.d}°{quot.m}′。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 3：角度的乘与除"
      subtitle="分满 60 要进位，除不尽时精确到分"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>{p.d}°{p.m}′ × {p.n}。</p>
      <p>{p.whole}° ÷ {p.div}，精确到分。</p>
    </ProblemShell>
  );
}
