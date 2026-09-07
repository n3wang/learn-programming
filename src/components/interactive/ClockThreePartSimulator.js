import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function hands(hour, minute) {
  const hourDeg = (hour % 12) * 30 + minute * 0.5;
  const minuteDeg = minute * 6;
  const diff = Math.abs(hourDeg - minuteDeg);
  return { hourDeg, minuteDeg, angle: Math.min(diff, 360 - diff) };
}

function bookProblem() {
  return { hour: 3, minute: 25 };
}

function generate() {
  return { hour: randInt(1, 11), minute: randInt(0, 11) * 5 };
}

function Clock({ hour, minute }) {
  const h = ((hour % 12) * 30 + minute * 0.5 - 90) * (Math.PI / 180);
  const m = (minute * 6 - 90) * (Math.PI / 180);
  return (
    <svg viewBox="0 0 160 120" width="160" height="110">
      <circle cx="70" cy="56" r="40" fill="none" stroke="#1565c0" />
      <line x1="70" y1="56" x2={70 + Math.cos(h) * 22} y2={56 + Math.sin(h) * 24} stroke="#1565c0" strokeWidth="3" />
      <line x1="70" y1="56" x2={70 + Math.cos(m) * 32} y2={56 + Math.sin(m) * 34} stroke="#e91e63" strokeWidth="1.6" />
      <text x="28" y="114" fontSize="12">{hour} 时 {minute} 分</text>
    </svg>
  );
}

export default function ClockThreePartSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const ans = useMemo(() => hands(p.hour, p.minute), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="速" badgeClass={stepStyles.badgeSet}>
        钟面一圈 360°。时针 12 小时转一圈，1 小时转 30°。分针 60 分钟转一圈，1 分钟转 6°。时针每分钟还要再转 0.5°。
      </SolutionStep>
      <SolutionStep badge="夹角" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {p.hour} 时 {p.minute} 分，时针在 {ans.hourDeg}°，分针在 {ans.minuteDeg}°。
          夹角取较小的那个，是 {ans.angle}°。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 6 题：时钟上的角"
      subtitle="时针 30°/时，分针 6°/分"
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
      <p style={{ marginTop: 0 }}>(1) 时针 1 小时旋转多少度？(2) 分针 1 分钟旋转多少度？</p>
      <p>(3) {p.hour} 时 {p.minute} 分，时针与分针所成的角是多少度？</p>
      <Clock hour={p.hour} minute={p.minute} />
    </ProblemShell>
  );
}
