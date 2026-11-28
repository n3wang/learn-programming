/**
 * Shared game-theory helpers for the Game Theory track
 * (fundamentals/international-business/game-theory).
 *
 * Bimatrix convention: payoffs[r][c] = [u1, u2]
 * (row player = Player 1, column player = Player 2).
 */

export const P1_COLOR = '#2563eb';
export const P2_COLOR = '#dc2626';
export const NE_COLOR = '#16a34a';

const EPS = 1e-9;

/** Pretty number: integers plain, common fractions as a/b, else 2 dp. */
export function fmt(x) {
  if (x === null || x === undefined || Number.isNaN(x)) return '—';
  if (Math.abs(x - Math.round(x)) < EPS) return String(Math.round(x));
  for (const d of [2, 3, 4, 5, 6, 8]) {
    const n = x * d;
    if (Math.abs(n - Math.round(n)) < 1e-7) {
      return `${Math.round(n)}/${d}`;
    }
  }
  return x.toFixed(2);
}

/** Fixed decimals with minus sign trimmed for -0. */
export function fx(x, d = 2) {
  const s = Number(x).toFixed(d);
  return s === `-${(0).toFixed(d)}` ? (0).toFixed(d) : s;
}

/** Best responses of Player 1 to each column, restricted to live rows. */
export function bestRows(payoffs, liveRows, c) {
  let best = -Infinity;
  for (const r of liveRows) best = Math.max(best, payoffs[r][c][0]);
  return new Set(liveRows.filter((r) => Math.abs(payoffs[r][c][0] - best) < EPS));
}

/** Best responses of Player 2 to each row, restricted to live cols. */
export function bestCols(payoffs, liveCols, r) {
  let best = -Infinity;
  for (const c of liveCols) best = Math.max(best, payoffs[r][c][1]);
  return new Set(liveCols.filter((c) => Math.abs(payoffs[r][c][1] - best) < EPS));
}

/** All pure-strategy Nash equilibria as "r,c" keys. */
export function pureNash(payoffs) {
  const R = payoffs.length;
  const C = payoffs[0].length;
  const rows = [...Array(R).keys()];
  const cols = [...Array(C).keys()];
  const out = new Set();
  for (const r of rows) {
    const bc = bestCols(payoffs, cols, r);
    for (const c of cols) {
      if (bc.has(c) && bestRows(payoffs, rows, c).has(r)) out.add(`${r},${c}`);
    }
  }
  return out;
}

const MIX_WEIGHTS = [1 / 2, 1 / 3, 2 / 3, 1 / 4, 3 / 4, ...Array.from({length: 99}, (_, i) => (i + 1) / 100)];

/**
 * Like iesdsStep, but when no pure strategy dominates, also tries mixtures of
 * two other live strategies (weights from simple fractions, then a 1% grid).
 */
export function iesdsStepMixed(payoffs, liveRows, liveCols, rowNames, colNames) {
  const pure = iesdsStep(payoffs, liveRows, liveCols, rowNames, colNames);
  if (pure) return pure;
  const u1 = (r, c) => payoffs[r][c][0];
  const u2 = (r, c) => payoffs[r][c][1];
  for (const r of liveRows) {
    for (const a of liveRows) {
      for (const b of liveRows) {
        if (a >= b || a === r || b === r) continue;
        for (const w of MIX_WEIGHTS) {
          if (liveCols.every((c) => w * u1(a, c) + (1 - w) * u1(b, c) > u1(r, c) + EPS)) {
            const detail = liveCols
              .map((c) => `${colNames[c]}: ${fmt(w * u1(a, c) + (1 - w) * u1(b, c))} > ${fmt(u1(r, c))}`)
              .join(', ');
            return {
              player: 1,
              index: r,
              text: `Player 1: ${rowNames[r]} is strictly dominated by the mixture ${fmt(w)}·${rowNames[a]} + ${fmt(1 - w)}·${rowNames[b]} (${detail}). No pure strategy dominates it.`,
            };
          }
        }
      }
    }
  }
  for (const c of liveCols) {
    for (const a of liveCols) {
      for (const b of liveCols) {
        if (a >= b || a === c || b === c) continue;
        for (const w of MIX_WEIGHTS) {
          if (liveRows.every((r) => w * u2(r, a) + (1 - w) * u2(r, b) > u2(r, c) + EPS)) {
            const detail = liveRows
              .map((r) => `${rowNames[r]}: ${fmt(w * u2(r, a) + (1 - w) * u2(r, b))} > ${fmt(u2(r, c))}`)
              .join(', ');
            return {
              player: 2,
              index: c,
              text: `Player 2: ${colNames[c]} is strictly dominated by the mixture ${fmt(w)}·${colNames[a]} + ${fmt(1 - w)}·${colNames[b]} (${detail}). No pure strategy dominates it.`,
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * One step of iterated elimination of strictly dominated strategies
 * (by another pure strategy). Returns null when nothing can be removed.
 */
export function iesdsStep(payoffs, liveRows, liveCols, rowNames, colNames) {
  for (const r of liveRows) {
    for (const r2 of liveRows) {
      if (r2 === r) continue;
      if (liveCols.every((c) => payoffs[r2][c][0] > payoffs[r][c][0] + EPS)) {
        const detail = liveCols
          .map((c) => `${colNames[c]}: ${fmt(payoffs[r2][c][0])} > ${fmt(payoffs[r][c][0])}`)
          .join(', ');
        return {player: 1, index: r, by: r2, text: `Player 1: ${rowNames[r]} is strictly dominated by ${rowNames[r2]} (${detail}).`};
      }
    }
  }
  for (const c of liveCols) {
    for (const c2 of liveCols) {
      if (c2 === c) continue;
      if (liveRows.every((r) => payoffs[r][c2][1] > payoffs[r][c][1] + EPS)) {
        const detail = liveRows
          .map((r) => `${rowNames[r]}: ${fmt(payoffs[r][c2][1])} > ${fmt(payoffs[r][c][1])}`)
          .join(', ');
        return {player: 2, index: c, by: c2, text: `Player 2: ${colNames[c]} is strictly dominated by ${colNames[c2]} (${detail}).`};
      }
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Extensive-form trees                                                */
/* ------------------------------------------------------------------ */
/*
 * Node shapes:
 *   decision: { id, player: 1 | 2, info: 'h1', moves: [{ label, to: node }] }
 *   nature:   { id, player: 'N', moves: [{ label, prob, to: node }] }
 *   terminal: { id, payoff: [u1, u2] }
 */

export function isTerminal(n) {
  return Array.isArray(n.payoff);
}

/** Walk the tree, collecting nodes with depth and info-set membership. */
export function collect(root) {
  const nodes = [];
  const walk = (n, depth, parent) => {
    nodes.push({node: n, depth, parent});
    if (!isTerminal(n)) n.moves.forEach((m) => walk(m.to, depth + 1, n));
  };
  walk(root, 0, null);
  return nodes;
}

/** Info sets per player in first-appearance order: [{ id, player, moves:[labels], nodeIds:[...] }] */
export function infoSets(root) {
  const map = new Map();
  for (const {node} of collect(root)) {
    if (isTerminal(node) || node.player === 'N') continue;
    const key = node.info || node.id;
    if (!map.has(key)) map.set(key, {id: key, player: node.player, moves: node.moves.map((m) => m.label), nodeIds: []});
    map.get(key).nodeIds.push(node.id);
  }
  return [...map.values()];
}

export function isPerfectInfo(root) {
  return infoSets(root).every((h) => h.nodeIds.length === 1);
}

/** All pure strategies of a player: arrays of move labels, one per info set (in order). */
export function strategiesOf(root, player) {
  const hs = infoSets(root).filter((h) => h.player === player);
  let acc = [[]];
  for (const h of hs) {
    const next = [];
    for (const partial of acc) for (const mv of h.moves) next.push([...partial, mv]);
    acc = next;
  }
  return {sets: hs, list: acc};
}

export function strategyName(moves) {
  if (moves.length === 0) return '—';
  const allShort = moves.every((m) => m.length <= 2);
  return moves.join(allShort ? '' : '·');
}

/**
 * Expected payoff and reached-node probabilities for a pure profile.
 * plan[player] = { [infoSetId]: moveLabel }
 */
export function playOut(root, plan) {
  const reach = new Map();
  const payoff = [0, 0];
  const walk = (n, prob) => {
    if (prob <= 0) return;
    reach.set(n.id, (reach.get(n.id) || 0) + prob);
    if (isTerminal(n)) {
      payoff[0] += prob * n.payoff[0];
      payoff[1] += prob * n.payoff[1];
      return;
    }
    if (n.player === 'N') {
      n.moves.forEach((m) => walk(m.to, prob * m.prob));
      return;
    }
    const choice = plan[n.player]?.[n.info || n.id];
    const mv = n.moves.find((m) => m.label === choice) || n.moves[0];
    walk(mv.to, prob);
  };
  walk(root, 1);
  return {payoff, reach};
}

/** Normal form of an extensive game. */
export function normalForm(root) {
  const s1 = strategiesOf(root, 1);
  const s2 = strategiesOf(root, 2);
  const planOf = (sets, moves) => Object.fromEntries(sets.map((h, i) => [h.id, moves[i]]));
  const payoffs = s1.list.map((m1) =>
    s2.list.map((m2) => playOut(root, {1: planOf(s1.sets, m1), 2: planOf(s2.sets, m2)}).payoff),
  );
  return {
    rows: s1.list.map(strategyName),
    cols: s2.list.map(strategyName),
    payoffs,
    s1,
    s2,
  };
}

/** Backward induction for perfect-information trees (ties → first move). */
export function backwardInduction(root) {
  const choice = new Map();
  const value = new Map();
  const solve = (n) => {
    if (isTerminal(n)) {
      value.set(n.id, n.payoff);
      return n.payoff;
    }
    if (n.player === 'N') {
      const v = [0, 0];
      n.moves.forEach((m) => {
        const w = solve(m.to);
        v[0] += m.prob * w[0];
        v[1] += m.prob * w[1];
      });
      value.set(n.id, v);
      return v;
    }
    let best = null;
    let bestMove = null;
    n.moves.forEach((m) => {
      const w = solve(m.to);
      if (!best || w[n.player - 1] > best[n.player - 1] + EPS) {
        best = w;
        bestMove = m.label;
      }
    });
    choice.set(n.id, bestMove);
    value.set(n.id, best);
    return best;
  };
  solve(root);
  return {choice, value};
}

/** Tiny seeded RNG (mulberry32) so simulations are reproducible per seed. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shared small styles. */
export const btn = (active) => ({
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid var(--ifm-color-emphasis-400)',
  background: active ? 'var(--ifm-color-primary)' : 'var(--ifm-background-surface-color)',
  color: active ? '#fff' : 'var(--ifm-font-color-base)',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
});

export const note = {
  fontSize: 13,
  color: 'var(--ifm-color-emphasis-700)',
  margin: '6px 0',
};
