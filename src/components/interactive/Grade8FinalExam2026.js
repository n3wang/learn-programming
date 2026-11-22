import React from 'react';
import { eq } from '@site/src/components/interactive/shell/MixedPractice';
import ExamMirror from '@site/src/components/interactive/shell/ExamMirror';
import * as G from '@site/src/components/interactive/shell/grade8ExamGenerators';

/** 2026 年下半学期初二数学期末考试 — every question, in paper order. */
const q = (id, name, href, label, gen) => ({ id, name, href, weight: 1, pool: [eq(label, gen)] });

const SET = '/classes/math-2/inequalities';
const PROP = '/classes/math-2/inequality-properties';
const LIN = '/classes/math-2/linear-inequalities';
const ISYS = '/classes/math-2/inequality-systems';
const SYS = '/classes/math-2/solving-systems-of-equations';
const APP2 = '/classes/math-2/practical-problems-two-var-equations';
const CONCEPT = '/classes/math-2/two-var-system-concept';
const THREE = '/classes/math-2/solving-three-var-systems';

export const CATEGORIES = [
  q('s1', '一、选择题 1', SET, '读数轴写解集', G.genG8Q1),
  q('s2', '一、选择题 2', SET, '读数轴写解集（分数）', G.genG8Q2),
  q('s3', '一、选择题 3', PROP, '除以负数要变号', G.genG8Q3),
  q('s4', '一、选择题 4', ISYS, '两边夹的解集', G.genG8Q4),
  q('s5', '一、选择题 5', ISYS, '同大取大 / 同小取小', G.genG8Q5),
  q('a6', '二、应用题 6', LIN, '知识竞赛：至少答对几道', G.genG8Q6),
  q('a7', '二、应用题 7', APP2, '两天徒步：平均速度', G.genG8Q7),
  q('a8', '二、应用题 8', LIN, '两种套餐：利润与数量', G.genG8Q8),
  q('ea', '三、解方程组 a', SYS, '代入消元', G.genG8SysA),
  q('eb', '三、解方程组 b', SYS, '代入消元', G.genG8SysB),
  q('ec', '三、解方程组 c', SYS, '先解出 y 再代入', G.genG8SysC),
  q('ed', '三、解方程组 d', SYS, '先解出 x 再代入', G.genG8SysD),
  q('ia', '四、解不等式 a', LIN, '去括号', G.genG8IneqA),
  q('ib', '四、解不等式 b', LIN, '两边都有括号', G.genG8IneqB),
  q('ic', '四、解不等式 c', LIN, '去分母', G.genG8IneqC),
  q('ka', '五、解不等式组 a', ISYS, '不等式组', G.genG8IsysA),
  q('kb', '五、解不等式组 b', ISYS, '不等式组', G.genG8IsysB),
  q('x9', '附加题 9', APP2, '大小货车', G.genG8Q9),
  q('x10', '附加题 10', CONCEPT, '由解求系数', G.genG8Q10),
  q('x11a', '附加题 11a', THREE, '三元一次方程组', G.genG8ThreeA),
  q('x11b', '附加题 11b', THREE, '三元一次方程组', G.genG8ThreeB),
];

export default function Grade8FinalExam2026({ children }) {
  return (
    <ExamMirror categories={CATEGORIES} anchorId="g8-final-2026-top">
      {children}
    </ExamMirror>
  );
}
