import React, { useMemo, useState } from 'react';
import Stack from '@site/src/components/ui/Stack';
import Button from '@site/src/components/ui/Button';
import Typography from '@site/src/components/ui/Typography';
import ToggleButton from '@site/src/components/ui/ToggleButton';
import CEBlock from '@site/src/components/interactive/shell/CEBlock';
import { useSvgPointer, fmt } from './svgDrag';

/**
 * 20.4 最短路径问题（将军饮马）：A、B 在河 l 的同侧，在 l 上找 P 使 PA + PB 最小。
 * 拖 P 找最小值，记录「目前最短」，再打开「作 A 关于 l 的对称点 A′」看原理。
 */
const W = 380;
const H = 250;
const RIVER = 190;
const U = 20; // px per km

function randomCase() {
  const ay = 40 + Math.random() * 90;
  const by = 40 + Math.random() * 110;
  const ax = 40 + Math.random() * 80;
  const bx = 250 + Math.random() * 90;
  return { A: { x: ax, y: ay }, B: { x: bx, y: by } };
}

export default function ShortestPathSimulator() {
  const [cs, setCs] = useState(() => ({ A: { x: 70, y: 70 }, B: { x: 300, y: 120 } }));
  const [px, setPx] = useState(150);
  const [best, setBest] = useState(Infinity);
  const [reveal, setReveal] = useState(false);
  const { A, B } = cs;
  const len = (x) => (Math.hypot(x - A.x, RIVER - A.y) + Math.hypot(x - B.x, RIVER - B.y)) / U;
  const optX = useMemo(() => {
    const da = RIVER - A.y;
    const db = RIVER - B.y;
    return A.x + ((B.x - A.x) * da) / (da + db);
  }, [A, B]);
  const minLen = len(optX);
  const cur = len(px);
  const { ref, bind } = useSvgPointer(({ x }) => {
    const nx = Math.max(10, Math.min(W - 10, x));
    setPx(nx);
    setBest((b) => Math.min(b, len(nx)));
  });
  const reset = () => {
    setCs(randomCase());
    setPx(W / 2);
    setBest(Infinity);
    setReveal(false);
  };
  const Ap = { x: A.x, y: 2 * RIVER - A.y };
  const close = cur - minLen < 0.02;
  return (
    <CEBlock title="将军饮马：在河边找一点 P" subtitle="沿河岸拖动 P，让 PA + PB 尽量短">
      <CEBlock.Section>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          <ToggleButton value="r" size="small" selected={reveal} onClick={() => setReveal(!reveal)}>
            {reveal ? '隐藏作法' : '💡 作 A 关于 l 的对称点 A′'}
          </ToggleButton>
          <Button size="small" variant="outlined" onClick={reset}>
            换一组 A、B
          </Button>
        </Stack>
        <svg ref={ref} viewBox={`0 0 ${W} ${H + (reveal ? 120 : 20)}`} style={{ width: '100%', maxWidth: W, display: 'block', ...bind.style }} {...bind}>
          <rect x={0} y={RIVER} width={W} height={reveal ? 140 : 40} fill="rgba(74,144,217,0.12)" />
          <line x1={0} x2={W} y1={RIVER} y2={RIVER} stroke="#4a90d9" strokeWidth="2" />
          <text x={W - 18} y={RIVER - 6} fontSize="13" fontStyle="italic" fill="#4a90d9">l</text>
          <line x1={A.x} y1={A.y} x2={px} y2={RIVER} stroke="#2a9d8f" strokeWidth="2" />
          <line x1={px} y1={RIVER} x2={B.x} y2={B.y} stroke="#2a9d8f" strokeWidth="2" />
          {reveal ? (
            <g>
              <line x1={A.x} y1={A.y} x2={Ap.x} y2={Ap.y} stroke="var(--ifm-color-emphasis-500)" strokeDasharray="3 3" />
              <line x1={Ap.x} y1={Ap.y} x2={px} y2={RIVER} stroke="#e0245e" strokeWidth="1.6" strokeDasharray="6 4" />
              <line x1={Ap.x} y1={Ap.y} x2={B.x} y2={B.y} stroke="#e0245e" strokeWidth="1" opacity="0.6" />
              <circle cx={optX} cy={RIVER} r="4" fill="none" stroke="#e0245e" strokeWidth="2" />
              <circle cx={Ap.x} cy={Ap.y} r="3" fill="#e0245e" />
              <text x={Ap.x - 20} y={Ap.y + 5} fontSize="14" fill="#e0245e">A′</text>
            </g>
          ) : null}
          {[['A', A], ['B', B]].map(([n, p]) => (
            <g key={n}>
              <circle cx={p.x} cy={p.y} r="4" fill="var(--ifm-font-color-base)" />
              <text x={p.x - 5} y={p.y - 9} fontSize="14" fontWeight="700" fill="var(--ifm-font-color-base)">{n}</text>
            </g>
          ))}
          <circle cx={px} cy={RIVER} r="9" fill={close ? '#2e7d32' : '#e0245e'} opacity="0.85" />
          <text x={px - 4} y={RIVER + 26} fontSize="14" fontWeight="700" fill="var(--ifm-font-color-base)">P</text>
        </svg>
        <Typography sx={{ mt: 1, fontVariantNumeric: 'tabular-nums' }}>
          PA + PB = <b>{fmt(cur, 2)}</b>　目前最短：{Number.isFinite(best) ? fmt(best, 2) : '—'}
          {close ? <b style={{ color: '#2e7d32' }}>　已经是最短了！</b> : null}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {reveal
            ? `因为 l 是 AA′ 的垂直平分线，PA = PA′，所以 PA + PB = PA′ + PB。两点之间线段最短：P 落在 A′B 与 l 的交点（红圈）时最短，最短长度就是 A′B = ${fmt(minLen, 2)}。`
            : '先自己拖一拖，找找最短的位置在哪里。找到了再打开「作对称点」看为什么。'}
        </Typography>
      </CEBlock.Section>
    </CEBlock>
  );
}
