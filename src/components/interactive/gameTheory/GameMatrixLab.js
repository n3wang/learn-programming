import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import Bimatrix from './Bimatrix';
import {P1_COLOR, P2_COLOR, NE_COLOR, fmt, fx, pureNash, iesdsStep, iesdsStepMixed, btn, note} from './gtCore';

const pair = (a, b) => [a, b];

/** Presets: rows/cols/payoffs, optional params → build(). */
const PRESETS = {
  iesds: {
    title: 'Thinking about thinking: iterated dominance',
    subtitle: 'Step through the elimination. Each step needs one more layer of "I know that you know that I am rational".',
    rows: ['Up', 'Mid', 'Down'],
    cols: ['Left', 'Center', 'Right'],
    payoffs: [
      [pair(1, 1), pair(0, 3), pair(3, 1)],
      [pair(2, 3), pair(1, 1), pair(0, 0)],
      [pair(1, 0), pair(0, 0), pair(-1, 2)],
    ],
    modes: ['iesds', 'br', 'guess'],
  },
  coordination: {
    title: 'Pure coordination: where do we meet?',
    subtitle: 'Both players only care about meeting. Find every stable profile.',
    rows: ['Café', 'Library'],
    cols: ['Café', 'Library'],
    payoffs: [
      [pair(1, 1), pair(0, 0)],
      [pair(0, 0), pair(1, 1)],
    ],
    modes: ['guess', 'br', 'belief'],
  },
  bos: {
    title: 'Coordination with conflict (Battle of the Sexes)',
    subtitle: 'Both want to be together, but each prefers a different venue.',
    rows: ['Opera', 'Football'],
    cols: ['Opera', 'Football'],
    payoffs: [
      [pair(2, 1), pair(0, 0)],
      [pair(0, 0), pair(1, 2)],
    ],
    modes: ['guess', 'br', 'belief'],
  },
  pd: {
    title: "Prisoners' Dilemma: two exporters and a price war",
    subtitle: 'Hold the price (cooperate) or undercut (defect)? Rationality alone pushes both to the worse outcome.',
    rows: ['Hold price', 'Undercut'],
    cols: ['Hold price', 'Undercut'],
    payoffs: [
      [pair(3, 3), pair(0, 5)],
      [pair(5, 0), pair(1, 1)],
    ],
    modes: ['iesds', 'br', 'guess'],
  },
  hawkDove: {
    title: 'Hawk–Dove: fight over a contract worth V',
    subtitle: 'Fighting costs each side C/2. Move the sliders across V = C and watch the game change type.',
    rows: ['Hawk', 'Dove'],
    cols: ['Hawk', 'Dove'],
    params: [
      {key: 'V', label: 'Value of the prize V', min: 1, max: 10, step: 1, def: 4},
      {key: 'C', label: 'Cost of a fight C', min: 0, max: 12, step: 1, def: 8},
    ],
    build: ({V, C}) => [
      [pair((V - C) / 2, (V - C) / 2), pair(V, 0)],
      [pair(0, V), pair(V / 2, V / 2)],
    ],
    modes: ['br', 'iesds', 'guess'],
  },
  investment: {
    title: 'Investment game: skills meet technology',
    subtitle: 'A worker (rows) decides whether to train; a firm (columns) decides whether to buy machines that need trained workers.',
    rows: ['Invest', "Don't"],
    cols: ['Invest', "Don't"],
    params: [
      {key: 'theta', label: 'Return when both invest θ', min: -2, max: 6, step: 1, def: 3},
      {key: 'c', label: 'Loss from investing alone c', min: 0, max: 8, step: 1, def: 4},
    ],
    build: ({theta, c}) => [
      [pair(theta, theta), pair(theta - c, 0)],
      [pair(0, theta - c), pair(0, 0)],
    ],
    modes: ['br', 'belief', 'iesds'],
  },
  beliefs: {
    title: 'From beliefs to choices',
    subtitle: 'Only Player 1\'s payoffs matter here. Slide the belief and find the switching point.',
    rows: ['T', 'B'],
    cols: ['L', 'R'],
    payoffs: [
      [pair(3, 0), pair(-1, 0)],
      [pair(0, 0), pair(0, 0)],
    ],
    modes: ['belief'],
  },
  mixedDom: {
    title: 'Never a best response = dominated (by a mixture)',
    subtitle: 'Middle is never Player 1’s best reply — yet no single pure strategy beats it. Check the belief chart, then eliminate.',
    rows: ['Top', 'Middle', 'Bottom'],
    cols: ['Left', 'Right'],
    payoffs: [
      [pair(3, 1), pair(0, 0)],
      [pair(1, 0), pair(1, 2)],
      [pair(0, 0), pair(3, 1)],
    ],
    mixed: true,
    modes: ['belief', 'iesds', 'br'],
  },
  weakDom: {
    title: 'Weak dominance and a fragile equilibrium',
    subtitle: 'Up never does worse than Down and sometimes better. Does that rule Down out as an equilibrium choice?',
    rows: ['Up', 'Down'],
    cols: ['Left', 'Right'],
    payoffs: [
      [pair(1, 1), pair(0, 0)],
      [pair(0, 0), pair(0, 0)],
    ],
    modes: ['br', 'iesds', 'guess'],
  },
  rationalize: {
    title: 'Rationalizability: elimination that needs mixtures',
    subtitle: 'Each round removes a strategy that is not a best response to any belief about the surviving strategies.',
    rows: ['a', 'b', 'c'],
    cols: ['x', 'y', 'z'],
    payoffs: [
      [pair(4, 3), pair(0, 0), pair(1, 1)],
      [pair(0, 0), pair(4, 3), pair(1, 1)],
      [pair(1, 2), pair(1, 2), pair(5, 1)],
    ],
    mixed: true,
    modes: ['iesds', 'br', 'guess'],
  },
  pdRepeated: {
    title: 'The stage game',
    subtitle: 'Cooperate (C) or Defect (D). Defect strictly dominates — in a single round.',
    rows: ['C', 'D'],
    cols: ['C', 'D'],
    payoffs: [
      [pair(5, 5), pair(0, 7)],
      [pair(7, 0), pair(1, 1)],
    ],
    modes: ['br', 'iesds'],
  },
  matchingNormal: {
    title: 'Matching pennies when Player 2 can see the coin',
    subtitle: 'Player 2 wins when the coins match. Her strategies are plans: "what I do after Heads / after Tails".',
    rows: ['Heads', 'Tails'],
    cols: ['HH', 'HT', 'TH', 'TT'],
    payoffs: [
      [pair(-1, 1), pair(-1, 1), pair(1, -1), pair(1, -1)],
      [pair(1, -1), pair(-1, 1), pair(1, -1), pair(-1, 1)],
    ],
    modes: ['br', 'iesds', 'guess'],
  },
};

const MODE_LABEL = {
  br: 'Best responses',
  iesds: 'Eliminate dominated',
  guess: 'Find the equilibria',
  belief: 'Beliefs → choice',
};

function BeliefChart({rows, payoffs, q, setQ}) {
  const W = 320;
  const H = 180;
  const pad = 30;
  const vals = payoffs.flatMap((row) => [row[0][0], row[1][0]]);
  const lo = Math.min(0, ...vals);
  const hi = Math.max(1, ...vals);
  const X = (t) => pad + t * (W - 2 * pad);
  const Y = (v) => H - pad - ((v - lo) / (hi - lo || 1)) * (H - 2 * pad);
  const eu = payoffs.map((row) => q * row[0][0] + (1 - q) * row[1][0]);
  const best = Math.max(...eu);
  const palette = [P1_COLOR, '#9333ea', '#ea580c', '#0891b2'];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: 420, display: 'block'}}>
        <line x1={pad} y1={Y(0)} x2={W - pad} y2={Y(0)} stroke="var(--ifm-color-emphasis-400)" />
        <line x1={pad} y1={pad / 2} x2={pad} y2={H - pad} stroke="var(--ifm-color-emphasis-400)" />
        {payoffs.map((row, i) => (
          <g key={i}>
            <line x1={X(0)} y1={Y(row[1][0])} x2={X(1)} y2={Y(row[0][0])} stroke={palette[i % 4]} strokeWidth={2.5} />
            <text x={X(1) + 3} y={Y(row[0][0]) + 4} fontSize="11" fill={palette[i % 4]}>
              {rows[i]}
            </text>
          </g>
        ))}
        <line x1={X(q)} y1={pad / 2} x2={X(q)} y2={H - pad} stroke="var(--ifm-color-emphasis-600)" strokeDasharray="4 3" />
        <text x={X(0)} y={H - 10} fontSize="10" fill="var(--ifm-font-color-base)">q = 0</text>
        <text x={X(1) - 24} y={H - 10} fontSize="10" fill="var(--ifm-font-color-base)">q = 1</text>
      </svg>
      <label style={{fontSize: 14}}>
        Belief that Player 2 plays the first column, q = <b>{fx(q, 2)}</b>{' '}
        <input type="range" min={0} max={1} step={0.01} value={q} onChange={(e) => setQ(Number(e.target.value))} style={{width: 200, verticalAlign: 'middle'}} />
      </label>
      <div style={{fontSize: 14, marginTop: 6}}>
        {rows.map((r, i) => (
          <div key={r} style={{fontWeight: Math.abs(eu[i] - best) < 1e-9 ? 800 : 400, color: palette[i % 4]}}>
            E[u₁({r})] = {fx(q, 2)}·{fmt(payoffs[i][0][0])} + {fx(1 - q, 2)}·{fmt(payoffs[i][1][0])} = {fx(eu[i], 3)}
            {Math.abs(eu[i] - best) < 1e-9 ? '  ← best response' : ''}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GameMatrixLab({preset = 'iesds'}) {
  const P = PRESETS[preset] || PRESETS.iesds;
  const [params, setParams] = useState(() => Object.fromEntries((P.params || []).map((p) => [p.key, p.def])));
  const payoffs = useMemo(() => (P.build ? P.build(params) : P.payoffs), [P, params]);
  const [mode, setMode] = useState(P.modes[0]);
  const [elim, setElim] = useState({rows: new Set(), cols: new Set(), log: []});
  const {rows: removedRows, cols: removedCols, log} = elim;
  const [marked, setMarked] = useState(new Set());
  const [checked, setChecked] = useState(null);
  const [q, setQ] = useState(0.5);

  const ne = useMemo(() => pureNash(payoffs), [payoffs]);

  const STOP = `Nothing else is strictly dominated by a ${P.mixed ? 'pure or mixed' : 'pure'} strategy. Elimination stops here.`;
  const resetElim = () => setElim({rows: new Set(), cols: new Set(), log: []});

  const step = () =>
    setElim((e) => {
      if (e.log[e.log.length - 1] === STOP) return e;
      const live = (n, rem) => [...Array(n).keys()].filter((i) => !rem.has(i));
      const st = (P.mixed ? iesdsStepMixed : iesdsStep)(payoffs, live(P.rows.length, e.rows), live(P.cols.length, e.cols), P.rows, P.cols);
      if (!st) return {...e, log: [...e.log, STOP]};
      return {
        rows: st.player === 1 ? new Set([...e.rows, st.index]) : e.rows,
        cols: st.player === 2 ? new Set([...e.cols, st.index]) : e.cols,
        log: [...e.log, st.text],
      };
    });

  const done = log.length > 0 && log[log.length - 1] === STOP;

  const toggleMark = (i, j) => {
    const k = `${i},${j}`;
    setChecked(null);
    setMarked((m) => {
      const n = new Set(m);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  };

  const check = () => {
    const missing = [...ne].filter((k) => !marked.has(k));
    const extra = [...marked].filter((k) => !ne.has(k));
    setChecked({missing, extra});
  };

  const name = (k) => {
    const [i, j] = k.split(',').map(Number);
    return `(${P.rows[i]}, ${P.cols[j]})`;
  };

  return (
    <CEBlock title={P.title} subtitle={P.subtitle}>
      {P.params && (
        <CEBlock.Section label="Parameters">
          {P.params.map((p) => (
            <label key={p.key} style={{display: 'block', fontSize: 14, marginBottom: 4}}>
              {p.label} = <b>{params[p.key]}</b>{' '}
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.step}
                value={params[p.key]}
                onChange={(e) => {
                  setParams((x) => ({...x, [p.key]: Number(e.target.value)}));
                  resetElim();
                  setChecked(null);
                }}
                style={{width: 180, verticalAlign: 'middle'}}
              />
            </label>
          ))}
        </CEBlock.Section>
      )}

      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6}}>
        {P.modes.map((m) => (
          <button key={m} type="button" style={btn(mode === m)} onClick={() => setMode(m)}>
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <Bimatrix
        rows={P.rows}
        cols={P.cols}
        payoffs={payoffs}
        showBR={mode === 'br' || (mode === 'guess' && checked !== null)}
        removedRows={mode === 'iesds' ? removedRows : new Set()}
        removedCols={mode === 'iesds' ? removedCols : new Set()}
        marked={mode === 'guess' ? marked : null}
        onCellClick={mode === 'guess' ? toggleMark : null}
      />

      {mode === 'br' && (
        <div style={note}>
          <b style={{color: P1_COLOR}}>Blue underline</b> = Player 1&apos;s best payoff in that column.{' '}
          <b style={{color: P2_COLOR}}>Red underline</b> = Player 2&apos;s best payoff in that row.{' '}
          <b style={{color: NE_COLOR}}>★</b> = both are best-responding: a (pure) Nash equilibrium.{' '}
          {ne.size === 0 ? 'This game has no pure-strategy equilibrium.' : `Pure equilibria: ${[...ne].map(name).join(', ')}.`}
        </div>
      )}

      {mode === 'iesds' && (
        <div>
          <div style={{display: 'flex', gap: 6, margin: '6px 0'}}>
            <button type="button" style={btn(false)} onClick={step} disabled={done}>
              Next elimination step
            </button>
            <button type="button" style={btn(false)} onClick={resetElim}>
              Reset
            </button>
          </div>
          <ol style={{fontSize: 14, margin: '4px 0 0 18px'}}>
            {log.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
          {done && (
            <div style={{...note, fontWeight: 600}}>
              Surviving profile(s):{' '}
              {P.rows.filter((_, i) => !removedRows.has(i)).join(' / ')} × {P.cols.filter((_, j) => !removedCols.has(j)).join(' / ')}
            </div>
          )}
        </div>
      )}

      {mode === 'guess' && (
        <div>
          <div style={note}>Click every cell you think is a Nash equilibrium (no player gains by deviating alone), then check.</div>
          <button type="button" style={btn(false)} onClick={check}>
            Check my answer
          </button>{' '}
          <button
            type="button"
            style={btn(false)}
            onClick={() => {
              setMarked(new Set());
              setChecked(null);
            }}
          >
            Clear
          </button>
          {checked && (
            <div style={{marginTop: 6, fontSize: 14}}>
              {checked.missing.length === 0 && checked.extra.length === 0 ? (
                <span style={{color: NE_COLOR, fontWeight: 700}}>
                  ✓ Correct.{' '}
                  {ne.size === 0 ? 'There is no pure equilibrium.' : `Equilibria: ${[...ne].map(name).join(', ')}.`}
                </span>
              ) : (
                <span>
                  {checked.extra.length > 0 && (
                    <div style={{color: P2_COLOR}}>
                      Not equilibria: {checked.extra.map(name).join(', ')} — at least one player has a profitable deviation (look for a payoff that is not underlined).
                    </div>
                  )}
                  {checked.missing.length > 0 && <div style={{color: P2_COLOR}}>You missed {checked.missing.length} equilibrium cell(s).</div>}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {mode === 'belief' && P.cols.length === 2 && <BeliefChart rows={P.rows} payoffs={payoffs} q={q} setQ={setQ} />}
    </CEBlock>
  );
}
