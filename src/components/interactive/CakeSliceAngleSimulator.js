import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField, numberField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { parts: 8, each: 15 };
}

function generate() {
  const parts = [6, 8, 9, 10, 12][randInt(0, 4)];
  const each = [10, 12, 15, 18, 20][randInt(0, 4)];
  return { parts, each };
}

export default function CakeSliceAngleSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([degField("each", "每份的角", 360 / p.parts), numberField("n", "每份 " + p.each + "° 时应分成几份", 360 / p.each, "n")]);

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '所求']]}>
      <Step b="知" kind="set">
        蛋糕的一圈是一个周角，<M t="360^\circ" />。等分后：
        <EqBox lines={['\\text{每份的角} = 360^\\circ \\div \\text{份数}', '\\text{份数} = 360^\\circ \\div \\text{每份的角}']} />
      </Step>
      <Step b="(1)" kind="list">
        <EqBox lines={[`360^\\circ \\div ${c(BLUE, p.parts)} = ${c(GREEN, `${360 / p.parts}^\\circ`)}`]} />
      </Step>
      <Step b="(2)" kind="solve">
        <EqBox lines={[`360^\\circ \\div ${c(BLUE, `${p.each}^\\circ`)} = ${c(GREEN, 360 / p.each)}`]} />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          分成 {p.parts} 份，每份 {360 / p.parts}°；要每份 {p.each}°，应等分成 {360 / p.each} 份。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 1：蛋糕里的角"
      subtitle="整块蛋糕是一个周角"
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
        把一个蛋糕等分成 {p.parts} 份，每份中的角是多少度？要使每份中的角是 {p.each}°，这个蛋糕应等分成多少份？
      </p>
    </ProblemShell>
  );
}
