import React, { useEffect, useState } from 'react';
import styles from './styles.module.css';

export default function JournalAnswer({
  id,
  placeholder = 'Write your answer here…',
  rows = 8,
}) {
  const storageKey = `game-design:${id}`;
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored != null) {
        setValue(stored);
      }
    } catch {
      /* ignore private-mode / blocked storage */
    }
  }, [storageKey]);

  function persist(next) {
    setValue(next);
    try {
      window.localStorage.setItem(storageKey, next);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <textarea
        className={styles.area}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => persist(e.target.value)}
        aria-label={placeholder}
      />
      <p className={styles.hint}>
        {saved
          ? 'Saved in this browser. It will still be here when you come back.'
          : 'Type here. Answers stay on this device only.'}
      </p>
    </div>
  );
}
