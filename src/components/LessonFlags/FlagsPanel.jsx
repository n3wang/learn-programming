import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import {LESSON_FLAGS, getFlag} from '@site/src/data/lessonFlags/catalog';
import {captureFlag, isCaptured, revealedCount} from '@site/src/data/lessonFlags/store';
import {pushCapture} from '@site/src/data/lessonFlags/sync';
import {flagMonster} from '@site/src/data/lessonFlags/monster';
import {useSiteAuth} from '@site/src/components/navbar/useSiteAuth';
import useLessonFlags from './useLessonFlags';
import notes from '@site/src/components/ScratchNotes/styles.module.css';
import styles from './styles.module.css';

function formatDate(ts) {
  if (!ts) {
    return '';
  }
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function Help() {
  return (
    <div className={styles.help}>
      <p>
        <strong>How flags work.</strong> Some quizzes and exercises carry a hidden flag piece.
        Finish one and a monster pops up on the lesson with a word and its position (like{' '}
        <code>2/5</code>). That is the only time the word is shown — write it down.
      </p>
      <p>
        Each monster stands for one flag. Once you have every piece for a monster, join them in
        order with <code>-</code> and submit here as <code>FLAG{'{…}'}</code> (the wrapper is
        optional). A captured lesson gets a green mark in the sidebar.
      </p>
    </div>
  );
}

function FlagDetail({flag, state, onBack, onNavigate}) {
  const {auth, isStudent} = useSiteAuth();
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const monster = flagMonster(flag.id);
  const total = flag.parts.length;
  const done = revealedCount(flag, state);
  const captured = state.captured[flag.id];

  function submit(event) {
    event.preventDefault();
    if (!answer.trim()) {
      return;
    }
    const wasCaptured = isCaptured(flag.id);
    const ok = captureFlag(flag.id, answer);
    setResult(ok ? 'ok' : 'wrong');
    if (ok) {
      setAnswer('');
      if (!wasCaptured && isStudent && auth?.name) {
        pushCapture({student: auth.name, roster: auth.rosterId}, flag.id).catch(() => {});
      }
    }
  }

  return (
    <div className={notes.body}>
      <div className={styles.detailBar}>
        <button type="button" className={notes.back} onClick={onBack} aria-label="Back">
          ‹
        </button>
        <span className={styles.detailTitle}>{flag.title}</span>
      </div>
      <div className={styles.detailCard} style={{'--flag-hue': monster.hue}}>
        <pre className={`${styles.monster} notranslate`} translate="no" aria-hidden="true">
          {monster.art}
        </pre>
        <div className={styles.detailMeta}>
          <span className={styles.monsterName}>{monster.name}</span>
          <span className={styles.progress}>
            {done}/{total} pieces found
          </span>
          {captured ? (
            <span className={styles.captured}>captured {formatDate(captured.at)}</span>
          ) : null}
          {flag.paths.map((p) => (
            <Link key={p} to={p} className={styles.lessonLink} onClick={onNavigate}>
              open lesson →
            </Link>
          ))}
        </div>
      </div>
      {captured ? null : (
        <form className={styles.submitRow} onSubmit={submit}>
          <input
            className={`${notes.search} notranslate`}
            translate="no"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setResult(null);
            }}
            placeholder="FLAG{…}"
            aria-label={`Submit flag for ${flag.title}`}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className={styles.submitBtn} disabled={!answer.trim()}>
            submit
          </button>
        </form>
      )}
      {result === 'ok' ? <p className={styles.ok}>Flag captured!</p> : null}
      {result === 'wrong' ? (
        <p className={styles.wrong}>Not quite — check the pieces and their order.</p>
      ) : null}
    </div>
  );
}

/** Scratch Notes `flags` tab. Shows monsters and counts only — never segment words. */
export default function FlagsPanel({onNavigate}) {
  const state = useLessonFlags();
  const [flagId, setFlagId] = useState(null);
  const [help, setHelp] = useState(false);
  const flag = flagId ? getFlag(flagId) : null;

  if (flag) {
    return (
      <FlagDetail
        flag={flag}
        state={state}
        onBack={() => setFlagId(null)}
        onNavigate={onNavigate}
      />
    );
  }

  const capturedCount = LESSON_FLAGS.filter((f) => state.captured[f.id]).length;
  // Captures are permanent: keep listing flags that were since removed from the catalog.
  const retired = Object.keys(state.captured).filter((id) => !getFlag(id));

  return (
    <div className={notes.body}>
      <div className={styles.listHead}>
        <span>
          {capturedCount}/{LESSON_FLAGS.length} captured
        </span>
        <button
          type="button"
          className={styles.helpBtn}
          onClick={() => setHelp((v) => !v)}
          aria-expanded={help}
          aria-label="How flags work">
          ?
        </button>
      </div>
      {help ? <Help /> : null}
      <ul className={notes.list}>
        {LESSON_FLAGS.map((f) => {
          const monster = flagMonster(f.id);
          const captured = state.captured[f.id];
          const done = revealedCount(f, state);
          return (
            <li key={f.id}>
              <button
                type="button"
                className={styles.flagRow}
                style={{'--flag-hue': monster.hue}}
                onClick={() => setFlagId(f.id)}>
                <span className={captured ? styles.dotCaptured : styles.dot} aria-hidden="true" />
                <span className={notes.rowTitle}>{f.title}</span>
                <span className={styles.rowMonster}>{monster.name}</span>
                <span className={captured ? notes.done : notes.pending}>
                  [{captured ? formatDate(captured.at) : `${done}/${f.parts.length}`}]
                </span>
              </button>
            </li>
          );
        })}
        {retired.map((id) => (
          <li key={id}>
            <div className={styles.flagRow} style={{'--flag-hue': flagMonster(id).hue}}>
              <span className={styles.dotCaptured} aria-hidden="true" />
              <span className={notes.rowTitle}>{id}</span>
              <span className={styles.rowMonster}>{flagMonster(id).name}</span>
              <span className={notes.done}>[{formatDate(state.captured[id].at)}]</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
