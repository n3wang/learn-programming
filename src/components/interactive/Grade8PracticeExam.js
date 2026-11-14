import React from 'react';
import MixedPractice from '@site/src/components/interactive/shell/MixedPractice';
import { CATEGORIES as CH10 } from '@site/src/components/interactive/Chapter10MixedPractice';
import { CATEGORIES as CH11 } from '@site/src/components/interactive/Chapter11MixedPractice';

/**
 * 初二模拟卷：把第十章（二元一次方程组）与第十一章（不等式）的综合练习题库
 * 合在一起，默认抽 20 题。每道题仍走原有随机数生成 / 模拟器，讲解与答案完整保留。
 *
 * Category weights stay as in each chapter pool (ch10 total 10, ch11 total 10),
 * so a 20-question run is roughly half systems / half inequalities.
 */
const CATEGORIES = [...CH10, ...CH11];

const COUNT_OPTIONS = [10, 15, 20];

export default function Grade8PracticeExam({ defaultCount = 20, children }) {
  return (
    <MixedPractice
      categories={CATEGORIES}
      defaultCount={defaultCount}
      countOptions={COUNT_OPTIONS}
      allowPrint
      anchorId="g8-exam-top"
    >
      {children}
    </MixedPractice>
  );
}
