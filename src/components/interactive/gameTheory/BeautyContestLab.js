import React, {useMemo, useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, rng, btn, note} from './gtCore';

/**
 * Guess k × (average guess) on [0, 100]. Closest guess wins.
 * Shows iterated elimination and a game against simulated level-k players.
 */
export default function BeautyContestLab() {
  const [k, setK] = useState(2 / 3);
  const [guess, setGuess] = useState(33);
  const [mix, setMix] = useState(1); // 0 = naive crowd, 1 = level-1 heavy, 2 = sophisticated
  const [seed, setSeed] = useState(7);
  const [played, setPlayed] = useState(null);

  const rounds = useMemo(() => {
    const out = [100];
    for (let i = 0; i < 10; i++) out.push(out[out.length - 1] * k);
    return out;
  }, [k]);

  const play = () => {
    const r = rng(seed);
    const dist = [
      [0.6, 0.3, 0.1, 0],
      [0.25, 0.4, 0.25, 0.1],
      [0.05, 0.2, 0.35, 0.4],
    ][mix];
    const others = Array.from({length: 19}, () => {
      const u = r();
      let level = 0;
      let acc = dist[0];
      while (u > acc && level < 3) acc += dist[++level];
      const anchor = level === 0 ? r() * 100 : 50 * Math.pow(k, level);
      const noise = level === 0 ? 0 : (r() - 0.5) * 6;
      return {level, g: Math.min(100, Math.max(0, anchor + noise))};
    });
    const all = [...others.map((o) => o.g), guess];
    const avg = all.reduce((s, v) => s + v, 0) / all.length;
    const target = k * avg;
    const dists = all.map((g) => Math.abs(g - target));
    const best = Math.min(...dists);
    setPlayed({others, avg, target, youWin: Math.abs(dists[dists.length - 1] - best) < 1e-9, winner: all[dists.indexOf(best)]});
    setSeed((s) => s + 1);
  };

  const W = 440;
  const X = (v) => 20 + (v / 100) * (W - 40);

  return (
    <CEBlock title="Guess two-thirds of the average" subtitle="Everyone picks a number from 0 to 100. The winner is whoever is closest to k times the average guess.">
      <label style={{display: 'block', fontSize: 14}}>
        Multiplier k = <b>{fx(k, 2)}</b>{' '}
        <input type="range" min={0.1} max={0.95} step={0.05} value={k} onChange={(e) => { setK(Number(e.target.value)); setPlayed(null); }} style={{width: 180, verticalAlign: 'middle'}} />
      </label>

      <div style={{fontWeight: 700, fontSize: 13, marginTop: 8}}>Iterated elimination of dominated guesses</div>
      <svg viewBox={`0 0 ${W} 120`} style={{width: '100%', maxWidth: W}}>
        {rounds.slice(0, 7).map((hi, i) => (
          <g key={i}>
            <rect x={X(0)} y={6 + i * 16} width={X(hi) - X(0)} height={11} fill={P1_COLOR} opacity={0.25 + i * 0.1} />
            <text x={X(hi) + 4} y={15 + i * 16} fontSize="10" fill="var(--ifm-font-color-base)">
              round {i}: [0, {fx(hi, 1)}]
            </text>
          </g>
        ))}
      </svg>
      <div style={note}>
        No average can exceed 100, so any guess above {fx(100 * k, 1)} is beaten by {fx(100 * k, 1)} itself — it is dominated. If everyone knows that, the average is at
        most {fx(100 * k, 1)}, so guesses above {fx(100 * k * k, 1)} go next… Common knowledge of rationality leaves only <b>0</b>.
      </div>

      <div style={{fontWeight: 700, fontSize: 13, marginTop: 10}}>Now play against 19 simulated people</div>
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0'}}>
        {['Mostly naive crowd', 'Typical classroom', 'Game theorists'].map((t, i) => (
          <button key={t} type="button" style={btn(mix === i)} onClick={() => { setMix(i); setPlayed(null); }}>
            {t}
          </button>
        ))}
      </div>
      <label style={{display: 'block', fontSize: 14}}>
        Your guess = <b>{guess}</b>{' '}
        <input type="range" min={0} max={100} step={1} value={guess} onChange={(e) => setGuess(Number(e.target.value))} style={{width: 200, verticalAlign: 'middle'}} />{' '}
        <button type="button" style={btn(false)} onClick={play}>
          Play a round
        </button>
      </label>
      {played && (
        <>
          <svg viewBox={`0 0 ${W} 70`} style={{width: '100%', maxWidth: W}}>
            <line x1={X(0)} y1={40} x2={X(100)} y2={40} stroke="var(--ifm-color-emphasis-500)" />
            {played.others.map((o, i) => (
              <circle key={i} cx={X(o.g)} cy={40 - (i % 3) * 7} r={4} fill={P2_COLOR} opacity={0.6} />
            ))}
            <circle cx={X(guess)} cy={40} r={6} fill={P1_COLOR} />
            <line x1={X(played.target)} y1={8} x2={X(played.target)} y2={52} stroke={NE_COLOR} strokeWidth={2} />
            <text x={X(played.target)} y={64} fontSize="10" textAnchor="middle" fill={NE_COLOR}>
              target {fx(played.target, 1)}
            </text>
          </svg>
          <div style={{fontSize: 14}}>
            Average {fx(played.avg, 1)} → target k × average = <b>{fx(played.target, 1)}</b>. Winning guess {fx(played.winner, 1)}.{' '}
            <b style={{color: played.youWin ? NE_COLOR : P2_COLOR}}>{played.youWin ? 'You win!' : 'You did not win this round.'}</b>
          </div>
          <div style={note}>
            Simulated players reason to “level” 0 (random), 1 (best reply to random: {fx(50 * k, 1)}), 2 ({fx(50 * k * k, 1)}) or 3. Guessing 0 is the only rationalizable choice, yet
            it rarely wins against real people — rationality is common knowledge only in the model.
          </div>
        </>
      )}
    </CEBlock>
  );
}
