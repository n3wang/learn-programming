import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { supplement: 150 };
}

function generate() {
  return { supplement: randInt(19, 32) * 5 };
}

export default function SupplementThenComplementSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([degField("c", "这个角的余角", p.supplement - 90)]);
  const ans = useMemo(() => {
    const self = 180 - p.supplement;
    return { self, complement: 90 - self };
  }, [p]);

  const solution = (
    <Solution legend={[[BLUE, '已知'], [ORANGE, '这个角'], [GREEN, '所求']]}>
      <Step b="知" kind="set">
        先由补角求出这个角，再求它的余角：
        <EqBox lines={['\\text{这个角} = 180^\\circ - \\text{补角}, \\qquad \\text{余角} = 90^\\circ - \\text{这个角}']} />
      </Step>
      <Step b="1" kind="list">
        <EqBox lines={[`\\text{这个角} = 180^\\circ - ${c(BLUE, `${p.supplement}^\\circ`)} = ${c(ORANGE, `${ans.self}^\\circ`)}`]} />
      </Step>
      <Step b="2" kind="solve">
        <EqBox lines={[`\\text{余角} = 90^\\circ - ${c(ORANGE, `${ans.self}^\\circ`)} = ${c(GREEN, `${ans.complement}^\\circ`)}`]} />
        捷径：同一个角的补角比余角大 90°，所以余角 = 补角 − 90° = <M t={`${p.supplement}^\\circ - 90^\\circ = ${ans.complement}^\\circ`} />。
      </Step>
      <Step b="答" kind="answer">
        <Answer>这个角的余角是 {ans.complement}°。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="第 4 题：先求角，再求余角"
      subtitle="补角减 90°，就是这个角的余角"
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
        一个角的补角是 {p.supplement}°，这个角的余角是多少度？
      </p>
    </ProblemShell>
  );
}
