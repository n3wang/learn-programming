import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 28, b: 22 };
}

function generate() {
  return { a: randInt(15, 40), b: randInt(12, 35) };
}

export default function AngleSumDiffSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([degField("aoc", "角 AOC", p.a + p.b), degField("diff", "角 AOC − 角 AOB", p.b)]);

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '所求']]}>
      <Step b="知" kind="set">
        射线 OB 在角 AOC 的内部，把角 AOC 分成两部分：
        <EqBox lines={['\\angle AOC = \\angle AOB + \\angle BOC']} />
      </Step>
      <Step b="和" kind="list">
        <EqBox
          lines={[`\\angle AOC = ${c(BLUE, `${p.a}^\\circ`)} + ${c(BLUE, `${p.b}^\\circ`)} = ${c(GREEN, `${p.a + p.b}^\\circ`)}`]}
        />
      </Step>
      <Step b="差" kind="solve">
        从整个角里去掉一部分，剩下另一部分：
        <EqBox
          lines={[
            `\\angle AOC - \\angle AOB = \\angle BOC = ${p.a + p.b}^\\circ - ${p.a}^\\circ = ${c(GREEN, `${p.b}^\\circ`)}`,
            `\\angle AOC - \\angle BOC = \\angle AOB = ${p.a}^\\circ`,
          ]}
        />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          角 AOC = {p.a + p.b}°；角 AOC − 角 AOB = 角 BOC = {p.b}°。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="两个角的和与差"
      subtitle="类比线段：相邻的角可以相加，从一个角里截去一部分就是差"
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
        射线 OB 在角 AOC 的内部。角 AOB = {p.a}°，角 BOC = {p.b}°。{practice ? ' 求角 AOC，以及角 AOC − 角 AOB。' : null}
      </p>
      <svg viewBox="0 0 240 110" width="100%" height="100">
        <line x1="28" y1="92" x2="210" y2="92" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="28" y1="92" x2={28 + 100 * Math.cos((p.a * Math.PI) / 180)} y2={92 - 100 * Math.sin((p.a * Math.PI) / 180)} stroke="#00897b" strokeWidth="1.6" />
        <line x1="28" y1="92" x2={28 + 110 * Math.cos(((p.a + p.b) * Math.PI) / 180)} y2={92 - 110 * Math.sin(((p.a + p.b) * Math.PI) / 180)} stroke="#1565c0" strokeWidth="1.6" />
        <text x="16" y="106" fontSize="13">O</text>
        <text x="204" y="106" fontSize="13">A</text>
        <text x={36 + 100 * Math.cos((p.a * Math.PI) / 180)} y={88 - 100 * Math.sin((p.a * Math.PI) / 180)} fontSize="13">B</text>
        <text x={36 + 110 * Math.cos(((p.a + p.b) * Math.PI) / 180)} y={80 - 110 * Math.sin(((p.a + p.b) * Math.PI) / 180)} fontSize="13">C</text>
      </svg>
    </ProblemShell>
  );
}
