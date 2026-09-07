import React from 'react';
import PairMatch from '@site/src/components/interactive/solidView/PairMatch';

function AxisShape({ children, label, axisX = 28 }) {
  return (
    <svg width="88" height="72" viewBox="0 0 88 72" aria-label={label}>
      <line x1={axisX} y1="6" x2={axisX} y2="66" stroke="#1565c0" strokeWidth="1.6" />
      {children}
      <path d="M36 58c8 6 16 6 22 2" fill="none" stroke="#e91e63" strokeWidth="1.5" />
      <path d="M54 56l6 6-8 0" fill="none" stroke="#e91e63" strokeWidth="1.5" />
    </svg>
  );
}

const LEFT = [
  {
    id: 'tri',
    match: 'cone',
    node: (
      <AxisShape label="直角三角形绕直角边">
        <polygon points="28,12 28,54 58,54" fill="#90caf9" stroke="#1565c0" strokeWidth="1.2" />
      </AxisShape>
    ),
  },
  {
    id: 'quarter',
    match: 'hemi',
    node: (
      <AxisShape label="四分之一圆绕半径" axisX={54}>
        <path d="M54 42 L30 42 A24 24 0 0 1 54 18 Z" fill="#90caf9" stroke="#1565c0" strokeWidth="1.2" />
      </AxisShape>
    ),
  },
  {
    id: 'trap',
    match: 'frustum',
    node: (
      <AxisShape label="直角梯形绕垂直于两底的腰">
        <polygon points="28,16 42,16 58,54 28,54" fill="#90caf9" stroke="#1565c0" strokeWidth="1.2" />
      </AxisShape>
    ),
  },
  {
    id: 'semi',
    match: 'sphere',
    node: (
      <AxisShape label="半圆绕直径">
        <path d="M28 16 A20 20 0 0 1 28 56 Z" fill="#90caf9" stroke="#1565c0" strokeWidth="1.2" />
      </AxisShape>
    ),
  },
  {
    id: 'rect',
    match: 'cylinder',
    node: (
      <AxisShape label="矩形绕一条边">
        <rect x="28" y="16" width="24" height="38" fill="#90caf9" stroke="#1565c0" strokeWidth="1.2" />
      </AxisShape>
    ),
  },
];

const RIGHT = [
  { id: 'sphere', label: '球' },
  { id: 'cylinder', label: '圆柱' },
  { id: 'hemi', label: '半球' },
  { id: 'cone', label: '圆锥' },
  { id: 'frustum', label: '圆台' },
];

export default function AxisRotateMatchSimulator() {
  return (
    <PairMatch
      title="练习 3：面动成体"
      subtitle="平面图形绕轴旋转一周，得到球、圆柱、半球、圆锥或圆台"
      prompt="上面的平面图形绕轴旋转一周，得到下面的立体图形。为每一个平面图形选择对应的体。"
      left={LEFT}
      right={RIGHT}
      bookOrderRight={['sphere', 'cylinder', 'hemi', 'cone', 'frustum']}
      solutionLines={[
        '直角三角形绕一条直角边旋转 → 圆锥。另一条直角边转成底面圆，斜边转成侧面。',
        '四分之一圆绕一条半径旋转 → 半球。半径是轴，圆弧转成半球面。',
        '直角梯形绕垂直于两底的腰旋转 → 圆台。两条底转成两个不等的圆。',
        '半圆绕直径旋转 → 球。直径是轴，半圆周转成整个球面。',
        '矩形绕一条边旋转 → 圆柱。对边转成另一个底面的圆周，邻边转成侧面。',
      ]}
    />
  );
}
