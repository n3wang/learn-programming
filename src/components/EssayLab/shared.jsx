import React, {useCallback, useEffect, useState} from 'react';
import {discoverWikiForCitation} from '@site/src/data/wiki/discover';
import {ESSAY_LAB_CHANGE_EVENT, getEssayStore} from './storage';
import styles from './styles.module.css';

/** Loads progress, essays, votes, and the player from the active store, and keeps them in sync. */
export function useEssayLabData() {
  const [data, setData] = useState({ready: false, error: null, progress: {}, essays: [], votes: {}, player: null});

  const reload = useCallback(async () => {
    const store = getEssayStore();
    try {
      const [progress, essays, votes, player] = await Promise.all([
        store.listProgress(),
        store.listEssays(),
        store.listVotes(),
        store.getPlayer(),
      ]);
      setData({ready: true, error: null, progress, essays, votes, player});
    } catch (error) {
      setData((d) => ({...d, ready: true, error: String(error?.message || error)}));
    }
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(ESSAY_LAB_CHANGE_EVENT, reload);
    return () => window.removeEventListener(ESSAY_LAB_CHANGE_EVENT, reload);
  }, [reload]);

  return {...data, reload};
}

/** One multiple-choice quiz from a citation; rotates through its quizzes. */
function shuffleChoiceOrder(count) {
  const order = Array.from({length: count}, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function CitationQuiz({citation, progress, onCorrect}) {
  const quizzes = citation.quizzes || [];
  const startIndex = (progress?.attempts || 0) % Math.max(quizzes.length, 1);
  const [index, setIndex] = useState(startIndex);
  const [picked, setPicked] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [unlockedNow, setUnlockedNow] = useState(false);
  const quiz = quizzes[index];
  const [order, setOrder] = useState(() => shuffleChoiceOrder(quiz?.choices?.length || 0));

  useEffect(() => {
    setOrder(shuffleChoiceOrder(quiz?.choices?.length || 0));
    setPicked(null);
    setSubmitted(false);
    setUnlockedNow(false);
  }, [citation.id, quiz?.id, index]);

  if (!quiz) {
    return null;
  }

  const displayChoices = order.map((src) => quiz.choices[src]);
  const correctDisplay = order.indexOf(quiz.answer);

  async function submit() {
    if (picked == null || submitted) {
      return;
    }
    setSubmitted(true);
    const correct = picked === correctDisplay;
    const unlocked = correct && !progress?.unlockedAt;
    setUnlockedNow(unlocked);
    await getEssayStore().recordQuizAttempt(citation.id, quiz.id, correct);
    if (correct) {
      // Essay Lab unlock + wiki discovery (same pattern as formulas / guided).
      await discoverWikiForCitation(citation.id);
      onCorrect?.(citation.id);
    }
  }

  function next() {
    setIndex((i) => (i + 1) % quizzes.length);
  }

  const correct = submitted && picked === correctDisplay;

  return (
    <div className={styles.quiz}>
      <p className={styles.quizPrompt}>{quiz.prompt}</p>
      <div className={styles.choices}>
        {displayChoices.map((choice, i) => {
          const state = submitted
            ? i === correctDisplay
              ? styles.choiceRight
              : i === picked
                ? styles.choiceWrong
                : ''
            : i === picked
              ? styles.choicePicked
              : '';
          return (
            <button
              key={`${quiz.id}-${order[i]}`}
              type="button"
              className={`${styles.choice} ${state}`}
              onClick={() => !submitted && setPicked(i)}
              disabled={submitted}>
              <span className={styles.choiceLetter}>{String.fromCharCode(65 + i)}</span>
              {choice}
            </button>
          );
        })}
      </div>
      {submitted ? (
        <div className={correct ? styles.feedbackRight : styles.feedbackWrong}>
          <strong>{correct ? 'Correct.' : 'Not quite.'}</strong> {quiz.why}
          {unlockedNow ? <span> Unlocked for Essay Lab and added to wiki.</span> : null}
        </div>
      ) : null}
      <div className={styles.quizActions}>
        {!submitted ? (
          <button type="button" className="button button--primary button--sm" disabled={picked == null} onClick={submit}>
            Check
          </button>
        ) : (
          <button type="button" className="button button--secondary button--sm" onClick={next}>
            {quizzes.length > 1 ? 'Next question' : 'Try again'}
          </button>
        )}
      </div>
    </div>
  );
}

function LockIcon({unlocked}) {
  // Open shackle = unlocked; closed shackle = locked.
  if (unlocked) {
    return (
      <svg className={styles.lockIcon} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M5.5 7V4.75a2.5 2.5 0 0 1 4.9-.7.75.75 0 0 0 1.46-.36A4 4 0 0 0 4 4.75V7H3.25A1.25 1.25 0 0 0 2 8.25v5.5C2 14.44 2.56 15 3.25 15h9.5c.69 0 1.25-.56 1.25-1.25v-5.5C14 7.56 13.44 7 12.75 7H5.5zm-1.25 1.5h8.5v5h-8.5v-5z"
        />
      </svg>
    );
  }
  return (
    <svg className={styles.lockIcon} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 1.5A3.25 3.25 0 0 0 4.75 4.75V7H3.25A1.25 1.25 0 0 0 2 8.25v5.5C2 14.44 2.56 15 3.25 15h9.5c.69 0 1.25-.56 1.25-1.25v-5.5C14 7.56 13.44 7 12.75 7H11.25V4.75A3.25 3.25 0 0 0 8 1.5zm1.75 5.5h-3.5V4.75a1.75 1.75 0 1 1 3.5 0V7zM3.5 8.5h9v5h-9v-5z"
      />
    </svg>
  );
}

export function CitationStatus({progress}) {
  const unlocked = Boolean(progress?.unlockedAt);
  const label = unlocked ? 'Unlocked' : progress?.attempts ? 'Not yet' : 'Locked';
  return (
    <span
      className={`${styles.status} ${unlocked ? styles.statusUnlocked : progress?.attempts ? styles.statusTried : styles.statusLocked}`}
      title={label}
      aria-label={label}>
      <LockIcon unlocked={unlocked} />
      <span className={styles.statusText}>{label}</span>
    </span>
  );
}

function citationLineMeta(citation) {
  const author = citation.author || citation.publisher || '';
  const year = citation.year ? ` (${citation.year})` : '';
  return `${author}${year}`.trim();
}

/** A citation with its metadata, status, practice quiz, and an optional action button. */
export function CitationCard({citation, progress, action}) {
  const [open, setOpen] = useState(false);
  const unlocked = Boolean(progress?.unlockedAt);
  const meta = citationLineMeta(citation);
  return (
    <div className={styles.citeRow}>
      <div className={styles.citeLine}>
        <CitationStatus progress={progress} />
        <a href={citation.url} target="_blank" rel="noopener noreferrer" className={styles.cardTitle}>
          {citation.title}
        </a>
        {meta ? <span className={styles.cardMeta}>{meta}</span> : null}
        <code className={styles.cardId}>[@{citation.id}]</code>
        <button type="button" className={styles.citeAction} onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : unlocked ? 'Practice' : 'Unlock'}
        </button>
        {action}
      </div>
      {open ? <CitationQuiz citation={citation} progress={progress} /> : null}
    </div>
  );
}
