import React, {useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fmt, btn, note} from './gtCore';

/**
 * Do two utility assignments describe the same preferences?
 *  - over sure outcomes (ordinal): same ranking
 *  - over lotteries (vNM / cardinal): v = αu + β with α > 0
 */
const CASES = [
  {u: [0, 2, 5, 10], v: [3, 7, 13, 23]},
  {u: [0, 2, 5, 10], v: [0, 4, 25, 100]},
  {u: [1, 2, 3, 4], v: [-1, -2, -3, -4]},
  {u: [2, -1, 4, 0], v: [10, 1, 16, 4]},
  {u: [1, 3, 6, 2], v: [1, 9, 36, 4]},
  {u: [-2, 0, 1, 4], v: [-10, -4, -1, 8]},
];
const OUTCOMES = ['z₁', 'z₂', 'z₃', 'z₄'];
const CHOICES = ['Same preferences over lotteries', 'Same ranking of sure outcomes only', 'Different even over sure outcomes'];

function analyse({u, v}) {
  const n = u.length;
  let sameOrder = true;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (Math.sign(u[i] - u[j]) !== Math.sign(v[i] - v[j])) sameOrder = false;
    }
  }
  const i0 = 0;
  const j0 = u.findIndex((x) => x !== u[i0]);
  const alpha = (v[j0] - v[i0]) / (u[j0] - u[i0]);
  const beta = v[i0] - alpha * u[i0];
  const affine = alpha > 0 && u.every((x, k) => Math.abs(alpha * x + beta - v[k]) < 1e-9);
  /* find a lottery that the two utilities rank differently */
  let witness = null;
  if (sameOrder && !affine) {
    outer: for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        for (let c = 0; c < n; c++) {
          if (a === b) continue;
          for (const p of [0.5, 0.25, 0.75]) {
            const eu = p * u[a] + (1 - p) * u[b] - u[c];
            const ev = p * v[a] + (1 - p) * v[b] - v[c];
            if (Math.sign(eu) !== Math.sign(ev)) {
              witness = {a, b, c, p, eu: eu + u[c], ev: ev + v[c]};
              break outer;
            }
          }
        }
      }
    }
  }
  const answer = affine ? 0 : sameOrder ? 1 : 2;
  return {sameOrder, alpha, beta, affine, i0, j0, witness, answer};
}

export default function UtilityTransformLab() {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState(null);
  const C = CASES[k];
  const A = analyse(C);

  const cell = {border: '1px solid var(--ifm-color-emphasis-400)', padding: '4px 12px', textAlign: 'center'};

  return (
    <CEBlock title="Same person, different numbers?" subtitle="Decide whether utility v describes the same preferences as utility u — then check.">
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8}}>
        {CASES.map((_, i) => (
          <button
            key={i}
            type="button"
            style={btn(k === i)}
            onClick={() => {
              setK(i);
              setPick(null);
            }}
          >
            Case {i + 1}
          </button>
        ))}
      </div>
      <table style={{borderCollapse: 'collapse', display: 'table'}}>
        <tbody>
          <tr>
            <th style={cell}>outcome</th>
            {OUTCOMES.map((o) => (
              <th key={o} style={cell}>
                {o}
              </th>
            ))}
          </tr>
          <tr>
            <th style={{...cell, color: P1_COLOR}}>u</th>
            {C.u.map((x, i) => (
              <td key={i} style={{...cell, color: P1_COLOR}}>
                {fmt(x)}
              </td>
            ))}
          </tr>
          <tr>
            <th style={{...cell, color: P2_COLOR}}>v</th>
            {C.v.map((x, i) => (
              <td key={i} style={{...cell, color: P2_COLOR}}>
                {fmt(x)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div style={{display: 'grid', gap: 6, marginTop: 10}}>
        {CHOICES.map((c, i) => (
          <button key={c} type="button" style={{...btn(pick === i), textAlign: 'left'}} onClick={() => setPick(i)}>
            {c}
          </button>
        ))}
      </div>

      {pick !== null && (
        <div style={{marginTop: 10, fontSize: 14}}>
          <div style={{fontWeight: 700, color: pick === A.answer ? NE_COLOR : P2_COLOR}}>
            {pick === A.answer ? '✓ Correct.' : `✗ Not quite — the answer is “${CHOICES[A.answer]}”.`}
          </div>
          <div style={{marginTop: 4}}>
            Ranking test: u and v {A.sameOrder ? 'order the four outcomes the same way' : 'order the outcomes differently'}.
          </div>
          <div>
            Affine test: from {OUTCOMES[A.i0]} and {OUTCOMES[A.j0]}, α = ({fmt(C.v[A.j0])} − {fmt(C.v[A.i0])}) / ({fmt(C.u[A.j0])} − {fmt(C.u[A.i0])}) ={' '}
            <b>{fmt(A.alpha)}</b>, β = <b>{fmt(A.beta)}</b>.{' '}
            {A.affine
              ? 'Every other outcome satisfies v = αu + β with α > 0.'
              : A.alpha <= 0
                ? 'α is not positive, so v reverses (or flattens) the ranking.'
                : `But αu + β ≠ v for at least one outcome (e.g. ${OUTCOMES[C.u.findIndex((x, i) => Math.abs(A.alpha * x + A.beta - C.v[i]) > 1e-9)]}).`}
          </div>
          {A.witness && (
            <div style={{...note, marginTop: 6}}>
              A lottery they disagree on: {fmt(A.witness.p)} chance of {OUTCOMES[A.witness.a]} and {fmt(1 - A.witness.p)} chance of {OUTCOMES[A.witness.b]}{' '}
              versus {OUTCOMES[A.witness.c]} for sure. Under u: {fmt(A.witness.eu)} vs {fmt(C.u[A.witness.c])}. Under v: {fmt(A.witness.ev)} vs{' '}
              {fmt(C.v[A.witness.c])}.
            </div>
          )}
        </div>
      )}
    </CEBlock>
  );
}
