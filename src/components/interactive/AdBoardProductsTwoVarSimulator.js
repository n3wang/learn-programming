import React from 'react';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import Box from '@site/src/components/ui/Box';
import TwoVarWordProblemBase from '@site/src/components/interactive/shell/TwoVarWordProblemBase';
import TwoVarSolution from '@site/src/components/interactive/shell/TwoVarSolution';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { texEq, texX, texY } from '@site/src/components/interactive/shell/texMath';
import { randInt } from '@site/src/components/interactive/shell/mathRandom';

/**
 * 展板 x、横幅 y；宣传册 = 5x。
 * 书题：时间 25 h、利润 975 → x=10，y=10，总件数 70。
 */
function bookProblem() {
  return {
    brochureMult: 5,
    tBoard: 1,
    tBrochure: 0.2,
    tBanner: 0.5,
    pBoard: 60,
    pBrochure: 3.5,
    pBanner: 20,
    hours: 25,
    profit: 975,
    x: 10,
    y: 10,
  };
}

function generate() {
  for (let i = 0; i < 40; i++) {
    const brochureMult = randInt(3, 6);
    const x = randInt(4, 12);
    const y = randInt(4, 16);
    const tBoard = 1;
    const tBrochure = 0.2;
    const tBanner = 0.5;
    const pBoard = randInt(4, 8) * 10;
    const pBrochure = randInt(2, 5) + 0.5;
    const pBanner = randInt(2, 5) * 5;
    const hours = tBoard * x + tBrochure * brochureMult * x + tBanner * y;
    const profit = pBoard * x + pBrochure * brochureMult * x + pBanner * y;
    if (!Number.isInteger(hours * 2) || !Number.isInteger(profit * 2)) continue;
    return {
      brochureMult,
      tBoard,
      tBrochure,
      tBanner,
      pBoard,
      pBrochure,
      pBanner,
      hours,
      profit,
      x,
      y,
    };
  }
  return bookProblem();
}

export default function AdBoardProductsTwoVarSimulator() {
  return (
    <TwoVarWordProblemBase
      title="展板 · 宣传册 · 横幅"
      subtitle="宣传册是展板的倍数 → 实质两个未知数；时间方程 + 利润方程"
      bookProblem={bookProblem}
      generate={generate}
      renderProblem={(p) => (
        <>
          <Typography sx={{ mb: 1.25 }}>
            广告公司为学校制作展板、宣传册和横幅，宣传册数量是展板的 <b>{p.brochureMult}</b>{' '}
            倍。制作时间与利润如下表。三种产品共需 <b>{p.hours}</b> h，所获利润 <b>{p.profit}</b>{' '}
            元。求这三种产品的总件数。
          </Typography>
          <Box sx={{ overflowX: 'auto', maxWidth: 420 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>产品</TableCell>
                  <TableCell align="right">展板</TableCell>
                  <TableCell align="right">宣传册</TableCell>
                  <TableCell align="right">横幅</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>时间 / h</TableCell>
                  <TableCell align="right">{p.tBoard}</TableCell>
                  <TableCell align="right">{p.tBrochure}</TableCell>
                  <TableCell align="right">{p.tBanner}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>利润 / 元</TableCell>
                  <TableCell align="right">{p.pBoard}</TableCell>
                  <TableCell align="right">{p.pBrochure}</TableCell>
                  <TableCell align="right">{p.pBanner}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </>
      )}
      renderSolution={(p, s) => {
        const brochures = p.brochureMult * s.x;
        const total = s.x + brochures + s.y;
        const timeBoard = p.tBoard + p.tBrochure * p.brochureMult;
        const profitBoard = p.pBoard + p.pBrochure * p.brochureMult;
        return (
          <TwoVarSolution
            legendX="展板件数"
            legendY="横幅件数"
            setText={
              <>
                设展板 <MathText text={texX()} /> 件，横幅 <MathText text={texY()} /> 件，则宣传册{' '}
                <MathText text={texEq(`${p.brochureMult}x`)} /> 件。
              </>
            }
            eq1={`${timeBoard}x + ${p.tBanner}y = ${p.hours}`}
            eq2={`${profitBoard}x + ${p.pBanner}y = ${p.profit}`}
            solveText={
              <>
                把宣传册用 <MathText text={texEq(`${p.brochureMult}x`)} />{' '}
                代入后，只剩两个未知数，用加减消元法求解。总件数 = 展板 + 宣传册 + 横幅。
              </>
            }
            x={s.x}
            y={s.y}
            answer={
              <>
                展板 <AnimatedNumber value={s.x} /> 件，宣传册 <AnimatedNumber value={brochures} />{' '}
                件，横幅 <AnimatedNumber value={s.y} /> 件，共 <AnimatedNumber value={total} /> 件。
              </>
            }
            check={
              <MathText
                text={`验算：时间 ${texEq(
                  `${p.tBoard}\\times ${s.x}+${p.tBrochure}\\times ${brochures}+${p.tBanner}\\times ${s.y}=${p.hours}`,
                )}；利润 ${texEq(
                  `${p.pBoard}\\times ${s.x}+${p.pBrochure}\\times ${brochures}+${p.pBanner}\\times ${s.y}=${p.profit}`,
                )} ✓`}
              />
            }
          />
        );
      }}
    />
  );
}
