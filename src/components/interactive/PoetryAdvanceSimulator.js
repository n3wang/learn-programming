import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
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
  const [p, setP] = useState(bookContest);
  const [picked, setPicked] = useState(null);
  const cut = cutOf(p);
  const least = Math.floor(cut) + 1;
  const trials = [least - 1, least, least + 1].filter((n) => n >= 0 && n <= p.total);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeSet}>
        设答对 x 道。答错或不答共 {p.total} − x 道。超过 {p.need} 分才能晋级：{p.gain}x − {p.loss}({p.total} − x) &gt; {p.need}。
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          去括号得 {p.gain + p.loss}x − {p.loss * p.total} &gt; {p.need}，所以 x &gt; {cut}。x 是正整数，至少答对 {least} 道。答对 {least} 道得 {score(p, least)} 分，答对 {least - 1} 道得 {score(p, least - 1)} 分。
        </div>
      </SolutionStep>
    </div>
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
        共 {p.total} 道题，答对得 {p.gain} 分，答错或不答扣 {p.loss} 分。成绩超过 {p.need} 分晋级。点一个答对题数试一试。
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {trials.map((n) => (
          <button key={n} type="button" style={chip} onClick={() => setPicked(n)}>
            答对 {n} 道
          </button>
        ))}
      </div>
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
