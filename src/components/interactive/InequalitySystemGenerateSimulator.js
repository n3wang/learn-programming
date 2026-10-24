import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';
import InequalitySystemNumberLine, {
  describeHalf,
  describeIntersection,
  intersectHalves,
} from '@site/src/components/interactive/shell/InequalitySystemNumberLine';

function dash(n) {
  return String(n).replace('-', '−');
}

function expr(coef, add) {
  let out;
  if (coef === 0) out = dash(add);
  else if (coef === 1) out = 'x';
  else if (coef === -1) out = '−x';
  else out = `${dash(coef)}x`;
  if (coef !== 0) {
    if (add > 0) out += ` + ${add}`;
    else if (add < 0) out += ` − ${-add}`;
  }
  return out;
}

function maybeParen(coef, add) {
  if (coef >= 2 && add !== 0 && add % coef === 0 && randInt(0, 2) === 0) {
    const inside = add / coef;
    const inner = inside > 0 ? `x + ${inside}` : `x − ${-inside}`;
    return `${coef}(${inner})`;
  }
  return expr(coef, add);
}

function signOf(dir, closed) {
  if (dir === 'right') return closed ? '≥' : '>';
  return closed ? '≤' : '<';
}

/** Build ax + p ∘ bx + q that simplifies to x ∘ at without flipping. */
function makeIneq({ dir, at, closed }) {
  const m = randInt(1, 3);
  const rightCoef = randInt(-1, 3);
  const leftCoef = rightCoef + m;
  const p = randInt(-6, 6);
  const q = p + m * at;
  const sign = signOf(dir, closed);
  const left = maybeParen(leftCoef, p);
  const right = expr(rightCoef, q);
  return {
    text: `${left} ${sign} ${right}`,
    step: `移项得 ${m}x ${sign} ${dash(m * at)}，所以 ${describeHalf({ at, dir, closed })}`,
    half: { at, dir, closed },
  };
}

function pickPattern() {
  const roll = randInt(1, 5);
  if (roll <= 3) return 'interval';
  if (roll === 4) return 'same';
  return 'empty';
}

function makeSystem(id) {
  const lo = randInt(-2, 3);
  const hi = lo + randInt(2, 5);
  const pattern = pickPattern();
  let first;
  let second;
  if (pattern === 'interval') {
    first = makeIneq({ dir: 'right', at: lo, closed: randInt(0, 1) === 1 });
    second = makeIneq({ dir: 'left', at: hi, closed: randInt(0, 1) === 1 });
  } else if (pattern === 'same') {
    const dir = randInt(0, 1) === 1 ? 'right' : 'left';
    first = makeIneq({ dir, at: lo, closed: false });
    second = makeIneq({ dir, at: hi, closed: false });
  } else {
    first = makeIneq({ dir: 'right', at: hi, closed: true });
    second = makeIneq({ dir: 'left', at: lo, closed: false });
  }
  const result = intersectHalves(first.half, second.half);
  return {
    id,
    lines: [first.text, second.text],
    steps: [first.step, second.step],
    halves: `${describeHalf(first.half)} 与 ${describeHalf(second.half)}`,
    answer: describeIntersection(result),
    a: first.half,
    b: second.half,
  };
}

function bookItems() {
  return [
    {
      id: '1',
      lines: ['2x − 1 > x + 1', 'x + 8 < 4x − 1'],
      steps: ['移项得 x > 2', '移项得 9 < 3x，所以 x > 3'],
      halves: 'x > 2 与 x > 3',
      answer: 'x > 3',
      a: { at: 2, dir: 'right', closed: false },
      b: { at: 3, dir: 'right', closed: false },
    },
    {
      id: '2',
      lines: ['2x + 3 ≥ x + 11', '(2x + 5)/3 − 1 < 2 − x'],
      steps: ['移项得 x ≥ 8', '去分母、移项得 5x < 4，所以 x < 4/5'],
      halves: 'x ≥ 8 与 x < 4/5',
      answer: '无解',
      a: { at: 8, dir: 'right', closed: true },
      b: { at: 0.8, dir: 'left', closed: false, label: '4/5' },
    },
  ];
}

function randomItems() {
  return [makeSystem('1'), makeSystem('2')];
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
  items.forEach((it, i) => {
    it.halves.split(' 与 ').forEach((label, j) => {
      if (used.has(label)) return;
      used.add(label);
      chips.push({ id: `h-${i}-${j}`, group: label, label });
    });
  });
  ['无解', 'x > 0', 'x < 0'].forEach((label, i) => {
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

function SystemView({ item }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, margin: '4px 0 8px' }}>
      <div style={{ fontSize: '1.6rem', lineHeight: 1.15, paddingRight: 2 }}>{'{'}</div>
      <div>
        {item.lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export default function InequalitySystemGenerateSimulator() {
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
          {it.steps.map((line) => (
            <div key={line}>{line}</div>
          ))}
          <div>
            分别得 {it.halves}，公共部分 {it.answer}。
          </div>
        </SolutionStep>
      ))}
    </div>
  );

  return (
    <ProblemShell
      title="例 1 型：解不等式组"
      subtitle="先分别化成 x > m 或 x < m，再看公共部分。随机多数是一左一右夹一段"
      problemKey={key}
      onRandomize={() => load(randomItems())}
      onBook={() => load(bookItems())}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>每组两个不等式。解完后把公共解集拖进去。</p>
      {items.map((it) => {
        const chip = slots[it.id] ? chipById[slots[it.id]] : null;
        const ok = checked && chip && chip.group === it.answer;
        const bad = checked && chip && chip.group !== it.answer;
        const selected = activeSlot === it.id && !chip;
        return (
          <div key={it.id} style={{ marginBottom: 16 }}>
            <div>（{it.id}）</div>
            <SystemView item={it} />
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
            {ok ? <InequalitySystemNumberLine a={it.a} b={it.b} extraMarks={[0]} /> : null}
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
        {checked && allCorrect ? <span>两组都对了。</span> : null}
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
