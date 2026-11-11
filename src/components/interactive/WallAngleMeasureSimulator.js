import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { degField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { measured: null };
}

function generate() {
  return { measured: randInt(20, 34) * 5 };
}

export default function WallAngleMeasureSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer(p.measured == null ? null : [degField("aob", "角 AOB", 180 - p.measured)]);
  const inside = useMemo(() => (p.measured == null ? null : 180 - p.measured), [p]);

  const solution = (
    <Solution legend={[[BLUE, '测得的角'], [GREEN, '角 AOB']]}>
      <Step b="知" kind="set">
        进不去墙里面，就把边 BO 延长到墙外，量出角 AOB 的<b>邻补角</b>。邻补角与角 AOB 拼成一个平角：
        <EqBox lines={['\\angle AOB + \\text{邻补角} = 180^\\circ']} />
      </Step>
      <Step b="解" kind="solve">
        {p.measured == null ? (
          <EqBox lines={['\\angle AOB = 180^\\circ - \\text{墙外测得的邻补角}']} />
        ) : (
          <EqBox
            lines={[`\\angle AOB = 180^\\circ - ${c(BLUE, `${p.measured}^\\circ`)} = ${c(GREEN, `${inside}^\\circ`)}`]}
          />
        )}
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {p.measured == null
            ? '在墙外量邻补角，角 AOB = 180° − 邻补角。'
            : `角 AOB = ${inside}°。`}
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 4：墙外测量墙角"
      subtitle="量不到里面的角，就量它的邻补角"
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
        两堵围墙形成角 AOB，人不能进入围墙。怎样测量角 AOB？
      </p>
      <svg viewBox="0 0 280 140" width="100%" height="120">
        <polygon points="150,108 250,108 250,28 150,28 118,78" fill="#e8d3b0" stroke="#c45c26" strokeWidth="1.2" />
        <line x1="28" y1="108" x2="168" y2="108" stroke="#e91e63" strokeWidth="2" />
        <line x1="150" y1="108" x2="108" y2="42" stroke="#e91e63" strokeWidth="2" />
        <path d="M118 108 A32 32 0 0 1 132 80" fill="none" stroke="#e91e63" strokeWidth="1.6" />
        <text x="18" y="124" fontSize="13">B</text>
        <text x="146" y="124" fontSize="13">O</text>
        <text x="92" y="36" fontSize="13">A</text>
        <text x="78" y="100" fontSize="12" fill="#ad1457">墙内</text>
      </svg>
      <p>
        {p.measured == null
          ? '书上没有给出测得的度数。先说出测量方法。'
          : `在墙外测得角 AOB 的邻补角是 ${p.measured}°。角 AOB 是多少度？`}
      </p>
    </ProblemShell>
  );
}
