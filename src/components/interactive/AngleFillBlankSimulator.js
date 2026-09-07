import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function fmtMin(total) {
  const sign = total < 0 ? '-' : '';
  const abs = Math.abs(total);
  const d = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${d}°${m}′`;
}

function bookProblem() {
  return {
    tenths: 4,
    seconds: 12,
    add: [57, 31, 17, 39],
    mul: [25, 36, 4],
    div: [468, 6],
  };
}

function generate() {
  return {
    tenths: randInt(1, 9),
    seconds: randInt(1, 5) * 6,
    add: [randInt(20, 50), randInt(10, 40), randInt(12, 30), randInt(20, 40)],
    mul: [randInt(12, 28), randInt(8, 20), randInt(2, 5)],
    div: [randInt(12, 40) * 6, randInt(2, 6)],
  };
}

export default function AngleFillBlankSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const ans = useMemo(() => {
    const fromDeg = p.tenths * 6;
    const fromSec = p.seconds / 60;
    const add = (p.add[0] * 60 + p.add[1]) + (p.add[2] * 60 + p.add[3]);
    const mul = (p.mul[0] * 60 + p.mul[1]) * p.mul[2];
    const decimal = p.div[0] / 10 / p.div[1];
    const asMin = Math.round(decimal * 60);
    return {
      fromDeg,
      fromSec,
      add: fmtMin(add),
      mul: fmtMin(mul),
      decimal,
      asDms: fmtMin(asMin),
    };
  }, [p]);

  const decLabel = (p.div[0] / 10).toString();

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="换" badgeClass={stepStyles.badgeSet}>
        1° = 60′，所以 {(p.tenths / 10).toString()}° = {ans.fromDeg}′。
        1′ = 60″，所以 {p.seconds}″ = {ans.fromSec}′。
      </SolutionStep>
      <SolutionStep badge="算" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {p.add[0]}°{p.add[1]}′ + {p.add[2]}°{p.add[3]}′ = {ans.add}。
          {p.mul[0]}°{p.mul[1]}′ × {p.mul[2]} = {ans.mul}。
          {decLabel}° ÷ {p.div[1]} = {ans.decimal}° = {ans.asDms}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 3 题：填空"
      subtitle="1° = 60′，1′ = 60″；分满 60 向度进 1"
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
      <p style={{ marginTop: 0 }}>(1) {(p.tenths / 10).toString()}° = ____ ′</p>
      <p>(2) {p.seconds}″ = ____ ′</p>
      <p>(3) {p.add[0]}°{p.add[1]}′ + {p.add[2]}°{p.add[3]}′ = ____</p>
      <p>(4) {p.mul[0]}°{p.mul[1]}′ × {p.mul[2]} = ____</p>
      <p>(5) {decLabel}° ÷ {p.div[1]} = ____° = ____</p>
    </ProblemShell>
  );
}
