import React, {useEffect, useState} from 'react';
import Button from '@site/src/components/ui/Button';
import {figureMatchPresets} from './figureMatch/presets';
import styles from './figureMatchGame.module.css';

/**
 * Caption → figure: read a caption, pick the figure it describes.
 * Wrong options come from the same deck, so a deck is just {src, caption}.
 *
 * <FigureMatchGame preset="ccna-network-devices" />
 * <FigureMatchGame figures={[{src, caption}]} options={4} />
 */

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRound(figures, target, count) {
  const others = shuffle(figures.map((_, i) => i).filter((i) => i !== target)).slice(0, count - 1);
  return shuffle([target, ...others]);
}

export default function FigureMatchGame({preset, figures: figuresProp, options = 4}) {
  const figures = figuresProp || figureMatchPresets[preset]?.figures || [];
  const count = Math.min(options, figures.length);

  // Deterministic first render (SSR); shuffle once mounted.
  const [order, setOrder] = useState(() => figures.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [choices, setChoices] = useState(() => figures.slice(0, count).map((_, i) => i));
  const [picked, setPicked] = useState(null);
  const [missed, setMissed] = useState(false);
  const [score, setScore] = useState({right: 0, seen: 0});

  useEffect(() => {
    const o = shuffle(figures.map((_, i) => i));
    setOrder(o);
    setChoices(makeRound(figures, o[0], count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!figures.length) return null;
  const target = order[pos];
  const correct = picked === target;

  const pick = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === target) {
      // Only a first-try hit counts toward the score.
      setScore((s) => ({right: s.right + (missed ? 0 : 1), seen: s.seen + 1}));
    } else {
      setMissed(true);
    }
  };

  const next = () => {
    let o = order;
    let p = pos + 1;
    if (p >= order.length) {
      o = shuffle(figures.map((_, i) => i));
      p = 0;
      setOrder(o);
    }
    setPos(p);
    setChoices(makeRound(figures, o[p], count));
    setPicked(null);
    setMissed(false);
  };

  return (
    <div className={styles.wrap}>
      <p className={styles.caption}>
        {figures[target].caption}
        <span className={styles.score}>{score.right}/{score.seen}</span>
      </p>

      <div className={styles.grid} role="group" aria-label="Pick the figure that matches the caption">
        {choices.map((i, k) => (
          <button
            key={`${pos}-${i}`}
            type="button"
            className={`${styles.option} ${picked === i ? (correct ? styles.right : styles.wrong) : ''}`}
            onClick={() => pick(i)}
            disabled={picked !== null}
            aria-label={`Option ${k + 1}`}
          >
            <img src={figures[i].src} alt="" className={styles.img} draggable={false} />
          </button>
        ))}
      </div>

      {picked !== null ? (
        <div className={styles.footer}>
          {correct ? (
            <Button size="small" variant="contained" onClick={next}>
              Next →
            </Button>
          ) : (
            <Button size="small" variant="outlined" onClick={() => setPicked(null)}>
              Try again
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
