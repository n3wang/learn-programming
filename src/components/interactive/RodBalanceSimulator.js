import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import Box from '@site/src/components/ui/Box';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题示意图：支点在中点；右边 1 个重物在端点，左边 n 个。取一组可观察的记录。 */
function bookProblem() {
  return { n: 3, length: 60 };
}

function generate() {
  const n = pickOne([2, 3, 4, 5]);
  const half = n * pickOne([8, 10, 12, 15]);
  return { n, length: 2 * half };
}

function derive(p) {
  const rightArm = p.length / 2;
  const x = rightArm / p.n;
  const records = [1, 2, 3, 4].map((k) => ({
    k,
    xk: rightArm / k,
  }));
  return { rightArm, x, records };
}

function RodSketch({ n, length, x, rightArm }) {
  const width = 320;
  const left = 16;
  const rodW = width - 32;
  const mid = left + rodW / 2;
  const leftX = mid - (x / (length / 2)) * (rodW / 2);
  return (
    <svg viewBox={`0 0 ${width} 92`} width="100%" style={{ maxWidth: 420, display: 'block' }}>
      <line x1={left} y1={36} x2={left + rodW} y2={36} stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <polygon points={`${mid - 8},44 ${mid + 8},44 ${mid},58`} fill="currentColor" />
      <text x={mid} y={74} textAnchor="middle" fontSize="11">
        支点
      </text>
      <circle cx={leftX} cy={22} r="7" fill="#1565c0" />
      <text x={leftX} y={14} textAnchor="middle" fontSize="11" fill="#1565c0">
        {n} 个
      </text>
      <circle cx={left + rodW} cy={22} r="7" fill="#c62828" />
      <text x={left + rodW} y={14} textAnchor="middle" fontSize="11" fill="#c62828">
        1 个
      </text>
      <text x={(leftX + mid) / 2} y={88} textAnchor="middle" fontSize="11">
        x
      </text>
      <text x={(mid + left + rodW) / 2} y={88} textAnchor="middle" fontSize="11">
        {rightArm}
      </text>
    </svg>
  );
}

export default function RodBalanceSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="律" badgeClass={stepStyles.badgeSet}>
        木杆质地均匀，支点在中点，杆自身的重力作用线过支点，力矩为 0。左右各挂等重小物体时，平衡条件是「左边总重力 × 力臂 = 右边总重力 × 力臂」。
        若每个小物体重为 1 份，右边始终挂 1 个且在端点（力臂 <MathText text={tex(`${d.rightArm}`)} /> cm），左边挂{' '}
        <MathText text={tex('k')} /> 个、力臂为 <MathText text={tex('x_k')} />，则
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`k\\, x_k = ${d.rightArm}`)} />
        </div>
        所以 <MathText text={tex('k x_k')} /> 是常数：左边重物越多，就要越靠近支点。
      </SolutionStep>
      <SolutionStep badge="列" badgeClass={stepStyles.badgeList}>
        左边挂 <MathText text={tex('n')} /> 个、力臂为 <MathText text={tex('x')} /> cm，木杆长{' '}
        <MathText text={tex('l')} /> cm 时：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`n x = \\dfrac{l}{2}`)} />
          <br />
          或 <MathText text={tex(`2nx = l`)} />
        </div>
      </SolutionStep>
      <SolutionStep badge="解" badgeClass={stepStyles.badgeSolve}>
        代入 <MathText text={tex(`n=${p.n}`)} />、<MathText text={tex(`l=${p.length}`)} />：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${p.n}x = ${d.rightArm} \\Rightarrow x = ${d.x}`)} />
        </div>
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          关于 <MathText text={tex('x')} /> 的方程是 <MathText text={tex('2nx=l')} />；这里{' '}
          <MathText text={tex(`x=${d.x}`)} /> cm。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="活动 2：木杆挂重物"
      subtitle="等重物体、支点在中点 → 左边个数 × 力臂 = 右边力臂"
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
      <Typography sx={{ mb: 1 }}>
        用质地均匀的木杆和等重小物体做实验：吊绳拴在木杆正中，作为支点。右端始终挂 1 个重物；左边依次加挂并整体向右移动，直到再次平衡。木杆长{' '}
        <b>{p.length}</b> cm，当前左边挂 <b>{p.n}</b> 个重物。
      </Typography>
      <RodSketch n={p.n} length={p.length} x={d.x} rightArm={d.rightArm} />
      <Typography sx={{ mb: 1 }}>
        若按同样规则记录「左边个数」与「支点到左边挂点的距离」，可得到：
      </Typography>
      <Box sx={{ overflowX: 'auto', mb: 1.5 }}>
        <Table size="small" sx={{ maxWidth: 360 }}>
          <TableHead>
            <TableRow>
              <TableCell>左边重物个数 k</TableCell>
              <TableCell align="right">力臂 x / cm</TableCell>
              <TableCell align="right">k × x</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {d.records.map((r) => (
              <TableRow key={r.k}>
                <TableCell>{r.k}</TableCell>
                <TableCell align="right">{r.xk}</TableCell>
                <TableCell align="right">{d.rightArm}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Typography>
        设木杆长为 <MathText text={tex('l')} /> cm，支点在中点，支点与左边挂重物处的距离为{' '}
        <MathText text={tex('x')} /> cm，右边挂 1 个、左边挂 <MathText text={tex('n')} /> 个。把{' '}
        <MathText text={tex('n')} />、<MathText text={tex('l')} /> 当作已知数，列出关于{' '}
        <MathText text={tex('x')} /> 的一元一次方程，并求此时的 <MathText text={tex('x')} />。
      </Typography>
    </ProblemShell>
  );
}
