import React from 'react';
import MixedPractice, { eq, sim } from '@site/src/components/interactive/shell/MixedPractice';
import {
  genBasicLinearEquation,
  genParenthesesEquation,
  genFractionEquation,
  genWordTranslationEquation,
} from '@site/src/components/interactive/shell/equationGenerators';

import BookSortingRateSimulator from './BookSortingRateSimulator';
import BoltNutMatchingSimulator from './BoltNutMatchingSimulator';
import FootballUndefeatedSimulator from './FootballUndefeatedSimulator';
import InterestGroupTimeSimulator from './InterestGroupTimeSimulator';
import LeagueStandingsSimulator from './LeagueStandingsSimulator';
import MarkupDiscountSimulator from './MarkupDiscountSimulator';
import ProfitLossSimulator from './ProfitLossSimulator';
import SameProfitTwoCostsSimulator from './SameProfitTwoCostsSimulator';
import CopyShopCostSimulator from './CopyShopCostSimulator';
import SubwayPassCostSimulator from './SubwayPassCostSimulator';
import DiophantusAgeSimulator from './DiophantusAgeSimulator';
import MeetingTravelSimulator from './MeetingTravelSimulator';
import MatchingPartsDaysSimulator from './MatchingPartsDaysSimulator';
import TableWoodPlanSimulator from './TableWoodPlanSimulator';
import TwoPersonWorkRemainderSimulator from './TwoPersonWorkRemainderSimulator';
import UniformTempChangeSimulator from './UniformTempChangeSimulator';
import DiscountVolumeBoostSimulator from './DiscountVolumeBoostSimulator';
import MooncakeFlourPlanSimulator from './MooncakeFlourPlanSimulator';
import CostPriceProfitSimulator from './CostPriceProfitSimulator';
import EqualYieldFundsSimulator from './EqualYieldFundsSimulator';
import GroceryTowelSimulator from './GroceryTowelSimulator';
import HorseChaseSimulator from './HorseChaseSimulator';
import MedalCountSimulator from './MedalCountSimulator';
import TrapezoidFormulaSimulator from './TrapezoidFormulaSimulator';

/**
 * 初一第五章综合练习：一元一次方程。Question pool only — the runner is
 * shell/MixedPractice.js. Equation items parse `x = …` from the generator's answer;
 * simulators report their own answers with usePracticeAnswer.
 */
export const CATEGORIES = [
  {
    id: '5.2',
    name: '5.2 解方程',
    href: '/classes/math-1/solving-linear-equations',
    weight: 3,
    pool: [
      eq('移项、合并同类项', genBasicLinearEquation),
      eq('去括号', genParenthesesEquation),
      eq('去分母', genFractionEquation),
      eq('文字列方程', genWordTranslationEquation),
    ],
  },
  {
    id: '5.3',
    name: '5.3 实际问题',
    href: '/classes/math-1/practical-problems-linear-equations',
    weight: 2,
    pool: [
      sim('工程：整理图书', BookSortingRateSimulator),
      sim('配套：螺栓与螺母', BoltNutMatchingSimulator),
      sim('球赛积分：不败', FootballUndefeatedSimulator),
      sim('兴趣小组活动次数', InterestGroupTimeSimulator),
      sim('篮球联赛积分', LeagueStandingsSimulator),
      sim('先加价再打折', MarkupDiscountSimulator),
      sim('一盈一亏', ProfitLossSimulator),
      sim('利润额相同', SameProfitTwoCostsSimulator),
    ],
  },
  {
    id: '5.3c',
    name: '5.3 费用比较',
    href: '/classes/math-1/comprehensive-cost-comparison',
    weight: 1,
    pool: [
      sim('复印店收费', CopyShopCostSimulator),
      sim('地铁月票', SubwayPassCostSimulator),
    ],
  },
  {
    id: '5.3x',
    name: '5.3 复习巩固',
    href: '/classes/math-1/linear-equations-exercises',
    weight: 2,
    pool: [
      sim('丢番图的寿命', DiophantusAgeSimulator),
      sim('相遇问题', MeetingTravelSimulator),
      sim('零件配套天数', MatchingPartsDaysSimulator),
      sim('木材做桌子', TableWoodPlanSimulator),
      sim('两人合作再单独', TwoPersonWorkRemainderSimulator),
      sim('温度匀速变化', UniformTempChangeSimulator),
      sim('降价后增加销量', DiscountVolumeBoostSimulator),
      sim('面粉做月饼', MooncakeFlourPlanSimulator),
    ],
  },
  {
    id: 'profit',
    name: '进价、售价与利润',
    href: '/classes/math-1/cost-price-profit-loss',
    weight: 1,
    pool: [sim('利润与售价', CostPriceProfitSimulator)],
  },
  {
    id: 'summary',
    name: '小结：复习题',
    href: '/classes/math-1/linear-equations-summary',
    weight: 1,
    pool: [
      sim('两只基金', EqualYieldFundsSimulator),
      sim('买毛巾', GroceryTowelSimulator),
      sim('快马追慢马', HorseChaseSimulator),
      sim('金银铜牌', MedalCountSimulator),
      sim('梯形面积公式', TrapezoidFormulaSimulator),
    ],
  },
];

export default function Chapter5MixedPractice({ defaultCount = 10, children }) {
  return (
    <MixedPractice categories={CATEGORIES} defaultCount={defaultCount} anchorId="ch5-practice-top">
      {children}
    </MixedPractice>
  );
}
