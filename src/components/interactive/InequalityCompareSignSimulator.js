import React from 'react';
import PlaceBoard from '@site/src/components/interactive/shell/PlaceBoard';

function signs(gt, lt) {
  const chips = [];
  for (let i = 0; i < gt; i += 1) chips.push({ id: `gt${i}`, group: 'gt', label: '>' });
  for (let i = 0; i < lt; i += 1) chips.push({ id: `lt${i}`, group: 'lt', label: '<' });
  return chips;
}

const PAGES = [
  {
    lead: '已知 a < b，用「<」或「>」填空。',
    note: 'a 比 b 小。加同一个数、乘正数，方向不变；乘负数，方向改变。',
    chips: signs(3, 3),
    rows: [
      {
        id: 'add',
        marker: '（1）',
        left: 'a + 9',
        right: 'b + 9',
        answer: 'lt',
        hint: '两边加 9，方向不变。',
      },
      {
        id: 'neg',
        marker: '（2）',
        left: '−(2/3)a',
        right: '−(2/3)b',
        answer: 'gt',
        hint: '−2/3 是负数，方向改变。',
      },
      {
        id: 'root',
        marker: '（3）',
        left: '√2 a',
        right: '√2 b',
        answer: 'lt',
        hint: '√2 是正数，方向不变。',
      },
      {
        id: 'mix',
        marker: '（4）',
        left: '3a − 1.7',
        right: '3b − 1.7',
        answer: 'lt',
        hint: '先乘正数 3，再减 1.7，方向都不变。',
      },
      {
        id: 'flip',
        marker: '（5）',
        left: '√3 − 2a',
        right: '√3 − 2b',
        answer: 'gt',
        hint: '先乘 −2，方向改变；再加 √3，不再变。',
      },
    ],
  },
];

export default function InequalityCompareSignSimulator() {
  return <PlaceBoard pages={PAGES} title="练习" bankLabel="可选" />;
}
