import React, {useEffect, useState} from 'react';
import styles from './sultan.module.css';

/**
 * CSS 3D d6. Host settles the face; we animate a roll then snap to `face` (1–6).
 * Tap calls onLaunch before the auto timer. `bonus` shows the +1 attention pip.
 * `base` is the character/army stat added to the die (Charisma / Combat / …).
 */
/** Settled pose: bring the rolled face forward, keep a slight 3D tilt. */
const FACE_ROT = {
  1: 'rotateX(-22deg) rotateY(-28deg)',
  2: 'rotateX(-112deg) rotateY(-28deg)',
  3: 'rotateX(-22deg) rotateY(-118deg)',
  4: 'rotateX(-22deg) rotateY(62deg)',
  5: 'rotateX(68deg) rotateY(-28deg)',
  6: 'rotateX(-22deg) rotateY(152deg)',
};

export default function Dice3D({face = null, launched = false, bonus = 0, base = null, mine = false, onLaunch, label, hint}) {
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    if (face == null) return undefined;
    setSpinning(true);
    const t = window.setTimeout(() => setSpinning(false), 900);
    return () => window.clearTimeout(t);
  }, [face]);
  const settled = face != null && !spinning;
  const parts = face != null ? [face, base != null ? base : null, bonus > 0 ? bonus : null].filter((n) => n != null) : [];
  const total = parts.length ? parts.reduce((n, v) => n + v, 0) : null;
  return (
    <div className={styles.dice3dWrap} data-mine={mine || undefined}>
      {label && <p className={styles.dice3dLabel}>{label}</p>}
      <button
        type="button"
        className={styles.dice3dHit}
        disabled={!mine || launched || face != null || !onLaunch}
        onClick={onLaunch}
        aria-label={hint || 'Roll'}>
        <span className={`${styles.dice3dScene} ${spinning ? styles.dice3dSpin : ''}`}>
          <span className={styles.dice3dCube} style={settled ? {transform: FACE_ROT[face]} : undefined} data-settled={settled || undefined}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <span key={n} className={styles.dice3dFace} data-face={n}>
                {n}
              </span>
            ))}
          </span>
        </span>
        {bonus > 0 && <span className={styles.dice3dBonus}>+{bonus}</span>}
      </button>
      {hint && mine && !launched && face == null && <p className={styles.dice3dHint}>{hint}</p>}
      {face != null && (
        <p className={styles.dice3dResult}>
          {base != null ? (
            <>
              <b className={styles.dice3dTotal}>{total}</b>
              <small>
                {face}
                {base != null ? ` + ${base}` : ''}
                {bonus > 0 ? ` + ${bonus}` : ''}
              </small>
            </>
          ) : (
            <>
              {face}
              {bonus > 0 ? ` + ${bonus}` : ''}
            </>
          )}
        </p>
      )}
    </div>
  );
}
