import React, {useMemo, useRef, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import Bimatrix from './Bimatrix';
import {P1_COLOR, P2_COLOR, NE_COLOR, fmt, fx, rng, btn, note} from './gtCore';

/**
 * Two prisoners, two coins. Alice sees coin a and guesses Bob's coin b;
 * Bob sees b and guesses a. Both are freed if at least one guess is right.
 */
const STRATS = [
  {key: 'copy', label: 'Say what I see', f: (x) => x},
  {key: 'flip', label: 'Say the opposite', f: (x) => (x === 'H' ? 'T' : 'H')},
  {key: 'H', label: 'Always say Heads', f: () => 'H'},
  {key: 'T', label: 'Always say Tails', f: () => 'T'},
];

function releaseProb(sa, sb) {
  let wins = 0;
  for (const a of ['H', 'T']) {
    for (const b of ['H', 'T']) {
      if (sa.f(a) === b || sb.f(b) === a) wins += 1;
    }
  }
  return wins / 4;
}

export default function CoinGuessLab() {
  const [ai, setAi] = useState(2);
  const [bi, setBi] = useState(2);
  const [last, setLast] = useState(null);
  const [tally, setTally] = useState({n: 0, free: 0});
  const [reveal, setReveal] = useState(false);
  const seed = useRef(12345);
  const rand = useRef(rng(seed.current));

  const sa = STRATS[ai];
  const sb = STRATS[bi];
  const exact = releaseProb(sa, sb);

  const flip = () => (rand.current() < 0.5 ? 'H' : 'T');
  const playOnce = () => {
    const a = flip();
    const b = flip();
    const ga = sa.f(a);
    const gb = sb.f(b);
    const free = ga === b || gb === a;
    setLast({a, b, ga, gb, free});
    setTally((t) => ({n: t.n + 1, free: t.free + (free ? 1 : 0)}));
  };
  const playMany = () => {
    let free = 0;
    for (let i = 0; i < 1000; i++) {
      const a = flip();
      const b = flip();
      if (sa.f(a) === b || sb.f(b) === a) free++;
    }
    setLast(null);
    setTally((t) => ({n: t.n + 1000, free: t.free + free}));
  };
  const resetTally = () => {
    setTally({n: 0, free: 0});
    setLast(null);
  };

  const matrix = useMemo(() => STRATS.map((x) => STRATS.map((y) => [releaseProb(x, y), releaseProb(x, y)])), []);

  const coin = (c, color) => (
    <span
      style={{
        display: 'inline-flex',
        width: 30,
        height: 30,
        borderRadius: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        background: color,
        color: '#fff',
        fontWeight: 800,
      }}
    >
      {c}
    </span>
  );

  return (
    <CEBlock
      title="Guess the other prisoner's coin"
      subtitle="Each sees only their own fair coin and guesses the OTHER coin. If at least one guess is right, both go free. Can a plan beat 3/4?"
    >
      <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
        {[
          ['Alice', ai, setAi, P1_COLOR],
          ['Bob', bi, setBi, P2_COLOR],
        ].map(([who, val, set, color]) => (
          <div key={who}>
            <div style={{fontWeight: 700, color}}>{who}&apos;s plan (a function of the coin she or he sees)</div>
            <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4}}>
              {STRATS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  style={btn(val === i)}
                  onClick={() => {
                    set(i);
                    resetTally();
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap'}}>
        <button type="button" style={btn(false)} onClick={playOnce}>
          Play one round
        </button>
        <button type="button" style={btn(false)} onClick={playMany}>
          Play 1,000 rounds
        </button>
        <button type="button" style={btn(false)} onClick={resetTally}>
          Reset
        </button>
      </div>

      {last && (
        <div style={{display: 'flex', gap: 18, alignItems: 'center', marginTop: 10, fontSize: 14, flexWrap: 'wrap'}}>
          <span>
            Alice sees {coin(last.a, P1_COLOR)} → guesses Bob has <b>{last.ga}</b> {last.ga === last.b ? '✓' : '✗'}
          </span>
          <span>
            Bob sees {coin(last.b, P2_COLOR)} → guesses Alice has <b>{last.gb}</b> {last.gb === last.a ? '✓' : '✗'}
          </span>
          <b style={{color: last.free ? NE_COLOR : P2_COLOR}}>{last.free ? 'Released!' : 'Stay in prison'}</b>
        </div>
      )}

      <div style={{fontSize: 14, marginTop: 8}}>
        Rounds played: <b>{tally.n}</b> · released: <b>{tally.free}</b> · frequency:{' '}
        <b>{tally.n ? fx(tally.free / tally.n, 3) : '—'}</b>
      </div>

      <div style={{marginTop: 10}}>
        <button type="button" style={btn(reveal)} onClick={() => setReveal((v) => !v)}>
          {reveal ? 'Hide' : 'Reveal'} the exact strategic form
        </button>
      </div>
      {reveal && (
        <>
          <div style={{fontSize: 14, marginTop: 6}}>
            Exact release probability for the current plans: <b>{fmt(exact)}</b>
          </div>
          <Bimatrix
            rows={STRATS.map((s) => s.label)}
            cols={STRATS.map((s) => s.label)}
            payoffs={matrix}
            highlight={`${ai},${bi}`}
            p1="Alice"
            p2="Bob"
            onCellClick={(i, j) => {
              setAi(i);
              setBi(j);
              resetTally();
            }}
          />
          <div style={note}>
            Each cell is the probability of release, which is also each prisoner&apos;s expected utility (1 if free, 0 if not), so both entries are
            equal. Look for the cells with 1 and the cells with 1/2 — and explain why they happen.
          </div>
        </>
      )}
    </CEBlock>
  );
}
