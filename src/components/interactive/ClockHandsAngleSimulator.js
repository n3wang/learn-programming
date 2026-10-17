import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function handsAngle(hour, minute) {
  const h = (hour % 12) * 30 + minute * 0.5;
  const m = minute * 6;
  const diff = Math.abs(h - m);
  return Math.min(diff, 360 - diff);
}

function formatDeg(n) {
  return `${n}°`;
}

function bookProblem() {
  return [
    { hour: 6, minute: 0 },
    { hour: 8, minute: 0 },
    { hour: 8, minute: 30 },
  ];
}

function randomProblem() {
  const minutes = [0, 15, 30, 45];
  const used = new Set();
  const items = [];
  let guard = 0;
  while (items.length < 3 && guard < 40) {
    guard += 1;
    const hour = randInt(1, 11);
    const minute = minutes[randInt(0, minutes.length - 1)];
    const ang = handsAngle(hour, minute);
    const key = `${ang}`;
    if (used.has(key)) continue;
    used.add(key);
    items.push({ hour, minute });
  }
  return items.length === 3 ? items : bookProblem();
}

function buildChips(items) {
  const answers = items.map((t) => handsAngle(t.hour, t.minute));
  const answerSet = new Set(answers.map(String));
  const chips = answers.map((ang, i) => ({
    id: `ans-${i}-${ang}`,
    group: String(ang),
    label: formatDeg(ang),
  }));
  const pool = [30, 45, 60, 90, 105, 135, 150, 165, 210, 240, 270];
  for (const n of pool) {
    if (chips.length >= answers.length + 3) break;
    if (answerSet.has(String(n))) continue;
    chips.push({ id: `d-${n}`, group: String(n), label: formatDeg(n) });
    answerSet.add(String(n));
  }
  for (let i = chips.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chips[i], chips[j]] = [chips[j], chips[i]];
  }
  return chips;
}

function Clock({ hour, minute }) {
  const h = ((hour % 12) * 30 + minute * 0.5 - 90) * (Math.PI / 180);
  const m = (minute * 6 - 90) * (Math.PI / 180);
  return (
    <svg viewBox="0 0 140 120" width="140" height="110" aria-hidden>
      <circle cx="70" cy="58" r="40" fill="none" stroke="#1565c0" />
      {[12, 3, 6, 9].map((n, i) => {
        const a = ((i * 90 - 90) * Math.PI) / 180;
        return (
          <circle key={n} cx={70 + Math.cos(a) * 34} cy={58 + Math.sin(a) * 34} r="1.6" fill="#90a4ae" />
        );
      })}
      <line x1="70" y1="58" x2={70 + Math.cos(h) * 24} y2={58 + Math.sin(h) * 24} stroke="#1565c0" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="58" x2={70 + Math.cos(m) * 34} y2={58 + Math.sin(m) * 34} stroke="#e91e63" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="70" cy="58" r="3" fill="#1565c0" />
      <text x="70" y="112" textAnchor="middle" fontSize="12">
        {hour} 时 {minute} 分
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

export default function ClockHandsAngleSimulator() {
  const [key, setKey] = useState(0);
  const [items, setItems] = useState(bookProblem);
  const [chips, setChips] = useState(() => buildChips(bookProblem()));
  const [slots, setSlots] = useState(() => Object.fromEntries(bookProblem().map((_, i) => [String(i), null])));
  const [activeSlot, setActiveSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const answers = useMemo(() => items.map((t) => handsAngle(t.hour, t.minute)), [items]);
  const chipById = useMemo(() => Object.fromEntries(chips.map((c) => [c.id, c])), [chips]);
  const placed = new Set(Object.values(slots).filter(Boolean));
  const bank = chips.filter((c) => !placed.has(c.id));
  const allPlaced = items.every((_, i) => slots[String(i)]);
  const allCorrect =
    allPlaced &&
    items.every((_, i) => {
      const chip = chipById[slots[String(i)]];
      return chip && chip.group === String(answers[i]);
    });

  function load(nextItems) {
    setItems(nextItems);
    setChips(buildChips(nextItems));
    setSlots(Object.fromEntries(nextItems.map((_, i) => [String(i), null])));
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
      items.map((_, i) => String(i)).find((id) => !slots[id]);
    if (!target) return;
    moveChip(chipId, target);
  }

  const solution = (
    <div className={stepStyles.solution}>
      {items.map((t, i) => (
        <SolutionStep key={`${t.hour}-${t.minute}-${i}`} badge={String(i + 1)} badgeClass={stepStyles.badgeSet}>
          时针每小时转 30°，每分钟再转 0.5°；分针每分钟转 6°。
          {t.hour} 时 {t.minute} 分，两针夹角是 {formatDeg(answers[i])}。
        </SolutionStep>
      ))}
      <SolutionStep badge="集" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {items.map((t, i) => `${t.hour} 时 ${t.minute} 分 → ${formatDeg(answers[i])}`).join('；')}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1：钟表上的角"
      subtitle="把度数卡片拖到对应钟表下面（或先点空位再点卡片）"
      problemKey={key}
      onRandomize={() => load(randomProblem())}
      onBook={() => load(bookProblem())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>看钟面，拖入时针和分针的夹角。</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {items.map((t, i) => {
          const slotId = String(i);
          const chip = slots[slotId] ? chipById[slots[slotId]] : null;
          const ok = checked && chip && chip.group === String(answers[i]);
          const bad = checked && chip && chip.group !== String(answers[i]);
          const selected = activeSlot === slotId && !chip;
          return (
            <div key={`${t.hour}-${t.minute}-${i}`} style={{ width: 148, textAlign: 'center' }}>
              <Clock hour={t.hour} minute={t.minute} />
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
                  marginTop: 4,
                  minHeight: 44,
                  borderRadius: 10,
                  border: `2px ${chip ? 'solid' : 'dashed'} ${
                    ok ? '#2e7d32' : bad ? '#c62828' : selected ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)'
                  }`,
                  background: ok ? 'rgba(46,125,50,0.12)' : bad ? 'rgba(198,40,40,0.1)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                  cursor: chip ? 'default' : 'pointer',
                }}
              >
                {chip ? (
                  <ChipButton chip={chip} onClick={() => returnChip(chip.id)} />
                ) : (
                  <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.88rem' }}>
                    {selected ? '点下面的卡片' : '拖入角度'}
                  </span>
                )}
              </div>
              {bad ? <div style={{ color: '#c62828', fontSize: '0.85rem', marginTop: 4 }}>再算时针、分针各转了多少。</div> : null}
            </div>
          );
        })}
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
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>可选角度</div>
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
        {checked && allCorrect ? <span>全部放对了。</span> : null}
        {checked && !allPlaced ? <span>还有钟表没放角度。</span> : null}
      </div>
    </ProblemShell>
  );
}

const chipBtn = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 10,
  background: 'var(--ifm-background-surface-color, var(--ifm-background-color))',
  padding: '6px 12px',
  cursor: 'grab',
  font: 'inherit',
  fontWeight: 700,
  fontSize: '1.05rem',
};

const actionBtn = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 8,
  background: 'transparent',
  padding: '6px 12px',
  cursor: 'pointer',
  font: 'inherit',
};
