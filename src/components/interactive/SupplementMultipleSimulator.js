import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { n: 3, kind: '补' };
}

function generate() {
  return { n: pickOne([2, 3, 4, 5]), kind: pickOne(['补', '余']) };
}

export default function SupplementMultipleSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([degField("x", "这个角", (p.kind === "余" ? 90 : 180) / (p.n + 1))]);
  const ans = useMemo(() => {
    const whole = p.kind === '余' ? 90 : 180;
    return { whole, deg: whole / (p.n + 1) };
  }, [p]);

  const solution = (
    <Solution legend={[[BLUE, '倍数'], [GREEN, '这个角']]}>
      <Step b="设" kind="set">
        设这个角是 <M t={c(GREEN, 'x')} /> 度，则它的{p.kind}角是 <M t={`${ans.whole} - ${c(GREEN, 'x')}`} /> 度。
      </Step>
      <Step b="列" kind="list">
        「{p.kind}角是它的 {p.n} 倍」：
        <EqBox lines={[`${ans.whole} - ${c(GREEN, 'x')} = ${c(BLUE, p.n)}${c(GREEN, 'x')}`]} />
      </Step>
      <Step b="解" kind="solve">
        <EqBox
          lines={[
            `${ans.whole} = ${c(GREEN, 'x')} + ${p.n}${c(GREEN, 'x')} = ${p.n + 1}${c(GREEN, 'x')}`,
            `${c(GREEN, 'x')} = ${ans.whole} \\div ${p.n + 1} = ${c(GREEN, ans.deg)}`,
          ]}
        />
      </Step>
      <Step b="验" kind="check">
        {p.kind}角是 <M t={`${ans.whole}^\\circ - ${ans.deg}^\\circ = ${ans.whole - ans.deg}^\\circ`} />，
        正好是 <M t={`${ans.deg}^\\circ \\times ${p.n} = ${ans.deg * p.n}^\\circ`} /> ✓
      </Step>
      <Step b="答" kind="answer">
        <Answer>这个角是 {ans.deg}°。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 3：补角是它的几倍"
      subtitle="这个角和它的几倍正好拼成 180° 或 90°"
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
        一个角的{p.kind}角是它的 {p.n} 倍，这个角是多少度？
      </p>
    </ProblemShell>
  );
}
