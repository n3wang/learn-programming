import React, {useEffect, useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fmt, fx, btn, note} from './gtCore';

/**
 * A homework problem broken into parts, each with a hint ladder and a solution.
 *
 * Part types:
 *   reflect — open answer (not graded); write, then compare with the model answer
 *   choice  — {choices, answer}
 *   numeric — {answer, tol?}; accepts fractions such as 3/4
 *   order   — {items} listed in the correct order; shown shuffled
 *   matrix  — {rows, cols, answer: number[][]}; fill every cell
 *   widget  — {widget: 'studyRegion' | 'affineSandbox'}; exploration, counts once opened
 * Every part may carry hints: string[] and solution: string | string[].
 */

const KEY = (id) => `problem-workbench:${id}`;

function parseNum(raw) {
  const t = String(raw).trim().replace(/\s+/g, '');
  if (!t) return NaN;
  const m = t.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (m) return Number(m[1]) / Number(m[2]);
  return Number(t);
}

/** Deterministic shuffle so the order does not jump between renders. */
function shuffled(n, seed) {
  const idx = [...Array(n).keys()];
  let s = seed;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (idx.every((v, i) => v === i) && n > 1) [idx[0], idx[1]] = [idx[1], idx[0]];
  return idx;
}

/* ------------------------------------------------------------------ */
/* Widgets                                                             */
/* ------------------------------------------------------------------ */

function StudyRegion() {
  const [V, setV] = useState(10);
  const [c, setC] = useState(3);
  const [pN, setPN] = useState(0.4);
  const [pS, setPS] = useState(0.8);
  const W = 260;
  const pad = 30;
  const X = (v) => pad + v * (W - 2 * pad);
  const Y = (v) => W - pad - v * (W - 2 * pad);
  const gap = c / V; // study iff pS - pN > c/V
  const euS = V * pS - c;
  const euN = V * pN;
  const verdict = Math.abs(euS - euN) < 1e-9 ? 'indifferent' : euS > euN ? 'study' : 'not study';
  const valid = pN < pS;
  return (
    <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6}}>
      <div style={{flex: '1 1 240px', fontSize: 14}}>
        {[
          ['Utility of passing V', V, setV, 1, 20, 1],
          ['Cost of studying c', c, setC, 0, 10, 0.5],
          ['p_N (pass without studying)', pN, setPN, 0, 1, 0.01],
          ['p_S (pass with studying)', pS, setPS, 0, 1, 0.01],
        ].map(([l, v, s, mn, mx, st]) => (
          <label key={l} style={{display: 'block'}}>
            {l} = <b>{st < 1 ? fx(v, 2) : v}</b>{' '}
            <input type="range" min={mn} max={mx} step={st} value={v} onChange={(e) => s(Number(e.target.value))} style={{width: 130, verticalAlign: 'middle'}} />
          </label>
        ))}
        <div style={{marginTop: 6}}>
          u = V·[pass] − c·[studied]
          <br />
          U(study) = V·p_S − c = <b>{fx(euS, 2)}</b>
          <br />
          U(not study) = V·p_N = <b>{fx(euN, 2)}</b>
        </div>
        <div style={{fontWeight: 700, marginTop: 4, color: valid ? (verdict === 'study' ? NE_COLOR : verdict === 'indifferent' ? '#ca8a04' : P2_COLOR) : P2_COLOR}}>
          {valid ? `→ She should ${verdict === 'indifferent' ? 'be indifferent' : verdict}.` : 'The problem assumes p_N < p_S — move the sliders.'}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${W}`} style={{flex: '0 1 260px', maxWidth: W}}>
        <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} fill="none" stroke="var(--ifm-color-emphasis-400)" />
        {/* feasible triangle pN < pS */}
        <polygon points={`${X(0)},${Y(0)} ${X(1)},${Y(1)} ${X(0)},${Y(1)}`} fill="rgba(220,38,38,0.12)" />
        {/* study region: pS > pN + gap */}
        {gap < 1 && <polygon points={`${X(0)},${Y(gap)} ${X(1 - gap)},${Y(1)} ${X(0)},${Y(1)}`} fill="rgba(22,163,74,0.35)" />}
        <line x1={X(0)} y1={Y(Math.min(gap, 1))} x2={X(Math.max(1 - gap, 0))} y2={Y(1)} stroke={NE_COLOR} strokeWidth={2} />
        <line x1={X(0)} y1={Y(0)} x2={X(1)} y2={Y(1)} stroke="var(--ifm-color-emphasis-500)" strokeDasharray="4 3" />
        <circle cx={X(pN)} cy={Y(pS)} r={6} fill="#eab308" stroke="#000" strokeWidth={0.5} />
        <text x={W / 2} y={W - 6} fontSize="11" textAnchor="middle" fill="var(--ifm-font-color-base)">p_N</text>
        <text x={10} y={W / 2} fontSize="11" textAnchor="middle" transform={`rotate(-90 10 ${W / 2})`} fill="var(--ifm-font-color-base)">p_S</text>
        <text x={X(0.05)} y={Y(0.95)} fontSize="10" fill={NE_COLOR}>study</text>
        <text x={X(0.5)} y={Y(0.6)} fontSize="10" fill={P2_COLOR}>don’t study</text>
        <text x={X(0.62)} y={Y(0.45)} fontSize="9" fill="var(--ifm-color-emphasis-700)">p_S = p_N</text>
      </svg>
    </div>
  );
}

function AffineSandbox() {
  const u1 = [0, 4, 10];
  const p = [0.5, 0, 0.5];
  const q = [0, 1, 0];
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const u2 = u1.map((x) => a * x + b);
  const EU = (u, l) => u.reduce((s, x, i) => s + x * l[i], 0);
  const d1 = EU(u1, p) - EU(u1, q);
  const d2 = EU(u2, p) - EU(u2, q);
  const rank = (d) => (Math.abs(d) < 1e-9 ? 'p ~ q (indifferent)' : d > 0 ? 'p ≻ q' : 'q ≻ p');
  return (
    <div style={{fontSize: 14, marginTop: 6}}>
      <div>
        Prizes z₁, z₂, z₃ with u₁ = (0, 4, 10). Lottery p = 50–50 between z₁ and z₃; lottery q = z₂ for sure.
      </div>
      <label style={{display: 'block'}}>
        α = <b>{a}</b> <input type="range" min={-3} max={3} step={0.5} value={a} onChange={(e) => setA(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <label style={{display: 'block'}}>
        β = <b>{b}</b> <input type="range" min={-10} max={10} step={1} value={b} onChange={(e) => setB(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
      </label>
      <div>
        u₂ = αu₁ + β = ({u2.map((x) => fmt(x)).join(', ')})
      </div>
      <div style={{color: P1_COLOR}}>
        Under u₁: U₁(p) = {fmt(EU(u1, p))}, U₁(q) = {fmt(EU(u1, q))} → {rank(d1)}
      </div>
      <div style={{color: P2_COLOR}}>
        Under u₂: U₂(p) = {fmt(EU(u2, p))}, U₂(q) = {fmt(EU(u2, q))} → {rank(d2)}
      </div>
      <div style={{marginTop: 4, fontWeight: 700}}>
        U₂(p) − U₂(q) = α·(U₁(p) − U₁(q)) = {fmt(a)} × {fmt(d1)} = {fmt(d2)}{' '}
        {a > 0 ? <span style={{color: NE_COLOR}}>— same ranking (α &gt; 0)</span> : a < 0 ? <span style={{color: P2_COLOR}}>— ranking reversed (α &lt; 0)</span> : <span style={{color: '#ca8a04'}}>— everything ties (α = 0)</span>}
      </div>
    </div>
  );
}

const WIDGETS = {studyRegion: StudyRegion, affineSandbox: AffineSandbox};

/* ------------------------------------------------------------------ */
/* Part renderer                                                       */
/* ------------------------------------------------------------------ */

function Solution({solution}) {
  if (!solution) return null;
  return (
    <div style={{marginTop: 6, padding: '6px 10px', borderLeft: '3px solid var(--ifm-color-primary)', background: 'var(--ifm-color-emphasis-100)', borderRadius: 4, fontSize: 14}}>
      <b>Solution</b>
      {Array.isArray(solution) ? (
        <ol style={{margin: '4px 0 0 18px'}}>
          {solution.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      ) : (
        <div style={{marginTop: 4, whiteSpace: 'pre-wrap'}}>{solution}</div>
      )}
    </div>
  );
}

function Part({part, idx, state, setState, seed}) {
  const st = state || {};
  const update = (patch) => setState({...st, ...patch});
  const hints = part.hints || [];
  const shownHints = st.hints || 0;
  const status = st.status; // 'right' | 'wrong' | 'revealed' | 'done'

  const order = useMemo(() => (part.type === 'order' ? st.order || shuffled(part.items.length, seed + idx * 7) : null), [part, st.order, seed, idx]);

  let body = null;
  let check = null;

  if (part.type === 'choice') {
    body = (
      <div style={{display: 'grid', gap: 4}}>
        {part.choices.map((c, i) => (
          <button key={i} type="button" style={{...btn(st.pick === i), textAlign: 'left'}} onClick={() => update({pick: i, status: undefined})}>
            {c}
          </button>
        ))}
      </div>
    );
    check = () => update({status: st.pick === part.answer ? 'right' : 'wrong'});
  } else if (part.type === 'numeric') {
    body = (
      <input
        type="text"
        value={st.draft || ''}
        placeholder="e.g. 3/4 or 0.75"
        onChange={(e) => update({draft: e.target.value, status: undefined})}
        style={{padding: '4px 8px', borderRadius: 6, border: '1px solid var(--ifm-color-emphasis-400)', width: 160}}
      />
    );
    check = () => {
      const v = parseNum(st.draft);
      update({status: Number.isFinite(v) && Math.abs(v - part.answer) <= (part.tol ?? 0.005) ? 'right' : 'wrong'});
    };
  } else if (part.type === 'order') {
    const move = (i, d) => {
      const o = [...order];
      const j = i + d;
      if (j < 0 || j >= o.length) return;
      [o[i], o[j]] = [o[j], o[i]];
      update({order: o, status: undefined});
    };
    body = (
      <ol style={{margin: '4px 0 0 18px', fontSize: 14}}>
        {order.map((k, i) => (
          <li key={k} style={{margin: '3px 0'}}>
            <span style={{display: 'inline-flex', gap: 4, marginRight: 6}}>
              <button type="button" style={{...btn(false), padding: '0 6px'}} onClick={() => move(i, -1)} aria-label="Move up">
                ↑
              </button>
              <button type="button" style={{...btn(false), padding: '0 6px'}} onClick={() => move(i, 1)} aria-label="Move down">
                ↓
              </button>
            </span>
            {part.items[k]}
          </li>
        ))}
      </ol>
    );
    check = () => update({status: order.every((k, i) => k === i) ? 'right' : 'wrong', order});
  } else if (part.type === 'matrix') {
    const cells = st.cells || {};
    const cellOk = (r, c) => {
      const v = parseNum(cells[`${r},${c}`]);
      return Number.isFinite(v) && Math.abs(v - part.answer[r][c]) < 1e-6;
    };
    const cs = {border: '1px solid var(--ifm-color-emphasis-400)', padding: 4, textAlign: 'center'};
    body = (
      <div style={{overflowX: 'auto'}}>
        <table style={{borderCollapse: 'collapse', display: 'table', fontSize: 13}}>
          <thead>
            <tr>
              <th style={{...cs, border: 'none'}}>
                <span style={{color: P1_COLOR}}>{part.rowPlayer || 'Row'}</span> \ <span style={{color: P2_COLOR}}>{part.colPlayer || 'Column'}</span>
              </th>
              {part.cols.map((c) => (
                <th key={c} style={{...cs, color: P2_COLOR}}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {part.rows.map((r, i) => (
              <tr key={r}>
                <th style={{...cs, color: P1_COLOR, textAlign: 'left'}}>{r}</th>
                {part.cols.map((c, j) => {
                  const k = `${i},${j}`;
                  const mark = st.checked ? (cellOk(i, j) ? 'ok' : 'bad') : null;
                  return (
                    <td key={c} style={{...cs, background: mark === 'ok' ? 'rgba(22,163,74,0.15)' : mark === 'bad' ? 'rgba(220,38,38,0.15)' : 'transparent'}}>
                      <input
                        type="text"
                        value={status === 'revealed' ? fmt(part.answer[i][j]) : cells[k] || ''}
                        disabled={status === 'revealed'}
                        onChange={(e) => update({cells: {...cells, [k]: e.target.value}, status: undefined, checked: false})}
                        style={{width: 52, textAlign: 'center', border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 4, padding: 2}}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    check = () => {
      const all = part.rows.every((_, i) => part.cols.every((__, j) => cellOk(i, j)));
      update({status: all ? 'right' : 'wrong', checked: true});
    };
  } else if (part.type === 'reflect') {
    body = (
      <textarea
        value={st.draft || ''}
        onChange={(e) => update({draft: e.target.value})}
        rows={part.rows || 4}
        placeholder="Write your answer here (saved in this browser). Then compare with the model answer."
        style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--ifm-color-emphasis-400)', fontFamily: 'inherit', fontSize: 14}}
      />
    );
  } else if (part.type === 'widget') {
    const Wd = WIDGETS[part.widget];
    body = Wd ? <Wd /> : null;
  }

  const done = status === 'right' || status === 'revealed' || status === 'done';
  const badge = status === 'right' ? '✓' : status === 'revealed' ? 'shown' : status === 'done' ? '✓' : null;

  return (
    <div style={{borderTop: '1px solid var(--ifm-color-emphasis-200)', padding: '10px 0'}}>
      <div style={{display: 'flex', gap: 8, alignItems: 'baseline'}}>
        <b style={{minWidth: 28}}>({part.label})</b>
        <div style={{flex: 1, fontSize: 15}}>{part.prompt}</div>
        {badge && (
          <span style={{fontSize: 12, fontWeight: 700, color: status === 'revealed' ? '#ca8a04' : NE_COLOR}}>{badge}</span>
        )}
      </div>
      <div style={{marginLeft: 36, marginTop: 6}}>
        {body}
        {hints.slice(0, shownHints).map((h, i) => (
          <div key={i} style={{...note, marginTop: 6}}>
            💡 Hint {i + 1}: {h}
          </div>
        ))}
        <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8}}>
          {check && status !== 'revealed' && (
            <button type="button" style={btn(false)} onClick={check}>
              Check
            </button>
          )}
          {part.type === 'reflect' && status !== 'revealed' && (
            <button type="button" style={btn(false)} onClick={() => update({status: 'revealed'})}>
              Compare with model answer
            </button>
          )}
          {part.type === 'widget' && status !== 'done' && (
            <button type="button" style={btn(false)} onClick={() => update({status: 'done'})}>
              I’ve explored it
            </button>
          )}
          {shownHints < hints.length && status !== 'revealed' && !(status === 'right') && (
            <button type="button" style={btn(false)} onClick={() => update({hints: shownHints + 1})}>
              Hint ({shownHints + 1}/{hints.length})
            </button>
          )}
          {part.solution && part.type !== 'reflect' && status !== 'revealed' && (
            <button type="button" style={btn(false)} onClick={() => update({status: 'revealed'})}>
              Show solution
            </button>
          )}
        </div>
        {status === 'right' && <div style={{color: NE_COLOR, fontWeight: 700, fontSize: 14, marginTop: 4}}>✓ Correct.{part.explain ? ` ${part.explain}` : ''}</div>}
        {status === 'wrong' && <div style={{color: P2_COLOR, fontSize: 14, marginTop: 4}}>Not yet — {part.type === 'matrix' ? 'red cells are wrong.' : 'try again or take a hint.'}</div>}
        {(status === 'revealed' || (status === 'right' && part.showSolutionWhenRight !== false && part.type !== 'numeric')) && <Solution solution={part.solution} />}
        {status === 'right' && part.type === 'numeric' && part.solution && (
          <details style={{marginTop: 4, fontSize: 14}}>
            <summary>See the worked solution</summary>
            <Solution solution={part.solution} />
          </details>
        )}
      </div>
    </div>
  );
}

export default function ProblemWorkbench({id, number, title, statement, parts = [], source}) {
  const [states, setStates] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY(id));
      if (raw) setStates(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY(id), JSON.stringify(states));
    } catch {
      /* ignore */
    }
  }, [states, loaded, id]);

  const doneCount = parts.filter((p, i) => ['right', 'revealed', 'done'].includes(states[i]?.status)).length;
  const firstTry = parts.filter((p, i) => states[i]?.status === 'right' || states[i]?.status === 'done').length;

  const seed = useMemo(() => [...String(id)].reduce((s, ch) => s + ch.charCodeAt(0), 0), [id]);

  return (
    <CEBlock
      title={`Problem ${number}. ${title}`}
      subtitle={source}
      headerAction={
        <span style={{fontSize: 12, fontWeight: 700}}>
          {doneCount}/{parts.length} parts
        </span>
      }
    >
      <div style={{height: 6, borderRadius: 3, background: 'var(--ifm-color-emphasis-200)', marginBottom: 10, overflow: 'hidden'}}>
        <div style={{width: `${(100 * doneCount) / Math.max(parts.length, 1)}%`, height: '100%', background: NE_COLOR, transition: 'width 0.3s'}} />
      </div>
      <div style={{fontSize: 15, whiteSpace: 'pre-wrap', marginBottom: 8}}>{statement}</div>
      {parts.map((p, i) => (
        <Part key={i} part={p} idx={i} seed={seed} state={states[i]} setState={(s) => setStates((o) => ({...o, [i]: s}))} />
      ))}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 13}}>
        <span>
          Solved without revealing: <b>{firstTry}</b> of {parts.length}
        </span>
        <button
          type="button"
          style={btn(false)}
          onClick={() => {
            setStates({});
          }}
        >
          Reset this problem
        </button>
      </div>
    </CEBlock>
  );
}
