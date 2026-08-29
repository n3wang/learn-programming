import React, { useEffect, useRef, useState } from 'react';

/**
 * Tweens its displayed value from whatever it was showing to a new `value`
 * whenever `value` changes — used across the classes/math-1 word-problem
 * simulators so randomized numbers (and revealed answers) visibly count
 * up/down instead of jumping, without needing any animation library or
 * global CSS keyframes.
 *
 * Props:
 *   value      {number}  the number to display
 *   decimals   {number}  fixed decimal places (default 0)
 *   duration   {number}  tween duration in ms (default 600)
 *   prefix/suffix {string} optional text wrapped around the number
 */
export default function AnimatedNumber({ value, decimals = 0, duration = 600, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return undefined;
    }
    const start = performance.now();
    cancelAnimationFrame(rafRef.current);

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
