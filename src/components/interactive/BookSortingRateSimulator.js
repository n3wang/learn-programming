import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Generates a random-but-solvable "工程问题" (work-rate problem): one person
 * alone would take H hours; x people work t1 hours, then a more people join
 * for t2 more hours, finishing the job. Built from a hidden true x so that
 * x·(t1+t2) = H − t2·a always has an exact integer solution.
 */
function generate() {
  const x = randInt(2, 6);
  const a = randInt(1, 4);
  const t1 = randInt(2, 6);
  const t2 = randInt(4, 12);
  const H = x * (t1 + t2) + t2 * a;
  return { a, t1, t2, H };
}

export default function BookSortingRateSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : generate()));

  const solvedX = useMemo(() => Math.round((p.H - p.t2 * p.a) / (p.t1 + p.t2)), [p]);
  usePracticeAnswer([numberField("x", "先安排的人数", solvedX)]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '所求']]}>
      <Step b="知" kind="set">
        工程问题：把<b>总工作量看作 1</b>。1 人整理要 {p.H} h，所以 1 人 1 小时完成 <M t={`\\dfrac{1}{${p.H}}`} />。
        <EqBox lines={['\\text{工作量} = \\text{人数} \\times \\text{时间} \\times \\text{每人每小时的效率}']} />
      </Step>
      <Step b="设" kind="set">
        设先安排 <M t="x" /> 人整理 {p.t1} h，后来增加 {p.a} 人，变成 <M t={`x + ${p.a}`} /> 人再整理 {p.t2} h。
      </Step>
      <Step b="列" kind="list">
        两段工作量加起来正好是 1：
        <EqBox
          lines={[`\\dfrac{${c(BLUE, p.t1)}x}{${c(BLUE, p.H)}} + \\dfrac{${c(BLUE, p.t2)}(x + ${c(BLUE, p.a)})}{${c(BLUE, p.H)}} = 1`]}
        />
      </Step>
      <Step b="解" kind="solve">
        两边乘 {p.H} 去分母：
        <EqBox
          lines={[
            `${p.t1}x + ${p.t2}(x + ${p.a}) = ${p.H}`,
            `${p.t1}x + ${p.t2}x + ${p.t2 * p.a} = ${p.H}`,
            `${p.t1 + p.t2}x = ${p.H - p.t2 * p.a}`,
            `x = ${c(GREEN, solvedX)}`,
          ]}
        />
      </Step>
      <Step b="验" kind="check">
        <M t={`\\dfrac{${p.t1}\\times ${solvedX} + ${p.t2}\\times ${solvedX + p.a}}{${p.H}} = \\dfrac{${p.t1 * solvedX + p.t2 * (solvedX + p.a)}}{${p.H}} = 1`} /> ✓
      </Step>
      <Step b="答" kind="answer">
        <Answer>应先安排 {solvedX} 人进行整理。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="工程问题：整理图书"
      subtitle="总时长、追加人数、两段工时都会随机变化"
      problemKey={key}
      onRandomize={randomize}
      solution={solution}
    >
      <Typography>
        整理一批图书，由 1 人整理需要 <b>{p.H}</b> h 完成。现计划由一部分人先整理{' '}
        <b>{p.t1}</b> h，然后增加 <b>{p.a}</b> 人与他们一起再整理 <b>{p.t2}</b> h，恰好完成
        这项工作。假设每人工作效率相同，应先安排多少人进行整理？
      </Typography>
    </ProblemShell>
  );
}
