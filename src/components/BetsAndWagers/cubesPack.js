/**
 * "Count the cubes" volume questions (inspired by Quoridor's Count the Cubes).
 * Each question is a stack of equal cubes on a grid, shown as a 3D model the
 * big screen turns slowly and every phone can turn by hand. Every column
 * stands on the floor, so cubes hidden under taller columns still count.
 *
 * `cubes.heights[z][x]` is the column height at (x, z); `cubes.edge` is the
 * cube's edge in cm (1 for now), so the answer is count × edge³ cm³.
 * Stacks come from a fixed seed: the same ids always mean the same shapes.
 */

const STAGES = [
  // [id, columns, rows, tallest, shape, how many]
  ['s1', 3, 2, 2, 'stairs', 5],
  ['s2', 3, 3, 3, 'stairs', 5],
  ['s3', 4, 3, 3, 'towers', 5],
  ['s4', 4, 4, 4, 'stairs', 5],
  ['s5', 5, 4, 4, 'towers', 5],
  ['s6', 5, 5, 5, 'stairs', 5],
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 'stairs': heights never grow toward the front or the right (a corner
 * staircase), so the back columns hide cubes behind and under them.
 * 'towers': free heights with a few empty squares, so gaps and tall
 * pillars hide cubes from any single view.
 */
function makeHeights(rng, cols, rows, tallest, shape) {
  const r = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const h = Array.from({length: rows}, () => Array(cols).fill(0));
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      if (shape === 'stairs') {
        const cap = Math.min(z ? h[z - 1][x] : tallest, x ? h[z][x - 1] : tallest);
        h[z][x] = x === 0 && z === 0 ? tallest : r(Math.max(0, cap - 2), cap);
      } else {
        h[z][x] = rng() < 0.15 ? 0 : r(1, tallest);
      }
    }
  }
  return h;
}

export const cubeCount = (cubes) => cubes.heights.flat().reduce((n, v) => n + v, 0);
export const cubeVolume = (cubes) => cubeCount(cubes) * cubes.edge ** 3;

function questionsFor([stage, cols, rows, tallest, shape, count], seed) {
  const rng = mulberry32(seed);
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < count && guard++ < 500) {
    const heights = makeHeights(rng, cols, rows, tallest, shape);
    const key = JSON.stringify(heights);
    const cubes = {edge: 1, heights};
    const n = cubeCount(cubes);
    // Skip near-empty or full boxes: nothing to count around.
    if (seen.has(key) || n < cols * rows * 0.6 || n === cols * rows * tallest) continue;
    seen.add(key);
    const edge = cubes.edge;
    out.push({
      id: `cubes-${stage}-${out.length + 1}`,
      text: `Every cube is ${edge} cm × ${edge} cm × ${edge} cm. What is the volume of the stack? (Hidden cubes hold up the ones you see.)`,
      textZh: `每个小正方体的棱长是 ${edge} cm。这堆小正方体的体积是多少？（看不见的小正方体托着上面的。）`,
      answer: String(cubeVolume(cubes)),
      unit: 'cm³',
      unitZh: '立方厘米',
      cubes,
    });
  }
  return out;
}

export const cubesPack = {
  id: 'cubes',
  title: 'Volume: count the cubes',
  titleZh: '体积：数小正方体',
  questions: STAGES.flatMap((stage, i) => questionsFor(stage, 1009 + i * 7919)),
};
