import React from 'react';
import PlaceBoard from '@site/src/components/interactive/shell/PlaceBoard';

const RULES = [
  { id: 'p1', group: 'p1', label: '>', detail: '性质 1 · 方向不变' },
  { id: 'p2', group: 'p2', label: '>', detail: '性质 2 · 方向不变' },
  { id: 'p3', group: 'p3', label: '<', detail: '性质 3 · 方向改变' },
];

const lead = '设 a > b，用「<」或「>」填空，并说明依据哪条性质。';

function signChips(gt, lt) {
  const chips = [];
  for (let i = 0; i < gt; i += 1) chips.push({ id: `gt${i}`, group: 'gt', label: '>' });
  for (let i = 0; i < lt; i += 1) chips.push({ id: `lt${i}`, group: 'lt', label: '<' });
  chips.push(
    { id: 'p1', group: 'p1', label: '性质 1', detail: '方向不变' },
    { id: 'p2', group: 'p2', label: '性质 2', detail: '方向不变' },
    { id: 'p3', group: 'p3', label: '性质 3', detail: '方向改变' },
  );
  return chips;
}

const PAGES = [
  {
    lead,
    note: '第（1）问已经填好。把性质拖到后面的空位。',
    chips: RULES,
    rows: [
      { id: 'ex', marker: '（1）', left: 'a − 3', right: 'b − 3', given: { label: '>', detail: '不等式的性质 1' } },
      { id: 'pos', marker: '（2）', left: '10a', right: '10b', answer: 'p2', hint: '乘正数，方向不变。' },
      { id: 'neg', marker: '（3）', left: '−9a', right: '−9b', answer: 'p3', hint: '乘负数，方向改变。' },
    ],
  },
  {
    lead,
    note: '第（1）问已经填好。把性质拖到后面的空位。',
    chips: RULES,
    rows: [
      { id: 'ex', marker: '（1）', left: '−2a', right: '−2b', given: { label: '<', detail: '不等式的性质 3' } },
      { id: 'add', marker: '（2）', left: 'a + 5', right: 'b + 5', answer: 'p1', hint: '两边加同一个数，方向不变。' },
      { id: 'div', marker: '（3）', left: 'a / 4', right: 'b / 4', answer: 'p2', hint: '除以正数，方向不变。' },
    ],
  },
  {
    lead,
    note: '第（1）问已经填好。把性质拖到后面的空位。',
    chips: RULES,
    rows: [
      { id: 'ex', marker: '（1）', left: '3a', right: '3b', given: { label: '>', detail: '不等式的性质 2' } },
      { id: 'sub', marker: '（2）', left: 'a − 8', right: 'b − 8', answer: 'p1', hint: '两边减同一个数，方向不变。' },
      { id: 'neg', marker: '（3）', left: '−5a', right: '−5b', answer: 'p3', hint: '乘负数，方向改变。' },
    ],
  },
  {
    lead,
    note: '第（4）问已经填好。（5）要先处理 −3.5，再看加 1。',
    chips: signChips(1, 2),
    rows: [
      {
        id: 'ex',
        marker: '（4）',
        left: 'a/2',
        right: 'b/2',
        given: { label: '>' },
        paren: { given: { label: '不等式的性质 2' } },
      },
      {
        id: 'final',
        marker: '（5）',
        left: '−3.5a + 1',
        right: '−3.5b + 1',
        answer: 'lt',
        hint: '方向已经在乘 −3.5 时改变了，再加 1 不再变。',
        paren: { answer: 'p1', hint: '两边加 1，用性质 1。' },
      },
      {
        id: 'mid',
        marker: '因为',
        follow: true,
        left: '−3.5a',
        right: '−3.5b',
        answer: 'lt',
        hint: '−3.5 是负数，方向改变。',
        paren: { answer: 'p3', hint: '乘负数，用性质 3。' },
      },
    ],
  },
  {
    lead,
    note: '先看系数是不是负数，再看后面加的数。',
    chips: signChips(1, 2),
    rows: [
      {
        id: 'ex',
        marker: '（1）',
        left: 'a − 6',
        right: 'b − 6',
        given: { label: '>' },
        paren: { given: { label: '不等式的性质 1' } },
      },
      {
        id: 'final',
        marker: '（2）',
        left: '−4a − 1',
        right: '−4b − 1',
        answer: 'lt',
        hint: '乘 −4 已经把方向反过来了，再减 1 不再变。',
        paren: { answer: 'p1', hint: '两边减 1，用性质 1。' },
      },
      {
        id: 'mid',
        marker: '因为',
        follow: true,
        left: '−4a',
        right: '−4b',
        answer: 'lt',
        hint: '−4 是负数，方向改变。',
        paren: { answer: 'p3', hint: '乘负数，用性质 3。' },
      },
    ],
  },
  {
    lead,
    note: '先看除以的数是不是正数，再看后面加的数。',
    chips: signChips(2, 1),
    rows: [
      {
        id: 'ex',
        marker: '（1）',
        left: '−a',
        right: '−b',
        given: { label: '<' },
        paren: { given: { label: '不等式的性质 3' } },
      },
      {
        id: 'final',
        marker: '（2）',
        left: 'a/2 + 1',
        right: 'b/2 + 1',
        answer: 'gt',
        hint: '除以 2 方向不变，再加 1 也不变。',
        paren: { answer: 'p1', hint: '两边加 1，用性质 1。' },
      },
      {
        id: 'mid',
        marker: '因为',
        follow: true,
        left: 'a/2',
        right: 'b/2',
        answer: 'gt',
        hint: '2 是正数，方向不变。',
        paren: { answer: 'p2', hint: '除以正数，用性质 2。' },
      },
    ],
  },
];

export default function InequalityPropertyPlaceSimulator() {
  return <PlaceBoard pages={PAGES} bankLabel="可选" />;
}
