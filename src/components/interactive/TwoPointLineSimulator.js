import React, { useState } from 'react';
import Typography from '@site/src/components/ui/Typography';

const LINE = '#1565c0';
const DOT = '#c62828';

function throughOne(n) {
  const lines = [];
  for (let i = 0; i < n; i += 1) {
    const a = (-70 + (140 * i) / Math.max(n - 1, 1)) * (Math.PI / 180);
    const dx = Math.cos(a) * 118;
    const dy = Math.sin(a) * 70;
    lines.push(
      <line key={i} x1={160 - dx} y1={78 - dy} x2={160 + dx} y2={78 + dy} stroke={LINE} strokeWidth="1.4" />,
    );
  }
  return lines;
}

export default function TwoPointLineSimulator() {
  const [mode, setMode] = useState('two');
  const [count, setCount] = useState(5);

  return (
    <div>
      <Typography sx={{ mb: 1 }}>
        经过一个点能画几条直线？经过两个点呢？
      </Typography>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {[
          ['one', '经过一个点'],
          ['two', '经过两个点'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: mode === id ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
        {mode === 'one' ? (
          <button
            type="button"
            onClick={() => setCount((n) => Math.min(n + 1, 9))}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            再画一条
          </button>
        ) : null}
      </div>
      <svg viewBox="0 0 320 156" width="100%" height="156" role="img">
        {mode === 'one' ? throughOne(count) : (
          <line x1="36" y1="108" x2="284" y2="48" stroke={LINE} strokeWidth="1.6" />
        )}
        <circle cx="160" cy="78" r="4.5" fill={DOT} />
        <text x="168" y="72" fontSize="13" fill="#333">A</text>
        {mode === 'two' ? (
          <>
            <circle cx="108" cy="96" r="4.5" fill={DOT} />
            <text x="92" y="112" fontSize="13" fill="#333">B</text>
          </>
        ) : null}
      </svg>
      <Typography variant="body2" color="text.secondary">
        {mode === 'one'
          ? '经过一个点可以画无数条直线。点一下「再画一条」，条数还可以继续增加。'
          : '经过两个点有一条直线，并且只有一条直线。简单说成：两点确定一条直线。'}
      </Typography>
    </div>
  );
}
