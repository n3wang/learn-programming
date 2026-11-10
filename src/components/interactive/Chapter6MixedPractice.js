import React from 'react';
import MixedPractice, { sim } from '@site/src/components/interactive/shell/MixedPractice';

import SolidElementCountSimulator from './SolidElementCountSimulator';
import NumberLineMidpointSimulator from './NumberLineMidpointSimulator';
import LineIntersectionCountSimulator from './LineIntersectionCountSimulator';
import CollinearMpSimulator from './CollinearMpSimulator';
import DegreeConvertCompareSimulator from './DegreeConvertCompareSimulator';
import AngleBisectorFillSimulator from './AngleBisectorFillSimulator';
import AngleSumDiffSimulator from './AngleSumDiffSimulator';
import CakeSliceAngleSimulator from './CakeSliceAngleSimulator';
import DegreeMulDivSimulator from './DegreeMulDivSimulator';
import LineBisectorFindSimulator from './LineBisectorFindSimulator';
import ComplementSupplementSimulator from './ComplementSupplementSimulator';
import DegreeComplementFindSimulator from './DegreeComplementFindSimulator';
import SameComplementSimulator from './SameComplementSimulator';
import SupplementMultipleSimulator from './SupplementMultipleSimulator';
import WallAngleMeasureSimulator from './WallAngleMeasureSimulator';
import ClockThreePartSimulator from './ClockThreePartSimulator';
import EqualRemainderAnglesSimulator from './EqualRemainderAnglesSimulator';
import NestedBisectorFindSimulator from './NestedBisectorFindSimulator';
import SupplementThenComplementSimulator from './SupplementThenComplementSimulator';
import OcSideCountSimulator from './OcSideCountSimulator';

/**
 * 初一第六章综合练习：几何图形初步。Question pool only — the runner is
 * shell/MixedPractice.js. Angle answers use the 度分秒 input (dmsField / degField).
 */
const CATEGORIES = [
  {
    id: '6.1',
    name: '6.1 几何图形',
    href: '/classes/math-1/geometric-figures',
    weight: 1,
    pool: [sim('数面、棱、顶点', SolidElementCountSimulator)],
  },
  {
    id: '6.2',
    name: '6.2 直线、射线、线段',
    href: '/classes/math-1/lines-rays-segments',
    weight: 2,
    pool: [
      sim('数轴上的中点', NumberLineMidpointSimulator),
      sim('直线的交点个数', LineIntersectionCountSimulator),
      sim('三点共线求线段', CollinearMpSimulator),
    ],
  },
  {
    id: '6.3',
    name: '6.3 角',
    href: '/classes/math-1/angles',
    weight: 1,
    pool: [sim('度分秒换算与比较', DegreeConvertCompareSimulator)],
  },
  {
    id: '6.3.2',
    name: '6.3.2 角的比较与运算',
    href: '/classes/math-1/angle-comparison',
    weight: 2,
    pool: [
      sim('等分周角', AngleBisectorFillSimulator),
      sim('角的和差', AngleSumDiffSimulator),
      sim('切蛋糕', CakeSliceAngleSimulator),
      sim('度分的乘除', DegreeMulDivSimulator),
      sim('平分线求角', LineBisectorFindSimulator),
    ],
  },
  {
    id: '6.3.3',
    name: '6.3.3 余角和补角',
    href: '/classes/math-1/complementary-angles',
    weight: 2,
    pool: [
      sim('余角和补角', ComplementSupplementSimulator),
      sim('度分的余角补角', DegreeComplementFindSimulator),
      sim('同角的余角', SameComplementSimulator),
      sim('补角是它的几倍', SupplementMultipleSimulator),
      sim('墙外测墙角', WallAngleMeasureSimulator),
    ],
  },
  {
    id: '6.3x',
    name: '习题 6.3',
    href: '/classes/math-1/angles-exercises',
    weight: 2,
    pool: [
      sim('钟面上的角', ClockThreePartSimulator),
      sim('等角的余角', EqualRemainderAnglesSimulator),
      sim('两次平分', NestedBisectorFindSimulator),
      sim('先补后余', SupplementThenComplementSimulator),
      sim('以 OC 为边的角', OcSideCountSimulator),
    ],
  },
];

export default function Chapter6MixedPractice({ defaultCount = 10, children }) {
  return (
    <MixedPractice categories={CATEGORIES} defaultCount={defaultCount} anchorId="ch6-practice-top">
      {children}
    </MixedPractice>
  );
}
