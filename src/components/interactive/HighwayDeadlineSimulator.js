import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { ineqField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { distance: 210, hours: 2, start: '6:00', end: '8:00' };
}

function generate() {
  const hours = randInt(2, 4);
  const speed = randInt(12, 28) * 5;
  return { distance: speed * hours, hours, start: '6:00', end: `${6 + hours}:00` };
}

export default function HighwayDeadlineSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([ineqField("v", "车速 x（km/h）应满足", `x > ${p.distance / p.hours}`)]);
  const minSpeed = useMemo(() => p.distance / p.hours, [p]);

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '车速的条件']]}>
      <Step b="设" kind="set">
        设车速为 <M t="x" /> km/h。要在 {p.end} 之前驶过 A 地，就是用的时间要<b>少于</b> {p.hours} h，或者说 {p.hours} h
        走的路要<b>超过</b> {p.distance} km。
      </Step>
      <Step b="时" kind="list">
        从时间看（时间 = 路程 ÷ 速度）：
        <EqBox lines={[`\\dfrac{${c(BLUE, p.distance)}}{x} < ${c(BLUE, p.hours)}`]} />
      </Step>
      <Step b="路" kind="solve">
        从路程看（路程 = 速度 × 时间）：
        <EqBox
          lines={[
            `${c(BLUE, p.hours)}x > ${c(BLUE, p.distance)}`,
            `x > ${p.distance} \\div ${p.hours} = ${c(GREEN, minSpeed)}`,
          ]}
        />
        两种写法表示同一个不等关系，解出来一样。
      </Step>
      <Step b="答" kind="answer">
        <Answer>车速 x 应满足 x &gt; {minSpeed}，即车速要大于 {minSpeed} km/h。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="问题：赶在时刻之前到达"
      subtitle="同一个不等关系，可以从时间或路程来写"
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
        一辆汽车匀速行驶。{p.start} 时距前方 A 地 {p.distance} km，要在 {p.end} 之前驶过 A 地。车速 x km/h 应满足什么条件？
      </p>
    </ProblemShell>
  );
}
