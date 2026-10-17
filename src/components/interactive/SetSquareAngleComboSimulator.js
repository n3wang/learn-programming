import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

/** 三角尺拼角、叠角：课本探究表。 */
const BOOK_ROWS = [
  { op: '45° + 30°', ans: 75 },
  { op: '45° − 30°', ans: 15 },
  { op: '60° + 45°', ans: 105 },
  { op: '90° + 30°', ans: 120 },
  { op: '90° + 45°', ans: 135 },
  { op: '90° + 60°', ans: 150 },
];

const EXTRA_ROWS = [
  { op: '90° − 30°', ans: 60 },
  { op: '90° − 45°', ans: 45 },
  { op: '60° − 30°', ans: 30 },
  { op: '45° + 45°', ans: 90 },
  { op: '30° + 60°', ans: 90 },
  { op: '90° + 90°', ans: 180 },
];

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function bookProblem() {
  return BOOK_ROWS.map((r) => ({ ...r }));
}

function randomProblem() {
  const pool = shuffle([...BOOK_ROWS, ...EXTRA_ROWS]);
  const picked = [];
  const usedAns = new Set();
  for (const row of pool) {
    if (picked.length >= 6) break;
    if (usedAns.has(row.ans)) continue;
    usedAns.add(row.ans);
    picked.push({ ...row });
  }
  return picked.length >= 4 ? picked : bookProblem();
}

function buildChips(rows) {
  const answers = rows.map((r) => r.ans);
  const answerSet = new Set(answers);
  const chips = answers.map((n, i) => ({
    id: `a-${i}-${n}`,
    group: String(n),
    label: `${n}°`,
  }));
  const distractors = [20, 35, 55, 80, 100, 110, 140, 165, 180];
  for (const n of distractors) {
    if (chips.length >= answers.length + 3) break;
    if (answerSet.has(n)) continue;
    chips.push({ id: `d-${n}`, group: String(n), label: `${n}°` });
    answerSet.add(n);
  }
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

export default function SetSquareAngleComboSimulator() {
  const [key, setKey] = useState(0);
  const [rows, setRows] = useState(bookProblem);
  const [chips, setChips] = useState(() => buildChips(BOOK_ROWS));
  const [slots, setSlots] = useState(() => Object.fromEntries(BOOK_ROWS.map((_, i) => [String(i), null])));
  const [activeSlot, setActiveSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const chipById = useMemo(() => Object.fromEntries(chips.map((c) => [c.id, c])), [chips]);
  const placed = new Set(Object.values(slots).filter(Boolean));
  const bank = chips.filter((c) => !placed.has(c.id));
  const allPlaced = rows.every((_, i) => slots[String(i)]);
  const allCorrect =
    allPlaced &&
    rows.every((r, i) => {
      const chip = chipById[slots[String(i)]];
      return chip && chip.group === String(r.ans);
    });

  function load(next) {
    setRows(next);
    setChips(buildChips(next));
    setSlots(Object.fromEntries(next.map((_, i) => [String(i), null])));
    setActiveSlot(null);
    setChecked(false);
    setKey((k) => k + 1);
  }

  function moveChip(chipId, slotId) {
    setSlots((prev) => {
      const next = { ...prev };
      const fromSlot = Object.keys(next).find((k) => next[k] === chipId);
      const displaced = next[slotId];
      if (fromSlot && fromSlot !== slotId) next[fromSlot] = displaced || null;
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
    const target =
      (activeSlot && !slots[activeSlot] && activeSlot) ||
      rows.map((_, i) => String(i)).find((id) => !slots[id]);
    if (!target) return;
    moveChip(chipId, target);
  }

  const solution = (
    <div className={stepStyles.solution}>
      {rows.map((r, i) => (
        <SolutionStep key={`${r.op}-${i}`} badge={String(i + 1)} badgeClass={stepStyles.badgeSet}>
          {r.op} = {r.ans}°（三角尺上的特殊角相加或相减）。
        </SolutionStep>
      ))}
      <SolutionStep badge="集" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {rows.map((r) => `${r.op} → ${r.ans}°`).join('；')}。
        </div>
      </SolutionStep>
    </div>
  );

  const cell = {
    border: '1px solid var(--ifm-color-emphasis-300)',
    padding: '8px 10px',
  };

  return (
    <ProblemShell
      title="探究：三角尺拼出的角"
      subtitle="把结果度数拖到对应运算右边（拼在一起是加，叠去一块是减）"
      problemKey={key}
      onRandomize={() => load(randomProblem())}
      onBook={() => load(bookProblem())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>一副三角尺有 30°、45°、60°、90°。拖入运算结果。</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 420, fontSize: 15 }}>
          <thead>
            <tr>
              <th style={{ ...cell, textAlign: 'left' }}>运算</th>
              <th style={{ ...cell, textAlign: 'left' }}>度数</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const slotId = String(i);
              const chip = slots[slotId] ? chipById[slots[slotId]] : null;
              const ok = checked && chip && chip.group === String(r.ans);
              const bad = checked && chip && chip.group !== String(r.ans);
              const selected = activeSlot === slotId && !chip;
              return (
                <tr key={`${r.op}-${i}`}>
                  <td style={cell}>{r.op}</td>
                  <td style={{ ...cell, padding: 6 }}>
                    <div
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const chipId = event.dataTransfer.getData('text/plain');
                        if (chipById[chipId]) moveChip(chipId, slotId);
                      }}
                      onClick={() => {
                        if (!chip) setActiveSlot(slotId);
                      }}
                      style={{
                        minHeight: 40,
                        borderRadius: 8,
                        border: `2px ${chip ? 'solid' : 'dashed'} ${
                          ok ? '#2e7d32' : bad ? '#c62828' : selected ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)'
                        }`,
                        background: ok ? 'rgba(46,125,50,0.12)' : bad ? 'rgba(198,40,40,0.1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                        cursor: chip ? 'default' : 'pointer',
                      }}
                    >
                      {chip ? (
                        <ChipButton chip={chip} onClick={() => returnChip(chip.id)} />
                      ) : (
                        <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.85rem' }}>
                          {selected ? '点卡片' : '拖入度数'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const chipId = event.dataTransfer.getData('text/plain');
          if (chipById[chipId]) returnChip(chipId);
        }}
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 10,
          background: 'var(--ifm-color-emphasis-100)',
          minHeight: 64,
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>可选度数</div>
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
        <button type="button" onClick={() => load(rows)} style={actionBtn}>
          重来
        </button>
        {checked && allCorrect ? <span>全部配对正确。</span> : null}
        {checked && !allPlaced ? <span>还有空格。</span> : null}
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
  fontSize: '1rem',
};

const actionBtn = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  background: 'transparent',
  padding: '6px 12px',
  cursor: 'pointer',
  font: 'inherit',
};
