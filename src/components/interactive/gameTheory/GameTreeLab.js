import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import Bimatrix from './Bimatrix';
import {
  P1_COLOR,
  P2_COLOR,
  NE_COLOR,
  fmt,
  isTerminal,
  collect,
  infoSets,
  isPerfectInfo,
  strategiesOf,
  strategyName,
  playOut,
  normalForm,
  backwardInduction,
  btn,
  note,
} from './gtCore';

/* ---------- tiny tree builders ---------- */
const T = (id, a, b) => ({id, payoff: [a, b]});
const D = (id, player, info, moves) => ({id, player, info, moves: moves.map(([label, to]) => ({label, to}))});
const N = (id, moves) => ({id, player: 'N', moves: moves.map(([label, prob, to]) => ({label, prob, to}))});

const bos = (p2infoA, p2infoB) =>
  D('n0', 1, 'h1', [
    ['Opera', D('n1', 2, p2infoA, [['Opera', T('t1', 2, 1)], ['Football', T('t2', 0, 0)]])],
    ['Football', D('n2', 2, p2infoB, [['Opera', T('t3', 0, 0)], ['Football', T('t4', 1, 2)]])],
  ]);

const pennies = (a, b) =>
  D('n0', 1, 'h1', [
    ['H', D('n1', 2, a, [['H', T('t1', -1, 1)], ['T', T('t2', 1, -1)]])],
    ['T', D('n2', 2, b, [['H', T('t3', 1, -1)], ['T', T('t4', -1, 1)]])],
  ]);

const PRESETS = {
  bos: {
    title: 'Who moves first matters',
    subtitle: 'Same payoffs, two information structures. Toggle what Player 2 can see.',
    variants: [
      {label: 'Player 2 sees Player 1’s choice', tree: bos('h2a', 'h2b')},
      {label: 'Simultaneous (Player 2 cannot see)', tree: bos('h2', 'h2')},
    ],
    infoLabels: {h1: 'Player 1 chooses', h2a: 'Player 2 after seeing Opera', h2b: 'Player 2 after seeing Football', h2: 'Player 2 (does not know P1’s move)'},
  },
  pennies: {
    title: 'Matching pennies: one ellipse changes everything',
    subtitle: 'Player 2 wins (+1) when the coins match. Compare the strategy sets in the two versions.',
    variants: [
      {label: 'Perfect information', tree: pennies('h2a', 'h2b')},
      {label: 'Imperfect (simultaneous)', tree: pennies('h2', 'h2')},
    ],
    infoLabels: {h1: 'Player 1 chooses', h2a: 'Player 2 after H', h2b: 'Player 2 after T', h2: 'Player 2 (cannot see)'},
  },
  exit: {
    title: 'An outside option before the coordination game',
    subtitle: 'Player 1 may Exit for 3/2 each, or Play the simultaneous Opera/Football game.',
    variants: [
      {
        label: 'Exit option',
        tree: D('n0', 1, 'h0', [
          ['Exit', T('t0', 1.5, 1.5)],
          [
            'Play',
            D('n1', 1, 'h1', [
              ['Opera', D('n2', 2, 'h2', [['Opera', T('t1', 2, 1)], ['Football', T('t2', 0, 0)]])],
              ['Football', D('n3', 2, 'h2', [['Opera', T('t3', 0, 0)], ['Football', T('t4', 1, 2)]])],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {h0: 'Player 1: Exit or Play', h1: 'Player 1 in the game', h2: 'Player 2 (sees Play, not P1’s venue)'},
  },
  entry: {
    title: 'Market entry: plans for nodes you never reach',
    subtitle: 'An entrant (P1) decides whether to enter a foreign market; the incumbent (P2) may fight a price war.',
    names: ['Entrant', 'Incumbent'],
    variants: [
      {
        label: 'Entry game',
        tree: D('n0', 1, 'h0', [
          ['Out', T('t0', 0, 5)],
          [
            'In',
            D('n1', 2, 'h1', [
              ['Fight', T('t1', -1, 0)],
              ['Accommodate', D('n2', 1, 'h2', [['Big', T('t2', 3, 1)], ['Small', T('t3', 2, 2)]])],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {h0: 'Entrant: enter?', h1: 'Incumbent after entry', h2: 'Entrant after accommodation: plant size'},
  },
  centipede: {
    title: 'Take or pass',
    subtitle: 'Passing grows the pot, but whoever takes grabs the bigger share at that moment.',
    variants: [
      {
        label: 'Three-stage centipede',
        tree: D('n0', 1, 'h1', [
          ['Take', T('t0', 2, 0)],
          [
            'Pass',
            D('n1', 2, 'h2', [
              ['Take', T('t1', 1, 3)],
              ['Pass', D('n2', 1, 'h3', [['take', T('t2', 4, 2)], ['pass', T('t3', 3, 5)]])],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {h1: 'Player 1, stage 1', h2: 'Player 2, stage 2', h3: 'Player 1, stage 3'},
  },
  nature: {
    title: 'A coin decides who moves',
    subtitle: 'Nature tosses a fair coin. Heads: Player 1 chooses. Tails: Player 2 chooses.',
    variants: [
      {
        label: 'Game with chance',
        tree: N('n0', [
          ['Heads', 0.5, D('n1', 1, 'h1', [['Left', T('t1', 4, 1)], ['Right', T('t2', 1, 3)]])],
          ['Tails', 0.5, D('n2', 2, 'h2', [['Left', T('t3', 2, 2)], ['Right', T('t4', 0, 4)]])],
        ]),
      },
    ],
    infoLabels: {h1: 'Player 1 (after Heads)', h2: 'Player 2 (after Tails)'},
  },
  commitment: {
    title: 'The value of tying your own hands',
    subtitle: 'The incumbent can sign a binding long-term supply contract (commit to high output) before a rival decides whether to enter.',
    names: ['Incumbent', 'Entrant'],
    variants: [
      {
        label: 'Commit or stay flexible',
        tree: D('n0', 1, 'h0', [
          ['Commit', D('n1', 2, 'hC', [['Enter', T('t1', 1, -1)], ['Stay out', T('t2', 4, 0)]])],
          [
            'Flexible',
            D('n2', 2, 'hF', [
              ['Enter', D('n3', 1, 'h1', [['Fight', T('t3', 0, -2)], ['Accommodate', T('t4', 2, 1)]])],
              ['Stay out', T('t5', 5, 0)],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {h0: 'Incumbent: commit?', hC: 'Entrant after commitment', hF: 'Entrant, incumbent flexible', h1: 'Incumbent after entry'},
  },
  tie: {
    title: 'When a follower is indifferent',
    subtitle: 'Player 2 gets 1 whatever she does after Left. Backward induction alone cannot pick her move — and Player 1’s best choice depends on it.',
    variants: [
      {
        label: 'Indifferent follower',
        tree: D('n0', 1, 'h1', [
          ['Left', D('n1', 2, 'h2', [['x', T('t1', 2, 1)], ['y', T('t2', 0, 1)]])],
          ['Right', T('t3', 1, 0)],
        ]),
      },
    ],
    infoLabels: {h1: 'Player 1', h2: 'Player 2 after Left'},
  },
  entrySub: {
    title: 'Entry followed by a simultaneous price game',
    subtitle: 'After entry, both firms choose at the same time. The post-entry stage is a proper subgame — solve it first.',
    names: ['Entrant', 'Incumbent'],
    variants: [
      {
        label: 'Entry with a subgame',
        tree: D('n0', 1, 'h0', [
          ['Out', T('t0', 0, 4)],
          [
            'In',
            D('n1', 1, 'h1', [
              ['Soft', D('n2', 2, 'h2', [['Fight', T('t1', -1, 0)], ['Accommodate', T('t2', 2, 2)]])],
              ['Aggressive', D('n3', 2, 'h2', [['Fight', T('t3', -3, -1)], ['Accommodate', T('t4', 1, 1)]])],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {h0: 'Entrant: enter?', h1: 'Entrant’s post-entry pricing', h2: 'Incumbent (does not see the entrant’s pricing)'},
  },
  bayes: {
    title: 'A Bayesian game: does she want to meet you?',
    subtitle: 'Nature picks Player 2’s type (½ each). She knows it; Player 1 does not. Then both choose a venue simultaneously.',
    variants: [
      {
        label: 'Incomplete information',
        tree: N('n0', [
          [
            'Friendly',
            0.5,
            D('n1', 2, 'hFr', [
              ['Opera', D('n3', 1, 'h1', [['Opera', T('t1', 2, 1)], ['Football', T('t2', 0, 0)]])],
              ['Football', D('n4', 1, 'h1', [['Opera', T('t3', 0, 0)], ['Football', T('t4', 1, 2)]])],
            ]),
          ],
          [
            'Avoider',
            0.5,
            D('n2', 2, 'hAv', [
              ['Opera', D('n5', 1, 'h1', [['Opera', T('t5', 2, 0)], ['Football', T('t6', 0, 1)]])],
              ['Football', D('n6', 1, 'h1', [['Opera', T('t7', 0, 2)], ['Football', T('t8', 1, 0)]])],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {hFr: 'Player 2 if Friendly', hAv: 'Player 2 if Avoider', h1: 'Player 1 (knows neither type nor move)'},
  },
  beerQuiche: {
    title: 'Beer or Quiche: a signaling game',
    subtitle: 'Player 1 is Strong (0.9) or Weak (0.1). He picks breakfast; Player 2 sees only the breakfast and decides whether to duel. Player 1 gets +1 for his preferred breakfast (Strong: beer, Weak: quiche) and +2 if there is no duel.',
    names: ['Sender', 'Receiver'],
    variants: [
      {
        label: 'Beer–Quiche',
        tree: N('n0', [
          [
            'Strong',
            0.9,
            D('n1', 1, 'hS', [
              ['Beer', D('n3', 2, 'hB', [['Duel', T('t1', 1, 0)], ['Don’t', T('t2', 3, 1)]])],
              ['Quiche', D('n4', 2, 'hQ', [['Duel', T('t3', 0, 0)], ['Don’t', T('t4', 2, 1)]])],
            ]),
          ],
          [
            'Weak',
            0.1,
            D('n2', 1, 'hW', [
              ['Quiche', D('n5', 2, 'hQ', [['Duel', T('t5', 1, 1)], ['Don’t', T('t6', 3, 0)]])],
              ['Beer', D('n6', 2, 'hB', [['Duel', T('t7', 0, 1)], ['Don’t', T('t8', 2, 0)]])],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {hS: 'Sender if Strong', hW: 'Sender if Weak', hB: 'Receiver after Beer', hQ: 'Receiver after Quiche'},
  },
  insider: {
    title: 'Insider trading: Nature, private information, and a lemons problem',
    subtitle: 'The executive knows whether the new chip is delayed; the investor only sees whether she offers to sell at price 6.',
    names: ['Executive', 'Investor'],
    variants: [
      {
        label: 'Sell at p = 6',
        tree: N('n0', [
          [
            'On track',
            0.5,
            D('n1', 1, 'hOT', [
              ['Sell', D('n3', 2, 'hS', [['Buy', T('t1', 6, 4)], ['Pass', T('t2', 8, 0)]])],
              ['Keep', T('t3', 8, 0)],
            ]),
          ],
          [
            'Delayed',
            0.5,
            D('n2', 1, 'hD', [
              ['Sell', D('n4', 2, 'hS', [['Buy', T('t4', 6, -1)], ['Pass', T('t5', 4, 0)]])],
              ['Keep', T('t6', 4, 0)],
            ]),
          ],
        ]),
      },
    ],
    infoLabels: {hOT: 'Executive if On track', hD: 'Executive if Delayed', hS: 'Investor (sees an offer, not the state)'},
  },
};

/* ---------- layout ---------- */
function layout(root) {
  const pos = new Map();
  let leaf = 0;
  let maxDepth = 0;
  const place = (n, depth) => {
    maxDepth = Math.max(maxDepth, depth);
    if (isTerminal(n)) {
      pos.set(n.id, {x: leaf++, depth});
      return;
    }
    n.moves.forEach((m) => place(m.to, depth + 1));
    const xs = n.moves.map((m) => pos.get(m.to.id).x);
    pos.set(n.id, {x: (Math.min(...xs) + Math.max(...xs)) / 2, depth});
  };
  place(root, 0);
  return {pos, leaves: leaf, maxDepth};
}

function TreeSvg({root, reach, bi, names}) {
  const {pos, leaves, maxDepth} = layout(root);
  const colW = 84;
  const rowH = 78;
  const W = Math.max(360, leaves * colW);
  const H = maxDepth * rowH + 80;
  const X = (x) => (leaves <= 1 ? W / 2 : 42 + (x / (leaves - 1)) * (W - 84));
  const Y = (d) => 24 + d * rowH;
  const all = collect(root);
  const sets = infoSets(root).filter((h) => h.nodeIds.length > 1);
  const colorOf = (p) => (p === 1 ? P1_COLOR : p === 2 ? P2_COLOR : 'var(--ifm-color-emphasis-700)');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width: '100%', maxWidth: W, display: 'block'}}>
      {sets.map((h, si) => {
        const ps = h.nodeIds.map((id) => pos.get(id));
        const xs = ps.map((p) => X(p.x));
        const y = Y(ps[0].depth);
        const mn = Math.min(...ps.map((p) => p.x));
        const mx = Math.max(...ps.map((p) => p.x));
        const blocked = all.some(
          ({node}) => !isTerminal(node) && !h.nodeIds.includes(node.id) && pos.get(node.id).depth === ps[0].depth && pos.get(node.id).x > mn && pos.get(node.id).x < mx,
        );
        if (blocked) {
          const sorted = [...xs].sort((a, b) => a - b);
          const lift = 26 + si * 10;
          return (
            <g key={h.id}>
              {sorted.slice(1).map((x2, k) => {
                const x1 = sorted[k];
                return (
                  <path
                    key={k}
                    d={`M ${x1} ${y - 11} Q ${(x1 + x2) / 2} ${y - lift - (x2 - x1) * 0.12} ${x2} ${y - 11}`}
                    fill="none"
                    stroke={colorOf(h.player)}
                    strokeDasharray="5 4"
                    strokeWidth={1.8}
                  />
                );
              })}
            </g>
          );
        }
        return (
          <rect
            key={h.id}
            x={Math.min(...xs) - 18}
            y={y - 13}
            width={Math.max(...xs) - Math.min(...xs) + 36}
            height={26}
            rx={13}
            fill="none"
            stroke={colorOf(h.player)}
            strokeDasharray="5 4"
            strokeWidth={1.5}
          />
        );
      })}
      {all.map(({node}) =>
        isTerminal(node)
          ? null
          : node.moves.map((m) => {
              const a = pos.get(node.id);
              const b = pos.get(m.to.id);
              const onPath = (reach.get(m.to.id) || 0) > 0 && (reach.get(node.id) || 0) > 0;
              const biPick = bi && bi.choice.get(node.id) === m.label;
              const x1 = X(a.x);
              const y1 = Y(a.depth);
              const x2 = X(b.x);
              const y2 = Y(b.depth);
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              return (
                <g key={`${node.id}-${m.label}`}>
                  {onPath && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#eab308" strokeWidth={9} strokeOpacity={0.55} strokeLinecap="round" />}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={biPick ? NE_COLOR : onPath ? '#ca8a04' : 'var(--ifm-color-emphasis-500)'}
                    strokeWidth={biPick ? 3 : onPath ? 3 : 1.5}
                    strokeLinecap="round"
                  />
                  <text
                    x={mx + (x2 < x1 ? -6 : 6)}
                    y={my - 2}
                    textAnchor={x2 < x1 ? 'end' : 'start'}
                    fontSize="12"
                    fontWeight="600"
                    fill="var(--ifm-font-color-base)"
                  >
                    {m.label}
                    {node.player === 'N' ? ` (${fmt(m.prob)})` : ''}
                  </text>
                </g>
              );
            }),
      )}
      {all.map(({node}) => {
        const p = pos.get(node.id);
        const x = X(p.x);
        const y = Y(p.depth);
        if (isTerminal(node)) {
          const hit = (reach.get(node.id) || 0) > 0;
          return (
            <g key={node.id}>
              <text x={x} y={y + 26} textAnchor="middle" fontSize="12.5" fontWeight={hit ? 800 : 500}>
                <tspan fill={P1_COLOR}>{fmt(node.payoff[0])}</tspan>
                <tspan fill="var(--ifm-color-emphasis-600)">, </tspan>
                <tspan fill={P2_COLOR}>{fmt(node.payoff[1])}</tspan>
              </text>
              {hit && reach.get(node.id) < 1 && (
                <text x={x} y={y + 39} textAnchor="middle" fontSize="10" fill="var(--ifm-color-emphasis-700)">
                  prob {fmt(reach.get(node.id))}
                </text>
              )}
            </g>
          );
        }
        const val = bi?.value.get(node.id);
        return (
          <g key={node.id}>
            <circle
              cx={x}
              cy={y}
              r={11}
              fill={node.player === 'N' ? 'var(--ifm-background-surface-color)' : colorOf(node.player)}
              stroke={colorOf(node.player)}
              strokeWidth={2}
            />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={node.player === 'N' ? 'var(--ifm-font-color-base)' : '#fff'}>
              {node.player === 'N' ? 'N' : node.player}
            </text>
            {val && (
              <text x={x + 14} y={y - 10} fontSize="10.5" fill={NE_COLOR} fontWeight="700">
                ({fmt(val[0])}, {fmt(val[1])})
              </text>
            )}
          </g>
        );
      })}
      <text x={6} y={H - 6} fontSize="10" fill="var(--ifm-color-emphasis-700)">
        <tspan fill={P1_COLOR}>● {names[0]}</tspan>
        {'   '}
        <tspan fill={P2_COLOR}>● {names[1]}</tspan>
        {'   ○ N = Nature   dashed loop = information set'}
      </text>
    </svg>
  );
}

export default function GameTreeLab({preset = 'bos', hideMatrix = false}) {
  const P = PRESETS[preset] || PRESETS.bos;
  const names = P.names || ['Player 1', 'Player 2'];
  const [vi, setVi] = useState(0);
  const root = P.variants[vi].tree;
  const sets = useMemo(() => infoSets(root), [root]);
  const [plan, setPlan] = useState({});
  const [showNF, setShowNF] = useState(false);
  const [showBR, setShowBR] = useState(false);
  const [showBI, setShowBI] = useState(false);

  const fullPlan = useMemo(() => {
    const out = {1: {}, 2: {}};
    for (const h of sets) out[h.player][h.id] = plan[h.id] ?? h.moves[0];
    return out;
  }, [sets, plan]);

  const {payoff, reach} = useMemo(() => playOut(root, fullPlan), [root, fullPlan]);
  const nf = useMemo(() => normalForm(root), [root]);
  const perfect = isPerfectInfo(root);
  const hasNature = useMemo(() => collect(root).some(({node}) => node.player === 'N'), [root]);
  const bi = useMemo(() => (showBI && perfect ? backwardInduction(root) : null), [showBI, perfect, root]);

  const s1 = strategiesOf(root, 1);
  const s2 = strategiesOf(root, 2);
  const curName = (s) => strategyName(s.sets.map((h) => fullPlan[h.player][h.id]));
  const rIdx = nf.rows.indexOf(curName(s1));
  const cIdx = nf.cols.indexOf(curName(s2));

  const label = (h) => P.infoLabels?.[h.id] || `${names[h.player - 1]} at ${h.id}`;

  const count = (s, who) => {
    const parts = s.sets.map((h) => h.moves.length);
    return (
      <span>
        {names[who - 1]}: {s.sets.length} information set{s.sets.length === 1 ? '' : 's'}
        {parts.length > 0 ? ` → ${parts.join(' × ')} = ${s.list.length} strategies` : ' → no moves'}
      </span>
    );
  };

  return (
    <CEBlock title={P.title} subtitle={P.subtitle}>
      {P.variants.length > 1 && (
        <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8}}>
          {P.variants.map((v, i) => (
            <button
              key={v.label}
              type="button"
              style={btn(vi === i)}
              onClick={() => {
                setVi(i);
                setPlan({});
                setShowBI(false);
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      <TreeSvg root={root} reach={reach} bi={bi} names={names} />

      <CEBlock.Section label="Build a strategy profile (a complete plan for every information set)">
        <div style={{display: 'grid', gap: 6}}>
          {sets.map((h) => (
            <div key={h.id} style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
              <span style={{minWidth: 230, fontSize: 14, color: h.player === 1 ? P1_COLOR : P2_COLOR, fontWeight: 600}}>{label(h)}</span>
              {h.moves.map((m) => (
                <button key={m} type="button" style={btn(fullPlan[h.player][h.id] === m)} onClick={() => setPlan((x) => ({...x, [h.id]: m}))}>
                  {m}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div style={{fontSize: 14, marginTop: 8}}>
          Profile: (<b style={{color: P1_COLOR}}>{curName(s1)}</b>, <b style={{color: P2_COLOR}}>{curName(s2)}</b>) → {hasNature ? 'expected payoff ' : 'payoff '}
          <b>
            (<span style={{color: P1_COLOR}}>{fmt(payoff[0])}</span>, <span style={{color: P2_COLOR}}>{fmt(payoff[1])}</span>)
          </b>
          <span style={{color: 'var(--ifm-color-emphasis-700)'}}> — the yellow path is the play this profile produces.</span>
        </div>
        <div style={{...note, marginTop: 4}}>
          {count(s1, 1)}
          <br />
          {count(s2, 2)}
        </div>
      </CEBlock.Section>

      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
        {!hideMatrix && (
          <button type="button" style={btn(showNF)} onClick={() => setShowNF((v) => !v)}>
            {showNF ? 'Hide normal form' : 'Reveal normal form'}
          </button>
        )}
        {showNF && (
          <button type="button" style={btn(showBR)} onClick={() => setShowBR((v) => !v)}>
            Best responses
          </button>
        )}
        {perfect && (
          <button type="button" style={btn(showBI)} onClick={() => setShowBI((v) => !v)}>
            {showBI ? 'Hide backward induction' : 'Solve by backward induction'}
          </button>
        )}
      </div>

      {bi && (
        <div style={note}>
          Green edges: the move each player makes when that node is reached, working from the end of the tree back to the root. Green numbers: the
          payoffs that node leads to.
        </div>
      )}
      {!perfect && <div style={note}>This game has a non-singleton information set, so plain backward induction is not available here.</div>}

      {showNF && (
        <>
          <Bimatrix
            rows={nf.rows}
            cols={nf.cols}
            payoffs={nf.payoffs}
            showBR={showBR}
            highlight={rIdx >= 0 && cIdx >= 0 ? `${rIdx},${cIdx}` : null}
            p1={names[0]}
            p2={names[1]}
            onCellClick={(i, j) => {
              const next = {};
              nf.s1.sets.forEach((h, k) => (next[h.id] = nf.s1.list[i][k]));
              nf.s2.sets.forEach((h, k) => (next[h.id] = nf.s2.list[j][k]));
              setPlan(next);
            }}
          />
          <div style={note}>Click any cell to load that profile into the tree. The yellow cell is the profile currently selected.</div>
        </>
      )}
    </CEBlock>
  );
}
