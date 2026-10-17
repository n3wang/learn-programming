import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function bookProblem() {
  return { deg: 35, d: 38, m: 15, decimal: 38.15 };
}

function generate() {
  const deg = randInt(2, 5) * 10 + 5;
  const d = randInt(20, 50);
  const m = [10, 12, 15, 18, 20, 24, 30][randInt(0, 6)];
  // Decimal that looks like "d.m" but is NOT m minutes (common trap).
  const fakeTenths = Math.min(99, m);
  const decimal = Number(`${d}.${String(fakeTenths).padStart(2, '0')}`);
  return { deg, d, m, decimal };
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function formatMin(n) {
  return `${n}′`;
}

function formatSec(n) {
  return `${n}″`;
}

function decimalToMinutes(decimal) {
  const whole = Math.floor(decimal);
  const frac = Number((decimal - whole).toFixed(4));
  const mins = Math.round(frac * 60);
  return { whole, mins };
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

function Slot({ slotId, chip, selected, ok, bad, placeholder, onSelect, onDrop, onReturn }) {
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => onDrop(event, slotId)}
      onClick={() => {
        if (!chip) onSelect();
      }}
      style={{
        minWidth: 96,
        minHeight: 44,
        borderRadius: 10,
        border: `2px ${chip ? 'solid' : 'dashed'} ${
          ok ? '#2e7d32' : bad ? '#c62828' : selected ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)'
        }`,
        background: ok ? 'rgba(46,125,50,0.12)' : bad ? 'rgba(198,40,40,0.1)' : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        cursor: chip ? 'default' : 'pointer',
        verticalAlign: 'middle',
      }}
    >
      {chip ? (
        <ChipButton chip={chip} onClick={() => onReturn(chip.id)} />
      ) : (
        <span style={{ color: 'var(--ifm-color-emphasis-600)', fontSize: '0.85rem' }}>
          {selected ? '点卡片' : placeholder}
        </span>
      )}
    </div>
  );
}

function buildChips(p) {
  const minutes = p.deg * 60;
  const seconds = minutes * 60;
  const { whole, mins } = decimalToMinutes(p.decimal);
  const dmsLabel = `${p.d}°${p.m}′`;
  const decAsDms = `${whole}°${mins}′`;
  const dmsBigger = p.d + p.m / 60 > p.decimal;

  const chips = [
    { id: 'min', group: 'min', label: formatMin(minutes) },
    { id: 'sec', group: 'sec', label: formatSec(seconds) },
    { id: 'uneq', group: 'uneq', label: '不相等' },
    { id: 'eq', group: 'eq', label: '相等' },
    { id: 'decDms', group: 'decDms', label: decAsDms },
    {
      id: 'cmp',
      group: 'cmp',
      label: dmsBigger ? `${dmsLabel} > ${p.decimal}°` : `${p.decimal}° > ${dmsLabel}`,
    },
    // distractors
    { id: 'd1', group: 'd1', label: formatMin(p.deg * 100) },
    { id: 'd2', group: 'd2', label: formatSec(minutes) },
    { id: 'd3', group: 'd3', label: `${p.d}°${Math.round((p.decimal % 1) * 100)}′` },
    {
      id: 'd4',
      group: 'd4',
      label: dmsBigger ? `${p.decimal}° > ${dmsLabel}` : `${dmsLabel} > ${p.decimal}°`,
    },
  ];
  return shuffle(chips);
}

const SLOT_IDS = ['min', 'sec', 'rel', 'decDms', 'cmp'];

export default function DegreeConvertCompareSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [chips, setChips] = useState(() => buildChips(bookProblem()));
  const [slots, setSlots] = useState(() => Object.fromEntries(SLOT_IDS.map((id) => [id, null])));
  const [activeSlot, setActiveSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const minutes = p.deg * 60;
  const seconds = minutes * 60;
  const fromDms = useMemo(() => p.d + p.m / 60, [p]);
  const { whole, mins } = decimalToMinutes(p.decimal);
  const dmsLabel = `${p.d}°${p.m}′`;
  const decAsDms = `${whole}°${mins}′`;
  const dmsBigger = fromDms > p.decimal;
  const cmpLabel = dmsBigger ? `${dmsLabel} > ${p.decimal}°` : `${p.decimal}° > ${dmsLabel}`;

  const chipById = useMemo(() => Object.fromEntries(chips.map((c) => [c.id, c])), [chips]);
  const answers = {
    min: 'min',
    sec: 'sec',
    rel: 'uneq',
    decDms: 'decDms',
    cmp: 'cmp',
  };

  const placed = new Set(Object.values(slots).filter(Boolean));
  const bank = chips.filter((c) => !placed.has(c.id));
  const allPlaced = SLOT_IDS.every((id) => slots[id]);
  const allCorrect =
    allPlaced &&
    SLOT_IDS.every((id) => {
      const chip = chipById[slots[id]];
      return chip && chip.group === answers[id];
    });

  function load(next) {
    setP(next);
    setChips(buildChips(next));
    setSlots(Object.fromEntries(SLOT_IDS.map((id) => [id, null])));
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
      (activeSlot && !slots[activeSlot] && activeSlot) || SLOT_IDS.find((id) => !slots[id]);
    if (!target) return;
    moveChip(chipId, target);
  }

  function onDropSlot(event, slotId) {
    event.preventDefault();
    const chipId = event.dataTransfer.getData('text/plain');
    if (chipById[chipId]) moveChip(chipId, slotId);
  }

  function slotState(id) {
    const chip = slots[id] ? chipById[slots[id]] : null;
    const ok = checked && chip && chip.group === answers[id];
    const bad = checked && chip && chip.group !== answers[id];
    return { chip, ok, bad, selected: activeSlot === id && !chip };
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        1° = 60′，1′ = 60″。{p.deg}° = {formatMin(minutes)} = {formatSec(seconds)}。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          不相等；{p.decimal}° = {decAsDms}（小数部分 × 60 才是分），所以 {cmpLabel}。
        </div>
      </SolutionStep>
    </div>
  );

  const s1 = slotState('min');
  const s2 = slotState('sec');
  const s3 = slotState('rel');
  const s4 = slotState('decDms');
  const s5 = slotState('cmp');

  return (
    <ProblemShell
      title="练习 3：度、分、秒与小数"
      subtitle="1° = 60′，1′ = 60″；小数部分要乘 60 才是分，不能直接当成分"
      problemKey={key}
      onRandomize={() => load(generate())}
      onBook={() => load(bookProblem())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>把正确的结果拖进空位（或先点空位再点卡片）。</p>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>（1）换算</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, lineHeight: 1.6 }}>
          <span>{p.deg}° =</span>
          <Slot
            slotId="min"
            chip={s1.chip}
            selected={s1.selected}
            ok={s1.ok}
            bad={s1.bad}
            placeholder="分"
            onSelect={() => setActiveSlot('min')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
          <span>=</span>
          <Slot
            slotId="sec"
            chip={s2.chip}
            selected={s2.selected}
            ok={s2.ok}
            bad={s2.bad}
            placeholder="秒"
            onSelect={() => setActiveSlot('sec')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
        </div>
        {s1.bad || s2.bad ? (
          <div style={{ color: '#c62828', fontSize: '0.9rem', marginTop: 4 }}>乘 60 化成分，再乘 60 化成秒。</div>
        ) : null}
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>（2）比较</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span>
            {dmsLabel} 和 {p.decimal}°
          </span>
          <Slot
            slotId="rel"
            chip={s3.chip}
            selected={s3.selected}
            ok={s3.ok}
            bad={s3.bad}
            placeholder="相等？"
            onSelect={() => setActiveSlot('rel')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span>{p.decimal}° =</span>
          <Slot
            slotId="decDms"
            chip={s4.chip}
            selected={s4.selected}
            ok={s4.ok}
            bad={s4.bad}
            placeholder="化成度分"
            onSelect={() => setActiveSlot('decDms')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span>所以</span>
          <Slot
            slotId="cmp"
            chip={s5.chip}
            selected={s5.selected}
            ok={s5.ok}
            bad={s5.bad}
            placeholder="谁更大"
            onSelect={() => setActiveSlot('cmp')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
        </div>
        {s3.bad || s4.bad || s5.bad ? (
          <div style={{ color: '#c62828', fontSize: '0.9rem', marginTop: 4 }}>
            0.{String(p.decimal).split('.')[1] || '0'}° = 小数 × 60 分，不是直接写成 {Math.round((p.decimal % 1) * 100)}′。
          </div>
        ) : null}
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
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>可选</div>
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
        <button type="button" onClick={() => load(p)} style={actionBtn}>
          重来
        </button>
        {checked && allCorrect ? <span>换算和比较都对了。</span> : null}
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
