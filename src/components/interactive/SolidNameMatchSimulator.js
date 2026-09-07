import React from 'react';
import PairMatch from '@site/src/components/interactive/solidView/PairMatch';
import SolidFigureView from '@site/src/components/interactive/solidView/SolidFigureView';

function Fig({ id }) {
  return <SolidFigureView solidId={id} highlight="edges" height={120} />;
}

const LEFT = [
  { id: 'prism', match: 'prism', node: <Fig id="cuboid" /> },
  { id: 'sphere', match: 'sphere', node: <Fig id="sphere" /> },
  { id: 'cylinder', match: 'cylinder', node: <Fig id="cylinder" /> },
  { id: 'pyramid', match: 'pyramid', node: <Fig id="pyramid" /> },
  { id: 'cone', match: 'cone', node: <Fig id="cone" /> },
];

const RIGHT = [
  { id: 'cone', label: '圆锥' },
  { id: 'cylinder', label: '圆柱' },
  { id: 'prism', label: '棱柱' },
  { id: 'pyramid', label: '棱锥' },
  { id: 'sphere', label: '球' },
];

export default function SolidNameMatchSimulator() {
  return (
    <PairMatch
      title="复习巩固 1：图形与名称"
      subtitle="先看形状，再对名称。书上的名称没有按图形的顺序排。"
      prompt="把图中的几何图形与它们相应的名称连起来。可拖动模型转动。"
      left={LEFT}
      right={RIGHT}
      bookOrderRight={['cone', 'cylinder', 'prism', 'pyramid', 'sphere']}
      solutionLines={[
        '第 1 个是棱柱：两个互相平行的底面，侧面是长方形。长方体是特殊的棱柱。',
        '第 2 个是球：整个表面是曲面。',
        '第 3 个是圆柱：两个平行的圆底面，侧面是曲面。',
        '第 4 个是棱锥：一个多边形底面，侧面是三角形，交于一个顶点。',
        '第 5 个是圆锥：一个圆底面，侧面是曲面，交于一个顶点。',
      ]}
    />
  );
}
