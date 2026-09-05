import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Highlight, themes} from 'prism-react-renderer';
import useHtmlColorMode from '@site/src/components/codeWorkspace/useHtmlColorMode';
import styles from './styles.module.css';

function storageKey(id) {
  return `multiple-choice:${id}`;
}

function letters(index) {
  return String.fromCharCode(65 + index);
}

function looksLikeCode(line) {
  const t = (line || '').trim();
  return /^(def |class |for |if |while |elif |else:|print\(|import |from |#include|using |int |void |std::|public |private |return )/.test(
    t
  );
}

function guessLang(code) {
  if (/#include|std::|int main\s*\(/.test(code)) {
    return 'cpp';
  }
  if (/^\s*(def |class |import |print\()/.test(code) || /:\n/.test(code)) {
    return 'python';
  }
  if (/function |const |let |=>/.test(code)) {
    return 'javascript';
  }
  return 'text';
}

function parsePrompt(q) {
  const raw = q?.prompt || '';
  if (q?.code) {
    return {
      lead: raw,
      code: String(q.code).replace(/^\n/, '').replace(/\n$/, ''),
      lang: q.codeLang || q.lang || guessLang(q.code),
    };
  }
  const fence = raw.match(/^([\s\S]*?)```(\w*)\n([\s\S]*?)\n```\s*$/);
  if (fence) {
    return {
      lead: fence[1].trim(),
      code: fence[3],
      lang: fence[2] || guessLang(fence[3]),
    };
  }
  const blankSplit = raw.split(/\n\n/);
  if (blankSplit.length >= 2 && looksLikeCode(blankSplit[1].split('\n')[0])) {
    const code = blankSplit.slice(1).join('\n\n');
    return {
      lead: blankSplit[0].trim(),
      code,
      lang: q.codeLang || q.lang || guessLang(code),
    };
  }
  const lines = raw.split('\n');
  const idx = lines.findIndex((line, i) => i > 0 && looksLikeCode(line));
  if (idx > 0) {
    const code = lines.slice(idx).join('\n');
    return {
      lead: lines.slice(0, idx).join('\n').trim(),
      code,
      lang: q.codeLang || q.lang || guessLang(code),
    };
  }
  return {lead: raw, code: null, lang: 'text'};
}

function Prompt({q}) {
  const {lead, code, lang} = parsePrompt(q);
  const colorMode = useHtmlColorMode();
  const prismLang = lang === 'c++' || lang === 'cpp' ? 'cpp' : lang || 'text';
  return (
    <div className={styles.promptBlock}>
      {lead ? <p className={styles.prompt}>{lead}</p> : null}
      {code ? (
        <div className={styles.snippet}>
          <Highlight
            theme={colorMode === 'dark' ? themes.vsDark : themes.github}
            code={code}
            language={prismLang}
          >
            {({className, style, tokens, getLineProps, getTokenProps}) => (
              <pre className={[className, styles.code].filter(Boolean).join(' ')} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({line})}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({token})} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      ) : null}
    </div>
  );
}

/** @returns {'single' | 'multi' | 'order'} */
export function questionKind(q) {
  if (!q) {
    return 'single';
  }
  if (q.type === 'order') {
    return 'order';
  }
  if (Array.isArray(q.items) && q.items.length && !Array.isArray(q.choices)) {
    return 'order';
  }
  if (
    q.type === 'multi' ||
    q.multi === true ||
    Array.isArray(q.answers) ||
    Array.isArray(q.answer)
  ) {
    return 'multi';
  }
  return 'single';
}

function correctMulti(q) {
  const raw = Array.isArray(q.answers) ? q.answers : q.answer;
  return [...(Array.isArray(raw) ? raw : [])].map(Number).sort((a, b) => a - b);
}

/** Correct sequence as indices into q.items */
function correctOrder(q) {
  const items = q.items || [];
  if (Array.isArray(q.order) && q.order.length) {
    return q.order.map(Number);
  }
  if (Array.isArray(q.correctOrder) && q.correctOrder.length) {
    return q.correctOrder.map((label) => {
      const i = items.indexOf(label);
      return i;
    });
  }
  // items listed top→bottom in the right order
  return items.map((_, i) => i);
}

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

function initialOrderIds(q) {
  const n = (q.items || []).length;
  const ids = Array.from({length: n}, (_, i) => i);
  const correct = correctOrder(q);
  let shuffled = shuffleCopy(ids);
  // Avoid starting already solved (unless only 1 item)
  let guard = 0;
  while (n > 1 && sameIntArrays(shuffled, correct) && guard < 8) {
    shuffled = shuffleCopy(ids);
    guard += 1;
  }
  return shuffled;
}

function arraysEqualAsSets(a, b) {
  return sameIntArrays(
    [...a].map(Number).sort((x, y) => x - y),
    [...b].map(Number).sort((x, y) => x - y),
  );
}

function ChoiceLabel({choice}) {
  if (String(choice).includes('\n')) {
    return <pre className={styles.choiceCode}>{choice}</pre>;
  }
  return <span>{choice}</span>;
}

function OrderList({items, ids, onChange, disabled, status, correctIds}) {
  const dragIndex = useRef(null);
  const [over, setOver] = useState(null);

  function move(from, to) {
    if (from === to || from == null || to == null) {
      return;
    }
    const next = [...ids];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    onChange(next);
  }

  return (
    <ol className={styles.orderList} aria-label="Reorder these items">
      {ids.map((itemIndex, position) => {
        const label = items[itemIndex];
        const isCorrectSlot =
          status === 'right' && correctIds && correctIds[position] === itemIndex;
        const isWrongSlot =
          status === 'wrong' && correctIds && correctIds[position] !== itemIndex;
        return (
          <li
            key={`${itemIndex}-${position}`}
            className={[
              styles.orderItem,
              over === position ? styles.orderOver : '',
              isCorrectSlot ? styles.right : '',
              isWrongSlot ? styles.wrong : '',
              disabled ? styles.orderLocked : '',
            ]
              .filter(Boolean)
              .join(' ')}
            draggable={!disabled}
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
              if (disabled) {
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
            <span className={styles.dragHandle} title="Drag to reorder" aria-hidden="true">
              ⋮⋮
            </span>
            <span className={styles.orderRank}>{position + 1}</span>
            <span className={styles.orderLabel}>
              <ChoiceLabel choice={label} />
            </span>
            {!disabled ? (
              <span className={styles.orderMove}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={`Move item ${position + 1} up`}
                  disabled={position === 0}
                  onClick={() => move(position, position - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
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
  );
}

const emptyState = {
  step: 0,
  pick: null,
  orderIds: null,
  status: 'idle',
  missed: {},
  firstTryCorrect: 0,
  done: false,
};

export default function MultipleChoice({
  id,
  title = 'Check your understanding',
  questions = [],
}) {
  const [state, setState] = useState(emptyState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(id));
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.step === 'number') {
        setState({...emptyState, ...parsed});
      }
    } catch {
      /* ignore */
    }
  }, [id]);

  function persist(nextOrFn) {
    setState((prev) => {
      const next = typeof nextOrFn === 'function' ? nextOrFn(prev) : nextOrFn;
      try {
        window.localStorage.setItem(storageKey(id), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const total = questions.length;
  const q = questions[state.step] || questions[0];
  const kind = questionKind(q);
  const qMissed = state.missed[state.step] || [];

  // Ensure order questions have a permutation when entering the step
  useEffect(() => {
    if (!q || questionKind(q) !== 'order') {
      return;
    }
    const n = (q.items || []).length;
    setState((prev) => {
      if (prev.step !== state.step) {
        return prev;
      }
      const valid =
        Array.isArray(prev.orderIds) &&
        prev.orderIds.length === n &&
        new Set(prev.orderIds).size === n;
      if (valid || prev.status !== 'idle') {
        return prev;
      }
      const next = {...prev, orderIds: initialOrderIds(q), pick: null};
      try {
        window.localStorage.setItem(storageKey(id), JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed once per step
  }, [state.step, id]);

  const multiPick = useMemo(() => {
    if (kind !== 'multi') {
      return [];
    }
    return Array.isArray(state.pick) ? state.pick : [];
  }, [kind, state.pick]);

  function answerSingle(choiceIndex) {
    if (!q || state.status !== 'idle' || state.done) {
      return;
    }
    const correct = choiceIndex === q.answer;
    persist((prev) => {
      const missedList = prev.missed[prev.step] || [];
      const missed = correct
        ? prev.missed
        : {
            ...prev.missed,
            [prev.step]: [...missedList, choiceIndex],
          };
      return {
        ...prev,
        pick: choiceIndex,
        status: correct ? 'right' : 'wrong',
        missed,
        firstTryCorrect:
          correct && missedList.length === 0
            ? prev.firstTryCorrect + 1
            : prev.firstTryCorrect,
      };
    });
  }

  function toggleMulti(choiceIndex) {
    if (!q || state.status !== 'idle' || state.done) {
      return;
    }
    persist((prev) => {
      const current = Array.isArray(prev.pick) ? prev.pick : [];
      const set = new Set(current);
      if (set.has(choiceIndex)) {
        set.delete(choiceIndex);
      } else {
        set.add(choiceIndex);
      }
      return {
        ...prev,
        pick: [...set].sort((a, b) => a - b),
        status: 'idle',
      };
    });
  }

  function checkMulti() {
    if (!q || state.status !== 'idle' || state.done) {
      return;
    }
    const want = correctMulti(q);
    const got = multiPick;
    const correct = arraysEqualAsSets(got, want);
    persist((prev) => {
      const missedList = prev.missed[prev.step] || [];
      const missed = correct
        ? prev.missed
        : {
            ...prev.missed,
            [prev.step]: [...missedList, got.join(',') || 'empty'],
          };
      return {
        ...prev,
        status: correct ? 'right' : 'wrong',
        missed,
        firstTryCorrect:
          correct && missedList.length === 0
            ? prev.firstTryCorrect + 1
            : prev.firstTryCorrect,
      };
    });
  }

  function checkOrder() {
    if (!q || state.status !== 'idle' || state.done) {
      return;
    }
    const want = correctOrder(q);
    persist((prev) => {
      const got = prev.orderIds || [];
      const correct = sameIntArrays(got, want);
      const missedList = prev.missed[prev.step] || [];
      const missed = correct
        ? prev.missed
        : {
            ...prev.missed,
            [prev.step]: [...missedList, got.join('>') || 'empty'],
          };
      return {
        ...prev,
        status: correct ? 'right' : 'wrong',
        missed,
        firstTryCorrect:
          correct && missedList.length === 0
            ? prev.firstTryCorrect + 1
            : prev.firstTryCorrect,
      };
    });
  }

  function retry() {
    persist((prev) => ({
      ...prev,
      status: 'idle',
      ...(kind === 'single' ? {pick: null} : {}),
    }));
  }

  function next() {
    persist((prev) => {
      const last = prev.step >= total - 1;
      const nextStep = last ? prev.step : prev.step + 1;
      const nextQ = questions[nextStep];
      const nextKind = questionKind(nextQ);
      return {
        ...prev,
        step: nextStep,
        pick: nextKind === 'multi' ? [] : null,
        orderIds: nextKind === 'order' ? initialOrderIds(nextQ) : null,
        status: 'idle',
        done: last,
      };
    });
  }

  function restart() {
    persist({...emptyState});
  }

  if (!q) {
    return null;
  }

  if (state.done) {
    return (
      <section className={styles.quiz} aria-label={title}>
        <header className={styles.header}>
          <span className={styles.badge}>Quiz</span>
          <h3 className={styles.title}>{title}</h3>
        </header>
        <div className={styles.finish}>
          <p className={styles.scorePass}>
            {state.firstTryCorrect} / {total} correct on the first try
          </p>
          <p className={styles.finishNote}>
            You can work through the questions again whenever you like.
          </p>
          <button type="button" className={styles.primary} onClick={restart}>
            Start over
          </button>
        </div>
      </section>
    );
  }

  const typeHint =
    kind === 'order'
      ? 'Drag items into the correct order (or use ↑↓), then check.'
      : kind === 'multi'
        ? 'Select all that apply, then check.'
        : 'Pick an answer to see if you are right.';

  return (
    <section className={styles.quiz} aria-label={title}>
      <header className={styles.header}>
        <span className={styles.badge}>Quiz</span>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.progress}>
          {state.step + 1} / {total}
        </span>
      </header>
      <div className={styles.body}>
        <Prompt q={q} />
        {kind === 'order' ? (
          <p className={styles.modeHint}>
            <span className={styles.modeTag}>Order</span>
            Drag the handle to rearrange — top should be first.
          </p>
        ) : null}
        {kind === 'multi' ? (
          <p className={styles.modeHint}>
            <span className={styles.modeTag}>Multi-select</span>
            Choose every correct option.
          </p>
        ) : null}

        {kind === 'single' ? (
          <div className={styles.choices} role="radiogroup" aria-label={parsePrompt(q).lead || title}>
            {(q.choices || []).map((choice, cIndex) => {
              const chosen = state.pick === cIndex;
              const alreadyWrong = qMissed.includes(cIndex);
              let stateClass = '';
              if (state.status === 'right' && cIndex === q.answer) {
                stateClass = styles.right;
              } else if (chosen && state.status === 'wrong') {
                stateClass = styles.wrong;
              } else if (alreadyWrong) {
                stateClass = styles.used;
              }
              return (
                <button
                  key={cIndex}
                  type="button"
                  className={`${styles.choice} ${chosen ? styles.selected : ''} ${stateClass}`}
                  disabled={state.status !== 'idle' || alreadyWrong}
                  onClick={() => answerSingle(cIndex)}
                >
                  <span className={styles.letter}>{letters(cIndex)}</span>
                  <ChoiceLabel choice={choice} />
                </button>
              );
            })}
          </div>
        ) : null}

        {kind === 'multi' ? (
          <div className={styles.choices} role="group" aria-label={parsePrompt(q).lead || title}>
            {(q.choices || []).map((choice, cIndex) => {
              const chosen = multiPick.includes(cIndex);
              const want = correctMulti(q);
              let stateClass = '';
              if (state.status === 'right' && want.includes(cIndex)) {
                stateClass = styles.right;
              } else if (state.status === 'wrong' && chosen && !want.includes(cIndex)) {
                stateClass = styles.wrong;
              } else if (state.status === 'wrong' && !chosen && want.includes(cIndex)) {
                stateClass = styles.missedNeeded;
              } else if (chosen) {
                stateClass = styles.selected;
              }
              return (
                <button
                  key={cIndex}
                  type="button"
                  className={`${styles.choice} ${styles.multiChoice} ${stateClass}`}
                  disabled={state.status !== 'idle'}
                  aria-pressed={chosen}
                  onClick={() => toggleMulti(cIndex)}
                >
                  <span className={styles.checkBox} aria-hidden="true">
                    {chosen ? '☑' : '☐'}
                  </span>
                  <span className={styles.letter}>{letters(cIndex)}</span>
                  <ChoiceLabel choice={choice} />
                </button>
              );
            })}
          </div>
        ) : null}

        {kind === 'order' ? (
          <OrderList
            items={q.items || []}
            ids={state.orderIds || initialOrderIds(q)}
            disabled={state.status !== 'idle'}
            status={state.status}
            correctIds={correctOrder(q)}
            onChange={(nextIds) => persist((prev) => ({...prev, orderIds: nextIds}))}
          />
        ) : null}

        {state.status === 'right' ? (
          <p className={styles.whyOk}>Correct.{q.why ? ` ${q.why}` : ''}</p>
        ) : null}
        {state.status === 'wrong' ? (
          <p className={styles.why}>
            {kind === 'multi'
              ? 'Not quite — adjust your selections and try again.'
              : kind === 'order'
                ? 'Not quite — reorder and try again.'
                : 'Not quite. Try a different option.'}
          </p>
        ) : null}
      </div>
      <div className={styles.actions}>
        {state.status === 'idle' ? (
          <>
            <p className={styles.hint}>{typeHint}</p>
            {kind === 'multi' || kind === 'order' ? (
              <button
                type="button"
                className={styles.primary}
                disabled={kind === 'multi' && multiPick.length === 0}
                onClick={kind === 'multi' ? checkMulti : checkOrder}
              >
                Check
              </button>
            ) : null}
          </>
        ) : null}
        {state.status === 'wrong' ? (
          <button type="button" className={styles.secondary} onClick={retry}>
            Try again
          </button>
        ) : null}
        {state.status === 'right' ? (
          <button type="button" className={styles.primary} onClick={next}>
            {state.step >= total - 1 ? 'Finish' : 'Next question'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
