import React from 'react';

const RULES = [
  {
    id: '1',
    title: '不等式的性质 1',
    body: '不等式两边加（或减）同一个数（或式子），不等号的方向不变。',
    symbol: '如果 a > b，那么 a ± c > b ± c。',
    accent: 'var(--ifm-color-primary)',
  },
  {
    id: '2',
    title: '不等式的性质 2',
    body: '不等式两边乘（或除以）同一个正数，不等号的方向不变。',
    symbol: '如果 a > b，并且 c > 0，那么 ac > bc。',
    accent: '#2e7d32',
  },
  {
    id: '3',
    title: '不等式的性质 3',
    body: '不等式两边乘（或除以）同一个负数，不等号的方向改变。',
    symbol: '如果 a > b，并且 c < 0，那么 ac < bc。',
    accent: '#c62828',
  },
];

export default function InequalityPropertyRuleCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
        margin: '12px 0 20px',
      }}
    >
      {RULES.map((rule) => (
        <article
          key={rule.id}
          style={{
            border: '1px solid var(--ifm-color-emphasis-300)',
            borderTop: `4px solid ${rule.accent}`,
            borderRadius: 10,
            background: 'var(--ifm-background-surface-color, var(--ifm-background-color))',
            padding: '14px 16px 16px',
          }}
        >
          <div style={{ fontWeight: 700, color: rule.accent, marginBottom: 8 }}>{rule.title}</div>
          <div style={{ lineHeight: 1.55 }}>{rule.body}</div>
          <div
            style={{
              marginTop: 10,
              color: 'var(--ifm-color-emphasis-700)',
              fontSize: '0.92rem',
            }}
          >
            {rule.symbol}
          </div>
        </article>
      ))}
    </div>
  );
}
