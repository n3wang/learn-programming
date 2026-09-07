import React from 'react';
import PairMatch from '@site/src/components/interactive/solidView/PairMatch';

function Vert() {
  return (
    <svg width="120" height="56" viewBox="0 0 120 56" aria-label="竖线段向右平移">
      <line x1="28" y1="8" x2="28" y2="48" stroke="#1565c0" strokeWidth="2.5" />
      <path d="M40 28h28" stroke="#e91e63" strokeWidth="1.6" />
      <path d="M62 22l8 6-8 6" fill="none" stroke="#e91e63" strokeWidth="1.6" />
    </svg>
  );
}

function Slant() {
  return (
    <svg width="120" height="56" viewBox="0 0 120 56" aria-label="斜线段向右平移">
      <line x1="22" y1="44" x2="48" y2="10" stroke="#1565c0" strokeWidth="2.5" />
      <path d="M56 28h28" stroke="#e91e63" strokeWidth="1.6" />
      <path d="M78 22l8 6-8 6" fill="none" stroke="#e91e63" strokeWidth="1.6" />
    </svg>
  );
}

function Curve() {
  return (
    <svg width="120" height="56" viewBox="0 0 120 56" aria-label="曲线向右平移">
      <path d="M22 10c10 10 10 26 0 36" fill="none" stroke="#1565c0" strokeWidth="2.5" />
      <path d="M40 28h28" stroke="#e91e63" strokeWidth="1.6" />
      <path d="M62 22l8 6-8 6" fill="none" stroke="#e91e63" strokeWidth="1.6" />
    </svg>
  );
}

function Spin() {
  return (
    <svg width="120" height="56" viewBox="0 0 120 56" aria-label="线段绕定点旋转">
      <line x1="18" y1="40" x2="58" y2="40" stroke="#90a4ae" strokeWidth="1.6" strokeDasharray="3 3" />
      <line x1="18" y1="40" x2="62" y2="22" stroke="#1565c0" strokeWidth="2.5" />
      <circle cx="18" cy="40" r="2.4" fill="#1565c0" />
      <path d="M40 38c6-8 16-10 24-6" fill="none" stroke="#e91e63" strokeWidth="1.6" />
      <path d="M62 28l4 6-7 1" fill="none" stroke="#e91e63" strokeWidth="1.6" />
    </svg>
  );
}

function Para() {
  return (
    <svg width="92" height="48" viewBox="0 0 92 48">
      <polygon points="18,36 34,12 78,12 62,36" fill="#ffe082" stroke="#6d4c41" strokeWidth="1.4" />
    </svg>
  );
}

function Rect() {
  return (
    <svg width="92" height="48" viewBox="0 0 92 48">
      <rect x="18" y="12" width="52" height="26" fill="#d7ccc8" stroke="#5d4037" strokeWidth="1.4" />
    </svg>
  );
}

function Sector() {
  return (
    <svg width="92" height="48" viewBox="0 0 92 48">
      <path d="M16 34 A28 28 0 0 1 72 28 L44 38 Z" fill="#ffccbc" stroke="#6d4c41" strokeWidth="1.4" />
    </svg>
  );
}

function Wave() {
  return (
    <svg width="92" height="48" viewBox="0 0 92 48">
      <path d="M14 16c8 8 8 8 0 16 10 0 14-6 22-6s12 6 22 6c-8-8-8-8 0-16-10 0-14 6-22 6s-12-6-22-6z" fill="#81d4fa" stroke="#0277bd" strokeWidth="1.4" />
    </svg>
  );
}

const LEFT = [
  { id: 'vert', match: 'rect', node: <Vert /> },
  { id: 'slant', match: 'para', node: <Slant /> },
  { id: 'curve', match: 'wave', node: <Curve /> },
  { id: 'spin', match: 'sector', node: <Spin /> },
];

const RIGHT = [
  { id: 'para', label: '平行四边形', node: <Para /> },
  { id: 'rect', label: '长方形', node: <Rect /> },
  { id: 'sector', label: '扇形', node: <Sector /> },
  { id: 'wave', label: '曲边图形', node: <Wave /> },
];

export default function LineSweepMatchSimulator() {
  return (
    <PairMatch
      title="练习 2：线动成面"
      subtitle="平移线段得平行四边形或长方形；曲线平移得曲边图形；绕定点旋转得扇形"
      prompt="上面的线按箭头平移，或绕定点旋转，得到下面的平面图形。为每一条线选择对应的图形。"
      left={LEFT}
      right={RIGHT}
      bookOrderRight={['para', 'rect', 'sector', 'wave']}
      solutionLines={[
        '竖线段向右平移 → 长方形。线段与平移方向垂直，扫出来的是长方形。',
        '斜线段向右平移 → 平行四边形。对边由同一条线段平移得到，所以平行且相等。',
        '曲线向右平移 → 曲边图形。两条曲线是原曲线平移后的副本。',
        '线段绕定点旋转 → 扇形。定点是扇形的圆心，线段是半径。',
      ]}
    />
  );
}
