import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import AnimatedNumber from '@site/src/components/interactive/shell/AnimatedNumber';
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

const PERCENTS = [10, 15, 20, 25, 30, 40, 50];

/** Random sell price (same for both items) and a random ±p% profit/loss rate. */
function generate() {
  const S = randInt(4, 16) * 10; // sell price, multiple of 10
  const pct = pickOne(PERCENTS); // percent, same magnitude, opposite sign
  return { S, pct };
}

export default function ProfitLossSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(generate);

  const { cost1, cost2, totalCost, totalSell, diff } = useMemo(() => {
    const rate = p.pct / 100;
    const c1 = p.S / (1 + rate); // profited item's cost
    const c2 = p.S / (1 - rate); // lost item's cost
    const tCost = c1 + c2;
    const tSell = 2 * p.S;
    return { cost1: c1, cost2: c2, totalCost: tCost, totalSell: tSell, diff: tSell - tCost };
  }, [p]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const solution = (
    <Box>
      <Typography sx={{ mb: 1 }}>
        设盈利 {p.pct}% 的那件衣服进价为 <b>x</b> 元，则 x + {p.pct}%x = {p.S}，解得 x ={' '}
        <AnimatedNumber value={cost1} decimals={2} /> 元。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        设亏损 {p.pct}% 的那件衣服进价为 <b>y</b> 元，则 y − {p.pct}%y = {p.S}，解得 y ={' '}
        <AnimatedNumber value={cost2} decimals={2} /> 元。
      </Typography>
      <Typography sx={{ mb: 1 }}>
        两件衣服总进价 = <AnimatedNumber value={cost1} decimals={2} /> +{' '}
        <AnimatedNumber value={cost2} decimals={2} /> = <AnimatedNumber value={totalCost} decimals={2} /> 元；
        总售价 = <AnimatedNumber value={totalSell} decimals={2} /> 元。
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>
        总售价 − 总进价 = <AnimatedNumber value={diff} decimals={2} /> 元，所以卖这两件衣服共
        {diff < 0 ? '亏损' : diff > 0 ? '盈利' : '不盈不亏'}{' '}
        <AnimatedNumber value={Math.abs(diff)} decimals={2} /> 元。
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        可以证明：只要盈利率和亏损率大小相等（都是同一个百分数），总售价 − 总进价 = −2S·p²/(1−p²)
        恒小于 0 ——不管 S 和 p 取什么值，"一件加价 p%、一件降价 p%" 卖出，总是亏损，不会不盈不亏。
      </Typography>
    </Box>
  );

  return (
    <ProblemShell
      title="销售中的盈亏"
      subtitle="两件衣服都按同一价格卖出，一件盈利、一件亏损，同样的百分比——总的是赚还是亏？"
      problemKey={key}
      onRandomize={randomize}
      solution={solution}
    >
      {(showAnswer) => (
        <Box>
          <Typography sx={{ mb: 1.5 }}>
            一商店以每件 <b>{p.S}</b> 元的价格卖出两件衣服，其中一件盈利 <b>{p.pct}%</b>，另一件
            亏损 <b>{p.pct}%</b>，卖这两件衣服总的是盈利还是亏损，或是不盈不亏？
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Box
              sx={{
                flex: 1,
                minWidth: 160,
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                👕 盈利 {p.pct}% 的那件
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 20 }}>售价 {p.S} 元</Typography>
              <Box
                sx={{
                  mt: 0.5,
                  minHeight: 26,
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  opacity: showAnswer ? 1 : 0,
                  transform: showAnswer ? 'translateY(0)' : 'translateY(-6px)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  成本 <AnimatedNumber value={showAnswer ? cost1 : 0} decimals={2} /> 元
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                flex: 1,
                minWidth: 160,
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                👗 亏损 {p.pct}% 的那件
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 20 }}>售价 {p.S} 元</Typography>
              <Box
                sx={{
                  mt: 0.5,
                  minHeight: 26,
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  opacity: showAnswer ? 1 : 0,
                  transform: showAnswer ? 'translateY(0)' : 'translateY(-6px)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  成本 <AnimatedNumber value={showAnswer ? cost2 : 0} decimals={2} /> 元
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      )}
    </ProblemShell>
  );
}
