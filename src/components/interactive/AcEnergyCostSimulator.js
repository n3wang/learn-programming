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
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

const L1 = '#2e7d32';
const L3 = '#ef6c00';

function tex(expr) {
  return `$${expr}$`;
}

/** 书题目：表 5.3-2，电价 0.5 元/(kW·h)，交点 t = 5。 */
function bookProblem() {
  return {
    price1: 3000,
    kwh1: 640,
    price3: 2600,
    kwh3: 800,
    rate: 0.5,
    lifespan: 10,
  };
}

function generate() {
  // Keep yearly costs and break-even year as clean integers.
  for (let i = 0; i < 40; i++) {
    const rate = pickOne([0.5, 0.6, 0.8, 1]);
    const kwh1 = randInt(10, 18) * 40;
    const kwh3 = kwh1 + randInt(3, 8) * 40;
    const yearly1 = rate * kwh1;
    const yearly3 = rate * kwh3;
    if (!Number.isInteger(yearly1) || !Number.isInteger(yearly3)) continue;
    const diffYearly = yearly3 - yearly1;
    if (diffYearly <= 0) continue;
    const tStar = pickOne([4, 5, 6, 8]);
    const priceDiff = diffYearly * tStar;
    const price3 = randInt(20, 35) * 100;
    const price1 = price3 + priceDiff;
    return {
      price1,
      kwh1,
      price3,
      kwh3,
      rate,
      lifespan: 10,
    };
  }
  return bookProblem();
}

function derive(p) {
  const y1 = p.rate * p.kwh1;
  const y3 = p.rate * p.kwh3;
  const tStar = (p.price1 - p.price3) / (y3 - y1);
  const extraPerYear = y3 - y1;
  const rewriteConst = p.price1 - p.price3; // equals extraPerYear * tStar
  return { y1, y3, tStar, extraPerYear, rewriteConst };
}

export default function AcEnergyCostSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const d = useMemo(() => derive(p), [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <div className={stepStyles.legend}>
        <span>
          <span className={stepStyles.swatch} style={{ background: L1 }} />
          1 级能效
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: L3 }} />
          3 级能效
        </span>
      </div>

      <SolutionStep badge="模" badgeClass={stepStyles.badgeSet}>
        综合费用 = 售价 + 电费。设使用年数为 <MathText text={tex('t')} />：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `C_{1} = ${p.price1} + ${p.rate}\\times ${p.kwh1}\\,t = \\textcolor{${L1}}{${p.price1} + ${d.y1}t}`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `C_{3} = ${p.price3} + ${p.rate}\\times ${p.kwh3}\\,t = \\textcolor{${L3}}{${p.price3} + ${d.y3}t}`,
            )}
          />
        </div>
      </SolutionStep>

      <SolutionStep badge="等" badgeClass={stepStyles.badgeList}>
        先求两款费用何时相等：
        <div className={stepStyles.eqBox}>
          <MathText text={tex(`${p.price1} + ${d.y1}t = ${p.price3} + ${d.y3}t`)} />
          <br />
          <MathText text={tex(`\\Rightarrow\\; t = \\mathbf{${d.tStar}}`)} />
        </div>
      </SolutionStep>

      <SolutionStep badge="比" badgeClass={stepStyles.badgeSolve}>
        把 3 级费用改写成「1 级费用 + 校正项」：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `C_{3} = (${p.price1} + ${d.y1}t) + ${d.extraPerYear}(t - ${d.tStar}) = C_{1} + ${d.extraPerYear}(t - ${d.tStar})`,
            )}
          />
        </div>
        因此：
        <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem' }}>
          <li>
            当 <MathText text={tex(`t < ${d.tStar}`)} /> 时，校正项为负 →{' '}
            <span style={{ color: L3, fontWeight: 700 }}>3 级</span> 综合费用更低；
          </li>
          <li>
            当 <MathText text={tex(`t > ${d.tStar}`)} /> 时，校正项为正 →{' '}
            <span style={{ color: L1, fontWeight: 700 }}>1 级</span> 综合费用更低。
          </li>
        </ul>
      </SolutionStep>

      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          交点约 <AnimatedNumber value={d.tStar} /> 年。空调安全使用年限按{' '}
          <b>{p.lifespan}</b> 年计，通常超过 <AnimatedNumber value={d.tStar} /> 年，因此购买、使用{' '}
          <span style={{ color: L1 }}>1 级能效</span> 空调更划算（既节能又省钱）。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="探究：不同能效空调的综合费用"
      subtitle="综合费用 = 售价 + 电费；用电价与年耗电量列出关于使用年数 t 的一次式"
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
        购买空调时要综合考虑价格和耗电。电价为 <b>{p.rate}</b> 元/(kW·h)。两款同为 1.5 匹的空调信息如下，分析购买、使用哪款综合费用较低。
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 360 }}>
          <TableHead>
            <TableRow>
              <TableCell>匹数</TableCell>
              <TableCell>能效等级</TableCell>
              <TableCell align="right">售价 / 元</TableCell>
              <TableCell align="right">平均每年耗电量 /(kW·h)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1.5</TableCell>
              <TableCell>
                <span style={{ color: L1, fontWeight: 700 }}>1 级</span>
              </TableCell>
              <TableCell align="right">{p.price1}</TableCell>
              <TableCell align="right">{p.kwh1}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>1.5</TableCell>
              <TableCell>
                <span style={{ color: L3, fontWeight: 700 }}>3 级</span>
              </TableCell>
              <TableCell align="right">{p.price3}</TableCell>
              <TableCell align="right">{p.kwh3}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </ProblemShell>
  );
}
