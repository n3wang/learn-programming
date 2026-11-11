import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { dmsField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { d: 31, m: 28 };
}

function generate() {
  return { d: randInt(20, 40), m: randInt(1, 50) };
}

function subtractFrom90(d, m) {
  const total = 90 * 60 - (d * 60 + m);
  return { d: Math.floor(total / 60), m: total % 60 };
}

export default function LineBisectorFindSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([dmsField("aod", "角 AOD", (90 * 60 - (p.d * 60 + p.m)) * 60)]);
  const ans = useMemo(() => subtractFrom90(p.d, p.m), [p]);

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '所求']]}>
      <Step b="知" kind="set">
        O 在直线 AB 上，角 AOB 是平角，等于 180°。OC 平分角 AOB：
        <EqBox lines={['\\angle AOC = \\angle BOC = 180^\\circ \\div 2 = 90^\\circ']} />
      </Step>
      <Step b="列" kind="list">
        射线 OD 在角 AOC 的内部，所以 <M t="\angle AOD = \angle AOC - \angle COD" />。
      </Step>
      <Step b="解" kind="solve">
        90° 写成 89°60′ 再减：
        <EqBox
          lines={[
            `\\angle AOD = 90^\\circ - ${c(BLUE, `${p.d}^\\circ ${p.m}'`)} = 89^\\circ 60' - ${p.d}^\\circ ${p.m}' = ${c(GREEN, `${ans.d}^\\circ ${ans.m}'`)}`,
          ]}
        />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          角 AOD = {ans.d}°{ans.m}′。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 2：直线上的平分线"
      subtitle="平角的平分线是 90°"
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
        O 是直线 AB 上一点，OC 是角 AOB 的平分线，角 COD = {p.d}°{p.m}′。求角 AOD 的度数。
      </p>
      <svg viewBox="0 0 260 110" width="100%" height="100">
        <line x1="16" y1="78" x2="244" y2="78" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="130" y1="78" x2="130" y2="16" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="130" y1="78" x2="78" y2="18" stroke="#00897b" strokeWidth="1.6" />
        <path d="M130 52 A26 26 0 0 0 112 58" fill="none" stroke="#e91e63" />
        <text x="8" y="94" fontSize="13">A</text>
        <text x="124" y="96" fontSize="13">O</text>
        <text x="236" y="94" fontSize="13">B</text>
        <text x="134" y="16" fontSize="13">C</text>
        <text x="66" y="18" fontSize="13">D</text>
      </svg>
    </ProblemShell>
  );
}
