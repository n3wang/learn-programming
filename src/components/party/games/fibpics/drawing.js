import React, {useEffect, useRef, useState} from 'react';
import styles from './fibpics.module.css';

/**
 * Drawings travel as strokes, not pictures: [{c, w, p: [x0, y0, x1, y1, …]}]
 * on a 256 × 192 grid (4:3), small enough for one relay frame even when a
 * phone draws a lot.
 */
export const W = 256;
export const H = 192;
export const COLORS = ['#141414', '#e4572e', '#ff9f43', '#ffc914', '#76b041', '#2e86de', '#8e44ad', '#a0522d', '#ffffff'];
export const WIDTHS = [2, 6];
/** Hard cap so one drawing fits a relay frame (about 12 KB). */
export const MAX_POINTS = 1500;

export function pointCount(strokes) {
  return (strokes || []).reduce((n, s) => n + s.p.length / 2, 0);
}

/** Keep only well-formed strokes inside the grid, capped at MAX_POINTS. */
export function cleanStrokes(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  let budget = MAX_POINTS;
  for (const s of raw.slice(0, 400)) {
    if (!s || !Array.isArray(s.p) || s.p.length < 2) continue;
    const c = Number.isInteger(s.c) && s.c >= 0 && s.c < COLORS.length ? s.c : 0;
    const w = s.w === 1 ? 1 : 0;
    const p = [];
    for (let i = 0; i + 1 < s.p.length && budget > 0; i += 2) {
      const x = Math.max(0, Math.min(W, Math.round(Number(s.p[i]) || 0)));
      const y = Math.max(0, Math.min(H, Math.round(Number(s.p[i + 1]) || 0)));
      p.push(x, y);
      budget -= 1;
    }
    if (p.length >= 2) out.push({c, w, p});
    if (budget <= 0) break;
  }
  return out;
}

function pathOf(p) {
  if (p.length === 2) return `M${p[0]} ${p[1]}l0.01 0`;
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`;
  return d;
}

/** A drawing on the big screen. `replay` animates it stroke by stroke. */
export function Drawing({strokes, replay = false, className = ''}) {
  const [shown, setShown] = useState(0);
  // Every host update clones the state, so restart the replay only when the drawing itself changes.
  const signature = `${(strokes || []).length}:${pointCount(strokes)}:${(strokes && strokes[0] && strokes[0].p.slice(0, 2).join(',')) || ''}`;
  useEffect(() => {
    if (!replay) return undefined;
    setShown(0);
    const total = (strokes || []).length;
    const step = Math.max(40, Math.min(250, 2400 / Math.max(1, total)));
    const timer = setInterval(() => setShown((n) => (n >= total ? n : n + 1)), step);
    return () => clearInterval(timer);
  }, [signature, replay]);
  return (
    <svg className={`${styles.drawing} ${className}`} viewBox={`0 0 ${W} ${H}`} role="img">
      <rect width={W} height={H} fill="#fff" />
      {(strokes || []).slice(0, replay ? shown : undefined).map((s, i) => (
        <path key={i} d={pathOf(s.p)} stroke={COLORS[s.c]} strokeWidth={WIDTHS[s.w]} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/** The phone's canvas: draw, pick a colour and pen, undo, then send. */
export function DrawPad({base = [], onSend, labels, disabled}) {
  const [strokes, setStrokes] = useState([]);
  const [color, setColor] = useState(0);
  const [width, setWidth] = useState(0);
  const svgRef = useRef(null);
  const drawingRef = useRef(null);
  const total = pointCount(base) + pointCount(strokes) + (drawingRef.current ? drawingRef.current.p.length / 2 : 0);
  const full = total >= MAX_POINTS;

  function at(event) {
    const rect = svgRef.current.getBoundingClientRect();
    return [Math.round(((event.clientX - rect.left) / rect.width) * W), Math.round(((event.clientY - rect.top) / rect.height) * H)];
  }

  function down(event) {
    if (disabled || full) return;
    event.preventDefault();
    svgRef.current.setPointerCapture?.(event.pointerId);
    const [x, y] = at(event);
    drawingRef.current = {c: color, w: width, p: [x, y]};
    setStrokes((list) => [...list]);
  }

  function move(event) {
    const s = drawingRef.current;
    if (!s) return;
    const [x, y] = at(event);
    const lx = s.p[s.p.length - 2];
    const ly = s.p[s.p.length - 1];
    // Skip points too close to the last one: a smooth line with far fewer numbers.
    if (Math.abs(x - lx) + Math.abs(y - ly) < 2 || pointCount(base) + pointCount(strokes) + s.p.length / 2 >= MAX_POINTS) return;
    s.p.push(x, y);
    setStrokes((list) => [...list]);
  }

  function up() {
    const s = drawingRef.current;
    drawingRef.current = null;
    if (s) setStrokes((list) => [...list, s]);
  }

  const live = drawingRef.current ? [...strokes, drawingRef.current] : strokes;
  return (
    <div className={styles.pad}>
      <svg
        ref={svgRef}
        className={styles.padCanvas}
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}>
        <rect width={W} height={H} fill="#fff" />
        {[...base, ...live].map((s, i) => (
          <path key={i} d={pathOf(s.p)} stroke={COLORS[s.c]} strokeWidth={WIDTHS[s.w]} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div className={styles.palette}>
        {COLORS.map((c, i) => (
          <button
            key={c}
            type="button"
            className={styles.swatch}
            style={{background: c}}
            aria-pressed={color === i}
            aria-label={i === COLORS.length - 1 ? labels.eraser : c}
            onClick={() => setColor(i)}>
            {i === COLORS.length - 1 ? '🧽' : ''}
          </button>
        ))}
      </div>
      <div className={styles.tools}>
        <button type="button" className="button button--sm button--secondary" aria-pressed={width === 0} onClick={() => setWidth(0)}>
          ✏️ {labels.thin}
        </button>
        <button type="button" className="button button--sm button--secondary" aria-pressed={width === 1} onClick={() => setWidth(1)}>
          🖌️ {labels.thick}
        </button>
        <button type="button" className="button button--sm button--secondary" onClick={() => setStrokes((list) => list.slice(0, -1))} disabled={!strokes.length}>
          ↶ {labels.undo}
        </button>
        {full && <span className={styles.inkFull}>{labels.inkFull}</span>}
      </div>
      <button type="button" className="button button--lg button--block" disabled={disabled} onClick={() => onSend(strokes)}>
        {labels.send}
      </button>
    </div>
  );
}

/** A bot's doodle: a few random shapes, enough to vote on. */
export function botDoodle(rng) {
  const strokes = [];
  const shapes = 3 + Math.floor(rng() * 4);
  for (let k = 0; k < shapes; k++) {
    const c = Math.floor(rng() * 8);
    const cx = 30 + rng() * 196;
    const cy = 30 + rng() * 132;
    const r = 10 + rng() * 40;
    const p = [];
    if (rng() < 0.5) {
      for (let a = 0; a <= 24; a++) {
        const t = (a / 24) * Math.PI * 2;
        p.push(Math.round(cx + r * Math.cos(t)), Math.round(cy + r * 0.8 * Math.sin(t)));
      }
    } else {
      let x = cx;
      let y = cy;
      for (let a = 0; a < 10; a++) {
        p.push(Math.round(x), Math.round(y));
        x = Math.max(0, Math.min(W, x + (rng() - 0.5) * 50));
        y = Math.max(0, Math.min(H, y + (rng() - 0.5) * 40));
      }
    }
    strokes.push({c, w: rng() < 0.3 ? 1 : 0, p});
  }
  return strokes;
}
