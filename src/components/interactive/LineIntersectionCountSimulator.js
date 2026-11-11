import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function count(n) {
  return (n * (n - 1)) / 2;
}

function bookProblem() {
  return { n: 4 };
}

function generate() {
  return { n: randInt(3, 8) };
}

export default function LineIntersectionCountSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([numberField("n", `${p.n} 条直线最多的交点个数`, (p.n * (p.n - 1)) / 2, "n")]);
  const max = useMemo(() => count(p.n), [p]);

  const solution = (
    <Solution legend={[[BLUE, '新增的交点'], [GREEN, '交点总数']]}>
      <Step b="知" kind="set">
        交点最多的条件：任意两条直线都相交，并且没有三条直线交于同一点。
      </Step>
      <Step b="找" kind="list">
        每加一条新直线，它最多和前面的每一条各交一次：
        <EqBox
          lines={[
            '2\\text{ 条}: 1',
            `3\\text{ 条}: 1 + ${c(BLUE, 2)} = 3`,
            `4\\text{ 条}: 3 + ${c(BLUE, 3)} = 6`,
            `n\\text{ 条}: 1 + 2 + \\cdots + (n-1) = \\dfrac{n(n-1)}{2}`,
          ]}
        />
      </Step>
      <Step b="算" kind="solve">
        <EqBox lines={[`\\dfrac{${p.n}\\times(${p.n}-1)}{2} = \\dfrac{${p.n}\\times ${p.n - 1}}{2} = ${c(GREEN, max)}`]} />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {p.n} 条直线最多有 {max} 个交点。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="习题 10：直线相交的交点"
      subtitle="每两条直线最多一个交点，三条不交于同一点"
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
        两条直线相交，有一个交点。{p.n} 条直线相交，最多有多少个交点？
      </p>
      {!practice ? <p>书上先问 3 条、4 条，再找规律。点「随机」可换成别的条数。</p> : null}
    </ProblemShell>
  );
}
