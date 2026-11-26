import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Highlight, themes} from 'prism-react-renderer';
import useHtmlColorMode from '@site/src/components/codeWorkspace/useHtmlColorMode';
import TranslatableParagraph from '@site/src/components/Translate/TranslatableParagraph';
import {revealSegment} from '@site/src/data/lessonFlags/store';
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
  const prismLang =
    lang === 'c++' || lang === 'cpp'
      ? 'cpp'
      : lang === 'godot' || lang === 'gdscript' || lang === 'gd'
        ? 'python'
        : lang || 'text';
  return (
    <div className={styles.promptBlock}>
      {lead ? (
        <TranslatableParagraph className={styles.prompt}>{lead}</TranslatableParagraph>
      ) : null}
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

/** Stable permutation so choice letter A/B/C isn't a content-order tell. */
function seededPerm(n, seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const arr = Array.from({length: n}, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    const j = (h >>> 0) % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
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

const emptyEssay = {
  step: 0,
  drafts: {},
  phase: 'write', // write | compare | done
  verdicts: {},
};

const emptyState = {
  step: 0,
  pick: null,
  orderIds: null,
  status: 'idle',
  missed: {},
  firstTryCorrect: 0,
  done: false,
  mode: 'choice', // choice | essay
  essay: emptyEssay,
};

/** Plain-language reference for essay compare (correct choice / order / multi). */
function referenceAnswer(q) {
  if (!q) {
    return '';
  }
  const kind = questionKind(q);
  if (kind === 'multi') {
    return correctMulti(q)
      .map((i) => (q.choices || [])[i])
      .filter(Boolean)
      .join('; ');
  }
  if (kind === 'order') {
    return correctOrder(q)
      .map((i) => (q.items || [])[i])
      .filter(Boolean)
      .join(' → ');
  }
  const choice = (q.choices || [])[q.answer];
  return choice != null ? String(choice) : '';
}

/** Soft hint only — student still self-approves / rejects. */
function overlapHint(draft, reference, why) {
  const stop = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'to',
    'of',
    'in',
    'on',
    'for',
    'is',
    'are',
    'be',
    'as',
    'by',
    'it',
    'that',
    'this',
    'with',
    'from',
    'not',
    'can',
    'if',
  ]);
  const tokenize = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w));
  const draftToks = new Set(tokenize(draft));
  if (draftToks.size < 3) {
    return {level: 'thin', label: 'Very short — expand before you judge it.'};
  }
  const refToks = tokenize(`${reference} ${why || ''}`);
  if (!refToks.length) {
    return {level: 'ok', label: 'Compare with the reference, then decide.'};
  }
  let hit = 0;
  for (const w of refToks) {
    if (draftToks.has(w)) {
      hit += 1;
    }
  }
  const ratio = hit / refToks.length;
  if (ratio >= 0.28) {
    return {level: 'ok', label: 'Shares several ideas with the reference — still check carefully.'};
  }
  if (ratio >= 0.12) {
    return {level: 'mid', label: 'Some overlap — make sure the key mechanism is there.'};
  }
  return {level: 'low', label: 'Quite different from the reference — read both sides.'};
}

export default function MultipleChoice({
  id,
  title = 'Check your understanding',
  questions = [],
  flagSegment,
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

  const choiceOrder = useMemo(() => {
    const n = (q?.choices || []).length;
    if (!n) {
      return [];
    }
    return seededPerm(n, `${id}|${state.step}|${q?.prompt || ''}`);
  }, [id, state.step, q]);

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
    // Finishing the last question reveals this quiz's flag piece (toast only).
    if (flagSegment && state.step >= total - 1) {
      revealSegment(id, flagSegment);
    }
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

  function enterEssayMode() {
    persist((prev) => ({
      ...prev,
      mode: 'essay',
      essay: {
        ...emptyEssay,
        drafts: prev.essay?.drafts && typeof prev.essay.drafts === 'object' ? prev.essay.drafts : {},
        verdicts:
          prev.essay?.verdicts && typeof prev.essay.verdicts === 'object' ? prev.essay.verdicts : {},
      },
    }));
  }

  function leaveEssayMode() {
    persist((prev) => ({
      ...prev,
      mode: 'choice',
      essay: prev.essay || emptyEssay,
    }));
  }

  function setEssayDraft(text) {
    persist((prev) => {
      const essay = {...(prev.essay || emptyEssay)};
      const step = essay.step || 0;
      return {
        ...prev,
        essay: {
          ...essay,
          drafts: {...(essay.drafts || {}), [step]: text},
          phase: 'write',
        },
      };
    });
  }

  function submitEssayCompare() {
    persist((prev) => {
      const essay = {...(prev.essay || emptyEssay)};
      const draft = String((essay.drafts || {})[essay.step || 0] || '').trim();
      if (!draft) {
        return prev;
      }
      return {...prev, essay: {...essay, phase: 'compare'}};
    });
  }

  function verdictEssay(verdict) {
    persist((prev) => {
      const essay = {...(prev.essay || emptyEssay)};
      const step = essay.step || 0;
      const verdicts = {...(essay.verdicts || {}), [step]: verdict};
      const last = step >= total - 1;
      if (last) {
        if (flagSegment) {
          revealSegment(id, flagSegment);
        }
        return {
          ...prev,
          essay: {...essay, verdicts, phase: 'done'},
        };
      }
      return {
        ...prev,
        essay: {
          ...essay,
          verdicts,
          step: step + 1,
          phase: 'write',
        },
      };
    });
  }

  function restartEssay() {
    persist((prev) => ({
      ...prev,
      mode: 'essay',
      essay: {...emptyEssay},
    }));
  }

  if (!q) {
    return null;
  }

  const essay = state.essay || emptyEssay;
  const essayStep = Math.min(essay.step || 0, Math.max(total - 1, 0));
  const essayQ = questions[essayStep] || questions[0];
  const essayDraft = String((essay.drafts || {})[essayStep] || '');
  const essayApproved = Object.values(essay.verdicts || {}).filter((v) => v === 'approve').length;

  if (state.mode === 'essay') {
    if (essay.phase === 'done') {
      return (
        <section className={styles.quiz} aria-label={title}>
          <header className={styles.header}>
            <span className={styles.badge}>Essay</span>
            <h3 className={styles.title}>{title}</h3>
          </header>
          <div className={styles.finish}>
            <p className={styles.scorePass}>
              {essayApproved} / {total} self-approved
            </p>
            <p className={styles.finishNote}>
              You compared each answer to the reference and judged it yourself.
            </p>
            <div className={styles.finishActions}>
              <button type="button" className={styles.primary} onClick={restartEssay}>
                Essay again
              </button>
              <button type="button" className={styles.secondary} onClick={leaveEssayMode}>
                Quiz mode
              </button>
              <button type="button" className={styles.secondary} onClick={restart}>
                Start over
              </button>
            </div>
          </div>
        </section>
      );
    }

    const refText = referenceAnswer(essayQ);
    const hint =
      essay.phase === 'compare' ? overlapHint(essayDraft, refText, essayQ?.why) : null;

    return (
      <section className={styles.quiz} aria-label={title}>
        <header className={styles.header}>
          <span className={styles.badge}>Essay</span>
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.progress}>
            {essayStep + 1} / {total}
          </span>
        </header>
        <div className={styles.body}>
          <Prompt q={essayQ} />
          {essay.phase === 'write' ? (
            <>
              <label className={styles.essayLabel} htmlFor={`essay-${id}-${essayStep}`}>
                Write your answer in your own words
              </label>
              <textarea
                id={`essay-${id}-${essayStep}`}
                className={styles.essayArea}
                value={essayDraft}
                onChange={(e) => setEssayDraft(e.target.value)}
                rows={6}
                placeholder="Explain the idea — no multiple-choice options here."
                spellCheck
              />
            </>
          ) : (
            <div className={styles.essayCompare}>
              <div className={styles.essayPane}>
                <h4 className={styles.essayPaneTitle}>Your answer</h4>
                <p className={styles.essayPaneBody}>{essayDraft}</p>
              </div>
              <div className={styles.essayPane}>
                <h4 className={styles.essayPaneTitle}>Reference</h4>
                <p className={styles.essayPaneBody}>{refText}</p>
                {essayQ?.why ? (
                  <p className={styles.essayWhy}>
                    <strong>Why: </strong>
                    {essayQ.why}
                  </p>
                ) : null}
              </div>
              {hint ? (
                <p
                  className={
                    hint.level === 'ok'
                      ? styles.essayHintOk
                      : hint.level === 'low'
                        ? styles.essayHintLow
                        : styles.essayHintMid
                  }
                >
                  {hint.label}
                </p>
              ) : null}
              <p className={styles.essaySelfNote}>
                Do your words capture the same idea? Approve or reject yourself.
              </p>
            </div>
          )}
        </div>
        <div className={styles.actions}>
          {essay.phase === 'write' ? (
            <>
              <button type="button" className={styles.secondary} onClick={leaveEssayMode}>
                Quiz mode
              </button>
              <button
                type="button"
                className={styles.primary}
                disabled={!essayDraft.trim()}
                onClick={submitEssayCompare}
              >
                Submit to compare
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  persist((prev) => ({
                    ...prev,
                    essay: {...(prev.essay || emptyEssay), phase: 'write'},
                  }))
                }
              >
                Edit
              </button>
              <button
                type="button"
                className={styles.rejectBtn}
                onClick={() => verdictEssay('reject')}
              >
                Reject
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={() => verdictEssay('approve')}
              >
                Approve
              </button>
            </>
          )}
        </div>
      </section>
    );
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
          <div className={styles.finishActions}>
            <button type="button" className={styles.primary} onClick={restart}>
              Start over
            </button>
            <button type="button" className={styles.secondary} onClick={enterEssayMode}>
              Essay mode
            </button>
            {flagSegment ? (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => revealSegment(id, flagSegment)}
              >
                Show flag piece
              </button>
            ) : null}
          </div>
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
            {choiceOrder.map((cIndex, displayIndex) => {
              const choice = (q.choices || [])[cIndex];
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
                  <span className={styles.letter}>{letters(displayIndex)}</span>
                  <ChoiceLabel choice={choice} />
                </button>
              );
            })}
          </div>
        ) : null}

        {kind === 'multi' ? (
          <div className={styles.choices} role="group" aria-label={parsePrompt(q).lead || title}>
            {choiceOrder.map((cIndex, displayIndex) => {
              const choice = (q.choices || [])[cIndex];
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
                  <span className={styles.letter}>{letters(displayIndex)}</span>
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
          <TranslatableParagraph className={styles.whyOk}>
            {`Correct.${q.why ? ` ${q.why}` : ''}`}
          </TranslatableParagraph>
        ) : null}
        {state.status === 'wrong' ? (
          <TranslatableParagraph className={styles.why}>
            {q.whyWrong ||
              (kind === 'multi'
                ? 'Not quite — adjust your selections and try again.'
                : kind === 'order'
                  ? 'Not quite — reorder and try again.'
                  : 'Not quite. Try a different option.')}
          </TranslatableParagraph>
        ) : null}
      </div>
      <div className={styles.actions}>
        {state.status === 'idle' ? (
          <>
            <p className={styles.hint}>{typeHint}</p>
            <button type="button" className={styles.secondary} onClick={enterEssayMode}>
              Essay mode
            </button>
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
          <>
            <button type="button" className={styles.secondary} onClick={enterEssayMode}>
              Essay mode
            </button>
            <button type="button" className={styles.secondary} onClick={retry}>
              Try again
            </button>
          </>
        ) : null}
        {state.status === 'right' ? (
          <>
            <button type="button" className={styles.secondary} onClick={enterEssayMode}>
              Essay mode
            </button>
            <button type="button" className={styles.primary} onClick={next}>
              {state.step >= total - 1 ? 'Finish' : 'Next question'}
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}
