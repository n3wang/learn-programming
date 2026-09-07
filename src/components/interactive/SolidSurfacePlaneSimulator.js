import React, { useMemo, useState } from 'react';
import Typography from '@site/src/components/ui/Typography';
import Table from '@site/src/components/ui/Table';
import TableBody from '@site/src/components/ui/TableBody';
import TableCell from '@site/src/components/ui/TableCell';
import TableHead from '@site/src/components/ui/TableHead';
import TableRow from '@site/src/components/ui/TableRow';
import Box from '@site/src/components/ui/Box';
import ProblemShell from '@site/src/components/interactive/shell/ProblemShell';
import SolidFigureView from '@site/src/components/interactive/solidView/SolidFigureView';
import { SolutionStep, stepStyles } from '@site/src/components/interactive/shell/SolutionStep';
import { pickOne, randInt } from '@site/src/components/interactive/shell/mathRandom';

/** 书题 2：圆柱、圆锥、正方体、四棱锥、三棱柱。 */
const CATALOG = {
  cylinder: {
    name: '圆柱',
    planes: '上下底面是圆；侧面展开是长方形',
    place: '两个圆在上下两端，长方形侧面围在中间',
  },
  cone: {
    name: '圆锥',
    planes: '底面是圆；侧面展开是扇形',
    place: '圆在底部，侧面从顶点连到底面圆周',
  },
  cube: {
    name: '正方体',
    planes: '六个面都是正方形',
    place: '相对的面互相平行，相邻的面相交',
  },
  cuboid: {
    name: '长方体',
    planes: '六个面都是长方形',
    place: '相对的面互相平行，相邻的面相交',
  },
  pyramid: {
    name: '四棱锥',
    planes: '底面是四边形，四个侧面是三角形',
    place: '底面在下，侧面交于一个顶点',
  },
  prism: {
    name: '三棱柱',
    planes: '两个底面是三角形，三个侧面是长方形',
    place: '两个三角形在两端，长方形侧面连结它们',
  },
  sphere: {
    name: '球',
    planes: '没有平的面；整个表面是曲面',
    place: '球面上任意一点都不在同一个平面里围成多边形',
  },
};

const BOOK_IDS = ['cylinder', 'cone', 'cube', 'pyramid', 'prism'];

function bookProblem() {
  return { ids: BOOK_IDS };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generate() {
  const pool = Object.keys(CATALOG);
  const count = pickOne([4, 5]);
  return { ids: shuffle(pool).slice(0, count) };
}

function rowsOf(p) {
  return p.ids.map((id) => CATALOG[id]);
}

export default function SolidSurfacePlaneSimulator() {
  const [key, setKey] = useState(0);
  const [p, setP] = useState(bookProblem);
  const [focus, setFocus] = useState(0);
  const rows = useMemo(() => rowsOf(p), [p]);
  const current = rows[focus] ? p.ids[focus] : p.ids[0];

  const solution = (
    <div className={stepStyles.solution}>
      <SolutionStep badge="看" badgeClass={stepStyles.badgeSet}>
        立体图形的表面里，平的那一部分就是平面图形。先认底面，再认侧面。
      </SolutionStep>
      <SolutionStep badge="答" badgeClass={stepStyles.badgeAnswer}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 420 }}>
            <TableHead>
              <TableRow>
                <TableCell>立体图形</TableCell>
                <TableCell>表面中的平面图形</TableCell>
                <TableCell>位置</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.planes}</TableCell>
                  <TableCell>{r.place}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </SolutionStep>
    </div>
  );

  return (
    <ProblemShell
      title="练习 2：立体图形表面中的平面图形"
      subtitle="底面和侧面分别是什么平面图形，各在什么位置"
      problemKey={key}
      onRandomize={() => {
        setP(generate());
        setFocus(0);
        setKey((k) => k + 1);
      }}
      onBook={() => {
        setP(bookProblem());
        setFocus(0);
        setKey((k) => k + 1);
      }}
      solution={solution}
    >
      <Typography sx={{ mb: 1 }}>
        点名称看立体图，再判断它的表面里有哪些平面图形、分别在什么位置。
      </Typography>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {rows.map((r, i) => (
          <button
            key={r.name}
            type="button"
            onClick={() => setFocus(i)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: 5,
              padding: '2px 10px',
              background: focus === i ? 'rgba(21,101,192,0.12)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {r.name}
          </button>
        ))}
      </div>
      <SolidFigureView solidId={current} highlight="faces" height={220} caption="拖动转动" />
    </ProblemShell>
  );
}
