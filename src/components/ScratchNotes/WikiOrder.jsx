import React, {useMemo, useRef, useState} from 'react';
import MathText from '@site/src/components/ProblemSet/MathText';
import mc from '@site/src/components/MultipleChoice/styles.module.css';

function sameIntArrays(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }
  return a.every((v, i) => Number(v) === Number(b[i]));
}

function shuffleCopy(arr) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function correctOrder(spec) {
  const items = spec.items || [];
  if (Array.isArray(spec.order) && spec.order.length) {
    return spec.order.map(Number);
  }
  return items.map((_, i) => i);
}

function initialIds(spec) {
  const n = (spec.items || []).length;
  const ids = Array.from({length: n}, (_, i) => i);
  const correct = correctOrder(spec);
  let shuffled = shuffleCopy(ids);
  let guard = 0;
  while (n > 1 && sameIntArrays(shuffled, correct) && guard < 8) {
    shuffled = shuffleCopy(ids);
    guard += 1;
  }
  return shuffled;
}

export default function WikiOrder({spec, onPass}) {
  const items = spec.items || [];
  const correct = useMemo(() => correctOrder(spec), [spec]);
  const [ids, setIds] = useState(() => initialIds(spec));
  const [status, setStatus] = useState('idle');
  const dragIndex = useRef(null);
  const [over, setOver] = useState(null);

  function move(from, to) {
    if (from === to || from == null || to == null || status !== 'idle') {
      return;
    }
    setIds((prev) => {
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  }

  function check() {
    if (status !== 'idle') {
      return;
    }
    const ok = sameIntArrays(ids, correct);
    setStatus(ok ? 'right' : 'wrong');
    if (ok) {
      onPass?.();
    }
  }

  function retry() {
    setIds(initialIds(spec));
    setStatus('idle');
  }

  return (
    <div className={mc.body}>
      {spec.prompt ? (
        <p className={mc.prompt}>
          <MathText text={spec.prompt} />
        </p>
      ) : null}
      <p className={mc.modeHint}>
        <span className={mc.modeTag}>Order</span>
        Drag or use ↑↓ — top is first.
      </p>
      <ol className={mc.orderList} aria-label="Reorder these items">
        {ids.map((itemIndex, position) => {
          const label = items[itemIndex];
          const isCorrectSlot = status === 'right' && correct[position] === itemIndex;
          const isWrongSlot = status === 'wrong' && correct[position] !== itemIndex;
          return (
            <li
              key={`${itemIndex}-${position}`}
              className={[
                mc.orderItem,
                over === position ? mc.orderOver : '',
                isCorrectSlot ? mc.right : '',
                isWrongSlot ? mc.wrong : '',
                status !== 'idle' ? mc.orderLocked : '',
              ]
                .filter(Boolean)
                .join(' ')}
              draggable={status === 'idle'}
              onDragStart={(e) => {
                dragIndex.current = position;
                e.dataTransfer.effectAllowed = 'move';
                try {
                  e.dataTransfer.setData('text/plain', String(position));
                } catch {
                  /* ignore */
                }
              }}
              onDragEnd={() => {
                dragIndex.current = null;
                setOver(null);
              }}
              onDragOver={(e) => {
                if (status !== 'idle') {
                  return;
                }
                e.preventDefault();
                setOver(position);
              }}
              onDragLeave={() => {
                setOver((cur) => (cur === position ? null : cur));
              }}
              onDrop={(e) => {
                e.preventDefault();
                const from = dragIndex.current;
                dragIndex.current = null;
                setOver(null);
                if (from == null) {
                  return;
                }
                move(from, position);
              }}
            >
              <span className={mc.dragHandle} aria-hidden="true">
                ⋮⋮
              </span>
              <span className={mc.orderRank}>{position + 1}</span>
              <span className={mc.orderLabel}>
                <MathText text={label} />
              </span>
              {status === 'idle' ? (
                <span className={mc.orderMove}>
                  <button
                    type="button"
                    className={mc.iconBtn}
                    aria-label={`Move item ${position + 1} up`}
                    disabled={position === 0}
                    onClick={() => move(position, position - 1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={mc.iconBtn}
                    aria-label={`Move item ${position + 1} down`}
                    disabled={position === ids.length - 1}
                    onClick={() => move(position, position + 1)}
                  >
                    ↓
                  </button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {status === 'idle' ? (
        <div className={mc.actions}>
          <button type="button" className={mc.primary} onClick={check}>
            Check
          </button>
        </div>
      ) : (
        <div className={mc.actions}>
          {status === 'right' ? (
            <p className={mc.whyOk}>{spec.why || 'Correct order.'}</p>
          ) : (
            <p className={mc.why}>{spec.why || 'Not quite — try again.'}</p>
          )}
          <button type="button" className={mc.secondary} onClick={retry}>
            {status === 'right' ? 'Try again' : 'Retry'}
          </button>
        </div>
      )}
    </div>
  );
}
