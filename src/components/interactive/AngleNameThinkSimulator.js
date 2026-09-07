import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

export default function AngleNameThinkSimulator() {
  const [key, setKey] = useState(0);
  const [canUseO, setCanUseO] = useState(null);
  const [other, setOther] = useState('');

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="不能" badgeClass={stepStyles.badgeSet}>
        顶点 O 处不止一个角。图中有角 α，也有角 β，写成角 O 说不清是哪一个。
      </SolutionStep>
      <SolutionStep badge="还可以" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          角 α 是射线 OA 与射线 OB 组成的角，可以记作角 AOB 或角 BOA。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="思考：角 α 能记作角 O 吗？"
      subtitle="一个顶点只有一个角时，才可以用顶点的字母表示这个角"
      problemKey={key}
      onRandomize={() => {
        setCanUseO(null);
        setOther('');
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setCanUseO(null);
        setOther('');
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        如图，从点 O 画出射线 OA、OB、OC。角 α 在 OA 与 OB 之间，角 β 在 OB 与 OC 之间。能把角 α 记作角 O 吗？角 α 还可以怎样表示？
      </p>
      <svg viewBox="0 0 220 120" width="100%" height="110">
        <line x1="28" y1="96" x2="200" y2="96" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="28" y1="96" x2="150" y2="28" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="28" y1="96" x2="190" y2="48" stroke="#1565c0" strokeWidth="1.6" />
        <path d="M52 96 A24 24 0 0 0 42 78" fill="none" stroke="#e91e63" />
        <path d="M68 96 A40 40 0 0 0 58 72" fill="none" stroke="#e91e63" />
        <text x="16" y="108" fontSize="13">O</text>
        <text x="148" y="24" fontSize="13">A</text>
        <text x="192" y="46" fontSize="13">B</text>
        <text x="202" y="100" fontSize="13">C</text>
        <text x="54" y="84" fontSize="13">α</text>
        <text x="78" y="88" fontSize="13">β</text>
      </svg>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[
          ['no', '不能记作角 O'],
          ['yes', '可以记作角 O'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setCanUseO(id)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: canUseO === id ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <label>
        还可以记作
        <input
          value={other}
          onChange={(e) => setOther(e.target.value)}
          style={{ marginLeft: 8, font: 'inherit', padding: '4px 8px', borderRadius: 5, border: '1px solid var(--ifm-color-emphasis-300)' }}
        />
      </label>
    </ProblemShell>
  );
}
