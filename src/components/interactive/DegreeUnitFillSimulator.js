import React from 'react';
import PlaceBoard from '@site/src/components/interactive/shell/PlaceBoard';

/** 课本「问题 5」：量角器与度、分、秒定义，拖词填空。 */
const PAGES = [
  {
    lead: '在小学，角是怎样度量的？度量角的常用单位是什么？',
    note: '把卡片拖进空位（或点选）。空心提示在课本里用蓝色标出的关键词。',
    chips: [
      { id: 'protractor', label: '量角器' },
      { id: 'dms', label: '度、分、秒' },
      { id: 'full360', label: '把一个周角 360 等分' },
      { id: 'deg60', label: '把 1 度的角 60 等分' },
      { id: 'min60', label: '把 1′ 的角 60 等分' },
      { id: 'ruler', label: '直尺' },
      { id: 'half180', label: '把一个平角 180 等分' },
      { id: 'dm', label: '度、分' },
    ],
    rows: [
      {
        id: 'tool',
        marker: '',
        left: '我们常用',
        right: '量角',
        answer: 'protractor',
        hint: '量角用的是量角器。',
      },
      {
        id: 'units',
        marker: '',
        left: '',
        right: '是常用的角的度量单位',
        answer: 'dms',
        hint: '常用单位是度、分、秒。',
      },
      {
        id: 'degree',
        marker: '',
        left: '',
        right: '，每一份就是 1°',
        answer: 'full360',
        hint: '一周角分成 360 份，每一份是 1°。',
      },
      {
        id: 'minute',
        marker: '',
        left: '',
        right: '，每一份叫作 1′',
        answer: 'deg60',
        hint: '1° 再 60 等分，得到 1′。',
      },
      {
        id: 'second',
        marker: '',
        left: '',
        right: '，每一份叫作 1″',
        answer: 'min60',
        hint: '1′ 再 60 等分，得到 1″。',
      },
    ],
  },
  {
    lead: '写出度、分、秒之间的换算。',
    note: '两个「60」可以互换。平角是周角的一半。',
    chips: [
      { id: 'n360', group: '360', label: '360' },
      { id: 'n180', group: '180', label: '180' },
      { id: 'n60a', group: '60', label: '60' },
      { id: 'n60b', group: '60', label: '60' },
      { id: 'n90', group: '90', label: '90' },
      { id: 'n100', group: '100', label: '100' },
    ],
    rows: [
      {
        id: 'full',
        marker: '（1）',
        left: '1 周角 =',
        right: '°',
        answer: '360',
        hint: '把周角 360 等分，每一份是 1°。',
      },
      {
        id: 'straight',
        marker: '（2）',
        left: '1 平角 =',
        right: '°',
        answer: '180',
        hint: '平角是周角的一半，180°。',
      },
      {
        id: 'deg',
        marker: '（3）',
        left: '1° =',
        right: '′',
        answer: '60',
        hint: '1° = 60′（六十进制）。',
      },
      {
        id: 'min',
        marker: '（4）',
        left: '1′ =',
        right: '″',
        answer: '60',
        hint: '1′ = 60″（六十进制）。',
      },
    ],
  },
];

export default function DegreeUnitFillSimulator() {
  return <PlaceBoard pages={PAGES} title="问题 5 角的度量" bankLabel="可选" />;
}
