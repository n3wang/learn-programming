import React, {useState} from 'react';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import {P1_COLOR, P2_COLOR, NE_COLOR, fx, btn, note} from './gtCore';

/**
 * Buyer and seller with private values uniform on [0,1] name prices at once;
 * trade at the midpoint if bid ≥ ask. Compares the linear equilibrium with a one-price equilibrium.
 */
export default function DoubleAuctionLab() {
  const [eq, setEq] = useState('linear');
  const [X, setXp] = useState(0.5);
  const [vb, setVb] = useState(0.7);
  const [vs, setVs] = useState(0.4);

  const bid = eq === 'linear' ? (2 / 3) * vb + 1 / 12 : vb >= X ? X : 0;
  const ask = eq === 'linear' ? (2 / 3) * vs + 1 / 4 : vs <= X ? X : 1;
  const trade = bid >= ask;
  const price = (bid + ask) / 2;

  // expected gains from trade: efficient = 1/6
  const eff = 1 / 6;
  const gains = eq === 'linear' ? 9 / 64 : X * (1 - X) * 0.5; // one-price: E[(vb-vs); vs≤X≤vb] = X(1−X)/2
  const W = 260;
  const pad = 30;
  const S = (v) => pad + v * (W - 2 * pad);
  const T = (v) => W - pad - v * (W - 2 * pad);

  return (
    <CEBlock title="Double auction: bargaining with private values" subtitle="Seller (value v_s) asks, buyer (value v_b) bids, simultaneously. If bid ≥ ask they trade at the midpoint. Values are private and uniform on [0, 1].">
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6}}>
        <button type="button" style={btn(eq === 'linear')} onClick={() => setEq('linear')}>
          Linear equilibrium
        </button>
        <button type="button" style={btn(eq === 'one')} onClick={() => setEq('one')}>
          One-price equilibrium
        </button>
      </div>
      {eq === 'one' && (
        <label style={{display: 'block', fontSize: 14}}>
          Posted price X = <b>{fx(X, 2)}</b> <input type="range" min={0.05} max={0.95} step={0.05} value={X} onChange={(e) => setXp(Number(e.target.value))} style={{width: 160, verticalAlign: 'middle'}} />
        </label>
      )}
      <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
        <svg viewBox={`0 0 ${W} ${W}`} style={{flex: '0 1 260px', maxWidth: W}}>
          <rect x={pad} y={pad} width={W - 2 * pad} height={W - 2 * pad} fill="none" stroke="var(--ifm-color-emphasis-400)" />
          <polygon points={`${S(0)},${T(0)} ${S(1)},${T(1)} ${S(0)},${T(1)}`} fill="rgba(37,99,235,0.12)" />
          {eq === 'linear' ? (
            <polygon points={`${S(0)},${T(0.25)} ${S(0.75)},${T(1)} ${S(0)},${T(1)}`} fill="rgba(22,163,74,0.35)" />
          ) : (
            <rect x={S(0)} y={T(1)} width={S(X) - S(0)} height={T(X) - T(1)} fill="rgba(22,163,74,0.35)" />
          )}
          <line x1={S(0)} y1={T(0)} x2={S(1)} y2={T(1)} stroke={P1_COLOR} />
          <circle cx={S(vs)} cy={T(vb)} r={5} fill={trade ? NE_COLOR : P2_COLOR} stroke="#000" strokeWidth={0.5} />
          <text x={W / 2} y={W - 6} fontSize="10" textAnchor="middle" fill="var(--ifm-font-color-base)">seller value v_s</text>
          <text x={10} y={W / 2} fontSize="10" textAnchor="middle" transform={`rotate(-90 10 ${W / 2})`} fill="var(--ifm-font-color-base)">buyer value v_b</text>
        </svg>
        <div style={{flex: '1 1 260px', fontSize: 14}}>
          <label style={{display: 'block'}}>
            Buyer value v_b = <b>{fx(vb, 2)}</b> <input type="range" min={0} max={1} step={0.01} value={vb} onChange={(e) => setVb(Number(e.target.value))} style={{width: 140, verticalAlign: 'middle'}} />
          </label>
          <label style={{display: 'block'}}>
            Seller value v_s = <b>{fx(vs, 2)}</b> <input type="range" min={0} max={1} step={0.01} value={vs} onChange={(e) => setVs(Number(e.target.value))} style={{width: 140, verticalAlign: 'middle'}} />
          </label>
          <div style={{marginTop: 6}}>
            {eq === 'linear' ? (
              <>
                Bid = ⅔·v_b + 1/12 = <b>{fx(bid, 3)}</b>, ask = ⅔·v_s + ¼ = <b>{fx(ask, 3)}</b>
              </>
            ) : (
              <>
                Bid = {vb >= X ? 'X' : '0'} = <b>{fx(bid, 2)}</b>, ask = {vs <= X ? 'X' : '1'} = <b>{fx(ask, 2)}</b>
              </>
            )}
          </div>
          <div style={{fontWeight: 700, color: trade ? NE_COLOR : P2_COLOR}}>
            {trade
              ? `Trade at ${fx(price, 3)}: buyer gains ${fx(vb - price, 3)}, seller gains ${fx(price - vs, 3)}`
              : vb > vs
                ? `No trade — even though the buyer values it more (${fx(vb, 2)} > ${fx(vs, 2)}). Gains of ${fx(vb - vs, 2)} are lost.`
                : 'No trade (the seller values it more — efficient).'}
          </div>
          <div style={{marginTop: 8}}>
            Expected gains from trade: <b>{fx(gains, 4)}</b> vs efficient {fx(eff, 4)} → {fx((100 * gains) / eff, 1)}% realised.
          </div>
        </div>
      </div>
      <div style={note}>
        Blue triangle: trade is efficient (v_b &gt; v_s). Green: trade happens in equilibrium. In the linear equilibrium they trade only if v_b ≥ v_s + ¼ — each side shades its
        price to get a better split, and some valuable trades fail. Private information makes bargaining inefficient.
      </div>
    </CEBlock>
  );
}
