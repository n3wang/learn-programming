import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

/** Book pairs: short name ↔ three-letter name. */
const PAIRS = [
  { short: '∠1', long: '∠CAD' },
  { short: '∠2', long: '∠ACB' },
  { short: '∠3', long: '∠BAC' },
  { short: '∠B', long: '∠ABC' },
  { short: '∠4', long: '∠ACD' },
  { short: '∠D', long: '∠ADC' },
];

const DISTRACTORS_LONG = ['∠CDA', '∠BAD', '∠BCA', '∠CDB'];
const DISTRACTORS_SHORT = ['∠A', '∠C', '∠5', '∠6'];

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function bookRound() {
  return { fill: 'long', order: PAIRS.map((_, i) => i) };
}

function randomRound() {
  return {
    fill: Math.random() < 0.5 ? 'long' : 'short',
    order: shuffle(PAIRS.map((_, i) => i)),
  };
}

function Figure() {
  return (
    <svg viewBox="0 0 280 130" width="100%" height="120" aria-hidden>
      <polygon points="70,28 230,28 190,108 30,108" fill="none" stroke="#1565c0" strokeWidth="1.6" />
      <line x1="70" y1="28" x2="190" y2="108" stroke="#00897b" strokeWidth="1.6" />
      <text x="58" y="22" fontSize="13">
        A
      </text>
      <text x="232" y="24" fontSize="13">
        D
      </text>
      <text x="18" y="116" fontSize="13">
        B
      </text>
      <text x="194" y="116" fontSize="13">
        C
      </text>
      <text x="108" y="36" fontSize="12">
        1
      </text>
      <text x="62" y="48" fontSize="12">
        3
      </text>
      <text x="168" y="100" fontSize="12">
        2
      </text>
      <text x="178" y="92" fontSize="12">
        4
      </text>
    </svg>
  );
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

function buildChips(fill) {
  const answers = PAIRS.map((p, i) => ({
    id: `ans-${i}`,
    group: fill === 'long' ? p.long : p.short,
    label: fill === 'long' ? p.long : p.short,
  }));
  const extras = (fill === 'long' ? DISTRACTORS_LONG : DISTRACTORS_SHORT)
    .slice(0, 2)
    .map((label, i) => ({ id: `d-${i}`, group: label, label }));
  return shuffle([...answers, ...extras]);
}

export default function AngleNameTableSimulator() {
  const [key, setKey] = useState(0);
  const [round, setRound] = useState(bookRound);
  const [chips, setChips] = useState(() => buildChips('long'));
  const [slots, setSlots] = useState(() => Object.fromEntries(PAIRS.map((_, i) => [String(i), null])));
  const [activeSlot, setActiveSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const chipById = useMemo(() => Object.fromEntries(chips.map((c) => [c.id, c])), [chips]);
  const ordered = round.order.map((i) => ({ index: i, pair: PAIRS[i] }));
  const placed = new Set(Object.values(slots).filter(Boolean));
  const bank = chips.filter((c) => !placed.has(c.id));
  const allPlaced = PAIRS.every((_, i) => slots[String(i)]);
  const allCorrect =
    allPlaced &&
    PAIRS.every((p, i) => {
      const chip = chipById[slots[String(i)]];
      const want = round.fill === 'long' ? p.long : p.short;
      return chip && chip.group === want;
    });

  function load(next) {
    setRound(next);
    setChips(buildChips(next.fill));
    setSlots(Object.fromEntries(PAIRS.map((_, i) => [String(i), null])));
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
      PAIRS.map((_, i) => String(i)).find((id) => !slots[id]);
    if (!target) return;
    moveChip(chipId, target);
  }

  const givenLabel = round.fill === 'long' ? '表示方法 1' : '表示方法 2';
  const blankLabel = round.fill === 'long' ? '表示方法 2' : '表示方法 1';

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="填" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          ∠1 = ∠CAD，∠2 = ∠ACB，∠3 = ∠BAC，∠B = ∠ABC，∠4 = ∠ACD，∠D = ∠ADC。
          顶点处有不只一个角时，不能只写顶点字母。
        </div>
      </SolutionStep>
    </div>
  );

  const cell = {
    border: '1px solid var(--ifm-color-emphasis-300)',
    padding: '6px 8px',
    textAlign: 'center',
    minWidth: 72,
  };

  return (
    <ProblemShell
      title="练习 2：用另一种方法表示角"
      subtitle="把另一种写法拖进空格（顶点处有多个角时要用三个字母）"
      problemKey={key}
      onRandomize={() => load(randomRound())}
      onBook={() => load(bookRound())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>根据图中信息，把表里的角用另一种方法表示出来。</p>
      <Figure />

      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 14, width: '100%', maxWidth: 640 }}>
          <tbody>
            <tr>
              <th style={{ ...cell, textAlign: 'left' }}>{givenLabel}</th>
              {ordered.map(({ index, pair }) => (
                <td key={`g-${index}`} style={cell}>
                  {round.fill === 'long' ? pair.short : pair.long}
                </td>
              ))}
            </tr>
            <tr>
              <th style={{ ...cell, textAlign: 'left' }}>{blankLabel}</th>
              {ordered.map(({ index, pair }) => {
                const slotId = String(index);
                const chip = slots[slotId] ? chipById[slots[slotId]] : null;
                const want = round.fill === 'long' ? pair.long : pair.short;
                const ok = checked && chip && chip.group === want;
                const bad = checked && chip && chip.group !== want;
                const selected = activeSlot === slotId && !chip;
                return (
                  <td key={`b-${index}`} style={{ ...cell, padding: 4 }}>
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
                        <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.8rem' }}>
                          {selected ? '点卡片' : '拖入'}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
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
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>可选写法</div>
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
        <button type="button" onClick={() => load(round)} style={actionBtn}>
          重来
        </button>
        {checked && allCorrect ? <span>全部对应正确。</span> : null}
        {checked && !allPlaced ? <span>还有空格。</span> : null}
        {checked && allPlaced && !allCorrect ? <span>对照图：角 1 在 A 旁靠 AD 一侧。</span> : null}
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
  fontSize: '0.95rem',
};

const actionBtn = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  background: 'transparent',
  padding: '6px 12px',
  cursor: 'pointer',
  font: 'inherit',
};
