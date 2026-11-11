import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { dmsField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { d: 21, m: 17, n: 5, div: 11, whole: 180 };
}

function generate() {
  return {
    d: randInt(10, 30),
    m: randInt(5, 40),
    n: randInt(3, 6),
    div: [7, 9, 11, 13][randInt(0, 3)],
    whole: 180,
  };
}

function formatMul(d, m, n) {
  const total = (d * 60 + m) * n;
  return { d: Math.floor(total / 60), m: total % 60 };
}

function formatDiv(whole, div) {
  const minutes = Math.round((whole * 60) / div);
  return { d: Math.floor(minutes / 60), m: minutes % 60 };
}

export default function DegreeMulDivSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  const mul = useMemo(() => formatMul(p.d, p.m, p.n), [p]);
  const quot = useMemo(() => formatDiv(p.whole, p.div), [p]);
  usePracticeAnswer([dmsField("mul", `${p.d}°${p.m}′ × ${p.n}`, { d: mul.d, m: mul.m }), dmsField("div", `${p.whole}° ÷ ${p.div}（精确到分）`, { d: quot.d, m: quot.m }, false, 30)]);

  const qd = Math.floor(p.whole / p.div);
  const qRem = p.whole - qd * p.div;
  const qExact = Number(((qRem * 60) / p.div).toFixed(2));
  const mulMin = p.m * p.n;
  const solution = (
    <Solution legend={[[BLUE, '已知'], [ORANGE, '进位 / 余数'], [GREEN, '结果']]}>
      <Step b="知" kind="set">
        <M t="1^\circ = 60'" />。乘法：度、分分别乘，分满 60 向度进 1。除法：先除度，余下的度化成分再除。
      </Step>
      <Step b="乘" kind="list">
        <EqBox
          lines={[
            `${c(BLUE, `${p.d}^\\circ ${p.m}'`)} \\times ${p.n} = ${p.d * p.n}^\\circ ${mulMin}'`,
            `${mulMin}' = ${c(ORANGE, `${Math.floor(mulMin / 60)}^\\circ`)} ${mulMin % 60}' \\;\\Rightarrow\\; ${p.d * p.n}^\\circ + ${Math.floor(mulMin / 60)}^\\circ ${mulMin % 60}' = ${c(GREEN, `${mul.d}^\\circ ${mul.m}'`)}`,
          ]}
        />
      </Step>
      <Step b="除" kind="solve">
        <EqBox
          lines={
            qRem === 0
              ? [`${p.whole}^\\circ \\div ${p.div} = ${c(GREEN, `${qd}^\\circ`)}\\ \\text{（正好除尽）}`]
              : [
                  `${p.whole}^\\circ \\div ${p.div} = ${qd}^\\circ \\;\\text{余}\\; ${c(ORANGE, `${qRem}^\\circ`)}`,
                  `${c(ORANGE, `${qRem}^\\circ`)} = ${qRem * 60}', \\quad ${qRem * 60}' \\div ${p.div} \\approx ${qExact}' \\approx ${quot.m}'`,
                  `${p.whole}^\\circ \\div ${p.div} \\approx ${c(GREEN, `${quot.d}^\\circ ${quot.m}'`)}`,
                ]
          }
        />
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          {p.d}°{p.m}′ × {p.n} = {mul.d}°{mul.m}′；{p.whole}° ÷ {p.div} ≈ {quot.d}°{quot.m}′。
        </Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="练习 3：角度的乘与除"
      subtitle="分满 60 要进位，除不尽时精确到分"
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
      <p style={{ marginTop: 0 }}>{p.d}°{p.m}′ × {p.n}。</p>
      <p>{p.whole}° ÷ {p.div}，精确到分。</p>
    </ProblemShell>
  );
}
