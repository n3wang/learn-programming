import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { whole: 90, mid: null };
}

function generate() {
  const whole = 90;
  const mid = randInt(4, 14) * 5;
  return { whole, mid };
}

export default function EqualRemainderAnglesSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer(p.mid == null ? null : [degField("aob", "角 AOB", p.whole - p.mid), degField("cod", "角 COD", p.whole - p.mid)]);
  const rest = useMemo(() => (p.mid == null ? null : p.whole - p.mid), [p]);

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '结果']]}>
      <Step b="知" kind="set">
        把两个 {p.whole}° 的角都拆开，它们共用中间的角 BOC：
        <EqBox
          lines={[
            `\\angle AOB + \\angle BOC = \\angle AOC = ${c(BLUE, `${p.whole}^\\circ`)}`,
            `\\angle BOC + \\angle COD = \\angle BOD = ${c(BLUE, `${p.whole}^\\circ`)}`,
          ]}
        />
      </Step>
      <Step b="解" kind="solve">
        <EqBox
          lines={[
            `\\angle AOB = ${p.whole}^\\circ - \\angle BOC, \\qquad \\angle COD = ${p.whole}^\\circ - \\angle BOC`,
          ]}
        />
        都等于 {p.whole}° 减去<b>同一个</b>角 BOC，所以 <M t="\angle AOB = \angle COD" />（同角的余角相等）。
        {p.mid == null ? null : (
          <EqBox
            lines={[
              `\\angle BOC = ${c(BLUE, `${p.mid}^\\circ`)} \\;\\Rightarrow\\; \\angle AOB = \\angle COD = ${p.whole}^\\circ - ${p.mid}^\\circ = ${c(GREEN, `${rest}^\\circ`)}`,
            ]}
          />
        )}
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {p.mid == null ? '角 AOB = 角 COD。' : `角 AOB = 角 COD = ${rest}°。`}
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="第 7 题：比较两个角"
      subtitle="都等于同一个直角减去中间那个角"
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
        角 AOC = 角 BOD = {p.whole}°。比较角 AOB 与角 COD 的大小，并说明理由。
      </p>
      <svg viewBox="0 0 240 130" width="100%" height="120">
        <line x1="120" y1="108" x2="220" y2="108" stroke="#00897b" strokeWidth="1.8" />
        <line x1="120" y1="108" x2="188" y2="48" stroke="#00897b" strokeWidth="1.6" />
        <line x1="120" y1="108" x2="120" y2="24" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="120" y1="108" x2="62" y2="28" stroke="#00897b" strokeWidth="1.6" />
        <path d="M146 108 L146 82 L120 82" fill="none" stroke="#e91e63" />
        <text x="214" y="122" fontSize="13">A</text>
        <text x="190" y="44" fontSize="13">B</text>
        <text x="112" y="18" fontSize="13">C</text>
        <text x="48" y="24" fontSize="13">D</text>
        <text x="114" y="122" fontSize="13">O</text>
      </svg>
      <p>
        {p.mid == null
          ? '书上没有给出中间角的度数，只要比较大小。'
          : `如果角 BOC = ${p.mid}°，角 AOB 和角 COD 各是多少度？`}
      </p>
    </ProblemShell>
  );
}
