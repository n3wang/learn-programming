import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { dmsField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { parts: 7, whole: 360 };
}

function generate() {
  return { parts: randInt(5, 9), whole: 360 };
}

export default function AngleBisectorFillSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  const each = useMemo(() => {
    const deg = Math.floor(p.whole / p.parts);
    const rem = p.whole - deg * p.parts;
    const minutes = Math.round((rem * 60) / p.parts);
    return { deg, minutes };
  }, [p]);
  usePracticeAnswer([dmsField("each", "每份约（精确到分）", { d: each.deg, m: each.minutes }, false, 30)]);

  const rem = p.whole - each.deg * p.parts;
  const exactMin = Number(((rem * 60) / p.parts).toFixed(2));
  const solution = (
    <Solution legend={[[BLUE, '已知'], [ORANGE, '余下的度数'], [GREEN, '每份']]}>
      <Step b="知" kind="set">
        射线 OB 把角 AOC 分成两个相等的角，OB 就是角 AOC 的平分线：<M t="\angle AOB = \angle BOC = \tfrac12\angle AOC" />。
        把角 n 等分，每份 = 这个角 ÷ n。度除不尽时，把余下的度化成分再除：<M t="1^\circ = 60'" />。
      </Step>
      <Step b="除" kind="list">
        <EqBox
          lines={[
            `${c(BLUE, `${p.whole}^\\circ`)} \\div ${c(BLUE, p.parts)} = ${each.deg}^\\circ \\;\\text{余}\\; ${c(ORANGE, `${rem}^\\circ`)}`,
            `${c(ORANGE, `${rem}^\\circ`)} = ${rem * 60}', \\qquad ${rem * 60}' \\div ${p.parts} \\approx ${exactMin}' \\approx ${each.minutes}'`,
          ]}
        />
      </Step>
      <Step b="合" kind="solve">
        <EqBox lines={[`\\text{每份} \\approx ${c(GREEN, `${each.deg}^\\circ ${each.minutes}'`)}`]} />
        精确到分，所以分要四舍五入。
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          每份大约是 {each.deg}°{each.minutes}′。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="角的平分线与等分"
      subtitle="从顶点出发，把角分成相等的部分"
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
        如果角 AOB = 角 BOC，那么射线 OB 把角 AOC 分成两个相等的角。
        角 AOC = 2 角 AOB = 角 AOC，角 AOB = 角 BOC = 角 AOC 的一半。
      </p>
      <p>
        把一个 {p.whole}° 的角 {p.parts} 等分，每份大约是多少度的角？精确到分。书题目是周角 7 等分。
      </p>
    </ProblemShell>
  );
}
