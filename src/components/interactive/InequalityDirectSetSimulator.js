import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { ineqField } from '@site/src/components/interactive/shell/practiceFields';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function formatNum(n) {
  if (Number.isInteger(n)) return String(n).replace('-', '−');
  const text = String(n);
  if (!text.includes('.')) return text.replace('-', '−');
  return text.replace('-', '−');
}

function bookItems() {
  return [
    { id: '1', text: 'x + 2 > 6', result: 'x > 4', why: '两边减 2，方向不变。' },
    { id: '2', text: '2x < −8', result: 'x < −4', why: '两边除以正数 2，方向不变。' },
    { id: '3', text: 'x − 2 > 0.1', result: 'x > 2.1', why: '两边加 2，方向不变。' },
    { id: '4', text: '−3x < 10', result: 'x > −10/3', why: '两边除以 −3，方向改变。' },
  ];
}

function randomItems() {
  const a = randInt(2, 8);
  const b = randInt(2, 6);
  const c = randInt(1, 9) / 10;
  const k = randInt(2, 5);
  const m = randInt(4, 14);
  return [
    { id: '1', text: `x + ${a} > ${a + 3}`, result: `x > 3`, why: `两边减 ${a}，方向不变。` },
    { id: '2', text: `${b}x < −${2 * b}`, result: 'x < −2', why: `两边除以正数 ${b}，方向不变。` },
    { id: '3', text: `x − 1 > ${c}`, result: `x > ${formatNum(1 + c)}`, why: '两边加 1，方向不变。' },
    { id: '4', text: `−${k}x < ${m}`, result: `x > −${m}/${k}`, why: `两边除以 −${k}，方向改变。` },
  ];
}

function choices(item) {
  const body = item.result.replace('x > ', '').replace('x < ', '');
  return [`x > ${body}`, `x < ${body}`, `x ≥ ${body}`, `x ≤ ${body}`];
}

const chip = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 5,
  padding: '2px 8px',
  background: 'transparent',
  cursor: 'pointer',
  font: 'inherit',
};

export default function InequalityDirectSetSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [items, setItems] = useState(() => (practice ? randomItems() : bookItems()));
  usePracticeAnswer(
    items.map((item) => ineqField(`q${item.id}`, `（${item.id}）${item.text}`, item.result)),
  );
  const [picks, setPicks] = useState({});

  const solution = (
    <Solution legend={[[BLUE, '原不等式'], [GREEN, '解集']]}>
      <InequalityRules />
      <ItemSteps
        items={items.map((it) => ({ ...it, steps: [it.text, it.result] }))}
        lead={(item) => <>{item.why}</>}
      />
      <Step b="答" kind="answer">
        <Answer>{items.map((it) => `（${it.id}）${it.result}`).join('；')}。</Answer>
      </Step>
    </Solution>
  );

  return (
    <ProblemShell
      title="复习巩固 3 直接写出解集"
      subtitle="含负数系数时，不等号要变向"
      problemKey={key}
      onRandomize={() => {
        setItems(randomItems());
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setItems(bookItems());
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      {items.map((item) => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          <div>（{item.id}）{item.text}</div>
          {!practice ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {choices(item).map((choice) => (
                <button key={choice} type="button" style={chip} onClick={() => setPicks((prev) => ({ ...prev, [item.id]: choice }))}>
                  {choice}
                </button>
              ))}
            </div>
          ) : null}
          {picks[item.id] ? (
            <div>{picks[item.id] === item.result ? '对。' : '先看系数是正还是负，再决定方向变不变。'}</div>
          ) : null}
        </div>
      ))}
    </ProblemShell>
  );
}
