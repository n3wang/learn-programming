/**
 * "Count the cubes" volume questions (inspired by Quoridor's Count the Cubes).
 * Each question is a stack of equal cubes on a grid, shown as a 3D model the
 * big screen turns slowly and every phone can turn by hand. Every column
 * stands on the floor, so cubes hidden under taller columns still count.
 *
 * Shapes are patterned (rectangles, stairs, pyramids, hole grids, …) so volume
 * can be calculated from a formula — including reduction: solid − holes.
 *
 * `cubes.heights[z][x]` is the column height at (x, z); `cubes.edge` is the
 * cube's edge in cm (1 for now), so the answer is count × edge³ cm³.
 * Stacks come from a fixed seed: the same ids always mean the same shapes.
 */

/** Active cube-count band for the stage currently being generated. */
let bandLo = 100;
let bandHi = 300;
const inBand = (n) => n >= bandLo && n <= bandHi;

/** Patterns where volume is meant as solid − removed holes / cutouts. */
const REDUCTION = new Set([
  'holes',
  'wells',
  'arcade',
  'checker',
  'cutout',
  'corner',
  'trench',
  'slots',
  'frame',
]);

/** [id, patterns, how many, minCubes, maxCubes] — most sit in ~100–300; later stages climb. */
const STAGES = [
  ['s1', ['rect', 'blocks', 'platform'], 5, 100, 220],
  ['s2', ['stairs', 'pyramid', 'ridge'], 5, 100, 250],
  ['s3', ['city', 'skyline'], 5, 120, 280],
  ['s4', ['labyrinth', 'spiral', 'frame'], 5, 120, 300],
  ['s5', ['city', 'wells', 'holes', 'skyline'], 5, 140, 320],
  ['s6', ['labyrinth', 'cutout', 'spiral', 'trench', 'platform'], 5, 200, 450],
  ['s7', ['city', 'corner', 'slots', 'arcade', 'checker', 'ridge'], 5, 250, 600],
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

const r = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

function empty(cols, rows) {
  return Array.from({length: rows}, () => Array(cols).fill(0));
}

/** Raise a rectangular footprint to at least `height` (floor-to-top columns). */
function raiseRect(h, x0, z0, w, d, height) {
  for (let z = z0; z < z0 + d; z++) {
    for (let x = x0; x < x0 + w; x++) {
      if (h[z] && x >= 0 && x < h[z].length) h[z][x] = Math.max(h[z][x], height);
    }
  }
}

/** Drop empty borders so the camera frames the shape tightly. */
function trim(heights) {
  let z0 = 0;
  let z1 = heights.length - 1;
  let x0 = 0;
  let x1 = (heights[0]?.length ?? 1) - 1;
  while (z0 <= z1 && heights[z0].every((v) => v === 0)) z0++;
  while (z1 >= z0 && heights[z1].every((v) => v === 0)) z1--;
  while (x0 <= x1 && heights.every((row) => (row[x0] ?? 0) === 0)) x0++;
  while (x1 >= x0 && heights.every((row) => (row[x1] ?? 0) === 0)) x1--;
  if (z0 > z1 || x0 > x1) return [[0]];
  return heights.slice(z0, z1 + 1).map((row) => row.slice(x0, x1 + 1));
}

/**
 * Solid rectangular prism — volume = width × depth × height.
 */
function makeRect(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const w = r(rng, 5, 12);
    const d = r(rng, 5, 12);
    const h = r(rng, 2, 6);
    const n = w * d * h;
    if (!inBand(n)) continue;
    const heights = empty(w, d);
    raiseRect(heights, 0, 0, w, d, h);
    return heights;
  }
  return null;
}

/**
 * Uniform staircase: `steps` treads, each `tread` wide, rise `rise`, full depth.
 * Volume = depth × tread × rise × steps × (steps + 1) / 2.
 */
function makeStairs(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const steps = r(rng, 4, 10);
    const tread = r(rng, 1, 3);
    const rise = r(rng, 1, 2);
    const depth = r(rng, 4, 10);
    const n = (depth * tread * rise * steps * (steps + 1)) / 2;
    if (!inBand(n)) continue;
    const w = steps * tread;
    const heights = empty(w, depth);
    for (let s = 0; s < steps; s++) {
      raiseRect(heights, s * tread, 0, tread, depth, (s + 1) * rise);
    }
    return heights;
  }
  return null;
}

/**
 * Square stepped pyramid: height at (x,z) = min(x, z, n-1-x, n-1-z) + 1.
 * Volume = 1² + 3² + … + n² (odd n) or the matching even-layer sum.
 */
function makePyramid(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const n = r(rng, 7, 13);
    let total = 0;
    const m = Math.floor(n / 2) + 1;
    for (let k = 0; k < m; k++) total += (n - 2 * k) ** 2;
    if (!inBand(total)) continue;
    const heights = empty(n, n);
    for (let z = 0; z < n; z++) {
      for (let x = 0; x < n; x++) {
        heights[z][x] = Math.min(x, z, n - 1 - x, n - 1 - z) + 1;
      }
    }
    return heights;
  }
  return null;
}

/**
 * Roof / triangular prism along x, constant through depth.
 * Volume = depth × sum of the ridge heights.
 */
function makeRidge(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const w = r(rng, 7, 15);
    const depth = r(rng, 4, 10);
    const peak = r(rng, 3, Math.min(6, Math.ceil(w / 2)));
    const heights = empty(w, depth);
    let total = 0;
    for (let x = 0; x < w; x++) {
      const h = Math.min(x + 1, w - x, peak);
      total += h * depth;
      for (let z = 0; z < depth; z++) heights[z][x] = h;
    }
    if (!inBand(total)) continue;
    return heights;
  }
  return null;
}

/**
 * A row of identical rectangular blocks (same size, even spacing).
 * Volume = count × width × depth × height.
 */
function makeBlocks(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const count = r(rng, 2, 5);
    const bw = r(rng, 2, 5);
    const bd = r(rng, 2, 6);
    const bh = r(rng, 2, 6);
    const gap = r(rng, 1, 2);
    const n = count * bw * bd * bh;
    if (!inBand(n)) continue;
    const w = count * bw + (count - 1) * gap;
    const heights = empty(w, bd);
    for (let i = 0; i < count; i++) {
      raiseRect(heights, i * (bw + gap), 0, bw, bd, bh);
    }
    return heights;
  }
  return null;
}

/**
 * Flat base slab with a smaller centered platform on top (two equal-height layers
 * of rectangles). Volume = baseW×baseD×h1 + topW×topD×h2.
 */
function makePlatform(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const baseW = r(rng, 6, 14);
    const baseD = r(rng, 5, 12);
    const h1 = r(rng, 1, 3);
    const topW = r(rng, Math.max(2, Math.floor(baseW / 3)), Math.floor(baseW * 0.7));
    const topD = r(rng, Math.max(2, Math.floor(baseD / 3)), Math.floor(baseD * 0.7));
    const h2 = r(rng, 1, 5);
    if (topW < 2 || topD < 2) continue;
    const n = baseW * baseD * h1 + topW * topD * h2;
    if (!inBand(n)) continue;
    const heights = empty(baseW, baseD);
    raiseRect(heights, 0, 0, baseW, baseD, h1);
    const x0 = Math.floor((baseW - topW) / 2);
    const z0 = Math.floor((baseD - topD) / 2);
    raiseRect(heights, x0, z0, topW, topD, h1 + h2);
    return heights;
  }
  return null;
}

/** Hollow rectangular frame (courtyard empty). Volume = wall footprint × height. */
function makeFrame(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const w = r(rng, 8, 16);
    const d = r(rng, 7, 14);
    const t = r(rng, 1, 2);
    const h = r(rng, 2, 6);
    if (w <= 2 * t + 2 || d <= 2 * t + 2) continue;
    const n = h * (w * d - (w - 2 * t) * (d - 2 * t));
    if (!inBand(n)) continue;
    const heights = empty(w, d);
    raiseRect(heights, 0, 0, w, d, h);
    for (let z = t; z < d - t; z++) {
      for (let x = t; x < w - t; x++) heights[z][x] = 0;
    }
    return heights;
  }
  return null;
}

/**
 * City block: flat base slab + a regular grid of identical tower buildings.
 * Volume = baseW×baseD×hBase + cols×rows×bw×bd×towerH.
 */
function makeCity(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const cols = r(rng, 2, 4);
    const rows = r(rng, 2, 4);
    const bw = r(rng, 2, 3);
    const bd = r(rng, 2, 3);
    const gap = r(rng, 1, 2);
    const hBase = r(rng, 1, 2);
    const towerH = r(rng, 2, 5);
    const margin = r(rng, 1, 2);
    const innerW = cols * bw + (cols - 1) * gap;
    const innerD = rows * bd + (rows - 1) * gap;
    const baseW = innerW + 2 * margin;
    const baseD = innerD + 2 * margin;
    const n = baseW * baseD * hBase + cols * rows * bw * bd * towerH;
    if (!inBand(n)) continue;
    const heights = empty(baseW, baseD);
    raiseRect(heights, 0, 0, baseW, baseD, hBase);
    for (let rz = 0; rz < rows; rz++) {
      for (let cx = 0; cx < cols; cx++) {
        raiseRect(
          heights,
          margin + cx * (bw + gap),
          margin + rz * (bd + gap),
          bw,
          bd,
          hBase + towerH,
        );
      }
    }
    return heights;
  }
  return null;
}

/**
 * Skyline: base + a repeating row of different building heights (A/B/C pattern).
 * Volume = base + sum over buildings of footprint × extra height.
 */
function makeSkyline(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const kinds = r(rng, 2, 3);
    const profile = Array.from({length: kinds}, () => r(rng, 2, 6));
    const repeats = r(rng, 2, 3);
    const bw = r(rng, 2, 3);
    const bd = r(rng, 2, 5);
    const gap = r(rng, 1, 2);
    const hBase = r(rng, 1, 2);
    const margin = r(rng, 1, 2);
    const buildings = [];
    for (let rep = 0; rep < repeats; rep++) {
      for (let k = 0; k < kinds; k++) buildings.push(profile[k]);
    }
    const innerW = buildings.length * bw + (buildings.length - 1) * gap;
    const baseW = innerW + 2 * margin;
    const baseD = bd + 2 * margin;
    let extra = 0;
    for (const h of buildings) extra += bw * bd * h;
    const n = baseW * baseD * hBase + extra;
    if (!inBand(n)) continue;
    const heights = empty(baseW, baseD);
    raiseRect(heights, 0, 0, baseW, baseD, hBase);
    buildings.forEach((h, i) => {
      raiseRect(heights, margin + i * (bw + gap), margin, bw, bd, hBase + h);
    });
    return heights;
  }
  return null;
}

/**
 * Raise a hollow rectangular ring (labyrinth wall), optional gap on one side.
 * `gapSide`: 0=N, 1=E, 2=S, 3=W — leaves an opening of width `gapW`.
 */
function raiseRing(heights, x0, z0, w, d, t, height, gapSide = -1, gapW = 2) {
  // North / south walls
  for (let x = x0; x < x0 + w; x++) {
    for (let tz = 0; tz < t; tz++) {
      const onGapN = gapSide === 0 && x >= x0 + Math.floor((w - gapW) / 2) && x < x0 + Math.floor((w - gapW) / 2) + gapW;
      const onGapS = gapSide === 2 && x >= x0 + Math.floor((w - gapW) / 2) && x < x0 + Math.floor((w - gapW) / 2) + gapW;
      if (!onGapN && heights[z0 + tz]) heights[z0 + tz][x] = Math.max(heights[z0 + tz][x] ?? 0, height);
      if (!onGapS && heights[z0 + d - 1 - tz]) {
        heights[z0 + d - 1 - tz][x] = Math.max(heights[z0 + d - 1 - tz][x] ?? 0, height);
      }
    }
  }
  // East / west walls
  for (let z = z0; z < z0 + d; z++) {
    for (let tx = 0; tx < t; tx++) {
      const onGapW = gapSide === 3 && z >= z0 + Math.floor((d - gapW) / 2) && z < z0 + Math.floor((d - gapW) / 2) + gapW;
      const onGapE = gapSide === 1 && z >= z0 + Math.floor((d - gapW) / 2) && z < z0 + Math.floor((d - gapW) / 2) + gapW;
      if (!onGapW && heights[z]) heights[z][x0 + tx] = Math.max(heights[z][x0 + tx] ?? 0, height);
      if (!onGapE && heights[z]) {
        heights[z][x0 + w - 1 - tx] = Math.max(heights[z][x0 + w - 1 - tx] ?? 0, height);
      }
    }
  }
}

/**
 * Concentric labyrinth rings; each ring is one step taller (escalera inward),
 * with alternating openings like a classic maze.
 */
function makeLabyrinth(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const rings = r(rng, 2, 4);
    const t = 1;
    const gap = r(rng, 1, 2);
    const rise = 1;
    const core = r(rng, 2, 4);
    const size = core + 2 * rings * (t + gap) - 2 * gap;
    if (size < 8 || size > 22) continue;
    const heights = empty(size, size);
    for (let ring = 0; ring < rings; ring++) {
      const inset = ring * (t + gap);
      const w = size - 2 * inset;
      const h = (ring + 1) * rise;
      if (w <= 2 * t + 2) break;
      raiseRing(heights, inset, inset, w, w, t, h, ring % 4, Math.min(2, Math.floor(w / 3)));
    }
    const total = heights.flat().reduce((n, v) => n + v, 0);
    if (!inBand(total)) continue;
    return heights;
  }
  return null;
}

/** Clockwise perimeter cells of a square ring (thickness `t`). */
function ringPath(inset, w, t) {
  const cells = [];
  const x0 = inset;
  const z0 = inset;
  for (let x = x0; x < x0 + w; x++) {
    for (let tz = 0; tz < t; tz++) cells.push([x, z0 + tz]);
  }
  for (let z = z0 + t; z < z0 + w; z++) {
    for (let tx = 0; tx < t; tx++) cells.push([x0 + w - 1 - tx, z]);
  }
  for (let x = x0 + w - 1 - t; x >= x0; x--) {
    for (let tz = 0; tz < t; tz++) cells.push([x, z0 + w - 1 - tz]);
  }
  for (let z = z0 + w - 1 - t; z >= z0 + t; z--) {
    for (let tx = 0; tx < t; tx++) cells.push([x0 + tx, z]);
  }
  return cells;
}

/**
 * Escalera around a repeating labyrinth: concentric corridor rings, height
 * climbs steadily as you walk the spiral inward (stairs wrapping the maze).
 */
function makeSpiral(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const rings = r(rng, 2, 4);
    const t = 1;
    const lane = r(rng, 1, 2);
    const rise = 1;
    const tread = r(rng, 4, 10);
    const core = r(rng, 2, 4);
    const pitch = t + lane;
    const size = core + 2 * rings * pitch - 2 * lane;
    if (size < 8 || size > 20) continue;
    const heights = empty(size, size);
    const path = [];
    for (let ring = 0; ring < rings; ring++) {
      const inset = ring * pitch;
      const w = size - 2 * inset;
      if (w <= 2 * t) break;
      path.push(...ringPath(inset, w, t));
    }
    let total = 0;
    path.forEach(([px, pz], i) => {
      const h = Math.floor(i / tread) * rise + rise;
      heights[pz][px] = Math.max(heights[pz][px], h);
      total += h;
    });
    // Recount after max-merges at corners.
    total = heights.flat().reduce((n, v) => n + v, 0);
    if (!inBand(total)) continue;
    return heights;
  }
  return null;
}

/**
 * Punch a rectangular hole down to `floor` (0 = through-hole) inside a solid.
 */
function punch(heights, x0, z0, w, d, floor = 0) {
  for (let z = z0; z < z0 + d; z++) {
    for (let x = x0; x < x0 + w; x++) {
      if (heights[z] && x >= 0 && x < heights[z].length) {
        heights[z][x] = Math.min(heights[z][x], floor);
      }
    }
  }
}

/**
 * Solid slab with a regular grid of identical through-holes.
 * Volume = W×D×H − holesX×holesZ×hw×hd×H.
 */
function makeHoles(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const holesX = r(rng, 2, 3);
    const holesZ = r(rng, 2, 3);
    const hw = r(rng, 1, 3);
    const hd = r(rng, 1, 3);
    const rib = r(rng, 1, 2);
    const margin = r(rng, 1, 2);
    const H = r(rng, 2, 5);
    const innerW = holesX * hw + (holesX + 1) * rib;
    const innerD = holesZ * hd + (holesZ + 1) * rib;
    const W = innerW + 2 * margin;
    const D = innerD + 2 * margin;
    const n = W * D * H - holesX * holesZ * hw * hd * H;
    if (!inBand(n)) continue;
    const heights = empty(W, D);
    raiseRect(heights, 0, 0, W, D, H);
    for (let iz = 0; iz < holesZ; iz++) {
      for (let ix = 0; ix < holesX; ix++) {
        punch(
          heights,
          margin + rib + ix * (hw + rib),
          margin + rib + iz * (hd + rib),
          hw,
          hd,
          0,
        );
      }
    }
    return heights;
  }
  return null;
}

/**
 * Solid slab with a regular grid of identical shallow wells (not through).
 * Volume = W×D×H − wellsX×wellsZ×ww×wd×(H − floor).
 */
function makeWells(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const wellsX = r(rng, 2, 3);
    const wellsZ = r(rng, 2, 3);
    const ww = r(rng, 1, 3);
    const wd = r(rng, 1, 3);
    const rib = r(rng, 1, 2);
    const margin = r(rng, 1, 2);
    const H = r(rng, 3, 6);
    const floor = r(rng, 1, Math.max(1, H - 2));
    const innerW = wellsX * ww + (wellsX + 1) * rib;
    const innerD = wellsZ * wd + (wellsZ + 1) * rib;
    const W = innerW + 2 * margin;
    const D = innerD + 2 * margin;
    const n = W * D * H - wellsX * wellsZ * ww * wd * (H - floor);
    if (!inBand(n)) continue;
    const heights = empty(W, D);
    raiseRect(heights, 0, 0, W, D, H);
    for (let iz = 0; iz < wellsZ; iz++) {
      for (let ix = 0; ix < wellsX; ix++) {
        punch(
          heights,
          margin + rib + ix * (ww + rib),
          margin + rib + iz * (wd + rib),
          ww,
          wd,
          floor,
        );
      }
    }
    return heights;
  }
  return null;
}

/**
 * Repeating arcade / colonnade: identical pillars with through-door gaps between.
 * Volume = (arches + 1) × pillarW × depth × H.
 */
function makeArcade(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const arches = r(rng, 3, 6);
    const pillarW = r(rng, 1, 3);
    const doorW = r(rng, 1, 3);
    const depth = r(rng, 3, 6);
    const H = r(rng, 3, 7);
    const W = arches * doorW + (arches + 1) * pillarW;
    const n = (arches + 1) * pillarW * depth * H;
    if (!inBand(n)) continue;
    const heights = empty(W, depth);
    let x = 0;
    for (let a = 0; a < arches; a++) {
      raiseRect(heights, x, 0, pillarW, depth, H);
      x += pillarW + doorW; // skip the empty door hole
    }
    raiseRect(heights, x, 0, pillarW, depth, H);
    return heights;
  }
  return null;
}

/**
 * Checkerboard of solid towers and empty holes (repetitive voids).
 * Volume = solid cells × cellW × cellD × H  (or full − empty cells).
 */
function makeChecker(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const cellsX = r(rng, 3, 6);
    const cellsZ = r(rng, 3, 6);
    const cw = r(rng, 1, 3);
    const cd = r(rng, 1, 3);
    const H = r(rng, 2, 6);
    const phase = r(rng, 0, 1); // which color is solid
    let solids = 0;
    for (let z = 0; z < cellsZ; z++) {
      for (let x = 0; x < cellsX; x++) {
        if ((x + z) % 2 === phase) solids++;
      }
    }
    const n = solids * cw * cd * H;
    if (!inBand(n)) continue;
    const heights = empty(cellsX * cw, cellsZ * cd);
    for (let z = 0; z < cellsZ; z++) {
      for (let x = 0; x < cellsX; x++) {
        if ((x + z) % 2 === phase) {
          raiseRect(heights, x * cw, z * cd, cw, cd, H);
        }
      }
    }
    return heights;
  }
  return null;
}

/**
 * One big block minus one centered rectangular through-hole.
 * Volume = W×D×H − hw×hd×H.
 */
function makeCutout(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const W = r(rng, 7, 16);
    const D = r(rng, 6, 14);
    const H = r(rng, 2, 6);
    const hw = r(rng, Math.max(2, Math.floor(W / 4)), Math.floor(W / 2));
    const hd = r(rng, Math.max(2, Math.floor(D / 4)), Math.floor(D / 2));
    if (hw >= W - 2 || hd >= D - 2) continue;
    const n = W * D * H - hw * hd * H;
    if (!inBand(n)) continue;
    const heights = empty(W, D);
    raiseRect(heights, 0, 0, W, D, H);
    punch(heights, Math.floor((W - hw) / 2), Math.floor((D - hd) / 2), hw, hd, 0);
    return heights;
  }
  return null;
}

/**
 * Big block minus a corner chunk → L-shape.
 * Volume = W×D×H − cw×cd×H.
 */
function makeCorner(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const W = r(rng, 7, 14);
    const D = r(rng, 6, 12);
    const H = r(rng, 2, 6);
    const cw = r(rng, Math.max(2, Math.floor(W / 4)), Math.floor(W / 2));
    const cd = r(rng, Math.max(2, Math.floor(D / 4)), Math.floor(D / 2));
    if (cw < 2 || cd < 2 || cw >= W || cd >= D) continue;
    const n = W * D * H - cw * cd * H;
    if (!inBand(n)) continue;
    const heights = empty(W, D);
    raiseRect(heights, 0, 0, W, D, H);
    // Cut from a random corner.
    const corner = r(rng, 0, 3);
    const x0 = corner === 1 || corner === 2 ? W - cw : 0;
    const z0 = corner === 2 || corner === 3 ? D - cd : 0;
    punch(heights, x0, z0, cw, cd, 0);
    return heights;
  }
  return null;
}

/**
 * Solid slab minus parallel through-trenches (repeating slots).
 * Volume = W×D×H − trenches × tw × D × H  (trenches run full depth).
 */
function makeTrench(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const trenches = r(rng, 2, 4);
    const tw = r(rng, 1, 2);
    const rib = r(rng, 1, 3);
    const margin = r(rng, 1, 3);
    const D = r(rng, 4, 10);
    const H = r(rng, 2, 5);
    const W = 2 * margin + trenches * tw + (trenches + 1) * rib;
    const n = W * D * H - trenches * tw * D * H;
    if (!inBand(n)) continue;
    const heights = empty(W, D);
    raiseRect(heights, 0, 0, W, D, H);
    for (let i = 0; i < trenches; i++) {
      punch(heights, margin + rib + i * (tw + rib), 0, tw, D, 0);
    }
    return heights;
  }
  return null;
}

/**
 * Comb: solid slab with identical notches cut from one side (edge holes).
 * Volume = W×D×H − notches × nw × nd × H.
 */
function makeSlots(rng) {
  for (let tries = 0; tries < 80; tries++) {
    const notches = r(rng, 2, 5);
    const nw = r(rng, 1, 3);
    const nd = r(rng, 2, 5);
    const rib = r(rng, 1, 3);
    const margin = r(rng, 1, 3);
    const back = r(rng, 2, 5); // uncut depth behind the notches
    const H = r(rng, 2, 5);
    const W = 2 * margin + notches * nw + (notches - 1) * rib;
    const D = nd + back;
    const n = W * D * H - notches * nw * nd * H;
    if (!inBand(n)) continue;
    const heights = empty(W, D);
    raiseRect(heights, 0, 0, W, D, H);
    for (let i = 0; i < notches; i++) {
      punch(heights, margin + i * (nw + rib), 0, nw, nd, 0);
    }
    return heights;
  }
  return null;
}

const MAKERS = {
  rect: makeRect,
  stairs: makeStairs,
  pyramid: makePyramid,
  ridge: makeRidge,
  blocks: makeBlocks,
  platform: makePlatform,
  frame: makeFrame,
  city: makeCity,
  skyline: makeSkyline,
  labyrinth: makeLabyrinth,
  spiral: makeSpiral,
  holes: makeHoles,
  wells: makeWells,
  arcade: makeArcade,
  checker: makeChecker,
  cutout: makeCutout,
  corner: makeCorner,
  trench: makeTrench,
  slots: makeSlots,
};

function makeHeights(rng, pattern) {
  const maker = MAKERS[pattern] || makeRect;
  const heights = maker(rng);
  return heights ? trim(heights) : null;
}

export const cubeCount = (cubes) => cubes.heights.flat().reduce((n, v) => n + v, 0);
export const cubeVolume = (cubes) => cubeCount(cubes) * cubes.edge ** 3;

function questionsFor([stage, patterns, count, lo = 100, hi = 300], seed) {
  bandLo = lo;
  bandHi = hi;
  const rng = mulberry32(seed);
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < count && guard++ < 4000) {
    const pattern = patterns[out.length % patterns.length];
    const heights = makeHeights(rng, pattern);
    if (!heights) continue;
    const key = JSON.stringify(heights);
    const cubes = {edge: 1, heights};
    const n = cubeCount(cubes);
    if (seen.has(key) || !inBand(n)) continue;
    seen.add(key);
    const edge = cubes.edge;
    const reduction = REDUCTION.has(pattern);
    out.push({
      id: `cubes-${stage}-${out.length + 1}`,
      text: reduction
        ? `Every cube is ${edge ** 3} cm³, what's left? (big block − holes)`
        : `Every cube is ${edge ** 3} cm³, what's the total volume of this?`,
      textZh: reduction
        ? `每个小正方体是 ${edge ** 3} cm³，还剩多少？（大长方体 − 挖空）`
        : `每个小正方体是 ${edge ** 3} cm³，总体积是多少？`,
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
