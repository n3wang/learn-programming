import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import MathText from '@site/src/components/ProblemSet/MathText';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

const A_COLOR = '#1565c0';
const B_COLOR = '#ef6c00';
const BUY_COLOR = '#00897b';
const SELL_COLOR = '#6a1b9a';

function tex(expr) {
  return `$${expr}$`;
}

/**
 * Book table from classroom notes:
 * A buy 5×30; B buy 10×20 + 7×30; A sell 10×10 + 10×8; B sell 15×20
 */
function bookProblem() {
  return {
    rows: [
      { item: 'A', price: 5, qty: 30, side: 'buy' },
      { item: 'B', price: 10, qty: 20, side: 'buy' },
      { item: 'B', price: 7, qty: 30, side: 'buy' },
      { item: 'A', price: 10, qty: 10, side: 'sell' },
      { item: 'A', price: 10, qty: 8, side: 'sell' },
      { item: 'B', price: 15, qty: 20, side: 'sell' },
    ],
  };
}

function summarize(rows, item) {
  const buy = rows.filter((r) => r.item === item && r.side === 'buy');
  const sell = rows.filter((r) => r.item === item && r.side === 'sell');
  const buyQty = buy.reduce((s, r) => s + r.qty, 0);
  const buyCost = buy.reduce((s, r) => s + r.price * r.qty, 0);
  const sellQty = sell.reduce((s, r) => s + r.qty, 0);
  const sellRev = sell.reduce((s, r) => s + r.price * r.qty, 0);
  const avgCost = buyQty === 0 ? 0 : buyCost / buyQty;
  const cogs = avgCost * sellQty;
  const profit = sellRev - cogs;
  const remain = buyQty - sellQty;
  return { buyQty, buyCost, sellQty, sellRev, avgCost, cogs, profit, remain };
}

function generate() {
  // Keep average costs terminating decimals / integers and sold qty ≤ bought.
  for (let t = 0; t < 40; t++) {
    const aBuyPrice = pickOne([4, 5, 6, 8]);
    const aBuyQty = randInt(4, 8) * 5;
    const aSellPrice = aBuyPrice + pickOne([3, 4, 5, 6]);
    const aSellQty = randInt(2, Math.floor(aBuyQty / 5) - 1) * 5;
    if (aSellQty <= 0 || aSellQty >= aBuyQty) continue;

    const bBuy1Price = pickOne([8, 10, 12]);
    const bBuy1Qty = randInt(2, 5) * 5;
    const bBuy2Price = pickOne([5, 6, 7, 8]);
    const bBuy2Qty = randInt(2, 6) * 5;
    const bBuyQty = bBuy1Qty + bBuy2Qty;
    const bSellPrice = Math.max(bBuy1Price, bBuy2Price) + pickOne([3, 5, 7]);
    const bSellQty = randInt(2, Math.floor(bBuyQty / 5) - 1) * 5;
    if (bSellQty <= 0 || bSellQty >= bBuyQty) continue;

    // Prefer integer average cost for B (or one decimal).
    const bCost = bBuy1Price * bBuy1Qty + bBuy2Price * bBuy2Qty;
    if ((bCost * bSellQty) % bBuyQty !== 0) continue;

    // Split A sales into two rows like the book (optional second row).
    const aSell1 = Math.min(aSellQty, randInt(1, Math.floor(aSellQty / 5)) * 5 || aSellQty);
    const aSell2 = aSellQty - aSell1;

    const rows = [
      { item: 'A', price: aBuyPrice, qty: aBuyQty, side: 'buy' },
      { item: 'B', price: bBuy1Price, qty: bBuy1Qty, side: 'buy' },
      { item: 'B', price: bBuy2Price, qty: bBuy2Qty, side: 'buy' },
      { item: 'A', price: aSellPrice, qty: aSell1, side: 'sell' },
    ];
    if (aSell2 > 0) rows.push({ item: 'A', price: aSellPrice, qty: aSell2, side: 'sell' });
    rows.push({ item: 'B', price: bSellPrice, qty: bSellQty, side: 'sell' });
    return { rows };
  }
  return bookProblem();
}

function fmtMoney(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

export default function InventoryProfitSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const stats = useMemo(() => {
    const A = summarize(p.rows, 'A');
    const B = summarize(p.rows, 'B');
    const totalProfit = A.profit + B.profit;
    const totalCogs = A.cogs + B.cogs;
    const ratePct = totalCogs === 0 ? 0 : (totalProfit / totalCogs) * 100;
    return { A, B, totalProfit, totalCogs, ratePct };
  }, [p]);

  const solution = (
    <div className={stepStyles.solution}>
      <div className={stepStyles.legend}>
        <span>
          <span className={stepStyles.swatch} style={{ background: A_COLOR }} />
          衣服 A
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: B_COLOR }} />
          衣服 B
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: BUY_COLOR }} />
          买入
        </span>
        <span>
          <span className={stepStyles.swatch} style={{ background: SELL_COLOR }} />
          卖出
        </span>
      </div>

      <SolutionStep badge="法" badgeClass={stepStyles.badgeSet}>
        利润只算「已经卖出的」那一部分：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\text{利润} = \\text{卖出收入} - \\text{已售商品进价成本}`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `\\text{平均进价} = \\dfrac{\\text{买入总金额}}{\\text{买入总件数}},\\quad \\text{剩余} = \\text{买入件数} - \\text{卖出件数}`,
            )}
          />
        </div>
        多种进价时用<strong>加权平均进价</strong>（总金额 ÷ 总件数）。
      </SolutionStep>

      <SolutionStep badge="(a)" badgeClass={stepStyles.badgeList}>
        <span style={{ color: A_COLOR, fontWeight: 700 }}>衣服 A</span>：买入{' '}
        <AnimatedNumber value={stats.A.buyQty} /> 件，金额{' '}
        <AnimatedNumber value={stats.A.buyCost} /> 元；卖出{' '}
        <AnimatedNumber value={stats.A.sellQty} /> 件，收入{' '}
        <AnimatedNumber value={stats.A.sellRev} /> 元。
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\text{已售成本} = ${fmtMoney(stats.A.avgCost)}\\times ${stats.A.sellQty} = ${fmtMoney(stats.A.cogs)}`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `\\text{利润}_A = ${stats.A.sellRev} - ${fmtMoney(stats.A.cogs)} = \\textcolor{${A_COLOR}}{${fmtMoney(stats.A.profit)}}\\text{（元）}`,
            )}
          />
        </div>
      </SolutionStep>

      <SolutionStep badge="(b)" badgeClass={stepStyles.badgeSolve}>
        <span style={{ color: B_COLOR, fontWeight: 700 }}>衣服 B</span>：买入{' '}
        <AnimatedNumber value={stats.B.buyQty} /> 件，金额{' '}
        <AnimatedNumber value={stats.B.buyCost} /> 元，平均进价{' '}
        <MathText text={tex(fmtMoney(stats.B.avgCost))} /> 元；卖出{' '}
        <AnimatedNumber value={stats.B.sellQty} /> 件，收入{' '}
        <AnimatedNumber value={stats.B.sellRev} /> 元。
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\text{已售成本} = ${fmtMoney(stats.B.avgCost)}\\times ${stats.B.sellQty} = ${fmtMoney(stats.B.cogs)}`,
            )}
          />
          <br />
          <MathText
            text={tex(
              `\\text{利润}_B = ${stats.B.sellRev} - ${fmtMoney(stats.B.cogs)} = \\textcolor{${B_COLOR}}{${fmtMoney(stats.B.profit)}}\\text{（元）}`,
            )}
          />
        </div>
      </SolutionStep>

      <SolutionStep badge="(c)" badgeClass={stepStyles.badgeAnswer}>
        总利润{' '}
        <MathText
          text={tex(
            `${fmtMoney(stats.A.profit)} + ${fmtMoney(stats.B.profit)} = \\mathbf{${fmtMoney(stats.totalProfit)}}`,
          )}
        />{' '}
        元 → {stats.totalProfit >= 0 ? '总体盈利' : '总体亏损'}。
      </SolutionStep>

      <SolutionStep badge="(d)" badgeClass={stepStyles.badgeList}>
        总利润率相对<strong>已售商品总成本</strong>：
        <div className={stepStyles.eqBox}>
          <MathText
            text={tex(
              `\\text{总利润率} = \\dfrac{${fmtMoney(stats.totalProfit)}}{${fmtMoney(stats.totalCogs)}} \\times 100\\% \\approx \\mathbf{${stats.ratePct.toFixed(1)}\\%}`,
            )}
          />
        </div>
      </SolutionStep>

      <SolutionStep badge="(e)" badgeClass={stepStyles.badgeCheck}>
        剩余库存：A 还剩 <AnimatedNumber value={stats.A.remain} /> 件，B 还剩{' '}
        <AnimatedNumber value={stats.B.remain} /> 件（这些还没卖掉，不算进上面的利润里）。
      </SolutionStep>

      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <div className={stepStyles.answer}>
          (a) A 利润 <AnimatedNumber value={stats.A.profit} decimals={Number.isInteger(stats.A.profit) ? 0 : 2} />{' '}
          元； (b) B 利润{' '}
          <AnimatedNumber value={stats.B.profit} decimals={Number.isInteger(stats.B.profit) ? 0 : 2} /> 元；
          <br />
          (c) 共{stats.totalProfit >= 0 ? '盈利' : '亏损'}{' '}
          <AnimatedNumber
            value={Math.abs(stats.totalProfit)}
            decimals={Number.isInteger(stats.totalProfit) ? 0 : 2}
          />{' '}
          元； (d) 总利润率约 <AnimatedNumber value={Number(stats.ratePct.toFixed(1))} decimals={1} />%；
          <br />
          (e) 剩余 A <AnimatedNumber value={stats.A.remain} /> 件、B{' '}
          <AnimatedNumber value={stats.B.remain} /> 件。
        </div>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="进销存表：算清 A / B 的利润"
      subtitle="先分商品汇总买入与卖出，用平均进价算已售成本，再求利润与剩余"
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
        某服装店一段时间的进货与销售记录如下。根据表格回答问题。
      </Typography>
      <Box sx={{ overflowX: 'auto', mb: 1.5 }}>
        <Table size="small" sx={{ minWidth: 360 }}>
          <TableHead>
            <TableRow>
              <TableCell>商品</TableCell>
              <TableCell align="right">单价 / 元</TableCell>
              <TableCell align="right">数量</TableCell>
              <TableCell>交易</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {p.rows.map((r, i) => (
              <TableRow key={`${r.item}-${r.side}-${i}`}>
                <TableCell>
                  <span style={{ color: r.item === 'A' ? A_COLOR : B_COLOR, fontWeight: 700 }}>
                    衣服 {r.item}
                  </span>
                </TableCell>
                <TableCell align="right">{r.price}</TableCell>
                <TableCell align="right">{r.qty}</TableCell>
                <TableCell>
                  <span style={{ color: r.side === 'buy' ? BUY_COLOR : SELL_COLOR, fontWeight: 600 }}>
                    {r.side === 'buy' ? '买' : '卖'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Typography>
        (a) 全部衣服 A 的利润是多少？
        <br />
        (b) 全部衣服 B 的利润是多少？
        <br />
        (c) A、B 总共是盈利还是亏损？总额多少？
        <br />
        (d) 求总利润率（相对已售商品总成本）。
        <br />
        (e) 剩下多少件 A / B 还没卖出？
      </Typography>
    </ProblemShell>
  );
}
