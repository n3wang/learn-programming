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
import { fmtNum, pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题：第一阶梯 0～180 元单价 4.5；181～240 为 6；240 以上为 8。水费 930 元 → 200 m³。 */
function bookProblem() {
  return {
    t1: 180,
    t2: 240,
    r1: 4.5,
    r2: 6,
    r3: 8,
    fee: 930,
  };
}

function feeFor(t, p) {
  if (t <= p.t1) return (p.r1 * t * 100) / 100;
  if (t <= p.t2) return p.r1 * p.t1 + p.r2 * (t - p.t1);
  return p.r1 * p.t1 + p.r2 * (p.t2 - p.t1) + p.r3 * (t - p.t2);
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const t1 = pickOne([120, 150, 180, 200]);
    const span = pickOne([40, 60, 80]);
    const t2 = t1 + span;
    const r1 = pickOne([3, 4, 4.5, 5]);
    const r2 = pickOne([6, 7, 8]);
    const r3 = pickOne([9, 10, 12]);
    if (!(r1 < r2 && r2 < r3)) continue;
    const tier = pickOne([2, 3]);
    const t = tier === 2 ? randInt(t1 + 1, t2) : randInt(t2 + 1, t2 + 40);
    const fee = feeFor(t, { t1, t2, r1, r2, r3 });
    const rounded = Math.round(fee * 10) / 10;
    if (Math.abs(fee - rounded) > 1e-6) continue;
    const solved = solveVolume({ t1, t2, r1, r2, r3, fee: rounded });
    if (!Number.isInteger(solved.t) || solved.t !== t) continue;
    return { t1, t2, r1, r2, r3, fee: rounded };
  }
  return bookProblem();
}

function solveVolume(p) {
  const cap1 = p.r1 * p.t1;
  const cap2 = cap1 + p.r2 * (p.t2 - p.t1);
  if (p.fee <= cap1 + 1e-9) {
    return { tier: 1, t: p.fee / p.r1 };
  }
  if (p.fee <= cap2 + 1e-9) {
    return { tier: 2, t: p.t1 + (p.fee - cap1) / p.r2 };
  }
  return { tier: 3, t: p.t2 + (p.fee - cap2) / p.r3 };
}

export default function WaterTierPricingSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => {
    const cap1 = p.r1 * p.t1;
    const mid = p.t2 - p.t1;
    const cap2 = cap1 + p.r2 * mid;
    const solved = solveVolume(p);
    return { cap1, mid, cap2, ...solved };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="(1)" badgeClass={stepStyles.badgeSet}>
        设年用水量为 <MathText text={tex('t')} /> m³（正整数）。阶梯计价是分段累计，不是整段都按最高单价：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `C=\\begin{cases} ${p.r1}t, & 1\\le t\\le ${p.t1} \\\\ ${p.r1}\\times ${p.t1}+${p.r2}(t-${p.t1}), & ${p.t1}+1\\le t\\le ${p.t2} \\\\ ${fmtNum(d.cap2, 2)}+${p.r3}(t-${p.t2}), & t\\ge ${p.t2 + 1} \\end{cases}`,
            )}
          />
        </div>
        第一阶梯封顶约 <MathText text={tex(`${fmtNum(d.cap1, 2)}`)} /> 元；用到第二阶梯顶端约{' '}
        <MathText text={tex(`${fmtNum(d.cap2, 2)}`)} /> 元。
      </SolutionStep>
      <SolutionStep badge="(2)" badgeClass={stepStyles.badgeSolve}>
        水费 <b>{p.fee}</b> 元
        {d.tier === 1
          ? `不超过第一阶梯封顶 ${fmtNum(d.cap1, 2)} 元，所以全部按第一阶梯计费。`
          : d.tier === 2
            ? `超过第一阶梯封顶 ${fmtNum(d.cap1, 2)} 元，但不超过第二阶梯顶端 ${fmtNum(d.cap2, 2)} 元，所以落在第二阶梯。`
            : `超过第二阶梯顶端 ${fmtNum(d.cap2, 2)} 元，所以已进入第三阶梯。`}
        <div className={stepStyles.eqBox}>
          {d.tier === 1 ? (
            <MathText text={tex(`${p.r1}t = ${p.fee} \\Rightarrow t = ${fmtNum(d.t, 4)}`)} />
          ) : d.tier === 2 ? (
            <MathText
              text={tex(
                `${fmtNum(d.cap1, 2)} + ${p.r2}(t-${p.t1}) = ${p.fee} \\Rightarrow t = ${fmtNum(d.t, 4)}`,
              )}
            />
          ) : (
            <MathText
              text={tex(
                `${fmtNum(d.cap2, 2)} + ${p.r3}(t-${p.t2}) = ${p.fee} \\Rightarrow t = ${fmtNum(d.t, 4)}`,
              )}
            />
          )}
        </div>
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          年用水量为 <AnimatedNumber value={d.t} /> m³。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="活动 1：生活用水阶梯计价"
      subtitle="分段累计计费；先判断水费落在哪一阶，再列一元一次方程"
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
      <Typography sx={{ mb: 1.5 }}>
        居民生活用水按户计费（户内人口不超过 4 人）。年用水量 <MathText text={tex('t')} /> m³（正整数）时，按下表阶梯计价。
      </Typography>
      <Box sx={{ overflowX: 'auto', mb: 1.5 }}>
        <Table sx={{ minWidth: 360 }}>
          <TableHead>
            <TableRow>
              <TableCell>收费方式</TableCell>
              <TableCell>年用水量 / m³</TableCell>
              <TableCell align="right">费用 /（元/m³）</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>第一阶梯</TableCell>
              <TableCell>0～{p.t1}</TableCell>
              <TableCell align="right">{p.r1}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>第二阶梯</TableCell>
              <TableCell>{p.t1 + 1}～{p.t2}</TableCell>
              <TableCell align="right">{p.r2}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>第三阶梯</TableCell>
              <TableCell>{p.t2} 以上</TableCell>
              <TableCell align="right">{p.r3}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
      <Typography>
        （1）列表说明 <MathText text={tex('t')} /> 在不同范围内时如何计费。
        <br />
        （2）已知某户一年水费为 <b>{p.fee}</b> 元，这户居民的年用水量是多少立方米？
      </Typography>
    </ProblemShell>
  );
}
