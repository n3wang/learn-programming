import React, {useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, btn, note} from './gtCore';

/**
 * Three legislators, three alternatives, binary agenda:
 * first vote first[0] vs first[1]; the winner then faces the remaining alternative.
 */
const ALTS = ['Status quo', 'Bill', 'Amendment'];
const PERMS = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];
const VOTERS = ['Ana', 'Ben', 'Caro'];
const COLORS = [P1_COLOR, P2_COLOR, '#9333ea'];

const prefers = (rank, a, b) => rank.indexOf(a) < rank.indexOf(b);
const majority = (ranks, a, b) => (ranks.filter((r) => prefers(r, a, b)).length >= 2 ? a : b);

export default function AgendaVotingLab() {
  // Ana: Bill ≻ SQ ≻ Amendment; Ben: Amendment ≻ Bill ≻ SQ; Caro: SQ ≻ Amendment ≻ Bill
  const [prefIdx, setPrefIdx] = useState([2, 5, 1]);
  const [agenda, setAgenda] = useState(0); // which alternative is held to the end
  const ranks = prefIdx.map((i) => PERMS[i]);
  const last = [0, 1, 2][agenda];
  const first = [0, 1, 2].filter((x) => x !== last);

  // sincere
  const s1 = majority(ranks, first[0], first[1]);
  const sincere = majority(ranks, s1, last);
  // sophisticated: each first-stage option leads to its final-stage outcome
  const out = (w) => majority(ranks, w, last);
  const o0 = out(first[0]);
  const o1 = out(first[1]);
  const sophFirst = o0 === o1 ? first[0] : majority(ranks, o0, o1) === o0 ? first[0] : first[1];
  const soph = out(sophFirst);

  const switchers = ranks
    .map((r, i) => {
      const sincereVote = prefers(r, first[0], first[1]) ? first[0] : first[1];
      const sophVote = o0 === o1 ? sincereVote : prefers(r, o0, o1) ? first[0] : first[1];
      return sincereVote !== sophVote ? i : -1;
    })
    .filter((i) => i >= 0);

  const cycle = (i) => setPrefIdx((p) => p.map((v, j) => (j === i ? (v + 1) % 6 : v)));

  return (
    <CEBlock title="Voting on an agenda: sincere vs sophisticated" subtitle="Round 1 pits two proposals against each other; the winner then faces the third. Majority rule each time.">
      <div style={{display: 'grid', gap: 6}}>
        {VOTERS.map((name, i) => (
          <div key={name} style={{display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 14}}>
            <b style={{color: COLORS[i], minWidth: 44}}>{name}</b>
            <span>{ranks[i].map((a) => ALTS[a]).join(' ≻ ')}</span>
            <button type="button" style={btn(false)} onClick={() => cycle(i)}>
              change ranking
            </button>
          </div>
        ))}
      </div>
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '10px 0'}}>
        <span style={{fontSize: 14}}>Alternative voted on last:</span>
        {ALTS.map((a, i) => (
          <button key={a} type="button" style={btn(agenda === i)} onClick={() => setAgenda(i)}>
            {a}
          </button>
        ))}
      </div>
      <div style={{fontSize: 14}}>
        Agenda: <b>{ALTS[first[0]]}</b> vs <b>{ALTS[first[1]]}</b>, winner vs <b>{ALTS[last]}</b>.
      </div>
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8}}>
        <div style={{flex: '1 1 240px', fontSize: 14, padding: 8, border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 6}}>
          <b>Sincere voting</b> (vote for the option you like more, each round)
          <div>Round 1 winner: {ALTS[s1]}</div>
          <div>Final outcome: <b>{ALTS[sincere]}</b></div>
        </div>
        <div style={{flex: '1 1 240px', fontSize: 14, padding: 8, border: `2px solid ${NE_COLOR}`, borderRadius: 6}}>
          <b>Sophisticated voting</b> (backward induction)
          <div>
            If {ALTS[first[0]]} wins round 1 → final outcome {ALTS[o0]}
          </div>
          <div>
            If {ALTS[first[1]]} wins round 1 → final outcome {ALTS[o1]}
          </div>
          <div>
            So round 1 is really {ALTS[o0]} vs {ALTS[o1]} → final outcome <b style={{color: NE_COLOR}}>{ALTS[soph]}</b>
          </div>
        </div>
      </div>
      <div style={note}>
        {switchers.length > 0
          ? `${switchers.map((i) => VOTERS[i]).join(' and ')} vote${switchers.length === 1 ? 's' : ''} against their own favourite in round 1 — because of what that choice leads to in round 2.`
          : 'Here nobody needs to vote against their round-1 preference.'}{' '}
        Change the agenda order: with the same preferences, whoever sets the agenda can often choose the outcome.
      </div>
    </CEBlock>
  );
}
