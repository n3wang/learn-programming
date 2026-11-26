import React from 'react';
import MixedPractice, { eq } from '@site/src/components/interactive/shell/MixedPractice';
import * as C20 from '@site/src/components/interactive/shell/g8a/ch20Generators';
import * as C21 from '@site/src/components/interactive/shell/g8a/ch21Generators';
import * as C22 from '@site/src/components/interactive/shell/g8a/ch22Generators';
import * as C23 from '@site/src/components/interactive/shell/g8a/ch23Generators';

/**
 * 八年级上册（五·四学制）练习：<G8aPractice set="21.2" /> embeds a typed-answer drill
 * for one section; set="ch21" a chapter review; set="exam" a whole-book paper.
 * Pools are lists of generators from shell/g8a/*Generators.js.
 */
const B = '/classes/math-3';
const S = {
  '20.1': { name: '20.1 轴对称', href: `${B}/axial-symmetry`, pool: [eq('垂直平分线求周长', C20.genPerpBisectorPerimeter), eq('对称点的坐标', C20.genReflectPoint)] },
  '20.2': { name: '20.2 画轴对称图形', href: `${B}/drawing-symmetric-figures`, pool: [eq('关于坐标轴对称的点', C20.genReflectPoint), eq('判断是怎样的运动', C20.genWhichMotion)] },
  '20.3.1': {
    name: '20.3.1 等腰三角形',
    href: `${B}/isosceles-triangle`,
    pool: [eq('顶角与底角', C20.genIsoAngles), eq('分类讨论：角', C20.genIsoCases), eq('分类讨论：边', C20.genIsoSides), eq('等边对等角', C20.genIsoChain)],
  },
  '20.3.2': {
    name: '20.3.2 等边三角形',
    href: `${B}/equilateral-triangle`,
    pool: [eq('等边三角形', C20.genEquilateral), eq('30° 角所对的直角边', C20.genThirtySixty), eq('屋架设计', C20.genRoofTruss)],
  },
  '20.4': { name: '20.4 最短路径问题', href: `${B}/shortest-path`, pool: [eq('将军饮马', C20.genGeneralHorse)] },
  '21.1.1': {
    name: '21.1 幂的运算',
    href: `${B}/power-rules`,
    pool: [
      eq('同底数幂的乘法', C21.genSameBaseMul),
      eq('底数带负号', C21.genSignedBaseMul),
      eq('幂的乘方', C21.genPowerOfPower),
      eq('积的乘方', C21.genPowerOfProduct),
      eq('同底数幂的除法', C21.genSameBaseDiv),
    ],
  },
  '21.1.2': {
    name: '21.1 整式的乘除',
    href: `${B}/polynomial-multiplication`,
    pool: [
      eq('单项式 × 单项式', C21.genMonoTimesMono),
      eq('单项式 × 多项式', C21.genMonoTimesPoly),
      eq('多项式 × 多项式', C21.genPolyTimesPoly),
      eq('整式的除法', C21.genDivideByMono),
    ],
  },
  '21.2': {
    name: '21.2 乘法公式',
    href: `${B}/multiplication-formulas`,
    pool: [eq('平方差公式', C21.genDiffSquares), eq('完全平方公式', C21.genPerfectSquare), eq('简便计算', C21.genFormulaArithmetic), eq('化简', C21.genFormulaSimplify)],
  },
  '21.3': {
    name: '21.3 因式分解',
    href: `${B}/factorization`,
    pool: [
      eq('提公因式', C21.genCommonFactor),
      eq('公因式是多项式', C21.genCommonBinomial),
      eq('平方差公式分解', C21.genFactorDiffSquares),
      eq('完全平方公式分解', C21.genFactorPerfectSquare),
      eq('先提后套', C21.genFactorTwoStep),
      eq('x²+(p+q)x+pq 型', C21.genFactorQuadratic),
    ],
  },
  '22.1': {
    name: '22.1 分式',
    href: `${B}/fractions`,
    pool: [eq('分式有意义', C22.genFractionDefined), eq('分式的值为 0', C22.genFractionZero), eq('约分', C22.genReduce), eq('最简公分母', C22.genLcd)],
  },
  '22.2': {
    name: '22.2 分式的运算',
    href: `${B}/fraction-operations`,
    pool: [
      eq('分式乘除', C22.genMulDivMono),
      eq('先分解再约分', C22.genMulDivPoly),
      eq('分式加减', C22.genAddSub),
      eq('负整数指数幂', C22.genNegativeExponent),
      eq('科学记数法', C22.genSciSmall),
    ],
  },
  '22.3': {
    name: '22.3 分式方程',
    href: `${B}/fractional-equations`,
    pool: [eq('解分式方程', C22.genFracEquation), eq('检验增根', C22.genFracEquationRoot), eq('列分式方程', C22.genFracWord)],
  },
  '23.1': { name: '23.1 二次根式', href: `${B}/quadratic-radicals`, pool: [eq('有意义的条件', C23.genRootDefined), eq('双重非负性', C23.genRootSquare)] },
  '23.2': {
    name: '23.2 二次根式的乘除',
    href: `${B}/radical-multiplication`,
    pool: [eq('化简', C23.genSimplifyRoot), eq('乘法', C23.genRootMul), eq('除法与分母有理化', C23.genRootDiv), eq('长方形的边', C23.genRectRoot)],
  },
  '23.3': {
    name: '23.3 二次根式的加减',
    href: `${B}/radical-addition`,
    pool: [eq('合并同类二次根式', C23.genRootAddSub), eq('混合运算', C23.genRootMixed), eq('海伦—秦九韶公式', C23.genHeron)],
  },
};

const CHAPTERS = {
  ch20: ['20.1', '20.2', '20.3.1', '20.3.2', '20.4'],
  ch21: ['21.1.1', '21.1.2', '21.2', '21.3'],
  ch22: ['22.1', '22.2', '22.3'],
  ch23: ['23.1', '23.2', '23.3'],
};
CHAPTERS.exam = [...CHAPTERS.ch20, ...CHAPTERS.ch21, ...CHAPTERS.ch22, ...CHAPTERS.ch23];

const cat = (id, weight = 1) => ({ id, weight, ...S[id] });

export default function G8aPractice({ set, count, children }) {
  if (S[set]) {
    return (
      <MixedPractice categories={[cat(set)]} defaultCount={count || 5} countOptions={[5, 10]} anchorId={`g8a-${set}`}>
        {children}
      </MixedPractice>
    );
  }
  const ids = CHAPTERS[set] || [];
  const isExam = set === 'exam';
  return (
    <MixedPractice
      categories={ids.map((id) => cat(id, isExam ? 1 : S[id].pool.length > 3 ? 2 : 1))}
      defaultCount={count || (isExam ? 20 : 10)}
      countOptions={isExam ? [10, 15, 20] : [5, 10, 15]}
      allowPrint
      anchorId={`g8a-${set}`}
    >
      {children}
    </MixedPractice>
  );
}
