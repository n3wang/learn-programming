import React from 'react';
import MixedPractice, { eq } from '@site/src/components/interactive/shell/MixedPractice';
import * as C24 from '@site/src/components/interactive/shell/g8b/ch24Generators';
import * as C25 from '@site/src/components/interactive/shell/g8b/ch25Generators';
import * as C26 from '@site/src/components/interactive/shell/g8b/ch26Generators';
import * as C27 from '@site/src/components/interactive/shell/g8b/ch27Generators';

/**
 * 八年级下册（五·四学制）练习：<G8bPractice set="27.2.2" /> embeds a typed-answer drill
 * for one section; set="ch27" a chapter review; set="exam" a whole-book paper.
 */
const B = '/classes/math-4';
const S = {
  '24.1': {
    name: '24.1 勾股定理',
    href: `${B}/pythagorean-theorem`,
    pool: [eq('求边长', C24.genPythagorasSide), eq('梯子下滑', C24.genLadder), eq('木板过门框', C24.genDoorBoard), eq('坐标中的距离', C24.genGridDistance), eq('折叠问题', C24.genFoldRect)],
  },
  '24.2': { name: '24.2 勾股定理的逆定理', href: `${B}/converse-pythagorean`, pool: [eq('是不是直角三角形', C24.genIsRight), eq('两船航向', C24.genShips)] },
  '25.1.1': {
    name: '25.1 平行四边形的性质',
    href: `${B}/parallelogram-properties`,
    pool: [eq('角', C25.genParaAngles), eq('边与周长', C25.genParaSides), eq('对角线互相平分', C25.genParaDiagonals), eq('面积', C25.genParaArea)],
  },
  '25.1.2': { name: '25.1 平行四边形的判定', href: `${B}/parallelogram-criteria`, pool: [eq('能否判定', C25.genParaCriteria), eq('三角形的中位线', C25.genMidline)] },
  '25.2.1': { name: '25.2 矩形', href: `${B}/rectangle`, pool: [eq('矩形的对角线', C25.genRectangle), eq('斜边上的中线', C25.genMedianHyp)] },
  '25.2.2': { name: '25.2 菱形', href: `${B}/rhombus`, pool: [eq('菱形', C25.genRhombus)] },
  '25.2.3': { name: '25.2 正方形', href: `${B}/square`, pool: [eq('正方形', C25.genSquare), eq('是哪种四边形', C25.genSpecialCriteria)] },
  '26.1': {
    name: '26.1 函数',
    href: `${B}/functions`,
    pool: [eq('写出函数关系', C26.genFuelTank), eq('自变量的取值范围', C26.genDomain), eq('函数值', C26.genFunctionValue), eq('读函数图象', C26.genReadGraph)],
  },
  '26.2.1': { name: '26.2 正比例函数', href: `${B}/proportional-functions`, pool: [eq('求 k', C26.genProportional)] },
  '26.2.2': {
    name: '26.2 一次函数的图象与性质',
    href: `${B}/linear-functions`,
    pool: [eq('象限与增减性', C26.genLinearProperties), eq('与坐标轴的交点', C26.genIntercepts), eq('平移', C26.genShift)],
  },
  '26.2.3': {
    name: '26.2 待定系数法与应用',
    href: `${B}/undetermined-coefficients`,
    pool: [eq('过两点求解析式', C26.genTwoPoints), eq('两直线的交点', C26.genIntersection), eq('看图解不等式', C26.genLinearInequality), eq('分段计价', C26.genPiecewise)],
  },
  '26.3': { name: '26.3 选择方案', href: `${B}/choosing-plans`, pool: [eq('选哪种方案', C26.genChoosePlan)] },
  '27.1': { name: '27.1 一元二次方程', href: `${B}/quadratic-equations`, pool: [eq('一般形式', C27.genGeneralForm), eq('由根求参数', C27.genRootParam)] },
  '27.2.1': { name: '27.2 配方法', href: `${B}/completing-the-square`, pool: [eq('直接开平方', C27.genSqrtMethod), eq('配方法', C27.genCompleteSquare)] },
  '27.2.2': { name: '27.2 公式法', href: `${B}/quadratic-formula`, pool: [eq('判别式', C27.genDiscriminant), eq('公式法', C27.genFormula)] },
  '27.2.3': { name: '27.2 因式分解法', href: `${B}/factoring-method`, pool: [eq('因式分解法', C27.genFactorMethod)] },
  '27.2.4': { name: '27.2 根与系数的关系', href: `${B}/vieta`, pool: [eq('根与系数', C27.genVieta)] },
  '27.3': {
    name: '27.3 实际问题',
    href: `${B}/quadratic-word-problems`,
    pool: [eq('平均增长率', C27.genGrowthRate), eq('传播与比赛', C27.genSpread), eq('面积问题', C27.genAreaProblem)],
  },
};

const CHAPTERS = {
  ch24: ['24.1', '24.2'],
  ch25: ['25.1.1', '25.1.2', '25.2.1', '25.2.2', '25.2.3'],
  ch26: ['26.1', '26.2.1', '26.2.2', '26.2.3', '26.3'],
  ch27: ['27.1', '27.2.1', '27.2.2', '27.2.3', '27.2.4', '27.3'],
};
CHAPTERS.exam = [...CHAPTERS.ch24, ...CHAPTERS.ch25, ...CHAPTERS.ch26, ...CHAPTERS.ch27];

const cat = (id, weight = 1) => ({ id, weight, ...S[id] });

export default function G8bPractice({ set, count, children }) {
  if (S[set]) {
    return (
      <MixedPractice categories={[cat(set)]} defaultCount={count || 5} countOptions={[5, 10]} anchorId={`g8b-${set}`}>
        {children}
      </MixedPractice>
    );
  }
  const ids = CHAPTERS[set] || [];
  const isExam = set === 'exam';
  return (
    <MixedPractice
      categories={ids.map((id) => cat(id, isExam ? 1 : S[id].pool.length > 2 ? 2 : 1))}
      defaultCount={count || (isExam ? 20 : 10)}
      countOptions={isExam ? [10, 15, 20] : [5, 10, 15]}
      allowPrint
      anchorId={`g8b-${set}`}
    >
      {children}
    </MixedPractice>
  );
}
