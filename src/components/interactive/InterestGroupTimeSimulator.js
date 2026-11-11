import React, { useMemo, useState } from 'react';
import Box from '@site/src/components/ui/Box';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import { Solution, Step, EqBox, M, Answer, c, texDms, plainToTex, InequalityRules, ItemSteps, systemRule, BLUE, GREEN, RED, ORANGE } from '@site/src/components/interactive/shell/SolutionKit';
import { usePracticeMode, usePracticeAnswer } from '@site/src/components/interactive/shell/PracticeModeContext';
import { numberField } from '@site/src/components/interactive/shell/practiceFields';
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
  // 九年级 has one equation in two unknowns: keep only totals with exactly one
  // positive-integer pair (m, n), so the answer is well defined.
  if (positivePairs(artH, techH, total9).length !== 1) {
    return generate();
  }

  const rows = [
    { grade: '七年级', total: total7, art: g7Art, tech: g7Tech },
    { grade: '八年级', total: total8, art: g8Art, tech: g8Tech },
    { grade: '九年级', total: total9, art: null, tech: null },
  ];
  return { artH, techH, rows, g9Art, g9Tech };
}

/** All (m, n) with m, n ≥ 1 integers and a·m + b·n = total. */
function positivePairs(a, b, total) {
  const out = [];
  for (let m = 1; m * a < total + 1e-9; m++) {
    const n = (total - m * a) / b;
    if (n >= 1 - 1e-9 && Math.abs(n - Math.round(n)) < 1e-9) out.push([m, Math.round(n)]);
  }
  return out;
}

function fmtH(n) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function InterestGroupTimeSimulator() {
  const [key, setKey] = useState(0);
  const practice = usePracticeMode();
  const [p, setP] = useState(() => (practice ? generate() : bookProblem()));
  usePracticeAnswer([numberField("m", "九年级文艺小组次数", p.g9Art, "m"), numberField("n", "九年级科技小组次数", p.g9Tech, "n")]);

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

  const [r7, r8, r9] = p.rows;
  const total9 = r9.total;
  const solution = (
    <Solution legend={[[BLUE, '表中数据'], [ORANGE, '每次活动时间'], [GREEN, '九年级次数']]}>
      <Step b="知" kind="set">
        同一个小组，各年级<b>每次</b>活动的时间相同。每个年级：
        <EqBox lines={['\\text{文艺次数} \\times \\text{文艺每次时间} + \\text{科技次数} \\times \\text{科技每次时间} = \\text{总时间}']} />
      </Step>
      <Step b="设" kind="set">
        设文艺小组每次活动 <M t="x" /> h，科技小组每次 <M t="y" /> h。
      </Step>
      <Step b="列" kind="list">
        由七、八年级两行列方程组：
        <EqBox
          lines={[
            `\\begin{cases} ${c(BLUE, r7.art)}x + ${c(BLUE, r7.tech)}y = ${c(BLUE, fmtH(r7.total))} \\\\ ${c(BLUE, r8.art)}x + ${c(BLUE, r8.tech)}y = ${c(BLUE, fmtH(r8.total))} \\end{cases}`,
          ]}
        />
      </Step>
      <Step b="解" kind="solve">
        用加减消元法解得：
        <EqBox lines={[`x = ${c(ORANGE, fmtH(derived.artH))}, \\qquad y = ${c(ORANGE, fmtH(derived.techH))}`]} />
        验算：七年级 <M t={`${r7.art}\\times ${fmtH(derived.artH)} + ${r7.tech}\\times ${fmtH(derived.techH)} = ${fmtH(r7.total)}`} /> ✓
      </Step>
      <Step b="九" kind="solve">
        九年级总时间 {fmtH(total9)} h，设文艺 <M t="m" /> 次、科技 <M t="n" /> 次（都是正整数）：
        <EqBox lines={[`${c(ORANGE, fmtH(derived.artH))}m + ${c(ORANGE, fmtH(derived.techH))}n = ${fmtH(total9)}`]} />
        一个方程两个未知数，但次数只能是正整数。让 m 从 1 开始试，看 n 是不是正整数：只有{' '}
        <M t={`m = ${c(GREEN, p.g9Art)},\\ n = ${c(GREEN, p.g9Tech)}`} /> 符合（
        <M t={`${fmtH(derived.artH)}\\times ${p.g9Art} + ${fmtH(derived.techH)}\\times ${p.g9Tech} = ${fmtH(total9)}`} />）。
      </Step>
      <Step b="答" kind="answer">
        <Answer>
          九年级文艺小组活动 {p.g9Art} 次，科技小组活动 {p.g9Tech} 次。
        </Answer>
      </Step>
    </Solution>
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
