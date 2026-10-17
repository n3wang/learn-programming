import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function toMinutes(d, m) {
  return d * 60 + m;
}

function format(total) {
  const abs = Math.abs(total);
  const d = Math.floor(abs / 60);
  const m = abs % 60;
  return `${d}°${m}′`;
}

function bookProblem() {
  return {
    add: [48, 39, 67, 31],
    sub: [41, 12, 11, 27],
    straight: [53, 17],
  };
}

function generate() {
  return {
    add: [randInt(20, 50), randInt(10, 50), randInt(20, 50), randInt(10, 40)],
    sub: [randInt(30, 70), randInt(20, 50), randInt(8, 20), randInt(21, 55)],
    straight: [randInt(20, 80), randInt(1, 50)],
  };
}

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function answersOf(p) {
  const add = toMinutes(p.add[0], p.add[1]) + toMinutes(p.add[2], p.add[3]);
  const sub = toMinutes(p.sub[0], p.sub[1]) - toMinutes(p.sub[2], p.sub[3]);
  const rest = toMinutes(179, 60) - toMinutes(p.straight[0], p.straight[1]);
  return { add: format(add), sub: format(sub), rest: format(rest) };
}

function distractorNear(label) {
  const match = /^(\d+)°(\d+)′$/.exec(label);
  if (!match) return `${label}`;
  const d = Number(match[1]);
  const m = Number(match[2]);
  // Common mistakes: forget carry, or treat as decimal-ish.
  const variants = [
    format(toMinutes(d, m) - 60),
    format(toMinutes(d, m) + 60),
    `${d}°${(m + 10) % 60}′`,
    `${d - 1}°${m}′`,
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}

function buildChips(p) {
  const ans = answersOf(p);
  const chips = [
    { id: 'add', group: 'add', label: ans.add },
    { id: 'sub', group: 'sub', label: ans.sub },
    { id: 'rest', group: 'rest', label: ans.rest },
  ];
  const seen = new Set(chips.map((c) => c.label));
  for (const key of ['add', 'sub', 'rest']) {
    let guard = 0;
    while (guard < 8) {
      guard += 1;
      const label = distractorNear(ans[key]);
      if (seen.has(label)) continue;
      seen.add(label);
      chips.push({ id: `d-${key}-${guard}`, group: `d-${key}-${guard}`, label });
      break;
    }
  }
  return shuffle(chips);
}

const SLOT_IDS = ['add', 'sub', 'rest'];

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
        minWidth: 110,
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

export default function DegreeAddSubSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [chips, setChips] = useState(() => buildChips(bookProblem()));
  const [slots, setSlots] = useState(() => Object.fromEntries(SLOT_IDS.map((id) => [id, null])));
  const [activeSlot, setActiveSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const answers = useMemo(() => answersOf(p), [p]);
  const chipById = useMemo(() => Object.fromEntries(chips.map((c) => [c.id, c])), [chips]);
  const placed = new Set(Object.values(slots).filter(Boolean));
  const bank = chips.filter((c) => !placed.has(c.id));
  const allPlaced = SLOT_IDS.every((id) => slots[id]);
  const allCorrect =
    allPlaced &&
    SLOT_IDS.every((id) => {
      const chip = chipById[slots[id]];
      return chip && chip.group === id;
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
    const ok = checked && chip && chip.group === id;
    const bad = checked && chip && chip.group !== id;
    return { chip, ok, bad, selected: activeSlot === id && !chip };
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="加" badgeClass={stepStyles.badgeSet}>
        度与度、分与分分别相加。分满 60 进 1°。
        {p.add[0]}°{p.add[1]}′ + {p.add[2]}°{p.add[3]}′ = {answers.add}。
      </SolutionStep>
      <SolutionStep badge="减" badgeClass={stepStyles.badgeSet}>
        分不够减，向度借 1° 当 60′。
        {p.sub[0]}°{p.sub[1]}′ − {p.sub[2]}°{p.sub[3]}′ = {answers.sub}。
      </SolutionStep>
      <SolutionStep badge="平角" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          平角是 180°，先写成 179°60′，再减。角 BOC = 180° − {p.straight[0]}°{p.straight[1]}′ = {answers.rest}。
        </div>
      </SolutionStep>
    </div>
  );

  const sAdd = slotState('add');
  const sSub = slotState('sub');
  const sRest = slotState('rest');

  return (
    <ProblemShell
      title="角度的加与减"
      subtitle="分满 60 进 1°；不够减时向度借 1° 作 60′；平角先写成 179°60′"
      problemKey={key}
      onRandomize={() => load(generate())}
      onBook={() => load(bookProblem())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>把计算结果拖进空位（书题目含练习 3 与例 2）。</p>

      <div style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span>
            （1）{p.add[0]}°{p.add[1]}′ + {p.add[2]}°{p.add[3]}′ =
          </span>
          <Slot
            slotId="add"
            chip={sAdd.chip}
            selected={sAdd.selected}
            ok={sAdd.ok}
            bad={sAdd.bad}
            placeholder="和"
            onSelect={() => setActiveSlot('add')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
        </div>
        {sAdd.bad ? (
          <div style={{ color: '#c62828', fontSize: '0.9rem' }}>分相加，满 60 进到度。</div>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span>
            （2）{p.sub[0]}°{p.sub[1]}′ − {p.sub[2]}°{p.sub[3]}′ =
          </span>
          <Slot
            slotId="sub"
            chip={sSub.chip}
            selected={sSub.selected}
            ok={sSub.ok}
            bad={sSub.bad}
            placeholder="差"
            onSelect={() => setActiveSlot('sub')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
        </div>
        {sSub.bad ? (
          <div style={{ color: '#c62828', fontSize: '0.9rem' }}>分不够减时，向度借 1° = 60′。</div>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span>
            （3）O 在直线 AB 上，角 AOC = {p.straight[0]}°{p.straight[1]}′，角 BOC =
          </span>
          <Slot
            slotId="rest"
            chip={sRest.chip}
            selected={sRest.selected}
            ok={sRest.ok}
            bad={sRest.bad}
            placeholder="平角差"
            onSelect={() => setActiveSlot('rest')}
            onDrop={onDropSlot}
            onReturn={returnChip}
          />
        </div>
        {sRest.bad ? (
          <div style={{ color: '#c62828', fontSize: '0.9rem' }}>180° 写成 179°60′ 再减。</div>
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
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>可选结果</div>
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
        {checked && allCorrect ? <span>三道都对了。</span> : null}
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
