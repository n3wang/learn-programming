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
import { fmtNum, pickOne } from '@site/src/components/interactive/shell/mathRandom';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题 14：满 100 减 50；单件六折。交点 t=125。 */
function bookProblem() {
  return { threshold: 100, off: 50, fold: 6 };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const threshold = pickOne([80, 100, 150, 200]);
    const off = pickOne([30, 40, 50, 60, 80]);
    if (off >= threshold) continue;
    const fold = pickOne([5, 6, 7, 8]); // 五折…八折
    // For t >= threshold: t - off = (fold/10) t → t(1 - fold/10) = off → t = off / (1 - fold/10)
    const cross = off / (1 - fold / 10);
    if (cross <= threshold) continue;
    if (Math.abs(cross - Math.round(cross)) > 1e-9) continue;
    return { threshold, off, fold };
  }
  return bookProblem();
}

function payA(t, p) {
  return t >= p.threshold ? t - p.off : t;
}

function payB(t, p) {
  return (p.fold / 10) * t;
}

function derive(p) {
  const rate = p.fold / 10;
  const cross = p.off / (1 - rate);
  // sample points for the table
  const samples = [
    Math.max(10, Math.round(p.threshold / 2)),
    p.threshold - 1 > 0 ? p.threshold - 1 : Math.round(p.threshold * 0.9),
    p.threshold,
    Math.round((p.threshold + cross) / 2),
    Math.round(cross),
    Math.round(cross + p.threshold / 4),
  ];
  const unique = [...new Set(samples)].filter((t) => t > 0).sort((a, b) => a - b);
  const rows = unique.map((t) => ({
    t,
    a: payA(t, p),
    b: payB(t, p),
    better: payA(t, p) < payB(t, p) ? '方式一' : payA(t, p) > payB(t, p) ? '方式二' : '一样',
  }));
  return { rate, cross, rows, foldName: `${'零一二三四五六七八九'[p.fold]}折` };
}

export default function BookPromoCompareSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="(1)" badgeClass={stepStyles.badgeSet}>
        设原价为 <MathText text={tex('t')} /> 元。
        <div className={stepStyles.eqBox}>
          方式一：原价不足 {p.threshold} 元时付原价；满 {p.threshold} 元后实付{' '}
          <MathText text={tex(`t-${p.off}`)} />。
          <br />
          方式二：
          <MathText text={tex(`${d.rate}t`)} />（{d.foldName}）
        </div>
        列表（节选）：
        <Box sx={{ overflowX: 'auto', mt: 1 }}>
          <Table size="small" sx={{ minWidth: 320 }}>
            <TableHead>
              <TableRow>
                <TableCell>原价 t</TableCell>
                <TableCell align="right">方式一</TableCell>
                <TableCell align="right">方式二</TableCell>
                <TableCell>更省</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {d.rows.map((r) => (
                <TableRow key={r.t}>
                  <TableCell>{r.t}</TableCell>
                  <TableCell align="right">{fmtNum(r.a, 2)}</TableCell>
                  <TableCell align="right">{fmtNum(r.b, 2)}</TableCell>
                  <TableCell>{r.better}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </SolutionStep>
      <SolutionStep badge="(2)" badgeClass={stepStyles.badgeSolve}>
        当 <MathText text={tex(`t < ${p.threshold}`)} /> 时，方式一付 <MathText text={tex('t')} />，方式二付{' '}
        <MathText text={tex(`${d.rate}t`)} />，故方式二更省。
        <br />
        当 <MathText text={tex(`t \\ge ${p.threshold}`)} /> 时，令{' '}
        <MathText text={tex(`t - ${p.off} = ${d.rate}t`)} />，解得{' '}
        <MathText text={tex(`t = ${d.cross}`)} />。
        <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem' }}>
          <li>
            <MathText text={tex(`${p.threshold} \\le t < ${d.cross}`)} />：方式一更省；
          </li>
          <li>
            <MathText text={tex(`t = ${d.cross}`)} />：两种一样；
          </li>
          <li>
            <MathText text={tex(`t > ${d.cross}`)} />：方式二更省。
          </li>
        </ul>
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          分界点原价 <AnimatedNumber value={d.cross} /> 元：低于 {p.threshold} 用{d.foldName}；{' '}
          {p.threshold}～{d.cross}（不含交点）用满减；高于 {d.cross} 再用{d.foldName}。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="图书促销：满减 vs 打折"
      subtitle="分段写出实付一次式，解方程找交点，再比较区间"
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
      <Typography>
        某购物平台两种图书促销方式：方式一——满 <b>{p.threshold}</b> 元减 <b>{p.off}</b> 元；方式二——单件打{' '}
        <b>{d.foldName}</b>。
        <br />
        （1）设某本书原价为 <MathText text={tex('t')} /> 元，列表说明当{' '}
        <MathText text={tex('t')} /> 在不同范围内取值时，按两种方式分别需要支付的金额。
        <br />
        （2）观察列表，根据原价选择更省钱的购买方式，并通过计算验证。
      </Typography>
    </ProblemShell>
  );
}
