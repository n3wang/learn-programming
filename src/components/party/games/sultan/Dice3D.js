import React, {useEffect, useRef, useState} from 'react';
import styles from './sultan.module.css';

/**
 * Isometric SVG d6. Host settles `face` (1–6); we tumble (random bounce axes)
 * then land on that face. Tap → onLaunch. `bonus` = +1; `base` = Charisma/Combat.
 */

const PIPS = {
  1: [[50, 50]],
  2: [
    [28, 28],
    [72, 72],
  ],
  3: [
    [28, 28],
    [50, 50],
    [72, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 22],
    [72, 22],
    [28, 50],
    [72, 50],
    [28, 78],
    [72, 78],
  ],
};

function frontPip(ux, uy) {
  const u = ux / 100;
  const v = uy / 100;
  return {cx: u * 44, cy: u * 24 + v * 44};
}

function rightPip(ux, uy) {
  const u = ux / 100;
  const v = uy / 100;
  return {cx: u * 44, cy: -u * 24 + v * 44};
}

function topPip(ux, uy) {
  const u = ux / 100;
  const v = uy / 100;
  return {cx: u * 44 + v * 44, cy: u * 24 - v * 24};
}

function DieSvg({face}) {
  const show = face || 1;
  const topN = show === 6 ? 1 : (show % 6) + 1;
  const rightN = 7 - show;
  return (
    <svg className={styles.diceSvg} viewBox="0 0 120 120" width="100" height="100" aria-hidden="true">
      <g className={styles.diceSvgBody}>
        <path d="M60 70 L104 46 L104 90 L60 114 Z" fill="#e0b86a" stroke="#2a1630" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M16 46 L60 22 L104 46 L60 70 Z" fill="#fff3d6" stroke="#2a1630" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M16 46 L60 70 L60 114 L16 90 Z" fill="#fffdf8" stroke="#2a1630" strokeWidth="2.5" strokeLinejoin="round" />
        <g transform="translate(16 46)" opacity="0.55">
          {PIPS[topN].map(([ux, uy], i) => {
            const {cx, cy} = topPip(ux, uy);
            return <circle key={`t${i}`} cx={cx} cy={cy} r="3" fill="#2a1630" />;
          })}
        </g>
        <g transform="translate(60 70)" opacity="0.7">
          {PIPS[rightN].map(([ux, uy], i) => {
            const {cx, cy} = rightPip(ux, uy);
            return <circle key={`r${i}`} cx={cx} cy={cy} r="3.4" fill="#2a1630" />;
          })}
        </g>
        <g transform="translate(16 46)">
          {PIPS[show].map(([ux, uy], i) => {
            const {cx, cy} = frontPip(ux, uy);
            return <circle key={i} cx={cx} cy={cy} r="5.4" fill="#2a1630" />;
          })}
        </g>
      </g>
    </svg>
  );
}

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a, b) => (Math.random() < 0.5 ? a : b);

/** Random bounce/tumble keyframes — each roll takes a different path. */
function tumbleKeyframes() {
  const spin = pick(1, -1) * (720 + Math.floor(Math.random() * 3) * 360); // 2–4 turns
  const tilt = pick(1, -1);
  const ax = rnd(0.35, 1);
  const ay = rnd(0.15, 0.95);
  const az = rnd(-0.55, 0.55);
  const hits = [
    {x: pick(-1, 1) * rnd(16, 28), y: -rnd(22, 38), s: rnd(1.08, 1.22)},
    {x: pick(-1, 1) * rnd(14, 26), y: -rnd(4, 12), s: rnd(0.88, 0.96)}, // floor hit
    {x: pick(-1, 1) * rnd(18, 30), y: -rnd(28, 44), s: rnd(1.1, 1.28)},
    {x: pick(-1, 1) * rnd(10, 20), y: -rnd(2, 10), s: rnd(0.9, 0.98)}, // floor hit
    {x: pick(-1, 1) * rnd(6, 14), y: -rnd(14, 22), s: rnd(1.02, 1.1)},
  ];
  const frame = (h, ang, extra = 0) => ({
    transform: `translate(${h.x}px, ${h.y}px) rotate3d(${ax}, ${ay}, ${az + tilt * 0.2}, ${ang}deg) scale(${h.s + extra})`,
  });
  return [
    {transform: 'translate(0, 0) rotate3d(0, 1, 0, 0deg) scale(1)', offset: 0},
    {...frame(hits[0], spin * 0.18), offset: 0.14},
    {...frame(hits[1], spin * 0.36, -0.02), offset: 0.3},
    {...frame(hits[2], spin * 0.55), offset: 0.48},
    {...frame(hits[3], spin * 0.78, -0.03), offset: 0.68},
    {...frame(hits[4], spin * 0.92), offset: 0.86},
    {transform: 'translate(0, 0) rotate3d(0, 1, 0, 0deg) scale(1)', offset: 1},
  ];
}

const ROLL_MS = 1100;

export default function Dice3D({face = null, launched = false, bonus = 0, base = null, mine = false, onLaunch, label, hint}) {
  const [spinning, setSpinning] = useState(false);
  const [displayFace, setDisplayFace] = useState(face);
  const tumbleRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (face == null) {
      setDisplayFace(null);
      setSpinning(false);
      if (animRef.current) {
        animRef.current.cancel();
        animRef.current = null;
      }
      return undefined;
    }

    setSpinning(true);
    const el = tumbleRef.current;
    if (el && typeof el.animate === 'function') {
      if (animRef.current) animRef.current.cancel();
      animRef.current = el.animate(tumbleKeyframes(), {
        duration: ROLL_MS,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        fill: 'forwards',
      });
    }

    // Face flicker: fast early, slower near the end, then land on result.
    let n = 0;
    const steps = 14;
    let delay = 40;
    let timer;
    const tick = () => {
      n += 1;
      if (n >= steps) {
        setDisplayFace(face);
        setSpinning(false);
        return;
      }
      setDisplayFace(1 + Math.floor(Math.random() * 6));
      delay = 40 + n * 12;
      timer = window.setTimeout(tick, delay);
    };
    timer = window.setTimeout(tick, delay);

    return () => {
      window.clearTimeout(timer);
      if (animRef.current) {
        animRef.current.cancel();
        animRef.current = null;
      }
    };
  }, [face]);

  const waiting = mine && !launched && face == null && Boolean(onLaunch);
  const shown = displayFace || 1;
  const parts = face != null ? [face, base != null ? base : null, bonus > 0 ? bonus : null].filter((n) => n != null) : [];
  const total = parts.length ? parts.reduce((n, v) => n + v, 0) : null;

  return (
    <div className={styles.dice3dWrap} data-mine={mine || undefined} data-waiting={waiting || undefined}>
      {label && <p className={styles.dice3dLabel}>{label}</p>}
      <button type="button" className={styles.dice3dHit} disabled={!waiting} onClick={onLaunch} aria-label={hint || 'Roll'}>
        <span className={`${styles.diceSvgScene} ${waiting ? styles.dice3dIdle : ''}`}>
          <span className={styles.diceTumble} ref={tumbleRef}>
            <DieSvg face={shown} />
          </span>
        </span>
        {bonus > 0 && <span className={styles.dice3dBonus}>+{bonus}</span>}
      </button>
      {hint && waiting && <p className={styles.dice3dHint}>{hint}</p>}
      {face != null && !spinning && (
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
