import React, {useEffect, useState} from 'react';
import styles from './styles.module.css';

function storageKey(id) {
  return `multiple-choice:${id}`;
}

function letters(index) {
  return String.fromCharCode(65 + index);
}

const emptyState = {
  step: 0,
  pick: null,
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

  function persist(next) {
    setState(next);
    try {
      window.localStorage.setItem(storageKey(id), JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const total = questions.length;
  const q = questions[state.step] || questions[0];
  const qMissed = state.missed[state.step] || [];

  function answer(choiceIndex) {
    if (!q || state.status !== 'idle' || state.done) {
      return;
    }
    const correct = choiceIndex === q.answer;
    const missed = correct
      ? state.missed
      : {
          ...state.missed,
          [state.step]: [...qMissed, choiceIndex],
        };
    persist({
      ...state,
      pick: choiceIndex,
      status: correct ? 'right' : 'wrong',
      missed,
      firstTryCorrect:
        correct && qMissed.length === 0
          ? state.firstTryCorrect + 1
          : state.firstTryCorrect,
    });
  }

  function retry() {
    persist({
      ...state,
      pick: null,
      status: 'idle',
    });
  }

  function next() {
    const last = state.step >= total - 1;
    persist({
      ...state,
      step: last ? state.step : state.step + 1,
      pick: null,
      status: 'idle',
      done: last,
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
        <p className={styles.prompt}>{q.prompt}</p>
        <div className={styles.choices} role="radiogroup" aria-label={q.prompt}>
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
                onClick={() => answer(cIndex)}>
                <span className={styles.letter}>{letters(cIndex)}</span>
                <span>{choice}</span>
              </button>
            );
          })}
        </div>
        {state.status === 'right' ? (
          <p className={styles.whyOk}>
            Correct.{q.why ? ` ${q.why}` : ''}
          </p>
        ) : null}
        {state.status === 'wrong' ? (
          <p className={styles.why}>Not quite. Try a different option.</p>
        ) : null}
      </div>
      <div className={styles.actions}>
        {state.status === 'idle' ? (
          <p className={styles.hint}>Pick an answer to see if you are right.</p>
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
