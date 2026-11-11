import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { dmsField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function format(total) {
  const abs = Math.abs(total);
  const d = Math.floor(abs / 60);
  const m = abs % 60;
  return `${d}°${m}′`;
}

function bookProblem() {
  return { d: 70, m: 39 };
}

function generate() {
  return { d: randInt(18, 78), m: randInt(1, 59) };
}

export default function DegreeComplementFindSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([dmsField("c", "余角", (90 * 60 - (p.d * 60 + p.m)) * 60), dmsField("s", "补角", (180 * 60 - (p.d * 60 + p.m)) * 60)]);
  const ans = useMemo(() => {
    const given = p.d * 60 + p.m;
    return {
      complement: format(90 * 60 - given),
      supplement: format(180 * 60 - given),
    };
  }, [p]);

  const solution = (
    <Solution legend={[[BLUE, '已知的角'], [GREEN, '所求的角']]}>
      <Step b="知" kind="set">
        余角 = 90° − 这个角，补角 = 180° − 这个角。度、分分别相减；分不够减时，向度借 1° 当 60′：
        <EqBox lines={["90^\\circ = 89^\\circ 60', \\qquad 180^\\circ = 179^\\circ 60'"]} />
      </Step>
      <Step b="余" kind="list">
        <EqBox
          lines={[
            `90^\\circ - ${c(BLUE, `${p.d}^\\circ ${p.m}'`)} = 89^\\circ 60' - ${p.d}^\\circ ${p.m}' = ${c(GREEN, `${89 - p.d}^\\circ ${60 - p.m}'`)}`,
          ]}
        />
        度减度：<M t={`89 - ${p.d} = ${89 - p.d}`} />；分减分：<M t={`60 - ${p.m} = ${60 - p.m}`} />。
      </Step>
      <Step b="补" kind="solve">
        <EqBox
          lines={[
            `180^\\circ - ${c(BLUE, `${p.d}^\\circ ${p.m}'`)} = 179^\\circ 60' - ${p.d}^\\circ ${p.m}' = ${c(GREEN, `${179 - p.d}^\\circ ${60 - p.m}'`)}`,
          ]}
        />
      </Step>
      <Step b="验" kind="check">
        <M t={`${p.d}^\\circ ${p.m}' + ${89 - p.d}^\\circ ${60 - p.m}' = 89^\\circ 60' = 90^\\circ`} /> ✓
      </Step>
      <Step b="答" kind="answer">
        <Answer>余角是 {ans.complement}，补角是 {ans.supplement}。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 2：求余角和补角"
      subtitle="分不够减时，向度借 1° 当 60′"
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
        一个角是 {p.d}°{p.m}′，求它的余角和补角。
      </p>
    </ProblemShell>
  );
}
