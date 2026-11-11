import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { a: 3, len: 4 };
}

function generate() {
  return { a: randInt(-2, 6), len: randInt(2, 6) * 2 };
}

export default function NumberLineMidpointSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([numberField("r", "B 在 A 右边时，点 C 表示", p.a + p.len / 2, "c_1"), numberField("l", "B 在 A 左边时，点 C 表示", p.a - p.len / 2, "c_2")]);
  const answers = useMemo(() => {
    const right = p.a + p.len;
    const left = p.a - p.len;
    return {
      rightB: right,
      leftB: left,
      rightC: (p.a + right) / 2,
      leftC: (p.a + left) / 2,
    };
  }, [p]);

  const half = p.len / 2;
  const solution = (
    <Solution legend={[[BLUE, '点 A'], [ORANGE, '点 B'], [GREEN, '中点 C']]}>
      <Step b="知" kind="set">
        只知道 AB 的长，不知道 B 在 A 的哪一边，所以<b>分两种情况</b>。C 是 AB 的中点：
        <EqBox lines={['AC = \\tfrac12 AB, \\qquad C = \\dfrac{A + B}{2}']} />
      </Step>
      <Step b="右" kind="list">
        B 在 A 的右边：
        <EqBox
          lines={[
            `B = ${c(BLUE, p.a)} + ${p.len} = ${c(ORANGE, answers.rightB)}`,
            `C = \\dfrac{${p.a} + ${answers.rightB}}{2} = ${c(GREEN, answers.rightC)}\\quad(\\text{或 } ${p.a} + ${half})`,
          ]}
        />
      </Step>
      <Step b="左" kind="solve">
        B 在 A 的左边：
        <EqBox
          lines={[
            `B = ${c(BLUE, p.a)} - ${p.len} = ${c(ORANGE, answers.leftB)}`,
            `C = \\dfrac{${p.a} + (${answers.leftB})}{2} = ${c(GREEN, answers.leftC)}\\quad(\\text{或 } ${p.a} - ${half})`,
          ]}
        />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          点 C 表示 {answers.rightC} 或 {answers.leftC}。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="习题 7：数轴上的中点"
      subtitle="端点可以在已知点的左边，也可以在右边"
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
        A、B、C 是数轴上的三个点。点 A 表示数 {p.a}，线段 AB 的长为 {p.len}，C 为 AB 的中点。点 C 表示的数是多少？
      </p>
    </ProblemShell>
  );
}
