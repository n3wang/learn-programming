import React, {useEffect, useState} from 'react';
import {LESSON_FLAG_REVEAL_EVENT} from '@site/src/data/lessonFlags/store';
import {flagMonster} from '@site/src/data/lessonFlags/monster';
import styles from './styles.module.css';

/**
 * The only place a flag word is ever shown: a toast on the lesson when a challenge with
 * `flagSegment` is finished. Stays until dismissed so the student can write the word down.
 */
export default function FlagRevealToast() {
  const [reveal, setReveal] = useState(null);

  useEffect(() => {
    const onReveal = (event) => setReveal(event.detail || null);
    window.addEventListener(LESSON_FLAG_REVEAL_EVENT, onReveal);
    return () => window.removeEventListener(LESSON_FLAG_REVEAL_EVENT, onReveal);
  }, []);

  useEffect(() => {
    if (!reveal) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setReveal(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reveal]);

  if (!reveal) {
    return null;
  }
  const monster = flagMonster(reveal.flagId);

  return (
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      style={{'--flag-hue': monster.hue}}>
      <button
        type="button"
        className={styles.toastClose}
        onClick={() => setReveal(null)}
        aria-label="Dismiss">
        ×
      </button>
      <div className={styles.toastHead}>
        <span className={styles.badge}>flag piece</span>
        <span className={styles.monsterName}>{monster.name}</span>
      </div>
      <pre className={`${styles.monster} notranslate`} translate="no" aria-hidden="true">
        {monster.art}
      </pre>
      <p className={`${styles.toastWord} notranslate`} translate="no">
        <span className={styles.toastCount}>
          {reveal.index + 1}/{reveal.total}
        </span>
        <span aria-hidden="true"> · </span>
        <strong>{reveal.seg}</strong>
      </p>
      <p className={styles.toastNote}>
        Write this word down — the flags tab never shows it. Collect all {reveal.total}, then
        submit the flag in notes → flags.
      </p>
    </div>
  );
}
