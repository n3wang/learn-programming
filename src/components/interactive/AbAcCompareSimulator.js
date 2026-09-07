import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function dist(p, q) {
  return Math.hypot(p.x - q.x, p.y - q.y);
}

function sign(ab, ac) {
  const d = ab - ac;
  if (Math.abs(d) < 0.8) return '=';
  return d > 0 ? '>' : '<';
}

/** 书题三个图形：AB 与 AC 的大小按图中实际长度判定。 */
const BOOK = [
  { A: { x: 28, y: 78 }, B: { x: 148, y: 86 }, C: { x: 112, y: 34 } },
  { A: { x: 24, y: 84 }, B: { x: 110, y: 80 }, C: { x: 118, y: 22 } },
  { A: { x: 28, y: 86 }, B: { x: 128, y: 86 }, C: { x: 78, y: 28 } },
];

function generate() {
  return [0, 1, 2].map(() => {
    const A = { x: 24, y: 86 };
    const B = { x: 24 + randInt(70, 130), y: 78 + randInt(-8, 10) };
    const C = { x: 40 + randInt(20, 90), y: 22 + randInt(0, 18) };
    return { A, B, C };
  });
}

function Tri({ fig, index }) {
  const { A, B, C } = fig;
  return (
    <svg viewBox="0 0 170 110" width="100%" height="110">
      <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#1565c0" strokeWidth="2" />
      <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#1565c0" strokeWidth="2" />
      <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#90caf9" strokeWidth="1.4" />
      <text x={A.x - 10} y={A.y + 4} fontSize="13">A</text>
      <text x={B.x + 4} y={B.y + 4} fontSize="13">B</text>
      <text x={C.x + 2} y={C.y - 4} fontSize="13">C</text>
      <text x="70" y="106" fontSize="12">({index + 1})</text>
    </svg>
  );
}

export default function AbAcCompareSimulator() {
  const [key, setKey] = useState(0);
  const [figs, setFigs] = useState(BOOK);
  const [picks, setPicks] = useState({});

  const answers = useMemo(
    () => figs.map((fig) => sign(dist(fig.A, fig.B), dist(fig.A, fig.C))),
    [figs],
  );

  const solution = (
    <div className={stepStyles.solution}>
      {figs.map((fig, i) => {
        const ab = dist(fig.A, fig.B);
        const ac = dist(fig.A, fig.C);
        return (
          <SolutionStep key={i} badge={String(i + 1)} badgeClass={stepStyles.badgeSet}>
            AB {answers[i]} AC。把两条线段量一量：AB 约 {ab.toFixed(0)}，AC 约 {ac.toFixed(0)}（同一比例）。
            两点之间线段最短，所以在这个三角形里 AB、AC 都比折线长，但比较的是这两条线段本身。
          </SolutionStep>
        );
      })}
    </div>
  );

  return (
    <ProblemShell
      title="练习 1：估计 AB 与 AC"
      subtitle="先看图估计，再用同一把尺去量"
      problemKey={key}
      onRandomize={() => {
        setFigs(generate());
        setPicks({});
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setFigs(BOOK);
        setPicks({});
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>估计图中线段 AB 与 AC 的大小关系，再对照解答里的度量。</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
        {figs.map((fig, i) => (
          <div key={i}>
            <Tri fig={fig} index={i} />
            <div style={{ display: 'flex', gap: 4 }}>
              {['<', '=', '>'].map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setPicks((prev) => ({ ...prev, [i]: op }))}
                  style={{
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: 5,
                    padding: '1px 8px',
                    background: picks[i] === op ? 'rgba(21,101,192,0.12)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  AB {op} AC
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ProblemShell>
  );
}
