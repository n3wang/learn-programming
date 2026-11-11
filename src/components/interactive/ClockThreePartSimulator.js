import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
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
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  const ans = useMemo(() => hands(p.hour, p.minute), [p]);
  usePracticeAnswer([degField("h", "(1) 时针 1 小时转", 30), degField("m", "(2) 分针 1 分钟转", 6), degField("ang", `(3) ${p.hour} 时 ${p.minute} 分的夹角`, ans.angle)]);

  const solution = (
    <Solution legend={[[BLUE, '每单位时间转的角'], [GREEN, '所求']]}>
      <Step b="(1)" kind="set">
        时针 12 小时转一圈（360°）：
        <EqBox lines={[`360^\\circ \\div 12 = ${c(GREEN, '30^\\circ')}\\ \\text{（每小时）}`]} />
      </Step>
      <Step b="(2)" kind="list">
        分针 60 分钟转一圈：
        <EqBox lines={[`360^\\circ \\div 60 = ${c(GREEN, '6^\\circ')}\\ \\text{（每分钟）}`]} />
        所以时针每分钟转 <M t="30^\circ \div 60 = 0.5^\circ" />。
      </Step>
      <Step b="(3)" kind="solve">
        都从 12 点的方向开始量，按顺时针算：
        <EqBox
          lines={[
            `\\text{时针} = ${p.hour % 12} \\times ${c(BLUE, '30^\\circ')} + ${p.minute} \\times ${c(BLUE, '0.5^\\circ')} = ${ans.hourDeg}^\\circ`,
            `\\text{分针} = ${p.minute} \\times ${c(BLUE, '6^\\circ')} = ${ans.minuteDeg}^\\circ`,
            `|${ans.hourDeg}^\\circ - ${ans.minuteDeg}^\\circ| = ${Math.abs(ans.hourDeg - ans.minuteDeg)}^\\circ${
              Math.abs(ans.hourDeg - ans.minuteDeg) > 180
                ? ` \\;\\Rightarrow\\; 360^\\circ - ${Math.abs(ans.hourDeg - ans.minuteDeg)}^\\circ = ${c(GREEN, `${ans.angle}^\\circ`)}`
                : ` = ${c(GREEN, `${ans.angle}^\\circ`)}`
            }`,
          ]}
        />
        两针的夹角取不超过 180° 的那个。别忘了：分针走动时，时针也在走（每分钟 0.5°）。
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          (1) 30°；(2) 6°；(3) {p.hour} 时 {p.minute} 分，两针夹角是 {ans.angle}°。
        </Answer>
      </Step>
    </Solution>
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
