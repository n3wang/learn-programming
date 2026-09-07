import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

const BOOK = ['A', 'B', 'C', 'D'];

function bookProblem() {
  return { rays: BOOK, side: 'C' };
}

function generate() {
  const n = randInt(3, 5);
  const letters = 'ABCDE'.slice(0, n).split('');
  const side = letters[randInt(1, n - 2)];
  return { rays: letters, side };
}

function pairsWith(rays, side) {
  return rays.filter((name) => name !== side).map((name) => (name < side ? `∠${name}O${side}` : `∠${side}O${name}`));
}

function RayFigure({ rays }) {
  const cx = 70;
  const cy = 108;
  return (
    <svg viewBox="0 0 220 130" width="100%" height="120">
      {rays.map((name, i) => {
        const ang = (-8 - i * (62 / Math.max(rays.length - 1, 1))) * (Math.PI / 180);
        const x = cx + Math.cos(ang) * 120;
        const y = cy + Math.sin(ang) * 120;
        return (
          <g key={name}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#263238" strokeWidth="1.6" />
            <text x={x + 4} y={y + 4} fontSize="14">{name}</text>
          </g>
        );
      })}
      <text x={cx - 8} y={cy + 16} fontSize="14">O</text>
    </svg>
  );
}

export default function OcSideCountSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const names = useMemo(() => pairsWith(p.rays, p.side), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="边" badgeClass={stepStyles.badgeSet}>
        以射线 O{p.side} 为边，就是这个角的一条边正好是 O{p.side}。另一条边可以是其余每一条射线。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          一共 {names.length} 个：{names.join('、')}。夹在中间的射线只是角的内部，不是边。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 1 题：以一条射线为边的角"
      subtitle="一条边固定，另一条边是其余每一条射线"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <p style={{ marginTop: 0 }}>
        图中以 O{p.side} 为边的角有几个？请把它们表示出来。
      </p>
      <RayFigure rays={p.rays} />
    </ProblemShell>
  );
}
