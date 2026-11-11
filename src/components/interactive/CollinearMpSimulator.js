import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { mn: 3, np: 1 };
}

function generate() {
  const np = randInt(1, 4);
  const mn = np + randInt(1, 5);
  return { mn, np };
}

function LineCase({ order, mn, np, scale }) {
  const x = { M: 28 };
  if (order === 'MNP') {
    x.N = x.M + mn * scale;
    x.P = x.N + np * scale;
  } else {
    x.P = x.M + (mn - np) * scale;
    x.N = x.M + mn * scale;
  }
  const end = Math.max(x.M, x.N, x.P) + 16;
  return (
    <svg viewBox="0 0 320 64" width="100%" height="64">
      <line x1="16" y1="28" x2={end} y2="28" stroke="#1565c0" strokeWidth="1.6" />
      {['M', 'N', 'P'].map((name) => (
        <g key={name}>
          <circle cx={x[name]} cy="28" r="3.4" fill="#c62828" />
          <text x={x[name] - 4} y="48" fontSize="13">{name}</text>
        </g>
      ))}
    </svg>
  );
}

export default function CollinearMpSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([numberField("long", "N 在 M、P 之间时 MP（cm）", p.mn + p.np, "MP"), numberField("short", "P 在 M、N 之间时 MP（cm）", p.mn - p.np, "MP")]);
  const sums = useMemo(() => ({ long: p.mn + p.np, short: p.mn - p.np }), [p]);
  const scale = 22;

  const solution = (
    <Solution legend={[[BLUE, '已知线段'], [GREEN, 'MP']]}>
      <Step b="知" kind="set">
        三点在同一条直线上，但题目没说顺序，所以<b>分两种情况</b>画图。
      </Step>
      <Step b="1" kind="list">
        N 在 M、P 之间（M—N—P）：MP 是两段之和
        <EqBox lines={[`MP = MN + NP = ${c(BLUE, p.mn)} + ${c(BLUE, p.np)} = ${c(GREEN, sums.long)}\\ \\text{cm}`]} />
      </Step>
      <Step b="2" kind="solve">
        P 在 M、N 之间（M—P—N）：MP 是两段之差
        <EqBox lines={[`MP = MN - NP = ${c(BLUE, p.mn)} - ${c(BLUE, p.np)} = ${c(GREEN, sums.short)}\\ \\text{cm}`]} />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          MP = {sums.long} cm 或 {sums.short} cm。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 3：求线段 MP"
      subtitle="三点共线，顺序不同，长度就不同"
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
        点 M、N、P 在同一条直线上，MN = {p.mn} cm，NP = {p.np} cm。求线段 MP 的长。
      </p>
      <div style={{ fontSize: 13, marginBottom: 4 }}>一种可能：N 在 M、P 之间</div>
      <LineCase order="MNP" mn={p.mn} np={p.np} scale={scale} />
      <div style={{ fontSize: 13, marginBottom: 4 }}>另一种可能：P 在 M、N 之间</div>
      <LineCase order="MPN" mn={p.mn} np={p.np} scale={scale} />
    </ProblemShell>
  );
}
