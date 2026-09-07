import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { deg: 35, d: 38, m: 15, decimal: 38.15 };
}

function generate() {
  const deg = randInt(2, 5) * 10 + 5;
  const d = randInt(2, 5) * 10 + 8;
  const m = [10, 12, 15, 20][randInt(0, 3)];
  const decimal = Number((d + (m - 6) / 100).toFixed(2));
  return { deg, d, m, decimal };
}

export default function DegreeConvertCompareSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const minutes = p.deg * 60;
  const seconds = minutes * 60;
  const fromDms = useMemo(() => p.d + p.m / 60, [p]);
  const larger = fromDms > p.decimal ? `${p.d}°${p.m}′` : `${p.decimal}°`;

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        1° = 60′，1′ = 60″。{p.deg}° = {minutes}′ = {seconds}″。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {p.d}°{p.m}′ = {p.d} + {p.m}/60 = {fromDms}°。
          {p.decimal}° 里小数部分要先乘 60 才是分，不能直接当成分。
          两者不相等，{larger} 更大。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 3：度、分、秒与小数"
      subtitle="分是六十分之一度，不是小数点后的一位"
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
      <p style={{ marginTop: 0 }}>{p.deg}° 等于多少分？等于多少秒？</p>
      <p>
        {p.d}°{p.m}′ 和 {p.decimal}° 相等吗？如不相等，哪一个大？
      </p>
    </ProblemShell>
  );
}
