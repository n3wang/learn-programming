import React, {useEffect, useState} from 'react';
import styles from './sultan.module.css';

/**
 * CSS 3D d6 with pips. Host settles the face; we spin then snap to `face` (1–6).
 * Tap calls onLaunch before the auto timer. `bonus` is the +1 attention pip.
 * `base` is the character/army stat added to the die (Charisma / Combat / …).
 */
const FACE_ROT = {
  1: 'rotateX(-18deg) rotateY(-24deg)',
  2: 'rotateX(-108deg) rotateY(-24deg)',
  3: 'rotateX(-18deg) rotateY(-114deg)',
  4: 'rotateX(-18deg) rotateY(66deg)',
  5: 'rotateX(72deg) rotateY(-24deg)',
  6: 'rotateX(-18deg) rotateY(156deg)',
};

/** Classic die pip layouts (3×3 grid cells that are filled). */
const PIPS = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

function Face({n}) {
  return (
    <span className={styles.dice3dFace} data-face={n}>
      <span className={styles.dice3dPips}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((cell) => (
          <span key={cell} className={styles.dice3dPip} data-on={PIPS[n].includes(cell) || undefined} />
        ))}
      </span>
    </span>
  );
}

export default function Dice3D({face = null, launched = false, bonus = 0, base = null, mine = false, onLaunch, label, hint}) {
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    if (face == null) return undefined;
    setSpinning(true);
    const t = window.setTimeout(() => setSpinning(false), 900);
    return () => window.clearTimeout(t);
  }, [face]);
  const settled = face != null && !spinning;
  const waiting = mine && !launched && face == null && Boolean(onLaunch);
  const parts = face != null ? [face, base != null ? base : null, bonus > 0 ? bonus : null].filter((n) => n != null) : [];
  const total = parts.length ? parts.reduce((n, v) => n + v, 0) : null;
  return (
    <div className={styles.dice3dWrap} data-mine={mine || undefined} data-waiting={waiting || undefined}>
      {label && <p className={styles.dice3dLabel}>{label}</p>}
      <button
        type="button"
        className={styles.dice3dHit}
        disabled={!waiting}
        onClick={onLaunch}
        aria-label={hint || 'Roll'}>
        <span className={`${styles.dice3dScene} ${spinning ? styles.dice3dSpin : ''} ${waiting ? styles.dice3dIdle : ''}`}>
          <span className={styles.dice3dCube} style={settled ? {transform: FACE_ROT[face]} : undefined} data-settled={settled || undefined}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Face key={n} n={n} />
            ))}
          </span>
        </span>
        {bonus > 0 && <span className={styles.dice3dBonus}>+{bonus}</span>}
      </button>
      {hint && waiting && <p className={styles.dice3dHint}>{hint}</p>}
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
