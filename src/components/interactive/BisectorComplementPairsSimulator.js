import React, { useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';

const PAIRS = [
  ['∠COD', '∠COE'],
  ['∠AOD', '∠BOE'],
  ['∠AOD', '∠COE'],
  ['∠COD', '∠BOE'],
];

export default function BisectorComplementPairsSimulator() {
  const [key, setKey] = useState(0);
  const [picked, setPicked] = useState([]);

  function toggle(pair) {
    const id = pair.join('-');
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="补" badgeClass={stepStyles.badgeSet}>
        A、O、B 在同一直线上，所以角 AOC 与角 BOC 互为补角，它们的和是 180°。
      </SolutionStep>
      <SolutionStep badge="余" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          OD 平分角 AOC，OE 平分角 BOC。
          角 COD + 角 COE = 一半的角 AOC + 一半的角 BOC = 90°。
          所以角 COD 与角 COE 互余。同理，角 AOD 与角 BOE、角 AOD 与角 COE、角 COD 与角 BOE 也互余。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="例 4：哪些角互为余角？"
      subtitle="先看出互补的平角，再用平分线各取一半"
      problemKey={key}
      onRandomize={() => {
        setPicked([]);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setPicked([]);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        点 A、O、B 在同一直线上。射线 OD 平分角 AOC，射线 OE 平分角 BOC。先选出你认为互余的一对。
      </p>
      <svg viewBox="0 0 280 130" width="100%" height="110">
        <line x1="16" y1="88" x2="264" y2="88" stroke="#1565c0" strokeWidth="1.8" />
        <line x1="140" y1="88" x2="70" y2="18" stroke="#1565c0" strokeWidth="1.6" />
        <line x1="140" y1="88" x2="188" y2="16" stroke="#e91e63" strokeWidth="1.6" />
        <line x1="140" y1="88" x2="220" y2="42" stroke="#00897b" strokeWidth="1.6" />
        <text x="8" y="104" fontSize="13">A</text>
        <text x="134" y="104" fontSize="13">O</text>
        <text x="256" y="104" fontSize="13">B</text>
        <text x="58" y="16" fontSize="13">D</text>
        <text x="192" y="14" fontSize="13">C</text>
        <text x="224" y="40" fontSize="13">E</text>
      </svg>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PAIRS.map((pair) => {
          const id = pair.join('-');
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(pair)}
              style={{
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 5,
                padding: '2px 10px',
                background: picked.includes(id) ? 'rgba(21,101,192,0.12)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {pair[0]} 与 {pair[1]}
            </button>
          );
        })}
      </div>
    </ProblemShell>
  );
}
