import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function toMinutes(d, m) {
  return d * 60 + m;
}

function format(total) {
  const sign = total < 0 ? -1 : 1;
  const abs = Math.abs(total);
  let d = Math.floor(abs / 60);
  let m = abs % 60;
  if (sign < 0) d = -d;
  return `${d}°${m}′`;
}

function bookProblem() {
  return {
    add: [48, 39, 67, 31],
    sub: [41, 12, 11, 27],
    straight: [53, 17],
  };
}

function generate() {
  return {
    add: [randInt(20, 50), randInt(10, 50), randInt(20, 50), randInt(10, 40)],
    sub: [randInt(30, 70), randInt(20, 50), randInt(8, 20), randInt(21, 55)],
    straight: [randInt(20, 80), randInt(1, 50)],
  };
}

export default function DegreeAddSubSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const answers = useMemo(() => {
    const add = toMinutes(p.add[0], p.add[1]) + toMinutes(p.add[2], p.add[3]);
    const sub = toMinutes(p.sub[0], p.sub[1]) - toMinutes(p.sub[2], p.sub[3]);
    const rest = toMinutes(179, 60) - toMinutes(p.straight[0], p.straight[1]);
    return { add: format(add), sub: format(sub), rest: format(rest) };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="加" badgeClass={stepStyles.badgeSet}>
        度与度、分与分分别相加。分满 60 进 1°。
        {p.add[0]}°{p.add[1]}′ + {p.add[2]}°{p.add[3]}′ = {answers.add}。
      </SolutionStep>
      <SolutionStep badge="减" badgeClass={stepStyles.badgeSet}>
        分不够减，向度借 1° 当 60′。
        {p.sub[0]}°{p.sub[1]}′ − {p.sub[2]}°{p.sub[3]}′ = {answers.sub}。
      </SolutionStep>
      <SolutionStep badge="平角" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          平角是 180°，先写成 179°60′，再减。角 BOC = 180° − {p.straight[0]}°{p.straight[1]}′ = {answers.rest}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="角度的加与减"
      subtitle="不够减时向度借 1°，当作 60′"
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
      <p style={{ marginTop: 0 }}>
        计算：{p.add[0]}°{p.add[1]}′ + {p.add[2]}°{p.add[3]}′；{p.sub[0]}°{p.sub[1]}′ − {p.sub[2]}°{p.sub[3]}′。
      </p>
      <p>
        O 在直线 AB 上，角 AOC = {p.straight[0]}°{p.straight[1]}′，求角 BOC。
      </p>
    </ProblemShell>
  );
}
