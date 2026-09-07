import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookPlan() {
  return { last: 320, percent: 5 };
}

function generate() {
  return { last: randInt(28, 40) * 10, percent: randInt(4, 8) };
}

function maxMilli(p) {
  return Math.round((p.last * (100 - p.percent)) / 100);
}

function decline(p, milli) {
  return ((p.last - milli) / p.last) * 100;
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function EnergyDeclineSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookPlan);
  const [picked, setPicked] = useState(null);
  const cap = maxMilli(p);
  const trials = [cap - 8, cap, cap + 8];

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="率" badgeClass={stepStyles.badgeSet}>
        设今年能耗为 x t。下降率不小于 {p.percent}%：(去年 − x) / 去年 ≥ {p.percent}/100。
      </SolutionStep>
      <SolutionStep badge="至" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          去年 {p.last / 1000} t，乘以 (1 − {p.percent}/100) 得上限 {(cap / 1000).toFixed(3)} t。所以今年至多为 {(cap / 1000).toFixed(3)} t 标准煤。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="例 3 能耗下降率不小于指定百分数"
      subtitle="下降率 = (去年 − 今年) / 去年"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookPlan());
        setPicked(null);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        去年万元地区生产总值能耗是 {(p.last / 1000).toFixed(3)} t 标准煤。今年下降率不小于 {p.percent}%。点一个今年的能耗，看它是否合格。
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {trials.map((milli) => (
          <button key={milli} type="button" style={chip} onClick={() => setPicked(milli)}>
            {(milli / 1000).toFixed(3)} t
          </button>
        ))}
      </div>
      {picked != null ? (
        <p>
          下降率约为 {decline(p, picked).toFixed(2)}%。
          {picked <= cap
            ? picked === cap
              ? '正好达到下限，今年至多就是这个数。'
              : '合格，但不是题目问的「至多」。'
            : '下降率不足，不合格。'}
        </p>
      ) : null}
    </ProblemShell>
  );
}
