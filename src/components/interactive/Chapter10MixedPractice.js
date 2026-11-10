import React from 'react';
import MixedPractice, { eq, sim } from '@site/src/components/interactive/shell/MixedPractice';
import {
  genIsSolutionCheck,
  genFindCoefficient,
} from '@site/src/components/interactive/shell/twoVarConceptGenerators';
import {
  genSubstitutionReady,
  genSubstitutionIsolate,
  genEliminationSystem,
  genTextbookFractionalSystem,
} from '@site/src/components/interactive/shell/systemEquationGenerators';
import {
  genChainThreeVar,
  genMissingVarThreeVar,
  genCyclicThreeVar,
  genGeneralThreeVar,
  genReviewSubReadyThreeVar,
  genReviewCycleMissingThreeVar,
  genReviewProportionThreeVar,
} from '@site/src/components/interactive/shell/threeVarSystemGenerators';

import BusRentalTwoVarSimulator from './BusRentalTwoVarSimulator';
import VipBoxTwoVarSimulator from './VipBoxTwoVarSimulator';
import TourBusTwoVarSimulator from './TourBusTwoVarSimulator';
import TicketSalesTwoVarSimulator from './TicketSalesTwoVarSimulator';
import SportsTeamTwoVarSimulator from './SportsTeamTwoVarSimulator';
import TruckCargoTwoVarSimulator from './TruckCargoTwoVarSimulator';
import CableTicketTwoVarSimulator from './CableTicketTwoVarSimulator';
import BikeSlopeDistanceSimulator from './BikeSlopeDistanceSimulator';
import ChemicalPlantFreightSimulator from './ChemicalPlantFreightSimulator';
import HikingSpeedTwoVarSimulator from './HikingSpeedTwoVarSimulator';
import InnRoomsTwoVarSimulator from './InnRoomsTwoVarSimulator';
import RobotHaulTwoVarSimulator from './RobotHaulTwoVarSimulator';
import LawnPathWidthSimulator from './LawnPathWidthSimulator';
import AdBoardProductsTwoVarSimulator from './AdBoardProductsTwoVarSimulator';
import BrushRetailTwoVarSimulator from './BrushRetailTwoVarSimulator';
import ToothbrushRecordCheckSimulator from './ToothbrushRecordCheckSimulator';
import ThreeNumbersSumSimulator from './ThreeNumbersSumSimulator';
import LinearPlaneFitSimulator from './LinearPlaneFitSimulator';
import QuadraticCoeffsThreeVarSimulator from './QuadraticCoeffsThreeVarSimulator';
import ThreeDigitNumberSimulator from './ThreeDigitNumberSimulator';
import ThreeSegmentRoadSimulator from './ThreeSegmentRoadSimulator';

/**
 * 第十章综合练习：从 10.1–10.4 各课的练习组件里按权重均衡抽题，一题一题连续做。
 * Question pool only — the runner lives in shell/MixedPractice.js.
 */

const CATEGORIES = [
  {
    id: '10.1',
    name: '10.1 概念',
    href: '/classes/math-2/two-var-system-concept',
    weight: 1,
    pool: [
      eq('判断是不是方程组的解', genIsSolutionCheck),
      eq('由解求系数', genFindCoefficient),
    ],
  },
  {
    id: '10.2',
    name: '10.2 消元',
    href: '/classes/math-2/solving-systems-of-equations',
    weight: 2,
    pool: [
      eq('代入法：直接代入', genSubstitutionReady),
      eq('代入法：先解出一个未知数', genSubstitutionIsolate),
      eq('加减消元法', genEliminationSystem),
      eq('含分数 / 需先整理', genTextbookFractionalSystem),
    ],
  },
  {
    id: '10.3',
    name: '10.3 实际问题',
    href: '/classes/math-2/practical-problems-two-var-equations',
    weight: 3,
    pool: [
      sim('租车', BusRentalTwoVarSimulator),
      sim('包厢', VipBoxTwoVarSimulator),
      sim('旅行社租车', TourBusTwoVarSimulator),
      sim('影院包场', TicketSalesTwoVarSimulator),
      sim('运动会报名', SportsTeamTwoVarSimulator),
      sim('大小货车', TruckCargoTwoVarSimulator),
      sim('缆车票', CableTicketTwoVarSimulator),
      sim('上坡·平路·下坡', BikeSlopeDistanceSimulator),
      sim('公路与铁路运费', ChemicalPlantFreightSimulator),
      sim('两天徒步', HikingSpeedTwoVarSimulator),
      sim('客房与房客', InnRoomsTwoVarSimulator),
      sim('机器人搬运', RobotHaulTwoVarSimulator),
      sim('草坪通道', LawnPathWidthSimulator),
      sim('展板与宣传册', AdBoardProductsTwoVarSimulator),
      sim('毛笔零售', BrushRetailTwoVarSimulator),
      sim('账目验算', ToothbrushRecordCheckSimulator),
    ],
  },
  {
    id: '10.4a',
    name: '10.4 三元解法',
    href: '/classes/math-2/solving-three-var-systems',
    weight: 2,
    pool: [
      eq('三元：链式代入', genChainThreeVar),
      eq('三元：缺一元的方程', genMissingVarThreeVar),
      eq('三元：两两之和', genCyclicThreeVar),
      eq('三元：一般加减消元', genGeneralThreeVar),
      eq('三元：先代入已解出的未知数', genReviewSubReadyThreeVar),
      eq('三元：轮换缺元', genReviewCycleMissingThreeVar),
      eq('三元：比例条件', genReviewProportionThreeVar),
    ],
  },
  {
    id: '10.4b',
    name: '10.4 三元应用',
    href: '/classes/math-2/three-var-applications-practice',
    weight: 2,
    pool: [
      sim('甲乙丙三个数', ThreeNumbersSumSimulator),
      sim('平面式 z = ax + by + c', LinearPlaneFitSimulator),
      sim('二次函数系数', QuadraticCoeffsThreeVarSimulator),
      sim('三位数', ThreeDigitNumberSimulator),
      sim('三段路程', ThreeSegmentRoadSimulator),
    ],
  },
];

export default function Chapter10MixedPractice({ defaultCount = 10 }) {
  return <MixedPractice categories={CATEGORIES} defaultCount={defaultCount} anchorId="ch10-practice-top" />;
}
