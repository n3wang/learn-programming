import React from 'react';
import { eq } from '@site/src/components/interactive/shell/MixedPractice';
import ExamMirror from '@site/src/components/interactive/shell/ExamMirror';
import * as G from '@site/src/components/interactive/shell/grade7ExamGenerators';

/** 2026 年下半学期初一数学期末考试 — every question, in paper order. */
const q = (id, name, href, label, gen) => ({ id, name, href, weight: 1, pool: [eq(label, gen)] });

const ANG = '/classes/math-1/complementary-angles';
const ANGLES = '/classes/math-1/angles';
const PROFIT = '/classes/math-1/cost-price-profit-loss';
const SOLVE = '/classes/math-1/solving-linear-equations';
const PRACT = '/classes/math-1/practical-problems-linear-equations';
const COST = '/classes/math-1/comprehensive-cost-comparison';

export const CATEGORIES = [
  q('s1', '一、选择题 1', ANG, '余角与补角', G.genG7Q1),
  q('s2', '一、选择题 2', ANGLES, '角平分线', G.genG7Q2),
  q('s3', '一、选择题 3', PROFIT, '盈利：利润与售价', G.genG7Q3),
  q('s4', '一、选择题 4', PROFIT, '亏损：亏损额与售价', G.genG7Q4),
  q('s5', '一、选择题 5', ANGLES, '度分的减法', G.genG7Q5),
  q('a6', '二、应用题 6', ANGLES, '分蛋糕：圆心角', G.genG7Q6),
  q('a7', '二、应用题 7', COST, '两种批发方案', G.genG7Q7),
  q('a8', '二、应用题 8', PRACT, '相向而行', G.genG7Q8),
  q('a9', '二、应用题 9', PRACT, '零件配套', G.genG7Q9),
  q('ea', '三、解方程 a', SOLVE, '移项、合并', G.genG7EqA),
  q('eb', '三、解方程 b', SOLVE, '移项、合并', G.genG7EqB),
  q('ec', '三、解方程 c', SOLVE, '去括号', G.genG7EqC),
  q('ed', '三、解方程 d', SOLVE, '去括号（前面是减号）', G.genG7EqD),
  q('ee', '三、解方程 e', SOLVE, '去分母', G.genG7EqE),
  q('ef', '三、解方程 f', SOLVE, '去分母（分母带负号）', G.genG7EqF),
  q('eg', '三、解方程 g', SOLVE, '去括号', G.genG7EqG),
  q('eh', '三、解方程 h', SOLVE, '文字列方程', G.genG7EqH),
  q('x10', '附加题 10', PRACT, '水面上升求体积', G.genG7Q10),
  q('x11', '附加题 11', SOLVE, '文字列方程', G.genG7Q11),
  q('x12', '附加题 12', ANG, '角的和差', G.genG7Q12),
];

export default function Grade7FinalExam2026({ children }) {
  return (
    <ExamMirror categories={CATEGORIES} anchorId="g7-final-2026-top">
      {children}
    </ExamMirror>
  );
}
