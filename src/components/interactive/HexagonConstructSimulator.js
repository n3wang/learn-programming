import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

export default function HexagonConstructSimulator() {
  const [key, setKey] = useState(0);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="作" badgeClass={stepStyles.badgeSet}>
        正六边形的六个内角相等，从中心看，每一份圆心角是 60°。
      </SolutionStep>
      <SolutionStep badge="法" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          1. 用圆规画圆，圆心为 O。2. 用三角尺在圆心处画 60° 角，或用圆规以半径为弦长，在圆上依次截取六段相等的弧。3. 顺次连接六个分点，就得到正六边形。半径等于边长。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 4：画正六边形"
      subtitle="圆心角是 60°，半径等于边长"
      problemKey={key}
      onRandomize={() => setKey((k) => k + 1)}
      onBook={() => setKey((k) => k + 1)}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        蜂巢由许多正六边形排列而成。按图示，利用三角尺和圆规画出一个正六边形。
      </p>
      <svg viewBox="0 0 220 140" width="100%" height="130">
        <polygon
          points="110,18 162,48 162,98 110,128 58,98 58,48"
          fill="none"
          stroke="#1565c0"
          strokeWidth="1.6"
        />
        <circle cx="110" cy="73" r="3" fill="#c62828" />
        <line x1="110" y1="73" x2="162" y2="48" stroke="#e91e63" strokeDasharray="3 3" />
        <text x="168" y="52" fontSize="12">60°</text>
      </svg>
    </ProblemShell>
  );
}
