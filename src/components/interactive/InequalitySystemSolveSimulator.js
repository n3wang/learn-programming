import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';
import InequalitySystemNumberLine from '@site/src/components/interactive/shell/InequalitySystemNumberLine';

function bookItems() {
  return [
    {
      id: '1',
      text: 'x − 1 < 3，x + 1 < 3',
      halves: 'x < 4 与 x < 2',
      answer: 'x < 2',
      a: { at: 4, dir: 'left', closed: false },
      b: { at: 2, dir: 'left', closed: false },
    },
    {
      id: '2',
      text: 'x − 1 > 3，x + 1 > 3',
      halves: 'x > 4 与 x > 2',
      answer: 'x > 4',
      a: { at: 4, dir: 'right', closed: false },
      b: { at: 2, dir: 'right', closed: false },
    },
    {
      id: '3',
      text: 'x − 1 < 3，x + 1 > 3',
      halves: 'x < 4 与 x > 2',
      answer: '2 < x < 4',
      a: { at: 4, dir: 'left', closed: false },
      b: { at: 2, dir: 'right', closed: false },
    },
    {
      id: '4',
      text: 'x − 1 > 3，x + 1 < 3',
      halves: 'x > 4 与 x < 2',
      answer: '无解',
      a: { at: 4, dir: 'right', closed: false },
      b: { at: 2, dir: 'left', closed: false },
    },
  ];
}

function exampleItems() {
  return [
    {
      id: '1',
      text: '2x − 1 > x + 1，x + 8 < 4x − 1',
      halves: 'x > 2 与 x > 3',
      answer: 'x > 3',
      a: { at: 2, dir: 'right', closed: false },
      b: { at: 3, dir: 'right', closed: false },
    },
    {
      id: '2',
      text: '2x + 3 ≥ x + 11，(2x + 5)/3 − 1 < 2 − x',
      halves: 'x ≥ 8 与 x < 4/5',
      answer: '无解',
      a: { at: 8, dir: 'right', closed: true },
      b: { at: 0.8, dir: 'left', closed: false, label: '4/5' },
    },
    {
      id: '3',
      text: '2x > 1 − x，x + 2 < 4x − 1',
      halves: 'x > 1/3 与 x > 1',
      answer: 'x > 1',
      a: { at: 1 / 3, dir: 'right', closed: false, label: '1/3' },
      b: { at: 1, dir: 'right', closed: false },
    },
    {
      id: '4',
      text: 'x − 5 > 1 + 2x，3x + 2 ≤ 4x',
      halves: 'x < −6 与 x ≥ 2',
      answer: '无解',
      a: { at: -6, dir: 'left', closed: false },
      b: { at: 2, dir: 'right', closed: true },
    },
  ];
}

function randomItems() {
  const m = randInt(1, 4);
  return [
    {
      id: '1',
      text: `x − ${m} < ${m + 2}，x + ${m} < ${m + 2}`,
      halves: `x < ${2 * m + 2} 与 x < ${2}`,
      answer: 'x < 2',
      a: { at: 2 * m + 2, dir: 'left', closed: false },
      b: { at: 2, dir: 'left', closed: false },
    },
    {
      id: '2',
      text: `x − ${m} > ${m + 2}，x + ${m} > ${m + 2}`,
      halves: `x > ${2 * m + 2} 与 x > ${2}`,
      answer: `x > ${2 * m + 2}`,
      a: { at: 2 * m + 2, dir: 'right', closed: false },
      b: { at: 2, dir: 'right', closed: false },
    },
    {
      id: '3',
      text: `x − ${m} < ${m + 2}，x + ${m} > ${m + 2}`,
      halves: `x < ${2 * m + 2} 与 x > ${2}`,
      answer: `2 < x < ${2 * m + 2}`,
      a: { at: 2 * m + 2, dir: 'left', closed: false },
      b: { at: 2, dir: 'right', closed: false },
    },
    {
      id: '4',
      text: `x − ${m} > ${m + 2}，x + ${m} < ${m + 2}`,
      halves: `x > ${2 * m + 2} 与 x < ${2}`,
      answer: '无解',
      a: { at: 2 * m + 2, dir: 'right', closed: false },
      b: { at: 2, dir: 'left', closed: false },
    },
  ];
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildChips(items) {
  const chips = items.map((it) => ({
    id: `ans-${it.id}`,
    group: it.answer,
    label: it.answer,
  }));
  const used = new Set(chips.map((c) => c.label));
  ['x > 2', 'x < 4', '无解', '2 < x < 4'].forEach((label, i) => {
    if (used.has(label)) return;
    used.add(label);
    chips.push({ id: `d-${i}`, group: label, label });
  });
  return shuffle(chips);
}

function ChipButton({ chip, onClick }) {
  const dragged = useRef(false);
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        dragged.current = true;
        event.dataTransfer.setData('text/plain', chip.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (dragged.current) {
          dragged.current = false;
          return;
        }
        onClick();
      }}
      style={chipBtn}
    >
      {chip.label}
    </button>
  );
}

export default function InequalitySystemSolveSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookItems);
  const [chips, setChips] = useState(() => buildChips(bookItems()));
  const [slots, setSlots] = useState(() => Object.fromEntries(bookItems().map((it) => [it.id, null])));
  const [activeSlot, setActiveSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const chipById = useMemo(() => Object.fromEntries(chips.map((c) => [c.id, c])), [chips]);
  const placed = new Set(Object.values(slots).filter(Boolean));
  const bank = chips.filter((c) => !placed.has(c.id));
  const allPlaced = items.every((it) => slots[it.id]);
  const allCorrect =
    allPlaced &&
    items.every((it) => {
      const chip = chipById[slots[it.id]];
      return chip && chip.group === it.answer;
    });

  function load(next) {
    setItems(next);
    setChips(buildChips(next));
    setSlots(Object.fromEntries(next.map((it) => [it.id, null])));
    setActiveSlot(null);
    setChecked(false);
    setKey((k) => k + 1);
  }

  function moveChip(chipId, slotId) {
    setSlots((prev) => {
      const next = { ...prev };
      const from = Object.keys(next).find((k) => next[k] === chipId);
      const displaced = next[slotId];
      if (from && from !== slotId) next[from] = displaced || null;
      next[slotId] = chipId;
      return next;
    });
    setChecked(false);
    setActiveSlot(null);
  }

  function returnChip(chipId) {
    setSlots((prev) => {
      const next = { ...prev };
      const from = Object.keys(next).find((k) => next[k] === chipId);
      if (from) next[from] = null;
      return next;
    });
    setChecked(false);
  }

  function placeFromBank(chipId) {
    const target = (activeSlot && !slots[activeSlot] && activeSlot) || items.map((it) => it.id).find((id) => !slots[id]);
    if (!target) return;
    moveChip(chipId, target);
  }

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((it) => (
        <SolutionStep key={it.id} badge={it.id} badgeClass={stepStyles.badgeSet}>
          {it.text}。分别得 {it.halves}，公共部分 {it.answer}。
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="解不等式组"
      subtitle="两个都向右取更靠右的；都向左取更靠左的；一左一右看有没有重叠"
      problemKey={key}
      onRandomize={() => load(randomItems())}
      onBook={() => load(bookItems())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        把解集拖到对应不等式组下面。「书题目」是四种基本型；再点一次可换成例 1 那组。
      </p>
      <button type="button" onClick={() => load(exampleItems())} style={{ ...actionBtn, marginBottom: 10 }}>
        换成例 1 / 练习
      </button>
      {items.map((it) => {
        const chip = slots[it.id] ? chipById[slots[it.id]] : null;
        const ok = checked && chip && chip.group === it.answer;
        const bad = checked && chip && chip.group !== it.answer;
        const selected = activeSlot === it.id && !chip;
        return (
          <div key={it.id} style={{ marginBottom: 14 }}>
            <div>
              （{it.id}）{it.text}
            </div>
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const chipId = event.dataTransfer.getData('text/plain');
                if (chipById[chipId]) moveChip(chipId, it.id);
              }}
              onClick={() => {
                if (!chip) setActiveSlot(it.id);
              }}
              style={{
                marginTop: 6,
                minHeight: 44,
                borderRadius: 10,
                border: `2px ${chip ? 'solid' : 'dashed'} ${
                  ok ? '#2e7d32' : bad ? '#c62828' : selected ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)'
                }`,
                background: ok ? 'rgba(46,125,50,0.12)' : bad ? 'rgba(198,40,40,0.1)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {chip ? (
                <ChipButton chip={chip} onClick={() => returnChip(chip.id)} />
              ) : (
                <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.88rem' }}>
                  {selected ? '点下面的卡片' : '拖入解集'}
                </span>
              )}
            </div>
            {ok ? <InequalitySystemNumberLine a={it.a} b={it.b} extraMarks={[0]} showSources={false} /> : null}
          </div>
        );
      })}

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const chipId = event.dataTransfer.getData('text/plain');
          if (chipById[chipId]) returnChip(chipId);
        }}
        style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 10,
          background: 'var(--ifm-color-emphasis-100)',
          minHeight: 56,
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>可选解集</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {bank.map((chip) => (
            <ChipButton key={chip.id} chip={chip} onClick={() => placeFromBank(chip.id)} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" onClick={() => setChecked(true)} style={actionBtn}>
          检查
        </button>
        <button type="button" onClick={() => load(items)} style={actionBtn}>
          重来
        </button>
        {checked && allCorrect ? <span>四组都对了。</span> : null}
        {checked && !allPlaced ? <span>还有空位。</span> : null}
      </div>
    </ProblemShell>
  );
}

const chipBtn = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  background: 'var(--ifm-background-surface-color, var(--ifm-background-color))',
  padding: '4px 10px',
  cursor: 'grab',
  font: 'inherit',
  fontWeight: 700,
};

const actionBtn = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  background: 'transparent',
  padding: '6px 12px',
  cursor: 'pointer',
  font: 'inherit',
};
