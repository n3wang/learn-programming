import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { deg: 30 };
}

function generate() {
  return { deg: randInt(15, 75) };
}

export default function ComplementSupplementSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([degField("c", "余角", 90 - p.deg), degField("s", "补角", 180 - p.deg)]);
  const rest = useMemo(() => ({ c: 90 - p.deg, s: 180 - p.deg }), [p]);

  const solution = (
    <Solution legend={[[BLUE, '已知的角'], [GREEN, '所求的角']]}>
      <Step b="知" kind="set">
        和为 90° 的两个角互为余角，和为 180° 的两个角互为补角：
        <EqBox lines={['\\text{余角} = 90^\\circ - \\text{这个角}', '\\text{补角} = 180^\\circ - \\text{这个角}']} />
      </Step>
      <Step b="解" kind="solve">
        这个角是 <M t={c(BLUE, `${p.deg}^\\circ`)} />：
        <EqBox
          lines={[
            `\\text{余角} = 90^\\circ - ${c(BLUE, `${p.deg}^\\circ`)} = ${c(GREEN, `${rest.c}^\\circ`)}`,
            `\\text{补角} = 180^\\circ - ${c(BLUE, `${p.deg}^\\circ`)} = ${c(GREEN, `${rest.s}^\\circ`)}`,
          ]}
        />
        补角总比余角大 90°：<M t={`${rest.s}^\\circ - ${rest.c}^\\circ = 90^\\circ`} />。
      </Step>
      <Step b="验" kind="check">
        <M t={`${p.deg}^\\circ + ${rest.c}^\\circ = 90^\\circ`} />，<M t={`${p.deg}^\\circ + ${rest.s}^\\circ = 180^\\circ`} /> ✓
      </Step>
      <Step b="答" kind="answer">
        <Answer>{p.deg}° 的余角是 {rest.c}°，补角是 {rest.s}°。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="余角和补角"
      subtitle="和为 90° 互余，和为 180° 互补"
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
        已知一个角是 {p.deg}°。它的余角是多少度？补角是多少度？
      </p>
      <p>三角尺上，30° 与 60° 互余，45° 与 45° 互余。</p>
    </ProblemShell>
  );
}
