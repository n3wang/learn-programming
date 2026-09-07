import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function handsAngle(hour, minute) {
  const h = (hour % 12) * 30 + minute * 0.5;
  const m = minute * 6;
  const diff = Math.abs(h - m);
  return Math.min(diff, 360 - diff);
}

function bookProblem() {
  return [
    { hour: 6, minute: 0 },
    { hour: 8, minute: 0 },
    { hour: 8, minute: 30 },
  ];
}

function generate() {
  const hour = randInt(1, 11);
  const minute = [0, 15, 30][randInt(0, 2)];
  return [{ hour, minute }];
}

function Clock({ hour, minute }) {
  const h = ((hour % 12) * 30 + minute * 0.5 - 90) * (Math.PI / 180);
  const m = (minute * 6 - 90) * (Math.PI / 180);
  return (
    <svg viewBox="0 0 140 120" width="140" height="110">
      <circle cx="70" cy="58" r="40" fill="none" stroke="#1565c0" />
      <line x1="70" y1="58" x2={70 + Math.cos(h) * 24} y2={58 + Math.sin(h) * 24} stroke="#1565c0" strokeWidth="3" />
      <line x1="70" y1="58" x2={70 + Math.cos(m) * 34} y2={58 + Math.sin(m) * 34} stroke="#e91e63" strokeWidth="1.6" />
      <text x="46" y="112" fontSize="12">{hour} 时 {minute} 分</text>
    </svg>
  );
}

export default function ClockHandsAngleSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookProblem);
  const answers = useMemo(() => items.map((t) => handsAngle(t.hour, t.minute)), [items]);

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((t, i) => (
        <SolutionStep key={`${t.hour}-${t.minute}`} badge={String(i + 1)} badgeClass={stepStyles.badgeSet}>
          时针每小时转 30°，每分钟再转 0.5°；分针每分钟转 6°。
          {t.hour} 时 {t.minute} 分，两针夹角是 {answers[i]}°。
        </SolutionStep>
      ))}
      <SolutionStep badge="书题" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>6 时整是 180°，8 时整是 120°，8 时 30 分是 75°。</div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1：钟表上的角"
      subtitle="时针走得慢，分针走得快，先算出各自转过的角度"
      problemKey={key}
      onRandomize={() => {
        setItems(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setItems(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>钟表的时针和分针构成多少度的角？</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {items.map((t) => (
          <Clock key={`${t.hour}-${t.minute}`} hour={t.hour} minute={t.minute} />
        ))}
      </div>
    </ProblemShell>
  );
}
