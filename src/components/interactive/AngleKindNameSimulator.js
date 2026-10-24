import React from 'react';
import PlaceBoard from '@site/src/components/interactive/shell/PlaceBoard';

const KIND_CHIPS = [
  { id: 'acute', group: 'acute', label: '锐角' },
  { id: 'right', group: 'right', label: '直角' },
  { id: 'obtuse', group: 'obtuse', label: '钝角' },
  { id: 'straight', group: 'straight', label: '平角' },
  { id: 'reflex', group: 'reflex', label: '优角' },
  { id: 'full', group: 'full', label: '周角' },
  { id: 'comp', group: 'comp', label: '余角' },
  { id: 'supp', group: 'supp', label: '补角' },
];

function nameChips(...groups) {
  return KIND_CHIPS.filter((c) => groups.includes(c.group));
}

function boundChips(ids) {
  return ids.map((id) => ({ id, group: id, label: id === '0' ? '0°' : `${id}°` }));
}

function sayPage(deg, kind, lo, hi, note) {
  const extraBounds = ['0', '90', '180', '360'].filter((b) => b !== lo && b !== hi);
  return {
    lead: `${deg} 的角叫什么角？用「……是一个……角，因为它大于……，小于……」来说。`,
    note,
    chips: [...nameChips('acute', 'right', 'obtuse', 'straight', 'reflex', 'full'), ...boundChips([lo, hi, ...extraBounds.slice(0, 2)])],
    rows: [
      {
        id: 'kind',
        marker: '',
        left: `${deg} 是一个`,
        right: '角',
        answer: kind,
        hint: `先和 90°、180°、360° 比大小。`,
      },
      {
        id: 'lo',
        marker: '',
        left: '因为它大于',
        right: '',
        answer: lo,
        hint: '下界是这一类角必须超过的度数。',
      },
      {
        id: 'hi',
        marker: '',
        left: '小于',
        right: '',
        answer: hi,
        hint: '上界是这一类角到不了的度数。',
      },
    ],
  };
}

const PAGES = [
  {
    lead: '除了余角、补角（说的是两个角的和），还可以按一个角自己的大小起名字。把名称拖到对应的范围。',
    note: '锐、直、钝、平、优、周是一个角的名字；余角、补角是两个角之间的关系。',
    chips: KIND_CHIPS,
    rows: [
      {
        id: 'acute',
        marker: '',
        left: '大于 0°、小于 90°',
        right: '',
        answer: 'acute',
        hint: '不到直角，叫锐角。',
      },
      {
        id: 'right',
        marker: '',
        left: '等于 90°',
        right: '',
        answer: 'right',
        hint: '三角尺上那只「方的」角是直角。',
      },
      {
        id: 'obtuse',
        marker: '',
        left: '大于 90°、小于 180°',
        right: '',
        answer: 'obtuse',
        hint: '比直角大、比平角小，叫钝角。',
      },
      {
        id: 'straight',
        marker: '',
        left: '等于 180°',
        right: '',
        answer: 'straight',
        hint: '两边成一条直线，是平角。',
      },
      {
        id: 'reflex',
        marker: '',
        left: '大于 180°、小于 360°',
        right: '',
        answer: 'reflex',
        hint: '比平角大、不到一周，有时叫优角。',
      },
      {
        id: 'full',
        marker: '',
        left: '等于 360°',
        right: '',
        answer: 'full',
        hint: '终边转回始边，是周角。',
      },
    ],
  },
  sayPage('120°', 'obtuse', '90', '180', '课本口头练习：一百二十度是一个钝角，因为它大于 90°，小于 180°。'),
  sayPage('45°', 'acute', '0', '90', '不到直角的角都是锐角。'),
  sayPage('210°', 'reflex', '180', '360', '超过平角、不到一周，叫优角。钟面上从 12 转到 7 的优角就是这一类。'),
  sayPage('270°', 'reflex', '180', '360', '270° 仍小于 360°，所以是优角，不是周角。'),
  {
    lead: '九十度、一百八十度是「等于」某条界线，不能再说大于、小于。',
    note: '直角、平角、周角都落在界线上。',
    chips: [
      ...nameChips('acute', 'right', 'obtuse', 'straight', 'reflex', 'full'),
      { id: 'eq90', group: 'eq90', label: '等于 90°' },
      { id: 'eq180', group: 'eq180', label: '等于 180°' },
      { id: 'gt90', group: 'gt90', label: '大于 90°' },
      { id: 'lt180', group: 'lt180', label: '小于 180°' },
    ],
    rows: [
      {
        id: 'r90',
        marker: '',
        left: '90° 是一个',
        right: '角',
        answer: 'right',
        hint: '刚好 90°，是直角。',
      },
      {
        id: 'why90',
        marker: '',
        left: '因为它',
        right: '',
        answer: 'eq90',
        hint: '直角的定义是等于 90°，不是大于或小于。',
      },
      {
        id: 'r180',
        marker: '',
        left: '180° 是一个',
        right: '角',
        answer: 'straight',
        hint: '刚好 180°，是平角。',
      },
      {
        id: 'why180',
        marker: '',
        left: '因为它',
        right: '',
        answer: 'eq180',
        hint: '平角的定义是等于 180°。',
      },
    ],
  },
];

export default function AngleKindNameSimulator() {
  return <PlaceBoard pages={PAGES} title="角的大小名称" bankLabel="可选" />;
}
