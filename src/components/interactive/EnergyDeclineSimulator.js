import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
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
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookPlan()));
  const [picked, setPicked] = useState(null);
  const cap = maxMilli(p);
  usePracticeAnswer([numberField("e", "今年能耗至多（t 标准煤）", cap / 1000, "x")]);
  const trials = [cap - 8, cap, cap + 8];

  const lastT = (p.last / 1000).toFixed(3);
  const capT = (cap / 1000).toFixed(3);
  const solution = (
    <Solution legend={[[BLUE, '已知'], [GREEN, '所求']]}>
      <Step b="设" kind="set">
        设今年的能耗为 <M t="x" /> t 标准煤。下降率 = <M t="\dfrac{\text{去年} - \text{今年}}{\text{去年}}" />。
      </Step>
      <Step b="列" kind="list">
        「下降率<b>不小于</b> {p.percent}%」写成 ≥：
        <EqBox lines={[`\\dfrac{${c(BLUE, lastT)} - x}{${c(BLUE, lastT)}} \\ge ${c(BLUE, `${p.percent}\\%`)}`]} />
      </Step>
      <Step b="解" kind="solve">
        两边乘正数 {lastT}（方向不变），再移项：
        <EqBox
          lines={[
            `${lastT} - x \\ge ${lastT} \\times ${p.percent / 100}`,
            `x \\le ${lastT} \\times (1 - ${p.percent / 100}) = ${c(GREEN, capT)}`,
          ]}
        />
        移项时 <M t="-x" /> 变成 <M t="x" />，相当于两边乘 −1，所以 ≥ 变成 ≤。
      </Step>
      <Step b="答" kind="answer">
        <Answer>今年的能耗至多为 {capT} t 标准煤。</Answer>
      </Step>
    </Solution>
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
        去年万元地区生产总值能耗是 {(p.last / 1000).toFixed(3)} t 标准煤。今年下降率不小于 {p.percent}%。{practice ? '今年的能耗至多是多少吨标准煤？' : '点一个今年的能耗，看它是否合格。'}
      </p>
      {!practice ? (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {trials.map((milli) => (
            <button key={milli} type="button" style={chip} onClick={() => setPicked(milli)}>
              {(milli / 1000).toFixed(3)} t
            </button>
          ))}
        </div>
      ) : null}
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
