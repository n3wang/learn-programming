import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const ROWS = [
  ['∠1', '∠2', '∠3', '∠B', '∠4', '∠D'],
  ['∠CAD', '∠ACB', '∠BAC', '∠ABC', '∠ACD', '∠ADC'],
];

export default function AngleNameTableSimulator() {
  const [key, setKey] = useState(0);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="填" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          ∠1 = ∠CAD，∠2 = ∠ACB，∠3 = ∠BAC，∠B = ∠ABC，∠4 = ∠ACD，∠D = ∠ADC。
          顶点处有不只一个角时，不能只写顶点字母。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 2：用另一种方法表示角"
      subtitle="对角线 AC 把平行四边形分成两个三角形"
      problemKey={key}
      onRandomize={() => setKey((k) => k + 1)}
      onBook={() => setKey((k) => k + 1)}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>根据图中信息，把表里的角用另一种方法表示出来。</p>
      <svg viewBox="0 0 280 130" width="100%" height="120">
        <polygon points="70,28 230,28 190,108 30,108" fill="none" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="70" y1="28" x2="190" y2="108" stroke="#00897b" strokeWidth="1.6" />
        <text x="58" y="22" fontSize="13">A</text>
        <text x="232" y="24" fontSize="13">D</text>
        <text x="18" y="116" fontSize="13">B</text>
        <text x="194" y="116" fontSize="13">C</text>
        <text x="108" y="36" fontSize="12">1</text>
        <text x="62" y="48" fontSize="12">3</text>
        <text x="168" y="100" fontSize="12">2</text>
        <text x="178" y="92" fontSize="12">4</text>
      </svg>
      <table style={{ borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
        <tbody>
          {['表示方法 1', '表示方法 2'].map((label, r) => (
            <tr key={label}>
              <th style={{ border: '1px solid var(--ifm-color-emphasis-300)', padding: '4px 8px' }}>{label}</th>
              {ROWS[r].map((cell) => (
                <td key={cell} style={{ border: '1px solid var(--ifm-color-emphasis-300)', padding: '4px 8px' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ProblemShell>
  );
}
