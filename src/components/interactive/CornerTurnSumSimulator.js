import React, { useMemo, useState } from 'react';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

function smallerAngle(v, p, q) {
  const a1 = Math.atan2(p.y - v.y, p.x - v.x);
  const a2 = Math.atan2(q.y - v.y, q.x - v.x);
  let d = Math.abs(a1 - a2) * (180 / Math.PI);
  if (d > 180) d = 360 - d;
  return d;
}

function turnsOf(points) {
  const raw = points.map((v, i) => {
    const prev = points[(i + points.length - 1) % points.length];
    const next = points[(i + 1) % points.length];
    return 180 - smallerAngle(v, prev, next);
  });
  const rounded = raw.map((n) => Math.round(n));
  const drift = 360 - rounded.reduce((s, n) => s + n, 0);
  rounded[rounded.length - 1] += drift;
  return rounded;
}

function bookProblem() {
  return {
    tri: [
      { x: 128, y: 58 },
      { x: 42, y: 148 },
      { x: 206, y: 162 },
    ],
    quad: [
      { x: 48, y: 46 },
      { x: 168, y: 34 },
      { x: 214, y: 118 },
      { x: 62, y: 132 },
    ],
  };
}

function fit(points) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min(150 / (maxX - minX || 1), 100 / (maxY - minY || 1));
  return points.map((p) => ({
    x: 40 + (p.x - minX) * scale,
    y: 36 + (p.y - minY) * scale,
  }));
}

function generate() {
  const a = randInt(40, 75);
  const b = randInt(35, 120 - a);
  const c = 180 - a - b;
  const side = 150;
  const rad = (b * Math.PI) / 180;
  const cLen = side * Math.sin((c * Math.PI) / 180) / Math.sin((a * Math.PI) / 180);
  const Ax = 40 + cLen * Math.cos(Math.PI - rad);
  const Ay = 160 - cLen * Math.sin(rad);
  const quad = [0, 1, 2, 3].map((i) => {
    const ang = -0.5 + i * (Math.PI / 2) + randInt(-8, 12) / 100;
    const r = randInt(70, 100);
    return { x: Math.cos(ang) * r, y: Math.sin(ang) * r };
  });
  return {
    tri: fit([
      { x: Ax, y: Ay },
      { x: 40, y: 160 },
      { x: 190, y: 160 },
    ]),
    quad: fit(quad),
  };
}

function extend(from, through, extra) {
  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: through.x + (dx / len) * extra, y: through.y + (dy / len) * extra };
}

function Figure({ points, labels, color }) {
  const turns = turnsOf(points);
  const n = points.length;
  return (
    <svg viewBox="0 0 260 190" width="100%" height="170">
      {points.map((p, i) => {
        const prev = points[(i + n - 1) % n];
        const next = points[(i + 1) % n];
        const out = extend(prev, p, 28);
        return (
          <line key={`ext-${i}`} x1={p.x} y1={p.y} x2={out.x} y2={out.y} stroke={color} strokeWidth="1.2" />
        );
      })}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
      />
      {points.map((p, i) => (
        <text key={labels[i]} x={p.x + 6} y={p.y - 6} fontSize="13" fill="#e91e63">
          {labels[i]} {turns[i]}°
        </text>
      ))}
    </svg>
  );
}

export default function CornerTurnSumSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const sums = useMemo(() => {
    const three = turnsOf(p.tri);
    const four = turnsOf(p.quad);
    return {
      three,
      four,
      sum3: three.reduce((s, n) => s + n, 0),
      sum4: four.reduce((s, n) => s + n, 0),
    };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="1" badgeClass={stepStyles.badgeSet}>
        图（1）里按同一方向量出的三个角，和是 {sums.three.join('° + ')}° = {sums.sum3}°。
        多画几个类似的图，和总是 360°。
      </SolutionStep>
      <SolutionStep badge="2" badgeClass={stepStyles.badgeSet}>
        图（2）里四个角的和是 {sums.four.join('° + ')}° = {sums.sum4}°。换图以后，和仍是 360°。
      </SolutionStep>
      <SolutionStep badge="猜想" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          围成一个封闭图形时，在每个拐角按同一方向取一个这样的角，无论有 3 个、4 个还是更多，它们的和都是 360°。可以想成：沿边走一圈，每次拐过的角度加起来正好转了整整一周。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="第 15 题：几个角的和"
      subtitle="换几个类似的图，看这些角的和有没有变化"
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
        图上的度数可以当作量出的结果。先算图（1）三个角的和，再算图（2）四个角的和。
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <div>图（1）</div>
          <Figure points={p.tri} labels={['∠3', '∠1', '∠2']} color="#00897b" />
        </div>
        <div>
          <div>图（2）</div>
          <Figure points={p.quad} labels={['∠1', '∠4', '∠3', '∠2']} color="#1565c0" />
        </div>
      </div>
    </ProblemShell>
  );
}
