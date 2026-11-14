import React from 'react';
import MixedPractice from '@site/src/components/interactive/shell/MixedPractice';
import { CATEGORIES as CH5 } from '@site/src/components/interactive/Chapter5MixedPractice';
import { CATEGORIES as CH6 } from '@site/src/components/interactive/Chapter6MixedPractice';

/**
 * 初一模拟卷：把第五章（一元一次方程）与第六章（几何图形初步）的综合练习题库
 * 合在一起，默认抽 20 题。每道题仍走原有随机数生成 / 模拟器，讲解与答案完整保留。
 *
 * Category weights stay as in each chapter pool (ch5 total 10, ch6 total 10),
 * so a 20-question run is roughly half algebra / half geometry.
 */
const CATEGORIES = [...CH5, ...CH6];

const COUNT_OPTIONS = [10, 15, 20];

export default function Grade7PracticeExam({ defaultCount = 20, children }) {
  return (
    <MixedPractice
      categories={CATEGORIES}
      defaultCount={defaultCount}
      countOptions={COUNT_OPTIONS}
      allowPrint
      anchorId="g7-exam-top"
    >
      {children}
    </MixedPractice>
  );
}
