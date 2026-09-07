import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题 1：铁球——球形、直径 5 cm 是几何性质。 */
function bookProblem() {
  return {
    name: '铁球',
    traits: [
      { text: '铁质', kind: 'material' },
      { text: '坚硬', kind: 'other' },
      { text: '灰黑色', kind: 'color' },
      { text: '球形', kind: 'shape' },
      { text: '直径为 5 cm', kind: 'size' },
      { text: '质量约为 517 g', kind: 'mass' },
      { text: '摸上去较凉', kind: 'other' },
    ],
  };
}

const OBJECTS = [
  {
    name: '木块',
    shape: '长方体',
    size: () => `长 ${randInt(4, 12)} cm、宽 ${randInt(3, 8)} cm、高 ${randInt(2, 6)} cm`,
  },
  {
    name: '玻璃杯',
    shape: '圆柱',
    size: () => `底面直径 ${randInt(4, 8)} cm、高 ${randInt(8, 16)} cm`,
  },
  {
    name: '皮球',
    shape: '球',
    size: () => `直径 ${randInt(10, 24)} cm`,
  },
  {
    name: '漏斗',
    shape: '圆锥',
    size: () => `底面半径 ${randInt(3, 8)} cm、高 ${randInt(6, 14)} cm`,
  },
  {
    name: '粉笔盒',
    shape: '长方体',
    size: () => `棱长分别约为 ${randInt(8, 12)} cm、${randInt(4, 7)} cm、${randInt(2, 4)} cm`,
  },
];

const MATERIALS = ['木质', '玻璃', '塑料', '陶瓷', '铁质'];
const COLORS = ['红色', '白色', '蓝色', '灰黑色', '透明'];
const HARDNESS = ['坚硬', '较软', '易碎'];
const FEEL = ['摸上去较凉', '摸上去光滑', '表面粗糙'];

function generate() {
  const obj = pickOne(OBJECTS);
  const mass = randInt(20, 80) * 10;
  return {
    name: obj.name,
    traits: [
      { text: pickOne(MATERIALS), kind: 'material' },
      { text: pickOne(HARDNESS), kind: 'other' },
      { text: pickOne(COLORS), kind: 'color' },
      { text: obj.shape, kind: 'shape' },
      { text: obj.size(), kind: 'size' },
      { text: `质量约为 ${mass} g`, kind: 'mass' },
      { text: pickOne(FEEL), kind: 'other' },
    ],
  };
}

function classify(p) {
  const geo = p.traits.filter((t) => t.kind === 'shape' || t.kind === 'size');
  const not = p.traits.filter((t) => t.kind !== 'shape' && t.kind !== 'size');
  return { geo, not };
}

export default function GeometryPropertyFilterSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => classify(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="辨" badgeClass={stepStyles.badgeSet}>
        几何研究的是形状、大小和位置关系。颜色、材质、硬度、质量、凉热都先放下。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          几何研究其中的形状和大小：{d.geo.map((t) => t.text).join('，')}。
          {d.not.map((t) => t.text).join('、')}，都不是几何首先研究的内容。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 1：哪些性质是几何研究的？"
      subtitle="只留下形状和大小；颜色、材质、质量、凉热先排除"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <Typography>
        一个{p.name}有下列性质：{p.traits.map((t) => t.text).join('，')}，等等。几何研究其中的哪些性质？
      </Typography>
    </ProblemShell>
  );
}
