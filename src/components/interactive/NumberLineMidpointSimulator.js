import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
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
  const [p, setP] = useState(bookProblem);
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

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="分类" badgeClass={stepStyles.badgeSet}>
        点 A 表示 {p.a}，AB = {p.len}。点 B 可以在 A 的右边，也可以在 A 的左边。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          若 B 表示 {answers.rightB}，则中点 C 表示 {answers.rightC}。
          若 B 表示 {answers.leftB}，则中点 C 表示 {answers.leftC}。
        </div>
      </SolutionStep>
    </div>
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
