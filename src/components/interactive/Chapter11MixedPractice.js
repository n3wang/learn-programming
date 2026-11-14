import React from 'react';
import MixedPractice, { sim } from '@site/src/components/interactive/shell/MixedPractice';

import HighwayDeadlineSimulator from './HighwayDeadlineSimulator';
import InequalitySolutionSetSimulator from './InequalitySolutionSetSimulator';
import InequalityAddFillSimulator from './InequalityAddFillSimulator';
import InequalityMulFillSimulator from './InequalityMulFillSimulator';
import InequalityPropertyApplySimulator from './InequalityPropertyApplySimulator';
import InequalitySolvePracticeSimulator from './InequalitySolvePracticeSimulator';
import InequalitySolveExampleSimulator from './InequalitySolveExampleSimulator';
import TemperatureRangeSimulator from './TemperatureRangeSimulator';
import InequalityDirectSetSimulator from './InequalityDirectSetSimulator';
import InequalityMemberCheckSimulator from './InequalityMemberCheckSimulator';
import SubwayMileageRangeSimulator from './SubwayMileageRangeSimulator';
import LinearInequalityExampleSimulator from './LinearInequalityExampleSimulator';
import LinearInequalityDrillSimulator from './LinearInequalityDrillSimulator';
import LinearInequalityConditionSimulator from './LinearInequalityConditionSimulator';
import EnergyDeclineSimulator from './EnergyDeclineSimulator';
import PoetryAdvanceSimulator from './PoetryAdvanceSimulator';
import InequalitySystemSolveSimulator from './InequalitySystemSolveSimulator';
import InequalitySystemGenerateSimulator from './InequalitySystemGenerateSimulator';

/**
 * 第十一章综合练习：不等式与不等式组。Question pool only — the runner is
 * shell/MixedPractice.js. Each simulator reports its answers with
 * usePracticeAnswer (single inequalities, solution-set ranges, 是/不是 choices).
 */
export const CATEGORIES = [
  {
    id: '11.1',
    name: '11.1 不等式',
    href: '/classes/math-2/inequalities',
    weight: 1,
    pool: [
      sim('赶在时刻前到达', HighwayDeadlineSimulator),
      sim('哪些数是解', InequalitySolutionSetSimulator),
    ],
  },
  {
    id: '11.1.2a',
    name: '11.1.2 不等式的性质',
    href: '/classes/math-2/inequality-properties',
    weight: 2,
    pool: [
      sim('两边加同一个数', InequalityAddFillSimulator),
      sim('两边乘同一个数', InequalityMulFillSimulator),
      sim('用性质求范围', InequalityPropertyApplySimulator),
    ],
  },
  {
    id: '11.1.2b',
    name: '11.1.2 解不等式',
    href: '/classes/math-2/solving-inequalities',
    weight: 2,
    pool: [
      sim('解不等式（四题）', InequalitySolvePracticeSimulator),
      sim('解不等式', InequalitySolveExampleSimulator),
      sim('气温范围', TemperatureRangeSimulator),
    ],
  },
  {
    id: '11.1x',
    name: '习题 11.1',
    href: '/classes/math-2/inequality-exercises',
    weight: 1,
    pool: [
      sim('直接写出解集', InequalityDirectSetSimulator),
      sim('哪些数是解', InequalityMemberCheckSimulator),
      sim('地铁里程', SubwayMileageRangeSimulator),
    ],
  },
  {
    id: '11.2',
    name: '11.2 一元一次不等式',
    href: '/classes/math-2/linear-inequalities',
    weight: 2,
    pool: [
      sim('去分母、去括号', LinearInequalityExampleSimulator),
      sim('解不等式（四题）', LinearInequalityDrillSimulator),
      sim('什么条件下成立', LinearInequalityConditionSimulator),
      sim('能耗下降率', EnergyDeclineSimulator),
      sim('至少答对几道', PoetryAdvanceSimulator),
    ],
  },
  {
    id: '11.3',
    name: '11.3 不等式组',
    href: '/classes/math-2/inequality-systems',
    weight: 2,
    pool: [
      sim('解不等式组（四种基本型）', InequalitySystemSolveSimulator),
      sim('解不等式组', InequalitySystemGenerateSimulator),
    ],
  },
];

export default function Chapter11MixedPractice({ defaultCount = 10, children }) {
  return (
    <MixedPractice categories={CATEGORIES} defaultCount={defaultCount} anchorId="ch11-practice-top">
      {children}
    </MixedPractice>
  );
}
