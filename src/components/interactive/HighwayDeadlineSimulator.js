import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
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
  const [p, setP] = useState(bookProblem);
  const minSpeed = useMemo(() => p.distance / p.hours, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="时" badgeClass={stepStyles.badgeSet}>
        从时间看：行驶 {p.distance} km 所用时间不到 {p.hours} h，写成 {p.distance}/x &lt; {p.hours}。
      </SolutionStep>
      <SolutionStep badge="路" badgeClass={stepStyles.badgeSet}>
        从路程看：{p.hours} h 驶过的路程要超过 {p.distance} km，写成 {p.hours}x &gt; {p.distance}。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          两式都得到 x &gt; {minSpeed}。车速应大于 {minSpeed} km/h。
        </div>
      </SolutionStep>
    </div>
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
