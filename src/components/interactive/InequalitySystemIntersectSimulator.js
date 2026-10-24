import React, { useMemo, useRef, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';
import InequalitySystemNumberLine, {
  describeIntersection,
  describeHalf,
  intersectHalves,
} from '@site/src/components/interactive/shell/InequalitySystemNumberLine';

function bookRounds() {
  return [
    {
      id: 'sewage',
      a: { at: 40, dir: 'right', closed: false },
      b: { at: 50, dir: 'left', closed: false },
      extraMarks: [0],
    },
    {
      id: 'both-gt',
      a: { at: 2, dir: 'right', closed: false },
      b: { at: 3, dir: 'right', closed: false },
      extraMarks: [0],
    },
    {
      id: 'empty',
      a: { at: 8, dir: 'right', closed: true },
      b: { at: 0.8, dir: 'left', closed: false, label: '4/5' },
      extraMarks: [0],
    },
  ];
}

/** Weighted: mostly opposite rays that overlap in the middle; never empty. */
function randomRound() {
  const roll = randInt(1, 5);
  const p = randInt(-4, 2);
  const q = p + randInt(2, 6);
  if (roll <= 3) {
    return {
      id: 'rand',
      a: { at: p, dir: 'right', closed: randInt(0, 1) === 1 },
      b: { at: q, dir: 'left', closed: randInt(0, 1) === 1 },
      extraMarks: [0],
    };
  }
  if (roll === 4) {
    return {
      id: 'rand',
      a: { at: p, dir: 'right', closed: randInt(0, 1) === 1 },
      b: { at: q, dir: 'right', closed: randInt(0, 1) === 1 },
      extraMarks: [0],
    };
  }
  return {
    id: 'rand',
    a: { at: q, dir: 'left', closed: randInt(0, 1) === 1 },
    b: { at: p, dir: 'left', closed: randInt(0, 1) === 1 },
    extraMarks: [0],
  };
}

function answerOf(round) {
  return describeIntersection(intersectHalves(round.a, round.b));
}

function buildChips(round) {
  const correct = answerOf(round);
  const a = describeHalf(round.a);
  const b = describeHalf(round.b);
  const extras = [a, b, '无解', `x > ${round.a.at}`, `x < ${round.b.at}`];
  const seen = new Set([correct]);
  const chips = [{ id: 'ok', group: correct, label: correct }];
  extras.forEach((label, i) => {
    if (seen.has(label)) return;
    seen.add(label);
    chips.push({ id: `d-${i}`, group: label, label });
  });
  for (let i = chips.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chips[i], chips[j]] = [chips[j], chips[i]];
  }
  return chips;
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

export default function InequalitySystemIntersectSimulator() {
  const [key, setKey] = useState(0);
  const [index, setIndex] = useState(0);
  const [pool, setPool] = useState(bookRounds);
  const [chips, setChips] = useState(() => buildChips(bookRounds()[0]));
  const [slot, setSlot] = useState(null);
  const [checked, setChecked] = useState(false);

  const round = pool[index];
  const answer = useMemo(() => answerOf(round), [round]);
  const chipById = useMemo(() => Object.fromEntries(chips.map((c) => [c.id, c])), [chips]);
  const placed = slot ? chipById[slot] : null;
  const bank = chips.filter((c) => c.id !== slot);
  const ok = checked && placed && placed.group === answer;
  const bad = checked && placed && placed.group !== answer;

  function load(nextPool, nextIndex) {
    const item = nextPool[nextIndex];
    setPool(nextPool);
    setIndex(nextIndex);
    setChips(buildChips(item));
    setSlot(null);
    setChecked(false);
    setKey((k) => k + 1);
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="画" badgeClass={stepStyles.badgeSet}>
        灰色是两个不等式各自的解集，粉色是重叠的一段。
      </SolutionStep>
      <SolutionStep badge="集" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          {describeHalf(round.a)} 与 {describeHalf(round.b)} 的公共部分是 {answer}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="看数轴找公共部分"
      subtitle="灰色两条是各自的解集，把粉色重叠部分对应的解集拖进去。随机题都有公共部分，多数是一左一右夹一段"
      problemKey={key}
      onRandomize={() => load([randomRound()], 0)}
      onBook={() => load(bookRounds(), 0)}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        {describeHalf(round.a)}，{describeHalf(round.b)}。公共部分是？
      </p>
      <InequalitySystemNumberLine a={round.a} b={round.b} extraMarks={round.extraMarks} />
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const chipId = event.dataTransfer.getData('text/plain');
          if (chipById[chipId]) {
            setSlot(chipId);
            setChecked(false);
          }
        }}
        style={{
          marginTop: 8,
          minHeight: 48,
          borderRadius: 10,
          border: `2px ${placed ? 'solid' : 'dashed'} ${
            ok ? '#2e7d32' : bad ? '#c62828' : 'var(--ifm-color-emphasis-400)'
          }`,
          background: ok ? 'rgba(46,125,50,0.12)' : bad ? 'rgba(198,40,40,0.1)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {placed ? (
          <ChipButton
            chip={placed}
            onClick={() => {
              setSlot(null);
              setChecked(false);
            }}
          />
        ) : (
          <span style={{ color: 'var(--ifm-color-emphasis-600)' }}>拖入公共部分</span>
        )}
      </div>
      {bad ? <div style={{ color: '#c62828', marginTop: 6 }}>看粉色那段停在哪，两端是空心还是实心。</div> : null}

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const chipId = event.dataTransfer.getData('text/plain');
          if (chipById[chipId] && slot === chipId) {
            setSlot(null);
            setChecked(false);
          }
        }}
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 10,
          background: 'var(--ifm-color-emphasis-100)',
          minHeight: 56,
        }}
      >
        <div style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)', marginBottom: 8 }}>可选</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {bank.map((chip) => (
            <ChipButton
              key={chip.id}
              chip={chip}
              onClick={() => {
                setSlot(chip.id);
                setChecked(false);
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" onClick={() => setChecked(true)} style={actionBtn}>
          检查
        </button>
        {pool.length > 1 && index > 0 ? (
          <button type="button" onClick={() => load(pool, index - 1)} style={actionBtn}>
            上一幅
          </button>
        ) : null}
        {pool.length > 1 && index < pool.length - 1 ? (
          <button type="button" onClick={() => load(pool, index + 1)} style={actionBtn}>
            下一幅
          </button>
        ) : null}
        {ok ? <span>对，公共部分是 {answer}。</span> : null}
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
