import React, {useCallback, useEffect, useState} from 'react';
import TranslatableParagraph from '@site/src/components/Translate/TranslatableParagraph';
import styles from './styles.module.css';
import {COMPUTE_BANKS, drawFromBank} from './probComputeBanks';

function storageKey(id) {
  return `numeric-quiz:${id}`;
}

/** Round to at most `decimals` places (default 2). */
export function roundAtMost(n, decimals = 2) {
  if (!Number.isFinite(n)) return NaN;
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function parseNumber(raw) {
  const t = String(raw).trim().replace(/,/g, '');
  if (!t) return NaN;
  return Number(t);
}

function resolveQuestion(raw) {
  if (!raw) return null;
  if (typeof raw.generate === 'function') {
    return {...raw.generate(), decimals: raw.decimals};
  }
  return raw;
}

/**
 * Numeric “apply the formula” quiz with optional randomized story banks.
 *
 * Props:
 * - questions: static [{prompt, answer, why}] and/or {generate()}
 * - bank: key into COMPUTE_BANKS (contextual random stories)
 * - rounds: how many problems before finish when using bank (default 3)
 */
export default function NumericQuiz({
  id,
  title = 'Apply the formula',
  questions = [],
  bank = null,
  rounds = 3,
  decimals = 2,
}) {
  const useBank = Boolean(bank && COMPUTE_BANKS[bank]);
  const total = useBank ? rounds : questions.length;

  const makeItem = useCallback(() => {
    if (useBank) return drawFromBank(bank);
    return null;
  }, [useBank, bank]);

  const [state, setState] = useState(() => ({
    step: 0,
    draft: '',
    status: 'idle',
    firstTryCorrect: 0,
    missedOnce: {},
    done: false,
    item: useBank ? makeItem() : resolveQuestion(questions[0]),
  }));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(id));
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof parsed.step === 'number') {
        const step = parsed.done ? 0 : parsed.step;
        setState((s) => ({
          ...s,
          ...parsed,
          draft: '',
          status: 'idle',
          done: Boolean(parsed.done),
          item: useBank
            ? drawFromBank(bank)
            : resolveQuestion(questions[Math.min(step, questions.length - 1)]),
        }));
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function persist(next) {
    setState(next);
    try {
      const {draft, item, ...rest} = next;
      window.localStorage.setItem(storageKey(id), JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }

  const q = state.item;
  const places = q?.decimals ?? decimals;

  function reshuffle() {
    const item = useBank
      ? drawFromBank(bank)
      : resolveQuestion(questions[state.step] || questions[0]);
    persist({
      ...state,
      draft: '',
      status: 'idle',
      item,
      missedOnce: {...state.missedOnce, [state.step]: false},
    });
  }

  function check() {
    if (!q || state.status !== 'idle' || state.done) return;
    const got = parseNumber(state.draft);
    if (!Number.isFinite(got)) {
      persist({...state, status: 'invalid'});
      return;
    }
    const expected = roundAtMost(Number(q.answer), places);
    const actual = roundAtMost(got, places);
    const correct = actual === expected;
    const alreadyMissed = Boolean(state.missedOnce[state.step]);
    persist({
      ...state,
      status: correct ? 'right' : 'wrong',
      missedOnce: correct
        ? state.missedOnce
        : {...state.missedOnce, [state.step]: true},
      firstTryCorrect:
        correct && !alreadyMissed ? state.firstTryCorrect + 1 : state.firstTryCorrect,
    });
  }

  function retry() {
    persist({...state, draft: '', status: 'idle'});
  }

  function next() {
    const last = state.step >= total - 1;
    if (last) {
      persist({...state, draft: '', status: 'idle', done: true});
      return;
    }
    const nextStep = state.step + 1;
    const item = useBank
      ? drawFromBank(bank)
      : resolveQuestion(questions[nextStep]);
    persist({
      ...state,
      step: nextStep,
      draft: '',
      status: 'idle',
      item,
    });
  }

  function restart() {
    persist({
      step: 0,
      draft: '',
      status: 'idle',
      firstTryCorrect: 0,
      missedOnce: {},
      done: false,
      item: useBank ? drawFromBank(bank) : resolveQuestion(questions[0]),
    });
  }

  if (!q && !state.done) return null;

  if (state.done) {
    return (
      <section className={styles.quiz} aria-label={title}>
        <header className={styles.header}>
          <span className={styles.badge}>Compute</span>
          <h3 className={styles.title}>{title}</h3>
        </header>
        <div className={styles.finish}>
          <p className={styles.scorePass}>
            {state.firstTryCorrect} / {total} correct on the first try
          </p>
          <button type="button" className={styles.primary} onClick={restart}>
            Start over
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.quiz} aria-label={title}>
      <header className={styles.header}>
        <span className={styles.badge}>Compute</span>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.progress}>
          {state.step + 1} / {total}
        </span>
      </header>
      <div className={styles.body}>
        <p className={styles.meta}>
          Story problem — figure out which numbers are the formula inputs, then compute.
        </p>
        <TranslatableParagraph className={styles.prompt}>{q.prompt}</TranslatableParagraph>
        <p className={styles.hint}>
          Enter a number (at most {places} decimal place{places === 1 ? '' : 's'}).
          {q.unit ? ` Unit: ${q.unit}.` : ''}
        </p>
        <div className={styles.row}>
          <input
            className={styles.input}
            type="text"
            inputMode="decimal"
            value={state.draft}
            disabled={state.status === 'right'}
            placeholder={places === 0 ? 'e.g. 12' : 'e.g. 0.25'}
            aria-label="Numeric answer"
            onChange={(e) => persist({...state, draft: e.target.value, status: 'idle'})}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && state.status === 'idle') check();
            }}
          />
          {state.status === 'idle' || state.status === 'invalid' || state.status === 'wrong' ? (
            <button type="button" className={styles.primary} onClick={check}>
              Check
            </button>
          ) : null}
        </div>
        {state.status === 'invalid' ? (
          <TranslatableParagraph className={styles.why}>
            Enter a valid number.
          </TranslatableParagraph>
        ) : null}
        {state.status === 'wrong' ? (
          <TranslatableParagraph className={styles.why}>
            Not quite — map the story to the formula and try again.
          </TranslatableParagraph>
        ) : null}
        {state.status === 'right' ? (
          <TranslatableParagraph className={styles.whyOk}>
            {`Correct (${roundAtMost(Number(q.answer), places)}${q.unit ? ` ${q.unit}` : ''}).${
              q.why ? ` ${q.why}` : ''
            }`}
          </TranslatableParagraph>
        ) : null}
      </div>
      <div className={styles.actions}>
        {state.status !== 'right' ? (
          <button type="button" className={styles.secondary} onClick={reshuffle}>
            New story
          </button>
        ) : null}
        {state.status === 'wrong' || state.status === 'invalid' ? (
          <button type="button" className={styles.secondary} onClick={retry}>
            Try again
          </button>
        ) : null}
        {state.status === 'right' ? (
          <button type="button" className={styles.primary} onClick={next}>
            {state.step >= total - 1 ? 'Finish' : 'Next problem'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
