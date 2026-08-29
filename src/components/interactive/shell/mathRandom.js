/**
 * Small shared helpers for the randomized word-problem simulators used in
 * classes/math-1. Kept tiny and dependency-free so every simulator can
 * generate "nice" random parameters consistently.
 */

/** Random integer in [min, max], inclusive. */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array. */
export function pickOne(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/** Format a number for display: round to `decimals` places, trim trailing zeros. */
export function fmtNum(n, decimals = 2) {
  const rounded = Number(n.toFixed(decimals));
  return rounded.toString();
}
