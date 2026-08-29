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
import { randInt, pickOne } from '@site/src/components/interactive/shell/mathRandom';

/**
 * Interest-group time table: same per-session duration across grades.
 * Known: grade 7 & 8 totals + session counts → solve artHours, techHours.
 * Unknown: grade 9 session counts (stars) given total hours.
 */

const HOURS = [1, 1.5, 2, 2.5, 3];

function bookProblem() {
  const artH = 2;
  const techH = 1.5;
  const rows = [
    { grade: '七年级', total: 12.5, art: 4, tech: 3 },
    { grade: '八年级', total: 10.5, art: 3, tech: 3 },
    { grade: '九年级', total: 7, art: null, tech: null },
  ];
  const g9Art = 2;
  const g9Tech = 2;
  return { artH, techH, rows, g9Art, g9Tech };
}

function generate() {
  let artH;
  let techH;
  do {
    artH = pickOne(HOURS);
    techH = pickOne(HOURS);
  } while (artH === techH);

  const g7Art = randInt(3, 5);
  const g7Tech = randInt(2, 4);
  const g8Art = randInt(2, 4);
  const g8Tech = randInt(2, 4);
  // Ensure the 2×2 system is independent (det ≠ 0)
  if (g7Art * g8Tech === g8Art * g7Tech) {
    return generate();
  }

  const total7 = g7Art * artH + g7Tech * techH;
  const total8 = g8Art * artH + g8Tech * techH;
  const g9Art = randInt(1, 4);
  const g9Tech = randInt(1, 4);
  const total9 = g9Art * artH + g9Tech * techH;

  // Prefer "nice" half-hour totals
  if (!Number.isInteger(total7 * 2) || !Number.isInteger(total8 * 2) || !Number.isInteger(total9 * 2)) {
    return generate();
  }

  const rows = [
    { grade: '七年级', total: total7, art: g7Art, tech: g7Tech },
    { grade: '八年级', total: total8, art: g8Art, tech: g8Tech },
    { grade: '九年级', total: total9, art: null, tech: null },
  ];
  return { artH, techH, rows, g9Art, g9Tech };
}

function fmtH(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function InterestGroupTimeSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);

  const derived = useMemo(() => {
    const [r7, r8] = p.rows;
    // Solve from grade 7 & 8 (should match p.artH / p.techH)
    // a7·x + t7·y = T7
    // a8·x + t8·y = T8
    const det = r7.art * r8.tech - r8.art * r7.tech;
    const x = (r7.total * r8.tech - r8.total * r7.tech) / det;
    const y = (r7.art * r8.total - r8.art * r7.total) / det;
    return { artH: x, techH: y };
  }, [p]);

  const randomize = () => {
    setP(generate());
    setKey((k) => k + 1);
  };

  const loadBook = () => {
    setP(bookProblem());
    setKey((k) => k + 1);
  };

  const solution = (
    <Box>
      <Typography sx={{ mb: 1 }}>
        设文艺小组每次活动 <b>x</b> 小时，科技小组每次 <b>y</b> 小时。同一兴趣小组各年级每次时长相同。
      </Typography>
      <Typography sx={{ mb: 1 }}>由七、八年级列方程组：</Typography>
      <Typography sx={{ mb: 0.5, fontFamily: 'monospace' }}>
        {p.rows[0].art}x + {p.rows[0].tech}y = {fmtH(p.rows[0].total)}
      </Typography>
      <Typography sx={{ mb: 1.5, fontFamily: 'monospace' }}>
        {p.rows[1].art}x + {p.rows[1].tech}y = {fmtH(p.rows[1].total)}
      </Typography>
      <Typography sx={{ mb: 1.5 }}>
        解得 x = <AnimatedNumber value={derived.artH} decimals={1} />（文艺），y ={' '}
        <AnimatedNumber value={derived.techH} decimals={1} />（科技）。
      </Typography>

      <Table size="small" sx={{ mb: 2, maxWidth: 480 }}>
        <TableHead>
          <TableRow>
            <TableCell>年级</TableCell>
            <TableCell align="right">文艺（次×时）</TableCell>
            <TableCell align="right">科技（次×时）</TableCell>
            <TableCell align="right">合计 / h</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {p.rows.slice(0, 2).map((r) => (
            <TableRow key={r.grade}>
              <TableCell>{r.grade}</TableCell>
              <TableCell align="right">
                {r.art} × {fmtH(derived.artH)} = {fmtH(r.art * derived.artH)}
              </TableCell>
              <TableCell align="right">
                {r.tech} × {fmtH(derived.techH)} = {fmtH(r.tech * derived.techH)}
              </TableCell>
              <TableCell align="right">{fmtH(r.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography sx={{ mb: 1 }}>
        九年级总时间 {fmtH(p.rows[2].total)} h，设文艺 <b>m</b> 次、科技 <b>n</b> 次（非负整数）：
      </Typography>
      <Typography sx={{ mb: 1, fontFamily: 'monospace' }}>
        {fmtH(derived.artH)}m + {fmtH(derived.techH)}n = {fmtH(p.rows[2].total)}
      </Typography>
      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
        检验非负整数解得：m = <AnimatedNumber value={p.g9Art} />，n ={' '}
        <AnimatedNumber value={p.g9Tech} />。
      </Typography>

      <Table size="small" sx={{ maxWidth: 420 }}>
        <TableHead>
          <TableRow>
            <TableCell>九年级</TableCell>
            <TableCell align="right">次数</TableCell>
            <TableCell align="right">每次 / h</TableCell>
            <TableCell align="right">小计 / h</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>文艺</TableCell>
            <TableCell align="right">{p.g9Art}</TableCell>
            <TableCell align="right">{fmtH(derived.artH)}</TableCell>
            <TableCell align="right">{fmtH(p.g9Art * derived.artH)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>科技</TableCell>
            <TableCell align="right">{p.g9Tech}</TableCell>
            <TableCell align="right">{fmtH(derived.techH)}</TableCell>
            <TableCell align="right">{fmtH(p.g9Tech * derived.techH)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>合计</TableCell>
            <TableCell />
            <TableCell />
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {fmtH(p.rows[2].total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <ProblemShell
      title="兴趣小组活动时间表"
      subtitle="七、八年级数据可求每次时长；九年级次数用 ★ 表示，需列方程求出"
      problemKey={key}
      onRandomize={randomize}
      onBook={loadBook}
      solution={solution}
    >
      <Box>
        <Typography sx={{ mb: 1.5 }}>
          下表是某校七年级至九年级某月课外兴趣小组的活动时间统计表，其中各年级同一兴趣小组每次活动时间相同。
          求九年级文艺小组与科技小组的活动次数（表中 ★）。
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>年级</TableCell>
              <TableCell align="right">课外小组活动总时间 / h</TableCell>
              <TableCell align="right">文艺小组活动次数</TableCell>
              <TableCell align="right">科技小组活动次数</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {p.rows.map((r) => (
              <TableRow key={r.grade}>
                <TableCell>{r.grade}</TableCell>
                <TableCell align="right">{fmtH(r.total)}</TableCell>
                <TableCell align="right">{r.art == null ? '★' : r.art}</TableCell>
                <TableCell align="right">{r.tech == null ? '★' : r.tech}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </ProblemShell>
  );
}
