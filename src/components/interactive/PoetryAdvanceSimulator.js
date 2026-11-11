import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookContest() {
  return { total: 20, gain: 10, loss: 5, need: 90 };
}

function generate() {
  const total = randInt(16, 24);
  return { total, gain: 10, loss: 5, need: randInt(16, 22) * 5 };
}

function cutOf(p) {
  return (p.need + p.loss * p.total) / (p.gain + p.loss);
}

function score(p, x) {
  return p.gain * x - p.loss * (p.total - x);
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function PoetryAdvanceSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookContest()));
  const [picked, setPicked] = useState(null);
  const cut = cutOf(p);
  const least = Math.floor(cut) + 1;
  usePracticeAnswer([numberField("n", "至少答对的题数", least, "x")]);
  const trials = [least - 1, least, least + 1].filter((n) => n >= 0 && n <= p.total);

  const solution = (
    <Solution legend={[[BLUE, '已知'], [ORANGE, '分界'], [GREEN, '所求']]}>
      <Step b="设" kind="set">
        设答对 <M t="x" /> 道，则答错或不答的有 <M t={`${p.total} - x`} /> 道。
      </Step>
      <Step b="列" kind="list">
        得分 = 答对得分 − 扣分，「超过 {p.need} 分」写成 &gt;：
        <EqBox lines={[`${c(BLUE, p.gain)}x - ${c(BLUE, p.loss)}(${p.total} - x) > ${c(BLUE, p.need)}`]} />
      </Step>
      <Step b="解" kind="solve">
        <EqBox
          lines={[
            `${p.gain}x - ${p.loss * p.total} + ${p.loss}x > ${p.need}`,
            `${p.gain + p.loss}x > ${p.need + p.loss * p.total}`,
            `x > ${c(ORANGE, Number(cut.toFixed(4)))}`,
          ]}
        />
        x 表示题数，必须是正整数，所以比 {Number(cut.toFixed(4))} 大的最小整数是 <M t={c(GREEN, least)} />。
      </Step>
      <Step b="验" kind="check">
        答对 {least} 道：<M t={`${p.gain}\\times ${least} - ${p.loss}\\times ${p.total - least} = ${score(p, least)} > ${p.need}`} />；
        答对 {least - 1} 道：<M t={`${score(p, least - 1)} \\le ${p.need}`} />，不够 ✓
      </Step>
      <Step b="答" kind="answer">
        <Answer>至少要答对 {least} 道题才能晋级。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="例 2 至少答对多少道才能晋级？"
      subtitle="成绩超过指定分数，再取比解集下界更大的正整数"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookContest());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        共 {p.total} 道题，答对得 {p.gain} 分，答错或不答扣 {p.loss} 分。成绩超过 {p.need} 分晋级。{practice ? '至少要答对几道题？' : '点一个答对题数试一试。'}
      </p>
      {!practice ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {trials.map((n) => (
            <button key={n} type="button" style={chip} onClick={() => setPicked(n)}>
              答对 {n} 道
            </button>
          ))}
        </div>
      ) : null}
      {picked != null ? (
        <p>
          成绩是 {score(p, picked)} 分。
          {score(p, picked) > p.need
            ? picked === least
              ? '超过指定分数，而且已经是最少的正整数。'
              : '能晋级，但还不是最少的答对题数。'
            : '没有超过指定分数，不能晋级。'}
        </p>
      ) : null}
    </ProblemShell>
  );
}
