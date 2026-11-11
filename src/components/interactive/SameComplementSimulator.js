import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 35 };
}

function generate() {
  return { a: randInt(20, 60) };
}

export default function SameComplementSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([degField("a2", "角 2", 90 - p.a), degField("a3", "角 3", 90 - p.a), degField("sup", "角 1 的补角", 180 - p.a)]);
  const rest90 = 90 - p.a;
  const rest180 = 180 - p.a;

  const solution = (
    <Solution legend={[[BLUE, '角 1'], [GREEN, '结果']]}>
      <Step b="知" kind="set">
        角 2、角 3 都是角 1 的余角，就是说它们和角 1 的和都是 90°：
        <EqBox lines={['\\angle 1 + \\angle 2 = 90^\\circ, \\qquad \\angle 1 + \\angle 3 = 90^\\circ']} />
      </Step>
      <Step b="余" kind="list">
        <EqBox
          lines={[
            `\\angle 2 = 90^\\circ - \\angle 1 = 90^\\circ - ${c(BLUE, `${p.a}^\\circ`)} = ${c(GREEN, `${rest90}^\\circ`)}`,
            `\\angle 3 = 90^\\circ - \\angle 1 = 90^\\circ - ${c(BLUE, `${p.a}^\\circ`)} = ${c(GREEN, `${rest90}^\\circ`)}`,
          ]}
        />
        两个都等于「90° 减去同一个角」，所以 <M t="\angle 2 = \angle 3" />。
      </Step>
      <Step b="补" kind="solve">
        与角 1 互补的角都等于 <M t={`180^\\circ - ${c(BLUE, `${p.a}^\\circ`)} = ${c(GREEN, `${rest180}^\\circ`)}`} />，同样相等。
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          角 2 = 角 3 = {rest90}°；角 1 的补角是 {rest180}°。同角（或等角）的余角相等，同角（或等角）的补角相等。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="思考：同角的余角相等吗？"
      subtitle="都等于 90° 减去同一个角，所以相等"
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
        角 1 = {p.a}°。角 2、角 3 都是角 1 的余角。角 2 与角 3 的大小有什么关系？
      </p>
      <p>与同一个角互补的两个角呢？</p>
    </ProblemShell>
  );
}
