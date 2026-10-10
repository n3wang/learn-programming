import React from 'react';
import PlaceBoard from '@site/src/components/interactive/shell/PlaceBoard';

const lead = '根据不等式的性质填空，并说明理由。';

function resultChips(correct, wrongs) {
  return [
    { id: 'ok', group: 'ok', label: correct },
    ...wrongs.map((label, index) => ({ id: `w${index}`, group: `w${index}`, label })),
    { id: 'p2', group: 'p2', label: '不等式的性质 2' },
    { id: 'p3', group: 'p3', label: '不等式的性质 3' },
  ];
}

const PAGES = [
  {
    lead,
    note: '第（3）问已经填好。第（4）问的乘数是负数。',
    chips: resultChips('x < −8/7', ['x > −8/7', 'x < 8/7']),
    rows: [
      {
        id: 'ex',
        marker: '（3）',
        sentence: '(3/5)m > 2，两边都除以 3/5，得',
        given: { label: 'm > 10/3' },
        paren: { given: { label: '不等式的性质 2' } },
      },
      {
        id: 'q',
        marker: '（4）',
        sentence: '−(7/8)x > 1，两边都乘 −8/7，得',
        answer: 'ok',
        hint: '−8/7 是负数，不等号要反过来。右边是 1 × (−8/7)。',
        paren: { answer: 'p3', hint: '乘负数，用性质 3。' },
      },
    ],
  },
  {
    lead,
    note: '除以负数时，不等号方向改变。',
    chips: resultChips('y > −5', ['y < −5', 'y > 5']),
    rows: [
      {
        id: 'ex',
        marker: '（1）',
        sentence: '5y < 20，两边都除以 5，得',
        given: { label: 'y < 4' },
        paren: { given: { label: '不等式的性质 2' } },
      },
      {
        id: 'q',
        marker: '（2）',
        sentence: '−4y < 20，两边都除以 −4，得',
        answer: 'ok',
        hint: '−4 是负数，20 ÷ (−4) = −5，不等号要反过来。',
        paren: { answer: 'p3', hint: '除以负数，用性质 3。' },
      },
    ],
  },
  {
    lead,
    note: '乘一个数，等于除以它的倒数。先看这个数的符号。',
    chips: resultChips('b < −8', ['b > −8', 'b < 8']),
    rows: [
      {
        id: 'ex',
        marker: '（1）',
        sentence: '(2/3)a < 4，两边都乘 3/2，得',
        given: { label: 'a < 6' },
        paren: { given: { label: '不等式的性质 2' } },
      },
      {
        id: 'q',
        marker: '（2）',
        sentence: '−(3/4)b > 6，两边都乘 −4/3，得',
        answer: 'ok',
        hint: '−4/3 是负数，6 × (−4/3) = −8，不等号要反过来。',
        paren: { answer: 'p3', hint: '乘负数，用性质 3。' },
      },
    ],
  },
  {
    lead,
    note: '这一题的除数是正数，方向不变。',
    chips: resultChips('n > −5/2', ['n < −5/2', 'n > 5/2']),
    rows: [
      {
        id: 'ex',
        marker: '（1）',
        sentence: '−2m < 6，两边都除以 −2，得',
        given: { label: 'm > −3' },
        paren: { given: { label: '不等式的性质 3' } },
      },
      {
        id: 'q',
        marker: '（2）',
        sentence: '(4/5)n > −2，两边都除以 4/5，得',
        answer: 'ok',
        hint: '4/5 是正数，方向不变。−2 ÷ (4/5) = −5/2。',
        paren: { answer: 'p2', hint: '除以正数，用性质 2。' },
      },
    ],
  },
];

export default function InequalityPropertyResultSimulator() {
  return <PlaceBoard pages={PAGES} bankLabel="可选" />;
}
